// usePaymentStatus.ts - CORREÇÃO FINAL PARA PROBLEMA DO ID
import { useState, useEffect, useCallback, useRef } from "react";

interface PaymentStatus {
  status: "pending" | "approved" | "rejected" | "expired" | "error";
  statusDetail?: string;
  paymentId: string;
  products: Array<{
    id: string;
    name: string;
    downloadUrl?: string;
    fileSize?: string;
    format?: string;
    quantity?: number;
    price?: number;
  }>;
  customerEmail: string;
  total: number;
  createdAt: string;
  updatedAt?: string;
  hasLinks?: boolean;
  linksCount?: number;
}

interface DownloadResponse {
  links: string[];
  products: PaymentStatus["products"];
  customerName?: string;
  total?: number;
  downloadedAt: string;
  expiresIn?: string;
}

export const usePaymentStatus = (paymentId: string | null) => {
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // ✅ Funções utilitárias para strings seguras
  const safeString = (value: any): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const safeNumber = (value: any): number => {
    if (typeof value === "number" && !isNaN(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(
        value.replace(/[^\d.,-]/g, "").replace(",", ".")
      );
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ✅ CORRIGIDO: Função para buscar links de download
  const fetchDownloadLinks = useCallback(
    async (id: string): Promise<string[]> => {
      if (!id) {
        console.log("❌ ID do pagamento não fornecido para download");
        return [];
      }

      console.log("🔗 Buscando links para paymentId:", id);

      try {
        const response = await fetch(
          `https://servidor-loja-digital.onrender.com/link-download/${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("📡 Download response status:", response.status);

        if (!response.ok) {
          if (response.status === 403) {
            console.log("🔒 Pagamento ainda não aprovado para download");
            return [];
          }
          if (response.status === 404) {
            console.log("❌ Links de download não encontrados");
            return [];
          }
          if (response.status === 410) {
            console.log("⏰ Links de download expiraram");
            throw new Error("Links de download expiraram");
          }

          const errorText = await response.text();
          console.log("❌ Erro na resposta de download:", errorText);
          return []; // Não joga erro, só retorna array vazio
        }

        const data: DownloadResponse = await response.json();
        console.log("📦 Dados de download recebidos:", data);

        if (data?.links && Array.isArray(data.links) && data.links.length > 0) {
          console.log(`✅ ${data.links.length} links encontrados:`, data.links);
          return data.links;
        } else {
          console.warn("⚠️ Nenhum link de download válido encontrado:", data);
          return [];
        }
      } catch (err: any) {
        console.error("💥 Erro ao buscar links de download:", err);
        return []; // Retorna array vazio em caso de erro
      }
    },
    []
  );

  // ✅ CORRIGIDO: Função para verificar status do pagamento
  const checkPaymentStatus = useCallback(
    async (
      id: string,
      isRetry: boolean = false
    ): Promise<PaymentStatus | null> => {
      if (!id) {
        console.log("❌ ID do pagamento não fornecido");
        return null;
      }

      console.log(
        `🔄 Verificando status para paymentId: ${id} (retry: ${isRetry})`
      );

      try {
        const response = await fetch(
          `https://servidor-loja-digital.onrender.com/status-pagamento/${encodeURIComponent(
            id
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
            },
          }
        );

        console.log("📡 Status response:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
            console.log("❌ Pagamento não encontrado no servidor");

            // ✅ Se for primeira tentativa, tenta novamente após delay
            if (!isRetry && retryCountRef.current < 3) {
              retryCountRef.current++;
              console.log(
                `🔄 Tentativa ${retryCountRef.current}/3 após 2 segundos...`
              );

              await new Promise((resolve) => setTimeout(resolve, 2000));

              if (isMountedRef.current) {
                return await checkPaymentStatus(id, true);
              }
            }

            throw new Error("Pagamento não encontrado");
          }

          const errorText = await response.text();
          console.log("❌ Erro HTTP:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log("📦 Dados do status recebidos:", data);

        // ✅ Validação mais robusta dos dados
        if (!data || typeof data !== "object") {
          throw new Error("Dados inválidos recebidos do servidor");
        }

        // ✅ Normaliza os dados para o formato esperado
        const normalizedData: PaymentStatus = {
          status: (safeString(data.status) as any) || "pending",
          statusDetail: safeString(data.statusDetail),
          paymentId: safeString(data.paymentId || id),
          products: Array.isArray(data.products)
            ? data.products.map((p) => ({
                id: safeString(p.id),
                name: safeString(p.name),
                downloadUrl: safeString(p.downloadUrl),
                fileSize: safeString(p.fileSize),
                format: safeString(p.format),
                quantity: safeNumber(p.quantity) || 1,
                price: safeNumber(p.price),
              }))
            : [],
          customerEmail: safeString(data.customerEmail) || "N/A",
          total: safeNumber(data.total),
          createdAt: safeString(data.createdAt) || new Date().toISOString(),
          updatedAt: safeString(data.updatedAt),
          hasLinks: Boolean(data.hasLinks),
          linksCount: safeNumber(data.linksCount),
        };

        console.log("✅ Dados normalizados:", normalizedData);

        // Reset retry counter on success
        retryCountRef.current = 0;

        return normalizedData;
      } catch (err: any) {
        console.error("💥 Erro ao verificar status:", err);
        throw err;
      }
    },
    []
  );

  // ✅ CORRIGIDO: Função principal que combina status + links
  const fetchPaymentData = useCallback(
    async (showLoading: boolean = true) => {
      if (!paymentId || !isMountedRef.current) return;

      if (showLoading) {
        setLoading(true);
      }

      try {
        console.log("🚀 Buscando dados do pagamento:", paymentId);

        // 1. Busca o status do pagamento
        const statusData = await checkPaymentStatus(paymentId);

        if (!statusData || !isMountedRef.current) {
          if (isMountedRef.current) {
            setError("Pagamento não encontrado no servidor");
            setPaymentData(null);
            setDownloadLinks([]);
          }
          return;
        }

        // 2. Atualiza o estado com os dados do status
        if (isMountedRef.current) {
          setPaymentData(statusData);
          setError(null);
        }

        // 3. Se aprovado, tenta buscar os links de download
        if (statusData.status === "approved") {
          console.log("✅ Pagamento aprovado! Tentando buscar links...");

          const links = await fetchDownloadLinks(paymentId);

          if (isMountedRef.current) {
            setDownloadLinks(links);
            console.log(`🔗 ${links.length} links definidos no estado`);
          }
        } else {
          // Se não aprovado, limpa os links
          if (isMountedRef.current) {
            setDownloadLinks([]);
          }
          console.log(`⏳ Status: ${statusData.status} - aguardando aprovação`);
        }
      } catch (err: any) {
        console.error("💥 Erro ao buscar dados do pagamento:", err);

        if (isMountedRef.current) {
          const errorMessage =
            safeString(err.message) || "Erro ao buscar dados do pagamento";
          setError(errorMessage);

          // ✅ Não limpa paymentData se já existe (evita piscar da interface)
          if (!paymentData) {
            setPaymentData(null);
          }
          setDownloadLinks([]);
        }
      } finally {
        if (isMountedRef.current && showLoading) {
          setLoading(false);
        }
      }
    },
    [paymentId, checkPaymentStatus, fetchDownloadLinks, paymentData]
  );

  // ✅ CORRIGIDO: Effect principal com retry inteligente
  useEffect(() => {
    if (!paymentId) {
      setError("ID do pagamento não encontrado");
      setLoading(false);
      return;
    }

    console.log("🚀 Iniciando monitoramento para:", paymentId);
    setLoading(true);
    setError(null);
    retryCountRef.current = 0;

    // Primeira busca imediata
    fetchPaymentData(true);

    // ✅ Polling inteligente
    const startPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(async () => {
        if (!isMountedRef.current) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        console.log("⏰ Polling automático...");

        try {
          const statusData = await checkPaymentStatus(paymentId);

          if (!statusData || !isMountedRef.current) return;

          // Atualiza dados
          setPaymentData(statusData);
          setError(null);

          // ✅ Para o polling se chegou a um status final
          if (
            statusData.status === "approved" ||
            statusData.status === "rejected" ||
            statusData.status === "expired"
          ) {
            console.log(`🛑 Status final alcançado: ${statusData.status}`);

            // Se aprovado, busca os links uma última vez
            if (statusData.status === "approved") {
              const links = await fetchDownloadLinks(paymentId);
              if (isMountedRef.current) {
                setDownloadLinks(links);
              }
            }

            // Para o polling
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } catch (err: any) {
          console.error("💥 Erro no polling:", err);

          // ✅ Não sobrescreve erro se já tem dados válidos
          if (isMountedRef.current && !paymentData) {
            setError(safeString(err.message));
          }
        }
      }, 5000); // 5 segundos
    };

    // Inicia o polling após 3 segundos (dá tempo para primeira busca)
    const timeoutId = setTimeout(startPolling, 3000);

    // Cleanup
    return () => {
      console.log("🧹 Limpando resources para:", paymentId);
      clearTimeout(timeoutId);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paymentId, fetchPaymentData, checkPaymentStatus, fetchDownloadLinks]);

  // ✅ Função para forçar nova consulta
  const refetch = useCallback(async () => {
    if (!paymentId) return;

    console.log("🔄 Refetch solicitado para:", paymentId);
    setError(null);
    retryCountRef.current = 0;

    await fetchPaymentData(true);
  }, [paymentId, fetchPaymentData]);

  return {
    paymentData,
    downloadLinks,
    loading,
    error,
    refetch,
    // Estados adicionais úteis
    isApproved: paymentData?.status === "approved",
    isPending: paymentData?.status === "pending",
    isRejected: paymentData?.status === "rejected",
    hasDownloadLinks: downloadLinks.length > 0,
  };
};

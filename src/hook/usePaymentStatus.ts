// usePaymentStatus.ts - VERSÃO CORRIGIDA
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

  // ✅ useRef para controlar se o componente ainda está montado
  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Cleanup quando o componente é desmontado
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
          `https://servidor-loja-digital.onrender.com/link-download/${id}`,
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
          throw new Error(`Erro ${response.status}: ${errorText}`);
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
        throw err;
      }
    },
    []
  );

  // ✅ CORRIGIDO: Função para verificar status do pagamento
  const checkPaymentStatus = useCallback(
    async (id: string): Promise<PaymentStatus | null> => {
      if (!id) {
        console.log("❌ ID do pagamento não fornecido");
        return null;
      }

      console.log("🔄 Verificando status para paymentId:", id);

      try {
        const response = await fetch(
          `https://servidor-loja-digital.onrender.com/status-pagamento/${id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        console.log("📡 Status response:", response.status);

        if (!response.ok) {
          if (response.status === 404) {
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
          status: data.status || "pending",
          statusDetail: data.statusDetail,
          paymentId: data.paymentId || id,
          products: Array.isArray(data.products) ? data.products : [],
          customerEmail: data.customerEmail || "N/A",
          total: typeof data.total === "number" ? data.total : 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          hasLinks: data.hasLinks || false,
          linksCount: data.linksCount || 0,
        };

        console.log("✅ Dados normalizados:", normalizedData);
        return normalizedData;
      } catch (err: any) {
        console.error("💥 Erro ao verificar status:", err);
        throw err;
      }
    },
    []
  );

  // ✅ CORRIGIDO: Função principal que combina status + links
  const fetchPaymentData = useCallback(async () => {
    if (!paymentId || !isMountedRef.current) return;

    try {
      console.log("🚀 Buscando dados do pagamento:", paymentId);

      // 1. Busca o status do pagamento
      const statusData = await checkPaymentStatus(paymentId);

      if (!statusData || !isMountedRef.current) return;

      // 2. Atualiza o estado com os dados do status
      setPaymentData(statusData);
      setError(null);

      // 3. Se aprovado, tenta buscar os links de download
      if (statusData.status === "approved") {
        console.log("✅ Pagamento aprovado! Tentando buscar links...");

        try {
          const links = await fetchDownloadLinks(paymentId);

          if (isMountedRef.current) {
            setDownloadLinks(links);
            console.log(`🔗 ${links.length} links definidos no estado`);
          }
        } catch (downloadError: any) {
          console.warn(
            "⚠️ Erro ao buscar links (não crítico):",
            downloadError.message
          );
          // Não é um erro crítico, o pagamento pode estar aprovado mas os links ainda não disponíveis
          if (isMountedRef.current) {
            setDownloadLinks([]);
          }
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
        setError(err.message || "Erro ao buscar dados do pagamento");
        setPaymentData(null);
        setDownloadLinks([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [paymentId, checkPaymentStatus, fetchDownloadLinks]);

  // ✅ CORRIGIDO: Effect principal com polling inteligente
  useEffect(() => {
    if (!paymentId) {
      setError("ID do pagamento não encontrado");
      setLoading(false);
      return;
    }

    console.log("🚀 Iniciando monitoramento para:", paymentId);
    setLoading(true);
    setError(null);

    // Primeira busca imediata
    fetchPaymentData();

    // ✅ Polling apenas se necessário
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

          setPaymentData(statusData);

          // ✅ Para o polling se chegou a um status final
          if (
            statusData.status === "approved" ||
            statusData.status === "rejected" ||
            statusData.status === "expired"
          ) {
            console.log(`🛑 Status final alcançado: ${statusData.status}`);

            // Se aprovado, busca os links uma última vez
            if (statusData.status === "approved") {
              try {
                const links = await fetchDownloadLinks(paymentId);
                if (isMountedRef.current) {
                  setDownloadLinks(links);
                }
              } catch (downloadError) {
                console.warn("⚠️ Erro final ao buscar links:", downloadError);
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

          if (isMountedRef.current) {
            setError(err.message);
          }
        }
      }, 5000); // 5 segundos
    };

    // Inicia o polling após um pequeno delay
    const timeoutId = setTimeout(startPolling, 2000);

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

  // ✅ Debug logs do estado atual
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Estado atual do hook:");
      console.log("   - paymentId:", paymentId);
      console.log("   - paymentData:", paymentData);
      console.log("   - downloadLinks:", downloadLinks);
      console.log("   - loading:", loading);
      console.log("   - error:", error);
    }
  }, [paymentId, paymentData, downloadLinks, loading, error]);

  // ✅ Função para forçar nova consulta (útil para retry)
  const refetch = useCallback(async () => {
    if (!paymentId) return;

    console.log("🔄 Refetch solicitado para:", paymentId);
    setLoading(true);
    setError(null);

    await fetchPaymentData();
  }, [paymentId, fetchPaymentData]);

  return {
    paymentData,
    downloadLinks,
    loading,
    error,
    refetch,
    // ✅ Estados adicionais úteis
    isApproved: paymentData?.status === "approved",
    isPending: paymentData?.status === "pending",
    isRejected: paymentData?.status === "rejected",
    hasDownloadLinks: downloadLinks.length > 0,
  };
};

import { useState, useEffect, useCallback } from "react";

interface PaymentStatus {
  status: "pending" | "approved" | "rejected" | "expired";
  paymentId: string;
  products: Array<{
    id: string;
    name: string;
    downloadUrl?: string;
    fileSize?: string;
    format?: string;
  }>;
  customerEmail: string;
  total: number;
  createdAt: string;
}

export const usePaymentStatus = (paymentId: string | null) => {
  const [paymentData, setPaymentData] = useState<PaymentStatus | null>(null);
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Consulta os links de download
  const fetchDownloadLinks = useCallback(async () => {
    if (!paymentId) return;

    console.log("🔗 Buscando links para paymentId:", paymentId);

    try {
      const response = await fetch(
        `https://servidor-loja-digital.onrender.com/link-download/${paymentId}`
      );

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("❌ Erro na resposta:", errorText);
        throw new Error("Erro ao buscar os links de download.");
      }

      const data = await response.json();
      console.log("📦 Dados recebidos do link-download:", data);

      if (data?.links?.length) {
        setDownloadLinks(data.links);
        console.log("✅ Links definidos:", data.links);
      } else {
        console.warn("⚠️ Nenhum link de download encontrado:", data);
        setDownloadLinks([]);
      }
    } catch (err) {
      console.error("💥 Erro ao buscar links:", err);
      setError("Erro ao buscar links de download.");
    }
  }, [paymentId]);

  // ✅ Consulta o status do pagamento
  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId) {
      setError("ID do pagamento não encontrado");
      setLoading(false);
      return null;
    }

    console.log("🔄 Verificando status para paymentId:", paymentId);

    try {
      const response = await fetch(
        `https://servidor-loja-digital.onrender.com/status-pagamento/${paymentId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("📡 Status response:", response.status);

      if (!response.ok) {
        throw new Error("Erro ao verificar status do pagamento");
      }

      const data = await response.json();
      console.log("📦 Dados do status recebidos:", data);

      setPaymentData(data);
      setError(null);

      // ✅ Se aprovado, buscar os links de download
      if (data.status === "approved") {
        console.log("✅ Pagamento aprovado! Buscando links...");
        await fetchDownloadLinks();
      } else {
        console.log("⏳ Pagamento ainda pendente, status:", data.status);
      }

      return data;
    } catch (err) {
      console.error("💥 Erro ao verificar pagamento:", err);
      setError("Erro ao verificar status do pagamento");
      return null;
    } finally {
      setLoading(false);
    }
  }, [paymentId, fetchDownloadLinks]);

  // ✅ Polling automático a cada 5 segundos
  useEffect(() => {
    if (!paymentId) return;

    console.log("🚀 Iniciando polling para paymentId:", paymentId);
    checkPaymentStatus(); // primeira checagem

    const interval = setInterval(async () => {
      console.log("⏰ Polling automático...");
      const res = await checkPaymentStatus();
      if (
        res?.status === "approved" ||
        res?.status === "rejected" ||
        res?.status === "expired"
      ) {
        console.log("🛑 Parando polling, status final:", res.status);
        clearInterval(interval); // parar se o pagamento foi finalizado
      }
    }, 5000); // 5 segundos

    return () => {
      console.log("🧹 Limpando interval");
      clearInterval(interval);
    };
  }, [paymentId, checkPaymentStatus]);

  // Debug logs para o estado atual
  useEffect(() => {
    console.log("📊 Estado atual:");
    console.log("   - paymentData:", paymentData);
    console.log("   - downloadLinks:", downloadLinks);
    console.log("   - loading:", loading);
    console.log("   - error:", error);
  }, [paymentData, downloadLinks, loading, error]);

  return {
    paymentData,
    downloadLinks,
    loading,
    error,
    refetch: checkPaymentStatus,
  };
};

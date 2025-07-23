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

    try {
      const response = await fetch(
        `https://servidor-loja-digital.onrender.com/link-download/${paymentId}`
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar os links de download.");
      }

      const data = await response.json();

      if (data?.links?.length) {
        setDownloadLinks(data.links);
        console.log("Links recebidos:", data.links);
      } else {
        console.warn("Nenhum link de download encontrado.");
        setDownloadLinks([]);
      }
    } catch (err) {
      console.error("Erro ao buscar links:", err);
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

    try {
      const response = await fetch(
        `https://servidor-loja-digital.onrender.com/status-pagamento/${paymentId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao verificar status do pagamento");
      }

      const data = await response.json();
      setPaymentData(data);
      setError(null);

      // ✅ Se aprovado, buscar os links de download
      if (data.status === "approved") {
        fetchDownloadLinks();
      }

      return data;
    } catch (err) {
      console.error("Erro ao verificar pagamento:", err);
      setError("Erro ao verificar status do pagamento");
      return null;
    } finally {
      setLoading(false);
    }
  }, [paymentId, fetchDownloadLinks]);

  // ✅ Polling automático a cada 5 segundos
  useEffect(() => {
    if (!paymentId) return;

    checkPaymentStatus(); // primeira checagem

    const interval = setInterval(async () => {
      const res = await checkPaymentStatus();
      if (
        res?.status === "approved" ||
        res?.status === "rejected" ||
        res?.status === "expired"
      ) {
        clearInterval(interval); // parar se o pagamento foi finalizado
      }
    }, 5000); // 5 segundos

    return () => clearInterval(interval); // limpar ao desmontar
  }, [paymentId, checkPaymentStatus]);

  return {
    paymentData,
    downloadLinks,
    loading,
    error,
    refetch: checkPaymentStatus,
  };
};

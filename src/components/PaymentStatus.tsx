import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, XCircle, RefreshCw, Download } from "lucide-react";
import { api } from "../services/api";
import { supabase } from "../lib/supabase";

interface PaymentStatusProps {
  paymentId: string;
  qrCodeBase64?: string;
  onBack?: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentId, qrCodeBase64, onBack }) => {
  const [status, setStatus] = useState<string>("pending");
  const [downloadLinks, setDownloadLinks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkPaymentStatus = async () => {
    try {
      const data = await api.getPaymentStatus(paymentId);
      setStatus(data.status);

      if (data.status === "approved") {
        const { data: downloads, error } = await supabase
          .from("downloads")
          .select("download_url")
          .eq("pedido_id", paymentId);

        if (!error && downloads) {
          setDownloadLinks(downloads.map((d) => d.download_url));
        }
      }
    } catch (err) {
      console.error("Erro ao verificar status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    const interval = setInterval(() => {
      if (status !== "approved") {
        checkPaymentStatus();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentId, status]);

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />;
    switch (status) {
      case "approved": return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "rejected":
      case "cancelled": return <XCircle className="w-8 h-8 text-red-500" />;
      default: return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">{getStatusIcon()}</div>
      <h2 className="text-xl font-bold mb-4">
        {status === "approved"
          ? "Pagamento aprovado! Seus downloads estão prontos."
          : status === "pending"
          ? "Aguardando pagamento..."
          : "Pagamento não aprovado."}
      </h2>

      {status !== "approved" && qrCodeBase64 && (
        <img
          src={qrCodeBase64.startsWith("data:") ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code PIX"
          className="mx-auto w-64 h-64"
        />
      )}

      {status === "approved" && downloadLinks.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-lg font-semibold">Seus Downloads:</h3>
          {downloadLinks.map((link, i) => (
            <a
              key={i}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              <Download className="w-4 h-4 mr-2" /> Baixar arquivo {i + 1}
            </a>
          ))}
        </div>
      )}

      {status === "approved" && downloadLinks.length === 0 && (
        <p className="text-gray-600 mt-4">Nenhum link disponível ainda. Aguarde um momento.</p>
      )}

      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
        >
          Voltar à Loja
        </button>
      )}
    </div>
  );
};

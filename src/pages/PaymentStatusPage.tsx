import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Download, AlertTriangle } from "lucide-react";

interface DownloadResponse {
  link: string;
}

const PaymentStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<string>("aguardando");
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setError("ID de pagamento inválido.");
      setChecking(false);
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://servidor-loja-digital.onrender.com/status-pagamento/${id}`
        );
        const data = await res.json();

        if (data.status) {
          setStatus(data.status);
          console.log("⏱ Status do pagamento:", data.status);

          if (data.status === "approved") {
            clearInterval(interval);
            buscarLinkDownload(); // link liberado após status aprovado
            setChecking(false);
          }
        } else {
          setError("Não foi possível obter o status do pagamento.");
          clearInterval(interval);
          setChecking(false);
        }
      } catch (err) {
        console.error("Erro ao verificar status:", err);
        setError("Erro ao verificar status do pagamento.");
        clearInterval(interval);
        setChecking(false);
      }
    }, 5000); // verifica a cada 5 segundos

    return () => clearInterval(interval);
  }, [id]);

  const buscarLinkDownload = async () => {
    try {
      const res = await fetch(
        `https://servidor-loja-digital.onrender.com/link-download/${id}`
      );
      const data: DownloadResponse = await res.json();

      if (data.link) {
        setDownloadLink(data.link);
      } else {
        setError("Link de download não disponível.");
      }
    } catch (err) {
      console.error("Erro ao buscar link:", err);
      setError("Erro ao buscar o link de download.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center border">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Status do Pagamento
        </h1>

        {checking && (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Verificando pagamento...</p>
          </div>
        )}

        {!checking && status !== "approved" && !error && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Seu pagamento está com o status:{" "}
              <strong className="capitalize text-blue-600">{status}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Assim que for aprovado, o link será liberado automaticamente.
            </p>
          </div>
        )}

        {downloadLink && (
          <div className="space-y-4">
            <p className="text-green-600 font-semibold">
              ✅ Pagamento aprovado! Seu link de download está pronto:
            </p>
            <a
              href={downloadLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Arquivo
            </a>
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;

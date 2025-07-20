import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Download, AlertTriangle } from "lucide-react";

interface DownloadResponse {
  link: string;
  qr_code_base64?: string;
  qr_code?: string;
  status: string;
  id: string;
}

const PaymentStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<string>("aguardando");
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!id) {
      setError("ID de pagamento inválido.");
      setChecking(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        console.log("🔍 Verificando pagamento ID:", id);

        // ✅ URL corrigida para o endpoint correto
        const res = await fetch(
          `https://servidor-loja-digital.onrender.com/pagamento/${id}`
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data: DownloadResponse = await res.json();

        console.log("📋 Dados recebidos:", data);
        console.log("QR Code Base64 existe?", !!data.qr_code_base64);
        console.log("QR Code texto existe?", !!data.qr_code);

        if (data.status) {
          setStatus(data.status);
          console.log("⏱ Status do pagamento:", data.status);

          if (data.status === "approved") {
            setQrCodeBase64(null); // não precisa mais do QR
            setDownloadLink(data.link || null);
            setChecking(false);
          } else {
            // ✅ Tenta ambos os campos de QR code
            const qrCode = data.qr_code_base64 || data.qr_code;

            if (qrCode) {
              console.log("✅ QR Code encontrado!");
              setQrCodeBase64(qrCode);
            } else {
              console.log("❌ QR Code não encontrado nos dados");
            }

            setDownloadLink(null);
            setChecking(false);
          }
        } else {
          setError("Não foi possível obter o status do pagamento.");
          setChecking(false);
        }
      } catch (err) {
        console.error("❌ Erro ao verificar status:", err);
        setError(
          `Erro ao verificar status: ${
            err instanceof Error ? err.message : "Erro desconhecido"
          }`
        );
        setChecking(false);
      }
    };

    // Verifica imediatamente
    checkPaymentStatus();

    // Depois verifica a cada 5 segundos
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [id]);

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

        {!checking && qrCodeBase64 && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Seu pagamento está pendente. Escaneie o QR Code abaixo para pagar
              via Pix:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <img
                src={`data:image/png;base64,${qrCodeBase64}`}
                alt="QR Code Pix"
                className="mx-auto w-64 h-64"
                onError={(e) => {
                  console.log("❌ Erro ao carregar QR Code image");
                  // Se a imagem não carregar, tenta mostrar como texto
                  setError(
                    "Erro ao carregar QR Code. Dados: " +
                      qrCodeBase64?.slice(0, 50) +
                      "..."
                  );
                }}
                onLoad={() => console.log("✅ QR Code carregado com sucesso!")}
              />
            </div>
            <p className="text-xs text-gray-500">
              Status atual:{" "}
              <span className="capitalize font-semibold">{status}</span>
            </p>
          </div>
        )}

        {!checking && status !== "approved" && !qrCodeBase64 && !error && (
          <div className="space-y-2">
            <p className="text-gray-700">
              Status do pagamento:{" "}
              <strong className="capitalize text-blue-600">{status}</strong>
            </p>
            <p className="text-sm text-yellow-600">
              ⚠️ QR Code não disponível. Verifique os logs do servidor.
            </p>
          </div>
        )}

        {downloadLink && (
          <div className="space-y-4 mt-4">
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

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left">
            <strong>Debug Info:</strong>
            <br />
            ID: {id}
            <br />
            Status: {status}
            <br />
            QR Code: {qrCodeBase64 ? "Presente" : "Ausente"}
            <br />
            Checking: {checking ? "Sim" : "Não"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;

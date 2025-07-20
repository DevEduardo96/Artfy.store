// src/pages/PaymentStatusPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Download, AlertTriangle } from "lucide-react";

interface PaymentInitData {
  id: string;
  status: string;
  qr_code_base64?: string;
  qr_code?: string;
  ticket_url?: string;
}

interface StatusResponse {
  status: string;
}

interface LinkResponse {
  link: string;
}

const API_BASE = "https://servidor-loja-digital.onrender.com";

const PaymentStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Dados iniciais vindos do navigate() após criar pagamento
  const initData = (location.state as PaymentInitData | undefined) || undefined;

  const [status, setStatus] = useState<string>(initData?.status ?? "pending");
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(
    initData?.qr_code_base64 || null
  );
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  // Se não veio state e também não há id → erro
  useEffect(() => {
    if (!id) {
      setError("ID de pagamento inválido.");
    }
  }, [id]);

  /** Consulta status no backend */
  const fetchStatus = useCallback(async () => {
    if (!id) return;
    setChecking(true);
    try {
      const res = await fetch(`${API_BASE}/status-pagamento/${id}`);
      if (!res.ok) {
        throw new Error(`Status HTTP ${res.status}`);
      }
      const data: StatusResponse = await res.json();
      setStatus(data.status);

      // Se aprovado → busca link
      if (data.status === "approved") {
        await fetchLinkDownload(id);
      }
    } catch (err) {
      console.error("❌ Erro ao consultar status:", err);
      setError("Erro ao consultar status do pagamento.");
    } finally {
      setChecking(false);
    }
  }, [id]);

  /** Busca link de download quando aprovado */
  const fetchLinkDownload = useCallback(async (paymentId: string) => {
    try {
      const res = await fetch(`${API_BASE}/link-download/${paymentId}`);
      if (!res.ok) {
        throw new Error(`Status HTTP ${res.status}`);
      }
      const data: LinkResponse = await res.json();
      setDownloadLink(data.link);
      setQrCodeBase64(null); // não precisa mais mostrar QR
    } catch (err) {
      console.error("❌ Erro ao buscar link de download:", err);
      setError("Pagamento aprovado, mas falha ao obter link de download.");
    }
  }, []);

  // Polling: consulta status em intervalo
  useEffect(() => {
    if (!id) return;

    // Se já veio aprovado do state, busca link direto e não poll
    if (initData?.status === "approved") {
      fetchLinkDownload(id);
      return;
    }

    // Primeira verificação imediata
    fetchStatus();

    // Poll a cada 5s
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id, initData?.status, fetchStatus, fetchLinkDownload]);

  // Botão para copiar código Pix (quando qr_code em texto)
  const copyPixCode = () => {
    const text = initData?.qr_code || "";
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Código Pix copiado!"))
      .catch(() => alert("Não foi possível copiar o código Pix."));
  };

  // Se usuário abriu a página manualmente (sem state) e status pendente, não teremos o QR
  const missingQrBecauseNoState = !qrCodeBase64 && status !== "approved" && !initData?.qr_code;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center border">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Status do Pagamento
        </h1>

        {/* Loader */}
        {checking && (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Verificando pagamento...</p>
          </div>
        )}

        {/* Exibir QR enquanto pendente */}
        {!checking && status !== "approved" && (qrCodeBase64 || initData?.qr_code) && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Seu pagamento está pendente. Escaneie o QR Code abaixo ou copie o código Pix:
            </p>
            {qrCodeBase64 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="mx-auto w-64 h-64"
                />
              </div>
            )}
            <button
              onClick={copyPixCode}
              className="text-xs underline text-blue-600 hover:text-blue-700"
              type="button"
            >
              Copiar código Pix
            </button>
            <p className="text-xs text-gray-500">
              Status atual:{" "}
              <span className="capitalize font-semibold">{status}</span>
            </p>
          </div>
        )}

        {/* Quando não temos QR porque usuário recarregou a página */}
        {!checking && missingQrBecauseNoState && (
          <div className="space-y-2">
            <p className="text-gray-700">
              Status do pagamento:{" "}
              <strong className="capitalize text-blue-600">{status}</strong>
            </p>
            <p className="text-sm text-yellow-600">
              QR Code indisponível (página recarregada?). Volte para o carrinho e gere o Pix novamente.
            </p>
          </div>
        )}

        {/* Link de download quando aprovado */}
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

        {/* Erro */}
        {error && (
          <div className="mt-4 text-red-600 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-left">
            <strong>Debug Info:</strong>
            <br />
            ID: {id}
            <br />
            Status: {status}
            <br />
            QR (state): {initData?.qr_code_base64 ? "Sim" : "Não"}
            <br />
            QR (local): {qrCodeBase64 ? "Sim" : "Não"}
            <br />
            Checking: {checking ? "Sim" : "Não"}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusPage;

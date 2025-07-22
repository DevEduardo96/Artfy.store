import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";

interface PaymentInitData {
  id: string;
  status: string;
  qr_code_base64?: string;
  qr_code?: string;
}

interface StatusResponse {
  status: string;
  qr_code_base64?: string;
  qr_code?: string;
}

interface ProdutoDownload {
  id: string;
  nome: string;
  link_download: string;
  quantidade: number;
}

interface LinkResponse {
  cliente_email: string;
  produtos: ProdutoDownload[];
  pagamento: {
    id: string;
    aprovado_em: string;
    valido_ate: string;
    dias_restantes: number;
  };
}

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  "https://servidor-loja-digital.onrender.com";

const PaymentStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Dados passados pela navegação após criação do pagamento
  const initData = (location.state as PaymentInitData | undefined) || undefined;

  const [status, setStatus] = useState<string>(initData?.status ?? "pending");
  const [downloadLinks, setDownloadLinks] = useState<ProdutoDownload[] | null>(
    null
  );
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(
    initData?.qr_code_base64 || null
  );
  const [pixCode, setPixCode] = useState<string | null>(
    initData?.qr_code || null
  );
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    if (!id) {
      setError("ID de pagamento inválido.");
    }
  }, [id]);

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
      if (data.qr_code_base64) setQrCodeBase64(data.qr_code_base64);
      if (data.qr_code) setPixCode(data.qr_code);

      if (data.status === "approved") {
        await fetchDownloadLinks(id);
      }
    } catch (err) {
      console.error("❌ Erro ao consultar status:", err);
      setError("Erro ao consultar status do pagamento.");
    } finally {
      setChecking(false);
    }
  }, [id]);

  const fetchDownloadLinks = useCallback(async (token: string) => {
    try {
      // Altere para a rota correta que seu backend oferece para obter os links
      const res = await fetch(`${API_BASE}/links/${token}`);
      if (!res.ok) {
        throw new Error(`Status HTTP ${res.status}`);
      }
      const data: LinkResponse = await res.json();

      setDownloadLinks(data.produtos);
      setQrCodeBase64(null);
      setError(null);
    } catch (err) {
      console.error("❌ Erro ao buscar links de download:", err);
      setError("Pagamento aprovado, mas falha ao obter links de download.");
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    if (initData?.status === "approved") {
      fetchDownloadLinks(id);
      return;
    }

    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id, initData?.status, fetchStatus, fetchDownloadLinks]);

  const copyPixCode = () => {
    const text = pixCode || "";
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Código Pix copiado!"))
      .catch(() => alert("Não foi possível copiar o código Pix."));
  };

  const missingQrBecauseNoState =
    !qrCodeBase64 && status !== "approved" && !initData?.qr_code;

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

        {!checking && status !== "approved" && (qrCodeBase64 || pixCode) && (
          <div className="space-y-3">
            <p className="text-gray-700">
              Seu pagamento está pendente. Escaneie o QR Code abaixo ou copie o
              código Pix:
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
            {pixCode && (
              <button
                onClick={copyPixCode}
                className="text-xs underline text-blue-600 hover:text-blue-700"
                type="button"
              >
                Copiar código Pix
              </button>
            )}
            <p className="text-xs text-gray-500">
              Status atual:{" "}
              <span className="capitalize font-semibold">{status}</span>
            </p>
          </div>
        )}

        {!checking && missingQrBecauseNoState && (
          <div className="space-y-2">
            <p className="text-gray-700">
              Status do pagamento:{" "}
              <strong className="capitalize text-blue-600">{status}</strong>
            </p>
            <p className="text-sm text-yellow-600">
              QR Code indisponível (página recarregada?). Volte para o carrinho
              e gere o Pix novamente.
            </p>
          </div>
        )}

        {downloadLinks && (
          <div className="space-y-4 mt-4 text-left">
            <p className="text-green-600 font-semibold">
              ✅ Pagamento aprovado! Seus links de download:
            </p>
            <ul className="list-disc list-inside">
              {downloadLinks.map((produto) => (
                <li key={produto.id} className="mb-2">
                  <strong>{produto.nome}</strong> (Quantidade:{" "}
                  {produto.quantidade})
                  <br />
                  <a
                    href={produto.link_download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Baixar arquivo
                  </a>
                </li>
              ))}
            </ul>
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
      

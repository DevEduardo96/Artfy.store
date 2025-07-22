import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckCircle, Clock, XCircle, Download, Copy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Order, Download as DownloadType, Product } from "../types";

const PaymentStatusPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const qrCode = searchParams.get("qr");

  const [order, setOrder] = useState<Order | null>(null);
  const [downloads, setDownloads] = useState<
    (DownloadType & { product: Product })[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchOrderStatus();
      const interval = setInterval(fetchOrderStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [paymentId]);

  const fetchOrderStatus = async () => {
    if (!paymentId) return;

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("mercadopago_payment_id", paymentId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      if (orderData.status === "approved") {
        const { data: downloadsData, error: downloadsError } = await supabase
          .from("downloads")
          .select(
            `
            *,
            product:products(*)
          `
          )
          .eq("order_id", orderData.id);

        if (downloadsError) throw downloadsError;
        setDownloads(downloadsData || []);
      }
    } catch (error) {
      console.error("Erro ao buscar status do pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCode = () => {
    if (order?.qr_code) {
      navigator.clipboard.writeText(order.qr_code);
      alert("Código PIX copiado!");
    }
  };

  const handleDownload = async (downloadToken: string, productName: string) => {
    try {
      const downloadRecord = downloads.find(
        (d) => d.download_token === downloadToken
      );
      const currentCount = downloadRecord ? downloadRecord.download_count : 0;

      const { error } = await supabase
        .from("downloads")
        .update({
          download_count: currentCount + 1,
        })
        .eq("download_token", downloadToken);

      if (error) throw error;

      // Substitua por link real de download na sua API
      alert(`Download iniciado: ${productName}`);

      setDownloads((prev) =>
        prev.map((d) =>
          d.download_token === downloadToken
            ? { ...d, download_count: d.download_count + 1 }
            : d
        )
      );
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      alert("Erro ao fazer download");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p>Verificando status do pagamento...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <XCircle className="h-12 w-12 mx-auto mb-4" />
          <p>Pedido não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            {order.status === "pending" && (
              <>
                <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Aguardando Pagamento
                </h1>
                <p className="text-gray-600">
                  Escaneie o QR Code ou copie o código PIX para finalizar o
                  pagamento
                </p>
              </>
            )}

            {order.status === "approved" && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento Aprovado!
                </h1>
                <p className="text-gray-600">
                  Seus downloads estão disponíveis abaixo
                </p>
              </>
            )}

            {order.status === "failed" && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Pagamento Recusado
                </h1>
                <p className="text-gray-600">
                  Houve um problema com seu pagamento. Tente novamente.
                </p>
              </>
            )}
          </div>

          {order.status === "pending" && (order.qr_code_base64 || qrCode) && (
            <div className="border rounded-lg p-4 mb-6">
              <div className="text-center mb-4">
                <img
                  src={`data:image/png;base64,${
                    order.qr_code_base64 || qrCode
                  }`}
                  alt="QR Code PIX"
                  className="mx-auto w-64 h-64 border rounded-lg"
                />
              </div>

              {order.qr_code && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={order.qr_code}
                    readOnly
                    className="flex-1 p-2 border rounded text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyPixCode}
                    className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {order.status === "approved" && downloads.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Seus Downloads
              </h2>

              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {download.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Downloads restantes:{" "}
                      {download.max_downloads - download.download_count}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expira em:{" "}
                      {download.expires_at
                        ? new Date(download.expires_at).toLocaleDateString(
                            "pt-BR"
                          )
                        : "Não informado"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      handleDownload(
                        download.download_token,
                        download.product.name
                      )
                    }
                    disabled={download.download_count >= download.max_downloads}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {order.status === "approved" && downloads.length === 0 && (
            <p className="text-center text-gray-600 mt-6">
              Nenhum download disponível para este pedido.
            </p>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">
              Detalhes do Pedido
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <strong>ID do Pedido:</strong> {order.id}
              </p>
              <p>
                <strong>E-mail:</strong>{" "}
                {order.customer_email || "Não informado"}
              </p>
              <p>
                <strong>Total:</strong>{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(order.total_amount)}
              </p>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(order.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;

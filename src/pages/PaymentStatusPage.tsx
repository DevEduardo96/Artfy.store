// PaymentStatusPage.tsx - VERSÃO CORRIGIDA
import { useParams, useNavigate } from "react-router-dom";
import { usePaymentStatus } from "../hook/usePaymentStatus";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PaymentStatusPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const {
    paymentData,
    downloadLinks,
    loading,
    error,
    refetch,
    isApproved,
    isPending,
    isRejected,
    hasDownloadLinks,
  } = usePaymentStatus(paymentId || null);

  const [isRefetching, setIsRefetching] = useState(false);

  // ✅ Informações de status melhoradas
  const getStatusInfo = () => {
    if (!paymentData) {
      return {
        label: "Carregando...",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        Icon: Clock,
      };
    }

    switch (paymentData.status) {
      case "approved":
        return {
          label: "✅ Aprovado",
          color: "text-green-600",
          bgColor: "bg-green-100",
          Icon: CheckCircle,
          description: "Seu pagamento foi aprovado com sucesso!",
        };
      case "rejected":
        return {
          label: "❌ Recusado",
          color: "text-red-600",
          bgColor: "bg-red-100",
          Icon: XCircle,
          description: "O pagamento foi recusado. Tente novamente.",
        };
      case "expired":
        return {
          label: "⏰ Expirado",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          Icon: AlertTriangle,
          description: "O prazo para pagamento expirou.",
        };
      case "pending":
      default:
        return {
          label: "⏳ Aguardando Pagamento",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          Icon: Clock,
          description: "Aguardando confirmação do pagamento PIX.",
        };
    }
  };

  const handleRefetch = async () => {
    setIsRefetching(true);
    try {
      await refetch();
      toast.success("Status atualizado!");
    } catch (err) {
      toast.error("Erro ao atualizar status");
    } finally {
      setIsRefetching(false);
    }
  };

  const handleDownload = (url: string, productName: string) => {
    try {
      // Abre o link em nova aba
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Download de "${productName}" iniciado!`);
    } catch (err) {
      toast.error("Erro ao iniciar download");
    }
  };

  const formatPrice = (centavos: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(centavos / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { label, color, bgColor, Icon, description } = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar à loja
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Status do Pagamento
          </h1>

          {paymentId && (
            <p className="text-sm text-gray-500">
              ID do Pagamento: <span className="font-mono">{paymentId}</span>
            </p>
          )}
        </div>

        {/* ✅ Loading State */}
        {loading && !paymentData && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-lg">Carregando informações do pagamento...</p>
              <p className="text-sm text-gray-500">
                Isso pode levar alguns segundos
              </p>
            </div>
          </div>
        )}

        {/* ✅ Error State */}
        {error && !paymentData && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Erro ao carregar pagamento
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <button
                onClick={handleRefetch}
                disabled={isRefetching}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isRefetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Tentar Novamente
              </button>
            </div>
          </div>
        )}

        {/* ✅ Payment Data */}
        {paymentData && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${bgColor}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-semibold ${color}`}>
                      {label}
                    </h2>
                    {description && (
                      <p className="text-gray-600 mt-1">{description}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleRefetch}
                  disabled={isRefetching}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Atualizar status"
                >
                  {isRefetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Atualizar
                </button>
              </div>

              {/* Payment Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Detalhes do Pagamento
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">E-mail:</dt>
                      <dd className="font-medium">
                        {paymentData.customerEmail}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Valor Total:</dt>
                      <dd className="font-semibold text-green-600">
                        {formatPrice(paymentData.total)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Data da Compra:</dt>
                      <dd className="font-medium">
                        {formatDate(paymentData.createdAt)}
                      </dd>
                    </div>
                    {paymentData.updatedAt &&
                      paymentData.updatedAt !== paymentData.createdAt && (
                        <div className="flex justify-between">
                          <dt className="text-gray-600">Última Atualização:</dt>
                          <dd className="font-medium">
                            {formatDate(paymentData.updatedAt)}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>

                {/* Status Detail */}
                {paymentData.statusDetail && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Detalhes Técnicos
                    </h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      Status: {paymentData.statusDetail}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Products List */}
            {paymentData.products && paymentData.products.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Produtos Adquiridos ({paymentData.products.length})
                </h3>

                <div className="space-y-3">
                  {paymentData.products.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          {product.format && (
                            <span>Formato: {product.format}</span>
                          )}
                          {product.fileSize && (
                            <span>Tamanho: {product.fileSize}</span>
                          )}
                          {product.quantity && product.quantity > 1 && (
                            <span>Qtd: {product.quantity}</span>
                          )}
                          {product.price && (
                            <span className="font-semibold text-green-600">
                              {formatPrice(product.price * 100)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Download Button */}
                      {isApproved && downloadLinks[index] && (
                        <button
                          onClick={() =>
                            handleDownload(downloadLinks[index], product.name)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section */}
            {isApproved && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">
                    Downloads Disponíveis
                  </h3>
                </div>

                {hasDownloadLinks ? (
                  <div className="space-y-3">
                    <p className="text-green-700 mb-4">
                      Seus produtos estão prontos para download! Clique nos
                      botões acima para baixar cada item.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {downloadLinks.map((link, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleDownload(
                              link,
                              paymentData.products[index]?.name ||
                                `Produto ${index + 1}`
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download {index + 1}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 p-3 bg-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        💡 <strong>Importante:</strong> Salve os arquivos em
                        local seguro. Os links podem expirar após 24 horas por
                        motivos de segurança.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Preparando downloads...</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Seus links de download estão sendo preparados. Aguarde
                      alguns instantes.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pending State Info */}
            {isPending && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    Aguardando Pagamento
                  </h3>
                </div>
                <p className="text-blue-700 mb-4">
                  Seu pagamento PIX ainda está sendo processado. Esta página
                  será atualizada automaticamente quando o pagamento for
                  confirmado.
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando status a cada 5 segundos...</span>
                </div>
              </div>
            )}

            {/* Rejected State Info */}
            {isRejected && (
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">
                    Pagamento Não Aprovado
                  </h3>
                </div>
                <p className="text-red-700 mb-4">
                  Infelizmente seu pagamento não foi aprovado. Isso pode
                  acontecer por diversos motivos.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Tentar Nova Compra
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

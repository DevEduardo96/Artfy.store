// PaymentStatusPage.tsx - CORREÇÃO FINAL
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
  Home,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  const [showDetails, setShowDetails] = useState(false);

  // ✅ Auto-retry para pagamentos não encontrados
  useEffect(() => {
    if (error && error.includes("não encontrado") && paymentId) {
      console.log(
        "🔄 Pagamento não encontrado, tentando novamente em 3 segundos..."
      );

      const retryTimeout = setTimeout(() => {
        console.log("🔄 Executando retry automático...");
        refetch();
      }, 3000);

      return () => clearTimeout(retryTimeout);
    }
  }, [error, paymentId, refetch]);

  // ✅ Informações de status melhoradas
  const getStatusInfo = () => {
    if (loading && !paymentData) {
      return {
        label: "🔄 Carregando...",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        Icon: Loader2,
        description: "Buscando informações do pagamento...",
      };
    }

    if (error && !paymentData) {
      return {
        label: "❌ Erro",
        color: "text-red-600",
        bgColor: "bg-red-100",
        Icon: XCircle,
        description: error,
      };
    }

    if (!paymentData) {
      return {
        label: "❓ Não encontrado",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        Icon: AlertTriangle,
        description: "ID do pagamento não encontrado",
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
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success(`Download de "${productName}" iniciado!`);
    } catch (err) {
      toast.error("Erro ao iniciar download");
    }
  };

  const formatPrice = (centavos: number) => {
    const valor = typeof centavos === "number" ? centavos : 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor / 100);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
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
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-500">
                ID:{" "}
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                  {paymentId}
                </span>
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
              </button>
            </div>
          )}
        </div>

        {/* ✅ Loading State Melhorado */}
        {loading && !paymentData && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center justify-center gap-4 text-gray-600">
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-blue-200 rounded-full"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium mb-2">
                  Carregando informações do pagamento...
                </p>
                <p className="text-sm text-gray-500">
                  Isso pode levar alguns segundos enquanto consultamos o
                  servidor
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Error State Melhorado */}
        {error && !paymentData && !loading && (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Ops! Algo deu errado
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">
                  {error.includes("não encontrado")
                    ? "O pagamento pode estar sendo processado. Tente novamente em alguns instantes."
                    : "Tente atualizar a página ou verifique sua conexão com a internet."}
                </p>

                <div className="flex gap-3 justify-center">
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

                  <button
                    onClick={() => navigate("/")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Home className="w-4 h-4" />
                    Voltar à Loja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Payment Data */}
        {paymentData && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full ${bgColor}`}>
                    <Icon
                      className={`w-8 h-8 ${color} ${
                        Icon === Loader2 ? "animate-spin" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${color} mb-1`}>
                      {label}
                    </h2>
                    {description && (
                      <p className="text-gray-600">{description}</p>
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
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600 font-medium">E-mail:</dt>
                      <dd className="font-semibold text-right">
                        {paymentData.customerEmail}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600 font-medium">
                        Valor Total:
                      </dt>
                      <dd className="font-bold text-green-600 text-lg">
                        {formatPrice(paymentData.total)}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600 font-medium">
                        Data da Compra:
                      </dt>
                      <dd className="font-semibold">
                        {formatDate(paymentData.createdAt)}
                      </dd>
                    </div>
                    {paymentData.updatedAt &&
                      paymentData.updatedAt !== paymentData.createdAt && (
                        <div className="flex justify-between py-2">
                          <dt className="text-gray-600 font-medium">
                            Última Atualização:
                          </dt>
                          <dd className="font-semibold">
                            {formatDate(paymentData.updatedAt)}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>

                {/* Additional Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Informações Adicionais
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">Status do Sistema:</p>
                      <p className="font-semibold">{paymentData.status}</p>
                      {paymentData.statusDetail && (
                        <p className="text-xs text-gray-500 mt-1">
                          {paymentData.statusDetail}
                        </p>
                      )}
                    </div>

                    {paymentData.hasLinks && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-green-700 font-medium">
                          ✅ Links de download disponíveis
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Debug Info */}
              {showDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    Detalhes Técnicos
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(
                        {
                          paymentId: paymentData.paymentId,
                          status: paymentData.status,
                          hasLinks: paymentData.hasLinks,
                          linksCount: paymentData.linksCount,
                          productsCount: paymentData.products.length,
                          downloadLinksCount: downloadLinks.length,
                          createdAt: paymentData.createdAt,
                          updatedAt: paymentData.updatedAt,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
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
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {product.format && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {product.format}
                            </span>
                          )}
                          {product.fileSize && (
                            <span>📦 {product.fileSize}</span>
                          )}
                          {product.quantity && product.quantity > 1 && (
                            <span>📊 Qtd: {product.quantity}</span>
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
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-4"
                        >
                          <Download className="w-4 h-4" />
                          Baixar
                        </button>
                      )}

                      {/* Status indicator for each product */}
                      {isApproved && !downloadLinks[index] && (
                        <div className="flex items-center gap-2 text-gray-500 ml-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Preparando...</span>
                        </div>
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
                  <div className="space-y-4">
                    <p className="text-green-700 mb-4">
                      🎉 Parabéns! Seus produtos estão prontos para download.
                      Clique nos botões acima para baixar cada item
                      individualmente.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          {paymentData.products[index]?.name?.substring(
                            0,
                            20
                          ) || `Download ${index + 1}`}
                          {paymentData.products[index]?.name?.length > 20 &&
                            "..."}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-green-200/50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">
                        📋 Instruções importantes:
                      </h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>
                          • Salve os arquivos em local seguro no seu computador
                        </li>
                        <li>
                          • Os links podem expirar após 24 horas por motivos de
                          segurança
                        </li>
                        <li>
                          • Se tiver problemas, entre em contato conosco com o
                          ID do pagamento
                        </li>
                        <li>
                          • Você pode baixar os arquivos quantas vezes quiser
                          dentro do prazo
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center gap-3 text-green-700 mb-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-lg font-medium">
                        Preparando seus downloads...
                      </span>
                    </div>
                    <p className="text-sm text-green-600 mb-4">
                      Seus links de download estão sendo preparados. Isso pode
                      levar alguns instantes.
                    </p>
                    <button
                      onClick={handleRefetch}
                      disabled={isRefetching}
                      className="inline-flex items-center gap-2 px-4 py-2 text-green-700 hover:text-green-800 hover:bg-green-200 rounded-lg transition-colors"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isRefetching ? "animate-spin" : ""
                        }`}
                      />
                      Verificar novamente
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pending State Info */}
            {isPending && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    Aguardando Pagamento PIX
                  </h3>
                </div>

                <div className="space-y-3">
                  <p className="text-blue-700">
                    Seu pagamento PIX ainda está sendo processado. Esta página
                    será atualizada automaticamente quando o pagamento for
                    confirmado.
                  </p>

                  <div className="bg-blue-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      💡 O que fazer agora?
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Mantenha esta página aberta</li>
                      <li>
                        • O status será atualizado automaticamente a cada 5
                        segundos
                      </li>
                      <li>
                        • Se já pagou, aguarde alguns minutos para a confirmação
                      </li>
                      <li>
                        • Em caso de dúvidas, guarde o ID do pagamento para
                        suporte
                      </li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-blue-600 pt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando status automaticamente...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Rejected State Info */}
            {isRejected && (
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-red-800">
                    Pagamento Não Aprovado
                  </h3>
                </div>

                <div className="space-y-4">
                  <p className="text-red-700">
                    Infelizmente seu pagamento não foi aprovado. Isso pode
                    acontecer por diversos motivos, como problemas na conta PIX
                    ou tempo limite excedido.
                  </p>

                  <div className="bg-red-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">
                      🤔 O que posso fazer?
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Tentar uma nova compra com dados atualizados</li>
                      <li>• Verificar se há fundos suficientes na conta</li>
                      <li>
                        • Entrar em contato com o suporte se o problema
                        persistir
                      </li>
                      <li>• Guardar o ID do pagamento para referência</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/")}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tentar Nova Compra
                    </button>
                    <button
                      onClick={handleRefetch}
                      disabled={isRefetching}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {isRefetching ? (
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 inline mr-2" />
                      )}
                      Verificar Novamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-gray-500">
              {paymentId && (
                <p>
                  Guarde este ID para referência:
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">
                    {paymentId}
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Ir para Loja
              </button>

              {!loading && (
                <button
                  onClick={handleRefetch}
                  disabled={isRefetching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isRefetching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Atualizar Status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

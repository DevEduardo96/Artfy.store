import { useParams } from "react-router-dom";
import { usePaymentStatus } from "../hook/usePaymentStatus";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function PaymentStatusPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { paymentData, downloadLinks, loading, error } = usePaymentStatus(
    paymentId || null
  );

  const getStatusInfo = () => {
    switch (paymentData?.status) {
      case "approved":
        return {
          label: "Aprovado",
          color: "text-green-600",
          Icon: CheckCircle,
        };
      case "rejected":
        return { label: "Recusado", color: "text-red-600", Icon: XCircle };
      case "expired":
        return {
          label: "Expirado",
          color: "text-yellow-600",
          Icon: AlertTriangle,
        };
      case "pending":
      default:
        return { label: "Pendente", color: "text-gray-500", Icon: Clock };
    }
  };

  const { label, color, Icon } = getStatusInfo();

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Status do Pagamento
      </h1>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="animate-spin" />
          Verificando pagamento...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center font-medium mt-4">{error}</div>
      )}

      {!loading && paymentData && (
        <div className="border rounded-xl p-6 shadow-md bg-white">
          <div className="flex items-center gap-2 mb-4">
            <Icon className={color} />
            <p className={`text-lg font-semibold ${color}`}>Status: {label}</p>
          </div>

          <p>
            <strong>E-mail do cliente:</strong> {paymentData.customerEmail}
          </p>
          <p>
            <strong>Valor pago:</strong> R${" "}
            {(paymentData.total / 100).toFixed(2)}
          </p>
          <p>
            <strong>Data da compra:</strong>{" "}
            {new Date(paymentData.createdAt).toLocaleString("pt-BR")}
          </p>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Produtos:</h2>
            <ul className="list-disc ml-6 space-y-1">
              {paymentData.products.map((prod) => (
                <li key={prod.id}>
                  {prod.name}
                  {prod.format && ` (${prod.format})`}
                  {prod.fileSize && ` - ${prod.fileSize}`}
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Links de download */}
          {paymentData.status === "approved" && downloadLinks.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Downloads:</h2>
              <ul className="space-y-2">
                {downloadLinks.map((url, index) => (
                  <li key={index}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                    >
                      Baixar Produto {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {paymentData.status === "pending" && (
            <p className="text-gray-500 mt-4">
              Aguardando confirmação do pagamento. Esta página será atualizada
              automaticamente.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

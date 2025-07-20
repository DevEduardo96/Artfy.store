import React, { useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Copy } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../components/AuthProvider";

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [manualEmail, setManualEmail] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const finalizePurchase = async () => {
    const email = user?.email || manualEmail;

    if (!validateEmail(email)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://servidor-loja-digital.onrender.com/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrinho: state.items,
            nomeCliente: user?.user_metadata?.full_name || "Cliente",
            email,
            total: state.total,
          }),
        }
      );

      if (!response.ok) throw new Error("Erro na requisição");

      const data = await response.json();

      if (data.qr_code_base64 && data.id) {
        setQrCode(data.qr_code_base64);
        setTicketUrl(data.ticket_url);
        setPixCode(data.qr_code);

        // Redirecionar para página de status do pagamento
        navigate(`/pagamento/${data.id}`);

        // Fechar carrinho
        closeCart();
      } else {
        alert("Erro ao gerar QR Code");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar compra");
    } finally {
      setLoading(false);
    }
  };

  const copyPixCodeToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      alert("Código Pix copiado para a área de transferência!");
    }
  };

  if (!state.isOpen) return null;

  const currentEmail = user?.email || manualEmail;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeCart}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Carrinho</h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingBag className="h-16 w-16 mb-4" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-blue-600 font-semibold">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 py-1 bg-white rounded text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Campo para inserir e-mail se não estiver logado */}
            {state.items.length > 0 && !user && (
              <div className="mt-6">
                <label
                  htmlFor="email"
                  className="block mb-1 font-semibold text-gray-700"
                >
                  Seu e-mail para receber o link de download:
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemplo@dominio.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded shadow-sm">
                  <strong className="block font-semibold mb-1">Atenção:</strong>
                  Ao clicar em{" "}
                  <span className="font-semibold">Finalizar Compra</span>, o QR
                  Code será gerado e você será redirecionado.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(state.total)}
                </span>
              </div>
              <button
                onClick={finalizePurchase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Gerando Pix..." : "Finalizar Compra"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;

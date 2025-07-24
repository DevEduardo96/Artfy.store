// Cart.tsx - VERSÃO CORRIGIDA
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const user = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      setEmail("");
    }
  }, [user]);

  // ✅ CORRIGIDO: Melhor controle do polling de status
  const checkPaymentStatusPoll = useCallback(async (id: string) => {
    try {
      console.log(`🔍 Verificando status do pagamento: ${id}`);

      const res = await fetch(
        `https://servidor-loja-digital.onrender.com/status-pagamento/${id}`
      );

      if (!res.ok) {
        console.error(`❌ Erro HTTP ${res.status}`);
        return null;
      }

      const statusData = await res.json();
      console.log(`📊 Status recebido:`, statusData);

      return statusData;
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);
      return null;
    }
  }, []);

  // ✅ CORRIGIDO: useEffect com cleanup adequado
  useEffect(() => {
    if (!paymentId) return;

    console.log(`🚀 Iniciando polling para pagamento: ${paymentId}`);
    setCheckingStatus(true);

    let intervalId: NodeJS.Timeout;
    let isActive = true; // Flag para evitar atualizações após unmount

    const startPolling = async () => {
      // Primeira verificação imediata
      const initialStatus = await checkPaymentStatusPoll(paymentId);

      if (!isActive) return; // Componente foi desmontado

      if (initialStatus?.status === "approved") {
        setCheckingStatus(false);
        Swal.fire({
          icon: "success",
          title: "Pagamento aprovado!",
          text: "Redirecionando para a página de download...",
          toast: true,
          position: "top-end",
          timer: 2000,
          showConfirmButton: false,
        });
        setTimeout(() => {
          if (isActive) {
            navigate(`/pagamento/${paymentId}`);
          }
        }, 2000);
        return;
      }

      // Inicia polling se ainda está pendente
      intervalId = setInterval(async () => {
        if (!isActive) {
          clearInterval(intervalId);
          return;
        }

        const statusData = await checkPaymentStatusPoll(paymentId);

        if (!statusData) return;

        console.log(`📈 Status atual: ${statusData.status}`);

        if (statusData.status === "approved") {
          clearInterval(intervalId);
          setCheckingStatus(false);

          Swal.fire({
            icon: "success",
            title: "Pagamento aprovado!",
            text: "Redirecionando para a página de download...",
            toast: true,
            position: "top-end",
            timer: 2000,
            showConfirmButton: false,
          });

          setTimeout(() => {
            if (isActive) {
              navigate(`/pagamento/${paymentId}`);
            }
          }, 2000);
        } else if (
          statusData.status === "rejected" ||
          statusData.status === "expired"
        ) {
          clearInterval(intervalId);
          setCheckingStatus(false);

          Swal.fire({
            icon: "error",
            title: "Pagamento não aprovado",
            text: `Status: ${statusData.status}`,
            toast: true,
            position: "top-end",
            timer: 5000,
            showConfirmButton: false,
          });
        }
      }, 3000); // 3 segundos
    };

    startPolling();

    // Cleanup function
    return () => {
      console.log(`🧹 Limpando polling para: ${paymentId}`);
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      setCheckingStatus(false);
    };
  }, [paymentId, navigate, checkPaymentStatusPoll]);

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
    // ✅ Limpa estados ao fechar o carrinho
    setQrCode(null);
    setTicketUrl(null);
    setPixCode(null);
    setPaymentId(null);
    setCheckingStatus(false);
  };

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

  // ✅ CORRIGIDO: Melhor tratamento de erros
  const finalizePurchase = async () => {
    if (!validateEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "🚫 E-mail inválido!",
        text: "Por favor, insira um e-mail válido para receber o link de download.",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        background: "#fff",
        color: "#000",
      });
      return;
    }

    if (state.items.length === 0) {
      toast.error("Carrinho está vazio!");
      return;
    }

    setLoading(true);

    try {
      console.log("🛒 Enviando dados do carrinho:", {
        carrinho: state.items,
        nomeCliente: user?.email || email || "Cliente",
        email,
        total: state.total,
      });

      const response = await fetch(
        "https://servidor-loja-digital.onrender.com/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrinho: state.items,
            nomeCliente: user?.email || email || "Cliente",
            email,
            total: state.total,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Resposta do servidor:", data);

      if (data.qr_code_base64 && data.id) {
        setQrCode(data.qr_code_base64);
        setTicketUrl(data.ticket_url);
        setPixCode(data.qr_code);
        setPaymentId(data.id);

        toast.success("QR Code gerado com sucesso!");

        // ✅ Log para debug
        console.log(`💳 Pagamento criado: ${data.id}`);
        console.log(`📊 Status inicial: ${data.status}`);
      } else {
        throw new Error("Dados incompletos na resposta do servidor");
      }
    } catch (err) {
      console.error("❌ Erro ao finalizar compra:", err);
      toast.error(`Erro ao finalizar compra: ${err.message}`);

      // ✅ Reset states em caso de erro
      setQrCode(null);
      setTicketUrl(null);
      setPixCode(null);
      setPaymentId(null);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCodeToClipboard = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      toast.success("Código Pix copiado para a área de transferência!");
    }
  };

  if (!state.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeCart}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Carrinho
            {/* ✅ Debug info (remover em produção) */}
            {paymentId && (
              <span className="text-xs text-gray-500 block">
                ID: {paymentId.substring(0, 8)}...
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                        disabled={loading || checkingStatus}
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
                        disabled={loading || checkingStatus}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                        disabled={loading || checkingStatus}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.items.length > 0 && (
            <>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!user?.email || loading || checkingStatus}
                  required={!user?.email}
                />

                {/* ✅ Status do pagamento visível */}
                {paymentId && (
                  <div className="mt-2 text-sm">
                    {checkingStatus ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Aguardando confirmação do pagamento...
                      </div>
                    ) : (
                      <div className="text-green-600">
                        ✅ QR Code gerado! Aguardando pagamento...
                      </div>
                    )}
                  </div>
                )}

                <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded shadow-sm">
                  <strong className="block font-semibold mb-1">Atenção:</strong>
                  {!paymentId ? (
                    <>
                      Ao clicar em{" "}
                      <span className="font-semibold">Finalizar Compra</span>, o
                      QR Code pode levar alguns minutos para ser gerado.
                      <br />
                      Por favor, aguarde até que ele apareça.
                    </>
                  ) : (
                    <>
                      Após realizar o pagamento do PIX, você será redirecionado
                      automaticamente para a página de download.
                    </>
                  )}
                </div>
              </div>

              {/* ✅ Botão com estados mais claros */}
              <button
                onClick={finalizePurchase}
                disabled={loading || checkingStatus || !!paymentId}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Gerando Pix..."
                  : checkingStatus
                  ? "Aguardando confirmação..."
                  : paymentId
                  ? "QR Code gerado ✓"
                  : "Finalizar Compra"}
              </button>

              {/* ✅ QR Code com melhor feedback */}
              {qrCode && (
                <div className="mt-6 text-center border-t pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">
                      💳 Pagamento PIX
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Escaneie o QR Code abaixo ou copie o código PIX:
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img
                      src={`data:image/png;base64,${qrCode}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={copyPixCodeToClipboard}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      📋 Copiar código PIX
                    </button>

                    {ticketUrl && (
                      <a
                        href={ticketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-center"
                      >
                        🔗 Abrir no Mercado Pago
                      </a>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    💡 Após o pagamento, você será redirecionado automaticamente
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {state.items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(state.total)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

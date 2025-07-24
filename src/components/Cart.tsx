<<<<<<< HEAD
// Cart.tsx - CORREÇÃO DO ERRO SUBSTRING
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

  // ✅ CORRIGIDO: Função para validar se é string antes de usar substring
  const safeSubstring = (value: any, start: number, end?: number): string => {
    if (typeof value === "string") {
      return end !== undefined
        ? value.substring(start, end)
        : value.substring(start);
    }
    if (value && typeof value === "object" && value.toString) {
      const str = value.toString();
      return end !== undefined
        ? str.substring(start, end)
        : str.substring(start);
    }
    return String(value || "").substring(start, end);
  };

  // ✅ CORRIGIDO: Função para converter valores para string segura
  const safeString = (value: any): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return value.toString();
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const checkPaymentStatusPoll = useCallback(async (id: string) => {
    try {
      console.log(`🔍 Verificando status do pagamento: ${safeString(id)}`);

      const res = await fetch(
        `https://servidor-loja-digital.onrender.com/status-pagamento/${encodeURIComponent(
          safeString(id)
        )}`
      );

      if (!res.ok) {
        console.error(`❌ Erro HTTP ${res.status}`);
        return null;
      }

      const statusData = await res.json();
      console.log(`📊 Status recebido:`, statusData);

      // ✅ CORRIGIDO: Valida e converte dados para strings seguras
      if (statusData && typeof statusData === "object") {
        return {
          ...statusData,
          status: safeString(statusData.status),
          paymentId: safeString(statusData.paymentId || id),
          customerEmail: safeString(statusData.customerEmail),
        };
      }

      return statusData;
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!paymentId) return;

    const safePaymentId = safeString(paymentId);
    console.log(`🚀 Iniciando polling para pagamento: ${safePaymentId}`);
    setCheckingStatus(true);

    let intervalId: NodeJS.Timeout;
    let isActive = true;

    const startPolling = async () => {
      const initialStatus = await checkPaymentStatusPoll(safePaymentId);

      if (!isActive) return;

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
            navigate(`/pagamento/${encodeURIComponent(safePaymentId)}`);
          }
        }, 2000);
        return;
      }

      intervalId = setInterval(async () => {
        if (!isActive) {
          clearInterval(intervalId);
          return;
        }

        const statusData = await checkPaymentStatusPoll(safePaymentId);

        if (!statusData) return;

        const statusString = safeString(statusData.status);
        console.log(`📈 Status atual: ${statusString}`);

        if (statusString === "approved") {
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
              navigate(`/pagamento/${encodeURIComponent(safePaymentId)}`);
            }
          }, 2000);
        } else if (statusString === "rejected" || statusString === "expired") {
          clearInterval(intervalId);
          setCheckingStatus(false);

          Swal.fire({
            icon: "error",
            title: "Pagamento não aprovado",
            text: `Status: ${statusString}`,
            toast: true,
            position: "top-end",
            timer: 5000,
            showConfirmButton: false,
          });
        }
      }, 3000);
    };

    startPolling();

    return () => {
      console.log(`🧹 Limpando polling para: ${safePaymentId}`);
      isActive = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      setCheckingStatus(false);
    };
  }, [paymentId, navigate, checkPaymentStatusPoll]);

  const closeCart = () => {
    dispatch({ type: "CLOSE_CART" });
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
    const numPrice =
      typeof price === "number" ? price : parseFloat(safeString(price)) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const validateEmail = (email: string) => {
    const emailString = safeString(email).trim();
    return /\S+@\S+\.\S+/.test(emailString);
  };

  // ✅ CORRIGIDO: Processa total de forma segura
  const processTotal = (total: any): number => {
    if (typeof total === "number") return total;
    if (typeof total === "string") {
      // Remove formatação de moeda brasileira
      const cleanString = total.replace(/[R$\s\.]/g, "").replace(",", ".");
      const parsed = parseFloat(cleanString);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const finalizePurchase = async () => {
    const emailString = safeString(email).trim();

    if (!validateEmail(emailString)) {
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

    if (!state.items || state.items.length === 0) {
      toast.error("Carrinho está vazio!");
      return;
    }

    setLoading(true);

    try {
      // ✅ CORRIGIDO: Processa dados do carrinho de forma segura
      const carrinhoSeguro = state.items.map((item) => ({
        product: {
          id: safeString(item.product.id),
          name: safeString(item.product.name),
          price:
            typeof item.product.price === "number"
              ? item.product.price
              : parseFloat(safeString(item.product.price)) || 0,
          image: safeString(item.product.image || ""),
        },
        quantity:
          typeof item.quantity === "number"
            ? item.quantity
            : parseInt(safeString(item.quantity)) || 1,
      }));

      const nomeCliente = safeString(
        user?.email || user?.name || emailString || "Cliente"
      );
      const totalSeguro = processTotal(state.total);

      console.log("🛒 Enviando dados seguros do carrinho:", {
        carrinho: carrinhoSeguro,
        nomeCliente,
        email: emailString,
        total: totalSeguro,
      });

      const response = await fetch(
        "https://servidor-loja-digital.onrender.com/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrinho: carrinhoSeguro,
            nomeCliente,
            email: emailString,
            total: totalSeguro,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          safeString(errorData.error) || `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      console.log("✅ Resposta do servidor:", data);

      // ✅ CORRIGIDO: Processa resposta de forma segura
      const responseId = safeString(data.id);
      const responseQrCode = safeString(data.qr_code_base64);
      const responseTicketUrl = safeString(data.ticket_url);
      const responsePixCode = safeString(data.qr_code);

      if (responseQrCode && responseId) {
        setQrCode(responseQrCode);
        setTicketUrl(responseTicketUrl || null);
        setPixCode(responsePixCode || null);
        setPaymentId(responseId);

        toast.success("QR Code gerado com sucesso!");

        console.log(`💳 Pagamento criado: ${responseId}`);
        console.log(`📊 Status inicial: ${safeString(data.status)}`);
      } else {
        throw new Error("Dados incompletos na resposta do servidor");
      }
    } catch (err: any) {
      const errorMessage = safeString(
        err?.message || err || "Erro desconhecido"
      );
      console.error("❌ Erro ao finalizar compra:", errorMessage);
      toast.error(`Erro ao finalizar compra: ${errorMessage}`);

      setQrCode(null);
      setTicketUrl(null);
      setPixCode(null);
      setPaymentId(null);
    } finally {
      setLoading(false);
    }
  };

  const copyPixCodeToClipboard = () => {
    const pixCodeString = safeString(pixCode);
    if (pixCodeString) {
      navigator.clipboard.writeText(pixCodeString);
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
            {paymentId && (
              <span className="text-xs text-gray-500 block">
                ID: {safeSubstring(safeString(paymentId), 0, 8)}...
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
          {!state.items || state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="h-16 w-16 mb-4" />
              <p>Seu carrinho está vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div
                  key={safeString(item.product.id)}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <img
                    src={safeString(item.product.image)}
                    alt={safeString(item.product.name)}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-image.png";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {safeString(item.product.name)}
                    </h3>
                    <p className="text-blue-600 font-semibold">
                      {formatPrice(item.product.price)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            safeString(item.product.id),
                            (item.quantity || 1) - 1
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                        disabled={loading || checkingStatus}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-2 py-1 bg-white rounded text-sm">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            safeString(item.product.id),
                            (item.quantity || 1) + 1
                          )
                        }
                        className="p-1 hover:bg-gray-200 rounded"
                        disabled={loading || checkingStatus}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(safeString(item.product.id))}
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

          {state.items && state.items.length > 0 && (
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
                  value={safeString(email)}
                  onChange={(e) => setEmail(safeString(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!user?.email || loading || checkingStatus}
                  required={!user?.email}
                />

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
                      src={`data:image/png;base64,${safeString(qrCode)}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 mx-auto"
                      onError={(e) => {
                        console.error("Erro ao carregar QR Code");
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
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
                        href={safeString(ticketUrl)}
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

        {state.items && state.items.length > 0 && (
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
=======
import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  total: number;
}

export const Cart: React.FC<CartProps> = ({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  total
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Carrinho</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.nome}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.product.nome}
                      </h3>
                      <p className="text-indigo-600 font-bold">
                        {formatPrice(item.product.preco)}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-2 hover:bg-red-100 text-red-500 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPrice(total)}
                </span>
              </div>
              
              <button
                onClick={onCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag, Copy } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hook/useUser"; // Corrigido para useAuth
import { supabase } from "../supabaseClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const Cart: React.FC = () => {
  const { state, dispatch } = useCart();
  const { user, isAuthenticated } = useAuth(); // Usando useAuth corretamente

  const [email, setEmail] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [ticketUrl, setTicketUrl] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Preenche email com o email do usuário logado, se existir
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    } else {
      setEmail("");
    }
  }, [user]);

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

  const createOrGetCustomer = async (email: string, name: string) => {
    // Primeiro, tenta buscar cliente existente
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingCustomer) {
      return existingCustomer;
    }

    // Se não existe, cria novo cliente
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        email,
        name: name || 'Cliente'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newCustomer;
  };

  const createOrder = async (customerId: string, items: any[], total: number) => {
    // Cria o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        total_amount: total,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Cria os itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw itemsError;
    }

    return order;
  };

  const finalizePurchase = async () => {
    if (!validateEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "🚫 E-mail inválido!",
        text: "Por favor, insira um e-mail válido ou faça login para receber o link de download.",
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

    setLoading(true);
    try {
      // 1. Criar ou buscar cliente
      const customer = await createOrGetCustomer(
        email, 
        user?.user_metadata?.name || user?.email?.split('@')[0] || 'Cliente'
      );

      // 2. Criar pedido no Supabase
      const order = await createOrder(customer.id, state.items, state.total);

      // 3. Criar pagamento no Mercado Pago
      const paymentResponse = await fetch(
        "https://servidor-loja-digital.onrender.com/criar-pagamento",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carrinho: state.items,
            nomeCliente: customer.name,
            email: customer.email,
            total: state.total,
            orderId: order.id, // Passa o ID do pedido
          }),
        }
      );

      if (!paymentResponse.ok) {
        throw new Error("Erro na requisição de pagamento");
      }

      const paymentData = await paymentResponse.json();

      // 4. Atualizar pedido com ID do pagamento do Mercado Pago
      if (paymentData.payment_id) {
        await supabase
          .from('orders')
          .update({ 
            mercadopago_payment_id: paymentData.payment_id 
          })
          .eq('id', order.id);
      }

      // 5. Mostrar QR Code
      if (paymentData.qr_code_base64) {
        setQrCode(paymentData.qr_code_base64);
        setTicketUrl(paymentData.ticket_url);
        setPixCode(paymentData.qr_code);
        
        // Limpa o carrinho após sucesso
        dispatch({ type: "CLEAR_CART" });
        
        toast.success("Pedido criado com sucesso! Complete o pagamento.");
      } else {
        throw new Error("QR Code não foi gerado");
      }

    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      
      Swal.fire({
        icon: "error",
        title: "Erro ao finalizar compra",
        text: error instanceof Error ? error.message : "Erro desconhecido",
        confirmButtonText: "OK"
      });
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

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Carrinho</h2>
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

            {state.items.length > 0 && (
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
                  disabled={isAuthenticated && !!user?.email}
                  required={!isAuthenticated}
                />
                {isAuthenticated && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Usando email da conta logada
                  </p>
                )}
                <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded shadow-sm">
                  <strong className="block font-semibold mb-1">Atenção:</strong>
                  Ao clicar em{" "}
                  <span className="font-semibold">Finalizar Compra</span>, o QR
                  Code pode levar alguns minutos para ser gerado.
                  <br />
                  Por favor, aguarde até que ele apareça.
                </div>
              </div>
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
              <button
                onClick={finalizePurchase}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Processando..." : "Finalizar Compra"}
              </button>
            </div>
          )}
        </div>
      </div>

      {qrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              onClick={() => setQrCode(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Escaneie para pagar com Pix
            </h2>
            <img
              src={`data:image/png;base64,${qrCode}`}
              alt="QR Code Pix"
              className="mx-auto mb-4"
            />
            {ticketUrl && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm mb-4 block"
              >
                Abrir no app do banco
              </a>
            )}

            {pixCode && (
              <button
                onClick={copyPixCodeToClipboard}
                className="flex items-center justify-center mx-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition"
              >
                <Copy className="mr-2 h-4 w-4" /> Copiar código Pix
              </button>
            )}
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
              <p>✅ Após o pagamento, você receberá um email com os links de download</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
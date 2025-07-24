import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Cart } from "./components/Cart";
import Hero from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { CheckoutForm } from "./components/CheckoutForm";
import { PaymentStatus } from "./components/PaymentStatus";
import { useCart } from "./hooks/useCart";
import { useState } from "react";
import { api } from "./services/api";
import { PaymentData } from "./types";
import { Home } from "lucide-react";
import Sites from "./pages/Sites";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { WhatsAppButton } from "./components/WhatsAppButton";




function AppContent() {
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();

  const handlePaymentSubmit = async (customerData: {
    nomeCliente: string;
    email: string;
  }) => {
    setIsProcessingPayment(true);
    try {
      const payment = await api.createPayment({
        carrinho: items,
        nomeCliente: customerData.nomeCliente,
        email: customerData.email,
        total: getTotal(),
      });
      setPaymentData(payment);
      navigate("/pagamento");
    } catch (error) {
      alert("Erro ao processar pagamento.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={getItemCount()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />

                {
                  <ProductGrid
                    onAddToCart={addToCart}
                    itemsPerPage={3}
                    showPagination={false}
                  />
                }
              </>
            }
          />

          <Route
            path="/produtos"
            element={<ProductGrid onAddToCart={addToCart} itemsPerPage={8} />}
          />

          <Route
            path="/checkout"
            element={
              <CheckoutForm
                items={items}
                total={getTotal()}
                onSubmit={handlePaymentSubmit}
                isLoading={isProcessingPayment}
              />
            }
          />

          <Route
            path="/pagamento"
            element={
              paymentData ? (
                <PaymentStatus
                  paymentData={paymentData}
                  onBack={() => {
                    setPaymentData(null);
                    clearCart();
                    navigate("/");
                  }}
                />
              ) : (
                <p>Pagamento não encontrado.</p>
              )
            }
          />
          <Route path="/" element={<Home />} />
          <Route path="/meu-site" element={<Sites />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          
        </Routes>
        <WhatsAppButton />
      </main>

      <Cart
        items={items}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          navigate("/checkout");
        }}
        total={getTotal()}
      />
      
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Footer />
      
    </Router>
  );
}

export default App;

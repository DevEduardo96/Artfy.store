import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Cart } from "./components/Cart";
import Hero from "./components/Hero";
import SupabaseProductGrid from "./components/SupabaseProductGrid";
import { SupabaseProductDetail } from "./components/SupabaseProductDetail";
import { CheckoutForm } from "./components/CheckoutForm";
import { PaymentStatus } from "./components/PaymentStatus";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useCart } from "./hooks/useCart";
import { useState } from "react";
import { api } from "./services/api";
import { PaymentData } from "./types";
import type { Product } from "./lib/supabase";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Favorites } from "./pages/Favorites";
import Sites from "./pages/Sites";
import Suporte from "./pages/Suporte";
import Sobre from "./pages/Sobre";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { WhatsAppButton } from "./components/WhatsAppButton";
import ScrollToTop from "./components/ScrollToTo";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

function AppContent() {
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Product detail states
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [showProductDetails, setShowProductDetails] = useState(false);

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

  // Product detail functions
  const handleShowProductDetails = (product: Product) => {
    setSelectedProductId(product.id);
    setShowProductDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowProductDetails(false);
    setSelectedProductId(null);
  };

  // Show product details if selected
  if (showProductDetails && selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          cartItemCount={getItemCount()}
          onCartClick={() => setIsCartOpen(true)}
        />
        <SupabaseProductDetail
          productId={selectedProductId}
          onBack={handleBackFromDetails}
          onAddToCart={addToCart}
        />
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
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartItemCount={getItemCount()}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="pb-8">
        <ScrollToTop />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <SupabaseProductGrid
                    onAddToCart={addToCart}
                    onProductClick={handleShowProductDetails}
                    showFilter={false}
                  />
                </div>
              </>
            }
          />

          <Route
            path="/produtos"
            element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <SupabaseProductGrid
                  onAddToCart={addToCart}
                  onProductClick={handleShowProductDetails}
                />
              </div>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites
                  onAddToCart={addToCart}
                  onProductClick={handleShowProductDetails}
                />
              </ProtectedRoute>
            }
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
      <AuthProvider>
        <FavoritesProvider>
          <AppContent />
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

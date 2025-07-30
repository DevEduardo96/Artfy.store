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
import { useState, createContext, useContext } from "react";
import { api } from "./services/api";
import type { Product, PaymentData } from "./types"; // Assuming types are defined here
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
import toast from "react-hot-toast";

// Payment Data Context
const PaymentDataContext = createContext<{
  paymentData: PaymentData | null;
  setPaymentData: (data: PaymentData | null) => void;
}>({ paymentData: null, setPaymentData: () => {} });

function AppContent() {
  const navigate = useNavigate();
  const {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const { paymentData, setPaymentData } = useContext(PaymentDataContext);

  const handleShowProductDetails = (product: Product) => {
    setSelectedProductId(product.id);
    setShowProductDetails(true);
  };

  const handleBackFromDetails = () => {
    setShowProductDetails(false);
    setSelectedProductId(null);
  };

  const handlePaymentSubmit = async (customerData: {
    nomeCliente: string;
    email: string;
  }) => {
    setIsProcessingPayment(true);
    try {
      const payment = await api.createPayment({
        carrinho: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity
        })),
        nomeCliente: customerData.nomeCliente,
        email: customerData.email,
        total: getTotal(),
      });
      setPaymentData(payment);
      navigate("/pagamento");
    } catch (error: any) {
      toast.error(error.message || "Erro ao processar pagamento.");
    } finally {
      setIsProcessingPayment(false);
    }
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
                <p>Pagamento não encontrado. Redirecionando...</p>
              )
            }
          />{" "}
          {/* Redirect if paymentData is null */}
          <Route path="/meu-site" element={<Sites />} />
          <Route path="/suporte" element={<Suporte />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/terms" element={<TermsOfService />} />
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
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <PaymentDataContext.Provider value={{ paymentData, setPaymentData }}>
            <AppContent />
          </PaymentDataContext.Provider>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: { background: "#363636", color: "#fff" },
            }}
          />
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

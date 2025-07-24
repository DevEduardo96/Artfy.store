<<<<<<< HEAD
// src/App.tsx

import { useState, useMemo, useEffect } from "react";
=======
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
import {
  BrowserRouter as Router,
  Routes,
  Route,
<<<<<<< HEAD
  Navigate,
} from "react-router-dom";
import PagamentoPage from "./pages/PaymentStatusPage";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SupportPage from "./components/SupportPage";
import EbooksPage from "./pages/EbooksPage";
import LoginPage from "./components/LoginPage";
import CategoryFilter from "./components/CategoryFilter";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { UserProvider } from "./context/UserContext";
import { products } from "./data/products";
import FavoritesPage from "./components/FavoritesPage";
import SitesPage from "./pages/SitesPage";
import ProdutosPage from "./pages/ProductsPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return uniqueCategories;
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    Swal.fire({
      title: "Seja Bem-vindo(a)! 👋",
      text: "Explore nossos produtos digitais incríveis!",
      icon: "info",
      showConfirmButton: false,
      timer: 3000,
      toast: true,
      position: "top-end",
      timerProgressBar: true,
    });
  }, []);

  return (
    <UserProvider>
      <CartProvider>
        <FavoritesProvider>
          <Router>
            <Header />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <main className="container mx-auto px-4 py-12">
                      <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                      />
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                      </div>
                      {filteredProducts.length === 0 && (
                        <div className="text-center py-12">
                          <p className="text-gray-500 text-lg">
                            Nenhum produto encontrado nesta categoria.
                          </p>
                        </div>
                      )}
                    </main>
                    <Footer />
                  </>
                }
              />
              <Route path="/pagamento/:id" element={<PagamentoPage />} />
              <Route path="/sobre" element={<AboutUs />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/suporte" element={<SupportPage />} />
              <Route
                path="/ebooks"
                element={<EbooksPage products={products} />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route
                path="/sites"
                element={<SitesPage products={products} />}
              />
            </Routes>
            <Cart />
          </Router>
        </FavoritesProvider>
      </CartProvider>
    </UserProvider>
=======
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
          <Route path="/footer" element={<Footer />} />
        </Routes>
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
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
  );
}

export default App;

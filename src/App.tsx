import { useState, useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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
import { AuthProvider } from "./components/AuthProvider";

import { fetchProducts } from "./data/products";
import { Product } from "./types";
import FavoritesPage from "./components/FavoritesPage";
import SitesPage from "./pages/SitesPage";
import ResetPassword from "./components/ResetPassword";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import PaymentStatusPage from "./pages/PaymentStatusPage";

import "sweetalert2/dist/sweetalert2.min.css";
import ProductsPageContent from "./pages/ProductsPageContent";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await fetchProducts();
        console.log("🏠 Produtos carregados na Home:", fetchedProducts.length);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") return products;
    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory, products]);

  return (
    <AuthProvider>
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
                      {loading ? (
                        <main className="container mx-auto px-4 py-12">
                          {/* Skeleton loaders */}
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                              >
                                <div className="bg-gray-300 h-48 w-full"></div>
                                <div className="p-5">
                                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                                  <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
                                  <div className="flex justify-between items-center">
                                    <div className="h-6 bg-gray-300 rounded w-20"></div>
                                    <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </main>
                      ) : (
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
                      )}
                      <Footer />
                    </>
                  }
                />

                {/* Rota única para status do pagamento */}
                <Route
                  path="/payment-status/:paymentId"
                  element={<PaymentStatusPage />}
                />

                {/* Outras rotas normais */}
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/sobre" element={<AboutUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/produtos" element={<ProductsPageContent />} />
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
                <Route
                  path="/reset-password"
                  element={
                    <ResetPassword
                      onFinish={() => (window.location.href = "/login")}
                    />
                  }
                />
                {/* Rota catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Cart />
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

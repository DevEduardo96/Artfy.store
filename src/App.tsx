// src/App.tsx

import { useState, useMemo } from "react";
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
import { AuthProvider } from "./components/AuthProvider"; // ✅ IMPORTADO

import { products } from "./data/products";
import FavoritesPage from "./components/FavoritesPage";
import SitesPage from "./pages/SitesPage";
import ResetPassword from "./components/ResetPassword";
import ProdutosPage from "./pages/ProductsPage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import PaymentStatusPage from "./pages/PaymentStatusPage";

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

  return (
    <AuthProvider> {/* ✅ ENVOLVE TUDO */}
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
                <Route path="/pagamento/:id" element={<PaymentStatusPage />} />
                <Route path="/terms" element={<TermsOfService />} />
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
                <Route
                  path="/reset-password"
                  element={
                    <ResetPassword
                      onFinish={() => (window.location.href = "/login")}
                    />
                  }
                />
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

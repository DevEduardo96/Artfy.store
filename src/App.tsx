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
import { products } from "./data/products";
import FavoritesPage from "./components/FavoritesPage";
import SitesPage from "./pages/SitesPage";
import ResetPassword from "./components/ResetPassword";
import UserProfile from "./pages/UserProfile";
import { supabase } from "./supabaseClient";

import ProdutosPage from "./pages/ProductsPage"; // IMPORTAR sua página produtos (corrija o nome se precisar)

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [user, setUser] = useState<any>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowUserProfile(false);
  };

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

  if (showUserProfile && user) {
    return (
      <UserProfile
        user={user}
        onLogout={handleLogout}
        onBack={() => setShowUserProfile(false)}
      />
    );
  }

  return (
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

            <Route path="/produtos" element={<ProdutosPage />} />

            <Route path="/suporte" element={<SupportPage />} />

            <Route
              path="/ebooks"
              element={<EbooksPage products={products} />}
            />

            <Route path="/login" element={<LoginPage />} />

            <Route path="/favorites" element={<FavoritesPage />} />

            <Route path="/sites" element={<SitesPage products={products} />} />

            <Route
              path="/reset-password"
              element={
                <ResetPassword
                  onFinish={() => (window.location.href = "/login")}
                />
              }
            />

            {/* Redireciona qualquer rota desconhecida para a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Cart />
        </Router>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;

import { useState, useMemo } from "react";
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
import { FavoritesProvider } from "./context/FavoritesContext"; // Importar aqui
import { products } from "./data/products";
import FavoritesPage from "./components/FavoritesPage";

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [currentPage, setCurrentPage] = useState("home");

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return uniqueCategories;
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todos") {
      return products;
    }
    return products.filter((product) => product.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-gray-50">
          <Header currentPage={currentPage} onPageChange={setCurrentPage} />

          {currentPage === "home" ? (
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
          ) : currentPage === "support" ? (
            <SupportPage />
          ) : currentPage === "ebooks" ? (
            <EbooksPage products={products} />
          ) : currentPage === "login" ? (
            <LoginPage onClose={() => setCurrentPage("home")} />
          ) : currentPage === "favorites" ? ( // ⬅️ Aqui está o novo caso
            <FavoritesPage />
          ) : null}

          <Cart />
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}

export default App;

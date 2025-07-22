import React, { useEffect, useState, useMemo } from "react";
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { fetchProducts, invalidateProductsCache } from "../data/products";
import { useFavorites } from "../context/FavoritesContext";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

const ProductsPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { dispatch } = useCart();

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "cursos", name: "Cursos" },
    { id: "ebooks", name: "E-books" },
    { id: "templates", name: "Templates" },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const fetchedProducts = await fetchProducts();
        console.log('📊 Produtos carregados:', fetchedProducts.length);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setError("Erro ao carregar produtos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    return products.filter((product) => {
      if (!product || !product.name || !product.category) {
        return false;
      }

      const matchesCategory = selectedCategory === "todos" || 
        product.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    invalidateProductsCache();
    
    try {
      const fetchedProducts = await fetchProducts();
      console.log('🔄 Produtos atualizados:', fetchedProducts.length);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Erro ao atualizar produtos:", error);
      setError("Erro ao atualizar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    try {
      return new Intl.NumberFormat("pt-BR", { 
        style: "currency", 
        currency: "BRL" 
      }).format(price || 0);
    } catch (error) {
      console.error("Erro ao formatar preço:", price, error);
      return "R$ 0,00";
    }
  };

  const handleAddToCart = (product: Product) => {
    try {
      if (!product || !product.id) {
        console.error("Produto inválido para adicionar ao carrinho:", product);
        return;
      }
      dispatch({ type: "ADD_ITEM", payload: product });
      dispatch({ type: "OPEN_CART" });
    } catch (error) {
      console.error("Erro ao adicionar produto ao carrinho:", error);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      if (!product) {
        console.error("Product is null/undefined:", product);
        return;
      }

      if (!product.id) {
        console.error("Product has no ID:", product);
        return;
      }

      if (!product.name) {
        console.error("Product has no name:", product);
        return;
      }

      toggleFavorite(product);
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
    }
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden relative animate-pulse">
      <div className="bg-gray-300 h-48 w-full rounded-t-xl mb-3"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div>
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 bg-gray-300 rounded w-20 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-12"></div>
          </div>
          <div className="h-10 w-28 bg-gray-300 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg flex-1 md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={refreshProducts}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Atualizar produtos"
          >
            {loading ? "..." : "🔄"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button
            onClick={refreshProducts}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredProducts.map((product) => {
              if (!product || !product.id || !product.name) {
                return null;
              }

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden relative cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder-image.jpg"}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.jpg";
                      }}
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                        {product.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => handleToggleFavorite(e, product)}
                      aria-label={
                        isFavorite(product.id)
                          ? `Remover ${product.name} dos favoritos`
                          : `Adicionar ${product.name} aos favoritos`
                      }
                      className={`absolute top-2 right-2 p-2 rounded-full shadow-md bg-white text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500`}
                      type="button"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorite(product.id) ? "fill-red-500 text-red-500" : "stroke-current"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-blue-600 font-bold uppercase">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-semibold mt-1 mb-2 line-clamp-2 min-h-[3.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center text-yellow-400 text-sm mb-2">
                      <Star className="w-4 h-4" />
                      <span className="ml-1">{product.rating}</span>
                      <span className="ml-2 text-gray-400">({product.reviews})</span>
                    </div>

                    <div className="flex items-center text-sm mb-4 text-gray-500">
                      <Download className="w-4 h-4 mr-1" />
                      <span>
                        {product.fileSize} • {product.format}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                        type="button"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Comprar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {!loading && filteredProducts.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhum produto encontrado para os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductsPageContent;
import React, { useEffect, useState } from "react";
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useFavorites, Product } from "../context/FavoritesContext"; // Importar Product do contexto
import { useCart } from "../context/CartContext";

// Remover a definição local de Product já que agora importamos do contexto

const ProductsPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { dispatch } = useCart();

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "cursos", name: "Cursos" },
    { id: "ebooks", name: "E-books" },
    { id: "templates", name: "Templates" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from("produtos").select("*").order("nome");

        if (error) {
          console.error("Erro ao buscar produtos:", error.message);
          setLoading(false);
          return;
        }

        if (data) {
          const mapped = data
            .filter((item: any) => item && item.nome) // Filtra itens inválidos
            .map((item: any) => ({
              id: item.id || "",
              name: String(item.nome || ""),
              category: String(item.categoria || ""),
              price: Number(item.preco) || 0,
              originalPrice: item.preco_original ? Number(item.preco_original) : null,
              rating: Number(item.avaliacao) || 0,
              reviews: Number(item.qtd_avaliacoes) || 0,
              image: String(item.imagem || ""),
              badge: item.desconto ? `${item.desconto}% OFF` : null,
              description: String(item.descricao || ""),
              popularity: Number(item.avaliacao) || 0,
              fileSize: String(item.tamanho || ""),
              format: String(item.formato || ""),
            }));
          setProducts(mapped);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtro mais robusto para evitar erros - DEBUG VERSION
  console.log("=== DEBUG FILTER START ===");
  console.log("Products array:", products);
  console.log("Products length:", products?.length);
  console.log("Selected category:", selectedCategory);
  console.log("Search term:", searchTerm);
  
  const filteredProducts = (() => {
    if (!products || !Array.isArray(products)) {
      console.error("Products is not a valid array:", products);
      return [];
    }

    console.log("Filtering products...");
    
    const filtered = [];
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i}:`, product);
      
      // Verificações de segurança muito detalhadas
      if (!product) {
        console.warn(`Product ${i} is null/undefined:`, product);
        continue;
      }
      
      if (typeof product !== 'object') {
        console.warn(`Product ${i} is not an object:`, typeof product, product);
        continue;
      }
      
      if (!product.hasOwnProperty('name') || product.name === null || product.name === undefined) {
        console.warn(`Product ${i} has invalid name:`, product.name, product);
        continue;
      }
      
      if (typeof product.name !== 'string') {
        console.warn(`Product ${i} name is not a string:`, typeof product.name, product.name, product);
        continue;
      }
      
      if (!product.hasOwnProperty('category') || product.category === null || product.category === undefined) {
        console.warn(`Product ${i} has invalid category:`, product.category, product);
        continue;
      }

      try {
        const matchesCategory = selectedCategory === "todos" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (matchesCategory && matchesSearch) {
          filtered.push(product);
          console.log(`Product ${i} passed filter:`, product.name);
        }
      } catch (error) {
        console.error(`Error filtering product ${i}:`, product, error);
      }
    }
    
    console.log("Filtered products result:", filtered);
    console.log("=== DEBUG FILTER END ===");
    return filtered;
  })();

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
    
    console.log("=== HANDLE TOGGLE FAVORITE DEBUG ===");
    console.log("Product received:", product);
    console.log("Product type:", typeof product);
    console.log("Product keys:", product ? Object.keys(product) : "No keys - product is falsy");
    
    try {
      if (!product) {
        console.error("Product is null/undefined:", product);
        return;
      }
      
      if (typeof product !== 'object') {
        console.error("Product is not an object:", typeof product, product);
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
      
      console.log("ProductCard: Toggling favorite for", product.name);
      console.log("Current products state before toggle:", products);
      
      toggleFavorite(product);
      
      // Log após um pequeno delay para ver o que aconteceu
      setTimeout(() => {
        console.log("Products state after toggle (delayed):", products);
      }, 100);
      
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      console.error("Error stack:", error.stack);
    }
    
    console.log("=== END TOGGLE FAVORITE DEBUG ===");
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
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/3 mb-2 md:mb-0"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded-md w-full md:w-1/4"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filteredProducts.map((product) => {
              // Verificação adicional antes de renderizar cada produto
              if (!product || !product.id || !product.name) {
                console.warn("Produto inválido ignorado na renderização:", product);
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
                    <h3 className="text-lg font-semibold mt-1 mb-2 line-clamp-2">
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
    </div>
  );
};

export default ProductsPageContent;
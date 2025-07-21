import React, { useEffect, useState } from "react";
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  description: string;
  popularity: number;
  fileSize: string;
  format: string;
}

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
      const { data, error } = await supabase.from("produtos").select("*").order("nome");

      if (error) {
        console.error("Erro ao buscar produtos:", error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.nome ?? "",
          category: item.categoria ?? "",
          price: item.preco,
          originalPrice: item.preco_original,
          rating: item.avaliacao,
          reviews: item.qtd_avaliacoes,
          image: item.imagem,
          badge: item.desconto ? `${item.desconto}% OFF` : null,
          description: item.descricao ?? "",
          popularity: item.avaliacao || 0,
          fileSize: item.tamanho ?? "",
          format: item.formato ?? "",
        }));
        setProducts(mapped);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      (selectedCategory === "todos" || product.category === selectedCategory) &&
      (product.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };

  const handleAddToCart = (product: Product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    dispatch({ type: "OPEN_CART" });
  };

  const handleToggleFavorite = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden relative animate-pulse">
      <div className="bg-gray-300 h-48 w-full rounded-t-xl mb-3"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div> {/* categoria */}
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div> {/* nome */}
        <div className="h-4 bg-gray-300 rounded w-full mb-3"></div> {/* descrição */}
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div> {/* avaliações */}
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-3"></div> {/* info fileSize e format */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 bg-gray-300 rounded w-20 mb-1"></div> {/* preço */}
            <div className="h-4 bg-gray-300 rounded w-12"></div> {/* preço original */}
          </div>
          <div className="h-10 w-28 bg-gray-300 rounded-lg"></div> {/* botão */}
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
          : filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden relative cursor-pointer group"
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <span className="text-xs text-blue-600 font-bold uppercase">{product.category}</span>
                  <h3 className="text-lg font-semibold mt-1 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>

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
                      <span className="text-2xl font-bold text-gray-800">{formatPrice(product.price)}</span>
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
            ))}
      </div>
    </div>
  );
};

export default ProductsPageContent;

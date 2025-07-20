import React, { useEffect, useState } from "react";
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { supabase } from "../supabaseClient";

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

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "cursos", name: "Cursos" },
    { id: "ebooks", name: "E-books" },
    { id: "templates", name: "Templates" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Erro ao buscar produtos:", error.message);
        return;
      }

      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          category: item.categoria,
          price: item.preco,
          originalPrice: item.preco_original,
          rating: item.avaliacao,
          reviews: item.qtd_avaliacoes,
          image: item.imagem,
          badge: item.desconto ? `${item.desconto}% OFF` : null,
          description: item.descricao,
          popularity: item.avaliacao || 0,
          fileSize: item.tamanho,
          format: item.formato,
        }));
        setProducts(mapped);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "todos" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-xl overflow-hidden"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.badge && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {product.badge}
                </span>
              )}
              <button className="absolute top-2 right-2 text-white">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <span className="text-xs text-blue-600 font-bold uppercase">
                {product.category}
              </span>
              <h3 className="text-lg font-semibold mt-1">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.description}</p>
              <div className="flex items-center text-yellow-500 text-sm mt-2">
                <Star className="w-4 h-4" />
                <span className="ml-1">{product.rating}</span>
                <span className="ml-2 text-gray-400">({product.reviews})</span>
              </div>
              <div className="flex items-center text-sm mt-2 text-gray-500">
                <Download className="w-4 h-4 mr-1" />
                <span>
                  {product.fileSize} • {product.format}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-lg font-bold text-gray-800">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-gray-400 line-through">
                    R$ {product.originalPrice.toFixed(2).replace(".", ",")}
                  </div>
                )}
              </div>
              <button className="mt-3 bg-purple-600 text-white w-full py-2 rounded-md flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Comprar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPageContent;

import React from "react";
import { ShoppingCart, Download, Star, Eye } from "lucide-react"; // Adicione Eye
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onShowDetails?: (product: Product) => void; // NOVA PROP OPCIONAL
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onShowDetails, // NOVA PROP
}) => {
  // Todas as funções existentes permanecem iguais...
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      Programação: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Templates: "bg-green-100 text-green-800",
      Marketing: "bg-orange-100 text-orange-800",
    };
    return (
      colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image}
          alt={product.nome}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          {product.category && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                product.category
              )}`}
            >
              {product.category}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center bg-white bg-opacity-90 rounded-full px-2 py-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium ml-1">4.8</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {product.nome}
        </h3>

        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Download className="w-4 h-4 mr-1" />
            <span>Download Digital</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {formatPrice(product.preco)}
          </div>
        </div>

        {/* NOVA SEÇÃO: Botões */}
        <div className="space-y-2">
          {/* Botão Ver Detalhes (só aparece se a função foi passada) */}
          {onShowDetails && (
            <button
              onClick={() => onShowDetails(product)}
              className="flex items-center justify-center space-x-2 w-full bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              <span>Ver Detalhes</span>
            </button>
          )}

          {/* Botão Adicionar ao Carrinho */}
          <button
            onClick={() => onAddToCart(product)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 w-full"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

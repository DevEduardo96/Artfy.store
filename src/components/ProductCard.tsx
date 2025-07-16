import React from "react";
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch: cartDispatch } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const addToCart = () => {
    cartDispatch({ type: "ADD_ITEM", payload: product });
    cartDispatch({ type: "OPEN_CART" });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const favorite = isFavorite(product.id);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => toggleFavorite(product)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            aria-label={
              favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                favorite
                  ? "fill-red-500 text-red-500"
                  : "stroke-current text-gray-600"
              }`}
            />
          </button>
        </div>
        {product.originalPrice && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-medium">
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )}
            % OFF
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-medium">
            {product.category}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviews})</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Download className="h-4 w-4" />
            <span>{product.fileSize}</span>
            <span>•</span>
            <span>{product.format}</span>
          </div>
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
            onClick={addToCart}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Comprar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

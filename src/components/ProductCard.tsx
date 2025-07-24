import React from "react";
<<<<<<< HEAD
import { Star, Download, Heart, ShoppingCart } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Verifica se o produto já está nos favorits
  const isProductFavorite = isFavorite(product.id);

  const addToCart = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    dispatch({ type: "OPEN_CART" });
  };

=======
import { ShoppingCart, Download, Star } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

<<<<<<< HEAD
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("ProductCard: Toggling favorite for", product.name);
    toggleFavorite(product);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={handleToggleFavorite}
          aria-label={
            isProductFavorite
              ? `Remover ${product.name} dos favoritos`
              : `Adicionar ${product.name} aos favoritos`
          }
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          type="button"
        >
          <Heart
            className={`h-5 w-5 ${
              isProductFavorite ? "fill-red-500 text-red-500" : "stroke-current"
            }`}
          />
        </button>
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
            type="button"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Comprar</span>
          </button>
        </div>
=======
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

        <button
          onClick={() => onAddToCart(product)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Adicionar ao Carrinho</span>
        </button>
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
      </div>
    </div>
  );
};
<<<<<<< HEAD

export default ProductCard;
=======
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)

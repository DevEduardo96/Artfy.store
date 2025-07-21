import React from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { Product } from "../types";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  product, 
  className = "text-red-500 text-xl hover:scale-110 transition" 
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isProductFavorite = isFavorite(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  return (
    <button
      onClick={handleToggle}
      className={className}
      title={isProductFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      type="button"
    >
      <Heart 
        className={`h-5 w-5 ${
          isProductFavorite ? "fill-red-500 text-red-500" : "stroke-current"
        }`} 
      />
    </button>
  );
};

export default FavoriteButton;
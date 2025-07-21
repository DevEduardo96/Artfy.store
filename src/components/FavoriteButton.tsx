import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";
import { Product } from "../context/FavoritesContext";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  product,
  className = "text-red-500 text-xl hover:scale-110 transition",
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);

  const isProductFavorite = isFavorite(product.id);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // evita cliques múltiplos rápidos

    setLoading(true);
    try {
      await toggleFavorite(product);
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={className}
      title={isProductFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      type="button"
      disabled={loading}
      aria-pressed={isProductFavorite}
      aria-label={isProductFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
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

// src/components/FavoriteButton.tsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "../hook/useUser";

interface FavoriteButtonProps {
  productId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId }) => {
  const user = useUser();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica se o produto já está favoritado
  useEffect(() => {
    const fetchFavorite = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      setIsFavorite(!!data);
    };

    fetchFavorite();
  }, [user, productId]);

  const toggleFavorite = async () => {
    if (!user || loading) return;
    setLoading(true);

    if (isFavorite) {
      // Remove dos favoritos
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      setIsFavorite(false);
    } else {
      // Adiciona aos favoritos
      await supabase.from("favorites").insert([
        {
          user_id: user.id,
          product_id: productId,
        },
      ]);
      setIsFavorite(true);
    }

    setLoading(false);
  };

  return (
    <button
      onClick={toggleFavorite}
      className="text-red-500 text-xl hover:scale-110 transition"
      disabled={loading || !user}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
};

export default FavoriteButton;

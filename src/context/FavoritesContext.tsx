import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "../types";
import { supabase } from "../supabaseClient";
import { useUser } from "../hook/useUser";

interface FavoritesState {
  items: Product[];
}

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: Product }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "CLEAR_FAVORITES" }
  | { type: "LOAD_FAVORITES"; payload: Product[] };

const FavoritesContext = createContext<{
  state: FavoritesState;
  dispatch: React.Dispatch<FavoritesAction>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => void;
} | null>(null);

const favoritesReducer = (
  state: FavoritesState,
  action: FavoritesAction
): FavoritesState => {
  switch (action.type) {
    case "ADD_FAVORITE":
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case "REMOVE_FAVORITE":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };

    case "CLEAR_FAVORITES":
      return { ...state, items: [] };

    case "LOAD_FAVORITES":
      return { ...state, items: action.payload };

    default:
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
  });

  const { user } = useUser() || {};

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      const { data: favData, error: favError } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (favError) {
        console.error("Erro ao carregar favoritos:", favError);
        return;
      }

      const productIds = favData?.map((f) => f.product_id) ?? [];

      if (productIds.length === 0) {
        dispatch({ type: "LOAD_FAVORITES", payload: [] });
        return;
      }

      // Busca detalhes dos produtos (certifique-se que a tabela products existe)
      const { data: products, error: prodError } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds);

      if (prodError) {
        console.error("Erro ao carregar produtos favoritos:", prodError);
        return;
      }

      dispatch({ type: "LOAD_FAVORITES", payload: products || [] });
    };

    loadFavorites();
  }, [user]);

  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.id === productId);
  };

  const toggleFavorite = async (product: Product) => {
    if (!user) return;

    if (isFavorite(product.id)) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);

      if (!error) {
        dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
      } else {
        console.error("Erro ao remover favorito:", error);
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: user.id, product_id: product.id }]);

      if (!error) {
        dispatch({ type: "ADD_FAVORITE", payload: product });
      } else {
        console.error("Erro ao adicionar favorito:", error);
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ state, dispatch, isFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

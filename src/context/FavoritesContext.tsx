// src/context/FavoritesContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Product } from "../types";
import { supabase } from "../supabaseClient";
import { products } from "../data/products";
import { useUser } from "./UserContext";

interface FavoritesState {
  items: Product[];
  loading: boolean;
}

type FavoritesAction =
  | { type: "ADD_FAVORITE"; payload: Product }
  | { type: "REMOVE_FAVORITE"; payload: string }
  | { type: "CLEAR_FAVORITES" }
  | { type: "LOAD_FAVORITES"; payload: Product[] }
  | { type: "SET_LOADING"; payload: boolean };

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
      if (state.items.some((item) => item.id === action.payload.id))
        return state;
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE_FAVORITE":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "CLEAR_FAVORITES":
      return { ...state, items: [] };
    case "LOAD_FAVORITES":
      return { ...state, items: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(favoritesReducer, {
    items: [],
    loading: false,
  });

  const user = useUser();
  const [isInitialized, setIsInitialized] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) return;

    dispatch({ type: "SET_LOADING", payload: true });
    console.log("Carregando favoritos para usuário:", user.id);

    try {
      const { data: favData, error: favError } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id);

      if (favError) {
        console.error("Erro ao carregar favoritos:", favError);
        return;
      }

      const productIds = favData?.map((f) => f.product_id) ?? [];
      const favoriteProducts = products.filter((p) =>
        productIds.includes(p.id)
      );

      dispatch({ type: "LOAD_FAVORITES", payload: favoriteProducts });
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [user]);

  useEffect(() => {
    if (user && isInitialized && !hasLoaded) {
      loadFavorites();
      setHasLoaded(true);
    }
  }, [user, isInitialized, hasLoaded, loadFavorites]);

  const isFavorite = useCallback(
    (productId: string) => state.items.some((item) => item.id === productId),
    [state.items]
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      if (!user) {
        alert("Você precisa estar logado para adicionar favoritos.");
        return;
      }

      try {
        if (isFavorite(product.id)) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("product_id", product.id);

          if (error) throw error;

          dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert([{ user_id: user.id, product_id: product.id }]);

          if (error && error.code !== "23505") throw error;

          dispatch({ type: "ADD_FAVORITE", payload: product });
        }
      } catch (error) {
        console.error("Erro ao alternar favorito:", error);
        alert("Erro ao alterar favoritos. Tente novamente.");
      }
    },
    [user, isFavorite]
  );

  const contextValue = {
    state,
    dispatch,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
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

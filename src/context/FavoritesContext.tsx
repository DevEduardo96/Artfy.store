// src/context/FavoritesContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Product } from "../types";
import { products } from "../data/products";

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

  // Carrega favoritos do localStorage
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });

    const stored = localStorage.getItem("favorites");
    if (stored) {
      try {
        const ids: string[] = JSON.parse(stored);
        const favoriteProducts = products.filter((p) => ids.includes(p.id));
        dispatch({ type: "LOAD_FAVORITES", payload: favoriteProducts });
      } catch {
        console.warn("Erro ao carregar favoritos locais.");
      }
    }

    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => state.items.some((item) => item.id === productId),
    [state.items]
  );

  const toggleFavorite = useCallback(
    (product: Product) => {
      let updatedItems: Product[];

      if (isFavorite(product.id)) {
        updatedItems = state.items.filter((item) => item.id !== product.id);
        dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
      } else {
        updatedItems = [...state.items, product];
        dispatch({ type: "ADD_FAVORITE", payload: product });
      }

      const updatedIds = updatedItems.map((item) => item.id);
      localStorage.setItem("favorites", JSON.stringify(updatedIds));
    },
    [state.items, isFavorite]
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

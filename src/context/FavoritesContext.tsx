import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "../types";

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
    case "ADD_FAVORITE": {
      const isAlreadyFavorite = state.items.some(
        (item) => item.id === action.payload.id
      );
      if (isAlreadyFavorite) return state;

      const newItems = [...state.items, action.payload];
      localStorage.setItem("favorites", JSON.stringify(newItems));
      return { ...state, items: newItems };
    }

    case "REMOVE_FAVORITE": {
      const filteredItems = state.items.filter(
        (item) => item.id !== action.payload
      );
      localStorage.setItem("favorites", JSON.stringify(filteredItems));
      return { ...state, items: filteredItems };
    }

    case "CLEAR_FAVORITES":
      localStorage.removeItem("favorites");
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

  // Carregar favoritos do localStorage na inicialização
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: "LOAD_FAVORITES", payload: favorites });
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      }
    }
  }, []);

  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.id === productId);
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
    } else {
      dispatch({ type: "ADD_FAVORITE", payload: product });
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

// src/context/FavoritesContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { Product } from "../types";

type Action =
  | { type: "TOGGLE_FAVORITE"; payload: Product }
  | { type: "CLEAR_FAVORITES" };

interface FavoritesState {
  favorites: Product[];
}

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (id: string) => boolean;
  dispatch: React.Dispatch<Action>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const favoritesReducer = (state: FavoritesState, action: Action): FavoritesState => {
  switch (action.type) {
    case "TOGGLE_FAVORITE":
      const exists = state.favorites.find((item) => item.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          favorites: state.favorites.filter((item) => item.id !== action.payload.id),
        };
      } else {
        return {
          ...state,
          favorites: [...state.favorites, action.payload],
        };
      }

    case "CLEAR_FAVORITES":
      return { favorites: [] };

    default:
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, { favorites: [] });

  const toggleFavorite = (product: Product) => {
    dispatch({ type: "TOGGLE_FAVORITE", payload: product });
  };

  const isFavorite = (id: string) => {
    return state.favorites.some((product) => product.id === id);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: state.favorites,
        toggleFavorite,
        isFavorite,
        dispatch,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites deve ser usado dentro de um FavoritesProvider");
  }
  return context;
};

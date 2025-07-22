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
  console.log("=== FAVORITES REDUCER DEBUG ===");
  console.log("Action type:", action.type);
  console.log("Current state:", state);
  console.log("Action payload:", action.payload);

  switch (action.type) {
    case "TOGGLE_FAVORITE":
      try {
        // Validações de segurança
        if (!action.payload) {
          console.error("TOGGLE_FAVORITE: payload is null/undefined");
          return state;
        }

        if (!action.payload.id) {
          console.error("TOGGLE_FAVORITE: payload has no id:", action.payload);
          return state;
        }

        if (!action.payload.name) {
          console.error("TOGGLE_FAVORITE: payload has no name:", action.payload);
          return state;
        }

        // Garantir que o state.favorites é sempre um array válido
        const currentFavorites = Array.isArray(state.favorites) ? state.favorites : [];
        
        console.log("Current favorites:", currentFavorites);
        
        const exists = currentFavorites.find((item) => {
          if (!item || !item.id) {
            console.warn("Found invalid item in favorites:", item);
            return false;
          }
          return item.id === action.payload.id;
        });

        console.log("Product exists in favorites:", !!exists);

        if (exists) {
          // Remover dos favoritos
          const newFavorites = currentFavorites.filter((item) => {
            if (!item || !item.id) {
              console.warn("Removing invalid item from favorites:", item);
              return false; // Remove itens inválidos também
            }
            return item.id !== action.payload.id;
          });
          
          console.log("New favorites after removal:", newFavorites);
          
          const newState = {
            ...state,
            favorites: newFavorites,
          };
          
          console.log("=== FAVORITES REDUCER END (REMOVED) ===");
          return newState;
        } else {
          // Adicionar aos favoritos
          // Criar uma cópia limpa do produto para evitar referências problemáticas
          const cleanProduct: Product = {
            id: String(action.payload.id || ''),
            name: String(action.payload.name || ''),
            category: String(action.payload.category || ''),
            price: Number(action.payload.price) || 0,
            originalPrice: action.payload.originalPrice ? Number(action.payload.originalPrice) : undefined,
            rating: Number(action.payload.rating) || 0,
            reviews: Number(action.payload.reviews) || 0,
            image: String(action.payload.image || ''),
            description: String(action.payload.description || ''),
            fileSize: String(action.payload.fileSize || ''),
            format: String(action.payload.format || ''),
            isDigital: Boolean(action.payload.isDigital),
            tags: Array.isArray(action.payload.tags) ? action.payload.tags : [],
            badge: action.payload.badge || null,
            popularity: Number(action.payload.popularity) || 0,
          };

          console.log("Clean product to add:", cleanProduct);
          
          const newFavorites = [...currentFavorites, cleanProduct];
          console.log("New favorites after addition:", newFavorites);
          
          const newState = {
            ...state,
            favorites: newFavorites,
          };
          
          console.log("=== FAVORITES REDUCER END (ADDED) ===");
          return newState;
        }
      } catch (error) {
        console.error("Error in TOGGLE_FAVORITE reducer:", error);
        console.error("Error stack:", error.stack);
        return state; // Retorna o estado atual em caso de erro
      }

    case "CLEAR_FAVORITES":
      console.log("=== FAVORITES REDUCER END (CLEARED) ===");
      return { ...state, favorites: [] };

    default:
      console.log("=== FAVORITES REDUCER END (NO CHANGE) ===");
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, { favorites: [] });

  const toggleFavorite = (product: Product) => {
    console.log("=== TOGGLE FAVORITE FUNCTION DEBUG ===");
    console.log("Product received in toggleFavorite:", product);
    console.log("Current favorites before toggle:", state.favorites);
    
    try {
      if (!product) {
        console.error("toggleFavorite: product is null/undefined");
        return;
      }

      if (!product.id) {
        console.error("toggleFavorite: product has no id:", product);
        return;
      }

      if (!product.name) {
        console.error("toggleFavorite: product has no name:", product);
        return;
      }

      console.log("Dispatching TOGGLE_FAVORITE for:", product.name);
      
      // Force re-render by creating new state reference
      dispatch({ type: "TOGGLE_FAVORITE", payload: { ...product } });
      
      // Log after a delay to see the result
      setTimeout(() => {
        console.log("Favorites after toggle (delayed):", state.favorites);
      }, 100);
      
    } catch (error) {
      console.error("Error in toggleFavorite function:", error);
    }
    
    console.log("=== END TOGGLE FAVORITE FUNCTION DEBUG ===");
  };

  const isFavorite = (id: string) => {
    try {
      if (!id) {
        console.warn("isFavorite: id is empty/null/undefined");
        return false;
      }

      if (!Array.isArray(state.favorites)) {
        console.error("isFavorite: state.favorites is not an array:", state.favorites);
        return false;
      }

      return state.favorites.some((product) => {
        if (!product || !product.id) {
          console.warn("isFavorite: found invalid product in favorites:", product);
          return false;
        }
        return product.id === id;
      });
    } catch (error) {
      console.error("Error in isFavorite function:", error);
      return false;
    }
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
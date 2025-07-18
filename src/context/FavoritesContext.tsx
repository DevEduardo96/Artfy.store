import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "../types";
import { supabase } from "../supabaseClient";
import { products } from "../data/products";

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

  // Buscar usuário atual
  const [user, setUser] = React.useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        dispatch({ type: "LOAD_FAVORITES", payload: [] });
        return;
      }

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

        if (productIds.length === 0) {
          dispatch({ type: "LOAD_FAVORITES", payload: [] });
          return;
        }

        // Como não temos tabela products no Supabase, vamos buscar dos dados locais
        const favoriteProducts = products.filter((product) =>
          productIds.includes(product.id)
        );

        dispatch({ type: "LOAD_FAVORITES", payload: favoriteProducts });
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      }
    };

    loadFavorites();
  }, [user]);

  const isFavorite = (productId: string): boolean => {
    return state.items.some((item) => item.id === productId);
  };

  const toggleFavorite = async (product: Product) => {
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

        if (!error) {
          dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
        } else {
          console.error("Erro ao remover favorito:", error);
          alert("Erro ao remover dos favoritos. Tente novamente.");
        }
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: user.id, product_id: product.id }]);

        if (!error) {
          dispatch({ type: "ADD_FAVORITE", payload: product });
        } else {
          console.error("Erro ao adicionar favorito:", error);
          alert("Erro ao adicionar aos favoritos. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro na operação de favoritos:", error);
      alert("Erro inesperado. Tente novamente.");
    }
  };

  const clearAllFavorites = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id);

      if (!error) {
        dispatch({ type: "CLEAR_FAVORITES" });
      } else {
        console.error("Erro ao limpar favoritos:", error);
        alert("Erro ao limpar favoritos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao limpar favoritos:", error);
      alert("Erro inesperado. Tente novamente.");
    }
  };

  // Adicionar clearAllFavorites ao contexto
  const contextValue = {
    state,
    dispatch: (action: FavoritesAction) => {
      if (action.type === "CLEAR_FAVORITES") {
        clearAllFavorites();
      } else {
        dispatch(action);
      }
    },
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
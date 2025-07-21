import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { supabase } from "../supabaseClient";
import { useUser } from "./UserContext"; // ajuste o caminho se precisar

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  description: string;
  popularity: number;
  fileSize: string;
  format: string;
}

type Action =
  | { type: "SET_FAVORITES"; payload: Product[] }
  | { type: "ADD_FAVORITE"; payload: Product }
  | { type: "REMOVE_FAVORITE"; payload: string };

interface FavoritesState {
  favorites: Product[];
}

interface FavoritesContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const favoritesReducer = (state: FavoritesState, action: Action): FavoritesState => {
  switch (action.type) {
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };
    case "ADD_FAVORITE":
      return { ...state, favorites: [...state.favorites, action.payload] };
    case "REMOVE_FAVORITE":
      return { ...state, favorites: state.favorites.filter(p => p.id !== action.payload) };
    default:
      return state;
  }
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = useUser();
  const [state, dispatch] = useReducer(favoritesReducer, { favorites: [] });

  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_FAVORITES", payload: [] });
      return;
    }

    // Carregar favoritos do usuário do Supabase
    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from("favoritos")
        .select(`
          produtos:produto_id (
            id, nome, categoria, preco, preco_original, avaliacao, qtd_avaliacoes,
            imagem, desconto, descricao, tamanho, formato, destaque, created_at
          )
        `)
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar favoritos:", error);
        return;
      }

      // Mapear produtos extraídos para o formato Product
      const produtosFavoritos: Product[] = (data ?? [])
        .map((fav: any) => {
          const p = fav.produtos;
          if (!p) return null;
          return {
            id: p.id,
            name: p.nome,
            category: p.categoria,
            price: p.preco,
            originalPrice: p.preco_original,
            rating: p.avaliacao,
            reviews: p.qtd_avaliacoes,
            image: p.imagem,
            badge: null, // você pode adaptar se tiver badge
            description: p.descricao,
            popularity: 0, // não tem na tabela, pode ajustar
            fileSize: p.tamanho,
            format: p.formato,
          };
        })
        .filter(Boolean) as Product[];

      dispatch({ type: "SET_FAVORITES", payload: produtosFavoritos });
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (product: Product) => {
    if (!user) {
      console.warn("Usuário não está logado.");
      return;
    }

    const isFav = state.favorites.some(fav => fav.id === product.id);

    if (isFav) {
      // Remover favorito do Supabase e do estado
      const { error } = await supabase
        .from("favoritos")
        .delete()
        .eq("user_id", user.id)
        .eq("produto_id", product.id);

      if (error) {
        console.error("Erro ao remover favorito:", error);
        return;
      }

      dispatch({ type: "REMOVE_FAVORITE", payload: product.id });
    } else {
      // Adicionar favorito no Supabase e no estado
      const { error } = await supabase
        .from("favoritos")
        .insert([{ user_id: user.id, produto_id: product.id }]);

      if (error) {
        console.error("Erro ao adicionar favorito:", error);
        return;
      }

      dispatch({ type: "ADD_FAVORITE", payload: product });
    }
  };

  const isFavorite = (id: string) => {
    return state.favorites.some(product => product.id === id);
  };

  return (
    <FavoritesContext.Provider value={{ favorites: state.favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites deve ser usado dentro de um FavoritesProvider");
  return context;
};

export type { Product };

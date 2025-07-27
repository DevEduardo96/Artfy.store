// src/hooks/useProducts.ts
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase
const supabaseUrl = "https://YOUR_SUPABASE_URL"; // Substitua pelo seu URL do Supabase
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"; // Substitua pela sua chave anônima do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipo para o produto
export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from("produtos").select("*");
      if (error) {
        setError(error.message);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

import { createClient } from "@supabase/supabase-js";
import { ReactNode } from "react";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "supabase.auth.token",
  },
});

// Product type based on Supabase table structure
export interface Product {
  original_price: ReactNode;
  preco(preco: any): import("react").ReactNode;
  id: number;
  name: string;
  description: string;
  price: number | string;
  image_url: string;
  category: string;
}

// Product service functions
export const productService = {
  // Fetch all products
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error("Failed to fetch products");
    }

    return data || [];
  },

  // Fetch products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("category", category)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching products by category:", error);
      throw new Error("Failed to fetch products by category");
    }

    return data || [];
  },

  // Search products by name or description
  async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("id", { ascending: true });

    if (error) {
      console.error("Error searching products:", error);
      throw new Error("Failed to search products");
    }

    return data || [];
  },

  // Get a single product by ID
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;
  },

  // Get unique categories
  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase.from("produtos").select("category");

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }

    // Extract unique categories
    const uniqueCategories = new Set(data?.map((item) => item.category) || []);
    const categories = Array.from(uniqueCategories);
    return categories.filter(Boolean);
  },
};

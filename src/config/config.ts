// src/config.ts

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://servidor-loja-digital.onrender.com";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

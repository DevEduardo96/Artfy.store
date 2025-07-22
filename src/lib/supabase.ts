import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string;
          nome: string;
          descricao: string;
          preco: number;
          imagem: string;
          link_download: string;
          categoria: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          descricao: string;
          preco: number;
          imagem: string;
          link_download: string;
          categoria: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          descricao?: string;
          preco?: number;
          imagem?: string;
          link_download?: string;
          categoria?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          mercadopago_payment_id: string | null;
          total_amount: number;
          status: 'pending' | 'approved' | 'rejected' | 'cancelled' | null;
          payment_method: string | null;
          created_at: string;
          updated_at: string;
          qr_code: string | null;
          qr_code_base64: string | null;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          mercadopago_payment_id?: string | null;
          total_amount: number;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
          qr_code?: string | null;
          qr_code_base64?: string | null;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          mercadopago_payment_id?: string | null;
          total_amount?: number;
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled' | null;
          payment_method?: string | null;
          created_at?: string;
          updated_at?: string;
          qr_code?: string | null;
          qr_code_base64?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number;
          created_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          download_token: string;
          download_count: number;
          max_downloads: number;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string | null;
          download_token: string;
          download_count?: number;
          max_downloads?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          download_token?: string;
          download_count?: number;
          max_downloads?: number;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
  };
};
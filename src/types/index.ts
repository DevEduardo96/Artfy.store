// Tipos centralizados para o projeto
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Tipos para filtros de produtos
export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'preco-low' | 'preco-high' | 'name';
  minPrice?: number;
  maxPrice?: number;
}

// Tipos para paginação
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
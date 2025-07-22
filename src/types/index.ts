export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
  downloadUrl?: string;
  fileSize?: string;
  format?: string;
  isDigital: boolean;
  badge?: string | null;
  popularity?: number;
  discount?: number;
  featured?: boolean;
}

export interface ProdutoSupabase {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  preco_original: number | null;
  preco: number;
  desconto: number | null;
  tamanho: string | null;
  formato: string | null;
  imagem: string | null;
  link_download: string | null;
  avaliacao: number | null;
  qtd_avaliacoes: number | null;
  destaque: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}
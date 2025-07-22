export interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  link_download: string;
  categoria: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'failed';
  payment_id: string;
  qr_code?: string;
  qr_code_base64?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Download {
  id: string;
  order_id: string;
  product_id: string;
  download_token: string;
  download_count: number;
  max_downloads: number;
  expires_at: string;
  created_at: string;
}
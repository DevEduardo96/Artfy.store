export interface Product {
  id: number;
  name: string;
  price: number | string;
  image_url: string;
  category: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  // Legacy fields for backward compatibility
  nome?: string;
  preco?: number;
  image?: string;
  linkDownload?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaymentData {
  id: string;
  status: string;
  qr_code_base64: string;
  qr_code: string;
  ticket_url: string;
}

export interface PaymentStatus {
  status: string;
  statusDetail: string;
  paymentId: string;
  products: Array<{
    id: string;
    name: string;
    downloadUrl: string | null;
    format: string;
    fileSize: string;
    quantity: number;
    price: number;
  }>;
  customerEmail: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  hasLinks: boolean;
  linksCount: number;
}

export interface DownloadResponse {
  links: string[];
  products: Array<{
    id: string;
    name: string;
    downloadUrl: string | null;
    format: string;
    fileSize: string;
    quantity: number;
    price: number;
  }>;
  customerName: string;
  total: number;
  downloadedAt: string;
  expiresIn: string;
}
export interface Product {
  id: string;
  nome: string;
  preco: number;
  linkDownload: string;
  description?: string;
  category?: string;
  image?: string;
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
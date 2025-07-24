export interface Product {
  id: string;
<<<<<<< HEAD
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
=======
  nome: string;
  preco: number;
  linkDownload: string;
  description?: string;
  category?: string;
  image?: string;
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
}

export interface CartItem {
  product: Product;
  quantity: number;
}

<<<<<<< HEAD
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
=======
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
>>>>>>> bd2f5bb (Primeiro commit do projeto Nectix.store)
}
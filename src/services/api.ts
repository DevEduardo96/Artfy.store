import { apiClient } from "./apiClient";
import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
  CreatePaymentRequest,
  ApiResponse,
  PaginatedResponse,
  ProductFilters,
} from "../types";

export const api = {
  // ===== PRODUTOS =====
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      // Se não houver filtros, busca todos os produtos
      if (!filters || Object.keys(filters).length === 0) {
        return await apiClient.get<Product[]>("/products");
      }

      // Constrói query string com filtros
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.minPrice) params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice.toString());

      return await apiClient.get<Product[]>(`/products?${params.toString()}`);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      // Fallback para dados mockados em caso de erro
      return this.getMockProducts();
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      return await apiClient.get<Product>(`/products/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      return null;
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>(`/products/category/${category}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${category}:`, error);
      return [];
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      console.error(`Erro ao buscar produtos com query "${query}":`, error);
      return [];
    }
  },

  // ===== PAGAMENTOS =====
  async createPayment(data: CreatePaymentRequest): Promise<PaymentData> {
    console.log("Criando pagamento:", data);
    
    try {
      const response = await apiClient.post<PaymentData>("/payments/criar-pagamento", data);
      console.log("Pagamento criado com sucesso:", response);
      return response;
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      throw error;
    }
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    console.log("Consultando status do pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    try {
      const response = await apiClient.get<PaymentStatus>(`/payments/status-pagamento/${paymentId}`);
      console.log("Status obtido:", response);
      return response;
    } catch (error) {
      console.error("Erro ao consultar status do pagamento:", error);
      throw error;
    }
  },

  async getDownloadLinks(paymentId: string): Promise<DownloadResponse> {
    console.log("Buscando links de download:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    try {
      const response = await apiClient.get<DownloadResponse>(`/payments/link-download/${paymentId}`);
      console.log("Links de download obtidos:", response);
      return response;
    } catch (error) {
      console.error("Erro ao obter links de download:", error);
      throw error;
    }
  },

  // ===== USUÁRIOS =====
  async getUserProfile(): Promise<any> {
    try {
      return await apiClient.get("/users/profile");
    } catch (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      throw error;
    }
  },

  async updateUserProfile(data: any): Promise<any> {
    try {
      return await apiClient.put("/users/profile", data);
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error);
      throw error;
    }
  },

  // ===== FAVORITOS =====
  async getFavorites(): Promise<Product[]> {
    try {
      return await apiClient.get<Product[]>("/favorites");
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return [];
    }
  },

  async addToFavorites(productId: number): Promise<void> {
    try {
      await apiClient.post("/favorites", { productId });
    } catch (error) {
      console.error("Erro ao adicionar aos favoritos:", error);
      throw error;
    }
  },

  async removeFromFavorites(productId: number): Promise<void> {
    try {
      await apiClient.delete(`/favorites/${productId}`);
    } catch (error) {
      console.error("Erro ao remover dos favoritos:", error);
      throw error;
    }
  },

  // ===== UTILITÁRIOS =====
  async wakeUpServer(): Promise<void> {
    try {
      console.log("Acordando servidor...");
      const isHealthy = await apiClient.healthCheck();
      if (isHealthy) {
        console.log("Servidor está ativo");
      } else {
        console.warn("Servidor não está respondendo");
      }
    } catch (error) {
      console.warn("Falha ao acordar servidor:", error);
    }
  },

  // ===== DADOS MOCKADOS (FALLBACK) =====
  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: "Curso Completo de React.js",
        price: 0.1,
        description: "Aprenda React.js do básico ao avançado com projetos práticos",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 2,
        name: "E-book: Design System Completo",
        price: 79.9,
        description: "Guia completo para criar e manter design systems eficazes",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 3,
        name: "Template Premium Dashboard",
        price: 89.9,
        description: "Template profissional para dashboards administrativos",
        category: "Templates",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 4,
        name: "Masterclass: Marketing Digital",
        price: 199.9,
        description: "Estratégias avançadas de marketing digital para 2024",
        category: "Marketing",
        image_url: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 5,
        name: "Pack de Ícones Premium",
        price: 39.9,
        description: "Coleção com mais de 1000 ícones vetoriais premium",
        category: "Design",
        image_url: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 6,
        name: "Curso Node.js Avançado",
        price: 179.9,
        description: "Desenvolvimento backend avançado com Node.js e Express",
        category: "Programação",
        image_url: "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
    ];
  },
};

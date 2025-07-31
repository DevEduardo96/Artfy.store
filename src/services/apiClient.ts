// Cliente HTTP centralizado para o backend
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || "https://servidor-loja-digital.onrender.com/api";
    this.timeout = 30000; // 30 segundos
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Se não conseguir parsear o JSON, usa a mensagem padrão
        }
        throw new Error(errorMessage);
      }

      // Se a resposta for vazia, retorna null
      const text = await response.text();
      if (!text) return null as T;

      return JSON.parse(text);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Timeout: A requisição demorou muito para responder");
        }
        throw error;
      }
      throw new Error("Erro desconhecido na requisição");
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Método para verificar se o servidor está online
  async healthCheck(): Promise<boolean> {
    try {
      const baseUrl = this.baseURL.replace('/api', '');
      const response = await fetch(`${baseUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 segundos para health check
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(); 
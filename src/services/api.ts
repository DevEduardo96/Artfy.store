import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
} from "../types";

const API_BASE_URL = "https://servidor-loja-digital.onrender.com/api";

// Função para fazer retry de requests
const fetchWithRetry = async (
  url: string,
  options?: RequestInit,
  retries = 3
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 30000, // 30 segundos de timeout
      });

      // Se o servidor retornou 5xx, tenta novamente
      if (response.status >= 500 && i < retries - 1) {
        console.warn(
          `Tentativa ${i + 1} falhou com status ${
            response.status
          }, tentando novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Backoff exponencial
        continue;
      }

      return response;
    } catch (error) {
      console.error(`Tentativa ${i + 1} falhou:`, error);

      if (i === retries - 1) {
        throw error;
      }

      // Aguarda antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw new Error("Todas as tentativas falharam");
};

export const api = {
  // Buscar produtos (simulado - você pode implementar um endpoint no servidor)
  async getProducts(): Promise<Product[]> {
    const produtos: Product[] = [
      {
        id: 1,
        name: "Curso Completo de React.js",
        price: 0.1,
        description:
          "Aprenda React.js do básico ao avançado com projetos práticos",
        category: "Programação",
        image_url:
          "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 2,
        name: "E-book: Design System Completo",
        price: 79.9,
        description:
          "Guia completo para criar e manter design systems eficazes",
        category: "Design",
        image_url:
          "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 3,
        name: "Template Premium Dashboard",
        price: 89.9,
        description: "Template profissional para dashboards administrativos",
        category: "Templates",
        image_url:
          "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 4,
        name: "Masterclass: Marketing Digital",
        price: 199.9,
        description: "Estratégias avançadas de marketing digital para 2024",
        category: "Marketing",
        image_url:
          "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 5,
        name: "Pack de Ícones Premium",
        price: 39.9,
        description: "Coleção com mais de 1000 ícones vetoriais premium",
        category: "Design",
        image_url:
          "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: 6,
        name: "Curso Node.js Avançado",
        price: 179.9,
        description: "Desenvolvimento backend avançado com Node.js e Express",
        category: "Programação",
        image_url:
          "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
    ];

    return new Promise((resolve) => {
      setTimeout(() => resolve(produtos), 500);
    });
  },

  async createPayment(data: {
    carrinho: Array<{ product: Product; quantity: number }>;
    nomeCliente: string;
    email: string;
    total: number;
  }): Promise<PaymentData> {
    console.log("Criando pagamento:", data);

    const response = await fetchWithRetry(`${API_BASE_URL}/payments/criar-pagamento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Erro ao criar pagamento";
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    console.log("Consultando status do pagamento:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}/payments/status-pagamento/${paymentId}`
    );

    if (!response.ok) {
      let errorMessage = "Erro ao consultar status do pagamento";
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch (e) {
        if (response.status === 404) {
          errorMessage = "Pagamento não encontrado";
        } else {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Status obtido:", result);

    // Garantir que retorna no formato esperado
    return {
      status: result.status,
      paymentId: paymentId,
    };
  },

  async getDownloadLinks(paymentId: string): Promise<DownloadResponse> {
    console.log("Buscando links de download:", paymentId);

    if (!paymentId) {
      throw new Error("ID do pagamento é obrigatório");
    }

    const response = await fetchWithRetry(
      `${API_BASE_URL}/payments/link-download/${paymentId}`
    );

    if (!response.ok) {
      let errorMessage = "Erro ao obter links de download";
      try {
        const error = await response.json();
        errorMessage =
          error.erro || error.error || error.message || errorMessage;
      } catch (e) {
        if (response.status === 404) {
          errorMessage = "Pagamento não encontrado";
        } else if (response.status === 403) {
          errorMessage = "Pagamento não foi aprovado ainda";
        } else {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("Links de download obtidos:", result);

    // Transformar a resposta para o formato esperado pelo frontend
    return {
      links: result.links || [],
      products: result.products || [],
      customerName: result.customerName,
      total: result.total,
      downloadedAt: result.downloadedAt,
      expiresIn: "7 dias", // Valor padrão, você pode ajustar
    };
  },

  // Função para "acordar" o servidor (útil para Render free tier)
  async wakeUpServer(): Promise<void> {
    try {
      console.log("Acordando servidor...");
      const response = await fetchWithRetry(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: "GET",
      });

      if (response.ok) {
        console.log("Servidor está ativo");
      }
    } catch (error) {
      console.warn("Falha ao acordar servidor:", error);
      // Não propagar o erro pois é só um "health check"
    }
  },
};

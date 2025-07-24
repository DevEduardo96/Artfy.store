import {
  Product,
  PaymentData,
  PaymentStatus,
  DownloadResponse,
} from "../types";

const API_BASE_URL = "https://servidor-loja-digital.onrender.com";

export const api = {
  // Buscar produtos (simulado - você pode implementar um endpoint no servidor)
  async getProducts(): Promise<Product[]> {
    // Como não há endpoint para listar produtos, vamos simular com base nos IDs conhecidos
    const produtos: Product[] = [
      {
        id: "2511ce44-fa75-4ce2-8ce8-d0590e7cb394",
        nome: "Curso Completo de React.js",
        preco: 0.1,
        linkDownload: "",
        description:
          "Aprenda React.js do básico ao avançado com projetos práticos",
        category: "Programação",
        image:
          "https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: "3d1ef734-5b8d-48be-b770-d1db7a6d302a",
        nome: "E-book: Design System Completo",
        preco: 79.9,
        linkDownload: "",
        description:
          "Guia completo para criar e manter design systems eficazes",
        category: "Design",
        image:
          "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: "6172f4cb-5df8-4d23-ac90-2b3bf4329c4d",
        nome: "Template Premium Dashboard",
        preco: 89.9,
        linkDownload: "",
        description: "Template profissional para dashboards administrativos",
        category: "Templates",
        image:
          "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: "3b7277fc-5784-4eef-b34e-80c50ad07c37",
        nome: "Masterclass: Marketing Digital",
        preco: 199.9,
        linkDownload: "",
        description: "Estratégias avançadas de marketing digital para 2024",
        category: "Marketing",
        image:
          "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: "fed1a412-9ce4-4f6a-9d60-31edb4e2da3e",
        nome: "Pack de Ícones Premium",
        preco: 39.9,
        linkDownload: "",
        description: "Coleção com mais de 1000 ícones vetoriais premium",
        category: "Design",
        image:
          "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
      },
      {
        id: "b4215049-5ec3-4a2e-a4cc-58ff9dbc0e4c",
        nome: "Curso Node.js Avançado",
        preco: 179.9,
        linkDownload: "",
        description: "Desenvolvimento backend avançado com Node.js e Express",
        category: "Programação",
        image:
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
    const response = await fetch(`${API_BASE_URL}/criar-pagamento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao criar pagamento");
    }

    return response.json();
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const response = await fetch(
      `${API_BASE_URL}/status-pagamento/${paymentId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao consultar status do pagamento");
    }

    return response.json();
  },

  async getDownloadLinks(paymentId: string): Promise<DownloadResponse> {
    const response = await fetch(`${API_BASE_URL}/link-download/${paymentId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.erro || "Erro ao obter links de download");
    }

    return response.json();
  },
};

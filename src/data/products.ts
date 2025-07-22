import { Product } from "../types";
import { supabase } from "../supabaseClient";

// Cache para produtos
let productsCache: Product[] = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para mapear dados da tabela produtos do Supabase para o tipo Product
const mapProdutoSupabase = (item: any): Product => {
  return {
    id: item.id,
    name: item.nome || '',
    description: item.descricao || '',
    price: Number(item.preco) || 0,
    originalPrice: item.preco_original ? Number(item.preco_original) : undefined,
    image: item.imagem || 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500',
    category: item.categoria || 'Geral',
    tags: item.categoria ? [item.categoria] : [],
    rating: Number(item.avaliacao) || 4.5,
    reviews: Number(item.qtd_avaliacoes) || 0,
    downloadUrl: item.link_download || '',
    fileSize: item.tamanho || 'N/A',
    format: item.formato || 'Digital',
    isDigital: true,
    badge: item.destaque ? 'DESTAQUE' : null,
    popularity: Number(item.qtd_avaliacoes) || 0,
    discount: item.desconto ? Number(item.desconto) : undefined,
    featured: Boolean(item.destaque),
  };
};

// Função para verificar se deve usar produtos padrão (apenas em desenvolvimento)
const shouldUseDefaultProducts = (): boolean => {
  return import.meta.env.DEV && import.meta.env.VITE_USE_DEFAULT_PRODUCTS === 'true';
};

// Função para buscar produtos do Supabase
export const fetchProducts = async (): Promise<Product[]> => {
  const now = Date.now();
  
  // Retorna cache se ainda válido
  if (productsCache.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    console.log('📦 Retornando produtos do cache:', productsCache.length);
    return productsCache;
  }

  console.log('🔄 Buscando produtos da tabela produtos...');

  // Se estiver em desenvolvimento e a flag estiver ativa, usa produtos padrão
  if (shouldUseDefaultProducts()) {
    console.log('🧪 Usando produtos padrão (desenvolvimento)');
    productsCache = getDefaultProducts();
    lastFetch = now;
    return productsCache;
  }

  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      // Retorna array vazio em caso de erro, não produtos padrão
      return [];
    }

    if (data) {
      console.log('✅ Produtos encontrados na tabela produtos:', data.length);
      console.log('📋 Dados dos produtos:', data);
      productsCache = data.map(mapProdutoSupabase);
      lastFetch = now;
      console.log('🔄 Produtos mapeados:', productsCache);
      return productsCache;
    }

    console.log('ℹ️ Nenhum produto encontrado na tabela produtos');
    return [];
  } catch (error) {
    console.error('Erro na conexão com Supabase:', error);
    // Em caso de erro de conexão, retorna array vazio
    return [];
  }
};

// Produtos padrão como fallback (apenas para desenvolvimento/teste)
const getDefaultProducts = (): Product[] => [
  {
    id: "curso-react-completo",
    name: "Curso Completo de React.js",
    description: "Aprenda React.js do básico ao avançado com projetos práticos e exemplos reais.",
    price: 99.90,
    originalPrice: 249.9,
    image: "https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Programação",
    tags: ["React", "JavaScript", "Frontend"],
    rating: 4.8,
    reviews: 234,
    downloadUrl: "https://exemplo.com/curso-react.zip",
    fileSize: "2.5 GB",
    format: "MP4",
    isDigital: true,
    badge: "DESTAQUE",
    popularity: 234,
    discount: 60,
    featured: true,
  },
  {
    id: "ebook-design-system",
    name: "E-book: Design System Completo",
    description: "Guia definitivo para criar e manter design systems escaláveis e consistentes.",
    price: 79.9,
    originalPrice: 129.9,
    image: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Design",
    tags: ["UI/UX", "Design System", "Figma"],
    rating: 4.9,
    reviews: 156,
    downloadUrl: "https://exemplo.com/ebook-design-system.pdf",
    fileSize: "45 MB",
    format: "PDF",
    isDigital: true,
    badge: null,
    popularity: 156,
    discount: 38,
    featured: false,
  },
  {
    id: "template-dashboard-premium",
    name: "Template Premium Dashboard",
    description: "Template responsivo para dashboards administrativos com componentes modernos.",
    price: 89.9,
    originalPrice: undefined,
    image: "https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Templates",
    tags: ["Dashboard", "Admin", "Responsive"],
    rating: 4.7,
    reviews: 89,
    downloadUrl: "https://exemplo.com/template-dashboard.zip",
    fileSize: "125 MB",
    format: "HTML/CSS/JS",
    isDigital: true,
    badge: null,
    popularity: 89,
    discount: undefined,
    featured: false,
  },
];

// Função para invalidar cache
export const invalidateProductsCache = () => {
  productsCache = [];
  lastFetch = 0;
  console.log('🗑️ Cache de produtos invalidado');
};


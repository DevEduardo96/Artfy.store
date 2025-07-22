/*
  # Criar tabela produtos

  1. Nova Tabela
    - `produtos` - Tabela de produtos com estrutura personalizada
      - `id` (text, primary key)
      - `nome` (text, not null)
      - `descricao` (text)
      - `categoria` (text)
      - `preco_original` (numeric)
      - `preco` (numeric, not null)
      - `desconto` (integer)
      - `tamanho` (text)
      - `formato` (text)
      - `imagem` (text)
      - `link_download` (text)
      - `avaliacao` (numeric)
      - `qtd_avaliacoes` (integer)
      - `destaque` (boolean, default false)
      - `created_at` (timestamp with time zone, default now())

  2. Segurança
    - Enable RLS na tabela produtos
    - Políticas para leitura pública dos produtos
*/

-- Criar tabela produtos
CREATE TABLE IF NOT EXISTS public.produtos (
  id text PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  categoria text,
  preco_original numeric,
  preco numeric NOT NULL,
  desconto integer,
  tamanho text,
  formato text,
  imagem text,
  link_download text,
  avaliacao numeric,
  qtd_avaliacoes integer,
  destaque boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública
CREATE POLICY "Anyone can read produtos"
  ON public.produtos
  FOR SELECT
  USING (true);

-- Política para inserção (apenas para usuários autenticados, se necessário)
CREATE POLICY "Authenticated users can insert produtos"
  ON public.produtos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para atualização (apenas para usuários autenticados, se necessário)
CREATE POLICY "Authenticated users can update produtos"
  ON public.produtos
  FOR UPDATE
  TO authenticated
  USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_destaque ON public.produtos(destaque);
CREATE INDEX IF NOT EXISTS idx_produtos_preco ON public.produtos(preco);
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON public.produtos(created_at);

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos (
  id, 
  nome, 
  descricao, 
  categoria, 
  preco_original, 
  preco, 
  desconto, 
  tamanho, 
  formato, 
  imagem, 
  link_download, 
  avaliacao, 
  qtd_avaliacoes, 
  destaque
) VALUES 
(
  'curso-react-completo',
  'Curso Completo de React.js',
  'Aprenda React.js do básico ao avançado com projetos práticos e exemplos reais. Inclui hooks, context, routing e muito mais.',
  'Programação',
  249.90,
  99.90,
  60,
  '2.5 GB',
  'MP4',
  'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://exemplo.com/curso-react.zip',
  4.8,
  234,
  true
),
(
  'ebook-design-system',
  'E-book: Design System Completo',
  'Guia definitivo para criar e manter design systems escaláveis e consistentes. Inclui templates e exemplos práticos.',
  'Design',
  129.90,
  79.90,
  38,
  '45 MB',
  'PDF',
  'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://exemplo.com/ebook-design-system.pdf',
  4.9,
  156,
  false
),
(
  'template-dashboard-premium',
  'Template Premium Dashboard',
  'Template responsivo para dashboards administrativos com componentes modernos e design clean.',
  'Templates',
  null,
  89.90,
  null,
  '125 MB',
  'HTML/CSS/JS',
  'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://exemplo.com/template-dashboard.zip',
  4.7,
  89,
  false
)
ON CONFLICT (id) DO NOTHING;
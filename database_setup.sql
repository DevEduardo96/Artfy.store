-- =====================================================
-- ESTRUTURA COMPLETA DO BANCO DE DADOS - ARTFY.STORE
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA DE PRODUTOS
-- =====================================================
CREATE TABLE public.produtos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2) CHECK (original_price >= 0),
  image_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  download_url TEXT,
  file_size VARCHAR(50),
  file_format VARCHAR(20),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_produtos_category ON public.produtos(category);
CREATE INDEX idx_produtos_price ON public.produtos(price);
CREATE INDEX idx_produtos_is_active ON public.produtos(is_active);
CREATE INDEX idx_produtos_is_featured ON public.produtos(is_featured);
CREATE INDEX idx_produtos_created_at ON public.produtos(created_at);

-- =====================================================
-- TABELA DE FAVORITOS
-- =====================================================
CREATE TABLE public.favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Índices para otimização
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_favorites_product_id ON public.favorites(product_id);

-- =====================================================
-- TABELA DE PAGAMENTOS (EXISTENTE - ATUALIZADA)
-- =====================================================
CREATE TABLE public.pagamentos (
  id TEXT PRIMARY KEY, -- ID do Mercado Pago
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
  email_cliente TEXT NOT NULL,
  nome_cliente TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor >= 0),
  links_download TEXT[], -- array de links
  produtos JSONB NOT NULL, -- lista de produtos em formato JSON
  payment_method TEXT,
  transaction_id TEXT,
  external_reference TEXT,
  notification_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_pagamentos_email_cliente ON public.pagamentos(email_cliente);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_created_at ON public.pagamentos(created_at);
CREATE INDEX idx_pagamentos_produtos_gin ON public.pagamentos USING GIN (produtos);

-- =====================================================
-- TABELA DE CARRINHO
-- =====================================================
CREATE TABLE public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Índices para otimização
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- =====================================================
-- TABELA DE CATEGORIAS
-- =====================================================
CREATE TABLE public.categorias (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_categorias_is_active ON public.categorias(is_active);
CREATE INDEX idx_categorias_sort_order ON public.categorias(sort_order);

-- =====================================================
-- TABELA DE AVALIAÇÕES
-- =====================================================
CREATE TABLE public.avaliacoes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  UNIQUE(user_id, product_id)
);

-- Índices para otimização
CREATE INDEX idx_avaliacoes_product_id ON public.avaliacoes(product_id);
CREATE INDEX idx_avaliacoes_rating ON public.avaliacoes(rating);
CREATE INDEX idx_avaliacoes_is_approved ON public.avaliacoes(is_approved);

-- =====================================================
-- TABELA DE DOWNLOADS
-- =====================================================
CREATE TABLE public.downloads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  payment_id TEXT REFERENCES public.pagamentos(id) ON DELETE CASCADE,
  download_url TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX idx_downloads_product_id ON public.downloads(product_id);
CREATE INDEX idx_downloads_payment_id ON public.downloads(payment_id);
CREATE INDEX idx_downloads_is_active ON public.downloads(is_active);

-- =====================================================
-- TABELA DE NOTIFICAÇÕES
-- =====================================================
CREATE TABLE public.notificacoes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_notificacoes_user_id ON public.notificacoes(user_id);
CREATE INDEX idx_notificacoes_is_read ON public.notificacoes(is_read);
CREATE INDEX idx_notificacoes_created_at ON public.notificacoes(created_at);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES
-- =====================================================
CREATE TABLE public.configuracoes (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now())
);

-- Índices para otimização
CREATE INDEX idx_configuracoes_chave ON public.configuracoes(chave);
CREATE INDEX idx_configuracoes_is_public ON public.configuracoes(is_public);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_produtos_updated_at
  BEFORE UPDATE ON public.produtos
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_favorites_updated_at
  BEFORE UPDATE ON public.favorites
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at
  BEFORE UPDATE ON public.categorias
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_downloads_updated_at
  BEFORE UPDATE ON public.downloads
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Função para atualizar contador de downloads
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.downloads 
  SET download_count = download_count + 1,
      last_downloaded_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos (todos podem ler produtos ativos)
CREATE POLICY "Produtos ativos são visíveis para todos" ON public.produtos
  FOR SELECT USING (is_active = true);

-- Políticas para favoritos (usuário só pode ver seus próprios favoritos)
CREATE POLICY "Usuários podem gerenciar seus próprios favoritos" ON public.favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para pagamentos (usuário só pode ver seus próprios pagamentos)
CREATE POLICY "Usuários podem ver seus próprios pagamentos" ON public.pagamentos
  FOR SELECT USING (auth.uid()::text = email_cliente);

CREATE POLICY "Usuários podem inserir seus próprios pagamentos" ON public.pagamentos
  FOR INSERT WITH CHECK (auth.uid()::text = email_cliente);

-- Políticas para carrinho (usuário só pode gerenciar seu próprio carrinho)
CREATE POLICY "Usuários podem gerenciar seu próprio carrinho" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para categorias (todos podem ler categorias ativas)
CREATE POLICY "Categorias ativas são visíveis para todos" ON public.categorias
  FOR SELECT USING (is_active = true);

-- Políticas para avaliações (todos podem ler avaliações aprovadas, usuário pode criar suas próprias)
CREATE POLICY "Avaliações aprovadas são visíveis para todos" ON public.avaliacoes
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Usuários podem criar suas próprias avaliações" ON public.avaliacoes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias avaliações" ON public.avaliacoes
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para downloads (usuário só pode ver seus próprios downloads)
CREATE POLICY "Usuários podem ver seus próprios downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para notificações (usuário só pode ver suas próprias notificações)
CREATE POLICY "Usuários podem ver suas próprias notificações" ON public.notificacoes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para configurações (configurações públicas são visíveis para todos)
CREATE POLICY "Configurações públicas são visíveis para todos" ON public.configuracoes
  FOR SELECT USING (is_public = true);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão
INSERT INTO public.categorias (name, description, sort_order) VALUES
('Templates', 'Templates para sites e aplicações', 1),
('Planilhas', 'Planilhas e ferramentas de produtividade', 2),
('E-books', 'Livros digitais e guias', 3),
('Cursos', 'Cursos online e tutoriais', 4),
('Design', 'Recursos de design e gráficos', 5),
('Ferramentas', 'Ferramentas e utilitários', 6);

-- Inserir produtos de exemplo
INSERT INTO public.produtos (name, description, price, original_price, image_url, category, stock_quantity, is_featured, tags) VALUES
('Template de Site Profissional', 'Template completo para criar sites profissionais com design moderno e responsivo. Inclui páginas para home, sobre, serviços, portfólio e contato.', 49.90, 99.90, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop', 'Templates', 100, true, ARRAY['site', 'profissional', 'responsivo']),
('Planilha de Controle Financeiro', 'Planilha completa para controle de receitas, despesas e investimentos. Com gráficos automáticos e relatórios detalhados.', 29.90, 59.90, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop', 'Planilhas', 200, false, ARRAY['finanças', 'controle', 'planilha']),
('E-book Marketing Digital', 'Guia completo de marketing digital com estratégias práticas e case studies. Mais de 200 páginas de conteúdo exclusivo.', 39.90, 79.90, 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop', 'E-books', 150, true, ARRAY['marketing', 'digital', 'estratégia']),
('Curso de Excel Avançado', 'Curso completo de Excel com fórmulas, macros e dashboards. Mais de 20 horas de conteúdo prático.', 89.90, 179.90, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'Cursos', 75, true, ARRAY['excel', 'curso', 'avançado']),
('Kit de Logos Profissionais', 'Pacote com 50 logos em diferentes estilos e formatos. Inclui arquivos em AI, EPS, PNG e SVG.', 69.90, 139.90, 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop', 'Design', 50, false, ARRAY['logo', 'design', 'profissional']),
('Template de Apresentação', 'Template para PowerPoint com 30 slides profissionais. Ideal para apresentações corporativas e acadêmicas.', 24.90, 49.90, 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', 'Templates', 120, false, ARRAY['apresentação', 'powerpoint', 'corporativo']),
('Planilha de Gestão de Projetos', 'Planilha completa para gestão de projetos com cronograma, recursos e acompanhamento de progresso.', 34.90, 69.90, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop', 'Planilhas', 80, true, ARRAY['projeto', 'gestão', 'cronograma']),
('Guia de SEO Completo', 'E-book com técnicas avançadas de SEO para melhorar o posicionamento do seu site nos motores de busca.', 44.90, 89.90, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', 'E-books', 100, false, ARRAY['seo', 'posicionamento', 'google']);

-- Inserir configurações padrão
INSERT INTO public.configuracoes (chave, valor, descricao, tipo, is_public) VALUES
('site_name', 'Artfy.store', 'Nome do site', 'string', true),
('site_description', 'Sua loja digital de produtos digitais', 'Descrição do site', 'string', true),
('currency', 'BRL', 'Moeda padrão', 'string', true),
('currency_symbol', 'R$', 'Símbolo da moeda', 'string', true),
('free_shipping_threshold', '100', 'Valor mínimo para frete grátis', 'number', true),
('max_downloads_per_purchase', '3', 'Número máximo de downloads por compra', 'number', true),
('download_expiry_days', '30', 'Dias para expiração do download', 'number', true),
('contact_email', 'contato@artfy.store', 'Email de contato', 'string', true),
('support_email', 'suporte@artfy.store', 'Email de suporte', 'string', true),
('maintenance_mode', 'false', 'Modo de manutenção', 'boolean', true);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para produtos com informações de categoria
CREATE VIEW public.produtos_com_categoria AS
SELECT 
  p.*,
  c.name as categoria_nome,
  c.description as categoria_descricao
FROM public.produtos p
LEFT JOIN public.categorias c ON p.category = c.name
WHERE p.is_active = true;

-- View para estatísticas de produtos
CREATE VIEW public.estatisticas_produtos AS
SELECT 
  category,
  COUNT(*) as total_produtos,
  AVG(price) as preco_medio,
  MIN(price) as preco_minimo,
  MAX(price) as preco_maximo,
  SUM(stock_quantity) as estoque_total
FROM public.produtos
WHERE is_active = true
GROUP BY category;

-- View para produtos mais vendidos (baseado em pagamentos)
CREATE VIEW public.produtos_mais_vendidos AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.image_url,
  COUNT(*) as vendas_count
FROM public.produtos p
JOIN public.pagamentos pag ON pag.produtos::text LIKE '%"id":' || p.id || '%'
WHERE pag.status = 'approved'
GROUP BY p.id, p.name, p.category, p.price, p.image_url
ORDER BY vendas_count DESC;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para buscar produtos por categoria
CREATE OR REPLACE FUNCTION get_produtos_por_categoria(categoria_nome TEXT)
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  image_url TEXT,
  category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.price, p.image_url, p.category
  FROM public.produtos p
  WHERE p.category = categoria_nome AND p.is_active = true
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar produtos em promoção
CREATE OR REPLACE FUNCTION get_produtos_promocao()
RETURNS TABLE (
  id INTEGER,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  original_price DECIMAL,
  discount_percent INTEGER,
  image_url TEXT,
  category VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.price, 
    p.original_price,
    ROUND(((p.original_price - p.price) / p.original_price) * 100)::INTEGER as discount_percent,
    p.image_url, 
    p.category
  FROM public.produtos p
  WHERE p.original_price > p.price AND p.is_active = true
  ORDER BY discount_percent DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se usuário comprou produto
CREATE OR REPLACE FUNCTION user_purchased_product(user_email TEXT, product_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  purchase_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.pagamentos 
    WHERE email_cliente = user_email 
    AND status = 'approved'
    AND produtos::text LIKE '%"id":' || product_id || '%'
  ) INTO purchase_exists;
  
  RETURN purchase_exists;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE public.produtos IS 'Tabela principal de produtos digitais';
COMMENT ON TABLE public.favorites IS 'Favoritos dos usuários';
COMMENT ON TABLE public.pagamentos IS 'Histórico de pagamentos e transações';
COMMENT ON TABLE public.cart_items IS 'Itens no carrinho de compras';
COMMENT ON TABLE public.categorias IS 'Categorias de produtos';
COMMENT ON TABLE public.avaliacoes IS 'Avaliações e comentários dos usuários';
COMMENT ON TABLE public.downloads IS 'Controle de downloads dos usuários';
COMMENT ON TABLE public.notificacoes IS 'Notificações do sistema';
COMMENT ON TABLE public.configuracoes IS 'Configurações do sistema';

-- =====================================================
-- FIM DA ESTRUTURA
-- ===================================================== 
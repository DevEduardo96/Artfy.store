# Estrutura Completa do Banco de Dados - Artfy.store

## Visão Geral

Este documento descreve a estrutura completa do banco de dados PostgreSQL para a plataforma Artfy.store, uma loja digital de produtos digitais.

## Tabelas Principais

### 1. **produtos** - Produtos Digitais
Tabela principal que armazena todos os produtos digitais da plataforma.

```sql
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
```

**Campos Principais:**
- `id`: Identificador único do produto
- `name`: Nome do produto
- `description`: Descrição detalhada
- `price`: Preço atual
- `original_price`: Preço original (para promoções)
- `image_url`: URL da imagem do produto
- `category`: Categoria do produto
- `stock_quantity`: Quantidade em estoque
- `is_active`: Se o produto está ativo
- `is_featured`: Se é um produto em destaque
- `tags`: Array de tags para busca

### 2. **pagamentos** - Histórico de Pagamentos
Tabela que armazena todas as transações de pagamento.

```sql
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
```

**Campos Principais:**
- `id`: ID único do pagamento (do Mercado Pago)
- `status`: Status do pagamento
- `email_cliente`: Email do cliente
- `nome_cliente`: Nome do cliente
- `valor`: Valor total da compra
- `links_download`: Array com links de download
- `produtos`: JSON com lista de produtos comprados

### 3. **favorites** - Favoritos dos Usuários
Tabela que armazena os produtos favoritados pelos usuários.

```sql
CREATE TABLE public.favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  UNIQUE(user_id, product_id)
);
```

### 4. **cart_items** - Carrinho de Compras
Tabela que armazena os itens no carrinho de cada usuário.

```sql
CREATE TABLE public.cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('UTC'::text, now()),
  UNIQUE(user_id, product_id)
);
```

### 5. **categorias** - Categorias de Produtos
Tabela que organiza os produtos em categorias.

```sql
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
```

### 6. **avaliacoes** - Avaliações dos Produtos
Tabela que armazena as avaliações e comentários dos usuários.

```sql
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
```

### 7. **downloads** - Controle de Downloads
Tabela que controla os downloads dos usuários.

```sql
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
```

### 8. **notificacoes** - Sistema de Notificações
Tabela que gerencia as notificações do sistema.

```sql
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
```

### 9. **configuracoes** - Configurações do Sistema
Tabela que armazena as configurações da plataforma.

```sql
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
```

## Índices de Performance

### Índices Principais
- `idx_produtos_category`: Otimiza buscas por categoria
- `idx_produtos_price`: Otimiza ordenação por preço
- `idx_produtos_is_active`: Filtra produtos ativos
- `idx_produtos_is_featured`: Filtra produtos em destaque
- `idx_pagamentos_email_cliente`: Busca pagamentos por email
- `idx_pagamentos_status`: Filtra por status de pagamento
- `idx_pagamentos_produtos_gin`: Índice GIN para busca em JSON

## Políticas de Segurança (RLS)

### Produtos
- **Leitura**: Todos podem ver produtos ativos
- **Escrita**: Apenas administradores

### Favoritos
- **Todas as operações**: Apenas o próprio usuário

### Pagamentos
- **Leitura**: Usuário só vê seus próprios pagamentos
- **Inserção**: Usuário pode criar seus próprios pagamentos

### Carrinho
- **Todas as operações**: Apenas o próprio usuário

### Avaliações
- **Leitura**: Todos podem ver avaliações aprovadas
- **Criação**: Usuário pode criar suas próprias avaliações
- **Atualização**: Usuário pode atualizar suas próprias avaliações

## Views Úteis

### 1. **produtos_com_categoria**
Combina produtos com informações de categoria.

### 2. **estatisticas_produtos**
Estatísticas agregadas por categoria.

### 3. **produtos_mais_vendidos**
Lista produtos ordenados por número de vendas.

## Funções Úteis

### 1. **get_produtos_por_categoria(categoria_nome)**
Retorna produtos de uma categoria específica.

### 2. **get_produtos_promocao()**
Retorna produtos que estão em promoção.

### 3. **user_purchased_product(user_email, product_id)**
Verifica se um usuário comprou um produto específico.

## Dados Iniciais

### Categorias Padrão
- Templates
- Planilhas
- E-books
- Cursos
- Design
- Ferramentas

### Produtos de Exemplo
- Template de Site Profissional
- Planilha de Controle Financeiro
- E-book Marketing Digital
- Curso de Excel Avançado
- Kit de Logos Profissionais
- Template de Apresentação
- Planilha de Gestão de Projetos
- Guia de SEO Completo

### Configurações Padrão
- Nome do site
- Descrição
- Moeda
- Limites de download
- Emails de contato
- Modo de manutenção

## Triggers Automáticos

### 1. **update_updated_at_column()**
Atualiza automaticamente o campo `updated_at` em todas as tabelas.

### 2. **update_download_count()**
Incrementa o contador de downloads quando um download é realizado.

## Relacionamentos

```
auth.users (1) ←→ (N) favorites
auth.users (1) ←→ (N) cart_items
auth.users (1) ←→ (N) avaliacoes
auth.users (1) ←→ (N) downloads
auth.users (1) ←→ (N) notificacoes

produtos (1) ←→ (N) favorites
produtos (1) ←→ (N) cart_items
produtos (1) ←→ (N) avaliacoes
produtos (1) ←→ (N) downloads

pagamentos (1) ←→ (N) downloads

categorias (1) ←→ (N) produtos (via category)
```

## Considerações de Performance

1. **Índices**: Criados para campos frequentemente consultados
2. **Constraints**: Validações de integridade no nível do banco
3. **RLS**: Segurança em nível de linha
4. **JSONB**: Para dados flexíveis como produtos em pagamentos
5. **Timestamps**: Controle automático de criação e atualização

## Backup e Manutenção

### Backup Recomendado
```bash
# Backup completo
pg_dump -h host -U user -d database > backup.sql

# Backup apenas dados
pg_dump -h host -U user -d database --data-only > data_backup.sql

# Backup apenas estrutura
pg_dump -h host -U user -d database --schema-only > schema_backup.sql
```

### Manutenção Regular
```sql
-- Analisar estatísticas
ANALYZE;

-- Vacuum para limpeza
VACUUM ANALYZE;

-- Reindexar se necessário
REINDEX DATABASE database_name;
```

## Monitoramento

### Queries Úteis para Monitoramento

```sql
-- Produtos mais vendidos
SELECT * FROM produtos_mais_vendidos LIMIT 10;

-- Estatísticas por categoria
SELECT * FROM estatisticas_produtos;

-- Pagamentos pendentes
SELECT COUNT(*) FROM pagamentos WHERE status = 'pending';

-- Downloads recentes
SELECT COUNT(*) FROM downloads WHERE created_at > NOW() - INTERVAL '24 hours';
```

Esta estrutura fornece uma base sólida e escalável para a plataforma Artfy.store, com todas as funcionalidades necessárias para uma loja digital completa. 
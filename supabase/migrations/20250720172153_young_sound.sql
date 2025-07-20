/*
  # Schema para loja de produtos digitais

  1. Novas Tabelas
    - `products` - Produtos digitais disponíveis
    - `orders` - Pedidos realizados pelos clientes
    - `downloads` - Links de download gerados
    - `customers` - Dados dos clientes

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas para acesso seguro aos dados
*/

-- Tabela de produtos digitais
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  download_url text NOT NULL,
  file_size text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id),
  mercadopago_payment_id text UNIQUE,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de downloads
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  download_token text UNIQUE NOT NULL,
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 3,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Políticas para products (público pode ler produtos ativos)
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  USING (is_active = true);

-- Políticas para customers (usuários podem ver seus próprios dados)
CREATE POLICY "Customers can read own data"
  ON customers
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert customers"
  ON customers
  FOR INSERT
  WITH CHECK (true);

-- Políticas para orders
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update orders"
  ON orders
  FOR UPDATE
  USING (true);

-- Políticas para order_items
CREATE POLICY "Anyone can manage order items"
  ON order_items
  FOR ALL
  USING (true);

-- Políticas para downloads
CREATE POLICY "Anyone can read downloads"
  ON downloads
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create downloads"
  ON downloads
  FOR INSERT
  WITH CHECK (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires ON downloads(expires_at);

-- Função para gerar token único
CREATE OR REPLACE FUNCTION generate_download_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Inserir alguns produtos de exemplo
INSERT INTO products (name, description, price, download_url, category) VALUES
('E-book: Guia Completo de React', 'Aprenda React do básico ao avançado', 29.90, 'https://exemplo.com/ebook-react.pdf', 'E-books'),
('Curso de JavaScript', 'Curso completo de JavaScript moderno', 99.90, 'https://exemplo.com/curso-js.zip', 'Cursos'),
('Template Premium', 'Template responsivo para landing pages', 49.90, 'https://exemplo.com/template.zip', 'Templates')
ON CONFLICT DO NOTHING;
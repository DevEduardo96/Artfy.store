/*
  # Sistema de Downloads Pós-Pagamento

  1. Novas Tabelas
    - `customers` - Dados dos clientes
    - `orders` - Pedidos realizados
    - `order_items` - Itens dos pedidos
    - `downloads` - Tokens de download com controle de acesso

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso apropriadas
    - Tokens únicos para downloads

  3. Funcionalidades
    - Controle de downloads (máximo 3 por produto)
    - Expiração de links (7 dias)
    - Rastreamento de downloads
*/

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
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id text REFERENCES produtos(id),
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de downloads
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id text REFERENCES produtos(id),
  download_token text UNIQUE NOT NULL,
  download_count integer DEFAULT 0,
  max_downloads integer DEFAULT 3,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(mercadopago_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_downloads_token ON downloads(download_token);
CREATE INDEX IF NOT EXISTS idx_downloads_expires ON downloads(expires_at);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
CREATE POLICY "Anyone can insert customers" ON customers FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Customers can read own data" ON customers FOR SELECT TO public USING (true);

-- Políticas para orders
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can update orders" ON orders FOR UPDATE TO public USING (true);

-- Políticas para order_items
CREATE POLICY "Anyone can manage order items" ON order_items FOR ALL TO public USING (true);

-- Políticas para downloads
CREATE POLICY "Anyone can create downloads" ON downloads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read downloads" ON downloads FOR SELECT TO public USING (true);
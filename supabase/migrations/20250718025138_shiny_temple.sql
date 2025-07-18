/*
  # Criar tabela de favoritos

  1. Nova Tabela
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para auth.users)
      - `product_id` (text, ID do produto)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `favorites`
    - Adicionar políticas para usuários autenticados gerenciarem seus próprios favoritos
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_product_unique 
ON favorites(user_id, product_id);

-- Habilitar RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política para usuários lerem seus próprios favoritos
CREATE POLICY "Users can read own favorites"
  ON favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política para usuários adicionarem favoritos
CREATE POLICY "Users can insert own favorites"
  ON favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários removerem seus próprios favoritos
CREATE POLICY "Users can delete own favorites"
  ON favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
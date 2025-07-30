# 🔧 Solução para Erro ao Salvar Pagamentos

## 🚨 Problema Identificado

O servidor está retornando erro 500 ao tentar salvar pagamentos:
```
📊 Status: 500 Internal Server Error
📄 Resposta: {"error":"Erro ao salvar pagamento"}
```

## 🔍 Diagnóstico

### 1. **Verificar Configuração do Supabase**

O erro indica que as variáveis de ambiente do Supabase não estão configuradas corretamente.

### 2. **Verificar Estrutura do Banco**

As tabelas podem não ter sido criadas no Supabase.

## 🔧 Soluções

### **Passo 1: Configurar Variáveis de Ambiente**

1. **Copie o arquivo de exemplo:**
   ```bash
   cd /home/eduardo/Área\ de\ Trabalho/Artfix/servidor-loja-digital
   cp env.example .env
   ```

2. **Configure as variáveis no arquivo `.env`:**
   ```env
   # Supabase
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
   SUPABASE_ANON_KEY=sua_anon_key_aqui
   
   # Mercado Pago
   MP_ACCESS_TOKEN=seu_access_token_aqui
   MP_PUBLIC_KEY=sua_public_key_aqui
   ```

### **Passo 2: Obter Credenciais do Supabase**

1. **Acesse o Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta

2. **Selecione seu projeto:**
   - Clique no projeto da Artfy.store

3. **Obtenha as credenciais:**
   - Vá em **Settings** → **API**
   - Copie:
     - **Project URL** → `SUPABASE_URL`
     - **anon public** → `SUPABASE_ANON_KEY`
     - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### **Passo 3: Criar Estrutura do Banco**

1. **Execute o SQL de setup:**
   - Vá em **SQL Editor** no Supabase
   - Cole o conteúdo do arquivo `database_setup.sql`
   - Execute o script

2. **Verifique se as tabelas foram criadas:**
   ```bash
   npm run check-db
   ```

### **Passo 4: Obter Credenciais do Mercado Pago**

1. **Acesse o Mercado Pago:**
   - Vá para [mercadopago.com.br](https://mercadopago.com.br)
   - Faça login na sua conta

2. **Obtenha as credenciais:**
   - Vá em **Desenvolvedores** → **Credenciais**
   - Copie:
     - **Access Token** → `MP_ACCESS_TOKEN`
     - **Public Key** → `MP_PUBLIC_KEY`

### **Passo 5: Testar Configuração**

1. **Teste o banco de dados:**
   ```bash
   npm run check-db
   ```

2. **Teste o servidor:**
   ```bash
   npm run test-server
   ```

## 🧪 Scripts de Verificação

### **Verificar Banco de Dados:**
```bash
npm run check-db
```

**O que verifica:**
- ✅ Existência das tabelas
- ✅ Estrutura das tabelas
- ✅ Permissões RLS
- ✅ Teste de inserção

### **Testar Servidor:**
```bash
npm run test-server
```

**O que testa:**
- ✅ Health check
- ✅ API endpoints
- ✅ Criação de pagamentos
- ✅ Consulta de produtos

## 📋 Checklist de Verificação

### **Configuração**
- [ ] Arquivo `.env` criado
- [ ] `SUPABASE_URL` configurado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
- [ ] `SUPABASE_ANON_KEY` configurado
- [ ] `MP_ACCESS_TOKEN` configurado
- [ ] `MP_PUBLIC_KEY` configurado

### **Banco de Dados**
- [ ] Tabela `produtos` existe
- [ ] Tabela `pagamentos` existe
- [ ] Tabela `favorites` existe
- [ ] Tabela `cart_items` existe
- [ ] Tabela `categorias` existe
- [ ] RLS configurado
- [ ] Teste de inserção funciona

### **Servidor**
- [ ] Health check OK
- [ ] API info OK
- [ ] Products endpoint OK
- [ ] Payment creation OK

## 🚨 Erros Comuns e Soluções

### **Erro: "Variáveis de ambiente do Supabase não configuradas"**
**Solução:** Configure o arquivo `.env` com as credenciais corretas.

### **Erro: "relation does not exist"**
**Solução:** Execute o SQL de setup no Supabase.

### **Erro: "permission denied"**
**Solução:** Verifique se o RLS está configurado corretamente.

### **Erro: "invalid access token"**
**Solução:** Verifique se o token do Mercado Pago está correto.

## 🔍 Logs de Debug

Para ver logs detalhados, execute:
```bash
NODE_ENV=development npm start
```

## 📞 Próximos Passos

1. **Configure as variáveis de ambiente**
2. **Execute o SQL de setup**
3. **Teste com `npm run check-db`**
4. **Teste com `npm run test-server`**
5. **Teste uma compra no frontend**

## 🎯 Resultado Esperado

Após as correções:
- ✅ Variáveis de ambiente configuradas
- ✅ Banco de dados estruturado
- ✅ Tabelas criadas e funcionando
- ✅ Pagamentos sendo salvos
- ✅ Sistema totalmente operacional

---

**Status**: 🔧 **EM CORREÇÃO**

**Data**: $(date)

**Versão**: 1.0.0 
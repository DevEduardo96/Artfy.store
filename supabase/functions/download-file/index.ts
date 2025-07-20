import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Token não fornecido', { status: 400 });
    }

    // Busca o download pelo token
    const { data: download, error: downloadError } = await supabase
      .from('downloads')
      .select(`
        *,
        products (name, download_url),
        orders (status)
      `)
      .eq('download_token', token)
      .single();

    if (downloadError || !download) {
      return new Response('Token inválido', { status: 404 });
    }

    // Verifica se o download ainda é válido
    const now = new Date();
    const expiresAt = new Date(download.expires_at);

    if (now > expiresAt) {
      return new Response('Link expirado', { status: 410 });
    }

    if (download.download_count >= download.max_downloads) {
      return new Response('Limite de downloads excedido', { status: 429 });
    }

    if (download.orders.status !== 'approved') {
      return new Response('Pagamento não aprovado', { status: 403 });
    }

    // Incrementa o contador de downloads
    await supabase
      .from('downloads')
      .update({ download_count: download.download_count + 1 })
      .eq('id', download.id);

    // Redireciona para o arquivo real
    return Response.redirect(download.products.download_url, 302);

  } catch (error) {
    console.error('❌ Erro no download:', error);
    
    return new Response(
      'Erro interno do servidor',
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
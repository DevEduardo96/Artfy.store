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
    const paymentId = url.pathname.split('/').pop();

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID não fornecido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Busca o pedido pelo payment_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('mercadopago_payment_id', paymentId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (order.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Pagamento não aprovado' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Busca os downloads do pedido
    const { data: downloads, error: downloadsError } = await supabase
      .from('downloads')
      .select(`
        download_token,
        produtos (nome)
      `)
      .eq('order_id', order.id);

    if (downloadsError || !downloads || downloads.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Downloads não encontrados' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Gera os links de download
    const downloadLinks = downloads.map(download => ({
      name: download.produtos.nome,
      url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/download-file?token=${download.download_token}`,
    }));

    return new Response(
      JSON.stringify({
        links: downloadLinks,
        // Para compatibilidade com código antigo
        link: downloadLinks[0]?.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro ao buscar links:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
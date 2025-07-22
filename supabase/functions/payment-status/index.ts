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
      .select('status, mercadopago_payment_id')
      .eq('mercadopago_payment_id', paymentId)
      .single();

    if (orderError || !order) {
      // Se não encontrou, consulta diretamente no Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!mpResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Pagamento não encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const paymentData = await mpResponse.json();
      
      return new Response(
        JSON.stringify({
          status: paymentData.status,
          qr_code_base64: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
          qr_code: paymentData.point_of_interaction?.transaction_data?.qr_code,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        status: order.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro ao consultar status:', error);
    
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
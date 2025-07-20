import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface WebhookPayload {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: number;
  user_id: number;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

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

    if (req.method === 'POST') {
      const payload: WebhookPayload = await req.json();
      
      console.log('📦 Webhook recebido:', payload);

      // Verifica se é uma notificação de pagamento
      if (payload.type === 'payment') {
        const paymentId = payload.data.id;
        
        // Consulta o status do pagamento no Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
          },
        });

        if (!mpResponse.ok) {
          throw new Error('Erro ao consultar pagamento no Mercado Pago');
        }

        const paymentData = await mpResponse.json();
        console.log('💳 Status do pagamento:', paymentData.status);

        // Atualiza o pedido no Supabase
        const { data: order, error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: paymentData.status,
            payment_method: paymentData.payment_method_id,
            updated_at: new Date().toISOString()
          })
          .eq('mercadopago_payment_id', paymentId)
          .select('*, order_items(*, products(*))')
          .single();

        if (updateError) {
          console.error('❌ Erro ao atualizar pedido:', updateError);
          throw updateError;
        }

        // Se o pagamento foi aprovado, envia email e cria downloads
        if (paymentData.status === 'approved' && order) {
          console.log('✅ Pagamento aprovado, processando...');

          // Busca dados do cliente
          const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', order.customer_id)
            .single();

          if (customer) {
            // Cria tokens de download para cada produto
            for (const item of order.order_items) {
              const downloadToken = crypto.randomUUID();
              
              await supabase
                .from('downloads')
                .insert({
                  order_id: order.id,
                  product_id: item.product_id,
                  download_token: downloadToken,
                  max_downloads: 5,
                  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });
            }

            // Chama a função para enviar email
            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-download-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: order.id,
                customerEmail: customer.email,
                customerName: customer.name,
              }),
            });

            if (!emailResponse.ok) {
              console.error('❌ Erro ao enviar email');
            } else {
              console.log('📧 Email enviado com sucesso');
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
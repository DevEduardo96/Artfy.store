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
      
      console.log('📦 Webhook recebido:', JSON.stringify(payload, null, 2));

      // Verifica se é uma notificação de pagamento
      if (payload.type === 'payment') {
        const paymentId = payload.data.id;
        
        console.log('💳 Consultando pagamento ID:', paymentId);

        // Consulta o status do pagamento no Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!mpResponse.ok) {
          const errorText = await mpResponse.text();
          console.error('❌ Erro ao consultar Mercado Pago:', errorText);
          throw new Error(`Erro ao consultar pagamento: ${mpResponse.status}`);
        }

        const paymentData = await mpResponse.json();
        console.log('💳 Dados do pagamento:', JSON.stringify({
          id: paymentData.id,
          status: paymentData.status,
          external_reference: paymentData.external_reference
        }, null, 2));

        // Busca o pedido pelo payment_id
        const { data: order, error: orderFindError } = await supabase
          .from('orders')
          .select(`
            *,
            customers (*),
            order_items (*, products (*))
          `)
          .eq('mercadopago_payment_id', paymentId)
          .single();

        if (orderFindError) {
          console.error('❌ Erro ao buscar pedido:', orderFindError);
          // Se não encontrou por payment_id, tenta por external_reference
          if (paymentData.external_reference) {
            const { data: orderByRef, error: orderByRefError } = await supabase
              .from('orders')
              .select(`
                *,
                customers (*),
                order_items (*, products (*))
              `)
              .eq('id', paymentData.external_reference)
              .single();

            if (orderByRefError) {
              console.error('❌ Pedido não encontrado por external_reference:', orderByRefError);
              throw new Error('Pedido não encontrado');
            }

            // Atualiza com o payment_id se não tinha
            if (!orderByRef.mercadopago_payment_id) {
              await supabase
                .from('orders')
                .update({ mercadopago_payment_id: paymentId })
                .eq('id', orderByRef.id);
            }

            order = orderByRef;
          } else {
            throw orderFindError;
          }
        }

        console.log('📦 Pedido encontrado:', order?.id, 'Status atual:', order?.status);

        // Atualiza o status do pedido
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: paymentData.status === 'approved' ? 'approved' : paymentData.status,
            payment_method: paymentData.payment_method_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar pedido:', updateError);
          throw updateError;
        }

        console.log('✅ Pedido atualizado para status:', paymentData.status);

        // Se o pagamento foi aprovado, processa downloads e email
        if (paymentData.status === 'approved' && order.status !== 'approved') {
          console.log('🎉 Pagamento aprovado! Processando downloads...');

          // Verifica se já existem downloads para este pedido
          const { data: existingDownloads } = await supabase
            .from('downloads')
            .select('id')
            .eq('order_id', order.id);

          if (!existingDownloads || existingDownloads.length === 0) {
            // Cria tokens de download para cada produto
            const downloadInserts = order.order_items.map((item: any) => ({
              order_id: order.id,
              product_id: item.product_id,
              download_token: crypto.randomUUID(),
              max_downloads: 5,
              download_count: 0,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }));

            const { error: downloadError } = await supabase
              .from('downloads')
              .insert(downloadInserts);

            if (downloadError) {
              console.error('❌ Erro ao criar downloads:', downloadError);
              throw downloadError;
            }

            console.log('📥 Downloads criados:', downloadInserts.length);

            // Envia email com os links de download
            try {
              const emailResponse = await fetch(
                `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-download-email`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    orderId: order.id,
                    customerEmail: order.customers.email,
                    customerName: order.customers.name,
                  }),
                }
              );

              if (emailResponse.ok) {
                console.log('📧 Email enviado com sucesso para:', order.customers.email);
              } else {
                const emailError = await emailResponse.text();
                console.error('❌ Erro ao enviar email:', emailError);
              }
            } catch (emailError) {
              console.error('❌ Erro na chamada do email:', emailError);
            }
          } else {
            console.log('ℹ️ Downloads já existem para este pedido');
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Webhook processado com sucesso'
        }),
        {
          status: 200,
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
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface PaymentRequest {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customer: {
    name: string;
    email: string;
  };
  total: number;
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
      const { items, customer, total }: PaymentRequest = await req.json();

      console.log('🛒 Processando pagamento:', { items: items.length, customer: customer.email, total });

      // 1. Criar ou buscar cliente
      let customerId: string;
      
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customer.email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log('👤 Cliente existente encontrado:', customerId);
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            email: customer.email,
          })
          .select('id')
          .single();

        if (customerError) {
          console.error('❌ Erro ao criar cliente:', customerError);
          throw customerError;
        }

        customerId = newCustomer.id;
        console.log('👤 Novo cliente criado:', customerId);
      }

      // 2. Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          total_amount: total,
          status: 'pending',
        })
        .select('id')
        .single();

      if (orderError) {
        console.error('❌ Erro ao criar pedido:', orderError);
        throw orderError;
      }

      console.log('📦 Pedido criado:', order.id);

      // 3. Criar itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Erro ao criar itens do pedido:', itemsError);
        throw itemsError;
      }

      console.log('📋 Itens do pedido criados:', orderItems.length);

      // 4. Criar pagamento no Mercado Pago
      const mpPayload = {
        transaction_amount: total,
        description: `Pedido ${order.id} - ${items.length} produto(s)`,
        payment_method_id: 'pix',
        payer: {
          email: customer.email,
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').slice(1).join(' ') || customer.name.split(' ')[0],
        },
        external_reference: order.id,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/webhook-mercadopago`,
      };

      console.log('💳 Criando pagamento no Mercado Pago...');

      const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('MP_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mpPayload),
      });

      if (!mpResponse.ok) {
        const errorText = await mpResponse.text();
        console.error('❌ Erro no Mercado Pago:', errorText);
        throw new Error(`Erro no Mercado Pago: ${mpResponse.status}`);
      }

      const paymentData = await mpResponse.json();
      console.log('✅ Pagamento criado no MP:', paymentData.id);

      // 5. Atualizar pedido com ID do pagamento
      const { error: updateError } = await supabase
        .from('orders')
        .update({ mercadopago_payment_id: paymentData.id })
        .eq('id', order.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar pedido:', updateError);
        throw updateError;
      }

      // 6. Retornar dados do pagamento
      return new Response(
        JSON.stringify({
          id: paymentData.id,
          status: paymentData.status,
          qr_code_base64: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
          qr_code: paymentData.point_of_interaction?.transaction_data?.qr_code,
          ticket_url: paymentData.point_of_interaction?.transaction_data?.ticket_url,
          order_id: order.id,
        }),
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
    console.error('❌ Erro ao processar pagamento:', error);
    
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
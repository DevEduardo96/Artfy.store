import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface EmailRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
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
      const { orderId, customerEmail, customerName }: EmailRequest = await req.json();

      // Busca os downloads do pedido
      const { data: downloads, error: downloadsError } = await supabase
        .from('downloads')
        .select(`
          *,
          produtos (nome, descricao)
        `)
        .eq('order_id', orderId);

      if (downloadsError) {
        throw downloadsError;
      }

      if (!downloads || downloads.length === 0) {
        throw new Error('Nenhum download encontrado para este pedido');
      }

      // Gera os links de download
      const downloadLinks = downloads.map(download => ({
        productName: download.produtos.nome,
        downloadUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/download-file?token=${download.download_token}`,
        expiresAt: new Date(download.expires_at).toLocaleDateString('pt-BR'),
      }));

      // Monta o HTML do email
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Seus Downloads Estão Prontos!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .download-item { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
            .download-btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Pagamento Aprovado!</h1>
              <p>Olá ${customerName}, seus produtos digitais estão prontos para download!</p>
            </div>
            <div class="content">
              <p>Seu pagamento foi processado com sucesso. Abaixo estão os links para download dos seus produtos:</p>
              
              ${downloadLinks.map(link => `
                <div class="download-item">
                  <h3>${link.productName}</h3>
                  <p>Clique no botão abaixo para fazer o download:</p>
                  <a href="${link.downloadUrl}" class="download-btn">📥 Baixar Agora</a>
                  <p><small>⏰ Link válido até: ${link.expiresAt}</small></p>
                </div>
              `).join('')}
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Cada link pode ser usado até 3 vezes</li>
                  <li>Os links expiram em 7 dias</li>
                  <li>Faça backup dos seus arquivos</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>Obrigado pela sua compra! 💜</p>
              <p>Se tiver alguma dúvida, entre em contato conosco.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Para desenvolvimento, vamos simular o envio do email
      // Em produção, você pode usar Resend, SendGrid, etc.
      console.log('📧 Email simulado enviado para:', customerEmail);
      console.log('📧 Conteúdo do email:', emailHtml);

      // Aqui você pode integrar com um provedor de email real:
      /*
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@seudominio.com',
          to: [customerEmail],
          subject: '🎉 Seus downloads estão prontos!',
          html: emailHtml,
        }),
      });
      */

      return new Response(
        JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
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
    console.error('❌ Erro ao enviar email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
import React, { useState, useEffect } from 'react';
import { CheckoutForm } from '../components/CheckoutForm';
import { PaymentStatus } from '../components/PaymentStatus';
import { CartItem, PaymentData } from '../types';
import { api } from '../services/api';

export const CheckoutPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  // Simule carregamento do carrinho se necessário
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (formData: { nomeCliente: string; email: string }) => {
    try {
      setIsLoading(true);

      // Mapeia os dados do carrinho para o formato esperado
      const carrinhoFormatado = cartItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const response = await api.post('/payments/criar-pagamento', {
        carrinho: carrinhoFormatado,
        nomeCliente: formData.nomeCliente,
        email: formData.email,
        total: totalAmount
      });

      setPaymentData(response.data); // Contém qrCodeBase64, paymentId etc.

    } catch (err) {
      console.error('Erro ao criar pagamento:', err);
      alert('Erro ao gerar QR Code do Pix. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {paymentData ? (
        <PaymentStatus paymentData={paymentData} onBack={handleBack} />
      ) : (
        <CheckoutForm
          items={cartItems}
          total={totalAmount}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

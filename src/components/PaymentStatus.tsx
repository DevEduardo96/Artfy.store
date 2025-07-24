import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Download, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { PaymentData, PaymentStatus as PaymentStatusType, DownloadResponse } from '../types';
import { api } from '../services/api';

interface PaymentStatusProps {
  paymentData: PaymentData;
  onBack: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentData, onBack }) => {
  const [status, setStatus] = useState<PaymentStatusType | null>(null);
  const [downloads, setDownloads] = useState<DownloadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const checkPaymentStatus = async () => {
    try {
      setError(null);
      const statusData = await api.getPaymentStatus(paymentData.id);
      setStatus(statusData);
      
      // Se aprovado e ainda não tem downloads, busca os links
      if (statusData.status === 'approved' && !downloads) {
        try {
          const downloadData = await api.getDownloadLinks(paymentData.id);
          setDownloads(downloadData);
        } catch (downloadError) {
          console.error('Erro ao buscar downloads:', downloadError);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    
    // Verifica status a cada 5 segundos se ainda não foi aprovado
    const interval = setInterval(() => {
      if (!status || (status.status !== 'approved' && status.status !== 'rejected')) {
        checkPaymentStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentData.id, status?.status]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />;
    
    switch (status?.status) {
      case 'approved':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    if (loading) return 'Verificando status do pagamento...';
    
    switch (status?.status) {
      case 'approved':
        return 'Pagamento aprovado! Seus downloads estão prontos.';
      case 'rejected':
        return 'Pagamento rejeitado. Tente novamente.';
      case 'cancelled':
        return 'Pagamento cancelado.';
      case 'pending':
        return 'Aguardando pagamento via PIX...';
      case 'in_process':
        return 'Pagamento em processamento...';
      default:
        return 'Verificando status...';
    }
  };

  const getStatusColor = () => {
    switch (status?.status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
      case 'cancelled':
        return 'text-red-600';
      case 'pending':
      case 'in_process':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      {/* Status Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
          {getStatusMessage()}
        </h2>
        {status && (
          <p className="text-gray-600">
            ID do Pagamento: {status.paymentId}
          </p>
        )}
      </div>

      {/* QR Code Section - Mostrar apenas se não aprovado */}
      {status?.status !== 'approved' && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Escaneie o QR Code para pagar
          </h3>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <img
                src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou copie o código PIX:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={paymentData.qr_code}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(paymentData.qr_code)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <a
              href={paymentData.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir no app do banco</span>
            </a>
          </div>
        </div>
      )}

      {/* Downloads Section */}
      {status?.status === 'approved' && downloads && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Seus Downloads
          </h3>
          
          <div className="space-y-3">
            {downloads.products.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Formato: {product.format} • Quantidade: {product.quantity}
                  </p>
                </div>
                {product.downloadUrl && (
                  <a
                    href={product.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Importante:</strong> Os links de download expiram em {downloads.expiresIn}. 
              Faça o download dos seus produtos o quanto antes.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Voltar à Loja
        </button>
        
        {status?.status !== 'approved' && (
          <button
            onClick={checkPaymentStatus}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Verificar Status</span>
          </button>
        )}
      </div>
    </div>
  );
};
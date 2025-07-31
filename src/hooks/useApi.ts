import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { Product, PaymentData, PaymentStatus, DownloadResponse, ProductFilters } from '../types';
import toast from 'react-hot-toast';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useApi = () => {
  const [products, setProducts] = useState<ApiState<Product[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const [payment, setPayment] = useState<ApiState<PaymentData>>({
    data: null,
    loading: false,
    error: null,
  });

  const [paymentStatus, setPaymentStatus] = useState<ApiState<PaymentStatus>>({
    data: null,
    loading: false,
    error: null,
  });

  const [downloadLinks, setDownloadLinks] = useState<ApiState<DownloadResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  // Função genérica para executar operações da API
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    setState: React.Dispatch<React.SetStateAction<ApiState<T>>>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      
      if (successMessage) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setState({ data: null, loading: false, error: errorMsg });
      
      const finalErrorMessage = errorMessage || errorMsg;
      toast.error(finalErrorMessage);
      
      return null;
    }
  }, []);

  // Produtos
  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    return executeApiCall(
      () => api.getProducts(filters),
      setProducts,
      undefined,
      'Erro ao carregar produtos'
    );
  }, [executeApiCall]);

  const fetchProductById = useCallback(async (id: number) => {
    return executeApiCall(
      () => api.getProductById(id),
      setProducts,
      undefined,
      'Erro ao carregar produto'
    );
  }, [executeApiCall]);

  const searchProducts = useCallback(async (query: string) => {
    return executeApiCall(
      () => api.searchProducts(query),
      setProducts,
      undefined,
      'Erro ao buscar produtos'
    );
  }, [executeApiCall]);

  // Pagamentos
  const createPayment = useCallback(async (data: any) => {
    return executeApiCall(
      () => api.createPayment(data),
      setPayment,
      'Pagamento criado com sucesso!',
      'Erro ao criar pagamento'
    );
  }, [executeApiCall]);

  const getPaymentStatus = useCallback(async (paymentId: string) => {
    return executeApiCall(
      () => api.getPaymentStatus(paymentId),
      setPaymentStatus,
      undefined,
      'Erro ao consultar status do pagamento'
    );
  }, [executeApiCall]);

  const getDownloadLinks = useCallback(async (paymentId: string) => {
    return executeApiCall(
      () => api.getDownloadLinks(paymentId),
      setDownloadLinks,
      'Links de download carregados!',
      'Erro ao obter links de download'
    );
  }, [executeApiCall]);

  // Utilitários
  const wakeUpServer = useCallback(async () => {
    try {
      await api.wakeUpServer();
      toast.success('Servidor está ativo!');
    } catch (error) {
      toast.error('Servidor não está respondendo');
    }
  }, []);

  // Reset states
  const resetProducts = useCallback(() => {
    setProducts({ data: null, loading: false, error: null });
  }, []);

  const resetPayment = useCallback(() => {
    setPayment({ data: null, loading: false, error: null });
  }, []);

  const resetPaymentStatus = useCallback(() => {
    setPaymentStatus({ data: null, loading: false, error: null });
  }, []);

  const resetDownloadLinks = useCallback(() => {
    setDownloadLinks({ data: null, loading: false, error: null });
  }, []);

  return {
    // States
    products,
    payment,
    paymentStatus,
    downloadLinks,
    
    // Actions
    fetchProducts,
    fetchProductById,
    searchProducts,
    createPayment,
    getPaymentStatus,
    getDownloadLinks,
    wakeUpServer,
    
    // Reset functions
    resetProducts,
    resetPayment,
    resetPaymentStatus,
    resetDownloadLinks,
  };
}; 
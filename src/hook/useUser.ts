import { useState, useEffect, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Função para atualizar o estado da autenticação
    const setAuth = (session: Session | null) => {
      if (!mounted) return;

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true,
      });

      // Limpar timeout anterior
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      // Configurar próximo refresh apenas se necessário
      if (session && session.expires_at) {
        const expiresAt = session.expires_at * 1000; // Converter para milliseconds
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // Só agendar refresh se faltam mais de 5 minutos para expirar
        if (timeUntilExpiry > 5 * 60 * 1000) {
          const refreshTime = timeUntilExpiry - 10 * 60 * 1000; // 10 minutos antes de expirar

          if (refreshTime > 0) {
            refreshTimeoutRef.current = setTimeout(async () => {
              if (!isRefreshingRef.current && mounted) {
                isRefreshingRef.current = true;
                try {
                  await supabase.auth.refreshSession();
                } catch (error) {
                  console.error("Erro no refresh programado:", error);
                } finally {
                  isRefreshingRef.current = false;
                }
              }
            }, refreshTime);
          }
        }
      }
    };

    // Recuperar sessão inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao recuperar sessão:", error);
        }

        setAuth(session);
      } catch (error) {
        console.error("Erro na inicialização da auth:", error);
        setAuth(null);
      }
    };

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Auth state changed:", event, session?.user?.id);
      }

      // Evitar processamento desnecessário de TOKEN_REFRESHED
      if (event === "TOKEN_REFRESHED" && isRefreshingRef.current) {
        isRefreshingRef.current = false;
        return;
      }

      // Debounce para evitar múltiplas atualizações
      setTimeout(() => {
        if (mounted) {
          setAuth(session);
        }
      }, 100);
    });

    // Inicializar
    getInitialSession();

    // Cleanup
    return () => {
      mounted = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Função para fazer logout
  const signOut = async () => {
    try {
      // Limpar timeout de refresh
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro no logout:", error);
        throw error;
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  };

  // Função para refresh manual da sessão
  const refreshSession = async () => {
    if (isRefreshingRef.current) {
      return authState.session;
    }

    try {
      isRefreshingRef.current = true;
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Erro ao renovar sessão:", error);
        throw error;
      }
      return data.session;
    } catch (error) {
      console.error("Erro ao renovar sessão:", error);
      throw error;
    } finally {
      isRefreshingRef.current = false;
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    isAuthenticated: !!authState.user,
    signOut,
    refreshSession,
  };
};

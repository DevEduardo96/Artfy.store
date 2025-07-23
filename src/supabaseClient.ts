import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase URL ou KEY não definidos.");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: window.localStorage,
    storageKey: "supabase.auth.token",
    debug: false, // Desabilitado para reduzir logs
    // Configurações para evitar refresh excessivo
    refreshThreshold: 60, // Só refresh quando faltam 60 segundos para expirar
    retryDelay: 2000, // 2 segundos entre tentativas
    maxRetries: 3, // Máximo 3 tentativas de refresh
  },
});

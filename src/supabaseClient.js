import { createClient } from '@supabase/supabase-js';

// Variables de entorno para Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación de credenciales
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Configuración de Supabase incompleta');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? '✅ Presente' : '❌ Ausente');
  throw new Error('Faltan las credenciales de Supabase');
}

// Detectar si estamos en un entorno móvil (Capacitor)
const isCapacitor = typeof window !== 'undefined' && 
  (window.Capacitor || window.cordova || window.PhoneGap);

// Configurar fetch
let fetchImplementation;
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  fetchImplementation = window.fetch.bind(window);
} else if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
  fetchImplementation = globalThis.fetch.bind(globalThis);
} else {
  throw new Error('No se encontró implementación de fetch');
}

// Configuración específica para móvil vs web
const authConfig = {
  flowType: 'pkce',
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: !isCapacitor, // Desactivar en móvil
  // Para móvil, usar almacenamiento local
  storage: isCapacitor ? undefined : window.localStorage
};

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchImplementation,
  },
  auth: authConfig
});

// Log de confirmación
console.log(`✅ Cliente Supabase creado - Entorno: ${isCapacitor ? 'Móvil' : 'Web'}`);

// Función auxiliar para verificar la conexión
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    return { connected: !error, error };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};
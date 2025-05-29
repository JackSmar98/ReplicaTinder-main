// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';
import crossFetch from 'cross-fetch';

// Revisa si necesitas cargar desde .env o si las tendrás hardcodeadas
// Si esta rama SÍ usa .env, asegúrate de tenerlo configurado en tu Codespace
// y cambia las siguientes dos líneas para leer de import.meta.env.VITE_...
const supabaseUrl = 'https://ztuexxjwdsvsssgmhyju.supabase.co'; // O import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0dWV4eGp3ZHN2c3NzZ21oeWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODE3MTMsImV4cCI6MjA2NDA1NzcxM30.U60DIbbO0pJlZR2rjYKK9WinHZ_uPc708oP2rPF65RI'; // O import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('[DEBUG supabaseClient] URL:', supabaseUrl ? 'Cargada' : 'NO Cargada'); // Log simple

let fetchToUse;
let fetchSource = "";

if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    fetchToUse = window.fetch.bind(window);
    fetchSource = "window.fetch (bound)";
} else if (typeof crossFetch === 'function') {
    fetchToUse = crossFetch;
    fetchSource = "cross-fetch";
} else {
    console.error('[FATAL supabaseClient] ¡No se encontró una implementación de fetch válida!');
}
console.log(`[DEBUG supabaseClient] Usando fetch: ${fetchSource} (Type: ${typeof fetchToUse})`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: fetchToUse,
    },
    auth: {
        storage: {
            async getItem(key) { try { const { value } = await Preferences.get({ key }); /* console.log(`[GET ITEM] ${key}: ${value ? 'OK' : 'null'}`); */ return value; } catch (e) { console.error(`[STORAGE getItem] error:`, e); return null; }},
            async setItem(key, value) { try { await Preferences.set({ key, value }); /* console.log(`[SET ITEM] ${key}: OK`); */ } catch (e) { console.error(`[STORAGE setItem] error:`, e); }},
            async removeItem(key) { try { await Preferences.remove({ key }); /* console.log(`[REMOVE ITEM] ${key}: OK`); */ } catch (e) { console.error(`[STORAGE removeItem] error:`, e); }},
        },
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
console.log('[DEBUG supabaseClient] Cliente Supabase configurado.');
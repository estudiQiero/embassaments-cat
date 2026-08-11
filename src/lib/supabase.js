// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de solo lectura, con la clave "anon". Se usa desde las
 * páginas Astro (SSR) para leer el histórico y calcular comparativas
 * ("hace 7/30/365 días"). La tabla tiene RLS activado en modo
 * solo-lectura pública — ver supabase/schema.sql.
 */
export function getReadClient() {
  const url = import.meta.env.SUPABASE_URL;
  const anonKey = import.meta.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Falten SUPABASE_URL / SUPABASE_ANON_KEY en las variables de entorno.');
  }
  return createClient(url, anonKey);
}

/**
 * Cliente de escritura, con la clave "service role". SOLO se usa
 * dentro de netlify/functions/sync-embassaments.mts (entorno de
 * servidor, nunca llega al navegador). Esta clave nunca debe llevar
 * el prefijo PUBLIC_ ni exponerse en código de cliente.
 */
export function getWriteClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Falten SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en las variables de entorno de Netlify.');
  }
  return createClient(url, serviceKey);
}

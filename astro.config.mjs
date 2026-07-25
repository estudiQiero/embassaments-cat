import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

// SSR (output: 'server') porque cada visita necesita datos frescos
// de la ACA y del histórico en Supabase. El adaptador de Netlify
// convierte cada página en una función servida por CDN con caché.
export default defineConfig({
  output: 'server',
  adapter: netlify(),
});

// Ejecuta manualmente lo mismo que hace netlify/functions/sync-embassaments.mts,
// para probarlo en local antes de confiar en el cron.
// Uso:  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run sync
import { createClient } from '@supabase/supabase-js';
import { fetchLiveData } from '../src/lib/embassaments.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const dades = await fetchLiveData(fetch);
const files = dades
  .filter((e) => e.dia && e.volum !== null)
  .map((e) => ({
    estaci: e.estaci,
    dia: e.dia,
    nivell_absolut: e.nivellAbsolut,
    volum: e.volum,
    percentatge: e.percentatge,
  }));

if (files.length === 0) {
  console.warn('No hay filas válidas hoy.');
  process.exit(0);
}

const { error } = await supabase
  .from('lectures_embassaments')
  .upsert(files, { onConflict: 'estaci,dia' });

if (error) {
  console.error('Error:', error);
  process.exit(1);
}

console.log(`OK: ${files.length} lecturas guardadas.`);

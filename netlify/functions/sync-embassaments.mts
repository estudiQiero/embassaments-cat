import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveData } from '../../src/lib/embassaments.js';

// Se ejecuta sola cada día a las 06:00 UTC (la ACA publica sus datos
// hacia el mediodía, así que a esa hora ya tenemos los del día
// anterior consolidados). Cambia la expresión cron si lo prefieres
// a otra hora.
export default async () => {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const dades = await fetchLiveData();

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
    console.warn('Sync: la ACA no ha devuelto filas válidas hoy, no se escribe nada.');
    return new Response('Sin datos nuevos', { status: 200 });
  }

  // upsert por (estaci, dia): si la función se ejecuta dos veces el
  // mismo día, o la ACA corrige un dato, no duplicamos filas.
  const { error } = await supabase
    .from('lectures_embassaments')
    .upsert(files, { onConflict: 'estaci,dia' });

  if (error) {
    console.error('Error escribiendo en Supabase:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  console.log(`Sync OK: ${files.length} lecturas guardadas.`);
  return new Response(`${files.length} lecturas guardadas`, { status: 200 });
};

export const config: Config = {
  schedule: '0 6 * * *',
};

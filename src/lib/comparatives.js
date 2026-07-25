// src/lib/comparatives.js
const PERIODES = [
  { id: 'ahir', label: 'Ahir', dies: 1 },
  { id: 'fa7', label: 'Fa 7 dies', dies: 7 },
  { id: 'fa30', label: 'Fa 30 dies', dies: 30 },
  { id: 'fa365', label: "Fa 1 any", dies: 365 },
];

function restaDies(dataISO, dies) {
  const d = new Date(`${dataISO}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dies);
  return d.toISOString().split('T')[0];
}

/**
 * Para cada periodo (ayer, 7d, 30d, 365d), busca en el histórico de
 * Supabase la fecha exacta objetivo (si no hay dato de ese día exacto
 * -por ejemplo, si el cron falló un día- simplemente no se muestra
 * ese periodo en vez de dar un dato erróneo).
 */
export async function calculaComparatives(supabase, dataReferencia, volumAvui) {
  const resultats = [];

  for (const periode of PERIODES) {
    const dataObjectiu = restaDies(dataReferencia, periode.dies);

    const { data, error } = await supabase
      .from('lectures_embassaments')
      .select('volum')
      .eq('dia', dataObjectiu);

    if (error || !data || data.length === 0) {
      resultats.push({ ...periode, disponible: false });
      continue;
    }

    const volumHistoric = data.reduce((acc, fila) => acc + (fila.volum ?? 0), 0);
    resultats.push({
      ...periode,
      disponible: true,
      diferencia: volumAvui - volumHistoric,
    });
  }

  return resultats;
}

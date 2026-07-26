// src/lib/comparatives.js
import { fetchVolumEnData } from './embassaments.js';

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
 * la ACA la lectura más reciente con fecha igual o anterior a la
 * fecha objetivo (si no hay ningún dato hasta esa fecha, simplemente
 * no se muestra ese periodo en vez de dar un dato erróneo).
 */
export async function calculaComparatives(dataReferencia, volumAvui, fetchFn) {
  const resultats = await Promise.all(
    PERIODES.map(async (periode) => {
      const dataObjectiu = restaDies(dataReferencia, periode.dies);
      const dades = await fetchVolumEnData(dataObjectiu, fetchFn);

      if (!dades) {
        return { ...periode, disponible: false };
      }

      return {
        ...periode,
        disponible: true,
        diferencia: volumAvui - dades.volumTotal,
      };
    })
  );

  return resultats;
}

// src/lib/embassaments.js
//
// Capa de datos compartida. La usan tanto la página (SSR) como la
// ruta /api/embassaments.json y la función programada de sync.
//
// Fuente: dataset obert de l'ACA a Analisi.Transparenciacatalunya.cat
// (Socrata). Es públic i admet CORS, així que no calen ni proxy ni
// Puppeteer per llegir-lo — per això s'ha eliminat aquella dependència
// del projecte antic, que a més no s'arribava a fer servir mai.
const ACA_ENDPOINT = 'https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json';

// Embassaments de les conques internes que volem seguir.
// Clau = nom exacte tal com apareix al camp "estaci" del dataset.
// poblacio = habitants del municipi on hi ha l'embassament (INE/Idescat 2025).
export const EMBASSAMENTS = [
  { estaci: 'Embassament de la Baells (Cercs)', slug: 'baells', municipi: 'Cercs', poblacio: 1193, imatge: 'baells.jpg' },
  { estaci: 'Embassament de Sau (Vilanova de Sau)', slug: 'sau', municipi: 'Vilanova de Sau', poblacio: 325, imatge: 'sau.jpg' },
  { estaci: 'Embassament de Susqueda (Osor)', slug: 'susqueda', municipi: 'Osor', poblacio: 430, imatge: 'susqueda.jpg' },
  { estaci: 'Embassament de Sant Ponç (Clariana de Cardener)', slug: 'sant-ponc', municipi: 'Clariana de Cardener', poblacio: 160, imatge: 'sant-ponc.jpg' },
  { estaci: 'Embassament de la Llosa del Cavall (Navès)', slug: 'llosa-del-cavall', municipi: 'Navès', poblacio: 292, imatge: 'llosa_del_cavall.webp' },
  { estaci: 'Embassament de Foix (Castellet i la Gornal)', slug: 'foix', municipi: 'Castellet i la Gornal', poblacio: 2776, imatge: 'foix_albertsampietro_com.webp' },
  { estaci: 'Embassament de Siurana (Cornudella de Montsant)', slug: 'siurana', municipi: 'Cornudella de Montsant', poblacio: 999, imatge: 'Siurana_turismesiurana_org.webp' },
  { estaci: 'Embassament de Darnius Boadella (Darnius)', slug: 'darnius-boadella', municipi: 'Darnius', poblacio: 563, imatge: 'Darnius_Boadella_El_punt_Avui.webp' },
  { estaci: 'Embassament de Riudecanyes (Riudecanyes)', slug: 'riudecanyes', municipi: 'Riudecanyes', poblacio: 1362, imatge: 'riudecanyes.jpg' },
  { estaci: "Embassament d'Oliana (Oliana)", slug: 'oliana', municipi: 'Oliana', poblacio: 1874, imatge: 'oliana.jpg' },
];

const NOMS_VALIDS = new Set(EMBASSAMENTS.map((e) => e.estaci));

function netejaNum(valor) {
  const n = parseFloat(valor);
  return Number.isFinite(n) ? n : null;
}

/**
 * Demana al dataset de l'ACA les lectures més recents (Socrata torna
 * per defecte les files més noves primer si ordenem per "dia DESC").
 * Ens quedem només amb l'última lectura de cada embassament seguit.
 */
export async function fetchLiveData(fetchFn = fetch) {
  const url = new URL(ACA_ENDPOINT);
  url.searchParams.set('$order', 'dia DESC');
  url.searchParams.set('$limit', '500'); // marge de sobres per cobrir els 10 embassaments del dia més recent

  const resposta = await fetchFn(url.toString());
  if (!resposta.ok) {
    throw new Error(`ACA ha respost ${resposta.status}`);
  }
  const files = await resposta.json();

  const ultimaPerEmbassament = new Map();
  for (const fila of files) {
    const nom = fila.estaci?.trim();
    if (!nom || !NOMS_VALIDS.has(nom)) continue;
    if (!ultimaPerEmbassament.has(nom)) {
      ultimaPerEmbassament.set(nom, fila);
    }
  }

  return EMBASSAMENTS.map((meta) => {
    const fila = ultimaPerEmbassament.get(meta.estaci);
    return {
      ...meta,
      dia: fila?.dia?.split('T')[0] ?? null,
      nivellAbsolut: fila ? netejaNum(fila.nivell_absolut) : null,
      volum: fila ? netejaNum(fila.volum_embassat) : null,
      percentatge: fila ? netejaNum(fila.percentatge_volum_embassat) : null,
    };
  });
}

/** Resum agregat (volum total i % mitjà) a partir de la llista d'embassaments. */
export function calculaResum(embassaments) {
  const ambDades = embassaments.filter((e) => e.volum !== null);
  const volumTotal = ambDades.reduce((acc, e) => acc + e.volum, 0);
  const percentatgeMitja = ambDades.length
    ? ambDades.reduce((acc, e) => acc + (e.percentatge ?? 0), 0) / ambDades.length
    : null;
  const dataMesRecent = ambDades
    .map((e) => e.dia)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

  return { volumTotal, percentatgeMitja, dataMesRecent, capacitatMaxima: 700 };
}

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const URL_ACA = 'https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json';
const SORTIDA = path.join(__dirname, '../public/dades.json');

async function generarDades() {
  try {
    const resposta = await fetch(URL_ACA);
    const dades = await resposta.json();

    // Filtrar i processar només les Conques Internes
    const conquesInternes = [
      "Embassament de la Baells (Cercs)",
      "Embassament de Sau (Vilanova de Sau)",
      "Embassament de Susqueda (Osor)",
      "Embassament de Sant Ponç (Clariana de Cardener)",
      "Embassament de la Llosa del Cavall (Navès)",
      "Embassament de Foix (Castellet i la Gornal)",
      "Embassament de Siurana (Cornudella de Montsant)",
      "Embassament de Darnius Boadella (Darnius)",
      "Embassament de Riudecanyes (Riudecanyes)",
      "Embassament d'Oliana (Oliana)"
    ];

    const dadesFiltrades = dades.filter(emb => conquesInternes.includes(emb.estaci?.trim()));

    fs.writeFileSync(SORTIDA, JSON.stringify(dadesFiltrades, null, 2), 'utf-8');
    console.log('✅ dades.json generat correctament');

  } catch (error) {
    console.error('❌ Error generant dades.json:', error);
  }
}

generarDades();

// 📅 Funció per formatar la data com YYYY-MM-DD
function formatData(data) {
  return data.toISOString().split('T')[0];
}

// 🕰️ Trobar la dada més propera a una data objectiu
function trobarDadaMesPropera(dades, dataObjectiu) {
  if (dades.length === 0) return null;
  return dades.reduce((mesProper, actual) => {
    const difActual = Math.abs(new Date(actual.dia) - dataObjectiu);
    const difAnterior = Math.abs(new Date(mesProper.dia) - dataObjectiu);
    return difActual < difAnterior ? actual : mesProper;
  });
}

// 🎯 Actualitzar les càpsules del <header>
function injectarDadesHeader(data, volum, percentatge, comparatives) {
  document.getElementById('ultima-data').textContent = data;
  document.getElementById('volum-total').textContent = `${volum.toFixed(1)} hm³`;
  document.getElementById('percentatge-mitja').textContent = `${percentatge.toFixed(1)}%`;

  const actualitzaComparativa = (id, dif) => {
    const icona = dif > 0 ? '🔼' : dif < 0 ? '🔽' : '➖';
    const color = dif > 0 ? 'green' : dif < 0 ? 'red' : '#555';
    document.getElementById(id).innerHTML =
      `<span style="color: ${color}">${dif > 0 ? '+' : ''}${dif.toFixed(1)} hm³ ${icona}</span>`;
  };

  actualitzaComparativa('dif-1dia', comparatives['ahir']);
  actualitzaComparativa('dif-7dies', comparatives['fa 7 dies']);
  actualitzaComparativa('dif-30dies', comparatives['fa 30 dies']);
}

// 🚀 Càrrega i processament principal
async function carregarDadesEmbassaments() {
  try {
    const resposta = await fetch('/api/embassaments');
    const dades = await resposta.json();

    // 📌 Conques Internes
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

    const dadesFiltrades = dades.filter(emb =>
      conquesInternes.includes(emb.estaci?.trim())
    );

    if (dadesFiltrades.length === 0) throw new Error('No s\'han trobat dades útils');

    // 🕒 Grups per estació (últim registre per cada embassament)
    const mapEmb = new Map();
    dadesFiltrades.forEach(emb => {
      const anterior = mapEmb.get(emb.estaci);
      if (!anterior || new Date(emb.dia) > new Date(anterior.dia)) {
        mapEmb.set(emb.estaci, emb);
      }
    });
    const embassamentsAvui = Array.from(mapEmb.values());

    // 📊 Càlculs
    let totalVolum = 0;
    let totalPercentatge = 0;
    embassamentsAvui.forEach(emb => {
      totalVolum += parseFloat(emb.volum_embassat) || 0;
      totalPercentatge += parseFloat(emb.percentatge_volum_embassat) || 0;
    });

    const percentatgeMitja = totalPercentatge / embassamentsAvui.length;
    const dataComuna = embassamentsAvui[0]?.dia?.split('T')[0] || 'Data no disponible';

    // 📈 Comparatives
    const avui = new Date();
    const comparatives = {};
    const diesComparacio = [
      { id: 'ahir', dies: 1 },
      { id: 'fa 7 dies', dies: 7 },
      { id: 'fa 30 dies', dies: 30 }
    ];

    for (const comp of diesComparacio) {
      const dataObjectiu = new Date(avui.getTime() - comp.dies * 24 * 60 * 60 * 1000);
      const dadaPropera = trobarDadaMesPropera(dadesFiltrades, dataObjectiu);

      // Total volum en aquella data
      const mapComparativa = new Map();
      dadesFiltrades
        .filter(d => new Date(d.dia).getTime() === new Date(dadaPropera.dia).getTime())
        .forEach(d => {
          if (!mapComparativa.has(d.estaci)) {
            mapComparativa.set(d.estaci, d);
          }
        });

      const volumPropera = Array.from(mapComparativa.values())
        .reduce((acc, emb) => acc + (parseFloat(emb.volum_embassat) || 0), 0);

      comparatives[comp.id] = totalVolum - volumPropera;
    }

    // 🎯 Injectem dades al header
    injectarDadesHeader(dataComuna, totalVolum, percentatgeMitja, comparatives);

  } catch (error) {
    console.error('Error carregant dades:', error);
    document.getElementById('ultima-data').textContent = 'Error';
    document.getElementById('volum-total').textContent = '--';
    document.getElementById('percentatge-mitja').textContent = '--';
    document.getElementById('dif-1dia').textContent = '--';
    document.getElementById('dif-7dies').textContent = '--';
    document.getElementById('dif-30dies').textContent = '--';
  }
}

carregarDadesEmbassaments();

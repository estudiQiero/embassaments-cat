// 📸 Imatges dels embassaments
const imatgesEmbassaments = {
    "Embassament de la Baells (Cercs)": "baells.jpg",
    "Embassament de Sau (Vilanova de Sau)": "sau.jpg",
    "Embassament de Susqueda (Osor)": "susqueda.jpg",
    "Embassament de Sant Ponç (Clariana de Cardener)": "sant-ponc.jpg",
    "Embassament de la Llosa del Cavall (Navès)": "llosa_del_cavall.webp",
    "Embassament de Foix (Castellet i la Gornal)": "foix_albertsampietro_com.webp",
    "Embassament de Siurana (Cornudella de Montsant)": "Siurana_turismesiurana_org.webp",
    "Embassament de Darnius Boadella (Darnius)": "Darnius_Boadella_El_punt_Avui.webp",
    "Embassament de Riudecanyes (Riudecanyes)": "riudecanyes.jpg",
    "Embassament d'Oliana (Oliana)": "oliana.jpg"
  };
  
  // 📅 Funció utilitat per formatar la data com YYYY-MM-DD
  function formatData(data) {
    return data.toISOString().split('T')[0];
  }
  
  // 🕰️ Funció per trobar la dada més propera a una data objectiu
  function trobarDadaMesPropera(dades, dataObjectiu) {
    if (dades.length === 0) return null;
    return dades.reduce((mésProper, actual) => {
      const diferenciaActual = Math.abs(new Date(actual.dia) - dataObjectiu);
      const diferenciaMesProper = Math.abs(new Date(mésProper.dia) - dataObjectiu);
      return diferenciaActual < diferenciaMesProper ? actual : mésProper;
    });
  }
  
  // 🧩 Funció utilitat per generar l'HTML de comparativa amb icones SVG
  function generarComparativaHTML(descripcio, diferencia, diesDiferencia) {
    const iconaPujada = `<svg width="12" height="12" viewBox="0 0 24 24" fill="green" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/></svg>`;
    const iconaBaixada = `<svg width="12" height="12" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l1.41-1.41L11 16.17V4h2v12.17l5.59-5.58L20 12l-8 8-8-8z"/></svg>`;
    const iconaSenseCanvi = `<span>➖</span>`;
  
    let icona;
    if (diferencia > 0) icona = iconaPujada;
    else if (diferencia < 0) icona = iconaBaixada;
    else icona = iconaSenseCanvi;
  
    let diesText;
    if (diesDiferencia === 0 || diesDiferencia === 1) {
      diesText = descripcio; // 👈 Aquí és la clau: utilitzem el text del període
    } else {
      diesText = `fa ${diesDiferencia} dies`;
    }
  
    return `<p><strong>Respecte ${diesText}:</strong> ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)} hm³ ${icona}</p>`;
  }
  
  
  // 🚀 Funció principal per carregar dades i pintar la web
  async function carregarDades() {
    try {
      const resposta = await fetch('/api/embassaments');
      const dades = await resposta.json();
  
      const container = document.getElementById('embassaments');
      const resumContainer = document.getElementById('resum');
      const graficaContainer = document.getElementById('grafica');
  
      container.innerHTML = '';
      resumContainer.innerHTML = '';
      graficaContainer.innerHTML = '<canvas id="velocimetre"></canvas>';
  
      if (!Array.isArray(dades) || dades.length === 0) {
        container.innerHTML = '<p>No s\'han trobat dades dels embassaments.</p>';
        resumContainer.innerHTML = '<p>No s\'ha pogut calcular el resum.</p>';
        return;
      }
  
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
  
      const conquesDades = dades.filter(emb => conquesInternes.includes(emb.estaci?.trim()));
  
      if (conquesDades.length === 0) {
        container.innerHTML = '<p>No s\'han trobat dades de les Conques Internes.</p>';
        resumContainer.innerHTML = '<p>No s\'ha pogut calcular el resum.</p>';
        return;
      }
  
      // 📅 Definim les dates de comparació
      const avui = new Date();
      const datesComparativa = [
        { nom: 'ahir', data: new Date(avui.getTime() - (1 * 24 * 60 * 60 * 1000)) },
        { nom: 'fa 7 dies', data: new Date(avui.getTime() - (7 * 24 * 60 * 60 * 1000)) },
        { nom: 'fa 30 dies', data: new Date(avui.getTime() - (30 * 24 * 60 * 60 * 1000)) },
        { nom: 'fa 365 dies', data: new Date(avui.getFullYear() - 1, avui.getMonth(), avui.getDate()) },
      ];
      
  
    // 🗂️ Map per mantenir només l'últim registre per embassament
    const embassamentsMap = new Map();
    conquesDades.forEach(emb => {
      const existing = embassamentsMap.get(emb.estaci);
      if (!existing || new Date(emb.dia) > new Date(existing.dia)) {
        embassamentsMap.set(emb.estaci, emb);
      }
    });

    const embassamentsUnics = Array.from(embassamentsMap.values());

    // 📊 Càlcul volum total i percentatge mitjà actual
    let totalVolumAvui = 0;
    let totalPercentatgeAvui = 0;

    embassamentsUnics.forEach(emb => {
      const volum = parseFloat(emb.volum_embassat) || 0;
      const percentatge = parseFloat(emb.percentatge_volum_embassat) || 0;

      totalVolumAvui += volum;
      totalPercentatgeAvui += percentatge;
    });

    const percentatgeMitjaAvui = (totalPercentatgeAvui / embassamentsUnics.length).toFixed(1);
    const dataComuna = embassamentsUnics[0]?.dia?.split('T')[0] || 'Data no disponible';

    // 🧩 Generar comparatives dinàmiques
    let comparativesHTML = '';
    datesComparativa.forEach(period => {
      const dadesPropera = trobarDadaMesPropera(conquesDades, period.data);

      if (dadesPropera) {
        // 🧮 Calculem volum total de la data més propera trobada
        const embassamentsMapPropera = new Map();
        const dataPropera = new Date(dadesPropera.dia);
        const diesDiferencia = Math.round(Math.abs((dataPropera - period.data) / (1000 * 60 * 60 * 24)));

        conquesDades
          .filter(emb => new Date(emb.dia).getTime() === new Date(dadesPropera.dia).getTime())
          .forEach(emb => {
            const existing = embassamentsMapPropera.get(emb.estaci);
            if (!existing || new Date(emb.dia) > new Date(existing.dia)) {
              embassamentsMapPropera.set(emb.estaci, emb);
            }
          });

        const embassamentsPropera = Array.from(embassamentsMapPropera.values());
        let totalVolumPropera = 0;

        embassamentsPropera.forEach(emb => {
          totalVolumPropera += parseFloat(emb.volum_embassat) || 0;
        });

        const diferencia = totalVolumAvui - totalVolumPropera;

        comparativesHTML += generarComparativaHTML(
          period.nom,
          diferencia,
          diesDiferencia === 0 ? 1 : diesDiferencia
        );

      } else {
        // Si no trobem dades per aquest període
        comparativesHTML += `<p><strong>Respecte ${period.nom}:</strong> No disponible 🕰️</p>`;
      }
    });

    // 📝 Mostrar resum complet amb comparatives
    resumContainer.innerHTML = `
      <h2>Resum de l'estat actual</h2>
      <p><strong>Data de les dades:</strong> ${dataComuna}</p>
      <p><strong>Volum total embassat (Conques Internes):</strong> ${totalVolumAvui.toFixed(2)} hm³</p>
      <p><strong>Percentatge mitjà d'ompliment:</strong> ${percentatgeMitjaAvui}%</p>
      ${comparativesHTML}
    `;

    // 🖼️ Pintar targetes individuals dels embassaments
    embassamentsUnics.forEach(emb => {
      const div = document.createElement('div');
      div.className = 'embassament';

      const imatge = imatgesEmbassaments[emb.estaci] || 'default.jpg';

      const estaciText = emb.estaci || 'Desconegut';
      const [nomEmbassament, zona] = estaciText.split(' (');
      const zonaNeta = zona ? zona.replace(')', '') : '';
      
      div.innerHTML = `
        <div class="embassament-img" style="background-image: url('img/${imatge}'); background-size: cover; background-position: center;"></div>
        <h2>${nomEmbassament}</h2>
        ${zonaNeta ? `<h3 style="color: #000; margin-top: 0.2em;">${zonaNeta}</h3>` : ''}
        <p><strong>Nivell absolut:</strong> ${emb.nivell_absolut || 'No disponible'} m</p>
        <p><strong>Volum embassat:</strong> ${emb.volum_embassat || 'No disponible'} hm³</p>
        <p><strong>Percentatge volum embassat:</strong> ${emb.percentatge_volum_embassat || 'No disponible'}%</p>
      `;
      

      container.appendChild(div);
    });

    // 🎨 Finalment, creem la gràfica de velocímetre
    crearVelocimetre(totalVolumAvui);

  } catch (error) {
    console.error('Error carregant les dades:', error);
    document.getElementById('embassaments').innerText = 'Error carregant les dades dels embassaments.';
    document.getElementById('resum').innerText = 'Error carregant el resum.';
  }
}
// 🎨 Funció per crear la gràfica de velocímetre amb 4 seccions de color sòlid
function crearVelocimetre(valor) {
    const ctx = document.getElementById('velocimetre').getContext('2d');
  
    const maxHm3 = 700;
    const percentatge = Math.min(valor / maxHm3, 1);
  
    const colors = ['red', 'orange', '#ADFF2F', 'green']; // 4 seccions: vermell, taronja, verd manzana, verd intens
  
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [0.25, 0.25, 0.25, 0.25],
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 10,
          cutout: '80%',
          circumference: 240,
          rotation: 240,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        animation: {
          animateRotate: true,
          duration: 1000
        }
      },
      plugins: [{
        id: 'customGaugeLabels',
        afterDraw(chart) {
          const { ctx, chartArea: { width, height } } = chart;
          const centerX = width / 2;
          const centerY = height / 2;
          const dist = (Math.min(width, height) / 2) - 10;
  
          ctx.save();
  
          // 📍 Coordenades utilitàries
          const angleToCoordinate = (angleDeg, distance) => {
            const angleRad = (angleDeg - 90) * Math.PI / 180;
            return {
              x: centerX + distance * Math.cos(angleRad),
              y: centerY + distance * Math.sin(angleRad),
            };
          };
  
          // 🏷️ Etiquetes de "0 hm³" i "700 hm³"
          const coordZero = angleToCoordinate(240, dist);
          const coordMax = angleToCoordinate(120, dist);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('0 hm³', coordZero.x, coordZero.y);
          ctx.fillText('700 hm³', coordMax.x, coordMax.y);
  
          // 🧭 Dibuixar l'agulla
          const startAngle = 240;
          const endAngle = 120 + 360;
          const angleRange = endAngle - startAngle;
          const angle = (startAngle + (percentatge * angleRange)) % 360;
  
          const angleRad = (angle - 90) * Math.PI / 180;
  
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(
            centerX + (dist - 20) * Math.cos(angleRad),
            centerY + (dist - 20) * Math.sin(angleRad)
          );
          ctx.stroke();
  
          // 🧩 Valor sobre la punta de l'agulla
          const labelCoord = angleToCoordinate(angle, dist - 30);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(`${valor.toFixed(1)} hm³`, labelCoord.x, labelCoord.y);
  
          ctx.restore();
        }
      }]
    });
  }
  
  // 🚀 Crida inicial per carregar totes les dades quan s'inicia la pàgina
  carregarDades();
  
// 📸 Imatges dels embassaments
const imatgesEmbassaments = {
    "Embassament de la Baells (Cercs)": "baells.jpg",
    "Embassament de Sau (Vilanova de Sau)": "sau.jpg",
    "Embassament de Susqueda (Osor)": "susqueda.jpg",
    "Embassament de Sant Ponç (Clariana de Cardener)": "sant-ponc.jpg",
    "Embassament de la Llosa del Cavall (Navès)": "llosa_del_cavall.webp",
    "Embassament de Foix (Castellet i la Gornal)": "foix.jpg",
    "Embassament de Siurana (Cornudella de Montsant)": "siurana.jpg",
    "Embassament de Darnius Boadella (Darnius)": "darnius-boadella.jpg",
    "Embassament de Riudecanyes (Riudecanyes)": "riudecanyes.jpg",
    "Embassament d'Oliana (Oliana)": "oliana.jpg"
  };
  
  // 🚀 Funció principal per carregar les dades
  async function carregarDades() {
    try {
      // 🔄 Petició a l'API
      const resposta = await fetch('/api/embassaments');
      const dades = await resposta.json();
  
      // 📦 Referències als contenidors del DOM
      const container = document.getElementById('embassaments');
      const resumContainer = document.getElementById('resum');
      const graficaContainer = document.getElementById('grafica');
      container.innerHTML = '';
      resumContainer.innerHTML = '';
      graficaContainer.innerHTML = '<canvas id="velocimetre"></canvas>';
  
      // ❌ Control d'errors si no hi ha dades
      if (!Array.isArray(dades) || dades.length === 0) {
        container.innerHTML = '<p>No s\'han trobat dades dels embassaments.</p>';
        resumContainer.innerHTML = '<p>No s\'ha pogut calcular el resum.</p>';
        return;
      }
  
      // 🎯 Definició de les Conques Internes que volem analitzar
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
  
      // 🧩 Filtrar dades només de les Conques Internes
      const conquesDades = dades.filter(emb =>
        conquesInternes.includes(emb.estaci?.trim())
      );
  
      if (conquesDades.length === 0) {
        container.innerHTML = '<p>No s\'han trobat dades de les Conques Internes.</p>';
        resumContainer.innerHTML = '<p>No s\'ha pogut calcular el resum.</p>';
        return;
      }
  
      // 📅 Separar dades d'avui i d'ahir
      const avui = new Date();
      const ahir = new Date(avui);
      ahir.setDate(avui.getDate() - 1);
  
      const formatData = (data) => data.toISOString().split('T')[0];
  
      const dadesAvui = conquesDades.filter(d => d.dia.startsWith(formatData(avui)));
      const dadesAhir = conquesDades.filter(d => d.dia.startsWith(formatData(ahir)));
  
      // 🗂️ Si no hi ha dades d'avui, agafem l'últim registre disponible
      const dadesActuals = dadesAvui.length > 0 ? dadesAvui : conquesDades.filter(d => d.dia === conquesDades[0].dia);
  
      // 🗂️ Map per mantenir només l'últim registre per embassament
      const embassamentsMap = new Map();
      dadesActuals.forEach(emb => {
        const existing = embassamentsMap.get(emb.estaci);
        if (!existing || new Date(emb.dia) > new Date(existing.dia)) {
          embassamentsMap.set(emb.estaci, emb);
        }
      });
      const embassamentsUnics = Array.from(embassamentsMap.values());
  
      // 📊 Càlcul volum total i percentatge mitjà d'avui
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
  
      // 🧩 Si tenim dades d'ahir, calculem la diferència
      let comparativaText = '';
      if (dadesAhir.length > 0) {
        let totalVolumAhir = 0;
        const embassamentsMapAhir = new Map();
        dadesAhir.forEach(emb => {
          const existing = embassamentsMapAhir.get(emb.estaci);
          if (!existing || new Date(emb.dia) > new Date(existing.dia)) {
            embassamentsMapAhir.set(emb.estaci, emb);
          }
        });
        const embassamentsAhir = Array.from(embassamentsMapAhir.values());
        embassamentsAhir.forEach(emb => {
          totalVolumAhir += parseFloat(emb.volum_embassat) || 0;
        });
  
        const diferencia = (totalVolumAvui - totalVolumAhir).toFixed(2);
        if (diferencia > 0) {
          comparativaText = `<p><strong>Respecte ahir:</strong> +${diferencia} hm³ 🔺</p>`;
        } else if (diferencia < 0) {
          comparativaText = `<p><strong>Respecte ahir:</strong> ${diferencia} hm³ 🔻</p>`;
        } else {
          comparativaText = `<p><strong>Respecte ahir:</strong> Sense canvis</p>`;
        }
      } else {
        comparativaText = `<p><strong>Respecte ahir:</strong> No disponible</p>`;
      }
  
      // 📝 Mostrar resum amb la comparativa
      resumContainer.innerHTML = `
        <h2>Resum de l'estat actual</h2>
        <p><strong>Data de les dades:</strong> ${dataComuna}</p>
        <p><strong>Volum total embassat (Conques Internes):</strong> ${totalVolumAvui.toFixed(2)} hm³</p>
        <p><strong>Percentatge mitjà d'ompliment:</strong> ${percentatgeMitjaAvui}%</p>
        ${comparativaText}
      `;
  
      // 🖼️ Pintar les targetes dels embassaments
      embassamentsUnics.forEach(emb => {
        const div = document.createElement('div');
        div.className = 'embassament';
  
        const imatge = imatgesEmbassaments[emb.estaci] || 'default.jpg';
  
        div.innerHTML = `
          <div class="embassament-img" style="background-image: url('img/${imatge}'); background-size: cover; background-position: center;"></div>
          <h2>${emb.estaci || 'Desconegut'}</h2>
          <p><strong>Nivell absolut:</strong> ${emb.nivell_absolut || 'No disponible'} m</p>
          <p><strong>Volum embassat:</strong> ${emb.volum_embassat || 'No disponible'} hm³</p>
          <p><strong>Percentatge volum embassat:</strong> ${emb.percentatge_volum_embassat || 'No disponible'}%</p>
        `;
  
        container.appendChild(div);
      });
  
      // 🎨 Crear la gràfica de velocímetre
      crearVelocimetre(totalVolumAvui);
  
    } catch (error) {
      console.error('Error carregant les dades:', error);
      document.getElementById('embassaments').innerText = 'Error carregant les dades dels embassaments.';
      document.getElementById('resum').innerText = 'Error carregant el resum.';
    }
  }
  
  // 🎨 Funció per crear la gràfica de velocímetre amb 4 seccions
  function crearVelocimetre(valor) {
    const ctx = document.getElementById('velocimetre').getContext('2d');
  
    const maxHm3 = 700;
    const percentatge = Math.min(valor / maxHm3, 1);
  
    const colors = ['red', 'orange', '#ADFF2F', 'green']; // 4 seccions de color sòlid
  
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
  
          const angleToCoordinate = (angleDeg, distance) => {
            const angleRad = (angleDeg - 90) * Math.PI / 180;
            return {
              x: centerX + distance * Math.cos(angleRad),
              y: centerY + distance * Math.sin(angleRad),
            };
          };
  
          const coordZero = angleToCoordinate(240, dist);
          const coordMax = angleToCoordinate(120, dist);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('0 hm³', coordZero.x, coordZero.y);
          ctx.fillText('700 hm³', coordMax.x, coordMax.y);
  
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
  
          const labelCoord = angleToCoordinate(angle, dist - 30);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(`${valor.toFixed(1)} hm³`, labelCoord.x, labelCoord.y);
  
          ctx.restore();
        }
      }]
    });
  }
  
  // 🚀 Inici de l'aplicació
  carregarDades();
  
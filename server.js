const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.get('/api/embassaments', async (req, res) => {
  try {
    const resposta = await fetch('https://analisi.transparenciacatalunya.cat/resource/gn9e-3qhr.json');
    const dades = await resposta.json();
    res.json(dades);
  } catch (error) {
    console.error('Error obtenint les dades:', error);
    res.status(500).json({ error: 'Error obtenint les dades' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});


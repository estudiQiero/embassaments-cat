const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

app.listen(PORT, () => {
  console.log(`Servidor escoltant al port ${PORT}`);
});

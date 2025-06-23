// index.js
const express = require('express');
const app = express();
const PORT = 3000;

// Respuesta única por servidor para distinguir
const SERVER_ID = process.env.SERVER_ID || 'Servidor Desconocido';

app.get('/', (req, res) => {
  res.send(`Hola desde ${SERVER_ID}`);
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} - ${SERVER_ID}`);
});

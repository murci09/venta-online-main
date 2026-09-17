// Servidor SOLO para desarrollo local.
// En Vercel no se usa: alli corre api/create-preference.js como funcion serverless.
// Uso:  set MP_ACCESS_TOKEN=tu_token   (PowerShell: $env:MP_ACCESS_TOKEN="tu_token")
//       node server.js

const express = require('express');
const cors = require('cors');
const crearPreferencia = require('./api/create-preference.js');

const app = express();

app.use(express.json());
app.use(cors());

app.post('/api/create-preference', crearPreferencia);

app.listen(3000, () => {
    console.log('Servidor de Mercado Pago corriendo en http://localhost:3000');
    if (!process.env.MP_ACCESS_TOKEN) {
        console.warn('AVISO: falta la variable MP_ACCESS_TOKEN, los pagos van a fallar.');
    }
});

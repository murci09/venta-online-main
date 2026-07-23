const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();

app.use(express.json());
app.use(cors());

// Reemplazá con tu Access Token de prueba
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-2246334410561507-072313-06b752b89a8a77cee1709a7e565e02db-3564094916' 
});

app.post('/create-preference', async (req, res) => {
    try {
        const { items, payer } = req.body;

        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                items: items.map(item => ({
                    title: item.nombre,
                    unit_price: Number(item.precio),
                    quantity: Number(item.cantidad),
                    currency_id: 'ARS'
                })),
                payer: {
                    name: payer.nombre,
                    email: payer.email
                },
                back_urls: {
                    success: 'http://localhost:5500/index.html',
                    failure: 'http://localhost:5500/index.html',
                    pending: 'http://localhost:5500/index.html'
                },
              
            }
        });

        res.json({ id: result.id });

    } catch (error) {
        console.error("Error al crear preferencia:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Servidor de Mercado Pago corriendo en http://localhost:3000');
});
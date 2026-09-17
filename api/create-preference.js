const { MercadoPagoConfig, Preference } = require('mercadopago');

// El Access Token es SECRETO: se lee de las variables de entorno,
// nunca se escribe en el codigo. En Vercel: Settings > Environment Variables.
const accessToken = process.env.MP_ACCESS_TOKEN;

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo no permitido' });
    }

    if (!accessToken) {
        console.error('Falta la variable de entorno MP_ACCESS_TOKEN');
        return res.status(500).json({ error: 'El servidor no tiene configurado el Access Token' });
    }

    try {
        const { items, payer } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'El carrito esta vacio' });
        }

        // URLs de retorno calculadas desde el dominio real (localhost o Vercel)
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const protocolo = req.headers['x-forwarded-proto'] || (host && host.startsWith('localhost') ? 'http' : 'https');
        const origen = `${protocolo}://${host}`;

        const client = new MercadoPagoConfig({ accessToken });
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
                    name: payer?.nombre,
                    email: payer?.email
                },
                back_urls: {
                    success: `${origen}/index.html`,
                    failure: `${origen}/index.html`,
                    pending: `${origen}/index.html`
                }
            }
        });

        return res.json({ id: result.id, init_point: result.init_point });

    } catch (error) {
        console.error('Error al crear preferencia:', error);
        return res.status(500).json({ error: error.message });
    }
};

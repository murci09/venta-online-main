# Proyecto Final JS - Tienda de Botines

Página de venta de botines. Es un simulador interactivo para el curso de Coderhouse, con
productos cargados desde `data.json`, un carrito que guarda la info al recargar y checkout
con Mercado Pago.

## Funcionalidades

- Carrito de compras funcional
- Agregar y eliminar productos del carrito
- Uso de `fetch` para traer los productos desde un JSON
- Guardado en `localStorage` para no perder el carrito al recargar
- Confirmación de compra con SweetAlert2
- Notificaciones al agregar al carrito con Toastify
- Pago con Mercado Pago (Checkout Pro)
- Diseño responsive para compu y móvil

## Estructura

- `index.html`, `css/`, `img/`, `app.js`, `data.json` → el sitio estático (frontend)
- `api/create-preference.js` → función serverless que crea la preferencia de pago
- `server.js` → servidor Express **solo para desarrollo local** (reusa la misma función)
- `vercel.json` → le dice a Vercel que esto es un sitio estático, no una app Node

## Probarlo en local

Solo el frontend (sin pagos):

    Abrir index.html con la extensión Live Server.

Con pagos, en dos terminales:

    # Terminal 1 - backend
    $env:MP_ACCESS_TOKEN="tu_access_token_de_mercado_pago"
    node server.js

    # Terminal 2
    Abrir index.html con Live Server.

## Deploy en Vercel

1. En el proyecto de Vercel: **Settings → Environment Variables**, agregar
   `MP_ACCESS_TOKEN` con el Access Token de Mercado Pago. Sin esta variable el
   checkout responde 500.
2. Dejar el Framework Preset en **Other** y el Root Directory en la raíz del repo.
3. No hace falta Build Command ni Output Directory: `vercel.json` ya los define.

El Access Token es **secreto** y nunca va en el código. La Public Key
(`MP_PUBLIC_KEY` en `app.js`) sí es pública y puede ir en el frontend.

## Tecnologías

- HTML
- CSS
- JavaScript
- Node + Express (dev) / Funciones serverless de Vercel (producción)
- SDK de Mercado Pago

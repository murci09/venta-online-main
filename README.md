# Tienda de Botines — Demo de portafolio

Tienda de botines deportivos hecha con HTML, CSS y JavaScript puro (sin frameworks).
Proyecto final del curso de JavaScript de Coderhouse, ampliado como pieza de portafolio.

> **Es una demo.** La tienda es ficticia y el checkout está simulado: recorre todos los
> pasos de una compra real (resumen, datos, procesamiento, confirmación con número de
> orden) pero no cobra nada, no pide datos de tarjeta y no envía información a ningún
> servidor.

## Funcionalidades

- Catálogo cargado con `fetch` desde `data.json`
- Filtro de productos por marca
- Carrito de compras: agregar, eliminar y vaciar
- Carrito persistente con `localStorage` (no se pierde al recargar)
- Checkout simulado en 4 pasos con validación de formulario
- Número de orden y fecha de entrega estimada generados al confirmar
- Notificaciones con Toastify y diálogos con SweetAlert2
- Diseño responsive para escritorio y móvil

## Estructura

    index.html      estructura de la página
    css/style.css   estilos y diseño responsive
    app.js          catálogo, filtros, carrito y checkout simulado
    data.json       los 8 productos del catálogo
    img/            imágenes de los productos
    vercel.json     configuración de deploy (sitio estático)

## Cómo probarlo en local

El catálogo se carga con `fetch`, así que abrir el archivo directamente con doble clic
no funciona (el navegador bloquea `fetch` sobre `file://`). Hay que servirlo por HTTP:

- **Live Server**: abrir el proyecto en VS Code, clic derecho en `index.html` →
  *Open with Live Server*
- **o con Node**: `npx serve .` y abrir la URL que imprime

## Deploy

Es un sitio estático: no necesita build, ni backend, ni variables de entorno.
En Vercel se importa el repo, se deja el Framework Preset en **Other** y listo —
`vercel.json` se encarga del resto.

## Tecnologías

- HTML5 y CSS3 (Flexbox, Grid, custom properties, media queries)
- JavaScript ES6+ (async/await, módulos de datos JSON, `localStorage`)
- [SweetAlert2](https://sweetalert2.github.io/) para los diálogos del checkout
- [Toastify](https://apvarun.github.io/toastify-js/) para las notificaciones

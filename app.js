// ==========================================
// 1. INICIALIZACIÓN Y VARIABLES GLOBALES
// ==========================================

// DEMO: esta tienda es una simulacion para portafolio. El checkout recorre
// todo el flujo de una compra real (resumen, datos, pago, confirmacion) pero
// no cobra nada ni envia datos a ningun servidor.

const apiURL = './data.json';
let botines = [];
let carrito = [];
let filtroActual = 'todos';

// Elementos del DOM
const gridProductos = document.querySelector('#grid-productos');
const tablaCarrito = document.querySelector('#lista-carrito tbody');
const botonVaciar = document.querySelector('#vaciar-carrito');
const imgCarrito = document.querySelector('#img-carrito');
const botonesFiltro = document.querySelectorAll('.btn-filtro');
const botonFinalizarDesdeCarrito = document.querySelector('#finalizar-compra-carrito');
const divCarrito = document.querySelector('#carrito');

// ==========================================
// 2. EVENT LISTENERS & INICIO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    cargarBotines();
    cargarCarritoDelLocalStorage();

    botonesFiltro.forEach(boton => {
        boton.addEventListener('click', filtrarProductos);
    });

    botonVaciar.addEventListener('click', vaciarCarrito);
    imgCarrito.addEventListener('click', toggleCarrito);
    botonFinalizarDesdeCarrito.addEventListener('click', irAFinalizarCompra);
});

// ==========================================
// 3. CARGA Y RENDERIZADO DE PRODUCTOS
// ==========================================

async function cargarBotines() {
    try {
        const respuesta = await fetch(apiURL);
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        botines = await respuesta.json();
        renderizarProductos(botines);

        const primerBoton = Array.from(botonesFiltro).find(btn => btn.dataset.filter === 'todos');
        if (primerBoton) primerBoton.classList.add('activo');
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error al cargar productos',
            text: 'No se pudieron obtener los datos del catálogo. Recargá la página para volver a intentar.',
            confirmButtonColor: '#0EA5E9'
        });
    }
}

function renderizarProductos(productosAMostrar) {
    gridProductos.innerHTML = '';

    productosAMostrar.forEach(producto => {
        const descuento = Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-producto';
        tarjeta.innerHTML = `
            <div class="tarjeta-producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" title="${producto.nombre}">
                <span class="descuento-badge">-${descuento}%</span>
            </div>
            <div class="tarjeta-producto-contenido">
                <span class="tarjeta-producto-marca">${producto.marca}</span>
                <h3 class="tarjeta-producto-titulo">${producto.nombre}</h3>
                <p class="tarjeta-producto-descripcion">${producto.descripcion}</p>
                <div class="tarjeta-producto-precios">
                    <span class="tarjeta-producto-precio-original">$${producto.precioOriginal.toLocaleString('es-CO')}</span>
                    <span class="tarjeta-producto-precio">$${producto.precio.toLocaleString('es-CO')}</span>
                </div>
                <div class="tarjeta-producto-acciones">
                    <button class="btn-comprar agregar-carrito" data-id="${producto.id}" title="Agregar al carrito">Agregar al Carrito</button>
                    <button class="btn-heart" title="Guardar">🤍</button>
                </div>
            </div>
        `;

        gridProductos.appendChild(tarjeta);
    });

    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
}

function filtrarProductos(e) {
    filtroActual = e.target.dataset.filter;

    botonesFiltro.forEach(btn => btn.classList.remove('activo'));
    e.target.classList.add('activo');

    const productosFiltrados = filtroActual === 'todos'
        ? botines
        : botines.filter(p => p.marca === filtroActual);

    renderizarProductos(productosFiltrados);
}

// ==========================================
// 4. LÓGICA DEL CARRITO & LOCALSTORAGE
// ==========================================

function cargarCarritoDelLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoVentaOnline');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        mostrarCarrito();
    }
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carritoVentaOnline', JSON.stringify(carrito));
}

function agregarAlCarrito(e) {
    e.preventDefault();
    const idProducto = parseInt(e.target.dataset.id, 10);
    const producto = botines.find(p => p.id === idProducto);

    if (producto) {
        const productoEnCarrito = carrito.find(p => p.id === idProducto);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }

        guardarCarritoEnLocalStorage();
        mostrarCarrito();

        Toastify({
            text: `${producto.nombre} agregado al carrito`,
            duration: 2500,
            gravity: 'top',
            position: 'right',
            backgroundColor: 'linear-gradient(135deg, #0EA5E9, #A855F7)',
            stopOnFocus: true
        }).showToast();
    }
}

function mostrarCarrito() {
    tablaCarrito.innerHTML = '';

    carrito.forEach(producto => {
        const fila = document.createElement('tr');
        const totalProducto = producto.precio * producto.cantidad;

        fila.innerHTML = `
            <td><img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td>
                <strong>${producto.nombre}</strong><br>
                <small>Cantidad: ${producto.cantidad}</small>
            </td>
            <td>$${totalProducto.toLocaleString('es-CO')}</td>
            <td>
                <button class="btn-eliminar" data-id="${producto.id}" title="Eliminar producto">✕</button>
            </td>
        `;

        tablaCarrito.appendChild(fila);
    });

    const botonesEliminar = document.querySelectorAll('.btn-eliminar');
    botonesEliminar.forEach(boton => {
        boton.addEventListener('click', eliminarDelCarrito);
    });

    mostrarTotal();
}

function eliminarDelCarrito(e) {
    const idProducto = parseInt(e.target.dataset.id, 10);
    carrito = carrito.filter(p => p.id !== idProducto);
    guardarCarritoEnLocalStorage();
    mostrarCarrito();
}

function vaciarCarrito(e) {
    e.preventDefault();

    Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#0EA5E9',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
    }).then(result => {
        if (result.isConfirmed) {
            vaciarCarritoCompleto();
            Swal.fire({
                icon: 'success',
                title: 'Carrito vaciado',
                text: 'Se han eliminado todos los productos',
                confirmButtonColor: '#0EA5E9',
                timer: 2000
            });
        }
    });
}

function mostrarTotal() {
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td colspan="2"><strong>Total:</strong></td>
        <td><strong>${formatearPrecio(calcularTotal())}</strong></td>
        <td></td>
    `;
    tablaCarrito.appendChild(totalRow);
}

function toggleCarrito() {
    divCarrito.style.display = divCarrito.style.display === 'block' ? 'none' : 'block';
}

function vaciarCarritoCompleto() {
    carrito = [];
    localStorage.removeItem('carritoVentaOnline');
    mostrarCarrito();
}

// ==========================================
// 5. CHECKOUT SIMULADO (DEMO)
// ==========================================

// Pausa artificial para que la simulacion se sienta como una pasarela real.
const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

function calcularTotal() {
    return carrito.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);
}

function contarUnidades() {
    return carrito.reduce((suma, producto) => suma + producto.cantidad, 0);
}

// Numero de orden con formato realista: DEMO-20260917-4821
function generarNumeroOrden() {
    const f = new Date();
    const fecha = `${f.getFullYear()}${String(f.getMonth() + 1).padStart(2, '0')}${String(f.getDate()).padStart(2, '0')}`;
    const azar = String(Math.floor(Math.random() * 9000) + 1000);
    return `DEMO-${fecha}-${azar}`;
}

function formatearPrecio(valor) {
    return `${valor.toLocaleString('es-CO')}`;
}

// Paso 0: valida el carrito y arranca el flujo
function irAFinalizarCompra(e) {
    e.preventDefault();

    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Agrega productos antes de continuar',
            confirmButtonColor: '#0EA5E9'
        });
        return;
    }

    if (divCarrito) divCarrito.style.display = 'none';
    mostrarResumenDelPedido();
}

// Paso 1: resumen del pedido
function mostrarResumenDelPedido() {
    const total = calcularTotal();

    const filas = carrito.map(producto => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: left;">
                <strong style="color: #F8FAFC;">${producto.nombre}</strong><br>
                <small style="color: #94A3B8;">${producto.marca} &middot; ${producto.cantidad} u.</small>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #334155; text-align: right; color: #F8FAFC; white-space: nowrap;">
                ${formatearPrecio(producto.precio * producto.cantidad)}
            </td>
        </tr>
    `).join('');

    Swal.fire({
        title: 'Resumen de tu pedido',
        html: `
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tbody>
                    ${filas}
                    <tr>
                        <td style="padding: 14px 0 0; text-align: left; font-size: 16px; color: #F8FAFC;">
                            <strong>Total (${contarUnidades()} art.)</strong>
                        </td>
                        <td style="padding: 14px 0 0; text-align: right; font-size: 20px; color: #0EA5E9; white-space: nowrap;">
                            <strong>${formatearPrecio(total)}</strong>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p style="margin-top: 18px; font-size: 12px; color: #94A3B8;">
                Envío gratis a todo el país &middot; 3 cuotas sin interés
            </p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Seguir comprando',
        confirmButtonColor: '#0EA5E9',
        cancelButtonColor: '#475569'
    }).then(resultado => {
        if (resultado.isConfirmed) pedirDatosDelComprador();
    });
}

// Paso 2: datos del comprador y medio de pago.
// A proposito NO se piden datos de tarjeta: es una demo y nadie deberia
// escribir un numero de tarjeta real en una pagina de portafolio.
function pedirDatosDelComprador() {
    Swal.fire({
        title: 'Datos de envío',
        html: `
            <div style="text-align: left;">
                <label for="swal-nombre" style="display: block; margin-bottom: 6px; font-weight: 600; color: #0EA5E9; font-size: 14px;">Nombre completo</label>
                <input type="text" id="swal-nombre" class="swal2-input" placeholder="Ej: Santiago Saleme" style="width: 100%; margin: 0 0 14px;">

                <label for="swal-email" style="display: block; margin-bottom: 6px; font-weight: 600; color: #0EA5E9; font-size: 14px;">Email</label>
                <input type="email" id="swal-email" class="swal2-input" placeholder="tu@email.com" style="width: 100%; margin: 0 0 14px;">

                <label for="swal-pago" style="display: block; margin-bottom: 6px; font-weight: 600; color: #0EA5E9; font-size: 14px;">Medio de pago</label>
                <select id="swal-pago" class="swal2-select" style="width: 100%; margin: 0;">
                    <option value="Tarjeta de crédito">Tarjeta de crédito - 3 cuotas sin interés</option>
                    <option value="Tarjeta de débito">Tarjeta de débito</option>
                    <option value="Transferencia bancaria">Transferencia bancaria - 10% off</option>
                    <option value="Efectivo al recibir">Efectivo al recibir</option>
                </select>

                <p style="margin: 16px 0 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                    Compra simulada: no se piden datos de tarjeta y no se cobra nada.
                </p>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar compra',
        cancelButtonText: 'Volver',
        confirmButtonColor: '#0EA5E9',
        cancelButtonColor: '#475569',
        focusConfirm: false,
        preConfirm: () => {
            const nombre = document.querySelector('#swal-nombre').value.trim();
            const email = document.querySelector('#swal-email').value.trim();
            const medioPago = document.querySelector('#swal-pago').value;

            if (nombre.length < 3) {
                Swal.showValidationMessage('Ingresá tu nombre completo');
                return false;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                Swal.showValidationMessage('Ingresá un email válido');
                return false;
            }

            return { nombre, email, medioPago };
        }
    }).then(resultado => {
        if (resultado.isConfirmed) procesarCompraSimulada(resultado.value);
    });
}

// Paso 3: "procesamiento" y confirmacion
async function procesarCompraSimulada({ nombre, email, medioPago }) {
    // Guardo los datos antes de vaciar el carrito.
    const total = calcularTotal();
    const unidades = contarUnidades();
    const numeroOrden = generarNumeroOrden();

    Swal.fire({
        title: 'Procesando el pago...',
        html: '<p style="color: #94A3B8; font-size: 14px;">Validando la orden y reservando el stock</p>',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading()
    });

    await esperar(1800);

    vaciarCarritoCompleto();

    const entrega = new Date();
    entrega.setDate(entrega.getDate() + 5);
    const fechaEntrega = entrega.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    await Swal.fire({
        icon: 'success',
        title: '¡Compra confirmada!',
        html: `
            <p style="color: #F8FAFC; margin-bottom: 18px; font-size: 15px;">
                Gracias por tu compra, <strong>${nombre.split(' ')[0]}</strong>.
            </p>
            <div style="text-align: left; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 10px; padding: 16px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #94A3B8;">Orden</span>
                    <strong style="color: #0EA5E9;">${numeroOrden}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #94A3B8;">Artículos</span>
                    <strong style="color: #F8FAFC;">${unidades}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #94A3B8;">Medio de pago</span>
                    <strong style="color: #F8FAFC;">${medioPago}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #94A3B8;">Entrega estimada</span>
                    <strong style="color: #F8FAFC;">${fechaEntrega}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #334155; margin-top: 12px; padding-top: 12px;">
                    <span style="color: #94A3B8;">Total</span>
                    <strong style="color: #0EA5E9; font-size: 18px;">${formatearPrecio(total)}</strong>
                </div>
            </div>
            <p style="margin: 18px 0 0; font-size: 12px; color: #94A3B8; line-height: 1.5;">
                Enviaríamos el detalle a <strong style="color: #F8FAFC;">${email}</strong>.<br>
                Esta es una tienda de demostración: la compra es ficticia y no se cobró nada.
            </p>
        `,
        confirmButtonText: 'Listo',
        confirmButtonColor: '#0EA5E9'
    });

    Toastify({
        text: `Orden ${numeroOrden} registrada (demo)`,
        duration: 4000,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'linear-gradient(135deg, #0EA5E9, #A855F7)',
        stopOnFocus: true
    }).showToast();
}

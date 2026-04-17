const apiURL = './data.json';
let botines = [];
let carrito = [];
let filtroActual = 'todos';

const gridProductos = document.querySelector('#grid-productos');
const tablaCarrito = document.querySelector('#lista-carrito tbody');
const botonVaciar = document.querySelector('#vaciar-carrito');
const imgCarrito = document.querySelector('#img-carrito');
const botonesFiltro = document.querySelectorAll('.btn-filtro');
const botonFinalizarDesdeCarrito = document.querySelector('#finalizar-compra-carrito');
const divCarrito = document.querySelector('#carrito');

// Inicializo la app cuando el DOM ya está cargado
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

// Función para cargar los botines desde data.json usando async/await
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
            text: 'No se pudieron obtener los datos. Usa Live Server y vuelve a intentar.',
            confirmButtonColor: '#0EA5E9'
        });
    }
}

// Función para pintar los botines en el HTML
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

// Filtro de productos por marca usando .filter()
function filtrarProductos(e) {
    filtroActual = e.target.dataset.filter;

    botonesFiltro.forEach(btn => btn.classList.remove('activo'));
    e.target.classList.add('activo');

    const productosFiltrados = filtroActual === 'todos'
        ? botines
        : botines.filter(p => p.marca === filtroActual);

    renderizarProductos(productosFiltrados);
}

// Cargo el carrito desde localStorage al iniciar
function cargarCarritoDelLocalStorage() {
    const carritoGuardado = localStorage.getItem('carritoVentaOnline');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        mostrarCarrito();
    }
}

// Guardo el carrito en localStorage cada vez que cambia
function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carritoVentaOnline', JSON.stringify(carrito));
}

// Agrego un producto al carrito usando .find()
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

// Muestro el contenido del carrito en la tabla del HTML
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

// Quito un producto del carrito usando .filter()
function eliminarDelCarrito(e) {
    const idProducto = parseInt(e.target.dataset.id, 10);
    carrito = carrito.filter(p => p.id !== idProducto);
    guardarCarritoEnLocalStorage();
    mostrarCarrito();
}

// Vacío el carrito y confirmo con SweetAlert2
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
            carrito = [];
            localStorage.removeItem('carritoVentaOnline');
            mostrarCarrito();
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

// Calculo y muestro el total del carrito
function mostrarTotal() {
    const total = carrito.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
        <td colspan="2"><strong>Total:</strong></td>
        <td><strong>$${total.toLocaleString('es-CO')}</strong></td>
        <td></td>
    `;
    tablaCarrito.appendChild(totalRow);
}

// Muestro y oculto el panel del carrito
function toggleCarrito() {
    divCarrito.style.display = divCarrito.style.display === 'block' ? 'none' : 'block';
}

// Inicio el proceso de finalizar compra con SweetAlert2
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

    Swal.fire({
        title: 'Completa tus datos',
        html: `
            <div style="text-align: left;">
                <label for="swal-nombre" style="display: block; margin-bottom: 8px; font-weight: 600; color: #0EA5E9;">Nombre:</label>
                <input type="text" id="swal-nombre" class="swal2-input" placeholder="Tu nombre completo" style="width: 100%; margin-bottom: 15px;">
                <label for="swal-email" style="display: block; margin-bottom: 8px; font-weight: 600; color: #0EA5E9;">Email:</label>
                <input type="email" id="swal-email" class="swal2-input" placeholder="tu@email.com">
            </div>
        `,
        icon: 'question',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0EA5E9',
        cancelButtonColor: '#ef4444',
        showCancelButton: true,
        preConfirm: () => {
            const nombre = document.querySelector('#swal-nombre').value.trim();
            const email = document.querySelector('#swal-email').value.trim();

            if (!nombre) {
                Swal.showValidationMessage('Por favor ingresa tu nombre');
                return false;
            }
            if (!email) {
                Swal.showValidationMessage('Por favor ingresa tu email');
                return false;
            }
            if (!email.includes('@')) {
                Swal.showValidationMessage('Por favor ingresa un email válido');
                return false;
            }

            return { nombre, email };
        }
    }).then(result => {
        if (result.isConfirmed) {
            procesarCompraConDatos(result.value.nombre, result.value.email);
        }
    });
}

// Simulo el pago y vacío el carrito al final
function procesarCompraConDatos(nombre, email) {
    const totalCompra = carrito.reduce((sum, producto) => sum + producto.precio * producto.cantidad, 0);

    Swal.fire({
        title: 'Procesando tu pedido...',
        html: '<div class="spinner"></div>',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    setTimeout(() => {
        Swal.fire({
            icon: 'success',
            title: '¡Pedido recibido!',
            html: `
                <p style="margin: 15px 0; font-size: 16px;"><strong>${nombre}</strong>, revisa tu casilla de correo</p>
                <div style="background: rgba(14, 165, 233, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
                    <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 8px 0;"><strong>Total:</strong> $${totalCompra.toLocaleString('es-CO')}</p>
                </div>
                <p style="font-size: 14px; color: #94a3b8;">Te enviaremos un resumen a tu correo</p>
            `,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#0EA5E9'
        }).then(() => {
            vaciarCarritoCompleto();
        });
    }, 2000);
}

// Vacío el carrito y borro el localStorage al finalizar
function vaciarCarritoCompleto() {
    carrito = [];
    localStorage.removeItem('carritoVentaOnline');
    mostrarCarrito();
}

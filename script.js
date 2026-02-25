               //(Arrays y Obj)
const Botines = [
    { nombre: "Nike Phantom (Gama Alta)", precio: 89000, tipo: "Delantero" },
    { nombre: "Nike Tiempo (Cuero)", precio: 75000, tipo: "Defensor" },
    { nombre: "Nike Mercurial (Velocidad)", precio: 82000, tipo: "Mediocampista" },
    { nombre: "Adidas Copa (Buen pie)", precio: 88000, tipo: "Arquero" }
];

const cuotasDisponibles = [1, 3, 6, "sin intereses"];

// alerta del principio
function iniciarTodo() {
    alert("Bienvenido a la busqueda de tu botin ideal...");

    // 3. Condicionales y ciclos para elegir que botines te toca
    let posicion = prompt("¿En qué posición juegas? (Delantero / Defensor / Mediocampista / Arquero)").toLowerCase();
    
    // aca Buscamos el botin que es con la posición
    let recomendado = Botines.find(b => b.tipo.toLowerCase() === posicion);

    if (recomendado) {
        alert("Basado en tu posicion, te recomendamos los: " + recomendado.nombre);
        calcularPago(recomendado);
    } else {
        alert("No ingresaste una posición válida, pero te mostramos nuestra oferta estrella.");
        calcularPago(Botines[0]); 
    }
}

// Función para calcular cuotas y mostrar en consola
function calcularPago(producto) {
    let cuotas = parseInt(prompt("¿En cuántas cuotas quieres pagar? (1, 3 o 6)"));

    // Vemos  si la cuota existe en nuestro array
    if (cuotasDisponibles.includes(cuotas)) {
        let valorCuota = producto.precio / cuotas;
        
        //  Salida por Consola y Alert
        console.log("----- TICKET DE PRE-VENTA -----");
        console.log("Producto: " + producto.nombre);
        console.log("Total: $" + producto.precio);
        console.log("Plan: " + cuotas + " cuota(s) de $" + valorCuota.toFixed(2));
        
        alert("¡Excelente elección!\n" + producto.nombre + "\nTotal: $" + producto.precio + "\n" + cuotas + " cuota(s) de $" + valorCuota.toFixed(2));
    } else {
        alert("Ese plan de cuotas no está disponible.");
    }
}

// para arrancar
iniciarTodo();
document.addEventListener('DOMContentLoaded', function () {
    const botonesFilial = document.querySelectorAll('.FilialComparar');
    const inputBuscador = document.getElementById('default-search');
    const botonDropDown = document.getElementById('dropdown-button-2');
    const filasTabla = document.querySelectorAll('tbody tr[data-filial]');

    let valorFilialSeleccionada = 'ALL';
    let activeTimeouts = [];

    function aplicarFiltros() {
        const searchTerm = inputBuscador.value.toLowerCase();
        let delay = 0;

        activeTimeouts.forEach(clearTimeout);
        activeTimeouts = [];

        filasTabla.forEach(fila => {
            const filial = fila.getAttribute('data-filial').trim();
            const texto = fila.textContent.toLowerCase();

            const coincideFilial = valorFilialSeleccionada === 'ALL' || filial === valorFilialSeleccionada;
            console.log(valorFilialSeleccionada)
            console.log(`El valor de la filial de la tr ${filial}`)

            const coincideTexto = texto.includes(searchTerm);


            if (coincideFilial && coincideTexto) {
                const timeoutId = setTimeout(() => {
                    fila.classList.remove('hidden');
                    fila.style.transition = 'none';
                    fila.style.opacity = '0';
                    fila.style.transform = 'translateY(10px)';
                    void fila.offsetHeight;
                    fila.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    fila.style.opacity = '1';
                    fila.style.transform = 'translateY(0)';
                }, delay * 80);

                activeTimeouts.push(timeoutId);
                delay++;
            } else {
                fila.classList.add('hidden');
                fila.style.opacity = '0';
                fila.style.transform = 'translateY(10px)';
                fila.style.transition = 'none';
            }
        });
    }

    botonesFilial.forEach(boton => {
        boton.addEventListener('click', function () {
            valorFilialSeleccionada = boton.getAttribute('data-filial-button');

            botonDropDown.innerHTML = `${boton.innerText.trim()}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down">
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            `;

            aplicarFiltros();
        });
    });

    inputBuscador.addEventListener('keyup', function (e) {
        if (e.key === "Escape") {
            inputBuscador.value = "";
        }
        aplicarFiltros();
    });

    const style = document.createElement('style');
    style.textContent = `
        tr[data-filial] {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.4s ease, transform 0.4s ease;
        }
    `;
    document.head.appendChild(style);
});






// Referencias a los elementos
const slideContainer = document.getElementById('slideContainer');
const avanzarBtn = document.getElementById('avanzarParte2');
const volverBtn = document.getElementById('volverParte1'); // Asegúrate de que tu botón tenga este ID

// Función para avanzar a la parte 2
function avanzarAParte2() {
    slideContainer.classList.add('show-parte2');
}

// Función para volver a la parte 1
function volverAParte1() {
    slideContainer.classList.remove('show-parte2');
}

// Event listeners
avanzarBtn.addEventListener('click', function(e) {
    e.preventDefault();
    avanzarAParte2();
});

volverBtn.addEventListener('click', function(e) {
    e.preventDefault();
    volverAParte1();
});






document.addEventListener('DOMContentLoaded', function () {
    const botonesFilial = document.querySelectorAll('.FilialCompararDos');
    const inputBuscador = document.getElementById('default-searchDos');
    const botonDropDownFilial = document.getElementById('dropdown-button-2-Dos');
    const spanCantidadAprobados = document.querySelector('.spanCantidadAprobados');
    const spanCantidadEspera = document.querySelector('.spanCantidadEspera');
    const spanCantidadIncompleta = document.querySelector('.spanCantidadIncompleto');


    const statusFilterButtons = document.querySelectorAll('.status-filter-button');
    const botonDropDownStatus = document.getElementById('dropdown-status-button'); 
    const tarjetas = document.querySelectorAll('.participant-card');
    let contadorStatusIncompleto = 0;
    let contadorStatusAprobado = 0;
    let contadorStatusEspera = 0;

    tarjetas.forEach(tarjeta =>{
        const statusTarjeta = tarjeta.getAttribute('data-status');

        if (statusTarjeta == 'incompleto'){
                contadorStatusIncompleto ++;
                
        }else if (statusTarjeta == 'aprobado'){
            contadorStatusAprobado ++
        }else if ( statusTarjeta == 'espera'){
            contadorStatusEspera ++
        }
        
    })

    spanCantidadAprobados.textContent = `${contadorStatusAprobado}`;
    spanCantidadEspera.textContent = `${contadorStatusEspera}`;
    spanCantidadIncompleta.textContent = `${contadorStatusIncompleto}`;



    let valorFilialSeleccionada = 'ALL'; 
    let valorStatusSeleccionado = 'todos'; 
    let activeTimeouts = []; // Animaciones


    function aplicarFiltros() {
        const searchTerm = inputBuscador.value.toLowerCase();
        let delay = 0;


        // Limpiar animaciones pendientes
        activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeouts = [];

        tarjetas.forEach(tarjeta => {
            // Obtener datos de la tarjeta para cada filtro
            const textoTarjeta = tarjeta.textContent.toLowerCase();
            const filialTarjeta = tarjeta.querySelector('[data-filial]')?.getAttribute('data-filial').trim() || "";
            const statusTarjeta = tarjeta.getAttribute('data-status');




            // Comprobar si la tarjeta cumple con TODOS los filtros activos
            const matchFilial = valorFilialSeleccionada === 'ALL' || valorFilialSeleccionada === filialTarjeta;
            const matchStatus = valorStatusSeleccionado === 'todos' || valorStatusSeleccionado === statusTarjeta;


            const matchTexto = textoTarjeta.includes(searchTerm);

            // Si cumple con todos, mostrarla con animación. Si no, ocultarla.
            if (matchFilial && matchStatus && matchTexto) {
                const timeoutId = setTimeout(() => {
                    tarjeta.classList.remove('hidden');
                    tarjeta.style.transition = 'none'; // Reseteo para animación
                    tarjeta.style.opacity = '0';
                    tarjeta.style.transform = 'translateY(20px)';

                    // Forzar al navegador a repintar (clave para la animación)
                    void tarjeta.offsetHeight;

                    // Aplicar la animación de entrada
                    tarjeta.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    tarjeta.style.opacity = '1';
                    tarjeta.style.transform = 'translateY(0)';
                }, delay * 100); // El delay crea el efecto escalonado

                activeTimeouts.push(timeoutId);
                delay++;
            } else {
                tarjeta.classList.add('hidden');
                tarjeta.style.opacity = '0';
                tarjeta.style.transform = 'translateY(20px)';
                tarjeta.style.transition = 'none';
            }
        });
    }


    botonesFilial.forEach(boton => {
        boton.addEventListener('click', function () {
            valorFilialSeleccionada = this.getAttribute('data-filial-button');
            botonDropDownFilial.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            aplicarFiltros();
        });
    });

    statusFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            valorStatusSeleccionado = this.getAttribute('data-status-button');
            botonDropDownStatus.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            aplicarFiltros();
        });
    });

    inputBuscador.addEventListener('keyup', function (e) {
        if (e.key === "Escape") {
            this.value = "";
        }
        aplicarFiltros();
    });

    const style = document.createElement('style');
    style.textContent = `
        .participant-card {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);
});
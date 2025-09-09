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
const volverBtn = document.getElementById('volverParte1');

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
    
    // Referencias a los spans de contadores
    const spanCantidadAprobados = document.querySelector('.spanCantidadAprobados');
    const spanCantidadEspera = document.querySelector('.spanCantidadEspera');
    const spanCantidadIncompleta = document.querySelector('.spanCantidadIncompleto');
    const spanCantidadEvaluacionCompleta = document.querySelector('.spanCantidadEvaluacionCompleta');
    const spanCantidadEvaluacionIncompleta = document.querySelector('.spanCantidadEvaluacionIncompleta');

    // Referencias a los botones de filtro
    const statusFilterButtons = document.querySelectorAll('.status-filter-button');
    const botonDropDownStatus = document.getElementById('dropdown-status-button'); 
    const evaluacionFilterButtons = document.querySelectorAll('[data-status-evaluacion-button]');
    const botonDropDownEvaluacion = document.getElementById('dropdown-status-button-evaluacion');


    const spanCantidadRetroalimentacionTerminada = document.querySelector('.spanCantidadRetroalimentacionTerminada');
    const spanCantidadRetroalimentacionIncopmpleta = document.querySelector('.spanCantidadRetroalimentacionIncopmpleta');


    const retroalimentacionFilterButtons = document.querySelectorAll('.evaluacion-filter-button');
    const botonDropDownRetroalimentacion = document.getElementById('dropdown-status-button-retroalimentacion');
    
    
    const tarjetas = document.querySelectorAll('.participant-card');

    // Variables de filtro (orden de prioridad)
    let valorFilialSeleccionada = 'ALL';        // 1ra prioridad
    let valorStatusSeleccionado = 'todos';      // 2da prioridad (indicadores)
    let valorEvaluacionSeleccionada = 'todos';  // 3ra prioridad (evaluación)
    let valorRetroalimentacionSeleccionada = 'todos' // 4ta prioridad (retroalimentación)
    let activeTimeouts = [];                    // 4ta prioridad (búsqueda)

    // Función para calcular contadores dinámicamente
    function actualizarContadores() {
        const searchTerm = inputBuscador.value.toLowerCase();
        
        // Inicializar contadores
        let contadorStatusIncompleto = 0;
        let contadorStatusAprobado = 0;
        let contadorStatusEspera = 0;
        let contadorEvaluacionCompleta = 0;
        let contadorEvaluacionIncompleta = 0;
        let contadorRetroalimentacionAbierta = 0;
        let contadorRetroalimentacionCerrada = 0;

        // Iterar sobre todas las tarjetas y aplicar la lógica de filtros hasta cierto nivel
        tarjetas.forEach(tarjeta => {
            const textoTarjeta = tarjeta.textContent.toLowerCase();
            const filialTarjeta = tarjeta.querySelector('[data-filial]')?.getAttribute('data-filial').trim() || "";
            const statusTarjeta = tarjeta.getAttribute('data-status');
            const evaluacionTarjeta = tarjeta.getAttribute('data-status-evaluacion');
            const retroalimentacionTarjeta = tarjeta.querySelector('[data-retroalimentacion]')?.getAttribute('data-retroalimentacion') || "";

            // Para contadores de indicadores: aplicar solo filtro de filial y búsqueda
            const matchFilialParaIndicadores = valorFilialSeleccionada === 'ALL' || valorFilialSeleccionada === filialTarjeta;
            const matchTextoParaIndicadores = textoTarjeta.includes(searchTerm);

            if (matchFilialParaIndicadores && matchTextoParaIndicadores) {
                // Contar por status de indicadores
                if (statusTarjeta === 'incompleto') {
                    contadorStatusIncompleto++;
                } else if (statusTarjeta === 'aprobado') {
                    contadorStatusAprobado++;
                } else if (statusTarjeta === 'espera') {
                    contadorStatusEspera++;
                }
            }

            // Para contadores de evaluación: aplicar filtro de filial + indicadores + búsqueda
            const matchStatusParaEvaluacion = valorStatusSeleccionado === 'todos' || valorStatusSeleccionado === statusTarjeta;
            
            if (matchFilialParaIndicadores && matchStatusParaEvaluacion && matchTextoParaIndicadores) {
                // Contar por status de evaluación
                if (evaluacionTarjeta === 'True') {
                    contadorEvaluacionCompleta++;
                } else if (evaluacionTarjeta === 'False') {
                    contadorEvaluacionIncompleta++;
                }
            }

            // Para contadores de retroalimentación: aplicar filtro de filial + indicadores + evaluación + búsqueda
            const matchEvaluacionParaRetroalimentacion = valorEvaluacionSeleccionada === 'todos' || valorEvaluacionSeleccionada === evaluacionTarjeta;

            if (matchFilialParaIndicadores && matchStatusParaEvaluacion && matchEvaluacionParaRetroalimentacion && matchTextoParaIndicadores) {
                // Contar por status de retroalimentación
                if (retroalimentacionTarjeta === 'Abierta') {
                    contadorRetroalimentacionAbierta++;
                } else if (retroalimentacionTarjeta === 'Cerrada') {
                    contadorRetroalimentacionCerrada++;
                }
            }
        });

        // Actualizar los contadores en la UI
        spanCantidadAprobados.textContent = `${contadorStatusAprobado}`;
        spanCantidadEspera.textContent = `${contadorStatusEspera}`;
        spanCantidadIncompleta.textContent = `${contadorStatusIncompleto}`;

        if (spanCantidadEvaluacionCompleta) {
            spanCantidadEvaluacionCompleta.textContent = `${contadorEvaluacionCompleta}`;
        }
        if (spanCantidadEvaluacionIncompleta) {
            spanCantidadEvaluacionIncompleta.textContent = `${contadorEvaluacionIncompleta}`;
        }

        if (spanCantidadRetroalimentacionTerminada) {
            spanCantidadRetroalimentacionTerminada.textContent = `${contadorRetroalimentacionAbierta}`;
        }
        if (spanCantidadRetroalimentacionIncopmpleta) {
            spanCantidadRetroalimentacionIncopmpleta.textContent = `${contadorRetroalimentacionCerrada}`;
        }
    }

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
            const evaluacionTarjeta = tarjeta.getAttribute('data-status-evaluacion');
            const retroalimentacionTarjeta = tarjeta.querySelector('[data-retroalimentacion]')?.getAttribute('data-retroalimentacion') || "";

            // Comprobar si la tarjeta cumple con TODOS los filtros activos
            // 1ra prioridad: Filtro de filial
            const matchFilial = valorFilialSeleccionada === 'ALL' || valorFilialSeleccionada === filialTarjeta;
            
            // 2da prioridad: Filtro de indicadores (status)
            const matchStatus = valorStatusSeleccionado === 'todos' || valorStatusSeleccionado === statusTarjeta;
            
            // 3ra prioridad: Filtro de evaluación
            const matchEvaluacion = valorEvaluacionSeleccionada === 'todos' || valorEvaluacionSeleccionada === evaluacionTarjeta;
            
            //4ta prioridad: Filtro de retroalimentación
            const matchRetroalimentacion = valorRetroalimentacionSeleccionada === 'todos' || 
                                            (valorRetroalimentacionSeleccionada === 'True' && retroalimentacionTarjeta === 'Abierta') ||
                                            (valorRetroalimentacionSeleccionada === 'False' && retroalimentacionTarjeta === 'Cerrada');
            

            // 5ta prioridad: Búsqueda de texto
            const matchTexto = textoTarjeta.includes(searchTerm);

            // Si cumple con todos los filtros, mostrarla con animación. Si no, ocultarla.
            if (matchFilial && matchStatus && matchEvaluacion && matchTexto && matchRetroalimentacion) {
                const timeoutId = setTimeout(() => {
                    tarjeta.classList.remove('hidden');
                    tarjeta.style.transition = 'none';
                    tarjeta.style.opacity = '0';
                    tarjeta.style.transform = 'translateY(20px)';

                    // Forzar al navegador a repintar
                    void tarjeta.offsetHeight;

                    // Aplicar la animación de entrada
                    tarjeta.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    tarjeta.style.opacity = '1';
                    tarjeta.style.transform = 'translateY(0)';
                }, delay * 100);

                activeTimeouts.push(timeoutId);
                delay++;
            } else {
                tarjeta.classList.add('hidden');
                tarjeta.style.opacity = '0';
                tarjeta.style.transform = 'translateY(20px)';
                tarjeta.style.transition = 'none';
            }
        });

        // Actualizar contadores después de aplicar filtros
        actualizarContadores();
    }

    // Event listeners para filtro de filial
    botonesFilial.forEach(boton => {
        boton.addEventListener('click', function () {
            valorFilialSeleccionada = this.getAttribute('data-filial-button');
            botonDropDownFilial.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            aplicarFiltros();
        });
    });

    // Event listeners para filtro de indicadores (status)
    statusFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            valorStatusSeleccionado = this.getAttribute('data-status-button');
            botonDropDownStatus.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            aplicarFiltros();
        });
    });

    // Event listeners para filtro de evaluación
    evaluacionFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            valorEvaluacionSeleccionada = this.getAttribute('data-status-evaluacion-button');
            if (botonDropDownEvaluacion) {
                botonDropDownEvaluacion.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            }
            aplicarFiltros();
        });
    });


    // Event listeners para filtro de retroalimentación
    retroalimentacionFilterButtons.forEach(button => {
        button.addEventListener('click', function () {
            valorRetroalimentacionSeleccionada = this.getAttribute('data-status-evaluacion-button');
            if (botonDropDownRetroalimentacion) {
                botonDropDownRetroalimentacion.innerHTML = `${this.textContent.trim()} <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>`;
            }
            aplicarFiltros();
        });
    });


    // Event listener para búsqueda
    inputBuscador.addEventListener('keyup', function (e) {
        if (e.key === "Escape") {
            this.value = "";
        }
        aplicarFiltros();
    });

    // Inicializar contadores al cargar la página
    actualizarContadores();

    // Estilos CSS
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
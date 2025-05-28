document.addEventListener('DOMContentLoaded', function () {
    const botonesFilial = document.querySelectorAll('.FilialComparar');
    const inputBuscador = document.getElementById('default-search');
    const botonDropDown = document.getElementById('dropdown-button-2');
    const tarjetas = document.querySelectorAll('.flex.flex-col.col-span-3');

    let valorFilialSeleccionada = 'ALL'; // Default: mostrar todo
    let activeTimeouts = [];

    function aplicarFiltros() {
        const searchTerm = inputBuscador.value.toLowerCase();
        let delay = 0;

        activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        activeTimeouts = [];

        tarjetas.forEach(tarjeta => {
            const dataFilial = tarjeta.querySelector('[data-filial]');
            const texto = tarjeta.textContent.toLowerCase();
            const valorTarjetaFilial = dataFilial ? dataFilial.getAttribute('data-filial') : "";

            const matchFilial = valorFilialSeleccionada === 'ALL' || valorFilialSeleccionada === valorTarjetaFilial;
            const matchTexto = texto.includes(searchTerm);

            if (matchFilial && matchTexto) {
                const timeoutId = setTimeout(() => {
                    tarjeta.classList.remove('hidden');
                    tarjeta.style.transition = 'none';
                    tarjeta.style.opacity = '0';
                    tarjeta.style.transform = 'translateY(20px)';

                    void tarjeta.offsetHeight;

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
    }

    botonesFilial.forEach(boton => {
        boton.addEventListener('click', function () {
            valorFilialSeleccionada = boton.getAttribute('data-filial-button');
            botonDropDown.innerHTML = `${valorFilialSeleccionada}
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

    // Estilos iniciales
    const style = document.createElement('style');
    style.textContent = `
        .flex.flex-col.col-span-3 {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
    `;
    document.head.appendChild(style);
});

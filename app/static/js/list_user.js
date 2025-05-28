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

document.addEventListener("DOMContentLoaded", () => {
    const indicador = document.getElementById('indicador').value;
    const fichaCurrentUser = document.getElementById('fichaCurrentUser').value
    const indicadorStatus = document.getElementById('statusIndicador').value
    console.log(indicadorStatus)
    console.log(indicador)
    console.log(fichaCurrentUser)
    if (indicador != fichaCurrentUser){
        showAlert("Todos los Inputs estan bloqueados, solo puede visualizar", "success");

        const elementos = document.querySelectorAll('#formulario input, #formulario textarea, #formulario select, #formulario button');
            elementos.forEach(el => el.disabled = true);
    }

    if (indicadorStatus != 'Abierto'){
        showAlert("Todos los Inputs estan bloqueados, solo puede visualizar", "success");

        const elementos = document.querySelectorAll('#formulario input, #formulario textarea, #formulario select, #formulario button');
            elementos.forEach(el => el.disabled = true);
    }


});


let contador= 1
function addRowHV() {
    contador++
    const tablaHV = document.getElementById('tabla-HV').querySelector("tbody");
    const index = tablaHV.querySelectorAll("tr").length + 1;
    const newRow = document.createElement("tr");

    newRow.className = "hover:bg-gray-100 dark:hover:bg-gray-700";



    newRow.innerHTML = `
        <td class="border-t-0 px-4 py-3 align-middle text-sm border-l border-r border-gray-200 dark:border-gray-700">
            <textarea 
                name="Indicador${index}" 
                placeholder="Ejemplo: Fase 1. Preparacion" 
                required 
                rows="3"
                class="w-full bg-transparent p-0 focus:outline-none focus:ring-0 resize-none dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white"> 
            </textarea>
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="date" 
                name="fechaIngProg${index}" 
                required 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="date" 
                name="fechaFinProg${index}" 
                required 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="text" 
                name="avancePlang${index}"
                placeholder="%" 
                required
                readonly 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="date" 
                name="fechaInicioR${index}" 
                required 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="date" 
                name="fechaFinR${index}" 
                required 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="text" 
                name="avanceRea${index}" 
                placeholder="%" 
                required 
                readonly
                style = "border-none"
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <input 
                type="number" 
                name="desviacion${index}" 
                placeholder="%" 
                required
                readonly
                style = "border-none" 
                class="w-full bg-transparent no-border cursor-pointer p-2 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:placeholder-gray-400 dark:text-white">
        </td>

        <td class="border-t-0 px-4 py-3 align-middle text-sm text-center border-l border-r border-gray-200 dark:border-gray-700">
            <button class="delete bg-red-500 w-8 h-8 rounded-full flex justify-center items-center hover:bg-red-400 focus:outline-none" onclick="deleteRow(this)">
                <span class="material-symbols-rounded text-white">backspace</span>
            </button>
        </td>
    `;

    tablaHV.appendChild(newRow);
    actualizardatepicker()
    

    const fila = newRow;
    const inputInicio = fila.querySelector(`input[name="fechaIngProg${index}"]`);
    const inputFin = fila.querySelector(`input[name="fechaFinProg${index}"]`);
    const inputAvance = fila.querySelector(`input[name="avancePlang${index}"]`);
    const inputInicioR = fila.querySelector(`input[name="fechaInicioR${index}"]`);
    const inputFinReal = fila.querySelector(`input[name="fechaFinR${index}"]`);
    const inputAvanceRea = fila.querySelector(`input[name="avanceRea${index}"]`);
    const inputDesviacion = fila.querySelector(`input[name="desviacion${index}"]`);

    let diffHoyAInicio = 0;
    let diffInicioAFin = 0;
    let diffHoyInicioReal = 0;
    let diffInicioRealFinReal = 0;
    let avanceReal = 0;
    let avancePlanificado = 0;

    function actualizarResultado() {
        if (diffInicioAFin > 0) {
            let total = (diffHoyAInicio / diffInicioAFin) * 100;
            total = Math.min(100, parseFloat(total.toFixed(2)));
            inputAvance.value = `${total}%`;
            avancePlanificado = total;
            actualizarDesviacion();
        } else {
            inputAvance.value = "0%";
        }
    }

    function calcularAvancePlanificado() {
        const partesInicio = inputInicio.value.split("-");
        const partesFin = inputFin.value.split("-");

        if (partesInicio.length === 3 && partesFin.length === 3) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaInicio = new Date(partesInicio[0], partesInicio[1] - 1, partesInicio[2]);
            const fechaFin = new Date(partesFin[0], partesFin[1] - 1, partesFin[2]);

            const diffMsHoy = hoy - fechaInicio;
            diffHoyAInicio = Math.max(Math.round(diffMsHoy / (1000 * 60 * 60 * 24)), 0);
            diffInicioAFin = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

            if (diffInicioAFin < 0) {
                showAlert('Error: no puedes colocar que la fecha de fin es antes que la de inicio', 'error');
                inputAvance.value = "0%";
                avancePlanificado = 0;
                return;
            }

            actualizarResultado();
        }
    }

    inputInicio.addEventListener("change", calcularAvancePlanificado);
    inputFin.addEventListener("change", calcularAvancePlanificado);

    function actualizarResultadoAvance() {
        if (diffInicioRealFinReal > 0) {
            let total = (diffHoyInicioReal / diffInicioRealFinReal) * 100;
            total = Math.min(100, parseFloat(total.toFixed(2)));
            inputAvanceRea.value = `${total}%`;
            avanceReal = total;
            actualizarDesviacion();
        } else {
            inputAvanceRea.value = 0;
        }
    }

    function calcularAvanceReal() {
        const partesInicio = inputInicioR.value.split("-");
        const partesFin = inputFinReal.value.split("-");

        if (partesInicio.length === 3 && partesFin.length === 3) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaInicio = new Date(partesInicio[0], partesInicio[1] - 1, partesInicio[2]);
            const fechaFin = new Date(partesFin[0], partesFin[1] - 1, partesFin[2]);

            diffHoyInicioReal = Math.max(Math.round((hoy - fechaInicio) / (1000 * 60 * 60 * 24)), 0);
            console.log(`diferencia de la fecha de hoy con respecto a lo ingresado en el real  ${diffHoyInicioReal}`)
            diffInicioRealFinReal = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

            actualizarResultadoAvance();
        }
    }

    function actualizarDesviacion() {
        if (avanceReal > 0 && avancePlanificado > 0) {
            inputDesviacion.value = (avanceReal - avancePlanificado).toFixed(2);
        } else {
            inputDesviacion.value = "0";
        }
    }

    inputInicioR.addEventListener("change", calcularAvanceReal);
    inputFinReal.addEventListener("change", calcularAvanceReal);
}




document.querySelector('button[type="submit"]').addEventListener('click', function (e) {
    e.preventDefault();

    const idInput = document.getElementById('idIndicador');
    if (!idInput) {
        alert("No se encontró el input con ID 'indicador'.");
        return;
    }

    const id = idInput.value.trim();
    if (!id) {
        alert("El ID está vacío. No se puede continuar.");
        return;
    }

    const filas = document.querySelectorAll('#tabla-HV tbody tr');
    const data = [];

    filas.forEach((fila) => {
        const indicador = fila.querySelector('textarea[name^="Indicador"]')?.value.trim() || "";
        const fechaIngProg = fila.querySelector('input[name^="fechaIngProg"]')?.value || "";
        const fechaFinProg = fila.querySelector('input[name^="fechaFinProg"]')?.value || "";
        const avancePlan = fila.querySelector('input[name^="avancePlang"]')?.value || "";
        const fechaInicioReal = fila.querySelector('input[name^="fechaInicioR"]')?.value || "";
        const fechaFinReal = fila.querySelector('input[name^="fechaFinR"]')?.value || "";
        const avanceReal = fila.querySelector('input[name^="avanceReal"], input[name^="avanceRea"]')?.value || "";
        const desviacion = fila.querySelector('input[name^="desviacion"]')?.value || "";

        // Solo agregamos si al menos uno tiene datos
        if (indicador || fechaIngProg || fechaFinProg || avancePlan || fechaInicioReal || fechaFinReal || avanceReal || desviacion) {
            data.push({
                indicador,
                fechaIngProg,
                fechaFinProg,
                avancePlan,
                fechaInicioReal,
                fechaFinReal,
                avanceReal,
                desviacion
            });
        }
    });

    if (data.length === 0) {
        alert("No hay datos para enviar.");
        return;
    }

    console.log("Enviando:", { id, data });

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    fetch('/app_crm/agregarCronograma', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || ""
        },
        body: JSON.stringify({ id, data })
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK");
        return res.json();
    })
    .then(response => {
        console.log("Respuesta:", response);
        if (response.success) {
            window.location.reload();
        } else {
            alert("Error del servidor: " + response.message);
        }
    })
    .catch(err => {
        console.error("Error en el envío:", err);
        alert("Ocurrió un error al enviar los datos.");
    });
});


/*Para abrir los datepicker de una*/
function actualizardatepicker(){
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('click', () => {

            input.showPicker?.(); 
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.addEventListener('click', () => {

            input.showPicker?.(); 
        });
    });
});





function deleteRow(button) {

    const row = button.closest('tr');
    if (row) {
        row.remove();
    }
}









function showAlert(message, category = 'success') {

    const alertContainer = document.createElement('div');
    alertContainer.className = 'fixed top-5 z-[100000] animate-fade-in-up left-[40%]';
    
    const alertWrapper = document.createElement('div');
    alertWrapper.className = 'flex flex-col gap-2 w-[300px] text-[10px] sm:text-xs';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'error-alert cursor-default flex items-center w-full h-12 sm:h-14 rounded-lg bg-azul-dark px-[10px]';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex gap-2 items-center justify-around w-full';
    

    const iconContainer = document.createElement('div');
    iconContainer.className = category === 'error' 
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg';
    
    const iconSpan = document.createElement('span');
    if (category === 'error') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }
    
    // Contenido del mensaje
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex flex-col';
    
    const titleDiv = document.createElement('div');
    const titleText = document.createElement('h4');
    titleText.className = 'text-white';
    titleText.textContent = category === 'error' ? 'Error:' : 'Proceso Exitoso:';
    
    const messageDiv = document.createElement('div');
    const messageText = document.createElement('p');
    messageText.className = 'text-white';
    messageText.textContent = message;
    
    // Botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.className = 'flex close-btn';
    
    const closeIconContainer = document.createElement('div');
    closeIconContainer.className = category === 'error'
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg';
    
    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'material-symbols-rounded';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
    
    iconContainer.appendChild(iconSpan);
    titleDiv.appendChild(titleText);
    messageDiv.appendChild(messageText);
    messageContainer.appendChild(titleDiv);
    messageContainer.appendChild(messageDiv);
    closeIconContainer.appendChild(closeIconSpan);
    closeButton.appendChild(closeIconContainer);
    
    contentWrapper.appendChild(iconContainer);
    contentWrapper.appendChild(messageContainer);
    contentWrapper.appendChild(closeButton);
    
    alertBox.appendChild(contentWrapper);
    alertWrapper.appendChild(alertBox);
    alertContainer.appendChild(alertWrapper);
    

    document.body.appendChild(alertContainer);
    

    setTimeout(() => {

        alertContainer.style.opacity = '1';
    }, 10);
    

    closeButton.addEventListener('click', () => {
        alertContainer.style.opacity = '0';
        alertContainer.classList.add("animate-fade-out-right")
        setTimeout(() => {
            document.body.removeChild(alertContainer);
        }, 300);
    });
    
    setTimeout(() => {
        alertContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
            document.body.removeChild(alertContainer);
            }
        }, 300);
        }, 5000);
    }









    /*Si se esta editando*/
/*Es literalmente lo mismo que se hace en addrow pero aja es para editar */
document.addEventListener("DOMContentLoaded", () => {
    const tablaHV = document.getElementById('tabla-HV').querySelector("tbody");
    const filas = tablaHV.querySelectorAll("tr");

    filas.forEach((fila, i) => {
        const index = i + 1;

        const inputInicio = fila.querySelector(`input[name="fechaIngProg${index}"]`);
        const inputFin = fila.querySelector(`input[name="fechaFinProg${index}"]`);
        const inputAvance = fila.querySelector(`input[name="avancePlang${index}"]`);
        const inputInicioR = fila.querySelector(`input[name="fechaInicioR${index}"]`);
        const inputFinReal = fila.querySelector(`input[name="fechaFinR${index}"]`);
        const inputAvanceRea = fila.querySelector(`input[name="avanceReal${index}"]`);
        const inputDesviacion = fila.querySelector(`input[name="desviacion${index}"]`);

        let diffHoyAInicio = 0;
        let diffInicioAFin = 0;
        let diffHoyInicioReal = 0;
        let diffInicioRealFinReal = 0;

        let avancePlanificado = parseFloat(inputAvance?.value?.replace('%', '') || '0');
        let avanceReal = parseFloat(inputAvanceRea?.value?.replace('%', '') || '0');

        function actualizarDesviacion() {
            if (avanceReal > 0 && avancePlanificado > 0) {
                inputDesviacion.value = (avanceReal - avancePlanificado).toFixed(2);
            } else {
                inputDesviacion.value = "0";
            }
        }

        function actualizarResultado() {
            if (diffInicioAFin > 0) {
                let total = (diffHoyAInicio / diffInicioAFin) * 100;
                total = Math.min(100, parseFloat(total.toFixed(2)));
                inputAvance.value = `${total}%`;
                avancePlanificado = total;
                actualizarDesviacion();
            } else {
                inputAvance.value = "0%";
            }
        }

        function calcularAvancePlanificado() {
            const partesInicio = inputInicio?.value.split("-");
            const partesFin = inputFin?.value.split("-");

            if (partesInicio?.length === 3 && partesFin?.length === 3) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaInicio = new Date(partesInicio[0], partesInicio[1] - 1, partesInicio[2]);
                const fechaFin = new Date(partesFin[0], partesFin[1] - 1, partesFin[2]);

                diffHoyAInicio = Math.max(Math.round((hoy - fechaInicio) / (1000 * 60 * 60 * 24)), 0);
                diffInicioAFin = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

                if (diffInicioAFin < 0) {
                    showAlert('Error: no puedes colocar que la fecha de fin es antes que la de inicio', 'error');
                    inputAvance.value = "0%";
                    avancePlanificado = 0;
                    return;
                }

                actualizarResultado();
            }
        }

        function actualizarResultadoAvance() {
            if (diffInicioRealFinReal > 0) {
                let total = (diffHoyInicioReal / diffInicioRealFinReal) * 100;
                total = Math.min(100, parseFloat(total.toFixed(2)));
                inputAvanceRea.value = `${total}%`;
                avanceReal = total;
                actualizarDesviacion();
            } else {
                inputAvanceRea.value = "0";
            }
        }

        function calcularAvanceReal() {
            const partesInicio = inputInicioR?.value.split("-");
            const partesFin = inputFinReal?.value.split("-");

            if (partesInicio?.length === 3 && partesFin?.length === 3) {
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                const fechaInicio = new Date(partesInicio[0], partesInicio[1] - 1, partesInicio[2]);
                const fechaFin = new Date(partesFin[0], partesFin[1] - 1, partesFin[2]);

                diffHoyInicioReal = Math.max(Math.round((hoy - fechaInicio) / (1000 * 60 * 60 * 24)), 0);
                diffInicioRealFinReal = Math.round((fechaFin - fechaInicio) / (1000 * 60 * 60 * 24));

                actualizarResultadoAvance();
            }
        }


        inputInicio?.addEventListener("change", calcularAvancePlanificado);
        inputFin?.addEventListener("change", calcularAvancePlanificado);
        inputInicioR?.addEventListener("change", calcularAvanceReal);
        inputFinReal?.addEventListener("change", calcularAvanceReal);


        calcularAvancePlanificado();
        calcularAvanceReal();
    });
});

    
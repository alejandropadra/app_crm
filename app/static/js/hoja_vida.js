document.addEventListener("DOMContentLoaded", () => {
    const indicador = document.getElementById('indicador').value;
    const fichaCurrentUser = document.getElementById('fichaCurrentUser').value;
    const indicadorStatus = document.getElementById('statusIndicador').value;

    if (indicador !== fichaCurrentUser || indicadorStatus !== 'Abierto') {
        showAlert("Todos los Inputs están bloqueados, solo puede visualizar", "success");
        const elementos = document.querySelectorAll('#formulario input, #formulario textarea, #formulario select, #formulario button');
        elementos.forEach(el => el.disabled = true);
    }

    const inputTipoIndicador = document.getElementById("TipoIndicador");
    const listaTipoIndicador = document.getElementById("listaTipoIndicador");

    inputTipoIndicador.addEventListener('change', () => {
        const valor = inputTipoIndicador.value.trim();
        if (!valor) return;

        // Verificar si ya existe
        const yaExiste = Array.from(listaTipoIndicador.children).some(child => {
            return child.querySelector("span")?.textContent === valor;
        });

        if (yaExiste) {
            showAlert("Este tipo de indicador ya fue agregado.", "error");
            return;
        }

        // Crear tarjeta
        const tarjeta = document.createElement("div");
        tarjeta.className = "relative p-4 my-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm w-40";

        // Texto visible
        const texto = document.createElement("span");
        texto.textContent = valor;

        // Input hidden para enviar al backend
        const inputHidden = document.createElement("input");
        inputHidden.type = "hidden";
        inputHidden.name = "tipoIndicadores[]";
        inputHidden.value = valor;

        // Botón eliminar
        const botonEliminar = document.createElement("button");
        botonEliminar.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x">
                <circle cx="12" cy="12" r="10"/>
                <path d="m15 9-6 6"/>
                <path d="m9 9 6 6"/>
            </svg>`;
        botonEliminar.type = "button";
        botonEliminar.className = "absolute top-1 right-1 text-red-500 hover:text-red-700 text-sm";
        botonEliminar.addEventListener("click", () => {
            listaTipoIndicador.removeChild(tarjeta);
        });

        // Ensamblar
        tarjeta.appendChild(texto);
        tarjeta.appendChild(inputHidden);
        tarjeta.appendChild(botonEliminar);
        listaTipoIndicador.appendChild(tarjeta);

        // Limpiar el input
        inputTipoIndicador.value = "";
    });
});





function remove(event, boton) {
    event.preventDefault();
    const tarjeta = boton.closest('div');
    if (tarjeta) {
        tarjeta.remove();
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

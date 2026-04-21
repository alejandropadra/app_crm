document.addEventListener('DOMContentLoaded', function () {
    const botonEditar = document.getElementById('botonEditar');
    const ficha_get = document.getElementById('ficha_get').value;
    const rutaDestino = `/app_crm/gdd/gestion_equipo/${ficha_get}`;

    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    botonEditar.addEventListener('click', function (event) {
        event.preventDefault();

        const payload = [];  
        let haySeleccionado = false;

        const filas = document.querySelectorAll('#indicadorTable tbody tr');

        filas.forEach((fila) => {
            const checkbox = fila.querySelector('input[type="checkbox"]');
            const select = fila.querySelector('select');
            const indicador = fila.cells[1].textContent.trim();
            const rawId = fila.cells[11].textContent;
            const id = parseInt(rawId.replace(/\D/g, ""), 10);

            if (checkbox && checkbox.checked && select) {
                payload.push({
                    id: id,
                    nombre_indicador : indicador, 
                    aprobacion: select.value  
                });
                haySeleccionado = true;
            }
        });

        if (!haySeleccionado) {
            alert('Por favor selecciona al menos un indicador a editar.');
            return;
        }

        console.log('Payload a enviar:', payload);

        fetch(rutaDestino, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(payload)  
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(result => {
            console.log('Respuesta del servidor:', result);
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.reload();
        });
    });




    document.querySelectorAll('#editarStatus').forEach(btn => {
        btn.addEventListener('click', function () {
          // Encuentra el div#respuesta más cercano al botón
            const respuestaDiv = btn.closest('td').querySelector('#respuesta');
            if (!respuestaDiv) return;
    
            const span = respuestaDiv.querySelector('span');
            const select = respuestaDiv.querySelector('select');
        
            if (span && select) {
                // Alternar clases
                const spanIsHidden = span.classList.contains('hidden');
        
                if (spanIsHidden) {
                span.classList.remove('hidden');
                select.classList.add('hidden');
                } else {
                span.classList.add('hidden');
                select.classList.remove('hidden');
                }
            }
        });
    });



    

    const ficha_supervisor = document.getElementById('ficha_supervisor');
    const enviarRetroalimentacion = document.getElementById('enviarRetroalimentacion');
    const ComentarioColab = document.getElementById('ComentarioColab');
    const ComentarioSuperv = document.getElementById('ComentarioSuperv');
    const radioButtons = document.querySelectorAll('input[name="respuesta"]');
    const errorSpan = document.getElementById('error');


    const comentario_colaborador_resultado = document.getElementById('comentario_colaborador_resultado').value
    const comentario_superv_resultado = document.getElementById('comentario_superv_resultado').value;
    console.log(comentario_superv_resultado)
    const estado_evaluacion = document.getElementById('estado_evaluacion').value.trim();
    if (estado_evaluacion === "supervisorEvaluacion") {

        ComentarioColab.readOnly = true
        radioButtons.forEach(check => {
            const wrapper = check.closest('.radio-wrapper');
            wrapper.addEventListener("click", (e) => {
                console.log('s')
                e.preventDefault();
                showAlertGrandes('solo el colaborador puede responder esto', 'atencion');
            });

            wrapper.style.cursor = 'not-allowed';
        });
        if (comentario_superv_resultado!="None" && comentario_superv_resultado != ""  ) {
            console.log('sass')
            ComentarioSuperv.readOnly = true

            enviarRetroalimentacion.disabled = true;
            enviarRetroalimentacion.classList.remove('bg-valor-azul', 'hover:bg-azul-dark');
            enviarRetroalimentacion.classList.add('bg-gray-300');
        }
    }else{
        
        if (  comentario_colaborador_resultado!="None" && comentario_colaborador_resultado != ""  ) {
            console.log('asdas')
            ComentarioColab.readOnly = true
            enviarRetroalimentacion.disabled = true;
            enviarRetroalimentacion.classList.remove('bg-valor-azul', 'hover:bg-azul-dark');
            enviarRetroalimentacion.classList.add('bg-gray-300');
        }
    }
    
    enviarRetroalimentacion.addEventListener("click", () => {

        // Determinar qué rol está enviando según estado_evaluacion
        const esSupervisor = (estado_evaluacion === "supervisorEvaluacion");

        const respuestaSeleccionada = document.querySelector('input[name="respuesta"]:checked');

        // VALIDACIÓN: feedback solo es obligatorio para el colaborador (el supervisor no lo toca)
        if (!esSupervisor && !respuestaSeleccionada) {
            showAlert("Por favor seleccione si recibió el feedback", "error");
            errorSpan.style.display = 'block';
            return;
        }

        // VALIDACIÓN: el comentario del rol que envía no puede estar vacío
        if (esSupervisor) {
            if (!ComentarioSuperv || !ComentarioSuperv.value.trim()) {
                showAlert("Debe escribir su observación como supervisor antes de enviar", "error");
                return;
            }
        } else {
            if (!ComentarioColab.value.trim()) {
                showAlert("Debe escribir su observación antes de enviar", "error");
                return;
            }
        }

        errorSpan.style.display = 'none';

        // Armar payload: cada rol envía SOLO su campo
        const datos = [];

        if (esSupervisor) {
            // Supervisor: solo su comentario. NO toca feedback ni comentario del colaborador.
            datos.push({
                ficha: ficha_get,
                ComentarioSuperv: ComentarioSuperv.value.trim()
            });
        } else {
            // Colaborador: su comentario + feedback.
            datos.push({
                ficha: ficha_get,
                ComentarioColabr: ComentarioColab.value.trim(),
                feedback: respuestaSeleccionada.value,
                feedbackTexto: respuestaSeleccionada.value === "si" ? "Sí" : "No"
            });
        }

        fetch("/app_crm/Retroalimentacion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(datos)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(result => {
            console.log('Respuesta del servidor:', result);
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                errorSpan.style.display = 'none';
            }
        });
    });










    function autoResize(textarea, minRows = 1, maxRows = 10) {
        // Calcular altura de una línea
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;
        
        textarea.style.height = 'auto';
        const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
        textarea.style.height = newHeight + 'px';
        
        // Mostrar scrollbar si excede el máximo
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }

    const comentarioTextarea = document.getElementById('ComentarioColab');
    const comentarioTextareaSuperv = document.getElementById('ComentarioSuperv');

    comentarioTextarea.addEventListener('input', function() {
        autoResize(this, 1, 8); // mínimo 1 línea, máximo 8 líneas
    });

    if (comentarioTextareaSuperv){
            comentarioTextareaSuperv.addEventListener('input', function() {
            autoResize(this, 1, 8); // mínimo 1 línea, máximo 8 líneas
        });
            window.addEventListener('load', function() {
            autoResize(comentarioTextareaSuperv, 1, 8);
        });
    }



    window.addEventListener('load', function() {
        autoResize(comentarioTextarea, 1, 8);
    });

});




















































































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





    

function showAlertGrandes(message, category = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'fixed top-5 z-[100000] animate-fade-in-up left-[35%] transform -translate-x-1/2';
    
    const alertWrapper = document.createElement('div');
    alertWrapper.className = 'flex flex-col gap-2 w-auto max-w-md sm:max-w-lg text-[10px] sm:text-xs';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'error-alert cursor-default flex items-start w-full min-h-12 sm:min-h-14 rounded-lg bg-azul-dark px-[10px] py-3';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex gap-3 items-start justify-between w-full';
    
    // Contenedor del icono (fijo en la parte superior)
    const iconContainer = document.createElement('div');
    let iconColor = '';
    
    if (category === 'error') {
        iconColor = 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg flex-shrink-0 mt-1';
    } else if (category === 'atencion') {
        iconColor = 'text-[#ffc107] bg-white/5 backdrop-blur-xl p-1 rounded-lg flex-shrink-0 mt-1';
    } else {
        iconColor = 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg flex-shrink-0 mt-1';
    }
    
    iconContainer.className = iconColor;
    
    const iconSpan = document.createElement('span');
    if (category === 'error') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else if (category === 'atencion') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }
    
    // Contenido del mensaje (expandible)
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex flex-col flex-grow min-w-0';
    
    const titleDiv = document.createElement('div');
    const titleText = document.createElement('h4');
    titleText.className = 'text-white font-medium mb-2';
    
    if (category === 'error') {
        titleText.textContent = 'Error:';
    } else if (category === 'atencion') {
        titleText.textContent = 'Atención:';
    } else {
        titleText.textContent = 'Proceso Exitoso:';
    }
    
    const messageDiv = document.createElement('div');
    const messageText = document.createElement('p');
    messageText.className = 'text-white text-sm leading-relaxed whitespace-pre-line break-words';
    messageText.textContent = message;
    
    // Botón de cerrar (fijo en la esquina superior)
    const closeButton = document.createElement('button');
    closeButton.className = 'flex close-btn flex-shrink-0';
    
    const closeIconContainer = document.createElement('div');
    let closeIconColor = '';
    
    if (category === 'error') {
        closeIconColor = 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg hover:bg-white/10 transition-colors';
    } else if (category === 'atencion') {
        closeIconColor = 'text-[#ffc107] bg-white/5 backdrop-blur-xl p-1 rounded-lg hover:bg-white/10 transition-colors';
    } else {
        closeIconColor = 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg hover:bg-white/10 transition-colors';
    }
    
    closeIconContainer.className = closeIconColor;
    
    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'material-symbols-rounded';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    
    // Ensamblar los elementos
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
    
    // Agregar al DOM
    document.body.appendChild(alertContainer);
    
    // Animación de entrada
    setTimeout(() => {
        alertContainer.style.opacity = '1';
    }, 10);
    
    // Event listener para cerrar
    closeButton.addEventListener('click', () => {
        alertContainer.style.opacity = '0';
        alertContainer.classList.add("animate-fade-out-right");
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    });
    
    // Auto-cerrar después de 8 segundos (más tiempo para mensajes largos)
    setTimeout(() => {
        if (document.body.contains(alertContainer)) {
            alertContainer.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(alertContainer)) {
                    document.body.removeChild(alertContainer);
                }
            }, 300);
        }
    }, 8000);
}

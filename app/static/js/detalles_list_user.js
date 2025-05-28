let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
const ficha_get = document.getElementById('ficha_get').value;
document.addEventListener('DOMContentLoaded', function () {
    const boton_bloquear = document.getElementById('boton_bloquear');
    const boton_Abrir = document.getElementById('boton_abrir')
    const rutaDestino = `/app_crm/detalles_usuarios/${ficha_get}`;



    boton_bloquear.addEventListener('click', function (event) {
        event.preventDefault();

        const payload = [];  
        let haySeleccionado = false;

        const filas = document.querySelectorAll('#indicadorTable tbody tr');
        console.log(filas)
        filas.forEach((fila) => {
            const checkbox = fila.querySelector('input[type="checkbox"]');
            const rawId = fila.cells[12].textContent;
            const id = parseInt(rawId.replace(/\D/g, ""), 10);

            if (checkbox && checkbox.checked ) {
                payload.push({
                    id: id,
                    estado: 'Cerrado'   
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




    
    boton_Abrir.addEventListener('click', function (event) {
        event.preventDefault();

        const payload = [];  
        let haySeleccionado = false;

        const filas = document.querySelectorAll('#indicadorTable tbody tr');
        console.log(filas)
        filas.forEach((fila) => {
            const checkbox = fila.querySelector('input[type="checkbox"]');
            const rawId = fila.cells[12].textContent;

            const id = parseInt(rawId.replace(/\D/g, ""), 10);

            if (checkbox && checkbox.checked ) {
                payload.push({
                    id: id,
                    estado: 'Abierto'   
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







    /*
    const checkbox = document.getElementById('inpLock');
    const status_actual= document.getElementById('status_actual');
    checkbox.addEventListener('click', () => {

        const nuevoEstado = (status_actual === 'AFACTIVO') ? 'Abierto' : 'AFACTIVO';
        console.log(nuevoEstado)
        fetch(rutaDestino, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify('Abierto')  
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
    });*/

});


document.addEventListener('DOMContentLoaded', async function() {

    const ficha_get = document.getElementById('ficha_get').value;
    const rutaDestino = `/app_crm/detalles_usuarios/${ficha_get}`;
    const seguro = document.getElementById('seguro');
    const textoPrincipalModal = document.getElementById('textoPrincipalModal');
    const textoSmall = document.getElementById('textoSmall');
    const spanEstadoActual = document.getElementById('estadoActual');
    const checkbox = document.getElementById('inpLock')
    const modal = document.getElementById("popup-modal");
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);

    let status_actual
    await actualizarEstadoDesdeServidor()

    async function actualizarEstadoDesdeServidor() {
        try {
            const numeroParaEnviar = ficha_get; 
            const response = await fetch('/app_crm/consultarStatusConFicha', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({ numero: numeroParaEnviar })
            });
            if (!response.ok) throw new Error('Error al consultar el estado');
            const data = await response.json();
            
            if (data.success) {
                status_actual = data.estado;
                if (status_actual == "AFACTIVO"){
                    status_actual = "Abierto";
                }

                spanEstadoActual.textContent = status_actual;
                spanEstadoActual.classList.remove('text-[#e32c24]', 'text-[#047c54]');
                spanEstadoActual.classList.add(status_actual === "Abierto" ? 'text-[#047c54]' : 'text-[#e32c24]');
                checkbox.checked = (status_actual === "Cerrado");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al consultar el estado inicial del sistema');
        }
    }

    checkbox.addEventListener("click", function (event) {
        event.preventDefault();

        if (status_actual === "Abierto") {
            textoPrincipalModal.textContent = '¿Estás seguro de hacer el bloqueo del usuario?';
            textoSmall.textContent = 'Recuerda, se le bloqueará el proceso de GDD';
        } else {
            textoPrincipalModal.textContent = '¿Estás seguro de habilitar su proceso del GDD?';
            textoSmall.textContent = 'Recuerda, se le habilitará el proceso de GDD';
        }

        modal.removeAttribute("aria-hidden");
        modal.removeAttribute("inert");
        modalInstance.show();
    });



    seguro.addEventListener("click", async function () {
        
        let nuevoEstado
        
        if (status_actual === "Abierto" || status_actual === "AFACTIVO"){
            nuevoEstado = 'Cerrado'
        }else{
            nuevoEstado = 'Abierto'
        }
        console.log("Nuevo estado a enviar:", nuevoEstado);


        try {
            const response = await fetch(rutaDestino, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({
                    accion: "actualizar",
                    estado: nuevoEstado
                })
            });

            if (!response.ok) throw new Error('Error en la solicitud');

            const result = await response.json();
            console.log('Respuesta del servidor:', result);
            showAlert("Actualizado Exitosamente", "Success")
            await actualizarEstadoDesdeServidor();
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            alert('Ocurrió un error al actualizar el estado.');
        } finally {
            modalInstance.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();

        }
    });

    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.blur();
            document.activeElement.blur();
            checkbox.checked = (status_actual === 'Cerrado');
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("inert", "");
            modalInstance.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();
        });
    });

    /*
    radioButtons.forEach(function(radioButton) {
        radioButton.addEventListener('change', async function() { 
            if (this.checked) {
                const selectedValue = this.value;
                console.log(selectedValue);


                
                try {
                    const response = await fetch(rutaDestino, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": csrfToken
                        },
                        body: JSON.stringify(selectedValue)
                    });
            
                    if (!response.ok) throw new Error('Error en la solicitud');
            
                    const result = await response.json();
                    console.log('Respuesta del servidor:', result);



                    await actualizarEstadoDesdeServidor(); 
            
                } catch (error) {
                    console.error('Error al enviar nuevo estado:', error);
                    alert('Ocurrió un error al actualizar el estado.');
                } finally {
                    // Asegúrate de que modalInstance esté definido
                    if (typeof modalInstance !== 'undefined' && modalInstance) {
                        modalInstance.hide();
                    }
                }
            }
        });
    });*/





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


document.addEventListener("DOMContentLoaded", async function () {


    const radioButtons = document.querySelectorAll('input[name="radio"]');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    const modal = document.getElementById("popup-modal");
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const seguro = document.getElementById('seguro');
    const rutaDestino = "/app_crm/configuracionGDD";




    const spanGDD = document.getElementById('spanGDD');
    const spanIndicadores = document.getElementById('spanIndicadores');

    let status_actual_indicadores = null;
    let status_actual_gdd = null;

    async function actualizarEstadoDesdeServidor() {
        try {
            const response = await fetch('/app_crm/consultarStatus', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                }
            });
    
            if (!response.ok) throw new Error('Error al consultar el estado');
    
            const data = await response.json();
    
            if (data.success) {
                status_actual_indicadores = data.status_actual_indicadores;
                status_actual_gdd = data.status_user;

                /* SPAN DE GDD */
                spanGDD.textContent = status_actual_gdd;
                spanGDD.classList.remove('text-[#e32c24]', 'text-[#047c54]', 'text-[#3073f1]');
                spanGDD.classList.add(
                    status_actual_gdd === "Abierto"
                        ? 'text-[#047c54]'
                        : status_actual_gdd === "AFACTIVO"
                        ? 'text-[#3073f1]'
                        : 'text-[#e32c24]'
                );
                
                /* SPAN DE INDICADORES */
                spanIndicadores.textContent = status_actual_indicadores;
                spanIndicadores.classList.remove('text-[#e32c24]', 'text-[#047c54]');
                spanIndicadores.classList.add(status_actual_indicadores === "Abierto" ? 'text-[#047c54]' : 'text-[#e32c24]');

                /* LOGICA PARA LOS CHECKS ACTIVE */
                const radios = {
                    "Cerrado": {
                        input: document.querySelector('#inputradioDos'),
                        label: document.querySelector('.radioCheck.uno')
                    },
                    "Abierto": {
                        input: document.querySelector('#inputradio'),
                        label: document.querySelector('.radioCheck.dos')
                    },
                    "AFACTIVO": {
                        input: document.querySelector('#inputradioTres'),
                        label: document.querySelector('.radioCheck.tres')
                    }
                };
                

                Object.values(radios).forEach(({ input, label }) => {
                    input.checked = false;
                    if (label && label.parentElement) {
                        label.parentElement.classList.remove('active-effect');
                    }
                });
                

                console.log("Estado actual GDD:", status_actual_gdd);
                
                // Activar el radio correspondiente
                if (status_actual_gdd === "Abierto" && radios["Abierto"]) {
                    const { input, label } = radios["Abierto"];
                    input.checked = true;
                    label.parentElement.classList.add('active-effect');
                } else if (status_actual_gdd === "Cerrado" && radios["Cerrado"]) {
                    const { input, label } = radios["Cerrado"];
                    input.checked = true;
                    label.parentElement.classList.add('active-effect');
                } else if (status_actual_gdd === "AFACTIVO" && radios["AFACTIVO"]) {
                    const { input, label } = radios["AFACTIVO"];
                    input.checked = true;
                    label.parentElement.classList.add('active-effect');
                }
            

            } else {
                throw new Error(data.message || "Respuesta sin éxito al consultar estado");
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al consultar el estado inicial del sistema');
        }
    }

    await actualizarEstadoDesdeServidor()

    let estadoAcambiar =null;
    radioButtons.forEach(function(radioButton) {
        radioButton.addEventListener('change', function(event) {
            event.preventDefault()
            if (this.checked) {

                estadoAcambiar = this.value;
                console.log(estadoAcambiar)

                if (estadoAcambiar === "Abierto") {
                    textoPrincipalModal.textContent = '¿Estás seguro de que quieres habilitar masivamente el proceso GDD?';
                    textoSmall.textContent = 'Esta Acción lleva a cabo que los usuarios puedan editar y agregar nuevos indicadores, pero no podrán Agregar el campo de AFACTUAL';
                } else if (estadoAcambiar ==="Cerrado")  {
                    textoPrincipalModal.textContent = '¿Estás seguro de bloquear masivamente el proceso GDD?';
                    textoSmall.textContent = 'Esta acción hará que los usuarios no puedan ni agregar ni editar los indicadores';
                } else if(estadoAcambiar ==="AFACTIVO"){
                    textoPrincipalModal.textContent = '¿Estás seguro de Habilitar el AFACTUAL del proceso GDD?';
                    textoSmall.textContent = 'Esta acción hará que los usuarios puedan agregar el AFACTUAL de los indicadores, pero no podrán agregar indicadores, ni editar campos como nombre del indicador, peso, etc...';
                }
        
                modal.removeAttribute("aria-hidden");
                modal.removeAttribute("inert");
                modalInstance.show();
                /*
                console.log(this)
                // Elimina la clase de todos los divs contenedores
                document.querySelectorAll('.radioCheck' ).forEach(label => {
                    const parentDiv = label.parentElement;
                    if (parentDiv) parentDiv.classList.remove('active-effect');
                });
    
                // Agrega clase solo al div contenedor del radio seleccionado
                const label = this.closest('.radioCheck');
                const parentDiv = label?.parentElement;
                if (parentDiv) parentDiv.classList.add('active-effect');*/
            }
        });
    });

    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.blur();
            document.activeElement.blur();
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("inert", "");
            modalInstance.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();
        });
    });


    seguro.addEventListener("click", async function () {

        try {
            const response = await fetch(rutaDestino, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify(estadoAcambiar)
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

    
    


    
    


});



document.addEventListener("DOMContentLoaded", async function () {
    const enviarStart = document.getElementById('enviarStart');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    const modal = document.getElementById("popup-modalDos");
    const modalLoading = document.getElementById("popup-cargando");
    const modalInstanceLoading = new Modal(modalLoading, {
        backdrop: 'static',  
        closable: false     
    });
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const segurodos = document.getElementById('seguroDos');
    const rutaDestinoCorreo = "/app_crm/configuracionGDD/CorreoMasivo";
    const textoPrincipalModalDos = document.getElementById('textoPrincipalModalDos');
    const textoSmallDos  = document.getElementById('textoSmallDos');
    let texto =''
    enviarStart.addEventListener("click",  () => {
            const startdate = document.getElementById('startdate').value;
            if(!startdate){
                showAlert('Seleccione un rango de fecha', "error")
                return;
            }
            const fechas = startdate.split(' - ');

            if (fechas.length === 2) {
                texto = `${fechas[0]} hasta ${fechas[1]}`;
                console.log(texto);
            } else {
                console.log("Formato inválido:", startdate);
            }
            textoPrincipalModalDos.textContent = '¿Estas seguro de enviar la notificacion de inicio?';
            textoSmallDos.textContent = `Se enviará que el periodo para la carga de la información será desde ${texto}. `;
                
        
                modal.removeAttribute("aria-hidden");
                modal.removeAttribute("inert");
                modalInstance.show();
    });


    segurodos.addEventListener("click", async function () {
        modalLoading.removeAttribute("aria-hidden");
        modalLoading.removeAttribute("inert");
        modalInstanceLoading.show();
        try {
            const response = await fetch(rutaDestinoCorreo, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({texto})
            });

            if (!response.ok) throw new Error('Error en la solicitud');

            const result = await response.json();
            console.log('Respuesta del servidor:', result);
            showAlert("Notificación Masiva Realizada", "Success")
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            alert('Ocurrió un error al actualizar el estado.');
        } finally {
            modalInstanceLoading.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();

        }
    });

    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.blur();
            document.activeElement.blur();
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("inert", "");
            modalInstance.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();
        });
    });
    
    


});





















document.addEventListener("DOMContentLoaded", async function () {
    const enviarStartDos = document.getElementById('enviarStartDos');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    const modal = document.getElementById("popup-modalTres");
    const modalLoading = document.getElementById("popup-cargando");
    const modalInstanceLoading = new Modal(modalLoading, {
        backdrop: 'static',  
        closable: false     
    });
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const segurotres = document.getElementById('seguroTres');
    const rutaDestinoCorreo = "/app_crm/configuracionGDD/CorreoMasivo";
    const textoPrincipalModalDos = document.getElementById('textoPrincipalModalTres');
    const textoSmallDos  = document.getElementById('textoSmallTres');
    let texto =''
    enviarStartDos.addEventListener("click",  () => {

            const finDate = document.getElementById('finDate').value;
            console.log(finDate)
            if(!finDate){
                showAlert('Seleccione un rango de fecha', "error")
                return;
            }

            texto = `${finDate}`

            textoPrincipalModalDos.textContent = '¿Estas seguro de enviar la notificacion de inicio?';
            textoSmallDos.textContent = `Se enviará que el periodo para la carga de la información será desde ${texto}. `;
                
        
                modal.removeAttribute("aria-hidden");
                modal.removeAttribute("inert");
                modalInstance.show();
    });


    segurotres.addEventListener("click", async function () {
        modalLoading.removeAttribute("aria-hidden");
        modalLoading.removeAttribute("inert");
        modalInstanceLoading.show();
        try {
            const response = await fetch(rutaDestinoCorreo, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({texto})
            });

            if (!response.ok) throw new Error('Error en la solicitud');

            const result = await response.json();
            console.log('Respuesta del servidor:', result);
            showAlert("Notificación Masiva Realizada", "Success")
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            alert('Ocurrió un error al actualizar el estado.');
        } finally {
            modalInstanceLoading.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();

        }
    });

    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.blur();
            document.activeElement.blur();
            modal.setAttribute("aria-hidden", "true");
            modal.setAttribute("inert", "");
            modalInstance.hide();
            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();
        });
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
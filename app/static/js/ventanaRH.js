const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
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
        radioButton.addEventListener('click', function(event) {
            event.preventDefault()
            if (this.checked) {

                estadoAcambiar = this.value;
                if (estadoAcambiar === status_actual_gdd) {
                    console.log('Ya está en ese estado, no se puede cambiar al mismo');
                    showAlert('El sistema ya está en ese estado', 'error');
                    return;
                }
                
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
            actualizarSeleccionVisual();
        });
    });


    function actualizarSeleccionVisual() {
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
    
    // Desmarcar todos
    Object.values(radios).forEach(({ input, label }) => {
        input.checked = false;
        if (label && label.parentElement) {
            label.parentElement.classList.remove('active-effect');
        }
    });
    
    // Marcar el del estado actual
    if (status_actual_gdd && radios[status_actual_gdd]) {
        const { input, label } = radios[status_actual_gdd];
        input.checked = true;
        if (label && label.parentElement) {
            label.parentElement.classList.add('active-effect');
        }
    }
}

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
                body: JSON.stringify({
                    texto: texto,
                    tipo: 'inicio'
                })
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
    const textoSmallDos  = document.getElementById('textoSmallCuatro');
    let texto =''
    enviarStartDos.addEventListener("click",  () => {

            const segundaEtapaDate = document.getElementById('segundaEtapaDate').value;
            console.log(segundaEtapaDate)
            if(!segundaEtapaDate){
                showAlert('Seleccione un rango de fecha', "error")
                return;
            }

            texto = `${segundaEtapaDate}`

            textoPrincipalModalDos.textContent = '¿Estas seguro de enviar la notificacion de Cierre?';
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
                body: JSON.stringify({
                    texto: texto,
                    tipo: 'cierre'
                })
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
    const enviarStartCinco = document.getElementById('enviarStartCinco');

    const modal = document.getElementById("popup-modalCinco");
    const modalLoading = document.getElementById("popup-cargando");
    const modalInstanceLoading = new Modal(modalLoading, {
        backdrop: 'static',  
        closable: false     
    });
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const segurocuatro = document.getElementById('seguroCinco');
    const rutaDestinoCorreo = "/app_crm/configuracionGDD/CorreoMasivo";
    const textoPrincipalModalCinco = document.getElementById('textoPrincipalModalCinco');
    const textoSmallCinco  = document.getElementById('textoSmallCinco');
    let texto =''
    enviarStartCinco.addEventListener("click",  () => {

        
            const segundaEtapaDate = document.getElementById('segundaEtapaDate').value;
            console.log(segundaEtapaDate)

            
            if(!segundaEtapaDate){
                showAlert('Seleccione un rango de fecha', "error")
                return;
            }

            const fechas = segundaEtapaDate.split(' - ');

            if (fechas.length === 2) {
                texto = `${fechas[0]} hasta ${fechas[1]}`;
                console.log(texto);
            } else {
                console.log("Formato inválido:", startdate);
            }

            textoPrincipalModalCinco.textContent = '¿Estas seguro de enviar la notificacion de carga de resultados y proceso de evaluacion de competencias?';
            textoSmallCinco.textContent = `Se enviará que el periodo para la carga de la información será desde ${texto}. `;
                
        
                modal.removeAttribute("aria-hidden");
                modal.removeAttribute("inert");
                modalInstance.show();
    });


    segurocuatro.addEventListener("click", async function () {
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
                body: JSON.stringify({
                    texto: texto,
                    tipo: 'InicioEtapaDos'
                })
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
    const enviarStartCuatro = document.getElementById('enviarStartCuatro');

    const modal = document.getElementById("popup-modalCuatro");
    const modalLoading = document.getElementById("popup-cargando");
    const modalInstanceLoading = new Modal(modalLoading, {
        backdrop: 'static',  
        closable: false     
    });
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const segurocuatro = document.getElementById('seguroCuatro');
    const rutaDestinoCorreo = "/app_crm/configuracionGDD/CorreoMasivo";
    const textoPrincipalModalDos = document.getElementById('textoPrincipalModalTres');
    const textoSmallDos  = document.getElementById('textoSmallTres');
    let texto =''
    enviarStartCuatro.addEventListener("click",  () => {

        
            const finDate = document.getElementById('avanceDate').value;
            console.log(finDate)

            
            if(!finDate){
                showAlert('Seleccione un rango de fecha', "error")
                return;
            }

            const fechas = finDate.split(' - ');

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


    segurocuatro.addEventListener("click", async function () {
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
                body: JSON.stringify({
                    texto: texto,
                    tipo: 'avance'
                })
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
    // Variables globales dentro del scope del DOMContentLoaded
    const etapa_general = parseInt(document.getElementById('etapa_general').value.trim());
    const steps = document.querySelectorAll('.step-container');
    const progress = document.getElementById('progress'); 
    const circles = document.querySelectorAll('.circle'); 
    const labels = document.querySelectorAll('.step-label');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const modalStep = document.getElementById("popup-modalStep");
    const modalInstance = new Modal(modalStep);

    const modalStepFinTodo = document.getElementById("popup-modalFinTodo");
    const modalInstanceFintodo = new Modal(modalStepFinTodo);
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const seguroStep = document.getElementById('seguroStep');
    const seguroFinTodo = document.getElementById('SeguroFinTodo');

    const modalLoading = document.getElementById("popup-cargando");
    const modalInstanceLoading = new Modal(modalLoading, {
        backdrop: 'static',  
        closable: false     
    });

    let currentActive = etapa_general;

    // Inicialización del estado visual
    steps.forEach((paso, indice) => {
        const circulo = paso.querySelector('.circle');
        const progreso = paso.querySelector('.step-label');
        
        circulo.classList.remove('active');
        progreso.classList.remove('active');

        if ((indice + 1) <= etapa_general) { 
            circulo.classList.add('active');
            progreso.classList.add('active');
        }
    });

    const activeCircles = document.querySelectorAll('.circle.active');
    if (circles.length > 1) {
        progress.style.width = (activeCircles.length - 1) / (circles.length - 1) * 100 + '%';
    }

    updateButtons();

    // Event listeners para los botones de cancelar
    cancelButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            btn.blur();
            document.activeElement.blur();

            const modales = [
                { elemento: modalStep, instancia: modalInstance },
                { elemento: modalStepFinTodo, instancia: modalInstanceFintodo }
            ];

            modales.forEach(({ elemento, instancia }) => {
                if (!elemento.hasAttribute("aria-hidden")) {
                    elemento.setAttribute("aria-hidden", "true");
                    elemento.setAttribute("inert", "");
                    instancia.hide();
                }
            });

            const backdrop = document.querySelector('[modal-backdrop]');
            if (backdrop) backdrop.remove();
        });
    });

    // Event listener para el botón "next"
    next.addEventListener('click', () => {
        let tempActive = currentActive + 1;
        if (tempActive > circles.length) {
            tempActive = circles.length;
        }
        
        if (tempActive < 3){
            CambioModal(tempActive);
            modalStep.removeAttribute("aria-hidden");
            modalStep.removeAttribute("inert");
            modalInstance.show();
        } else {
            modalStepFinTodo.removeAttribute("aria-hidden");
            modalStepFinTodo.removeAttribute("inert");
            modalInstanceFintodo.show();
        }
    });

    // Event listener para el botón "prev"
    prev.addEventListener("click", async function () {
        let tempActive = currentActive - 1;
        if (tempActive < 1) {
            tempActive = 1;
        }

        CambioModal(tempActive);
        modalStep.removeAttribute("aria-hidden");
        modalStep.removeAttribute("inert");
        modalInstance.show();
    });

    seguroStep.addEventListener("click", async function () {
        // Obtener el valor de la etapa del modal
        const etapaActualElement = document.getElementById('etapaActual');
        const nuevaEtapa = parseInt(etapaActualElement.textContent);
        
        modalInstance.hide();
        const backdrop = document.querySelector('[modal-backdrop]');
        if (backdrop) backdrop.remove();
        
        const textoLoading = document.getElementById('textoLoading');
        textoLoading.textContent = "Realizando el Proceso...";
        modalLoading.removeAttribute("aria-hidden");
        modalLoading.removeAttribute("inert");
        modalInstanceLoading.show();
        
        try {
            await enviarAlBackendEtapaAño('MoverEtapa', nuevaEtapa);
            // Solo actualizar currentActive si el backend responde exitosamente
            currentActive = nuevaEtapa;
            update();
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            alert('Ocurrió un error al actualizar el estado.');
        } finally {
            setTimeout(() => {
                modalInstanceLoading.hide();
                const backdrop = document.querySelector('[modal-backdrop]');
                if (backdrop) backdrop.remove();
            }, 1500); 
        }
    });

    seguroFinTodo.addEventListener("click", async function() {
        const Afconfig = document.getElementById('Afconfig').value.trim();
        if (!Afconfig || Afconfig == "") {
            showAlert("Ingrese el valor del proximo Año Fiscal", 'error');
            return;
        }
        
        const textoLoading = document.getElementById('textoLoading');
        textoLoading.textContent = "Realizando el Proceso...";
        
        try {
            modalInstanceFintodo.hide();
            
            // La etapa final es 3 (circles.length)
            const nuevaEtapa = circles.length;
            
            await enviarAlBackendEtapaAño('actualizarAF', Afconfig);
            await enviarAlBackendEtapaAño('MoverEtapa', nuevaEtapa);
            
            modalLoading.removeAttribute("aria-hidden");
            modalLoading.removeAttribute("inert");
            modalInstanceLoading.show();
            
            currentActive = nuevaEtapa;
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            alert('Ocurrió un error al actualizar el estado.');
        } finally {
            setTimeout(() => {
                modalInstanceLoading.hide();
                const backdrop = document.querySelector('[modal-backdrop]');
                if (backdrop) backdrop.remove();
                update();
                window.location.reload();
            }, 1500); 
        }
    });

    function update() {
        circles.forEach((circle, idx) => {
            if (idx < currentActive) {
                circle.classList.add('active');
                labels[idx].classList.add('active');
            } else {
                circle.classList.remove('active');
                labels[idx].classList.remove('active');
            }
        });

        const activeCircles = document.querySelectorAll('.circle.active');
        if (circles.length > 1) {
            progress.style.width = (activeCircles.length - 1) / (circles.length - 1) * 100 + '%';
        }

        updateButtons();
    }

    function updateButtons() {
        console.log('currentActive:', currentActive);
        prev.disabled = currentActive === 1;
        next.disabled = currentActive === circles.length;
    }

    async function enviarAlBackendEtapaAño(sufijo_ruta, currentActive) {
        try {
            const response = await fetch(`/app_crm/configuracionGDD/${sufijo_ruta}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({currentActive})
            });

            if (!response.ok) throw new Error('Error en la solicitud');

            const result = await response.json();
            console.log('Respuesta del servidor:', result);
            showAlert("Etapa Modificada Exitosamente", "Success");
        } catch (error) {
            console.error('Error al enviar nuevo estado:', error);
            throw error; // Re-lanzar para que el catch externo lo maneje
        } 
    }

    function CambioModal(activeValue) {
        const etapaActual = document.getElementById('etapaActual');
        const modalStepTextoSmall = document.getElementById('modalStepTextoSmall');
        etapaActual.textContent = activeValue;

        let texto;
        if (activeValue == 2) {
            texto = 'En estado 2, se le habilitará el proceso de Evalución de Competencias a los usuarios';
        } else if (activeValue == 1) {
            texto = 'En Estado 1, los usuarios solo podrán realizar su proceso de Gestion de Indicadores, por lo tanto el modulo de evaluaciones no estará disponible';
        }

        modalStepTextoSmall.textContent = texto;
    }
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






























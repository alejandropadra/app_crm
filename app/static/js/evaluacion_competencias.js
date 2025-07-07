
const ficha_del_dueño_del_indicador= document.getElementById('ficha_del_dueño_del_indicador').value;
const ficha_usuario_actual= document.getElementById('ficha_usuario_actual').value;
const ficha_evaluador_supervisor= document.getElementById('ficha_evaluador_supervisor').value;

function disableInputs(elements) {
    elements.forEach(element => {

        element.classList.add('disabled');

        const selected = element.querySelector('.dropdown-selected');
        if (selected) {
            selected.style.pointerEvents = "none";
            selected.style.opacity = "0.5"; 
        }
        const hiddenInput = element.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.disabled = true;
        }
    });
}


function bloquearResultado(elements) {

    elements.forEach(element => {
        element.classList.add('!bg-[#e32c24]', '!text-white', 'flex', 'items-center', 'justify-center', 'w-[50%]', 'mx-auto'); 
        element.classList.remove('text-[#333]', 'bg-red-300', 'bg-yellow-300', 'bg-slate-300', 'bg-blue-300', 'bg-green-300');
        element.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off-icon lucide-eye-off"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`;

    });
}

function bloquearResultadoLineas(elements) {

    elements.forEach(element => {
    
        element.innerHTML = `<span>---</span>`;
        element.classList.remove('text-[#333]', 'bg-red-300', 'bg-yellow-300', 'bg-slate-300', 'bg-blue-300', 'bg-green-300');
    });
}
function ocultarBotonEditarInputs(elements) {
    elements.forEach(element => {

        element.classList.add('disabled');
        element.classList.add('hidden');
    });
}
document.addEventListener('DOMContentLoaded', function() {
    
    const habilitacion_supervisor = document.getElementById('habilitacion_supervisor').value;   
    const estado_evaluacion = document.getElementById('estado_evaluacion').value
    const inputs_supervisor = document.querySelectorAll('.custom-dropdown.supervisor');
    const inputs_par = document.querySelectorAll('.custom-dropdown.parEvaluacion');
    const inputs_subordinado = document.querySelectorAll('.custom-dropdown.subordinadoEvaluacion');
    const inputs_autoeval = document.querySelectorAll('.custom-dropdown.autoevaluacionDropDown');
    
    
    
    const span_autoeval = document.querySelectorAll('.resultado_span_autoevaluacion');
    const span_supervisor = document.querySelectorAll('.resultado_span_supervisorEvaluacion');
    const span_par = document.querySelectorAll('.resultado_span_par');
    const span_subordinado = document.querySelectorAll('.resultado_span_subordinado');
    const span_cumplimiento = document.querySelectorAll('.resultado_span_cumplimiento');
    const span_desempeño = document.querySelectorAll('.resultado_span_desempeño')

    //Botones:

    const botonAutoEvaluacion = document.querySelectorAll('.AutoevalEditar');
    const superviEvalEditar = document.querySelectorAll('.superviEvalEditar'); 
    const parEvalEditar = document.querySelectorAll('.parEvalEditar'); 
    const subordinadoEditar = document.querySelectorAll('.suborDevalEditar')

    console.log(estado_evaluacion)

    if (estado_evaluacion == "Autoevaluacion"){//CUANDO ESTAMOS EN AUTOEVALUACIÓN SE HACE ESTOOOOOO
        //Los inputs
        inputs_supervisor.length > 0 ? disableInputs(inputs_supervisor) : null;
        inputs_par.length > 0 ? disableInputs(inputs_par) : null;
        inputs_subordinado.length > 0 ? disableInputs(inputs_subordinado) : null;

        //Los botones para editar
        superviEvalEditar.length > 0 ? ocultarBotonEditarInputs(superviEvalEditar): null;
        parEvalEditar.length > 0 ? ocultarBotonEditarInputs(parEvalEditar): null;
        subordinadoEditar.length > 0 ? ocultarBotonEditarInputs(subordinadoEditar): null;



    }else if (estado_evaluacion == "supervisorEvaluacion"){//CUANDO ESTAMOS EN EVALUACIÓN POR PARTE DEL SUPERVISOR SE HACE ESTO
        //Los inputs
        console.log(inputs_autoeval)
        inputs_autoeval.length > 0 ? disableInputs(inputs_autoeval) : null;
        inputs_par.length > 0 ? disableInputs(inputs_par) : null;
        inputs_subordinado.length > 0 ? disableInputs(inputs_subordinado) : null;

        //Los botones para editar
        botonAutoEvaluacion.length > 0 ? ocultarBotonEditarInputs(botonAutoEvaluacion): null;
        parEvalEditar.length > 0 ? ocultarBotonEditarInputs(parEvalEditar): null;
        subordinadoEditar.length > 0 ? ocultarBotonEditarInputs(subordinadoEditar): null;

    }else if (estado_evaluacion == "parEvaluacion"){
        inputs_autoeval.length > 0 ? disableInputs(inputs_autoeval) : null;
        inputs_supervisor.length > 0 ? disableInputs(inputs_supervisor) : null;
        inputs_subordinado.length > 0 ? disableInputs(inputs_subordinado) : null;

        //Los botones para editar
        superviEvalEditar.length > 0 ? ocultarBotonEditarInputs(superviEvalEditar): null;
        botonAutoEvaluacion.length > 0 ? ocultarBotonEditarInputs(botonAutoEvaluacion): null;
        subordinadoEditar.length > 0 ? ocultarBotonEditarInputs(subordinadoEditar): null;
        bloquearResultado(span_autoeval)
        bloquearResultado(span_supervisor)
        bloquearResultado(span_subordinado)
        bloquearResultado(span_cumplimiento)
        bloquearResultadoLineas(span_desempeño)


    }else if (estado_evaluacion == "subordinadoEvaluacion"){
        inputs_autoeval.length > 0 ? disableInputs(inputs_autoeval) : null;
        inputs_supervisor.length > 0 ? disableInputs(inputs_supervisor) : null;
        inputs_par.length > 0 ? disableInputs(inputs_par) : null;

        //Los botones para editar
        superviEvalEditar.length > 0 ? ocultarBotonEditarInputs(superviEvalEditar): null;
        botonAutoEvaluacion.length > 0 ? ocultarBotonEditarInputs(botonAutoEvaluacion): null;
        parEvalEditar.length > 0 ? ocultarBotonEditarInputs(parEvalEditar): null;
        bloquearResultado(span_autoeval)
        bloquearResultado(span_supervisor)
        bloquearResultado(span_par)
        bloquearResultado(span_cumplimiento)
        bloquearResultadoLineas(span_desempeño)
    } 

    

    document.querySelectorAll('.custom-dropdown').forEach(function(dropdown) {

        const selected = dropdown.querySelector('.dropdown-selected');
        const options = dropdown.querySelector('.dropdown-options');
        const hiddenInput = dropdown.querySelector('input[type="hidden"]');
        const selectedText = selected.querySelector('span');

        selected.addEventListener('click', function() {
            dropdown.classList.toggle('open');
        });
        options.querySelectorAll('li').forEach(function(option) {
            option.addEventListener('click', function() {

                const value = this.getAttribute('data-value');
                const text = this.textContent.trim(); 

                selectedText.classList.remove('style-up', 'style-fp-minus', 'style-fp', 'style-fp-plus', 'style-o');

                if (text === 'UP') {
                    selectedText.classList.add('style-up');
                } else if (text === 'FP-') {
                    selectedText.classList.add('style-fp-minus');
                } else if (text === 'FP') {
                    selectedText.classList.add('style-fp');
                } else if (text === 'FP+') {
                    selectedText.classList.add('style-fp-plus');
                } else if (text === 'O') {
                    selectedText.classList.add('style-o');
                }

                selectedText.textContent = text;
                selected.classList.add('has-value');
                hiddenInput.value = value;
                hiddenInput.dispatchEvent(new Event('change'));
                dropdown.classList.remove('open');
            });
        });
    });
    window.addEventListener('click', function(e) {
        document.querySelectorAll('.custom-dropdown').forEach(function(dropdown) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    });

    const botonCambio = document.querySelectorAll('#editarStatus');


    botonCambio.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Busca el contenedor td más cercano y luego el dropdown dentro de él
            const contenedorTd = boton.closest('td');
            const dropdownFull = contenedorTd ? contenedorTd.querySelector('.dropdownFull') : null;
            const spanValor = contenedorTd ? contenedorTd.querySelector('span') : null;
            
            if (dropdownFull) {
                dropdownFull.classList.toggle('hidden');
            } else {
                console.log('No se encontró el dropdown');
            }
            
            if (spanValor) {
                spanValor.classList.toggle('hidden');
            } else {
                console.log('No se encontró el span');
            }
        });
    });





});


function recolectarDatosEvaluacion() {
    const datos = [];
    const filas = document.querySelectorAll('#tabla-HV tbody tr');
    const estado_evaluacion = document.getElementById('estado_evaluacion').value

    const valoresPorSigla = {
        "UP": 0,
        "FP-": 1,
        "FP": 2,
        "FP+": 3,
        "O": 4
    };
    function calcularCumplimiento(puntajeBruto) {
        if (puntajeBruto <= 0) return 0;
        if (puntajeBruto >= 2 && puntajeBruto <= 4) return 1;
        if (puntajeBruto >= 5 && puntajeBruto <= 6) return 2;
        if (puntajeBruto >= 7 && puntajeBruto <= 8) return 3;
        if (puntajeBruto >= 9) return 4;
        return 0; 
    }
    function obtenerSigla(cumplimientoFinal) {
        return Object.keys(valoresPorSigla).find(sigla => 
            valoresPorSigla[sigla] === cumplimientoFinal) || "UP";
    }

    let hayevaluacionesVacias = false;
    const competenciasVacias = [];


    const botonCambio = document.querySelectorAll('#editarStatus');


    botonCambio.forEach(boton => {
        boton.addEventListener('click', (e) => {
            // Busca el contenedor td más cercano y luego el dropdown dentro de él
            const contenedorTd = boton.closest('td');
            const dropdownFull = contenedorTd ? contenedorTd.querySelector('.dropdownFull') : null;
            const spanValor = contenedorTd ? contenedorTd.querySelector('span') : null;
            
            if (dropdownFull) {
                dropdownFull.classList.toggle('hidden');
            } else {
                console.log('No se encontró el dropdown');
            }
            
            if (spanValor) {
                spanValor.classList.toggle('hidden');
            } else {
                console.log('No se encontró el span');
            }
        });
    });
    let operacion_evaluacion = ""
    filas.forEach(fila => {
        const celdaCompetencia = fila.querySelector('td:first-child h4');
        const inputAutoEval = fila.querySelector('.autoeval');
        const supervisorEval= fila.querySelector('.supervisorEval');
        const parEval = fila.querySelector('.parEval');
        const subordinadoEval = fila.querySelector('.subordinadoEval');
        const cumplimientoInput = fila.querySelector('.cumplimiento');
        const desempeno = fila.querySelector('.desempeno');
        const peso = fila.querySelector('.peso')

        console.log(subordinadoEval)

        if (estado_evaluacion == "Autoevaluacion"){
            if (inputAutoEval && celdaCompetencia) {
                if (!inputAutoEval.value || inputAutoEval.value.trim() === '') {
                    hayevaluacionesVacias = true;
                    competenciasVacias.push(celdaCompetencia.textContent.trim());
                }
            }
            operacion_evaluacion = "Auto Evaluación"
        }else if(estado_evaluacion == "supervisorEvaluacion"){
            if (supervisorEval && celdaCompetencia) {
                if (!supervisorEval.value || supervisorEval.value.trim() === '') {
                    hayevaluacionesVacias = true;
                    competenciasVacias.push(celdaCompetencia.textContent.trim());
                }
            }
            operacion_evaluacion = "Evaluación como Supervisor"
        }else if(estado_evaluacion == "parEvaluacion"){
            if (parEval && celdaCompetencia) {
                if (!parEval.value || parEval.value.trim() === '') {
                    hayevaluacionesVacias = true;
                    competenciasVacias.push(celdaCompetencia.textContent.trim());
                }
            }
            operacion_evaluacion = "Evaluación como Par"
        }else if(estado_evaluacion == "subordinadoEvaluacion"){
            if (subordinadoEval && celdaCompetencia) {
                if (!subordinadoEval.value || subordinadoEval.value.trim() === '') {
                    hayevaluacionesVacias = true;
                    competenciasVacias.push(celdaCompetencia.textContent.trim());
                }
            }
            operacion_evaluacion = "Evaluación como Colaborador"
        }

        


        if (supervisorEval && parEval && subordinadoEval ) {
            console.log('aqui')
            const evaluaciones = [
                supervisorEval.value,
                parEval.value,
                subordinadoEval.value
            ];
            let puntajeBruto = 0;
            evaluaciones.forEach(sigla => {
                if (valoresPorSigla[sigla] !== undefined) {
                    puntajeBruto += valoresPorSigla[sigla];
                }
            });

            const cumplimientoFinal = calcularCumplimiento(puntajeBruto);
            cumplimientoInput.value = cumplimientoFinal;
            const desempenoSigla = obtenerSigla(cumplimientoFinal);
            desempeno.value= desempenoSigla

            if (celdaCompetencia && inputAutoEval) {
                const registroFila = {
                    
                    competencia: celdaCompetencia.textContent.trim(),
                    autoEvaluacion: inputAutoEval.value,
                    supervisorEvaluacion: supervisorEval ? supervisorEval.value : "",
                    parEvaluacion: parEval ? parEval.value : "",
                    subordinadoEvaluacion: subordinadoEval ? subordinadoEval.value : "",
                    cumplimiento : cumplimientoFinal ? cumplimientoFinal: "",
                    desempeno : desempeno.value ? desempeno.value: "",
                    peso : peso.value ? peso.value: ""
                };
                datos.push(registroFila);
            }



        } else if(supervisorEval){
            const evaluaciones = [
                supervisorEval.value,
            ];
            let puntajeBruto = 0;
            evaluaciones.forEach(sigla => {
                if (valoresPorSigla[sigla] !== undefined) {
                    puntajeBruto += valoresPorSigla[sigla];
                }
            });

            const cumplimientoFinal = puntajeBruto
            cumplimientoInput.value = cumplimientoFinal;
            const desempenoSigla = obtenerSigla(cumplimientoFinal);
            desempeno.value= desempenoSigla
            console.log(`sadasdasdas ${desempeno}`)

            if (celdaCompetencia && inputAutoEval) {
                const registroFila = {
                    
                    competencia: celdaCompetencia.textContent.trim(),
                    autoEvaluacion: inputAutoEval.value,
                    supervisorEvaluacion: supervisorEval ? supervisorEval.value : "",
                    parEvaluacion: parEval ? parEval.value : "",
                    subordinadoEvaluacion: subordinadoEval ? subordinadoEval.value : "",
                    cumplimiento : cumplimientoFinal ? cumplimientoFinal: "",
                    desempeno : desempeno.value ? desempeno.value: "",
                    peso : peso.value ? peso.value: ""
                };
                datos.push(registroFila);
            }

        }


    });

    if (hayevaluacionesVacias) {
        let mensaje = `Por favor, complete la ${operacion_evaluacion} para las siguientes competencias:\n\n`;
        competenciasVacias.forEach(competencia => {
            mensaje += `• ${competencia}\n`;
        });
        showAlertGrandes(mensaje, "error");
        return null; 
    }

    const cumplimientoArray = document.querySelectorAll('.cumplimiento')
    let cumplimientoTotal = 0;
    const totalinput= document.getElementById('total')
    cumplimientoArray.forEach(valor => {
        cumplimientoTotal=  parseInt(valor.value) + cumplimientoTotal;

    });
    totalinput.value= cumplimientoTotal

    console.log(cumplimientoTotal)

    return datos; 
}

function enviarDatosAlBackend(datosParaEnviar) {
    if (!datosParaEnviar || datosParaEnviar.length === 0) {
        return;
    }

    console.log("Enviando estos datos:", datosParaEnviar);
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    const bodyPayload = {
        ficha_del_dueño_del_indicador: ficha_del_dueño_del_indicador,
        data: datosParaEnviar
    };

    fetch('/app_crm/evaluacion', { 
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || ""
        },
        body: JSON.stringify(
            bodyPayload
        )
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK: " + res.status);
        return res.json();
    })
    .then(response => {
        console.log("Respuesta del servidor:", response);
        if (response.success) {
            window.location.reload();
        } else {
            alert("Error del servidor: " + response.message);
        }
    })
    .catch(err => {
        console.error("Error en el envío:", err);
        alert("Ocurrió un error crítico al enviar los datos. Revisa la consola.");
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const botonEnviar = document.querySelector('#enviar');
    if (botonEnviar) {

        botonEnviar.addEventListener('click', () => {
            const datosActuales = recolectarDatosEvaluacion();
            enviarDatosAlBackend(datosActuales);
        });
    }
    /*
    const autoeval_inputs = document.querySelectorAll('.autoeval');
    autoeval_inputs.forEach(input => {
        input.addEventListener("change", () => {
            console.log("Un valor de la tabla ha cambiado.");
            // Aquí podrías, por ejemplo, habilitar/deshabilitar el botón de enviar.
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
    iconContainer.className = category === 'error' 
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg flex-shrink-0 mt-1'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg flex-shrink-0 mt-1';
    
    const iconSpan = document.createElement('span');
    if (category === 'error') {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }
    
    // Contenido del mensaje (expandible)
    const messageContainer = document.createElement('div');
    messageContainer.className = 'flex flex-col flex-grow min-w-0';
    
    const titleDiv = document.createElement('div');
    const titleText = document.createElement('h4');
    titleText.className = 'text-white font-medium mb-2';
    titleText.textContent = category === 'error' ? 'Error:' : 'Proceso Exitoso:';
    
    const messageDiv = document.createElement('div');
    const messageText = document.createElement('p');
    messageText.className = 'text-white text-sm leading-relaxed whitespace-pre-line break-words';
    messageText.textContent = message;
    
    // Botón de cerrar (fijo en la esquina superior)
    const closeButton = document.createElement('button');
    closeButton.className = 'flex close-btn flex-shrink-0';
    
    const closeIconContainer = document.createElement('div');
    closeIconContainer.className = category === 'error'
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg hover:bg-white/10 transition-colors'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg hover:bg-white/10 transition-colors';
    
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
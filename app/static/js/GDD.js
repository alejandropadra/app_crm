document.getElementById("openModal").addEventListener("click", abrirModal);
/*Funcion para crear Alerts */
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




function enfocarInput(id) {
    const input = document.getElementById(id);
    if (!input) return;

    input.focus();

    input.classList.add(
        "ring-2", 
        "ring-blue-500", 
        "ring-offset-2", 
        "animate-pulse", 
        "bg-white"
    );

    setTimeout(() => {
        input.classList.remove(
            "ring-2", 
            "ring-blue-500", 
            "ring-offset-2", 
            "animate-pulse", 
            "bg-white"
        );
    }, 6000);
}


// Variable para controlar si el modal está en proceso de apertura o cierre
//let isModalTransitioning = false;
//let contador = 0;

function cerrarModal(equis) {
    //if (isModalTransitioning) return; 
    //isModalTransitioning = true;


    let modal = document.getElementById("modal-container");
    modal.classList.add("out");

    setTimeout(() => {
        modal.style.display = "none"; 
        modal.classList.remove("one", "out");
        
        const openModal = document.getElementById('openModal');
        openModal.disabled = false;
    }, 1000);
}
let numero_enviado =false;
function abrirModal() {
    try {

        const indicatorForm = document.getElementById("indicatorForm");
        if (indicatorForm) {
            indicatorForm.reset();
        }
        const tabla = document.getElementById('indicadorTable').rows.length;
        console.log(tabla)
        const openModal = document.getElementById('openModal');
        openModal.disabled = true;
        let modal = document.getElementById("modal-container");
        if (tabla >= 5){
            showAlert('No puedes Agregar mas de 3 Indicadores', 'error')
            return
        }
        modal.style.display = "block"; 
        modal.classList.add("one");

        const estatusVariable = document.getElementById('estatusProceso').value;
        const peso = document.getElementById("peso");
        const footerPesoText = document.getElementById("footerPeso").textContent.trim();
        const footerPesoInt = parseInt(footerPesoText, 10) || 0;

        if (tabla >=4){
            console.log('sa')
            let diferencia = 0
            diferencia=  80 - footerPesoInt
            peso.value= diferencia;
            peso.setAttribute("disabled", "disabled");
            numero_enviado =true
        }

        const nombreIndicadorField = document.getElementById("Indicador");
        nombreIndicadorField.disabled = false;

        const tendenciaField = document.getElementById("Tendencia");
        tendenciaField.disabled = false;

        const pesoField =  document.getElementById("peso")
        pesoField.disabled = false;

        const AfAnterior = document.getElementById('AFANTERIOR');
        AfAnterior.disabled = false;
        
        const Afppto = document.getElementById('AFPPTO');
        Afppto.disabled = false;

        document.getElementById("AFACTUAL").disabled = true;

        /*
        if (estatusVariable) {
            if (estatusVariable == 'Abriendo') {
                console.log('se deshabilitó el campo de AFACTUAL pq en teoria esta ABRIENDO el proceso de GDD')
                
            }else{
                console.log('se habilitó el campo de AFACTUAL pq en teoria esta CERRANDO el proceso de GDD')
            }
        }*/

        
        if (tabla >=4){
            peso.setAttribute("disabled", "disabled");
        }

        setTimeout(() => {
            isModalTransitioning = false;
            // openModal.disabled = false;
        }, 1000);
    } catch (error) {
        isModalTransitioning = false; 
        console.error("Error en abrirModal:", error);
    }
}

function AddRow(event) {
    event.preventDefault(); 
    const ficha_usuario = document.getElementById('ficha_usuario').value.trim();
    const tabla = document.getElementById('indicadorTable').rows.length;
    const footerPesoText = document.getElementById("footerPeso").textContent.trim();
    const footerPesoInt = parseInt(footerPesoText, 10) || 0;
    
    /*Constantes de los inputs del formualario */
    const indicador = document.getElementById("Indicador").value.trim();
    const peso = document.getElementById("peso").value.trim();
    const tendencia = document.getElementById("Tendencia").value.trim();
    const AFANTERIOR = document.getElementById("AFANTERIOR").value.trim();
    const AFPPTO = document.getElementById("AFPPTO").value.trim();
    const año_fiscal = document.getElementById('año_fiscal').value.trim();
    const desempeno = document.getElementById("desempeno")?.value.trim() || "N/A"; 

    if (!indicador || !peso || !tendencia || !AFPPTO) {
        showAlert('Todos los campos deben estar completos', 'error');
        enfocarInput('indicador')
        return;

    }


    if (parseInt(peso)>40 || parseInt(peso) <20 ){
        showAlert('El Peso Minimo aceptable es 20%, El maximo es 40% ', 'error')
        enfocarInput("peso");
        return;
    }

    if(tabla == 3){
        if (footerPesoInt + parseInt(peso) >70){
            console.log(peso)
            showAlert('El peso total te dará mayor que 80... lo cual no está permitido, coloca un peso menor que 30 ', 'error')
            enfocarInput("peso");

            return;
        }
    }


    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    fetch('/app_crm/insertarIndicador', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken 
        },
        body: JSON.stringify({
            nombre_indicador: indicador,
            peso: peso,
            tendencia: tendencia,
            real_af_antes: parseFloat(AFANTERIOR),
            objetivo_af_actual: parseFloat(AFPPTO),
            ficha_usuario: ficha_usuario,
            año_fiscal: parseInt(año_fiscal),
            ...(numero_enviado !== "" && { numero_enviado: numero_enviado })
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK");
        return res.json();
    })
    .then(data => {
        console.log("Respuesta:", data);
        if (data.success) {
            window.location.reload();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);

        window.location.reload();
    });
    

    console.log('su')
}



document.addEventListener("DOMContentLoaded", () => {
    const botonModal = document.getElementById("botonModal");
    assignBotonAction(botonModal, AddRow);
});


function assignBotonAction(button, actionFn) {
    const newButton = button.cloneNode(true);
    newButton.addEventListener("click", (event) => {
        actionFn(event);
    });
    button.replaceWith(newButton);
}



















function editRow(button) {
    try {
        event.preventDefault()

        const row = button.closest('tr');
        
        const tabla = document.getElementById('indicadorTable').rows.length;
        const indicador = row.cells[1].textContent.trim();
        const tendencia = row.cells[2].textContent.trim();
        const peso = row.cells[3].textContent.trim().replace('%', '');
        const realAnterior = row.cells[4].textContent.trim() === 'N/A' ? '' : row.cells[4].textContent.trim();
        const pptoAFactual = row.cells[5].textContent.trim() === 'N/A' ? '' : row.cells[5].textContent.trim();
        const realAactual = row.cells[6].textContent.trim() === 'N/A' ? '' : row.cells[6].textContent.trim();
        const aprobacion = row.cells[9].textContent.trim() === 'N/A' ? '': row.cells[9].textContent.trim();
        let edicion = false
        let afedicion = false
        const rawId = row.cells[12].textContent;
        const id = rawId.replace(/\D/g, "");  
        console.log("Enviando ID:", id);
        const estatusVariable = document.getElementById('estatusProceso').value;
        console.log(estatusVariable)

        if (estatusVariable === 'AFACTIVO') {
            edicion = true;
            afedicion = false
        }else{
            edicion = false;
            afedicion = true
        }
        console.log(edicion)
        let modal = document.getElementById("modal-container");
        modal.style.display = "block";
        modal.classList.add("one");
        

        const nombreIndicadorField = document.getElementById("Indicador");
        nombreIndicadorField.value = indicador;
        nombreIndicadorField.readOnly = edicion;

        const tendenciaField = document.getElementById("Tendencia");
        tendenciaField.value = tendencia;
        tendenciaField.readOnly = edicion;

        const pesoField =  document.getElementById("peso")
        pesoField.value = peso;
        pesoField.readOnly = true;

        const AfAnterior = document.getElementById('AFANTERIOR');
        if (realAnterior !=""){
            AfAnterior.value =realAnterior;
            AfAnterior.readOnly = edicion;
        }

        
        const Afppto = document.getElementById('AFPPTO');
        if (pptoAFactual !=""){
            Afppto.value =pptoAFactual;
            Afppto.readOnly = edicion;

        }
        
        const AfActual = document.getElementById('AFACTUAL');
        console.log(AfActual)
        if (realAactual !=""){
            AfActual.value =realAactual;
            AfActual.required = false;

            AfActual.placeholder = "ejemplo: 50";
        }

        AfActual.readOnly = afedicion;


        const rowId = row.getAttribute('id') || row.dataset.id || '';
        if (document.getElementById("editRowId")) {
            document.getElementById("editRowId").value = rowId;
        }

        const submitButton = document.getElementById('botonModal');
        if (submitButton) {
            submitButton.textContent = "Actualizar Indicador";
            assignBotonAction(submitButton, (event) => updateRow(event, id));
        }

        
    } catch (error) {
        console.error("Error en editRow:", error);
    }
}

function updateRow(event, id) {
    event.preventDefault();
    
    const ficha_usuario = document.getElementById('ficha_usuario').value.trim();
    let desempeno = "UP";


    const indicador = document.getElementById("Indicador").value.trim();
    const estatusVariable = document.getElementById('estatusProceso').value;
    const peso = document.getElementById("peso").value.trim();
    const tendencia = document.getElementById("Tendencia").value.trim();
    const AFANTERIOR = document.getElementById("AFANTERIOR").value.trim();
    const AFPPTO = document.getElementById("AFPPTO").value.trim();
    let AFACTUAL = document.getElementById("AFACTUAL")?.value.trim() || '';
    const año_fiscal = document.getElementById('año_fiscal').value.trim();
    
    const footerPesoText = document.getElementById("footerPeso").textContent.trim();
    const footerPesoInt = parseInt(footerPesoText, 10) || 0;
    if (peso > footerPesoInt){
        console.log(typeof(footerPesoInt))
        return;
    } 
    
    // Validate form
    if (estatusVariable =="AFACTIVO"){
        if (!AFACTUAL) {
            showAlert('Todos los campos deben estar completos', 'error');
            return;
        }
    }
    


    let pivote = 0;
    let resultadoCumplimiento = null;
    
    if (AFACTUAL !== '') {


        // Convertimos todos los valores a formato decimal para cálculos
        let pesoDecimal = parseFloat(peso);
        pesoDecimal= pesoDecimal/100;
        const topeMax = pesoDecimal * 1.25; 
        
        if (tendencia == "A") {
            resultadoCumplimiento = ((parseFloat(AFACTUAL) / parseFloat(AFPPTO)) * pesoDecimal);
            if (resultadoCumplimiento >= topeMax) {
                resultadoCumplimiento = topeMax;
            }
            
            pivote = parseFloat(AFACTUAL) / parseFloat(AFPPTO);
            if ( pivote === Infinity || pivote === -Infinity) {
                pivote = 0.7; 
            }

            // Evaluamos los rangos en decimal
            if (pivote <= 0.7999) {
                desempeno = "UP";
            } else if (pivote >= 0.8 && pivote <= 0.9999) {
                desempeno = "FP-";
            } else if (pivote >= 1.0 && pivote <= 1.0999) {
                desempeno = "FP";
            } else if (pivote >= 1.1 && pivote <= 1.1999) {
                desempeno = "FP+";
            } else if (pivote >= 1.2) {
                desempeno = "O";
            }
            
        } else if (tendencia == "D") {
            resultadoCumplimiento = ((parseFloat(AFPPTO) / parseFloat(AFACTUAL)) * pesoDecimal);
            console.log(resultadoCumplimiento)
            
            if (resultadoCumplimiento >= topeMax) {
                resultadoCumplimiento = topeMax;
            }
            pivote = parseFloat(AFPPTO) / parseFloat(AFACTUAL);
            if ( pivote === Infinity || pivote === -Infinity) {
                pivote = 1.2; 
            }
            console.log(pivote)

            if (pivote < 0.8) {
                desempeno = "UP";
            } else if (pivote >= 0.8 && pivote < 1.0) {
                desempeno = "FP-";
            } else if (pivote >= 1.0 && pivote < 1.1) {
                desempeno = "FP";
            } else if (pivote >= 1.1 && pivote < 1.2) {
                desempeno = "FP+";
            } else if (pivote >= 1.2) {
                desempeno = "O";
            }
        }


    }
    resultadoCumplimiento = Math.round(resultadoCumplimiento * 100);
    if (resultadoCumplimiento === 0){
        desempeno = 'NN'
    }
    // Get CSRF token
    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    console.log(id)
    fetch('/app_crm/editarIndicador', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken 
        },
        body: JSON.stringify({
            id: id,
            nombre_indicador: indicador,
            peso: parseFloat(peso),
            tendencia: tendencia,
            real_af_antes: parseFloat(AFANTERIOR),
            objetivo_af_actual: parseFloat(AFPPTO),
            real_af_actual: parseFloat(AFACTUAL),
            cumplimiento: resultadoCumplimiento,
            desempeno: desempeno,
            ficha_usuario: ficha_usuario,
            año_fiscal: parseInt(año_fiscal),
            pivote: pivote
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK");
        return res.json();
    })
    .then(data => {
        console.log("Respuesta:", data);
        if (data.success) {
            window.location.reload();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
    });
}


function deleteSelectedRows() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');
    const selectedData = [];
    if (selectedCheckboxes.length > 0){
        selectedCheckboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const cells = row.cells;
            const rawId = cells[12].textContent;
            const id = rawId.replace(/\D/g, "");  // si es numérico
            console.log("Enviando ID:", id);

            let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

            fetch('/app_crm/eliminarIndicador', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken 
                },
                body: JSON.stringify({ id: parseInt(id, 10) })
            })
        .then(res => {
            if (!res.ok) throw new Error("Respuesta del servidor no OK");
            return res.json();
        })
        .then(data => {
            console.log("Respuesta:", data);
            if (data.success) {
                window.location.reload()

            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => {
            console.error('Fetch error:', err);

        });    
            
        });

    }else{
        showAlert('Selecciona una fila que desees elimninar', 'error')
    }
    

    console.log(selectedData); 

}


























































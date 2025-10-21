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













document.addEventListener("DOMContentLoaded", async function () {


    const radioButtons = document.querySelectorAll('input[name="radio"]');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
    const modal = document.getElementById("popup-modal");
    const cancelButtons = document.querySelectorAll('#cancelButtons, .cancelButtons');
    const modalInstance = new Modal(modal);
    const seguro = document.getElementById('seguro');
    const rutaDestino = "/app_crm/configuracionGDD";




    const spanGDD = document.getElementById('spanGDD');

    let status_actual_gdd = null;

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
                status_actual_gdd = data.estado;

                
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
            const response = await fetch(`/app_crm/detalles_usuarios/${ficha_get}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({
                    accion: "actualizar",
                    estado: estadoAcambiar
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

    
    


    
    


});



























function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}


let colaboradores = [];
let subordinados = [];
let filteredColaboradores = [];
let filteredColaboradoresSubordinado = [];
let currentSelection = -1;
let currentSelectionSubordinado = -1;

// Función auxiliar para convertir a Title Case
function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        // Cargar datos de colaboradores principales
        const colaboradoresScript = document.getElementById('colaboradores-data');
        if (!colaboradoresScript) {
            console.error('#colaboradores-data no encontrado');
            return;
        }
        const colaboradoresData = colaboradoresScript.textContent || colaboradoresScript.innerText;
        colaboradores = JSON.parse(colaboradoresData);
        filteredColaboradores = [...colaboradores];

        // Cargar datos de subordinados
        const subordinadosScript = document.getElementById('subordinados-data');
        if (!subordinadosScript) {
            console.error('#subordinados-data no encontrado');
            return;
        }
        const subordinadosData = subordinadosScript.textContent || subordinadosScript.innerText;
        subordinados = JSON.parse(subordinadosData);
        filteredColaboradoresSubordinado = [...subordinados];
        console.log(filteredColaboradoresSubordinado)
        
    } catch (error) {
        console.error('Error al cargar colaboradores:', error);
        return;
    }

    // === BUSCADOR PRINCIPAL ===
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('dropdown');
    const dropdownContent = document.getElementById('dropdownContent');
    const noResults = document.getElementById('noResults');

    if (searchInput && dropdown && dropdownContent && noResults) {
        initSearchInput(searchInput, dropdown, dropdownContent, noResults, 'main');
    }

    // === BUSCADOR SUBORDINADO ===
    const searchInputSubordinado = document.getElementById('searchInputSubordinado');
    const dropdownSubordinado = document.getElementById('dropdownSubordinado');
    const dropdownContentSubordinado = document.getElementById('dropdownContentSubordinado');
    const noResultsSubordinado = document.getElementById('noResultsSubordinado');

    if (searchInputSubordinado && dropdownSubordinado && dropdownContentSubordinado && noResultsSubordinado) {
        initSearchInput(searchInputSubordinado, dropdownSubordinado, dropdownContentSubordinado, noResultsSubordinado, 'subordinado');
    }

    function initSearchInput(searchInput, dropdown, dropdownContent, noResults, type) {
        // Mostrar dropdown al hacer click en el input
        searchInput.addEventListener('click', function() {
            showDropdown(dropdown);
            if (type === 'main') {
                renderColaboradores(filteredColaboradores, dropdownContent, noResults, type);
            } else {
                renderColaboradores(filteredColaboradoresSubordinado, dropdownContent, noResults, type);
            }
        });

        // Filtrar mientras se escribe
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            filterColaboradores(searchTerm, type);
            if (type === 'main') {
                currentSelection = -1;
            } else {
                currentSelectionSubordinado = -1;
            }
        });

        // Navegación con teclado
        searchInput.addEventListener('keydown', function(e) {
            const items = dropdown.querySelectorAll('.colaborador-item');
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (type === 'main') {
                        currentSelection = Math.min(currentSelection + 1, items.length - 1);
                        updateSelection(items, currentSelection);
                    } else {
                        currentSelectionSubordinado = Math.min(currentSelectionSubordinado + 1, items.length - 1);
                        updateSelection(items, currentSelectionSubordinado);
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (type === 'main') {
                        currentSelection = Math.max(currentSelection - 1, -1);
                        updateSelection(items, currentSelection);
                    } else {
                        currentSelectionSubordinado = Math.max(currentSelectionSubordinado - 1, -1);
                        updateSelection(items, currentSelectionSubordinado);
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    const currentIdx = type === 'main' ? currentSelection : currentSelectionSubordinado;
                    const filteredData = type === 'main' ? filteredColaboradores : filteredColaboradoresSubordinado;
                    if (currentIdx >= 0 && items[currentIdx]) {
                        selectColaborador(filteredData[currentIdx], type);
                    }
                    break;
                case 'Escape':
                    hideDropdown(dropdown, type);
                    break;
            }
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                hideDropdown(dropdown, type);
            }
        });
    }

    function filterColaboradores(searchTerm, type) {
        let filtered;
        if (!searchTerm) {
            if (type === 'main') {
                filtered = [...colaboradores];
            } else {
                filtered = [...subordinados];
            }
        } else {
            if (type === 'main') {
                filtered = colaboradores.filter(colaborador => 
                    colaborador.ename.toLowerCase().includes(searchTerm) ||
                    colaborador.plstx.toLowerCase().includes(searchTerm) ||
                    colaborador.orgtx.toLowerCase().includes(searchTerm) ||
                    colaborador.pernr.includes(searchTerm)
                );
            } else {
                filtered = subordinados.filter(colaborador => 
                    colaborador.ename.toLowerCase().includes(searchTerm) ||
                    colaborador.plstx.toLowerCase().includes(searchTerm) ||
                    colaborador.orgtx.toLowerCase().includes(searchTerm) ||
                    colaborador.pernr.includes(searchTerm)
                );
            }
        }

        if (type === 'main') {
            filteredColaboradores = filtered;
            const dropdown = document.getElementById('dropdown');
            const dropdownContent = document.getElementById('dropdownContent');
            const noResults = document.getElementById('noResults');
            renderColaboradores(filteredColaboradores, dropdownContent, noResults, type);
        } else {
            filteredColaboradoresSubordinado = filtered;
            const dropdown = document.getElementById('dropdownSubordinado');
            const dropdownContent = document.getElementById('dropdownContentSubordinado');
            const noResults = document.getElementById('noResultsSubordinado');
            renderColaboradores(filteredColaboradoresSubordinado, dropdownContent, noResults, type);
        }
    }

    function renderColaboradores(colaboradoresToShow, dropdownContent, noResults, type) {
        dropdownContent.innerHTML = '';
        
        if (colaboradoresToShow.length === 0) {
            noResults.classList.remove('hidden');
            return;
        } else {
            noResults.classList.add('hidden');
        }

        colaboradoresToShow.forEach((colaborador, index) => {
            const item = document.createElement('div');
            item.className = 'colaborador-item px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0';
            item.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="font-medium text-gray-900 text-sm">${toTitleCase(colaborador.ename)}</div>
                    </div>
                    <div class="text-xs text-gray-400 ml-2">#${recortarFicha(colaborador.pernr)}</div>
                </div>
            `;
            
            item.addEventListener('click', function() {
                selectColaborador(colaborador, type);
            });
            
            dropdownContent.appendChild(item);
        });
    }

    function recortarFicha(ficha) {
        ficha = String(ficha).padStart(4, '0'); 
        const cuartoDesdeDerecha = ficha[ficha.length - 4];
        if (cuartoDesdeDerecha === '0') {
            return ficha.slice(-3);
        } else {
            return ficha.slice(-4); 
        }
    }

    function obtenerRutaFoto(fichaRecortada, callback) {
        const extensiones = ['.png', '.jpg', '.jpeg'];
        const baseRuta = '/app_crm/static/img/fotos_personal/';
        const notFoundRuta = '/app_crm/static/img/notfoundUser.png';
        let index = 0;

        function intentarCargarImagen() {
            if (index >= extensiones.length) {
                callback(notFoundRuta); 
                return;
            }

            const ruta = baseRuta + fichaRecortada + extensiones[index];
            const img = new Image();

            img.onload = function() {
                callback(ruta); 
            };

            img.onerror = function() {
                index++;
                intentarCargarImagen();
            };

            img.src = ruta;
        }

        intentarCargarImagen();
    }       

    function selectColaborador(colaborador, type) {
        const fichaRecortada = recortarFicha(colaborador.pernr);
        
        if (type === 'main') {
            // Buscador principal
            const searchInput = document.getElementById('searchInput');
            const selectedColaborador = document.getElementById('selectedColaborador');
            const selectedImage = document.getElementById('selectedImage');
            const selectedName = document.getElementById('selectedName');
            const dropdown = document.getElementById('dropdown');
            
            if (searchInput) searchInput.value = colaborador.ename;
            if (selectedColaborador) selectedColaborador.value = fichaRecortada;
            if (selectedName) selectedName.textContent = toTitleCase(colaborador.ename);
            
            obtenerRutaFoto(fichaRecortada, function(ruta) {
                if (selectedImage) {
                    selectedImage.src = ruta;
                }
            });
            
            hideDropdown(dropdown, type);
        } else {
            // Buscador subordinado
            const searchInputSubordinado = document.getElementById('searchInputSubordinado');
            const selectedColaboradorSubordinado = document.getElementById('selectedColaboradorSubordinado');
            const selectedImageSubordinado = document.getElementById('selectedImageSubordinado');
            const selectedNameSubordinado = document.getElementById('selectedNameSubordinado');
            const dropdownSubordinado = document.getElementById('dropdownSubordinado');
            
            if (searchInputSubordinado) searchInputSubordinado.value = colaborador.ename;
            if (selectedColaboradorSubordinado) selectedColaboradorSubordinado.value = fichaRecortada;
            if (selectedNameSubordinado) selectedNameSubordinado.textContent = toTitleCase(colaborador.ename);
            
            obtenerRutaFoto(fichaRecortada, function(ruta) {
                if (selectedImageSubordinado) {
                    selectedImageSubordinado.src = ruta;
                }
            });
            
            hideDropdown(dropdownSubordinado, type);
        }
        
        console.log('Colaborador seleccionado (' + type + '):', colaborador);
    }

    function showDropdown(dropdown) {
        dropdown.classList.remove('dropdown-closed');
        dropdown.classList.add('dropdown-open');
    }

    function hideDropdown(dropdown, type) {
        dropdown.classList.remove('dropdown-open');
        dropdown.classList.add('dropdown-closed');
        if (type === 'main') {
            currentSelection = -1;
        } else {
            currentSelectionSubordinado = -1;
        }
    }

    function updateSelection(items, currentSelectionValue) {
        items.forEach((item, index) => {
            if (index === currentSelectionValue) {
                item.classList.add('bg-blue-50');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('bg-blue-50');
            }
        });
    }











    const botonEnviar = document.getElementById("enviarEvaluadores");
    const formulario = document.getElementById("formEstablecerEvaluadores");

    if (botonEnviar){
            botonEnviar.addEventListener("click", function () {
            const colaboradorId = document.getElementById("selectedColaborador").value;
            const subordinadoId = document.getElementById("selectedColaboradorSubordinado").value 
            const ficha_get = document.getElementById("ficha_get").value

            let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
            fetch('/app_crm/establecer_evaluadores', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken 
                },
                body: JSON.stringify({
                    fichaUsuarioEvaluar: ficha_get,
                    idPar: colaboradorId,
                    idSubordinado : subordinadoId
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
        });
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

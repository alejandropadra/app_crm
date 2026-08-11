/* ============================================================
   GDD.js — Carga de Indicadores Funcionales
   ============================================================ */

/* ---------- Constantes de negocio ---------- */
const MAX_INDICADORES = 3;   // máximo de indicadores por usuario
const PESO_TOTAL      = 80;  // peso total que deben sumar
const PESO_MIN        = 20;  // peso mínimo por indicador
const PESO_MAX        = 40;  // peso máximo por indicador

let numero_enviado = false;

/* ---------- Helpers ---------- */

// Cuenta SOLO las filas del tbody (rows.length incluye thead y tfoot)
function contarIndicadores() {
    const tbody = document.querySelector('#indicadorTable tbody');
    return tbody ? tbody.rows.length : 0;
}

function getFooterPeso() {
    const el = document.getElementById("footerPeso");
    if (!el) return 0;
    return parseInt(el.textContent.trim(), 10) || 0;
}

function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : "";
}

/* ---------- Alertas ---------- */
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
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }

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

    const closeButton = document.createElement('button');
    closeButton.className = 'flex close-btn';

    const closeIconContainer = document.createElement('div');
    closeIconContainer.className = category === 'error'
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg';

    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'material-symbols-rounded';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

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

    const quitar = () => {
        alertContainer.style.opacity = '0';
        alertContainer.classList.add("animate-fade-out-right");
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    };

    closeButton.addEventListener('click', quitar);
    setTimeout(quitar, 5000);
}

/* ---------- Foco visual en un input ---------- */
function enfocarInput(id) {
    const input = document.getElementById(id);
    if (!input) return;

    input.focus();

    const clases = ["ring-2", "ring-blue-500", "ring-offset-2", "animate-pulse", "bg-white"];
    input.classList.add(...clases);

    setTimeout(() => {
        input.classList.remove(...clases);
    }, 6000);
}

/* ---------- Modal ---------- */
function cerrarModal() {
    const modal = document.getElementById("modal-container");
    modal.classList.add("out");

    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove("one", "out");

        const openModal = document.getElementById('openModal');
        if (openModal) openModal.disabled = false;
    }, 1000);
}

function abrirModal() {
    const openModal = document.getElementById('openModal');

    try {
        const n = contarIndicadores();

        // 1) Validar ANTES de deshabilitar el botón
        if (n >= MAX_INDICADORES) {
            showAlert(`No puedes agregar más de ${MAX_INDICADORES} indicadores`, 'error');
            return;
        }

        openModal.disabled = true;
        numero_enviado = false;

        const indicatorForm = document.getElementById("indicatorForm");
        if (indicatorForm) indicatorForm.reset();

        // 2) Limpiar readOnly/disabled que pudo haber dejado editRow()
        ["Indicador", "Tendencia", "peso", "AFANTERIOR", "AFPPTO", "AFACTUAL"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                el.readOnly = false;
                el.disabled = false;
            });

        // En alta, REAL AF actual no se captura
        document.getElementById("AFACTUAL").disabled = true;

        // 3) Restaurar el botón a modo "Guardar"
        const submitButton = document.getElementById('botonModal');
        if (submitButton) {
            submitButton.textContent = "Guardar";
            assignBotonAction(submitButton, AddRow);
        }

        // 4) Si es el ÚLTIMO indicador, el peso queda forzado
        if (n === MAX_INDICADORES - 1) {
            const peso = document.getElementById("peso");
            peso.value = PESO_TOTAL - getFooterPeso();
            peso.disabled = true;
            numero_enviado = true;
        }

        const modal = document.getElementById("modal-container");
        modal.style.display = "block";
        modal.classList.add("one");

    } catch (error) {
        console.error("Error en abrirModal:", error);
        if (openModal) openModal.disabled = false;
    }
}

/* ---------- Alta de indicador ---------- */
function AddRow(event) {
    event.preventDefault();

    const ficha_usuario = document.getElementById('ficha_usuario').value.trim();
    const indicador     = document.getElementById("Indicador").value.trim();
    const peso          = document.getElementById("peso").value.trim();
    const tendencia     = document.getElementById("Tendencia").value.trim();
    const AFANTERIOR    = document.getElementById("AFANTERIOR").value.trim();
    const AFPPTO        = document.getElementById("AFPPTO").value.trim();
    const año_fiscal    = document.getElementById('año_fiscal').value.trim();

    if (!indicador || !peso || !tendencia || !AFPPTO) {
        showAlert('Todos los campos deben estar completos', 'error');
        enfocarInput('Indicador');
        return;
    }

    const n            = contarIndicadores();
    const pesoInt      = parseInt(peso, 10);
    const footerPeso   = getFooterPeso();

    // Rango individual
    if (isNaN(pesoInt) || pesoInt < PESO_MIN || pesoInt > PESO_MAX) {
        showAlert(`El peso debe estar entre ${PESO_MIN}% y ${PESO_MAX}%`, 'error');
        enfocarInput("peso");
        return;
    }

    // Reserva para los indicadores que aún faltan por cargar
    const restantes      = MAX_INDICADORES - (n + 1);
    const reservaMinima  = restantes * PESO_MIN;

    if (footerPeso + pesoInt + reservaMinima > PESO_TOTAL) {
        const maximoPermitido = PESO_TOTAL - footerPeso - reservaMinima;
        showAlert(`Con ese peso no queda espacio para los indicadores restantes. Máximo permitido: ${maximoPermitido}%`, 'error');
        enfocarInput("peso");
        return;
    }

    fetch('/app_crm/insertarIndicador', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
        },
        body: JSON.stringify({
            nombre_indicador:   indicador,
            peso:               pesoInt,
            tendencia:          tendencia,
            real_af_antes:      parseFloat(AFANTERIOR) || 0,
            objetivo_af_actual: parseFloat(AFPPTO),
            ficha_usuario:      ficha_usuario,
            año_fiscal:         parseInt(año_fiscal, 10),
            numero_enviado:     numero_enviado
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK");
        return res.json();
    })
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            showAlert(data.message || 'No se pudo guardar el indicador', 'error');
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        showAlert('Error de conexión al guardar el indicador', 'error');
    });
}

/* ---------- Reasignación de handler del botón del modal ---------- */
function assignBotonAction(button, actionFn) {
    const newButton = button.cloneNode(true);
    newButton.addEventListener("click", (event) => actionFn(event));
    button.replaceWith(newButton);
}

/* ---------- Edición de indicador ---------- */
function editRow(button) {
    try {
        const row = button.closest('tr');

        const indicador     = row.cells[1].textContent.trim();
        const tendencia     = row.cells[2].textContent.trim();
        const peso          = row.cells[3].textContent.trim().replace('%', '');
        const realAnterior  = row.cells[4].textContent.trim() === 'N/A' ? '' : row.cells[4].textContent.trim();
        const pptoAFactual  = row.cells[5].textContent.trim() === 'N/A' ? '' : row.cells[5].textContent.trim();
        const realAactual   = row.cells[6].textContent.trim() === 'N/A' ? '' : row.cells[6].textContent.trim();

        const id = row.cells[12].textContent.replace(/\D/g, "");

        const estatusVariable = document.getElementById('estatusProceso').value.trim();

        // AFACTIVO = periodo de cierre: solo se edita REAL AF actual
        const esCierre  = estatusVariable === 'AFACTIVO';
        const edicion   = esCierre;    // bloquea los campos de apertura
        const afedicion = !esCierre;   // bloquea REAL AF actual

        const modal = document.getElementById("modal-container");
        modal.style.display = "block";
        modal.classList.add("one");

        const nombreIndicadorField = document.getElementById("Indicador");
        nombreIndicadorField.value    = indicador;
        nombreIndicadorField.readOnly = edicion;

        const tendenciaField = document.getElementById("Tendencia");
        tendenciaField.value    = tendencia;
        tendenciaField.disabled = edicion;

        const pesoField = document.getElementById("peso");
        pesoField.value    = peso;
        pesoField.readOnly = true;   // el peso nunca se edita
        pesoField.disabled = false;

        const AfAnterior = document.getElementById('AFANTERIOR');
        AfAnterior.value    = realAnterior;
        AfAnterior.readOnly = edicion;
        AfAnterior.disabled = false;

        const Afppto = document.getElementById('AFPPTO');
        Afppto.value    = pptoAFactual;
        Afppto.readOnly = edicion;
        Afppto.disabled = false;

        const AfActual = document.getElementById('AFACTUAL');
        AfActual.value       = realAactual;
        AfActual.readOnly    = afedicion;
        AfActual.disabled    = false;
        AfActual.placeholder = "ejemplo: 50";

        const submitButton = document.getElementById('botonModal');
        if (submitButton) {
            submitButton.textContent = "Actualizar Indicador";
            assignBotonAction(submitButton, (event) => updateRow(event, id));
        }

    } catch (error) {
        console.error("Error en editRow:", error);
    }
}

/* ---------- Actualización de indicador ---------- */
function updateRow(event, id) {
    event.preventDefault();

    const ficha_usuario   = document.getElementById('ficha_usuario').value.trim();
    const indicador       = document.getElementById("Indicador").value.trim();
    const estatusVariable = document.getElementById('estatusProceso').value.trim();
    const peso            = document.getElementById("peso").value.trim();
    const tendencia       = document.getElementById("Tendencia").value.trim();
    const AFANTERIOR      = document.getElementById("AFANTERIOR").value.trim();
    const AFPPTO          = document.getElementById("AFPPTO").value.trim();
    const AFACTUAL        = document.getElementById("AFACTUAL")?.value.trim() || '';
    const año_fiscal      = document.getElementById('año_fiscal').value.trim();

    if (estatusVariable === "AFACTIVO" && !AFACTUAL) {
        showAlert('Debes completar el REAL del AF actual', 'error');
        enfocarInput("AFACTUAL");
        return;
    }

    let desempeno = "UP";
    let pivote = 0;
    let resultadoCumplimiento = 0;

    if (AFACTUAL !== '') {
        const pesoDecimal = parseFloat(peso) / 100;
        const topeMax     = pesoDecimal * 1.25;

        if (tendencia === "A") {
            pivote = parseFloat(AFACTUAL) / parseFloat(AFPPTO);
            if (!isFinite(pivote)) pivote = 0.7;

            resultadoCumplimiento = Math.min(pivote * pesoDecimal, topeMax);

        } else if (tendencia === "D") {
            pivote = parseFloat(AFPPTO) / parseFloat(AFACTUAL);
            if (!isFinite(pivote)) pivote = 1.2;

            resultadoCumplimiento = Math.min(pivote * pesoDecimal, topeMax);
        }

        if (pivote < 0.8)       desempeno = "UP";
        else if (pivote < 1.0)  desempeno = "FP-";
        else if (pivote < 1.1)  desempeno = "FP";
        else if (pivote < 1.2)  desempeno = "FP+";
        else                    desempeno = "O";
    }

    resultadoCumplimiento = Math.round(resultadoCumplimiento * 100);
    if (resultadoCumplimiento === 0) desempeno = 'NN';

    fetch('/app_crm/editarIndicador', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken()
        },
        body: JSON.stringify({
            id:                 id,
            nombre_indicador:   indicador,
            peso:               parseFloat(peso),
            tendencia:          tendencia,
            real_af_antes:      parseFloat(AFANTERIOR) || 0,
            objetivo_af_actual: parseFloat(AFPPTO),
            real_af_actual:     AFACTUAL === '' ? null : parseFloat(AFACTUAL),
            cumplimiento:       resultadoCumplimiento,
            desempeno:          desempeno,
            ficha_usuario:      ficha_usuario,
            año_fiscal:         parseInt(año_fiscal, 10),
            pivote:             pivote
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Respuesta del servidor no OK");
        return res.json();
    })
    .then(data => {
        if (data.success) {
            window.location.reload();
        } else {
            showAlert(data.message || 'No se pudo actualizar el indicador', 'error');
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        showAlert('Error de conexión al actualizar el indicador', 'error');
    });
}

/* ---------- Eliminación ---------- */
function deleteSelectedRows() {
    const selectedCheckboxes = document.querySelectorAll('.row-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        showAlert('Selecciona una fila que desees eliminar', 'error');
        return;
    }

    const csrfToken = getCsrfToken();

    // Un solo reload al final, no uno por cada fila
    const peticiones = Array.from(selectedCheckboxes).map(checkbox => {
        const row = checkbox.closest('tr');
        const id  = row.cells[12].textContent.replace(/\D/g, "");

        return fetch('/app_crm/eliminarIndicador', {
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
        });
    });

    Promise.all(peticiones)
        .then(resultados => {
            const fallo = resultados.find(r => !r.success);
            if (fallo) {
                showAlert(fallo.message || 'No se pudieron eliminar todos los indicadores', 'error');
                return;
            }
            window.location.reload();
        })
        .catch(err => {
            console.error('Fetch error:', err);
            showAlert('Error de conexión al eliminar', 'error');
        });
}

/* ---------- Inicialización ---------- */
document.addEventListener("DOMContentLoaded", () => {
    const openModal = document.getElementById("openModal");
    if (openModal) openModal.addEventListener("click", abrirModal);

    const botonModal = document.getElementById("botonModal");
    if (botonModal) assignBotonAction(botonModal, AddRow);

    // Checkbox "seleccionar todo"
    const checkAll = document.getElementById("checkbox-all-search");
    if (checkAll) {
        checkAll.addEventListener("change", () => {
            document.querySelectorAll('.row-checkbox')
                .forEach(cb => { cb.checked = checkAll.checked; });
        });
    }
});
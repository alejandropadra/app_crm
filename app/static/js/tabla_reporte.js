
let DATOS          = [];
let datosFiltrados = [];
let paginaActual   = 0;
let porPagina      = 10;


async function cargarDatos(filial = null, nivel = null) {
    try {
        const params = new URLSearchParams();
        console.log("Cargando datos con filtros:", { filial, nivel });
        if (filial) params.set('filial', filial);
        if (nivel)  params.set('nivel', nivel);

        const url = `/app_crm/gdd/api/tabla-reporte${params.toString() ? '?' + params : ''}`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const json = await resp.json();
        DATOS = json.datos;

        const año_anteriorEls = document.querySelectorAll('.año_anterior');
        año_anteriorEls.forEach(el => el.textContent = DATOS[0]?.año_anterior || '');

        const año_actualEls = document.querySelectorAll('.año_actual');
        año_actualEls.forEach(el => el.textContent = DATOS[0]?.año_fiscal || '');

        DATOS.forEach(persona => {
            persona.indicadores.forEach(ind => {
                if (ind.real_af_antes === null)  ind.real_af_antes = null;
                if (ind.obj_af_actual === null)  ind.obj_af_actual = null;
                if (ind.real_af_actual === null) ind.real_af_actual = null;
            });
        });

        paginaActual = 0;
        aplicarPaginacion(DATOS);

    } catch (err) {
        console.error('Error cargando datos de la tabla:', err);
        document.getElementById('empty-msg').style.display = 'flex';
    }
}



function badgeDesemp(d) {
    const colores = {
        'UP':  '#fca5a5',   // red-300
        'FP-': '#fcd34d',   // yellow-300
        'FP':  '#cbd5e1',   // slate-300
        'FP+': '#86efac',   // green-300
        'O':   '#93c5fd',   // blue-300
    };
    const bg = colores[d] || '#e2e8f0';
    return `<span class="badge" style="background:${bg}; color:#333;">${d || 'NN'}</span>`;
}

function badgeComp(c) {
    if (!c) return `<span class="badge" style="background:#e2e8f0; color:#333;">—</span>`;
    const colores = {
        'UP':  '#fca5a5',
        'FP-': '#fcd34d',
        'FP':  '#cbd5e1',
        'FP+': '#86efac',
        'O':   '#93c5fd',
    };
    const bg = colores[c] || '#e2e8f0';
    return `<span class="badge" style="background:${bg}; color:#333;">${c}</span>`;
}

function clsCum(v) {
    if (v >= 70) return 'cum-alto';
    if (v >= 40) return 'cum-medio';
    return 'cum-bajo';
}

function animarNumero(el, destino, sufijo = '', duracion = 600) {
    const inicio = performance.now();
    function step(ts) {
        const prog = Math.min((ts - inicio) / duracion, 1);
        const ease  = 1 - Math.pow(1 - prog, 3);
        el.textContent = Math.round(destino * ease) + sufijo;
        if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fmtValor(v) {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'number') {
        return v % 1 === 0 ? v.toString() : v.toFixed(2).replace('.', ',');
    }
    return v;
}


function actualizarSummary(datos) {
    const total      = datos.length;
    const culminados = datos.filter(p => p.status === 'CULMINADO').length;
    const pendientes = datos.filter(p => p.status === 'NO CULMINADO').length;

    const promedioTotal = total > 0
        ? Math.round(datos.reduce((s, p) => s + parseFloat(p.valor_total), 0) / total)
        : 0;

    const elTotal    = document.getElementById('sum-total');
    const elCerrado  = document.getElementById('sum-cerrados');
    const elAbierto  = document.getElementById('sum-abiertos');
    const elPromedio = document.getElementById('sum-promedio');

    if (elTotal)    animarNumero(elTotal, total);
    if (elCerrado)  animarNumero(elCerrado, culminados);
    if (elAbierto)  animarNumero(elAbierto, pendientes);
    if (elPromedio) animarNumero(elPromedio, promedioTotal, '%');
}


/* ══════════════════════════════════════════
Render tabla
   ══════════════════════════════════════════ */

function renderTabla(datos) {
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    datos.forEach(persona => {
        const inds = persona.indicadores;
        const n    = inds.length || 1;
        
        if (inds.length === 0) {
            const tr = document.createElement('tr');
            tr.classList.add('grupo-inicio');
            tr.dataset.filial = persona.filial;
            tr.dataset.status = persona.status;
            tr.dataset.nombre = persona.nombre.toLowerCase();
            tr.innerHTML = `
                <td class="td-grupo">${persona.filial}</td>
                <td class="td-grupo">${persona.nivel}</td>
                <td class="td-grupo" style="text-align:left">${persona.nombre}</td>
                <td class="td-ind" colspan="8" style="text-align:center; color:#94a3b8;">Sin indicadores registrados</td>
                <td class="td-resumen" style="font-weight:600">${persona.valor_indicadores}</td>
                ${persona.competencias.map(c => `<td class="td-resumen">${badgeComp(c)}</td>`).join('')}
                <td class="td-resumen">${persona.valor_evaluacion}</td>
                <td class="td-resumen valor-total">${persona.valor_total}</td>
                <td class="td-resumen">${badgeDesemp(persona.valor_clasificacion)}</td>
                <td class="td-resumen">
                    <span class="badge ${persona.status === 'CULMINADO' ? 'b-cerrado' : 'b-abierto'}">${persona.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        inds.forEach((ind, i) => {
            const esFirst = i === 0;
            const tr = document.createElement('tr');
            if (esFirst) tr.classList.add('grupo-inicio');
            tr.dataset.filial = persona.filial;
            tr.dataset.status = persona.status;
            tr.dataset.nombre = persona.nombre.toLowerCase();

            const grupoHTML = esFirst ? `
                <td class="td-grupo" rowspan="${n}">${persona.filial}</td>
                <td class="td-grupo" rowspan="${n}">${persona.nivel}</td>
                <td class="td-grupo" rowspan="${n}" style="text-align:left">${persona.nombre}</td>
            ` : '';

            const indHTML = `
                <td class="td-ind">${ind.nombre}</td>
                <td>${ind.tendencia}</td>
                <td class="peso-cell">${ind.peso}%</td>
                <td>${fmtValor(ind.real_af_antes)}</td>
                <td>${fmtValor(ind.obj_af_actual)}</td>
                <td>${fmtValor(ind.real_af_actual)}</td>
                <td class="${clsCum(ind.cumplimiento)}">${ind.cumplimiento}%</td>
                <td>${badgeDesemp(ind.desempeno)}</td>
            `;

            const resHTML = esFirst ? `
                <td class="td-resumen" rowspan="${n}" style="font-weight:600">${persona.valor_indicadores}</td>
                ${persona.competencias.map(c => `<td class="td-resumen" rowspan="${n}">${badgeComp(c)}</td>`).join('')}
                <td class="td-resumen" rowspan="${n}">${persona.valor_evaluacion}</td>
                <td class="td-resumen valor-total" rowspan="${n}">${persona.valor_total}</td>
                <td class="td-resumen" rowspan="${n}">${badgeDesemp(persona.valor_clasificacion)}</td>
                <td class="td-resumen" rowspan="${n}">
                    <span class="badge ${persona.status === 'CULMINADO' ? 'b-cerrado' : 'b-abierto'}">${persona.status}</span>
                </td>
            ` : '';

            tr.innerHTML = grupoHTML + indHTML + resHTML;
            tbody.appendChild(tr);
        });
    });
}


function aplicarPaginacion(datos) {
    datosFiltrados = datos;

    const totalPaginas = Math.ceil(datosFiltrados.length / porPagina);

    // Ajustar si la página actual excede el total
    if (paginaActual >= totalPaginas) paginaActual = Math.max(0, totalPaginas - 1);

    const inicio = paginaActual * porPagina;
    const fin    = inicio + porPagina;
    const pagina = datosFiltrados.slice(inicio, fin);

    // Renderizar solo la página actual
    renderTabla(pagina);

    // Summary cards sobre TODOS los filtrados (no solo la página visible)
    actualizarSummary(datosFiltrados);

    // Actualizar controles de paginación
    renderPaginacion();

    // Empty state
    document.getElementById('empty-msg').style.display =
        datosFiltrados.length === 0 ? 'flex' : 'none';
}

function renderPaginacion() {
    const contenedor = document.getElementById('paginacion');
    if (!contenedor) return;

    const total       = datosFiltrados.length;
    const totalPag    = Math.ceil(total / porPagina);
    const inicio      = paginaActual * porPagina + 1;
    const fin         = Math.min((paginaActual + 1) * porPagina, total);

    // ── Info texto ──
    const countEl = document.getElementById('result-count');
    if (countEl) {
        if (total === 0) {
            countEl.innerHTML = `<strong>0</strong> participantes`;
        } else {
            countEl.innerHTML = `Mostrando <strong>${inicio}–${fin}</strong> de <strong>${total}</strong> participantes`;
        }
    }

    // Si solo hay 1 página o menos, ocultar paginación
    if (totalPag <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = '';

    // ── Botón anterior ──
    html += `<button class="pag-btn pag-nav ${paginaActual === 0 ? 'disabled' : ''}"
                    onclick="cambiarPagina(${paginaActual - 1})"
                    ${paginaActual === 0 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>`;

    // ── Páginas numéricas con ventana deslizante ──
    const maxVisible = 5;
    let rangoInicio = Math.max(0, paginaActual - Math.floor(maxVisible / 2));
    let rangoFin    = rangoInicio + maxVisible;

    if (rangoFin > totalPag) {
        rangoFin    = totalPag;
        rangoInicio = Math.max(0, rangoFin - maxVisible);
    }

    // Ellipsis al inicio
    if (rangoInicio > 0) {
        html += `<button class="pag-btn" onclick="cambiarPagina(0)">1</button>`;
        if (rangoInicio > 1) html += `<span class="pag-ellipsis">...</span>`;
    }

    // Páginas del rango
    for (let i = rangoInicio; i < rangoFin; i++) {
        const activa = i === paginaActual ? 'pag-activa' : '';
        html += `<button class="pag-btn ${activa}" onclick="cambiarPagina(${i})">${i + 1}</button>`;
    }

    // Ellipsis al final
    if (rangoFin < totalPag) {
        if (rangoFin < totalPag - 1) html += `<span class="pag-ellipsis">...</span>`;
        html += `<button class="pag-btn" onclick="cambiarPagina(${totalPag - 1})">${totalPag}</button>`;
    }

    // ── Botón siguiente ──
    html += `<button class="pag-btn pag-nav ${paginaActual === totalPag - 1 ? 'disabled' : ''}"
                    onclick="cambiarPagina(${paginaActual + 1})"
                    ${paginaActual === totalPag - 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>`;

    contenedor.innerHTML = html;
}


function cambiarPagina(n) {
    const totalPag = Math.ceil(datosFiltrados.length / porPagina);
    if (n < 0 || n >= totalPag) return;

    paginaActual = n;
    aplicarPaginacion(datosFiltrados);

    // Scroll suave al inicio de la tabla
    const tabla = document.getElementById('gdd-table');
    if (tabla) {
        tabla.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function cambiarPorPagina(valor) {
    porPagina    = parseInt(valor);
    paginaActual = 0;
    aplicarPaginacion(datosFiltrados);
}


/* ══════════════════════════════════════════
   Filtros
   ══════════════════════════════════════════ */

const filtros = { filial: '', status: '' };

function setFiltro(tipo, valor, label) {
    filtros[tipo] = valor;
    const labelId = tipo === 'filial' ? 'labelFilial' : 'labelStatus';
    document.getElementById(labelId).textContent = label;

    const idDropdown = tipo === 'filial' ? 'dropdownFilial' : 'dropdownStatus';
    document.getElementById(idDropdown).classList.add('hidden');
    filtrar();
}

function filtrar() {
    const fs = filtros.status;
    const fq = document.getElementById('f-search').value.toLowerCase().trim();

    const filtrados = DATOS.filter(p =>
        (!fs || p.status === fs) &&
        (!fq || p.nombre.toLowerCase().includes(fq))
    );

    paginaActual = 0;
    aplicarPaginacion(filtrados);
}

function limpiarFiltros() {
    filtros.filial = '';
    filtros.status = '';
    document.getElementById('dropdown-button-2').childNodes[0].textContent = 'Filtro por Filial';
    document.getElementById('labelStatus').textContent = 'Todos los estatus';
    document.getElementById('f-search').value = '';
    paginaActual = 0;
    cargarDatos();  
}
function exportarExcel() {
    const datos = datosFiltrados.length > 0 ? datosFiltrados : DATOS;

    // Aplanar: una fila por indicador
    const filas = [];
    datos.forEach(p => {
        if (p.indicadores.length === 0) {
            filas.push({
                'Filial': p.filial,
                'Nivel': p.nivel,
                'Participante': p.nombre,
                'Indicador': '',
                'Tendencia': '',
                'Peso': '',
                'Real AF Ant.': '',
                'Obj AF Act.': '',
                'Real AF Act.': '',
                'Cumplimiento': '',
                'Desempeño': '',
                'Valor Indic.': p.valor_indicadores,
                'Valor Eval.': p.valor_evaluacion,
                'Valor Total': p.valor_total,
                'Clasificación': p.valor_clasificacion || '',
                'Status': p.status,
            });
            return;
        }

        p.indicadores.forEach((ind, i) => {
            filas.push({
                'Filial':        i === 0 ? p.filial : '',
                'Nivel':         i === 0 ? p.nivel : '',
                'Participante':  i === 0 ? p.nombre : '',
                'Indicador':     ind.nombre,
                'Tendencia':     ind.tendencia,
                'Peso':          ind.peso + '%',
                'Real AF Ant.':  fmtValor(ind.real_af_antes),
                'Obj AF Act.':   fmtValor(ind.obj_af_actual),
                'Real AF Act.':  fmtValor(ind.real_af_actual),
                'Cumplimiento':  ind.cumplimiento + '%',
                'Desempeño':     ind.desempeno,
                'Valor Indic.':  i === 0 ? p.valor_indicadores : '',
                'Valor Eval.':   i === 0 ? p.valor_evaluacion : '',
                'Valor Total':   i === 0 ? p.valor_total : '',
                'Clasificación': i === 0 ? (p.valor_clasificacion || '') : '',
                'Status':        i === 0 ? p.status : '',
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte GDD');
    XLSX.writeFile(wb, 'Reporte_GDD.xlsx');
}


document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();

    document.querySelectorAll('.FilialComparar').forEach(btn => {
        btn.addEventListener('click', () => {
            const filialCode = btn.getAttribute('data-filial-button');

            if (filialCode === 'ALL') {
                filtros.filial = '';
                document.getElementById('dropdown-button-2').childNodes[0].textContent = 'Filtro por Filial';
                cargarDatos();  // sin filtro
            } else {
                filtros.filial = filialCode;
                const nombre = btn.querySelector('P')?.textContent?.trim() || filialCode;
                document.getElementById('dropdown-button-2').childNodes[0].textContent = nombre;
                cargarDatos(filialCode);  // ← pide al backend solo esa filial
            }

            // Cerrar el dropdown manualmente
            document.getElementById('dropdown-search-city').classList.add('hidden');

            paginaActual = 0;
        });
    });

    const searchInput = document.getElementById('f-search');
    let timer;
    searchInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(filtrar, 200);
    });




    // Drag-to-scroll horizontal
    const tableWrap = document.querySelector('.gdd-table-wrap');
    let isDown = false;
    let startX;
    let scrollLeft;

    tableWrap.addEventListener('mousedown', (e) => {
        // Ignorar si el click es en un elemento interactivo
        if (e.target.closest('button, a, input, select')) return;
        isDown = true;
        tableWrap.classList.add('grabbing');
        startX = e.pageX - tableWrap.offsetLeft;
        scrollLeft = tableWrap.scrollLeft;
    });

    tableWrap.addEventListener('mouseleave', () => {
        isDown = false;
        tableWrap.classList.remove('grabbing');
    });

    tableWrap.addEventListener('mouseup', () => {
        isDown = false;
        tableWrap.classList.remove('grabbing');
    });

    tableWrap.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tableWrap.offsetLeft;
        const walk = (x - startX) * 1.5; // multiplicador de velocidad
        tableWrap.scrollLeft = scrollLeft - walk;
    });
});
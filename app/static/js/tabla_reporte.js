let DATOS          = [];
let datosFiltrados = [];
let paginaActual   = 0;
let porPagina      = 10;


const FILIALES_MAP = {
    'CRM': 'CORIMON C.A.',
    'MGR': 'MONTANA GRÁFICA C.A.',
    'CRP': 'CORIMON PINTURAS C.A.',
    'CER': 'CERDEX C.A.',
    'EEE': 'ENVACA C.A.',
    'RES': 'RESIMON C.A.',
    'PPV': 'PURAS PINTURAS VENEZOLANAS C.A.',
    'TMO': 'TIENDAS MONTANA C.A.',
};


async function cargarDatos() {
    try {
        console.log("Cargando dataset completo desde el backend");
        const resp = await fetch('/app_crm/gdd/api/tabla-reporte');
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
        // Reaplicar filtros activos (si hay alguno) en vez de pintar todo directo
        filtrar();

    } catch (err) {
        console.error('Error cargando datos de la tabla:', err);
        document.getElementById('empty-msg').style.display = 'flex';
    }
}



function badgeDesemp(d) {
    const colores = {
        'UP':  '#fca5a5',
        'FP-': '#fcd34d',
        'FP':  '#cbd5e1',
        'FP+': '#86efac',
        'O':   '#93c5fd',
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

    if (paginaActual >= totalPaginas) paginaActual = Math.max(0, totalPaginas - 1);

    const inicio = paginaActual * porPagina;
    const fin    = inicio + porPagina;
    const pagina = datosFiltrados.slice(inicio, fin);

    renderTabla(pagina);
    actualizarSummary(datosFiltrados);
    renderPaginacion();

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

    const countEl = document.getElementById('result-count');
    if (countEl) {
        if (total === 0) {
            countEl.innerHTML = `<strong>0</strong> participantes`;
        } else {
            countEl.innerHTML = `Mostrando <strong>${inicio}–${fin}</strong> de <strong>${total}</strong> participantes`;
        }
    }

    if (totalPag <= 1) {
        contenedor.innerHTML = '';
        return;
    }

    let html = '';

    html += `<button class="pag-btn pag-nav ${paginaActual === 0 ? 'disabled' : ''}"
                    onclick="cambiarPagina(${paginaActual - 1})"
                    ${paginaActual === 0 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>`;

    const maxVisible = 5;
    let rangoInicio = Math.max(0, paginaActual - Math.floor(maxVisible / 2));
    let rangoFin    = rangoInicio + maxVisible;

    if (rangoFin > totalPag) {
        rangoFin    = totalPag;
        rangoInicio = Math.max(0, rangoFin - maxVisible);
    }

    if (rangoInicio > 0) {
        html += `<button class="pag-btn" onclick="cambiarPagina(0)">1</button>`;
        if (rangoInicio > 1) html += `<span class="pag-ellipsis">...</span>`;
    }

    for (let i = rangoInicio; i < rangoFin; i++) {
        const activa = i === paginaActual ? 'pag-activa' : '';
        html += `<button class="pag-btn ${activa}" onclick="cambiarPagina(${i})">${i + 1}</button>`;
    }

    if (rangoFin < totalPag) {
        if (rangoFin < totalPag - 1) html += `<span class="pag-ellipsis">...</span>`;
        html += `<button class="pag-btn" onclick="cambiarPagina(${totalPag - 1})">${totalPag}</button>`;
    }

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
    Filtros (TODOS client-side)
   ══════════════════════════════════════════ */

const filtros = { filial: '', status: '', clasif: '' };

const COLORES_CLASIF = {
    'O':   '!bg-blue-300',
    'FP+': '!bg-green-300',
    'FP':  '!bg-slate-300',
    'FP-': '!bg-yellow-300',
    'UP':  '!bg-red-300',
};

const COLORES_STATUS = {
    'CULMINADO':    '!bg-green-300',
    'NO CULMINADO': '!bg-yellow-300',
};
function setFiltro(tipo, valor, label) {
    filtros[tipo] = valor;
    
    const idsPorTipo = {
        'filial': { label: 'labelFilial',  dropdown: 'dropdownFilial' },
        'status': { label: 'labelStatus',  dropdown: 'dropdownStatus' },
        'clasif': { label: 'labelClasif',  dropdown: 'dropdownClasif' },
    };
    
    const coloresPorTipo = {
        'clasif': COLORES_CLASIF,
        'status': COLORES_STATUS,
    };
    
    const ids = idsPorTipo[tipo];
    if (ids) {
        const el = document.getElementById(ids.label);
        if (el) {
            const mapaColores = coloresPorTipo[tipo];
            
            // Si este tipo usa badges Y hay un valor seleccionado → inyectar badge
            if (mapaColores && valor) {
                const colorClass = mapaColores[valor] || '!bg-gray-300';
                el.innerHTML = `<span class="p-[4px_8px] rounded-xl font-bold text-[#333] ${colorClass}">${label}</span>`;
            } else {
                // Resto de casos (sin badge o valor vacío) → texto plano
                el.textContent = label;
            }
        }
        document.getElementById(ids.dropdown).classList.add('hidden');
    }
    
    filtrar();
}
function filtrar() {
    const fs = filtros.status;
    const ff = filtros.filial;
    const fc = filtros.clasif;
    const fq = document.getElementById('f-search').value.toLowerCase().trim();


    const filialCompleta = ff ? FILIALES_MAP[ff] : null;

    const filtrados = DATOS.filter(p =>
        (!filialCompleta || p.filial === filialCompleta) &&
        (!fs || p.status === fs) &&
        (!fc || p.valor_clasificacion === fc) &&
        (!fq || p.nombre.toLowerCase().includes(fq))
    );

    paginaActual = 0;
    aplicarPaginacion(filtrados);
}

function limpiarFiltros() {
    filtros.filial = '';
    filtros.status = '';
    filtros.clasif = '';
    document.getElementById('dropdown-button-2').childNodes[0].textContent = 'Filtro por Filial';
    document.getElementById('labelStatus').textContent = 'Todos los estatus';
    document.getElementById('labelClasif').textContent = 'Toda clasificación';
    document.getElementById('f-search').value = '';
    paginaActual = 0;
    filtrar();
}



function exportarExcel() {
    const datos = datosFiltrados.length > 0 ? datosFiltrados : DATOS;

    const getComps = (p) => ({
        'Demostración Valores':      p.competencias?.[0] || '',
        'Foco en Resultados':        p.competencias?.[1] || '',
        'Influencia Organizacional': p.competencias?.[2] || '',
        'Liderazgo':                 p.competencias?.[3] || '',
        'Desarrollo Equipo':         p.competencias?.[4] || '',
    });

    const añoAnterior = DATOS[0]?.año_anterior || '';
    const añoActual   = DATOS[0]?.año_fiscal   || '';

    const filas  = [];
    const merges = [];
    let rowIndex = 2; // header ocupa filas 0 y 1

    datos.forEach(p => {
        const n        = p.indicadores.length || 1;
        const startRow = rowIndex;
        const endRow   = rowIndex + n - 1;

        if (p.indicadores.length === 0) {
            filas.push({
                'Filial': p.filial, 'Nivel': p.nivel, 'Participante': p.nombre,
                'Indicador': '', 'Tendencia': '', 'Peso': '',
                'Real_anterior': '', 'Ppto_actual': '', 'Real_actual': '',
                'Cumplimiento': '', 'Desempeño': '',
                'Valor Indic.': p.valor_indicadores,
                ...getComps(p),
                'Valor Eval.': p.valor_evaluacion,
                'Valor Total': p.valor_total,
                'Clasificación': p.valor_clasificacion || '',
                'Status': p.status,
            });
        } else {
            p.indicadores.forEach((ind, i) => {
                filas.push({
                    'Filial':        p.filial,
                    'Nivel':         p.nivel,
                    'Participante':  p.nombre,
                    'Indicador':     ind.nombre,
                    'Tendencia':     ind.tendencia,
                    'Peso':          ind.peso + '%',
                    'Real_anterior': fmtValor(ind.real_af_antes),
                    'Ppto_actual':   fmtValor(ind.obj_af_actual),
                    'Real_actual':   fmtValor(ind.real_af_actual),
                    'Cumplimiento':  ind.cumplimiento + '%',
                    'Desempeño':     ind.desempeno,
                    'Valor Indic.':  p.valor_indicadores,
                    ...getComps(p),
                    'Valor Eval.':   p.valor_evaluacion,
                    'Valor Total':   p.valor_total,
                    'Clasificación': p.valor_clasificacion || '',
                    'Status':        p.status,
                });
            });
        }

        if (n > 1) {
            const colsGrupo = [0, 1, 2, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
            colsGrupo.forEach(col => {
                merges.push({ s: { r: startRow, c: col }, e: { r: endRow, c: col } });
            });
        }

        rowIndex += n;
    });

    // ═══════ HEADER PERSONALIZADO (2 filas) ═══════
    const headerRow1 = [
        'FILIAL', 'NIVEL', 'PARTICIPANTE',
        'INDICADORES', '', '', '', '', '', '', '',
        'VALOR\nINDIC.',
        'DEMOSTRACIÓN\nVALORES', 'FOCO EN\nRESULTADOS', 'INFLUENCIA\nORGANIZACIONAL', 'LIDERAZGO', 'DESARROLLO\nEQUIPO',
        'VALOR\nEVAL.', 'VALOR\nTOTAL', 'CLASIF.', 'STATUS'
    ];

    const headerRow2 = [
        '', '', '',
        'INDICADOR', 'TENDENCIA', 'PESO',
        `REAL ${añoAnterior}`, `PPTO/OBJ ${añoActual}`, `REAL ${añoActual}`,
        'CUMPLIMIENTO', 'DESEMPEÑO',
        '', '', '', '', '', '', '', '', '', ''
    ];

    const dataRows = filas.map(row => Object.values(row));
    const aoa = [headerRow1, headerRow2, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // ═══════ MERGES DEL HEADER ═══════
    merges.push({ s: { r: 0, c: 3 }, e: { r: 0, c: 10 } });
    [0, 1, 2, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].forEach(col => {
        merges.push({ s: { r: 0, c: col }, e: { r: 1, c: col } });
    });

    ws['!merges'] = merges;

    // ═══════ ESTILOS ═══════
    const COLOR_OSCURO = '1E2A5C';
    const COLOR_MEDIO  = '2E4A8C';
    const COLOR_CLARO  = '4A6CB0';

    const styleHeader = (color) => ({
        font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10 },
        fill: { fgColor: { rgb: color } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top:    { style: 'thin', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
            left:   { style: 'thin', color: { rgb: 'FFFFFF' } },
            right:  { style: 'thin', color: { rgb: 'FFFFFF' } },
        },
    });

    const styleData = {
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top:    { style: 'thin', color: { rgb: 'D1D5DB' } },
            bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
            left:   { style: 'thin', color: { rgb: 'D1D5DB' } },
            right:  { style: 'thin', color: { rgb: 'D1D5DB' } },
        },
    };

    const colorPorColumna = {
        0: COLOR_OSCURO, 1: COLOR_OSCURO, 2: COLOR_OSCURO,
        3: COLOR_OSCURO, 4: COLOR_OSCURO, 5: COLOR_OSCURO, 6: COLOR_OSCURO,
        7: COLOR_OSCURO, 8: COLOR_OSCURO, 9: COLOR_OSCURO, 10: COLOR_OSCURO,
        11: COLOR_OSCURO,
        12: COLOR_MEDIO, 13: COLOR_MEDIO, 14: COLOR_MEDIO,
        15: COLOR_MEDIO, 16: COLOR_MEDIO,
        17: COLOR_OSCURO, 18: COLOR_OSCURO, 19: COLOR_OSCURO, 20: COLOR_OSCURO,
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!ws[cellRef]) ws[cellRef] = { t: 's', v: '' };

            if (R === 0) {
                ws[cellRef].s = styleHeader(colorPorColumna[C] || COLOR_OSCURO);
            } else if (R === 1) {
                ws[cellRef].s = (C >= 3 && C <= 10)
                    ? styleHeader(COLOR_CLARO)
                    : styleHeader(colorPorColumna[C] || COLOR_OSCURO);
            } else {
                ws[cellRef].s = styleData;
            }
        }
    }

    // ═══════ AUTOFILTER en la fila 2 (sub-header con nombres operativos) ═══════
    const totalRows = filas.length + 2; // +2 por las 2 filas de header
    const ultimaCol = XLSX.utils.encode_col(20); // columna U (índice 20)
    ws['!autofilter'] = { ref: `A2:${ultimaCol}${totalRows}` };

    ws['!cols'] = [
        { wch: 14 }, { wch: 8 },  { wch: 24 },
        { wch: 28 }, { wch: 10 }, { wch: 8 },
        { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
        { wch: 12 },
        { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 16 },
        { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
    ];

    ws['!rows'] = [
        { hpt: 32 },
        { hpt: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte GDD');

    const hoy = new Date();
    const fecha = `${String(hoy.getDate()).padStart(2, '0')}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;
    XLSX.writeFile(wb, `Reporte_GDD_${fecha}.xlsx`);
}

async function sincronizarResultados() {
    const btn     = document.getElementById('btn-sincronizar');
    const texto   = document.getElementById('text-sincronizar');
    const textoOg = texto.textContent;
    
    btn.disabled = true;
    btn.classList.add('loading');
    texto.textContent = 'Actualizando...';
    
    try {
        const resp = await fetch('/app_crm/gdd/api/sincronizar-tabla', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || ''
            }
        });
        const json = await resp.json();
        
        if (!resp.ok || !json.success) {
            throw new Error(json.error || json.mensaje || 'Error desconocido');
        }
        
        const r = json.resumen;

        showAlertGrandes(`Sincronización completada
            - Culminados: ${r.culminados}
            - Parciales: ${r.parciales}
            - Vacíos: ${r.vacios}
            - Errores: ${r.errores}

            Total procesados: ${r.total_procesados}`, 'success');
        
        // cargarDatos() ya reaplica filtros activos al final
        await cargarDatos();
    } catch (err) {
        console.error('Error sincronizando:', err);
        showAlertGrandes(`Error al sincronizar: ${err.message}`, 'error');  
    } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
        texto.textContent = textoOg;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();

    document.querySelectorAll('.FilialComparar').forEach(btn => {
        btn.addEventListener('click', () => {
            const filialCode = btn.getAttribute('data-filial-button');

            if (filialCode === 'ALL') {
                filtros.filial = '';
                document.getElementById('dropdown-button-2').childNodes[0].textContent = 'Filtro por Filial';
            } else {
                filtros.filial = filialCode;
                const nombre = btn.querySelector('P')?.textContent?.trim() || filialCode;
                document.getElementById('dropdown-button-2').childNodes[0].textContent = nombre;
            }

            document.getElementById('dropdown-search-city').classList.add('hidden');

            paginaActual = 0;
            filtrar();  // ⚡ instantáneo, client-side (antes llamaba cargarDatos con backend)
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
        const walk = (x - startX) * 1.5;
        tableWrap.scrollLeft = scrollLeft - walk;
    });


});



function showAlertGrandes(message, category = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'fixed top-5 z-[100000] animate-fade-in-up left-[35%] transform -translate-x-1/2';
    
    const alertWrapper = document.createElement('div');
    alertWrapper.className = 'flex flex-col gap-2 w-auto max-w-md sm:max-w-lg text-[10px] sm:text-xs';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'error-alert cursor-default flex items-start w-full min-h-12 sm:min-h-14 rounded-lg bg-azul-dark px-[10px] py-3';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex gap-3 items-start justify-between w-full';
    
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
        alertContainer.classList.add("animate-fade-out-right");
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    });
    
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
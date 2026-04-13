

let DATOS = [];   



async function cargarDatos(filial = null, nivel = null) {
    try {
        // Construir query string
        const params = new URLSearchParams();
        if (filial) params.set('filial', filial);
        if (nivel)  params.set('nivel', nivel);

        const url = `/app_crm/gdd/api/tabla-reporte${params.toString() ? '?' + params : ''}`;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        const json = await resp.json();
        DATOS = json.datos;

        // Formatear campos numéricos que vienen como null desde el backend
        DATOS.forEach(persona => {
            persona.indicadores.forEach(ind => {
                // Convertir nulls a guiones para display
                if (ind.real_af_antes === null)  ind.real_af_antes = null;
                if (ind.obj_af_actual === null)  ind.obj_af_actual = null;
                if (ind.real_af_actual === null) ind.real_af_actual = null;
            });
        });

        // Render inicial con todos los datos
        renderTabla(DATOS);
        document.getElementById('empty-msg').style.display =
            DATOS.length === 0 ? 'flex' : 'none';

    } catch (err) {
        console.error('Error cargando datos de la tabla:', err);
        document.getElementById('empty-msg').style.display = 'flex';
    }
}


/* ══════════════════════════════════════════
   Helpers (sin cambios)
   ══════════════════════════════════════════ */

function badgeDesemp(d) {
    const map = { 'FP+': 'b-fpp', 'FP': 'b-fp', 'FP-': 'b-fpm', 'O': 'b-o', 'UP': 'b-up' };
    return `<span class="badge ${map[d] || 'b-nn'}">${d || 'NN'}</span>`;
}

function badgeComp(c) {
    if (!c) return `<span class="badge b-nn">—</span>`;
    const map = { 'FP+': 'b-fpp', 'FP': 'b-fp', 'FP-': 'b-fpm', 'O': 'b-o', 'UP': 'b-up' };
    return `<span class="badge ${map[c] || 'b-nn'}">${c}</span>`;
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

/**
 * Formatea un valor numérico para display en la tabla.
 * null → '—', número → formateado con coma decimal (estilo venezolano)
 */
function fmtValor(v) {
    if (v === null || v === undefined || v === '') return '—';
    if (typeof v === 'number') {
        return v % 1 === 0 ? v.toString() : v.toFixed(2).replace('.', ',');
    }
    return v;
}


/* ══════════════════════════════════════════
   Summary cards (sin cambios)
   ══════════════════════════════════════════ */

function actualizarSummary(datos) {
    const total    = datos.length;
    const cerrados = datos.filter(p => p.status === 'CERRADO').length;
    const abiertos = datos.filter(p => p.status === 'ABIERTO').length;

    const promedioTotal = total > 0
        ? Math.round(datos.reduce((s, p) => s + parseFloat(p.valor_total), 0) / total)
        : 0;

    const elTotal    = document.getElementById('sum-total');
    const elCerrado  = document.getElementById('sum-cerrados');
    const elAbierto  = document.getElementById('sum-abiertos');
    const elPromedio = document.getElementById('sum-promedio');

    if (elTotal)    animarNumero(elTotal, total);
    if (elCerrado)  animarNumero(elCerrado, cerrados);
    if (elAbierto)  animarNumero(elAbierto, abiertos);
    if (elPromedio) animarNumero(elPromedio, promedioTotal, '%');
}


/* ══════════════════════════════════════════
   Render tabla (con rowspan real)
   ══════════════════════════════════════════ */

function renderTabla(datos) {
    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';

    datos.forEach(persona => {
        const inds = persona.indicadores;
        const n    = inds.length || 1;  // mínimo 1 fila aunque no tenga indicadores

        if (inds.length === 0) {
            // Persona sin indicadores: una fila con datos de grupo + resumen, indicadores vacíos
            const tr = document.createElement('tr');
            tr.classList.add('grupo-inicio');
            tr.dataset.area   = persona.area;
            tr.dataset.status = persona.status;
            tr.dataset.nombre = persona.nombre.toLowerCase();
            tr.innerHTML = `
                <td class="td-grupo">${persona.area}</td>
                <td class="td-grupo">${persona.nivel}</td>
                <td class="td-grupo" style="text-align:left">${persona.nombre}</td>
                <td class="td-ind" colspan="8" style="text-align:center; color:#94a3b8;">Sin indicadores registrados</td>
                <td class="td-resumen" style="font-weight:600">${persona.valor_indicadores}</td>
                ${persona.competencias.map(c => `<td class="td-resumen">${badgeComp(c)}</td>`).join('')}
                <td class="td-resumen">${persona.valor_evaluacion}</td>
                <td class="td-resumen valor-total">${persona.valor_total}</td>
                <td class="td-resumen">
                    <span class="badge ${persona.status === 'CERRADO' ? 'b-cerrado' : 'b-abierto'}">${persona.status}</span>
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        inds.forEach((ind, i) => {
            const esFirst = i === 0;
            const tr = document.createElement('tr');
            if (esFirst) tr.classList.add('grupo-inicio');
            tr.dataset.area   = persona.area;
            tr.dataset.status = persona.status;
            tr.dataset.nombre = persona.nombre.toLowerCase();

            const grupoHTML = esFirst ? `
                <td class="td-grupo" rowspan="${n}">${persona.area}</td>
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
                <td class="td-resumen" rowspan="${n}">
                    <span class="badge ${persona.status === 'CERRADO' ? 'b-cerrado' : 'b-abierto'}">${persona.status}</span>
                </td>
            ` : '';

            tr.innerHTML = grupoHTML + indHTML + resHTML;
            tbody.appendChild(tr);
        });
    });

    const countEl = document.getElementById('result-count');
    if (countEl) {
        countEl.innerHTML = `Mostrando <strong>${datos.length}</strong> de <strong>${DATOS.length}</strong> participantes`;
    }

    actualizarSummary(datos);
}


/* ══════════════════════════════════════════
   Filtros (client-side sobre DATOS ya cargados)
   ══════════════════════════════════════════ */

const filtros = { area: '', status: '' };

function setFiltro(tipo, valor, label) {
    filtros[tipo] = valor;
    const labelId = tipo === 'area' ? 'labelArea' : 'labelStatus';
    document.getElementById(labelId).textContent = label;

    const idDropdown = tipo === 'area' ? 'dropdownArea' : 'dropdownStatus';
    document.getElementById(idDropdown).classList.add('hidden');
    filtrar();
}

function filtrar() {
    const fa = filtros.area;
    const fs = filtros.status;
    const fq = document.getElementById('f-search').value.toLowerCase().trim();

    const filtrados = DATOS.filter(p =>
        (!fa || p.area   === fa) &&
        (!fs || p.status === fs) &&
        (!fq || p.nombre.toLowerCase().includes(fq))
    );

    renderTabla(filtrados);
    document.getElementById('empty-msg').style.display =
        filtrados.length === 0 ? 'flex' : 'none';
}

function limpiarFiltros() {
    filtros.area   = '';
    filtros.status = '';
    document.getElementById('labelArea').textContent   = 'Todas las áreas';
    document.getElementById('labelStatus').textContent = 'Todos los estatus';
    document.getElementById('f-search').value = '';
    filtrar();
}

function exportarExcel() {
    const tabla   = document.getElementById('gdd-table').outerHTML;
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html><head><meta charset="UTF-8">
        <style>
            table { border-collapse: collapse; font-family: Calibri, sans-serif; }
            td, th { border: 1px solid #ccc; padding: 6px 10px; font-size: 12px; }
            th { background: #2E75B6; color: #fff; }
        </style>
        </head><body>${tabla}</body></html>
    `);
    ventana.document.close();
    ventana.focus();
}


/* ══════════════════════════════════════════
   Init
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos desde el backend (reemplaza el array hardcodeado)
    cargarDatos();

    // Búsqueda en tiempo real con debounce
    const searchInput = document.getElementById('f-search');
    let timer;
    searchInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(filtrar, 200);
    });
});
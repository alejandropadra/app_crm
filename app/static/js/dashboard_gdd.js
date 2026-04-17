document.addEventListener('DOMContentLoaded', function () {

    const perfData = JSON.parse(
        document.getElementById('distribucion_performance').textContent
    );
    GraficoPerformance.render(perfData);

    const empresasData = JSON.parse(
        document.getElementById('promedios_empresas').textContent
    );
    const meta = JSON.parse(
        document.getElementById('meta_performance').textContent
    );
    GraficoEmpresas.render(empresasData, meta);

    const promedioGlobal = JSON.parse(
        document.getElementById('promedio_global').textContent
    );
    GraficoGauge.render(promedioGlobal);


    const promedioNivelFilial = JSON.parse(
        document.getElementById('promedio_nivel_filial').textContent
    );
    GraficoHeatmap.render(promedioNivelFilial);

    const elAnterior = document.getElementById('valor-anterior');
    animarNumero(elAnterior, { duracion: 2500 });

    
});

function crearContenedorNoData() {
    const contenedor = document.createElement('div');
    contenedor.className = 'flex flex-col items-center justify-center gap-2 py-10 h-full';
    contenedor.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-alert-icon lucide-book-alert"><path d="M12 13h.01"/><path d="M12 6v3"/><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/></svg>
        
        <p class="text-gray-500 text-sm text-center">No hay datos para esta selección</p>
    `;
    return contenedor;
}

    

const ABREVIACIONES = {
    'CERDEX C.A.':                     'CER',
    'CORIMON PINTURAS C.A.':           'CRP',
    'MONTANA GRÁFICA C.A.':            'MGR',
    'RESIMON C.A.':                    'RES',
    'TIENDAS MONTANA C.A.':            'TMO',
    'PURAS PINTURAS VENEZOLANAS C.A.': 'PPV',
    'ENVACA C.A.':                     'EEE',
    'CORIMON C.A.':                    'CRM',
};

const ORDEN_EMPRESAS = ['MGR','CRP', 'CRM', 'EEE','CER', 'RES', 'TMO', 'PPV'];

function abreviarEmpresa(nombre) {
    const key = Object.keys(ABREVIACIONES).find(
        k => k.localeCompare(nombre, undefined, { sensitivity: 'base' }) === 0
    );
    return key ? ABREVIACIONES[key] : nombre;
}
/* ============================================================
    1.- MÓDULO: Distribución de Performance
   ============================================================ */
const GraficoPerformance = {

    PARAMETROS: {
        'O':   { label: 'O',   color: '#3b82f6' },
        'FP+': { label: 'FP+', color: '#22c55e' },
        'FP':  { label: 'FP',  color: '#94a3b8' },
        'FP-': { label: 'FP-', color: '#fb923c' },
        'UP':  { label: 'UP',  color: '#dc2626' },
    },

    render(data) {
        const keys  = Object.keys(this.PARAMETROS);
        const total = keys.reduce((sum, k) => sum + (data[k]?.cantidad ?? 0), 0);


        const el = document.getElementById('chart-parametros');
        if (!el) return;

        if (total === 0) {
            el.innerHTML = '';
            el.appendChild(crearContenedorNoData());
            const legend = document.getElementById('legend-parametros');
            if (legend) legend.innerHTML = '';
            this.renderBadge(0);
            return;
        }

        this.renderBadge(total);
        const chart = this.renderDonut(data, keys, total);
        this.renderLeyenda(data, keys, chart);
    },

    renderBadge(total) {
        const el = document.getElementById('badge-total');
        if (!el) return;
        el.textContent = `${total}`;
    },

    renderDonut(data, keys, total) {
        const el    = document.getElementById('chart-parametros');
        el.innerHTML = ''
        const chart = echarts.init(el, null, { renderer: 'svg' });

        const seriesData = keys.map(key => ({
            name:      this.PARAMETROS[key].label,
            value:     data[key]?.porcentaje > 0 ? data[key].porcentaje : 0.3,
            realValue: data[key]?.porcentaje ?? 0,
            itemStyle: { color: this.PARAMETROS[key].color, borderRadius: 3 },
        }));

        chart.setOption({
            animation:         true,
            animationDuration: 700,
            animationEasing:   'cubicInOut',
            tooltip: {
                trigger:         'item',
                backgroundColor: '#ffffff',
                borderColor:     '#e5e7eb',
                borderWidth:     1,
                padding:         [8, 12],
                textStyle:       { color: '#374151', fontSize: 12 },
                formatter: p => `
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                        <span style="width:8px;height:8px;border-radius:2px;
                            background:${p.color};display:inline-block"></span>
                        <span style="font-weight:600;font-size:12px">${p.name}</span>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:${p.color}">
                        ${p.data.realValue.toFixed(1)}%
                    </div>
                `,
            },/*
            graphic: [
                {
                    type: 'text', left: 'center', top: '42%',
                    style: {
                        text:       String(total),
                        fontSize:   26,
                        fontWeight: '600',
                        fill:       '#1f2937',
                        textAlign:  'center',
                    },
                },
                {
                    type: 'text', left: 'center', top: '58%',
                    style: {
                        text:      'Total de registros',
                        fontSize:  11,
                        fill:      '#9ca3af',
                        textAlign: 'center',
                    },
                },
            ],*/
            series: [{
                type:              'pie',
                radius:            ['50%', '80%'],
                center:            ['50%', '55%'],
                avoidLabelOverlap: false,
                padAngle:          10,
                label:             { show: false },
                labelLine:         { show: false },
                itemStyle: {
                    borderWidth: 3,
                    borderColor: '#ffffff',
                },
                emphasis: {
                    scaleSize: 5,
                    itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.12)' },
                },
                data: seriesData,
            }],
        });

        window.addEventListener('resize', () => chart.resize());

        return chart;
    },

    renderLeyenda(data, keys, chart) {
        const container = document.getElementById('legend-parametros');
        if (!container) return;

        container.innerHTML = '';

        keys.forEach((key, idx) => {
            const cfg  = this.PARAMETROS[key];
            const item = data[key] ?? { cantidad: 0, porcentaje: 0.0 };

            const row = document.createElement('div');
            row.className = 'cp-legend-row';
            row.innerHTML = `
                <span class="cp-legend-dot" style="background:${cfg.color}"></span>
                <span class="cp-legend-label">${cfg.label}</span>
                <span class="cp-legend-pct" style="color:${cfg.color}">
                    ${item.porcentaje.toFixed(1)}%
                </span>
            `;

            row.addEventListener('mouseenter', () =>
                chart.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: idx })
            );
            row.addEventListener('mouseleave', () =>
                chart.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: idx })
            );

            container.appendChild(row);
        });
    },

};


/* ============================================================
    2. MÓDULO: Cumplimiento por Empresa
============================================================ */
const GraficoEmpresas = {

    COLOR_BARRA: '#3b82f6',

    render(data, meta) {
        const el = document.getElementById('chart-empresas');
        if (!el) return;

        const empresas = Object.keys(data).sort((a, b) => {
            const ia = ORDEN_EMPRESAS.indexOf(abreviarEmpresa(a));
            const ib = ORDEN_EMPRESAS.indexOf(abreviarEmpresa(b));
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        if (empresas.length === 0) {
            el.innerHTML = '';
            el.appendChild(crearContenedorNoData());
            return;
        }

        const porcentajes = empresas.map(e => data[e]);
        this.renderBarras(empresas, porcentajes, meta);
    },

    renderBarras(empresas, porcentajes, meta) {
        const el = document.getElementById('chart-empresas');
        if (!el) return;
        el.innerHTML = '';
        const chart = echarts.init(el, null, { renderer: 'svg' });

        chart.setOption({
            animation:         true,
            animationDuration: 700,
            animationEasing:   'cubicInOut',
            grid: {
                top:          24,
                bottom:       4,
                left:         4,
                right:        8,     
                containLabel: true,
            },
            tooltip: {
                trigger:         'axis',
                backgroundColor: '#ffffff',
                borderColor:     '#e5e7eb',
                borderWidth:     1,
                padding:         [8, 12],
                textStyle:       { color: '#374151', fontSize: 12 },
                formatter: params => {
                    const p = params[0];
                    return `
                        <div style="font-weight:600;font-size:12px;margin-bottom:4px">
                            ${p.name}
                        </div>
                        <div style="font-size:13px;font-weight:700;color:${this.COLOR_BARRA}">
                            ${p.value.toFixed(1)}%
                        </div>
                    `;
                },
            },
            xAxis: {
                type: 'category',
                data: empresas,
                axisLabel: {
                    fontSize: 9,          
                    color: '#6b7280',
                    interval: 0,
                    rotate: empresas.length > 5 ? 35 : 0,
                    formatter: name => abreviarEmpresa(name),
                },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            yAxis: {
                type: 'value',
                max: 100,
                axisLabel: {
                    fontSize: 10,
                    color: '#9ca3af',
                    formatter: v => `${v}%`,
                },
                splitLine: { lineStyle: { color: '#f3f4f6' } },
                axisLine: { show: false },
                axisTick: { show: false },
            },
            series: [{
                type:        'bar',
                data:        porcentajes,
                barMaxWidth: 28,
                barCategoryGap: '40%',
                itemStyle: {
                    color:        this.COLOR_BARRA,
                    borderRadius: [4, 4, 0, 0],
                },
                emphasis: {
                    itemStyle: { color: '#2563eb' },
                },
                label: {
                    show:      true,
                    position:  'top',
                    fontSize:  10,
                    color:     '#6b7280',
                    formatter: p => `${p.value.toFixed(1)}%`,
                },/*
                markLine: {
                    silent:    true,
                    symbol:    'none',
                    lineStyle: {
                        color: '#22c55e',
                        type:  'dashed',
                        width: 1.5,
                    },
                    label: {
                        position:   'insideEndTop',
                        formatter:  `META: ${meta}%`,
                        fontSize:   10,
                        color:      '#22c55e',
                        fontWeight: 600,
                    },
                    data: [{ yAxis: meta }],
                },*/
            }],
        });

        window.addEventListener('resize', () => chart.resize());
    },

};

/* ============================================================
    3. MÓDULO: Promedio Global (Gauge)
   ============================================================ */
const GraficoGauge = {
    
    render(valor) {
        const el = document.getElementById('chart-cumplimiento-global');
        if (!el) return;
        el.innerHTML = '';
        const chart = echarts.init(el, null, { renderer: 'svg' });

        const opcionBase = this.getOption(0); // Arranca en 0
        chart.setOption(opcionBase);

        const secuencia = [
            { valor: 80,    delay: 100,  duracion: 500 },
            { valor: 50,    delay: 600,  duracion: 350 },
            { valor: 15,    delay: 950,  duracion: 400 },
            { valor: valor, delay: 1350, duracion: 600 },
        ];

        secuencia.forEach(paso => {
            setTimeout(() => {
                chart.setOption({
                    series: [{
                        animationDuration: paso.duracion,
                        animationEasing: 'cubicInOut',
                        data: [{
                            value: paso.valor,
                            name:  'PROMEDIO TOTAL\nINDICADORES',
                        }],
                    }],
                });
            }, paso.delay);
        });

        window.addEventListener('resize', () => chart.resize());
    },

    /** Genera la configuración completa del gauge con un valor inicial */
    getOption(valor) {
        return {
            animation:         true,
            animationDuration: 600,
            animationEasing:   'cubicInOut',
            series: [{
                type:       'gauge',
                center:     ['50%', '50%'],
                radius:     '100%',
                startAngle: 200,
                endAngle:   -20,
                min:        0,
                max:        100,
                splitNumber: 10,

                axisLine: {
                    lineStyle: {
                        width: 18,
                        color: [
                            [0.20, '#dc2626'],
                            [0.40, '#f97316'],
                            [0.60, '#eab308'],
                            [0.80, '#22c55e'],
                            [1.00, '#15803d'],
                        ],
                    },
                },

                pointer: {
                    length:    '60%',
                    width:     5,
                    itemStyle: { color: '#1e293b' },
                },
                anchor: {
                    show:      true,
                    size:      10,
                    showAbove: true,
                    itemStyle: { color: '#1e293b' },
                },

                axisTick: {
                    distance: -18,
                    length:   6,
                    lineStyle: { color: '#fff', width: 1.5 },
                },
                splitLine: {
                    distance: -18,
                    length:   18,
                    lineStyle: { color: '#fff', width: 2.5 },
                },
                axisLabel: { show: false },

                title: {
                    show:         true,
                    offsetCenter: [0, '75%'],
                    fontSize:     11,
                    fontWeight:   600,
                    color:        '#6b7280',
                },

                detail: {
                    valueAnimation: true,
                    formatter:      '{value}%',
                    fontSize:       28,
                    fontWeight:     'bold',
                    offsetCenter:   [0, '20%'],
                    color:          '#1f2937',
                },

                data: [{
                    value: valor,
                    name:  'PROMEDIO TOTAL\nINDICADORES',
                }],
            }],
        };
    },
};


/* ============================================================
    4. MÓDULO: Heatmap Nivel × Filial
   ============================================================ */
const GraficoHeatmap = {

    COLORES: ['#f0f9ff', '#bae6fd', '#38bdf8', '#0284c7', '#1e3a5f'],

    render(data) {
        const el = document.getElementById('chart-nivel-filial');
        if (!el) return;
        el.innerHTML = '';
        if (Object.keys(data).length === 0) {
            el.innerHTML = '';
            el.appendChild(crearContenedorNoData());
            return;
        }

        const chart = echarts.init(el, null, { renderer: 'svg' });

        // Ordenar niveles I → IV
        const niveles = Object.keys(data).sort((a, b) => {
            const orden = { 'V': 1, 'IV': 2, 'III': 3, 'II': 4, 'I': 5 };
            return (orden[a] ?? 99) - (orden[b] ?? 99);
        });

        // Extraer todas las empresas únicas
        const empresasSet = new Set();
        niveles.forEach(n => Object.keys(data[n]).forEach(e => empresasSet.add(e)));
        const empresas = [...empresasSet].sort((a, b) => {
            const ia = ORDEN_EMPRESAS.indexOf(abreviarEmpresa(a));
            const ib = ORDEN_EMPRESAS.indexOf(abreviarEmpresa(b));
            return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });

        // Construir data: [empresaIndex, nivelIndex, valor]
        const heatData = [];
        let maxVal = 0;

        niveles.forEach((nivel, ni) => {
            empresas.forEach((emp, ei) => {
                const val = data[nivel]?.[emp] ?? null;
                if (val !== null) {
                    heatData.push([ei, ni, val]);
                    if (val > maxVal) maxVal = val;
                } else {
                    heatData.push([ei, ni, '-']);   // marcador de "no aplica"
                }
            });
        });

        chart.setOption({
            animation:         true,
            animationDuration: 700,
            animationEasing:   'cubicInOut',
            tooltip: {
                backgroundColor: '#ffffff',
                borderColor:     '#e5e7eb',
                borderWidth:     1,
                padding:         [8, 12],
                textStyle:       { color: '#374151', fontSize: 12 },
                formatter: p => {
                    const emp   = empresas[p.data[0]];
                    const nivel = niveles[p.data[1]];
                    const val   = p.data[2];
                    return `
                        <div style="font-weight:600;font-size:12px;margin-bottom:4px">
                            ${emp}
                        </div>
                        <div style="display:flex;align-items:center;gap:6px">
                            <span style="color:#6b7280">Nivel ${nivel}:</span>
                            <span style="font-weight:700;color:#1f2937">${val.toFixed(1)}%</span>
                        </div>
                    `;
                },
            },
            grid: {
                top:          8,
                bottom:       4,
                left:         4,
                right:        40,
                containLabel: true,
            },
            xAxis: {
                type:     'category',
                data:     empresas,
                position: 'bottom',
                axisLabel: {
                    fontSize:  9,
                    color:     '#6b7280',
                    interval:  0,
                    rotate:    empresas.length > 5 ? 35 : 0,
                    formatter: name => abreviarEmpresa(name),
                },
                axisLine:  { show: false },
                axisTick:  { show: false },
                splitArea: { show: false },
            },
            yAxis: {
                type: 'category',
                data: niveles.map(n => `Nivel ${n}`),
                axisLabel: {
                    fontSize: 10,
                    color:    '#6b7280',
                },
                axisLine:  { show: false },
                axisTick:  { show: false },
                splitArea: { show: false },
            },
            visualMap: {
                min:        0,
                max:        maxVal || 100,
                calculable: false,
                orient:     'vertical',
                right:      0,
                top:        'center',
                itemHeight: 150,
                itemWidth:  12,
                textStyle:  { fontSize: 9, color: '#9ca3af' },
                inRange: {
                    color: this.COLORES,
                },
            },
            series: [{
                type: 'heatmap',
                data: heatData,
                label: {
                    show:      true,
                    fontSize:  10,
                    formatter: p => p.data[2] === '-' ? '—' : `${p.data[2].toFixed(1)}%`,
                    color: (params) => {
                        const val = params.data[2];
                        if (val === '-' || val === null) return '#9ca3af';
                        // Umbral: si el valor supera el 60% del máximo, usar texto blanco
                        const umbral = (maxVal || 100) * 0.5;
                        return val >= umbral ? '#ffffff' : '#374151';
                    },
                },
                itemStyle: {
                    borderWidth:  3,
                    borderColor:  '#ffffff',
                    borderRadius: 4,
                },
            }],
        });

        window.addEventListener('resize', () => chart.resize());
    },
};

/* ============================================================
    5. MÓDULO: Filtros del Dashboard (fetch + re-render)
   ============================================================ */
const FiltroDashboard = {
    filialActual: null,
    nivelActual: null,

    // Textos default de cada botón
    LABEL_FILIAL_DEFAULT: 'Filtro por Filial',
    LABEL_NIVEL_DEFAULT:  'Filtro por Nivel',

    init() {
        // filtro de la filial
        document.querySelectorAll('.FilialComparar').forEach(btn => {
            btn.addEventListener('click', () => {
                const valor = btn.dataset.filialButton;
                this.filialActual = valor === 'ALL' ? null : valor;

                
                const label = this.filialActual
                    ? btn.querySelector('p, span')?.textContent?.trim() || valor
                    : this.LABEL_FILIAL_DEFAULT;
                this.actualizarBoton('dropdown-button-2', label, !!this.filialActual);

                
                this.marcarActivo('.FilialComparar', btn);

                
                this.cerrarDropdown('dropdown-search-city');

                this.fetchData();
            });
        });

        //Filtro Nivel
        document.querySelectorAll('.NivelComparar').forEach(btn => {
            btn.addEventListener('click', () => {
                const valor = btn.dataset.nivelButton;
                this.nivelActual = valor === 'ALL' ? null : valor;

                const label = this.nivelActual
                    ? `Nivel ${valor}`
                    : this.LABEL_NIVEL_DEFAULT;
                this.actualizarBoton('dropdown-button-nivel', label, !!this.nivelActual);

                this.marcarActivo('.NivelComparar', btn);
                this.cerrarDropdown('dropdown-search-nivel');

                this.fetchData();
            });
        });
    },


    actualizarBoton(btnId, texto, activo) {
        const boton = document.getElementById(btnId);
        if (!boton) return;

        // Buscar o crear el span de texto (preservando el SVG del chevron)
        let spanTexto = boton.querySelector('.filtro-label');
        if (!spanTexto) {
            
            const svg = boton.querySelector('svg');
            boton.innerHTML = '';
            spanTexto = document.createElement('span');
            spanTexto.className = 'filtro-label';
            boton.appendChild(spanTexto);
            if (svg) boton.appendChild(svg);
        }

        spanTexto.textContent = texto;

        // Estilo visual: borde azul cuando hay filtro activo
        if (activo) {
            boton.classList.remove('border-gray-300', 'text-gray-500');
            boton.classList.add('border-blue-500', 'text-blue-600', 'bg-blue-50');
        } else {
            boton.classList.remove('border-blue-500', 'text-blue-600', 'bg-blue-50');
            boton.classList.add('border-gray-300', 'text-gray-500');
        }
    },


    marcarActivo(selector, btnActivo) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('bg-blue-50', 'text-blue-600', 'font-semibold');
        });
        btnActivo.classList.add('bg-blue-50', 'text-blue-600', 'font-semibold');
    },

    cerrarDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) dropdown.classList.add('hidden');
    },


    
    async fetchData() {
        try {
            const params = new URLSearchParams();
            if (this.filialActual) params.set('filial', this.filialActual);
            if (this.nivelActual)  params.set('nivel', this.nivelActual);

            const qs = params.toString();
            const res = await fetch(`/app_crm/gdd/api/dashboard_data${qs ? '?' + qs : ''}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            // Destruir gráficos anteriores
            ['chart-parametros', 'chart-empresas', 'chart-cumplimiento-global', 'chart-nivel-filial']
                .forEach(id => {
                    const el = document.getElementById(id);
                    if (!el) return;
                    const instance = echarts.getInstanceByDom(el);
                    if (instance) instance.dispose();
                });

            // Re-renderizar

            console.log('datos_promedios:', data.promedios);
            GraficoPerformance.render(data.distribucion_performance);
            GraficoEmpresas.render(data.promedios, 0);
            GraficoGauge.render(data.promedio_global);
            GraficoHeatmap.render(data.promedio_nivel_filial);

        } catch (err) {
            console.error('Error al filtrar dashboard:', err);
        }
    },
};

FiltroDashboard.init();


function animarNumero(el, opciones = {}) {
    const objetivo = parseFloat(el.dataset.valor) || 0;
    const {
        duracion  = 1500,
        decimales = 0,
        sufijo    = '%',
        prefijo   = '',
    } = opciones;

    let inicio = null;
    const from = 0;

    function step(timestamp) {
        if (!inicio) inicio = timestamp;
        const progreso = Math.min((timestamp - inicio) / duracion, 1);

        // Easing: desacelera al final
        const eased = 1 - Math.pow(1 - progreso, 3);
        const actual = from + (objetivo - from) * eased;

        el.textContent = `${prefijo}${actual.toFixed(decimales)}${sufijo}`;

        if (progreso < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}
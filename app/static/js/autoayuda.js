driver = window.driver.js.driver;

const titulo = document.getElementById('titulo').value;
console.log(titulo)
const autoayuda = document.getElementById('autoayuda');

if (titulo == "Indicadores"){
    const botonGDIModal = document.getElementById('autoayudaModal');

    if (autoayuda){
        autoayuda.addEventListener('click', () => {
            const driverObj = driver({
                popoverClass: 'driverjs-theme',
                showProgress: true,
                steps: [
                    { element: '#tarjetaprincipalgdi', popover: { title: 'Gestión de Indicadores', description: 'Esta tabla organiza los indicadores funcionales en columnas. Cada columna esta asociada a un aspecto especifico de la operación y seguimiento de los indicadores.', side: "bottom", align: 'center' }},

                    { element: '#indicadorAyuda', popover: { title: 'Nombre de los Indicadores', description: 'Muestra el nombre de los indicadores definidos. Que deben estar alineados a los objetivos estratégicos de la empresa', side: "bottom", align: 'center' }},
                    
                    { element: '#tendenciaIndicador', popover: { title: 'Tendencia de los Indicadores', description: 'Se visualizará la selección de la tendencia del indicador. <strong> Ascendente: A </strong> , <strong> Descendente: D. </strong> ', side: "bottom", align: 'center' }},
                    
                    { element: '#pesoIndicador', popover: { title: 'Peso del Indicador', description: 'Representa el peso del indicador según su prioridad e impacto. Recuerda: la sumatoria de los tres (3) indicadores debe ser 80%.', side: "bottom", align: 'center' }},
                    
                    { element: '#footerPeso', popover: { title: 'Peso Total', description: 'En esta sección se mostrará la suma total de los pesos de todos los indicadores agregados en la tabla.', side: "top", align: 'start' }},
                    
                    { element: '#realafIndicador', popover: { title: 'REAL AF Anterior (REAL AF25)', description: 'En esta columna se visualizará el resultado del indicador del ejercicio anterior. Si es un nuevo indicador y no tiene medición, déjelo en blanco.', side: "right", align: 'start' }},
                    
                    { element: '#objetivoAFIndicador', popover: { title: 'Objetivo / Meta (PPTO U OBJETIVO AF26)', description: 'Esta sección mostrará la meta establecida para el nuevo ejercicio.', side: "right", align: 'start' }},
                    
                    { element: '#REAlAFAyuda', popover: { title: 'REAL AF Actual (REAL AF26)', description: 'En esta columna la información será completada durante las etapas de revisión y cierre.', side: "right", align: 'start' }},
                    
                    { element: '#cumplimientoIndicador', popover: { title: 'Cumplimiento', description: 'En esta columna se representan de forma automática los porcentajes de cumplimiento de cada uno de los indicadores', side: "right", align: 'start' }},
                    
                    { element: '#footerCumplimiento', popover: { title: 'Cumplimiento Total', description: ' Se visualizará el porcentaje de cumplimiento total, considerando todos los indicadores.', side: "top", align: 'start' }},
                    
                    { element: '#desempeñoIndicador', popover: { title: 'Niveles de Desempeño', description: 'A contuniación se describen los distintos niveles de desempeño: <br><br> <strong>UP:</strong> <em>Nunca</em> logra alcanzar los resultados establecidos con relación a las exigencias del cargo y/o actividades asignadas.<br><br> <strong>FP-:</strong> <em>En ocasiones</em> logra alcanzar las expectativas con relación a las exigencias del cargo y/o actividades asignadas. Requiere supervisión estrecha. La necesidad de un plan de mejoramiento y desarrollo a corto plazo es claramente necesaria.<br><br> <strong>FP:</strong> <em>Siempre</em> logra los resultados esperados. Cumple las expectativas de acuerdo con las exigencias del cargo y/o actividades asignadas.<br><br> <strong>FP+:</strong> <em>Consistentemente</em> excede las expectativas con relación al logro de las exigencias del cargo y/o actividades asignadas.<br><br> <strong>O:</strong> <em>Siempre y sin excepción</em> se desempeña por encima de las expectativas con relación a las exigencias del cargo y/o actividades asignadas. De forma evidente agrega valor por encima de lo esperado.', position: 'bottom' }},
                    
                    { element: '#estatusIndicador', popover: { title: 'Estatus', description: 'En esta columna se reflejará la condición de cada indicador al ser revisados por el supervisor.', side: "top", align: 'start' }},
                    
                    { element: '#archivosAyuda', popover: { title: 'Archivos', description: 'En esta columna aparecerán los apartados de Hoja de Vida y Cronograma. Al hacer click en ellos, se abrirá su respectiva pagina. Todos deben completar la hoja de vida por indicador. El cronograma aplica para indicadores de cumplimiento.', side: "top", align: 'start' }},
                    
                    { element: '#editarAyuda', popover: { title: 'Edición', description: 'Podrán modificar la tabla de indicadores mientras los mismos esten desbloqueados.', side: "top", align: 'start' }},
                    
                    { element: '#openModal', popover: { title: 'Agregar', description: 'En este apartado podrás agregar los indicadores que estén definidos.', side: "top", align: 'start' }},

                    { element: '#btnBorrar', popover: { title: 'Borrar', description: 'Para borrar indicadores, primero selecciona el indicador deseado y luego presiona este botón.', side: "top", align: 'start' }}
                    
                    
                ]
            });
            driverObj.drive();
        });
    }
    
    if (botonGDIModal){
        botonGDIModal.addEventListener('click', () => {
            const driverObjModal = driver({
                popoverClass: 'driverjs-theme',
                showProgress: true,
                onHighlightStarted: (element) => {
                    setTimeout(() => {
                        element?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }, 100);
                },
                steps: [
    
                    { element: '#Indicador', popover: { title: 'Nombre del Indicador', description: 'Escriba nombre del indicador definido. Importante : debe estar alineado a los objetivos estratégicos de la empresa.', side: "left", align: 'center' }},
    
                    { element: '#peso', popover: { title: 'Peso', description: 'Escriba el peso del indicador según prioridad e impacto del indicador Recuerde : la sumatoria de los tres ( 3 ) indicadores debe ser 80 %.', side: "right", align: 'center' }},
    
                    { element: '#Tendencia', popover: { title: 'Tendencia', description: 'Seleccione la tendencia del indicador. A= Ascendente D= Descendente.', side: "left", align: 'center' }},
    
                    { element: '#AFANTERIOR', popover: { title: 'AF anterior ', description: 'Escriba resultado del indicador del ejercicio anterior . Si es un nuevo indicador y no tiene la medición, dejar en blanco .', side: "right", align: 'center' }},
    
                    { element: '#AFPPTO', popover: { title: 'Objetivo o PPTO del AF actual', description: 'Escriba la meta establecida para el nuevo ejercicio.', side: "left", align: 'center' }},
    
                    { element: '#AFACTUAL', popover: { title: 'AF actual', description: 'Esta información será completada en las etapas de revisión y en la de cierre.', side: "right", align: 'center' }},
                ]
            });
            driverObjModal.drive();
        });
    }

}else if (titulo == 'Menu'){
    autoayuda.addEventListener('click', ()=>{
        const driverObjModal = driver({
            popoverClass: 'driverjs-theme',
            showProgress: true,

            steps: [

                { element: '#GestiosIndicadores', popover: { title: 'Gestiona los indicadores', description: 'Accede a esta sección para realizar el ciclo completo de la gestión de indicadores funcionales. Esto incluye la información asociada a cada indicador que deben estar alineados a los objetivos estratégicos de la empresa.', side: "left", align: 'center' }},

                { element: '#evaluacion', popover: { title: 'Evaluación de Competencias', description: 'En esta sección se realizará la evaluación de desempeño de competencias bajo la modalidad de 180º para los participantes niveles II, III y IV. Para el nivel I se realizará bajo la modalidad de 360º.', side: "right", align: 'end' }},

                { element: '#reporte', popover: { title: 'Reportes', description: 'Consulta la información detallada y cronológica que almacena todo el proceso de Gestión del Desempeño realizado por ejercicio fiscal.', side: "left", align: 'center' }},

                { element: '#GestionEquipo', popover: { title: 'Gestión de Equipo', description: 'Esta sección proporciona las herramientas necesarias para que los lideres puedan supervisar y coordinar eficientemente a sus equipos de trabajo.', side: "bottom", align: 'end' }},

                { element: '#resultado', popover: { title: 'Resultados', description: 'En esta sección podrá verificar los resultados consolidados que se han derivado de su proceso de gestión del Desempeño (GDD)', side: "left", align: 'center' }},

            ]
        });
        driverObjModal.drive();

    });
}else if (titulo == 'Hoja'){
    autoayuda.addEventListener('click', ()=>{
        const driverObjModal = driver({
            popoverClass: 'driverjs-theme',
            showProgress: true,
            

            steps: [

                { element: '#vigencia', popover: { title: 'Vigencia', description: 'Indicar periodo en el cual se mantendrá vigente el indicador.', side: "top", align: 'center' }},

                { element: '#fuente', popover: { title: 'Fuente de Datos', description: 'Indique cual es la fuente de los datos de las variables y la ubicación de donde se obtienen o se encuentran (Ejemplo : SAP Modulo 510 , Vista y reporte ZMB52 ).', side: "top", align: 'center' }},

                { element: '#relacion', popover: { title: 'Relacion del Indicador', description: 'Indique con que estrategia, objetivo operativo, objetivo estratégico, entre otros se relaciona el indicador.', side: "bottom", align: 'center' }},

                { element: '#medida', popover: { title: 'Unidad de Medida', description: 'Indique la unidad en la que se lleva el indicador o con la cual son expresados los resultados de la medición.', side: "bottom", align: 'center' }},

                { element: '#tipoindicador', popover: { title: 'Tipo de Indicador', description: 'Seleccione el tipo de indicador según corresponda.', side: "top", align: 'center' }},

                { element: '#definicion', popover: { title: 'Definición', description: 'Describa brevemente la utilidad del indicador, indique el fin o propósito por el cual se mide.', side: "top", align: 'center' }},

                { element: '#calculo', popover: { title: 'Formula de Cálculo', description: 'Escriba la fórmula para el cálculo del indicador', side: "bottom", align: 'center' }},

                { element: '#enviar', popover: { title: 'Enviar', description: 'Envíe toda la información una vez que haya completado todos los campos..', side: "bottom", align: 'center' }},


            ]
        });
        driverObjModal.drive();

    });
}else if(titulo=='Cronograma'){
    autoayuda.addEventListener('click', ()=>{
        const  driverObjModal= driver({
            popoverClass: 'driverjs-theme',
            showProgress: true,
            onHighlightStarted: (element) => {
                setTimeout(() => {
                    element?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }, 100);
            },

            steps: [

                { element: '#actividad', popover: { title: 'Actividad / Acción', description: 'Escriba las actividades previstas a realizar si su indicador es de cumplimiento.', side: "bottom", align: 'start' }},

                { element: '#fechaing', popover: { title: 'Fecha de Ingreso del Progreso', description: 'Indique la fecha de inicio prevista por actividad.', side: "bottom", align: 'end' }},

                { element: '#fechafin', popover: { title: 'Fecha de Finalización del progreso', description: 'Indique la fecha de fin prevista por actividad.', side: "top", align: 'center' }},

            /* { element: '#planifcado', popover: { title: 'Avance Planificado', description: '.', side: "top", align: 'center' }},*/

                { element: '#inicio', popover: { title: 'Fecha Inicio Real', description: ' Indicar la fecha real de inicio en la cual se realizó la actividad.', side: "right", align: 'end' }},

                { element: '#fin', popover: { title: 'Fecha Fin Real', description: ' Indicar la fecha real de cierre en la cual se realizó la actividad.', side: "left", align: 'center' }},

            /* { element: '#avancereal', popover: { title: '', side: "right", align: 'end' }},*/

            /* { element: '#desviacionreal', popover: { title: '.', side: "bottom", align: 'end' }},*/

                { element: '#add', popover: { title: 'Agergar Fila', description: 'Puede colocar una fila adicional en el cronograma', side: "bottom", align: 'end' }},

                { element: '#enviar', popover: { title: 'Enviar los Datos', description: 'Envie todos los campos una vez esten completados', side: "top", align: 'start' }},

            ]

});
driverObjModal.drive();

    });
}




















































//const { Dropdown } = require("flowbite");

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

} else if (titulo == 'Menu'){
    autoayuda.addEventListener('click',async ()=>{
        const waitForElement = (selector, timeout = 5000, interval = 100) => {
            return new Promise((resolve, reject) => {
                let endTime = Date.now() + timeout;
                const checkElement = () => {
                    const element = document.querySelector(selector);
                    if (element && element.offsetParent !== null && window.getComputedStyle(element).visibility !== 'hidden' && window.getComputedStyle(element).display !== 'none') {
                        resolve(element);
                    } else if (Date.now() < endTime) {
                        setTimeout(checkElement, interval);
                    } else {
                        reject(new Error(`Elemento ${selector} no visible después de ${timeout}ms`));
                    }
                };
                checkElement();
            });
        };

        const driverObjModal = driver({
            popoverClass: 'driverjs-theme',
            showProgress: true,
            steps: [
                {
                    element: '#GestiosIndicadores',
                    popover: { title: 'Gestiona los indicadores', description: 'Accede a esta sección para realizar el ciclo completo de la gestión de indicadores funcionales. Esto incluye la información asociada a cada indicador que deben estar alineados a los objetivos estratégicos de la empresa.', side: "left", align: 'center' }
                },
                {
                    element: '#evaluacion', 
                    popover: {
                        title: 'Evaluación de Competencias',
                        description: 'En esta sección se realizará la evaluación de desempeño de competencias bajo la modalidad de 180º para los participantes niveles II, III y IV. Para el nivel I se realizará bajo la modalidad de 360º.',
                        side: "right",
                        align: 'end'
                    },
                onHighlighted: async (Highlightedelement) => {
                    Highlightedelement.click(); 
                    try {
                        await waitForElement('#select-evaluacion', 2000, 50);
                    } catch (error) {
                        console.warn(error.message);
                    }
                    },
                },
                {
                    element: '#auto_evaluacion',
                    popover: { title: 'Auto Evaluación', description: 'Seleccione la opción de autoevaluación para evaluar su desempeño durante el ejercicio fiscal asociado a competencias actitudinales', side: "left", align: 'center' }
                },
                
                {
                    element: '#evualuacion_terceros', 
                    popover: { title: 'Evaluación a Terceros', description: 'Aplica para realizar evaluación de colaboradores , pares o supervisores .', side: "right", align: 'center' },
                },
                { element: '#reporte', popover: { title: 'Reportes', description: 'Consulta la información detallada y cronológica que almacena todo el proceso de Gestión del Desempeño realizado por ejercicio fiscal.', side: "left", align: 'center' },
                        onDeselected: async () => {
                        const dropdownTriggerToClose = document.getElementById('select-evaluacion'); 
                        if (dropdownTriggerToClose) {
                            dropdownTriggerToClose.click(); 
                            } 
                    }},
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

                { element: '#enviar', popover: { title: 'Enviar', description: 'Envíe toda la información una vez que haya completado todos los campos.', side: "bottom", align: 'center' }},


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
} else if (titulo == 'Evaluación') {
        const autoayuda = document.getElementById('autoayuda');

        if (autoayuda) {
            autoayuda.addEventListener('click', () => {
                const estado_evaluacion = document.getElementById('estado_evaluacion');
                const estado_actual = estado_evaluacion ? estado_evaluacion.value.trim() : '';

                const competencyDescriptions = {
                    'Demostración valores coorporativos': {
                        UP: 'Nunca demuestra los comportamientos asociados a los valores corporativos.',
                        'FP-': 'En ocasiones demuestra los comportamientos asociados a los valores corporativos.',
                        FP: 'Siempre demuestra los comportamientos asociados los valores corporativos.',
                        'FP+': 'Frecuentemente es modelo y referente de los comportamientos asociados a los valores corporativos.',
                        O: 'Siempre y sin excepción es modelo y referente de los comportamientos asociados a los valores corporativos.'
                    },
                    'Foco en Resultados': {
                        UP: 'Nunca logra los resultados esperados en términos de calidad, cantidad y oportunidad',
                        'FP-': 'En ocasiones logra los resultados esperados en términos de calidad, cantidad y oportunidad.',
                        FP: 'Siempre logra los resultados esperados en términos de calidad, cantidad y oportunidad.',
                        'FP+': 'Consistentemente excede las expectativas con relación a los resultados esperados en términos de calidad, cantidad y oportunidad.',
                        O: 'Siempre y sin excepción excede las expectativas con relación a los resultados esperados en términos de calidad, cantidad y oportunidad.'
                    },
                    'Influencia Organizacional': {
                        UP: 'Nunca demuestra la intención de persuadir y convencer a otros para el logro de objetivos comunes. No fomenta ambientes de participación y colaboración.',
                        'FP-': 'En ocasiones demuestra la intención de persuadir y convencer a otros para el logro de objetivos comunes. A veces fomenta ambientes de participación y colaboración.',
                        FP: ' Siempre logra persuadir a otros para que contribuyan a alcanzar los objetivos comunes. Constantemente fomenta la participación y la colaboración.',
                        'FP+': 'Consistentemente excede las expectativas al persuadir a otros para que contribuyan a alcanzar los objetivos comunes. La mayoria de las veces es modelo a seguir fomentando la participación y la colaboración.',
                        O: 'Siempre y sin excepción excede las expectativas al persuadir a otros para que contribuyan a alcanzar los objetivos comunes. Es reconocido por ser modelo a seguir fomentando la participación y la colaboración.'
                    },
                    'Liderazgo': {
                        UP: 'Nunca demuestra la intención de guiar al equipo de trabajo y desarrollar sinergia entre sus miembros para alcanzar los objetivos. No modela con su ejemplo carisma y empatía. No logra adaptarse a diferentes situaciones y personas.',
                        'FP-': 'En ocasiones demuestra la intención de guiar al equipo de trabajo y desarrollar sinergia entre sus miembros para alcanzar los objetivos. Pocas veces modela con su ejemplo carisma y empatía. Difícilmente logra adaptarse a diferentes situaciones y personas',
                        FP: 'Siempre guía al equipo de trabajo, desarrollando sinergia entre sus miembros para alcanzar los objetivos, modelando con su ejemplo carisma y empatía, adaptándose a diferentes situaciones y personas.',
                        'FP+': 'Consistentemente excede las expectativas al guíar al equipo de trabajo, desarrollando sinergia entre sus miembros para alcanzar los objetivos, modelando con su ejemplo carisma y empatia, adaptándose a diferentes situaciones y personas.',
                        O: 'Siempre y sin excepción excede las expectativas al guíar al equipo de trabajo, desarrollando sinergia entre sus miembros para alcanzar los objetivos, es referente de carisma y empatía para el resto de la compañía, adaptándose a diferentes situaciones y personas.'
                    },
                    'Desarrollo del Equipo de Trabajo': {
                        UP: 'Nunca demuestra la intención de impulsar el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos.',
                        'FP-': 'En ocasiones impulsa el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos.',
                        FP: 'Siempre impulsa el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos.',
                        'FP+': 'Consistentemente excede las expectativas con relación a las acciones que impulsan el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos.',
                        O: 'Siempre y sin excepción excede las expectativas con relación a las acciones que impulsan el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos. Es modelo para el resto de la organización.'
                    }
                };

                
                const getRatingElementId = (competencyNumber, estado) => {
                    const prefixMap = {
                        1: 'Primera',
                        2: 'Segunda',
                        3: 'Tercer',
                        4: 'Cuarto',
                        5: 'Quinta'
                    };
                    let suffix;
                    if (estado === 'supervisorEvaluacion') {
                        suffix = '_supervi';
                    } else if (estado === 'subordinadoEvaluacion') {
                        suffix = '_colaborador';
                    } else if(estado=='parEvaluacion'){
                        suffix='_par'
                    }
                    else { // Asume 'autoevaluacion' por defecto
                        suffix = '_autoeval';
                    }
                    return `${prefixMap[competencyNumber]}${suffix}`;
                };

                const createRatingSteps = (competencyNumber, competencyTitle, descriptions, estado) => {
                    const baseElementId = getRatingElementId(competencyNumber, estado);
                    return [
                        {
                            element: `#${baseElementId}`,
                            popover: {
                                title: `${competencyTitle} (UP)`,
                                description: `<img src='https://raw.githubusercontent.com/Randote/Randote/7e07cc633e58399094da93cbd9f6f1633e116a6a/UP.PNG' style='height: auto; width: auto; border: none; outline: none; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border-radius:15px' /><span style='font-size: 15px; display: block; margin-top: 10px; text-align:justify;'>${descriptions.UP}</span>`,
                                side: "right",
                                align: 'center'
                            }
                        },
                        {
                            element: `#${baseElementId}`,
                            popover: {
                                title: `${competencyTitle} (FP-)`,
                                description: `<img src='https://raw.githubusercontent.com/Randote/Randote/7e07cc633e58399094da93cbd9f6f1633e116a6a/FP-.PNG' style='height: auto; width: auto; border: none; outline: none; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border-radius:15px' /><span style='font-size: 15px; display: block; margin-top: 10px; text-align:justify;'>${descriptions['FP-']}</span>`,
                                side: "right",
                                align: 'center'
                            }
                        },
                        {
                            element: `#${baseElementId}`,
                            popover: {
                                title: `${competencyTitle} (FP)`,
                                description: `<img src='https://raw.githubusercontent.com/Randote/Randote/7e07cc633e58399094da93cbd9f6f1633e116a6a/FP.PNG' style='height: auto; width: auto; border: none; outline: none; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border-radius:15px' /><span style='font-size: 15px; display: block; margin-top: 10px; text-align:justify;'>${descriptions.FP}</span>`,
                                side: "right",
                                align: 'center'
                            }
                        },
                        {
                            element: `#${baseElementId}`,
                            popover: {
                                title: `${competencyTitle} (FP+)`,
                                description: `<img src='https://raw.githubusercontent.com/Randote/Randote/7e07cc633e58399094da93cbd9f6f1633e116a6a/FP+.PNG' style='height: auto; width: auto; border: none; outline: none; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border-radius:15px' /><span style='font-size: 15px; display: block; margin-top: 10px; text-align:justify;'>${descriptions['FP+']}</span>`,
                                side: "right",
                                align: 'center'
                            }
                        },
                        {
                            element: `#${baseElementId}`,
                            popover: {
                                title: `${competencyTitle} (O)`,
                                description: `<img src='https://raw.githubusercontent.com/Randote/Randote/7e07cc633e58399094da93cbd9f6f1633e116a6a/O.PNG' style='height: auto; width: auto; border: none; outline: none; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto; border-radius:15px' /><span style='font-size: 15px; display: block; margin-top: 10px; text-align:justify;'>${descriptions.O}</span>`,
                                side: "right",
                                align: 'center'
                            }
                        }
                    ];
                };
                const Elementmessenger=(estado) =>{
                    if(estado=='supervisorEvaluacion'){
                        return('#Supervisor')
                    }else if(estado=='parEvaluacion'){
                        return('#tdpar')
                    }else if(estado=='subordinadoEvaluacion'){
                        return('#tdzcolaborador')
                    }else (estado=='Autoevaluacion')
                        return('#Auto_eval')
                };

                const introMessageStep = {
                    element: Elementmessenger(estado_actual),
                    popover: {
                        title: 'Nivel de Dominio',
                        description: 'Seleccione la opción que corresponda según el nivel de dominio por competencia alineado a la descripción del mismo.',
                        side: "bottom",
                        align: 'center'
                    }
                };
                const steps = [];

                // 1. Demostración valores coorporativos y sus niveles (Primera)
                steps.push({
                    element: '#Desmotracion',
                    popover: {
                        title: 'Demostración valores coorporativos',
                        description: `Actuación y comportamiento acorde
                                con los pilares fundamentales para la
                                convivencia laboral destacando la
                                visión, misión y valores en sus
                                actividades rutinarias:<br>
                                <strong>1.- HACEMOS lo que decimos</strong><br>
                                <strong>2.- Somos RESPONSABLES de nuestras acciones</strong><br>
                                <strong>3.- Nuestros CLIENTES están en todo lo que hacemos</strong><br>
                                <strong>4.- INNOVAR es nuestro día a día</strong>`,
                        side: "bottom",
                        align: 'center'
                    }
                });
                steps.push(introMessageStep);
                steps.push(...createRatingSteps(1, 'Demostración valores coorporativos', competencyDescriptions['Demostración valores coorporativos'], estado_actual)),


                // 2.Foco en Resultados y sus niveles (Segunda)
                steps.push({
                    element: '#Foco',
                    popover: {
                        title: 'Foco en Resultados',
                        description: 'Establecer estrategias y planes de acción que le llevan al logro de los objetivos organizacionales.',
                        side: "right",
                        align: 'center'
                    }
                });
                steps.push(...createRatingSteps(2, 'Foco en Resultados', competencyDescriptions['Foco en Resultados'], estado_actual));
                
                // 3.  Influencia Organizacional y sus niveles (Tercera)
                steps.push({
                    element: '#Influencia',
                    popover: {
                        title: 'Influencia Organizacional',
                        description: 'Persuadir y convencer a otros logrando causar una impresión determinada, para que contribuyan en el logro de los objetivos comunes, aceptando la diversidad de opiniones, alcanzando un ambiente de participación y colaboración.',
                        side: "bottom",
                        align: 'center'
                    }
                });
                steps.push(...createRatingSteps(3, 'Influencia Organizacional', competencyDescriptions['Influencia Organizacional'], estado_actual));

                // 4.Liderazgo y sus niveles (Cuarta)
                steps.push({
                    element: '#Liderazgo',
                    popover: {
                        title: 'Liderazgo',
                        description: 'Guiar al equipo de trabajo, desarrollando sinergia entre sus miembros para alcanzar los objetivos, modelando con su ejemplo carisma y empatía, adaptándose a diferentes situaciones y personas.',
                        side: "top",
                        align: 'start'
                    }
                });
                steps.push(...createRatingSteps(4, 'Liderazgo', competencyDescriptions['Liderazgo'], estado_actual));
                

                // 5.  Desarrollo del Equipo de Trabajo y sus niveles (Quinta)
                steps.push({
                    element: '#Desarrollo',
                    popover: {
                        title: 'Desarrollo del Equipo de Trabajo',
                        description: 'Impulsar el proceso de formación y crecimiento profesional de sus colaboradores mediante iniciativas internas de aprendizaje, asignación de proyectos y coaching permanente de los mismos.',
                        side: "left",
                        align: 'end'
                    }
                });
                steps.push(...createRatingSteps(5, 'Desarrollo del Equipo de Trabajo', competencyDescriptions['Desarrollo del Equipo de Trabajo'], estado_actual));


                // Paso final: Enviar Evaluación
                steps.push({
                    element: '#enviar',
                    popover: {
                        title: 'Enviar Evaluación',
                        description: 'Una vez finalices la evaluación, haz clic aquí para enviarla. Asegúrate de haber completado todas las secciones.',
                        side: 'top',
                        align: 'center'
                    }
                });

                const driverObjModal = driver({
                    popoverClass: 'driverjs-theme',
                    showProgress: true,
                    steps: steps
                });

                driverObjModal.drive();
            });
        }
    }
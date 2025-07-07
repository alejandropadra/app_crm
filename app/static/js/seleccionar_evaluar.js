


/*
function initTransitions() {


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



    const seleccionarFicha = document.querySelector('.seleccionarFicha');
    const verificar = document.querySelector('.verificar');
    const continuarBtn = document.getElementById('continuarBtn');
    const volverBtn = document.getElementById('volverBtn');


    async function goToVerificar() {
        
        const select = document.querySelector('select[name="select"]');
        const selectedValue = select.value;
        console.log(selectedValue)
        if (!select.value) {
            alert('Por favor seleccione una ficha antes de continuar');
            return;
        }
        continuarBtn.disabled = true;
    
        seleccionarFicha.classList.add('slide-afuera');
        verificar.classList.add('slide-dentro');
        
        setTimeout(() => {
            continuarBtn.disabled = false;
        }, 600);

        let datos;
        try {
            datos = JSON.parse(document.getElementById('datosEvaluando').value);
        } catch (e) {
            console.error('Error al parsear JSON de datosEvaluando:', e);
            alert('Datos no válidos. No se puede continuar.');
            return;
        }

        const numericSelectedValue = parseInt(selectedValue, 10); 
        const resultado = datos.find(item => item.ficha_evaluado === numericSelectedValue);
        const selectedImage = document.getElementById('selectedImage');
        const TipoEvaluacion = document.getElementById('TipoEvaluacion');
        const NombreEvaluando = document.getElementById('NombreEvaluando');
        const departamentoDiv = document.getElementById('departamento');

        TipoEvaluacion.textContent= resultado.rol_evaluador[0]
        obtenerRutaFoto(resultado.ficha_evaluado, function(ruta) {
            if (selectedImage) {
                selectedImage.src = ruta;
            }
        });

        const data = await consultarFichaSAP(resultado.ficha_evaluado);
        nombre= toTitleCase(data.response_json[0].ename)
        const departamento = toTitleCase(data.response_json[0].orgtx)
        console.log(data.response_json[0])
        NombreEvaluando.textContent= nombre;
        departamentoDiv.textContent = departamento
        document.getElementById('tarjeta1').classList.add('active');
        

    }


    function goToSeleccionar() {
        volverBtn.disabled = true;
        seleccionarFicha.classList.remove('slide-afuera');
        verificar.classList.remove('slide-dentro');
        setTimeout(() => {
            volverBtn.disabled = false;
        }, 600);
    }

    continuarBtn.addEventListener('click', goToVerificar);
    volverBtn.addEventListener('click', goToSeleccionar);

    window.addEventListener('load', () => {
        seleccionarFicha.style.opacity = '1';
    });
}


document.addEventListener('DOMContentLoaded', initTransitions);


function addAdvancedAnimations() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}


document.addEventListener('DOMContentLoaded', addAdvancedAnimations);



async function consultarFichaSAP(ficha) {

    const url = '/app_crm/buscar_sap';
    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    try {
        const respuesta = await fetch(url, {
        method: 'POST', 
        headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken 
            },
        body: JSON.stringify({ ficha: ficha }), 
        });


        if (!respuesta.ok) {
        const errorData = await respuesta.json();
        throw new Error(errorData.message || `Error del servidor: ${respuesta.status}`);
        }

        return await respuesta.json();

    } catch (error) {

        console.error('Error al consultar la ficha:', error);
        throw error;
    }
}


function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}*/

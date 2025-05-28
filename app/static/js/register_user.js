let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
document.addEventListener('DOMContentLoaded', () => {

    const nombre = document.getElementById('nombre');
    const apellido = document.getElementById('apellido');
    const username = document.getElementById('username');

    
    const updateUsername = () => {
        username.value = `${nombre.value}_${apellido.value}`.toLowerCase();
        
    };

    if (nombre){
        nombre.addEventListener('input', updateUsername);
        apellido.addEventListener('input', updateUsername);
    }

});


document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const password = document.getElementById("password");
    
    const passwordConfirmar = document.getElementById("passwordConfirmar");
    password.required = false;
    passwordConfirmar.required = false;
    form.addEventListener("submit", function (event) {
        if (password.value !== passwordConfirmar.value) {
            event.preventDefault(); // Evita el envío del formulario
            alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
        }
    });
});


const fileInput = document.getElementById('file-input');

if (fileInput) {
    fileInput.addEventListener('change', function(event) {
        const files = event.target.files;

        if (files.length > 0) {
            const file = files[0]; // Solo tomamos el primer archivo

            if (file.type.startsWith('image/')) {
                // En lugar de crear elementos en una lista, actualizamos directamente la imagen existente
                const imagenEmpleado = document.getElementById('imagenEmpleado');
                
                if (imagenEmpleado) {
                    // Actualizar la fuente de la imagen al archivo seleccionado
                    imagenEmpleado.src = URL.createObjectURL(file);
                    imagenEmpleado.alt = file.name;
                }
            } else {
                alert('Por favor, carga solo archivos de imagen.');
                fileInput.value = "";
            }
        }
    });
}




async function buscarSAP() {
    let ficha = document.getElementById("ficha").value;

    if (!ficha) {
        alert("Por favor ingrese una ficha.");
        return;
    }

    try {
        const response = await fetch("/app_crm/buscar_sap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken 
            },
            body: JSON.stringify({ ficha: ficha }),
        });
        
        const data = await response.json();
        
        if (data.success) {
            let imgElement = document.getElementById("imagenEmpleado");
            const imagen_texto = document.getElementById('documentoTexto');
            
            if (data.imagen_disponible) {
                let rutaOriginal = data.ruta_imagen;
                let rutaFormateada = "";
                
                if (rutaOriginal.includes("img/fotos_personal")) {
                    let indice = rutaOriginal.indexOf("img/fotos_personal");
                    rutaFormateada = "/" + rutaOriginal.substring(indice);
                } else {
                    rutaFormateada = rutaOriginal;
                }
                
                imgElement.src = rutaOriginal;
                imagen_texto.value = rutaFormateada;
            } else {
                document.getElementById('divfile').classList.remove('hidden');
                imgElement.src = "/static/img/notfoundUser.png"; 
            }
            
            let sapData = data.response_json;
            console.log("Datos de SAP:", sapData);
            
            if (sapData && sapData.length > 0) {
                let nombreCompleto = sapData[0].ename;
                const partes = nombreCompleto.split(",");
                
                if (partes.length >= 2) {
                    const apellidos = partes[0].trim();
                    const primerApellido = apellidos.split(" ")[0];
                    const nombres = partes[1].trim();
                    const primerNombre = nombres.split(" ")[0];
                    
                    document.getElementById('nombre').value = nombres;
                    document.getElementById('apellido').value = apellidos;
                    
                    const username = document.getElementById('username');
                    username.value = `${primerNombre}_${primerApellido}`.toLowerCase();
                    
                    console.log("Primer Apellido:", primerApellido);
                    console.log("Primer Nombre:", primerNombre);
                    console.log("Nombres:", nombres);
                    console.log("Apellidos:", apellidos);
                }

                let nivel = sapData[0].nivel;
                document.getElementById('nivel').value = nivel;
                
                let filial = sapData[0].bukrs;
                let empresa = "";
                
                switch(filial) {
                    case '1000': empresa = "CORIMON C.A."; break;
                    case '1100': empresa = "CERDEX C.A."; break;
                    case '1200': empresa = "CORIMON PINTURAS C.A."; break;
                    case '1300': empresa = "MONTANA GRÁFICA C.A."; break;
                    case '1400': empresa = "RESIMON C.A."; break;
                    case '1500': empresa = "TIENDAS MONTANA C.A."; break;
                    case '1600': empresa = "PURAS PINTURAS VENEZOLANAS C.A."; break;
                    case '1900': empresa = "ENVACA C.A."; break;
                }
                
                let cargo = sapData[0].plstx || "";
                let dpto = sapData[0].orgtx || "";
                let supervisor = sapData[0].nombreSuperv || "";
                let fichaOrg = sapData[0].orgeh;
                
                document.getElementById('filial').value = empresa;
                if (cargo.length >= 24 || dpto.length >= 24) {
                    consultarCargoAdicional(ficha);
                }else{
                    document.getElementById('cargo').value = cargo;
                    document.getElementById('dpto').value = dpto;
                }

                document.getElementById('supervisor').value = supervisor;
                
                if (cargo.length >= 24 || dpto.length >= 24) {
                    
                    consultarCargoAdicional(ficha);
                }
                
                console.log("nivel:", nivel);
                console.log("filial:", empresa);
            }
        } else {
            alert("Error en consulta SAP: " + (data.message || "Respuesta sin datos"));
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Ocurrió un error en la consulta.");
    }
}

// Función auxiliar para consultar información adicional del cargo
async function consultarCargoAdicional(ficha) {
    try {

        console.log(`Consultando cargo adicional para ficha: ${ficha}`);
        
        const response = await fetch('/app_crm/consultarCargo', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify({ ficha: ficha })
        });

        if (!response.ok) {
            throw new Error(`Error al consultar el cargo: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const cargo = data.cargo;
            const departamento = data.departamento
            
            
            if (cargo) {
                document.getElementById('cargo').value = cargo;
            }
            
            if (departamento) {
                document.getElementById('dpto').value =departamento;
            }
            
        } else {
            throw new Error(data.message || "Respuesta sin éxito al consultar cargo");
        }
    } catch (error) {
        console.error("Error en la consulta del cargo:", error);

    }
}


document.addEventListener("DOMContentLoaded", function () {
    const buscarButton = document.getElementById("buscarSAP");
    if (buscarButton) {
        buscarButton.addEventListener("click", function (event) {
            event.preventDefault();
            buscarSAP();
        });
    }
});
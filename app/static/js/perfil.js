
function initClipboard(triggerSelector, targetSelector) {
    document.addEventListener("DOMContentLoaded", function () {
        const triggerButton = document.querySelector(triggerSelector);
        const targetElement = document.querySelector(targetSelector);
        
        if (triggerButton && targetElement) {
            triggerButton.addEventListener("click", function (event) {
                event.preventDefault(); // Evita que el botón active un submit si está dentro de un formulario
            });

            const clipboard = new ClipboardJS(triggerButton, {
                text: function () {
                    return targetElement.innerText || targetElement.value;
                }
            });

            clipboard.on('success', function (e) {
                e.clearSelection();
                
                // Para el tooltip al estilo antiguo
                const oldTooltip = triggerButton.querySelector('.tooltip');
                if (oldTooltip) {
                    oldTooltip.textContent = "Copied!";
                }
                
                // Para el tooltip al estilo Flowbite
                const tooltipId = triggerButton.getAttribute('data-tooltip-target');
                if (tooltipId) {
                    const flowbiteTooltip = document.getElementById(tooltipId);
                    if (flowbiteTooltip) {
                        const tooltipText = flowbiteTooltip.querySelector('.tooltip-text');
                        if (tooltipText) {
                            tooltipText.textContent = tooltipText.getAttribute('data-text-end') || "¡Copiado!";
                        }
                    }
                }
                
                // Cambiar los iconos
                const clipboardIcon = triggerButton.querySelector('.clipboard');
                const checkmarkIcon = triggerButton.querySelector('.checkmark');
                
                if (clipboardIcon && checkmarkIcon) {
                    clipboardIcon.style.display = "none";
                    checkmarkIcon.style.display = "block";
                }

                setTimeout(() => {
                    // Restaurar tooltip original
                    if (oldTooltip) {
                        oldTooltip.textContent = "Copiar";
                    }
                    
                    // Restaurar tooltip de Flowbite
                    if (tooltipId) {
                        const flowbiteTooltip = document.getElementById(tooltipId);
                        if (flowbiteTooltip) {
                            const tooltipText = flowbiteTooltip.querySelector('.tooltip-text');
                            if (tooltipText) {
                                tooltipText.textContent = tooltipText.getAttribute('data-text-initial') || "Copiar";
                            }
                        }
                    }
                    
                    // Restaurar iconos
                    if (clipboardIcon && checkmarkIcon) {
                        clipboardIcon.style.display = "block";
                        checkmarkIcon.style.display = "none";
                    }
                }, 2000); // Restaura el estado después de 2 segundos
            });

            clipboard.on('error', function () {
                console.error('Error al copiar el texto');
            });
        } else {
            console.error('Elementos no encontrados: Verifica los selectores.');
        }
    });
}

initClipboard('#copiarCorreo', '#correoUsuario');
initClipboard('#copiarTelefono', '#usuarioTelefono');


function createDropdown(toggleSelector, dropdownSelector) {
    const toggleElement = document.querySelector(toggleSelector);
    const dropdownElement = document.querySelector(dropdownSelector);

    if (toggleElement && dropdownElement) {

        toggleElement.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault()
            dropdownElement.classList.toggle('active');
        });


        document.addEventListener('click', (event) => {
            const isDropdownOpen = dropdownElement.classList.contains('active');

            if (isDropdownOpen && 
                !dropdownElement.contains(event.target) && 
                !toggleElement.contains(event.target)) {
                dropdownElement.classList.remove('active');
            }
        });
    } else {
        console.warn(`No se encontró el selector: ${toggleSelector} o ${dropdownSelector}`);
    }
}
createDropdown('#editar', '#nuevoTelefonoDiv');

document.addEventListener("DOMContentLoaded", function () {
    const variable = document.getElementById('usuarioTelefono')?.textContent;
    console.log(variable)
    if (variable) {
        document.getElementById("telefonoInput").value = variable;
    }
});

document.getElementById("actualizarTelefono").addEventListener("click", (e)=> {
    e.preventDefault()
    let nuevoTelefono = document.getElementById("nuevoTelefono").value;
    if (nuevoTelefono.trim() !== "") {

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

        fetch('/app_crm/actualizarTelefono', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken || ""
            },
            body: JSON.stringify({ telefono: nuevoTelefono })
        })
        .then(res => {
            if (!res.ok) throw new Error("Respuesta del servidor no OK");
            return res.json();
        })
        .then(response => {
            console.log("Respuesta:", response);
            if (response.success) {
                window.location.reload();
            } else {
                alert("Error del servidor: " + response.message);
            }
        })
        .catch(err => {
            console.error("Error en el envío:", err);
            alert("Ocurrió un error al enviar los datos.");
        });
    }
});


/*
document.addEventListener("DOMContentLoaded", function () {
    const password = document.getElementById('password');
    const passwordConfirmar = document.getElementById('passwordConfirmar');
    
});*/
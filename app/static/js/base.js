/*--------------------------- ----------------Aquí se encuentran los scripts involucrados con el layout------------------------------------------------------------------------*/
/*--------La idea es que sean scripts reutilizables involucrados con funcionalidades básicas y no especificas de ciertas vistas de la app----------------- */
/*---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- */

let editingRow = null; 



/* 

FUNCIÓN REUTILIZABLE PARA CREAR DROPDOWNS 
Explicación: Gestiona el active de un elemento del DOM, tras hacer click en un elemento

Parametros: 

°ToggleElement = Es el elemento padre que al hacer click en él, se desplegará el dropdown
°DropdownElement = Es el contenedor padre que aparecerá luego de dar click en el ToggleElement

*/

function createDropdown(toggleSelector, dropdownSelector) {
    const toggleElement = document.querySelector(toggleSelector);
    const dropdownElement = document.querySelector(dropdownSelector);

    if (toggleElement && dropdownElement) {

        toggleElement.addEventListener('click', (event) => {
            event.stopPropagation();
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

    }
}


createDropdown('#drop', '#down');
createDropdown('#noti', '#ficacion');
createDropdown('#evaluacion', '#select-evaluacion');



/* QUITAR EL COMENTARIO DESPUES
const boton = document.getElementById('boton_expandible');
const boton_contenedor = document.getElementById('boton_contenedor');
const closebtn = document.getElementById('close-btn');
const chatWrapper = document.getElementById('chat-wrapper');

boton.addEventListener('click', () => {
    boton_contenedor.classList.add('expandido');
    chatWrapper.classList.remove('hidden');
});

closebtn.addEventListener('click', () => {
    boton_contenedor.classList.remove('expandido');
    chatWrapper.classList.add('hidden');
});
*/



const tabla = document.getElementById('contenedor-table');

let isDown = false, startX, scrollLeft;

if (tabla) {
    tabla.addEventListener('mousedown', e => {
        isDown = true;
        tabla.classList.add('grabbing');
        startX    = e.pageX - tabla.offsetLeft;
        scrollLeft = tabla.scrollLeft;
    });

    tabla.addEventListener('mouseleave', () => { isDown = false; tabla.classList.remove('grabbing'); });
    tabla.addEventListener('mouseup',    () => { isDown = false; tabla.classList.remove('grabbing'); });

    tabla.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x    = e.pageX - tabla.offsetLeft;
        const walk = (x - startX) * 1.2;   
        tabla.scrollLeft = scrollLeft - walk;
    });
}

/*
ESTO ES PARA EL MENÚ DE NAVEGACIÓN
GESTIONA EL ABRIR Y CERRARLO
*/
const menuBtn = document.getElementById('abrir-cerrar');
const sideNav = document.getElementById('SideNav');
const content = document.getElementById('content');
const iconoFlecha = document.getElementById('icono-flecha');
const descripciones = document.querySelectorAll('.descripcion');
const descripcionesSubMenu = document.querySelectorAll('.descipcionesSubmenu'); 

menuBtn.addEventListener('click', () => {
    const isClosed = sideNav.classList.contains('cerrado');

    if (isClosed) {
        sideNav.classList.remove('w-[130px]'); 
        sideNav.classList.add('w-[17rem]'); 
        content.classList.remove('flex-1');
        content.classList.add('flex-[3]');
        iconoFlecha.style.transform = 'rotate(0deg)'; 

        descripciones.forEach(desc => desc.classList.remove('hidden'));
        descripcionesSubMenu.forEach(desc => desc.classList.remove('hidden'));

    } else {
        sideNav.classList.remove('w-[17rem]');
        sideNav.classList.add('w-[130px]'); 
        content.classList.remove('flex-[3]');
        content.classList.add('flex-1');
        iconoFlecha.style.transform = 'rotate(180deg)'; 

        descripciones.forEach(desc => desc.classList.add('hidden'));
        descripcionesSubMenu.forEach(desc => desc.classList.add('hidden'));
    }

    sideNav.classList.toggle('cerrado');
});






function toggleSubMenu(element) {
    const subMenu = element.querySelector('div.submenu'); 
    const divTexto = element.querySelector('a');
    const icon = element.querySelector('a span:last-child'); 
    const principal = document.getElementById('SideNav');
    const menuBtn = document.getElementById('abrir-cerrar');

    // Alternar el submenú
    if (subMenu.style.maxHeight === '0px' || subMenu.style.maxHeight === '') {
        subMenu.style.maxHeight = subMenu.scrollHeight + 'px'; 
    } else {
        subMenu.style.maxHeight = '0px'; 
    }

    icon.classList.toggle('rotate-180'); 
    divTexto.classList.toggle('text-rojo-crm');


    if (principal.classList.contains('cerrado')) {
        menuBtn.click(); 
    }
}







document.addEventListener("DOMContentLoaded", function () {
    const alertBoxes = document.querySelectorAll(".error-alert");
    const closeButtons = document.querySelectorAll(".close-btn");
    function ocultarAlerta(alertBox) {
        alertBox.classList.add("animate-fade-out-right");
        setTimeout(() => {
            alertBox.classList.add("hidden");
        }, 500); 
    }
    closeButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const alertBox = button.closest(".error-alert");
            if (alertBox) ocultarAlerta(alertBox);
        });
    });
    alertBoxes.forEach((alertBox) => {
        setTimeout(() => {
            ocultarAlerta(alertBox);
        }, 7000); // 7 segundos
    });
});



function animateElementsSequentially(elements,  animacion, delay = 200,) {
    elements.forEach((element, index) => {
        // Añadir un retraso en función del índice del elemento
        setTimeout(() => {
            element.classList.add(animacion);
        }, index * delay);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Selecciona los divs con la clase base
    const animationTabs = document.querySelectorAll('.opado');
    
    // Llama a la función de animación secuencial
    animateElementsSequentially(animationTabs, 'animate-fade-in-up');
});


function setupSequentialAnimation(selector, animationClass, delay = 300) {
    const elements = document.querySelectorAll(selector);
    animateElementsSequentially(elements, animationClass, delay);
}

document.addEventListener('DOMContentLoaded', () => {

    setupSequentialAnimation('.mi-nueva-clase', 'animate-slide-left');

});



const menuBtnResponsive = document.getElementById('menuBtnResponsive')
if (menuBtnResponsive){
    menuBtnResponsive.addEventListener('click', ()=>{
        console.log('as')
    })
}
























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
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-alert-icon lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`;
    } else {
        iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-icon lucide-check"><path d="M20 6 9 17l-5-5"/></svg>`;
    }
    
    // Contenido del mensaje
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
    
    // Botón de cerrar
    const closeButton = document.createElement('button');
    closeButton.className = 'flex close-btn';
    
    const closeIconContainer = document.createElement('div');
    closeIconContainer.className = category === 'error'
        ? 'text-[#d65563] bg-white/5 backdrop-blur-xl p-1 rounded-lg'
        : 'text-[#4caf50] bg-white/5 backdrop-blur-xl p-1 rounded-lg';
    
    const closeIconSpan = document.createElement('span');
    closeIconSpan.className = 'material-symbols-rounded';
    closeIconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
    
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
        alertContainer.classList.add("animate-fade-out-right")
        setTimeout(() => {
            document.body.removeChild(alertContainer);
        }, 300);
    });
    
    setTimeout(() => {
        alertContainer.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
            document.body.removeChild(alertContainer);
            }
        }, 300);
        }, 5000);
    }









function showAlertGrandes(message, category = 'success') {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'fixed top-5 z-[100000] animate-fade-in-up left-[35%] transform -translate-x-1/2';
    
    const alertWrapper = document.createElement('div');
    alertWrapper.className = 'flex flex-col gap-2 w-auto max-w-md sm:max-w-lg text-[10px] sm:text-xs';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'error-alert cursor-default flex items-start w-full min-h-12 sm:min-h-14 rounded-lg bg-azul-dark px-[10px] py-3';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex gap-3 items-start justify-between w-full';
    
    // Contenedor del icono (fijo en la parte superior)
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
    
    // Contenido del mensaje (expandible)
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
    
    // Botón de cerrar (fijo en la esquina superior)
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
    
    // Ensamblar los elementos
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
    
    // Agregar al DOM
    document.body.appendChild(alertContainer);
    
    // Animación de entrada
    setTimeout(() => {
        alertContainer.style.opacity = '1';
    }, 10);
    
    // Event listener para cerrar
    closeButton.addEventListener('click', () => {
        alertContainer.style.opacity = '0';
        alertContainer.classList.add("animate-fade-out-right");
        setTimeout(() => {
            if (document.body.contains(alertContainer)) {
                document.body.removeChild(alertContainer);
            }
        }, 300);
    });
    
    // Auto-cerrar después de 8 segundos (más tiempo para mensajes largos)
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










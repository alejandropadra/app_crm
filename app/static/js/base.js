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
        console.warn(`No se encontró el selector: ${toggleSelector} o ${dropdownSelector}`);
    }
}


createDropdown('#drop', '#down');
createDropdown('#noti', '#ficacion');




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











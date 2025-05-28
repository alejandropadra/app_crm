document.addEventListener('DOMContentLoaded', function () {
    const botonEditar = document.getElementById('botonEditar');
    const ficha_get = document.getElementById('ficha_get').value;
    const rutaDestino = `/app_crm/gdd/gestion_equipo/${ficha_get}`;

    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

    botonEditar.addEventListener('click', function (event) {
        event.preventDefault();

        const payload = [];  
        let haySeleccionado = false;

        const filas = document.querySelectorAll('#indicadorTable tbody tr');

        filas.forEach((fila) => {
            const checkbox = fila.querySelector('input[type="checkbox"]');
            const select = fila.querySelector('select');
            const indicador = fila.cells[1].textContent.trim();
            const rawId = fila.cells[11].textContent;
            const id = parseInt(rawId.replace(/\D/g, ""), 10);

            if (checkbox && checkbox.checked && select) {
                payload.push({
                    id: id,
                    nombre_indicador : indicador, 
                    aprobacion: select.value  
                });
                haySeleccionado = true;
            }
        });

        if (!haySeleccionado) {
            alert('Por favor selecciona al menos un indicador a editar.');
            return;
        }

        console.log('Payload a enviar:', payload);

        fetch(rutaDestino, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken
            },
            body: JSON.stringify(payload)  
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud');
            }
            return response.json();
        })
        .then(result => {
            console.log('Respuesta del servidor:', result);
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            window.location.reload();
        });
    });




    document.querySelectorAll('#editarStatus').forEach(btn => {
        btn.addEventListener('click', function () {
          // Encuentra el div#respuesta más cercano al botón
            const respuestaDiv = btn.closest('td').querySelector('#respuesta');
            if (!respuestaDiv) return;
    
            const span = respuestaDiv.querySelector('span');
            const select = respuestaDiv.querySelector('select');
        
            if (span && select) {
                // Alternar clases
                const spanIsHidden = span.classList.contains('hidden');
        
                if (spanIsHidden) {
                span.classList.remove('hidden');
                select.classList.add('hidden');
                } else {
                span.classList.add('hidden');
                select.classList.remove('hidden');
                }
            }
        });
    });
});


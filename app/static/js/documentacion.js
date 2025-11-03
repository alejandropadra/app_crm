document.addEventListener('DOMContentLoaded', function() {
    const radio1 = document.getElementById('radio-1');
    const radio2 = document.getElementById('radio-2');
    const videoElement = document.getElementById('video2'); 

    const videosWrapper = document.getElementById('videos-wrapper-slider');
    const indicadoresContent = document.getElementById('indicadores-content');
    const competenciasContent = document.getElementById('competencias-content');

    function stopVideo(container) {
        const video = container.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0; 
        }
    }

    function updateSlider() {
        if (radio1.checked) {
            videosWrapper.classList.remove('show-competencias');
            stopVideo(competenciasContent); 
        } else if (radio2.checked) {
            videosWrapper.classList.add('show-competencias');
            stopVideo(indicadoresContent); 
            
            if (videoElement) { 
                videoElement.play();
            }
        }
    }

    updateSlider();

    radio1.addEventListener('change', updateSlider);
    radio2.addEventListener('change', updateSlider);


});
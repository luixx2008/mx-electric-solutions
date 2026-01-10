 // Inicializar todo cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            initGalleries();
            initLightbox();
            initParallax();
            initSmoothScroll();
            initWeb3Forms();
        });

        // Carga diferida de recursos no críticos
        function loadNonCriticalResources() {
            // Cargar imágenes de galería con lazy loading
            const images = document.querySelectorAll('.gallery-image');
            images.forEach(img => {
                img.loading = 'lazy';
            });

            // Cargar fuentes no críticas
            const link = document.createElement('link');
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
            link.rel = 'stylesheet';
            link.media = 'print';
            link.onload = () => { link.media = 'all'; };
            document.head.appendChild(link);
        }

        // Ejecutar después de que la página cargue
        if (document.readyState === 'complete') {
            loadNonCriticalResources();
        } else {
            window.addEventListener('load', loadNonCriticalResources);
        }

        // Galerías de proyectos
        // En tu archivo script.js, reemplaza initGalleries() con esta versión:
function initGalleries() {
    const galleries = document.querySelectorAll('.project-gallery');
    
    galleries.forEach((gallery) => {
        const track = gallery.querySelector('.gallery-track');
        const images = gallery.querySelectorAll('.gallery-image');
        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        
        let currentIndex = 0;
        const totalImages = images.length;
        
        // Configurar dimensiones
        track.style.width = `${totalImages * 100}%`;
        images.forEach(img => {
            img.style.width = `${100 / totalImages}%`;
        });
        
        // Lazy loading para imágenes
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (!img.classList.contains('loaded')) {
                        img.classList.add('loaded');
                    }
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
        
        // Navegación
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
            updateGallery();
        });
        
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
            updateGallery();
        });
        
        function updateGallery() {
            const translateX = -currentIndex * (100 / totalImages);
            track.style.transform = `translateX(${translateX}%)`;
        }
        
        updateGallery();
    });
}
        

        // Lightbox para imágenes
        function initLightbox() {
            // Crear el lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-nav lightbox-prev">&#10094;</button>
                <img class="lightbox-content">
                <button class="lightbox-nav lightbox-next">&#10095;</button>
            `;
            document.body.appendChild(lightbox);
            
            let currentLightboxIndex = 0;
            let currentLightboxImages = [];
            
            // Abrir lightbox al hacer clic en una imagen
            document.addEventListener('click', function(e) {
                if (e.target.classList.contains('gallery-image')) {
                    const gallery = e.target.closest('.project-gallery');
                    const images = Array.from(gallery.querySelectorAll('.gallery-image'));
                    currentLightboxImages = images;
                    currentLightboxIndex = images.indexOf(e.target);
                    
                    openLightbox();
                }
            });
            
            // Cerrar lightbox
            lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) closeLightbox();
            });
            
            // Navegación lightbox
            lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
                currentLightboxIndex = (currentLightboxIndex > 0) ? currentLightboxIndex - 1 : currentLightboxImages.length - 1;
                updateLightbox();
            });
            
            lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
                currentLightboxIndex = (currentLightboxIndex < currentLightboxImages.length - 1) ? currentLightboxIndex + 1 : 0;
                updateLightbox();
            });
            
            // Navegación con teclado
            document.addEventListener('keydown', function(e) {
                if (lightbox.classList.contains('active')) {
                    if (e.key === 'Escape') closeLightbox();
                    if (e.key === 'ArrowLeft') lightbox.querySelector('.lightbox-prev').click();
                    if (e.key === 'ArrowRight') lightbox.querySelector('.lightbox-next').click();
                }
            });
            
            function openLightbox() {
                updateLightbox();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            
            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            function updateLightbox() {
                const lightboxImg = lightbox.querySelector('.lightbox-content');
                lightboxImg.src = currentLightboxImages[currentLightboxIndex].src;
                lightboxImg.alt = currentLightboxImages[currentLightboxIndex].alt;
            }
        }

        // Efecto parallax para los hexágonos del fondo
        function initParallax() {
            document.addEventListener('scroll', function() {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.hexagon');
                
                parallaxElements.forEach(function(element, index) {
                    const speed = 0.1 + (index * 0.05);
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.02}deg)`;
                });
            });
        }

        // Navegación suave
        function initSmoothScroll() {
            document.querySelectorAll('nav a, .cta-button').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    if (this.getAttribute('href').startsWith('#')) {
                        e.preventDefault();
                        
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);
                        
                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });
        }

        // Integración con Web3Forms
        function initWeb3Forms() {
            const form = document.getElementById('quoteForm');
            const formMessage = document.getElementById('formMessage');
            const submitButton = document.getElementById('submitButton');
            const originalButtonText = submitButton.textContent;
            
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Cambiar el texto del botón y deshabilitarlo
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                try {
                    const formData = new FormData(form);
                    
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        // Mostrar mensaje de éxito
                        formMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                        formMessage.className = 'form-message success';
                        form.reset();
                    } else {
                        throw new Error('Form submission failed');
                    }
                } catch (error) {
                    // Mostrar mensaje de error
                    formMessage.textContent = 'Sorry, there was an error sending your message. Please try again later.';
                    formMessage.className = 'form-message error';
                } finally {
                    // Restaurar el botón
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    
                    // Ocultar el mensaje después de 5 segundos
                    setTimeout(() => {
                        formMessage.style.display = 'none';
                    }, 5000);
                }
            });
        }
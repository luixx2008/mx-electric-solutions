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
function initGalleries() {
    const galleries = document.querySelectorAll('.project-gallery');
    
    galleries.forEach((gallery) => {
        const track = gallery.querySelector('.gallery-track');
        const images = gallery.querySelectorAll('.gallery-image');
        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        
        if (!track || !prevBtn || !nextBtn) return;
        
        let currentIndex = 0;
        const totalImages = images.length;
        
        // Configurar dimensiones FIJAS para evitar CLS
        track.style.width = `${totalImages * 100}%`;
        images.forEach(img => {
            img.style.width = `${100 / totalImages}%`;
        });
        
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
        
        // Touch/swipe para móviles
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    // Swipe izquierda = siguiente
                    nextBtn.click();
                } else {
                    // Swipe derecha = anterior
                    prevBtn.click();
                }
            }
        }
        
        updateGallery();
    });
}


function optimizeImageLoading() {
    const images = document.querySelectorAll('.gallery-image');
    
    images.forEach(img => {
        const originalSrc = img.src;
        
        // Determinar tamaño óptimo basado en el viewport
        const viewportWidth = window.innerWidth;
        let optimalWidth;
        
        if (viewportWidth < 768) {
            optimalWidth = 400; // Móvil
        } else if (viewportWidth < 1024) {
            optimalWidth = 800; // Tablet
        } else {
            optimalWidth = 1200; // Desktop
        }
        
        // Si la imagen es muy grande, crear una versión optimizada en el momento
        if (img.naturalWidth > optimalWidth * 1.5) {
            // Crear un canvas para redimensionar
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const imgElement = new Image();
            imgElement.crossOrigin = 'anonymous';
            imgElement.src = originalSrc;
            
            imgElement.onload = function() {
                const aspectRatio = imgElement.height / imgElement.width;
                canvas.width = optimalWidth;
                canvas.height = optimalWidth * aspectRatio;
                
                ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
                
                // Reemplazar con imagen optimizada
                img.src = canvas.toDataURL('image/webp', 0.8);
                img.classList.add('optimized');
            };
        }
    });
}

// ========== OPTIMIZACIÓN DE ENTREGA DE IMÁGENES ==========
function optimizeImageDelivery() {
    // Usar lazysizes si está disponible
    if (window.lazySizes) {
        window.lazySizes.init();
    } else {
        // Fallback: cargar imágenes cuando sean visibles
        const images = document.querySelectorAll('.gallery-image[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('lazyloaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px', // Cargar 100px antes de que sea visible
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Precargar imágenes importantes
    const criticalImages = [
        'logo.webp',
        'docs/suPics/su1.webp'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
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
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') return;
                    
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        const headerHeight = document.querySelector('header').offsetHeight;
                        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        }

        // Integración con Web3Forms
        function initWeb3Forms() {
        const form = document.getElementById('quoteForm');
            if (!form) return;
            
            const submitButton = document.getElementById('submitButton');
            const formMessage = document.getElementById('formMessage');
            const originalText = submitButton.textContent;
            
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Validación
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                // Cambiar estado del botón
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                submitButton.setAttribute('aria-busy', 'true');
                
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
                        // Éxito
                        showMessage('Thank you! We will contact you soon.', 'success');
                        form.reset();
                    } else {
                        throw new Error(result.message || 'Submission failed');
                    }
                } catch (error) {
                    // Error
                    showMessage('Error sending message. Please call us directly.', 'error');
                    console.error('Form error:', error);
                } finally {
                    // Restaurar botón
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.removeAttribute('aria-busy');
                }
            });
            
            function showMessage(text, type) {
                if (!formMessage) return;
                
                formMessage.textContent = text;
                formMessage.className = `form-message ${type}`;
                formMessage.style.display = 'block';
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }
        }
        // Registrar métricas
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            console.log(`🚀 Page loaded in ${loadTime}ms`);
            
            // Registrar métricas Core Web Vitals
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`🎨 LCP: ${Math.round(entry.startTime)}ms`);
                    }
                    if (entry.entryType === 'layout-shift') {
                        if (!entry.hadRecentInput) {
                            console.log(`📐 CLS: ${entry.value.toFixed(3)}`);
                        }
                    }
                }
            }).observe({ 
                type: ['largest-contentful-paint', 'layout-shift'], 
                buffered: true 
            });
        }, 1000);
    });
}
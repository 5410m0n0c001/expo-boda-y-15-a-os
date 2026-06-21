document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const preloader = document.getElementById('preloader');
    const btnEnter = document.getElementById('btnEnter');
    const bgAudio = document.getElementById('bgAudio');
    const reveals = document.querySelectorAll('.reveal');

    // Preloader Entrance
    const indexPasswordInput = document.getElementById('indexPasswordInput');
    const indexPasswordError = document.getElementById('indexPasswordError');
    
    // Check if already authenticated in this session
    if (sessionStorage.getItem('exhibitor_authenticated') === 'true') {
        if (preloader) {
            preloader.classList.add('fade-out');
        }
        // Attempt to play audio
        startAudio();
    }
    
    function attemptEnter() {
        if (indexPasswordInput && indexPasswordInput.value.trim() === 'PrimaveraVIP') {
            sessionStorage.setItem('exhibitor_authenticated', 'true');
            preloader.classList.add('fade-out');
            startAudio();
        } else if (indexPasswordInput) {
            indexPasswordError.style.display = 'block';
            indexPasswordInput.style.border = '2px solid #ff6b6b';
            indexPasswordInput.value = '';
            indexPasswordInput.focus();
        } else {
            // Fallback en caso de que no exista el input (no debería pasar)
            sessionStorage.setItem('exhibitor_authenticated', 'true');
            preloader.classList.add('fade-out');
            startAudio();
        }
    }

    if (btnEnter) {
        btnEnter.addEventListener('click', attemptEnter);
    }
    
    if (indexPasswordInput) {
        indexPasswordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptEnter();
            }
        });
        
        indexPasswordInput.addEventListener('input', () => {
            indexPasswordError.style.display = 'none';
            indexPasswordInput.style.border = 'none';
        });
    }

    // Audio Logic
    function startAudio() {
        if (!bgAudio) return;
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playing');
            }).catch(error => {
                console.log('Playback prevented');
            });
        }
    }

    // Fallback interaction listeners for autoplay blocks
    const playOnInteraction = () => {
        startAudio();
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('keydown', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
    };
    document.addEventListener('click', playOnInteraction);
    document.addEventListener('keydown', playOnInteraction);
    document.addEventListener('touchstart', playOnInteraction);

    // Robust Hack: If a video "steals" the audio focus and the browser pauses it,
    // we force it to resume immediately.
    if (bgAudio) {
        bgAudio.addEventListener('pause', function() {
            if (!bgAudio.ended) {
                bgAudio.play().catch(e => console.log('Could not resume audio:', e));
            }
        });
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -20px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach((reveal) => {
        revealObserver.observe(reveal);
    });

    // FAB Groups Toggle Logic
    const fabGroups = document.querySelectorAll('.fab-group');
    fabGroups.forEach(group => {
        const btn = group.querySelector('.fab-main');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other group if open
                fabGroups.forEach(other => {
                    if (other !== group) other.classList.remove('active');
                });
                group.classList.toggle('active');
            });
        }
    });

    // Share Logic
    const btnShare = document.getElementById('btnShare');
    // [EDITABLE - TEXTOS COMPARTIR] Estos son los textos predeterminados que aparecen cuando alguien toca el botón "Compartir" en dispositivos móviles.
    let shareUrl = window.location.href;
    if (shareUrl.startsWith('file://') || shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1')) {
        shareUrl = 'https://5410m0n0c001.github.io/expo-boda-y-15-a-os/';
    }
    const shareData = {
        title: 'Expositores: Expo Boda y 15 Años | Centro de Convenciones Presidente',
        text: '¡Hola! Te comparto la información exclusiva para expositores de la Expo Boda y 15 Años. Únete a la exhibición más prestigiosa.',
        url: shareUrl
    };

    if (btnShare) {
        btnShare.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent closing other menus immediately
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('Error sharing:', err);
                    }
                }
            } else {
                // Fallback: Copy to Clipboard
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('¡Enlace copiado al portapapeles! Ya puedes compartirlo.');
                } catch (err) {
                    console.error('Clipboard failed:', err);
                }
            }
        });
    }

    // Publications Dropdown Logic
    const btnPublications = document.getElementById('btnPublications');
    const publicationsMenu = document.getElementById('publicationsMenu');

    if (btnPublications && publicationsMenu) {
        btnPublications.addEventListener('click', (e) => {
            e.stopPropagation();
            publicationsMenu.classList.toggle('active');
        });
    }

    // Close menus on click outside
    document.addEventListener('click', () => {
        fabGroups.forEach(group => group.classList.remove('active'));
        if (publicationsMenu) {
            publicationsMenu.classList.remove('active');
        }
    });

    // 3D Swiper Album Logic
    const albumTrack = document.getElementById('albumTrack');
    // [EDITABLE - GALERÍA DE IMÁGENES] Agrega, elimina o reemplaza las imágenes de la galería 3D.
    // Tamaño recomendado por imagen: 500x500px o 800x800px (Proporción Cuadrada 1:1) - Formato JPG/PNG.
    // Asegúrate de que las rutas 'src' coincidan con tus archivos en la carpeta 'assets'.
    const galleryImages = [
        { src: 'assets/banquetes.png', caption: 'Banquetes Primavera' },
        { src: 'assets/expo1.png', caption: 'Montaje de Gala' },
        { src: 'assets/expo2.png', caption: 'Decoración Floral' },
        { src: 'assets/expo3.png', caption: 'Iluminación Ambiental' },
        { src: 'assets/expo4.png', caption: 'Banquete Premium' },
        { src: 'assets/expo5.png', caption: 'Mesa de Postres' },
        { src: 'assets/expo6.png', caption: 'Momentos Especiales' },
        { src: 'assets/expo_new1.png', caption: 'Elegancia y Diseño' },
        { src: 'assets/expo_new2.png', caption: 'Boda Espectacular' },
        { src: 'assets/expo_new3.png', caption: 'Celebración Inolvidable' },
        { src: 'assets/expo_new4.png', caption: 'Detalles Únicos' },
        { src: 'assets/expo_new5.png', caption: 'Momentos Mágicos' },
        { src: 'assets/expo_new6.png', caption: 'Brillo de la Noche' },
        { src: 'assets/expo_new7.png', caption: 'Pasión por los Eventos' },
        { src: 'assets/expo_new8.png', caption: 'Diseño Exclusivo' },
        { src: 'assets/expo_new9.png', caption: 'Detalles que Enamoran' },
        { src: 'assets/anp.png', caption: 'Sabor y Estilo' },
        { src: 'assets/coverv.png', caption: 'Tu Boda Ideal' },
        { src: 'assets/rr.jpg', caption: 'Diseño y Distinción' },
        { src: 'assets/logo_presidente.png', caption: 'Centro de Convenciones Presidente' },
        { src: 'assets/init.png', caption: 'Init Concept' }
    ];

    // [EDITABLE - GALERÍA DE LOGOS] Agrega, elimina o reemplaza las imágenes de logotipos.
    const logoImages = [
        { src: 'assets/vcm.png', caption: 'Viajando con la Música (VCM)' },
        { src: 'assets/logo_new1.png', caption: 'La Princesa Paletería' },
        { src: 'assets/logo_new2.png', caption: 'Licky Baut Photo' },
        { src: 'assets/logo_new3.png', caption: 'Tequila Personalizado Don Ramón' },
        { src: 'assets/logo_new4.png', caption: 'Aby Decora' },
        { src: 'assets/logo_new5.png', caption: 'Academia de Baile Dance Queens' },
        { src: 'assets/logo_new6.png', caption: 'Banquetes Delicatessen' },
        { src: 'assets/logo_new7.png', caption: 'DJ & Proyecciones' },
        { src: 'assets/logo_new8.png', caption: 'Corona Music' },
        { src: 'assets/logo_new9.png', caption: 'Kataleya Florist' },
        { src: 'assets/logo_new10.png', caption: 'Arreglos Florales' },
        { src: 'assets/logo_new11.png', caption: 'Invitaciones Elegantes' },
        { src: 'assets/logo_new12.jpeg', caption: 'Mariachi Xiuhtépetl' },
        { src: 'assets/logo_new13.png', caption: 'Iluminación Led' },
        { src: 'assets/logo_new14.png', caption: 'Cabina de Fotos' },
        { src: 'assets/logo_new15.png', caption: 'Barra de Postres' },
        { src: 'assets/logo_new16.png', caption: 'Saxofonista Solista' },
        { src: 'assets/logo_new17.png', caption: 'Mía Concept Store' },
        { src: 'assets/logo_new18.jpeg', caption: 'Coreografías Bailes y Vals David' },
        { src: 'assets/logo_new19.png', caption: 'Scanner DJ' },
        { src: 'assets/logo_andrea_lozano.jpg', caption: 'Andrea Lozano Beauty Salon' }
    ];

    if (albumTrack) {
        galleryImages.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            slide.style.backgroundImage = `url('${img.src}')`;
            slide.innerHTML = `<div class="slide-blur-overlay"></div><img src="${img.src}" alt="${img.caption}" data-index="${index}">`;
            albumTrack.appendChild(slide);
        });
    }

    const logosTrack = document.getElementById('logosTrack');
    if (logosTrack) {
        logoImages.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            slide.style.backgroundImage = `url('${img.src}')`;
            slide.innerHTML = `<div class="slide-blur-overlay"></div><img src="${img.src}" alt="${img.caption}" data-index="${index}">`;
            logosTrack.appendChild(slide);
        });
    }

    if (albumTrack) {
        const swiper = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            observer: true,
            observeParents: true,
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".mySwiper .swiper-pagination",
                clickable: true
            },
            navigation: {
                nextEl: ".mySwiper .swiper-button-next",
                prevEl: ".mySwiper .swiper-button-prev",
            },
        });
    }

    if (logosTrack) {
        const logosSwiper = new Swiper(".myLogosSwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            observer: true,
            observeParents: true,
            coverflowEffect: {
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
            },
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".myLogosSwiper .swiper-pagination",
                clickable: true
            },
            navigation: {
                nextEl: ".myLogosSwiper .swiper-button-next",
                prevEl: ".myLogosSwiper .swiper-button-prev",
            },
        });
    }

        // Lightbox Logic
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const captionText = document.getElementById('caption');
        const closeBtn = document.querySelector('.close-lightbox');

        document.querySelectorAll('.swiper-slide img').forEach(img => {
            img.addEventListener('click', () => {
                lightbox.style.display = 'block';
                lightboxImg.src = img.src;
                captionText.innerHTML = img.alt;
            });
        });

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.style.display = 'none';
        });

        // Download Action
        document.getElementById('btnDownload').addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = lightboxImg.src;
            link.download = 'Expo_Boda_Momentos.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        // Share Action for Lightbox
        document.getElementById('btnShareImg').addEventListener('click', async () => {
            let shareUrl = window.location.href;
            if (shareUrl.startsWith('file://') || shareUrl.includes('localhost') || shareUrl.includes('127.0.0.1')) {
                shareUrl = 'https://5410m0n0c001.github.io/expo-boda-y-15-a-os/';
            }
            const shareData = {
                title: 'Mira este momento de la Expo Boda',
                text: captionText.innerHTML,
                url: shareUrl
            };
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {
                    if (err.name !== 'AbortError') console.error('Error sharing image:', err);
                }
            } else {
                try {
                    await navigator.clipboard.writeText(shareUrl);
                    alert('¡Enlace copiado al portapapeles!');
                } catch (err) {
                    console.error('Clipboard failed:', err);
                }
            }
        });

    // Parallax Effect for Hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrollValue = window.pageYOffset;
            hero.style.backgroundPositionY = (scrollValue * 0.5) + 'px';
        });
    }
});

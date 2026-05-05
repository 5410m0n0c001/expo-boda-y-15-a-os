document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const preloader = document.getElementById('preloader');
    const btnEnter = document.getElementById('btnEnter');
    const bgAudio = document.getElementById('bgAudio');
    const reveals = document.querySelectorAll('.reveal');

    // Preloader Entrance
    btnEnter.addEventListener('click', function() {
        preloader.classList.add('fade-out');
        
        // Start Audio
        startAudio();
    });

    // Audio Logic
    function startAudio() {
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Audio playing');
            }).catch(error => {
                console.log('Playback prevented');
            });
        }
    }

    // Robust Hack: If a video "steals" the audio focus and the browser pauses it,
    // we force it to resume immediately.
    bgAudio.addEventListener('pause', function() {
        if (!bgAudio.ended) {
            bgAudio.play().catch(e => console.log('Could not resume audio:', e));
        }
    });

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
    const shareData = {
        title: 'Expositores: Expo Boda y 15 Años | Centro de Convenciones Presidente',
        text: '¡Hola! Te comparto la información exclusiva para expositores de la Expo Boda y 15 Años. Únete a la exhibición más prestigiosa.',
        url: window.location.href
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
                    await navigator.clipboard.writeText(window.location.href);
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
    const galleryImages = [
        { src: 'assets/expo1.png', caption: 'Montaje de Gala' },
        { src: 'assets/expo2.png', caption: 'Decoración Floral' },
        { src: 'assets/expo3.png', caption: 'Iluminación Ambiental' },
        { src: 'assets/expo4.png', caption: 'Banquete Premium' },
        { src: 'assets/expo5.png', caption: 'Mesa de Postres' },
        { src: 'assets/expo6.png', caption: 'Momentos Especiales' },
        { src: 'assets/logo_presidente.png', caption: 'Centro de Convenciones Presidente' },
        { src: 'assets/init.png', caption: 'Init Concept' }
    ];

    if (albumTrack) {
        galleryImages.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            slide.innerHTML = `<img src="${img.src}" alt="${img.caption}" data-index="${index}">`;
            albumTrack.appendChild(slide);
        });

        const swiper = new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
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
                el: ".swiper-pagination",
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });

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
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Mira este momento de la Expo Boda',
                        text: captionText.innerHTML,
                        url: window.location.href
                    });
                } catch (err) {
                    console.error('Error sharing image:', err);
                }
            }
        });
    }

    // Parallax Effect for Hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrollValue = window.pageYOffset;
            hero.style.backgroundPositionY = (scrollValue * 0.5) + 'px';
        });
    }
});

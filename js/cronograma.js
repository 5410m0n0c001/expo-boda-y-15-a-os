document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const overlay = document.getElementById('passwordOverlay');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError = document.getElementById('passwordError');
    
    // Auth Check
    if (sessionStorage.getItem('exhibitor_authenticated') === 'true') {
        if (overlay) overlay.style.display = 'none';
        initSchedule();
    } else {
        if (passwordSubmit) {
            passwordSubmit.addEventListener('click', checkPassword);
        }
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') checkPassword();
            });
            passwordInput.addEventListener('input', () => {
                passwordError.style.display = 'none';
                passwordInput.style.borderColor = 'var(--beige)';
            });
        }
    }

    function checkPassword() {
        if (passwordInput && passwordInput.value.trim() === 'PrimaveraVIP') {
            sessionStorage.setItem('exhibitor_authenticated', 'true');
            if (overlay) {
                overlay.classList.add('hidden');
                setTimeout(() => { overlay.style.display = 'none'; }, 500);
            }
            initSchedule();
        } else if (passwordInput) {
            passwordError.style.display = 'block';
            passwordInput.style.borderColor = '#e74c3c';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Schedule Initialization
    function initSchedule() {
        console.log("Schedule initialized");
        
        // Background Audio Playback
        const bgAudio = document.getElementById('bgAudio');
        if (bgAudio) {
            bgAudio.play().catch(() => {
                // If browser blocks autoplay, play on first click
                document.addEventListener('click', () => {
                    bgAudio.play().catch(e => console.log('Audio error:', e));
                }, { once: true });
            });
        }
        
        // Scroll Reveal Animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-animation');
                    timelineObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const timelineContents = document.querySelectorAll('.timeline-content');
        timelineContents.forEach(content => {
            timelineObserver.observe(content);
        });

        // Filter Logic
        const filterBtns = document.querySelectorAll('.filter-btn');
        const timelineItems = document.querySelectorAll('.timeline-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                timelineItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = 'flex';
                        // Re-trigger scroll reveal if it wasn't visible
                        const content = item.querySelector('.timeline-content');
                        if (content && !content.classList.contains('reveal-animation')) {
                            content.classList.add('reveal-animation');
                        }
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Interactive Simulation Clock Logic
        const toggleRealtime = document.getElementById('toggleRealtime');
        const timeSlider = document.getElementById('timeSlider');
        const clockTimeDisplay = document.getElementById('clockTimeDisplay');
        const pulseDot = document.getElementById('pulseDot');
        const clockModeText = document.getElementById('clockModeText');

        let isRealtime = true;
        let clockInterval;

        // Convert HH:MM string to minutes since midnight
        function timeToMinutes(timeStr) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        }

        // Convert minutes since midnight to HH:MM format (12-hour with AM/PM)
        function minutesToTimeString(minutes) {
            let hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            const minsStr = mins < 10 ? '0' + mins : mins;
            return `${hours}:${minsStr} ${ampm}`;
        }

        // Update schedule item states based on active minutes
        function updateTimelineStates(currentMinutes) {
            timelineItems.forEach(item => {
                const startTimeStr = item.getAttribute('data-start');
                const endTimeStr = item.getAttribute('data-end');

                if (!startTimeStr) return;

                const startMinutes = timeToMinutes(startTimeStr);
                const endMinutes = endTimeStr ? timeToMinutes(endTimeStr) : (startMinutes + 60); // Default duration 1 hour if no end

                const statusBadge = item.querySelector('.status-badge');
                
                // Clear old classes
                item.classList.remove('item-live', 'item-past', 'item-upcoming');

                if (currentMinutes < startMinutes) {
                    item.classList.add('item-upcoming');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge upcoming';
                        statusBadge.innerHTML = '<i class="fa-regular fa-clock"></i> Siguiente';
                    }
                } else if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                    item.classList.add('item-live');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge live';
                        statusBadge.innerHTML = '<i class="fa-solid fa-circle-play"></i> En Vivo 🔴';
                    }
                } else {
                    item.classList.add('item-past');
                    if (statusBadge) {
                        statusBadge.className = 'status-badge completed';
                        statusBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Completado';
                    }
                }
            });
        }

        function handleTimeChange(minutes) {
            clockTimeDisplay.textContent = minutesToTimeString(minutes);
            updateTimelineStates(minutes);
        }

        function syncSliderToTime(minutes) {
            // Slider range is 11:30 (690 mins) to 20:30 (1230 mins)
            if (timeSlider) {
                timeSlider.value = minutes;
            }
        }

        function updateRealtimeClock() {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentMins = hours * 60 + minutes;

            handleTimeChange(currentMins);
            syncSliderToTime(currentMins);

            // Check if current time is outside the expo operating hours (12:00 PM - 8:30 PM)
            if (currentMins < 720 || currentMins > 1230) {
                clockModeText.innerHTML = '<span class="pulse-dot"></span> Tiempo Real (Fuera de Horario)';
            } else {
                clockModeText.innerHTML = '<span class="pulse-dot"></span> En Vivo ahora';
            }
        }

        if (toggleRealtime) {
            toggleRealtime.addEventListener('change', (e) => {
                isRealtime = !e.target.checked; // Switch checked = manual simulation

                if (isRealtime) {
                    timeSlider.disabled = true;
                    pulseDot.className = 'pulse-dot';
                    clockModeText.innerHTML = '<span class="pulse-dot"></span> Tiempo Real';
                    updateRealtimeClock();
                    clockInterval = setInterval(updateRealtimeClock, 30000); // update every 30s
                } else {
                    clearInterval(clockInterval);
                    timeSlider.disabled = false;
                    pulseDot.className = 'pulse-dot simulated';
                    clockModeText.innerHTML = '<span class="pulse-dot simulated"></span> Modo Simulado';
                    // Trigger with slider current value
                    handleTimeChange(parseInt(timeSlider.value));
                }
            });
        }

        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                if (!isRealtime) {
                    handleTimeChange(parseInt(e.target.value));
                }
            });
        }

        // Initialize clock
        if (isRealtime) {
            updateRealtimeClock();
            clockInterval = setInterval(updateRealtimeClock, 30000);
        }

        // Native Share Schedule
        const btnShareSched = document.getElementById('btnShareSched');
        if (btnShareSched) {
            btnShareSched.addEventListener('click', async () => {
                const shareData = {
                    title: 'Programa de Actividades: Expo Boda y 15 Años',
                    text: 'Revisa los horarios oficiales de las presentaciones en vivo, marimba, pasarelas y mariachi de la Expo.',
                    url: window.location.href
                };

                if (navigator.share) {
                    try {
                        await navigator.share(shareData);
                    } catch (err) {
                        if (err.name !== 'AbortError') console.error('Error sharing:', err);
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('¡Enlace del programa copiado al portapapeles!');
                    } catch (err) {
                        console.error('Clipboard failed:', err);
                    }
                }
            });
        }

        // Print Schedule
        const btnPrintSched = document.getElementById('btnPrintSched');
        if (btnPrintSched) {
            btnPrintSched.addEventListener('click', () => {
                window.print();
            });
        }
    }
});

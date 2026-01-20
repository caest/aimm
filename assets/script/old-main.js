// main.js
document.addEventListener("DOMContentLoaded", () => {
    // ======================================================
    // UTILITY FUNCTIONS
    // ======================================================
    function elementExists(selector) {
        return document.querySelector(selector) !== null;
    }

    function elementsExist(selectors) {
        return selectors.every(selector => document.querySelector(selector) !== null);
    }

    // ======================================================
    // STICKY HEADER
    // ======================================================
    const header = document.querySelector(".header");
    if (header) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 0) {
                header.classList.add("sticky");
            } else {
                header.classList.remove("sticky");
            }
        });
    }
// ======================================================
// GLOBAL STATE
// ======================================================
let isMenuOpen = false;
let scrollPosition = 0;

// Фиксируем страницу (полный стоп скролла)
function freezeScroll() {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
    console.log('[SCROLL] freezeScroll, scrollPosition =', scrollPosition);

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

// Возвращаем скролл в то же место
function unfreezeScroll() {
    console.log('[SCROLL] unfreezeScroll, return to', scrollPosition);

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';

    window.scrollTo(0, scrollPosition);
}

// ======================================================
// MOBILE MENU TOGGLE + DISABLE WHEEL WHEN POPUP OPEN
// ======================================================

// Глобальный флаг
if (typeof isMenuOpen === 'undefined') window.isMenuOpen = false;

const icnMenus = document.querySelectorAll('.menu-icon');
const headerPopup = document.querySelector('.header-popup');

// Отключаем колесико, когда меню открыто
function disableWheel(e) {
    if (isMenuOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
}

// Ловим любое колесико на всей странице
window.addEventListener("wheel", disableWheel, { passive: false });
window.addEventListener("touchmove", disableWheel, { passive: false });
window.addEventListener("keydown", (e) => {
    if (isMenuOpen && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageDown" || e.key === "PageUp" || e.key === " " )) {
        e.preventDefault();
    }
}, { passive: false });

// Открытие / закрытие меню
if (icnMenus.length > 0 && headerPopup) {
    icnMenus.forEach(icnMenu => {
        icnMenu.addEventListener('click', () => {

            const willBeActive = !headerPopup.classList.contains('active');

            headerPopup.classList.toggle('active', willBeActive);
            icnMenus.forEach(btn => btn.classList.toggle('active', willBeActive));

            if (willBeActive) {
                isMenuOpen = true;
                document.body.style.overflow = "hidden";     // блок скролла
            } else {
                isMenuOpen = false;
                document.body.style.overflow = "";           // возвращаем скролл
            }
        });
    });
}


  // =============================================
// HERO SLIDER + MAGNETIC BUTTONS
// =============================================


    const heroSliderEl = document.querySelector('.hero-slider');
    if (heroSliderEl && typeof Swiper !== 'undefined') {

        const captionEl = document.querySelector('.hero-slider-caption');
        const fractionEl = document.querySelector('.swiper-fraction');
        const progressBar = document.querySelector('.hero-slider-progress span');
        const nextEl = document.querySelector('.hero-slider-next');
        const prevEl = document.querySelector('.hero-slider-prev');
        const paginationEl = document.querySelector('.hero-slider-pagination');

        const navigationConfig = {};
        if (nextEl) navigationConfig.nextEl = nextEl;
        if (prevEl) navigationConfig.prevEl = prevEl;

        const paginationConfig = paginationEl
            ? { el: paginationEl, clickable: true }
            : false;

        const heroSlider = new Swiper(heroSliderEl, {
            slidesPerView: 1,
            loop: false,
            pagination: paginationConfig,
            navigation: Object.keys(navigationConfig).length > 0 ? navigationConfig : {},
            on: {
                init(swiper) {
                    updateHero(swiper);
                    initMagneticSlideButtons();
                },
                slideChange(swiper) {
                    updateHero(swiper);
                    initMagneticSlideButtons();
                }
            }
        });

        function updateHero(swiper) {
            const activeSlide = swiper.slides[swiper.activeIndex];

            if (captionEl) {
                captionEl.textContent = activeSlide?.dataset.caption || '';
            }

            if (fractionEl) {
                const current = swiper.realIndex + 1;
                const total = swiper.slides.length;
                fractionEl.textContent = `${current} / ${total}`;

                if (progressBar) {
                    const progress = (current / total) * 100;
                    progressBar.style.width = `${progress}%`;
                }
            }
        }

        // =============================================
        // MAGNETIC BUTTONS INSIDE EACH SLIDE
        // =============================================
       function initMagneticSlideButtons() {
    const slides = document.querySelectorAll(".swiper-slide");

    slides.forEach(slide => {
        const btn = slide.querySelector(".hero-slider-link");
        if (!btn) return;

        btn.style.position = "absolute";
        btn.style.pointerEvents = "auto";
        btn.style.transition = "transform 0.25s ease-out";

        const strength = 0.30;

        // MAGNET
        slide.addEventListener("mousemove", (e) => {
            const rect = slide.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const btnCenterX =
                btnRect.left - rect.left + btnRect.width / 2;

            const btnCenterY =
                btnRect.top - rect.top + btnRect.height / 2;

            const moveX = (x - btnCenterX) * strength;
            const moveY = (y - btnCenterY) * strength;

            gsap.to(btn, {
                x: moveX,
                y: moveY,
                duration: 0.3,
                ease: "power3.out"
            });
        });

        slide.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.4,
                ease: "power3.out"
            });
        });

        // HOVER SCALE
        btn.addEventListener("mouseenter", () => {
            gsap.to(btn, {
                scale: 1.15,
                duration: 0.35,
                ease: "power3.out"
            });
        });

        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                scale: 1,
                duration: 0.35,
                ease: "power3.out"
            });
        });
    });
}

    }



// ======================================================
// ABOUT SLIDER
// ======================================================
const aboutSliderEl = document.querySelector(".about-slider");
const aboutFractionEl = document.querySelector(".about-slider-fraction");

if (aboutSliderEl && typeof Swiper !== "undefined") {

    const slider = new Swiper(".about-slider", {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        on: {
            init(sw) {
                generateFraction(sw);
                updateFractionActive(sw.realIndex);
            },
            slideChange(sw) {
                updateFractionActive(sw.realIndex);
            }
        }
    });

    function generateFraction(sw) {
        if (!aboutFractionEl) return;

        aboutFractionEl.innerHTML = "";

        // НАДЕЖНОЕ КОЛ-ВО СЛАЙДОВ (РАБОТАЕТ ВЕЗДЕ)
        const total = aboutSliderEl.querySelectorAll(".swiper-slide").length;

        for (let i = 0; i < total; i++) {
            const num = document.createElement("span");
            num.textContent = (i + 1).toString().padStart(2, "0");
            num.dataset.index = i;

            num.addEventListener("click", () => {
                sw.slideToLoop(i, 500);
            });

            aboutFractionEl.appendChild(num);
        }
    }

    function updateFractionActive(activeIndex) {
        if (!aboutFractionEl) return;
        const nums = aboutFractionEl.querySelectorAll("span");

        nums.forEach((el, i) => {
            el.classList.toggle("active", i === activeIndex);
        });
    }
}


    // ======================================================
    // BLOG SLIDER
    // ======================================================
    const blogSliderEl = document.querySelector('.blog-slider');
    if (blogSliderEl && typeof Swiper !== 'undefined') {
        const prevBtn = document.querySelector('.blog-button-prev');
        const nextBtn = document.querySelector('.blog-button-next');

        const navigationConfig = (prevBtn && nextBtn) ? { 
            prevEl: prevBtn, 
            nextEl: nextBtn 
        } : {};

        new Swiper(blogSliderEl, {
            slidesPerView: 1,
            speed: 600,
            navigation: navigationConfig
        });
    }

    // ======================================================
    // PHILOSOPHY SLIDER
    // ======================================================
    const philosophySliderEl = document.querySelector('.philosophy-slider');
    if (philosophySliderEl && typeof Swiper !== 'undefined') {
        const fractionEl = philosophySliderEl.querySelector('.philosophy-fraction');
        const progressBar = philosophySliderEl.querySelector('.philosophy-progress span');

        let fractionSpans = [];

        const philosophySlider = new Swiper(philosophySliderEl, {
            slidesPerView: 1,
            loop: false,
            on: {
                init(swiper) {
                    createFractions(swiper);
                    updatePhilosophy(swiper);
                    updateControlsWidth();
                },
                slideChange(swiper) {
                    updatePhilosophy(swiper);
                    updateControlsWidth();
                }
            }
        });

        function createFractions(swiper) {
            if (!fractionEl) return;
            
            const total = swiper.slides.length;
            fractionEl.innerHTML = '';

            fractionSpans = Array.from({ length: total }, (_, i) => {
                const span = document.createElement('span');
                span.textContent = String(i + 1).padStart(2, '0');
                fractionEl.appendChild(span);
                return span;
            });
        }

        function updatePhilosophy(swiper) {
            const current = swiper.realIndex;

            if (fractionSpans.length > 0) {
                fractionSpans.forEach((span, i) => {
                    span.classList.toggle('active', i === current);
                });
            }

            if (progressBar) {
                const progress = ((current + 1) / swiper.slides.length) * 100;
                progressBar.style.width = `${progress}%`;
            }
        }

        // Philosophy controls width
        function updateControlsWidth() {
            const activeSlide = document.querySelector('.philosophy-slide.swiper-slide-active');
            const image = activeSlide?.querySelector('.philosophy-slide-image');
            const controls = document.querySelector('.philosophy-controls');
            
            if (image && controls) {
                const imageWidth = image.offsetWidth;
                controls.style.width = `${imageWidth}px`;
            }
        }

        // Инициализация и обработчики для контроля ширины
        updateControlsWidth();
        
        window.addEventListener('resize', updateControlsWidth);
        
        philosophySlider.on('resize', updateControlsWidth);

        const image = document.querySelector('.philosophy-slide-image');
        if (image) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        updateControlsWidth();
                    }
                });
            });
            observer.observe(image, { attributes: true });
        }
    }

    // ======================================================
    // PROJECTS SLIDER
    // ======================================================
    const projectsSliderEl = document.querySelector('.projects-text-slider-wrapper');
    if (projectsSliderEl && typeof Swiper !== 'undefined') {
        const projectsFraction = document.querySelector('.projects-slider-fraction');
        const projectsProgress = document.querySelector('.projects-slider-progress span');

        const projectsSlider = new Swiper(projectsSliderEl, {
            slidesPerView: 1,
            loop: false,
            on: {
                init(swiper) {
                    updateProjects(swiper);
                },
                slideChange(swiper) {
                    updateProjects(swiper);
                }
            }
        });

        const nextBtns = document.querySelectorAll('.projects-slide-next');
        if (nextBtns.length > 0) {
            nextBtns.forEach(btn => {
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    projectsSlider.slideNext();
                });
            });
        }

        function updateProjects(swiper) {
            const current = swiper.realIndex + 1;
            const total = swiper.slides.length;

            if (projectsFraction) projectsFraction.textContent = `${current} / ${total}`;

            if (projectsProgress) {
                const progress = (current / total) * 100;
                projectsProgress.style.width = `${progress}%`;
            }
        }
    }

    // ======================================================
    // PROJECTS SORT
    // ======================================================
    const filterButtons = document.querySelectorAll(".projects-page-filters button");
    const list = document.querySelector(".projects-page-list");
    const items = list ? Array.from(list.querySelectorAll(".projects-page-item")) : [];

    if (filterButtons.length > 0 && list && items.length > 0) {
        // === MOBILE DROPDOWN ===
        const dropdown = document.querySelector(".projects-page-filters-mobile");
        const dropdownSelected = dropdown?.querySelector(".ppf-mobile-selected");
        const dropdownList = dropdown?.querySelector(".ppf-mobile-list");
        const dropdownItems = dropdown?.querySelectorAll(".ppf-mobile-item");

        // ------------------------------------------------------
        // APPLY FILTER
        // ------------------------------------------------------
        function applyFilter(filter) {
            /* --- обновляем кнопки на десктопе --- */
            filterButtons.forEach(b => b.classList.remove("active"));
            const activeBtn = document.querySelector(`.projects-page-filters button[data-filter="${filter}"]`);
            if (activeBtn) activeBtn.classList.add("active");

            /* --- обновляем мобильный dropdown --- */
            if (dropdownSelected) {
                const txt = document.querySelector(`.ppf-mobile-item[data-filter="${filter}"]`)?.textContent;
                if (txt) dropdownSelected.firstChild.textContent = txt;
            }

            /* --- Flip-анимация --- */
            if (typeof Flip !== 'undefined') {
                const state = Flip.getState(items);

                const matched = [];
                const hidden = [];

                items.forEach(item => {
                    const category = item.dataset.category;
                    if (filter === "all" || category === filter) {
                        matched.push(item);
                        item.classList.remove("hidden");
                    } else {
                        hidden.push(item);
                        item.classList.add("hidden");
                    }
                });

                matched.forEach(item => list.appendChild(item));
                hidden.forEach(item => list.appendChild(item));

                Flip.from(state, {
                    duration: 0.6,
                    ease: "power2.out",
                    stagger: 0.03,
                    absolute: true,
                    fade: true
                });
            } else {
                // Fallback без анимации
                items.forEach(item => {
                    const category = item.dataset.category;
                    if (filter === "all" || category === filter) {
                        item.classList.remove("hidden");
                    } else {
                        item.classList.add("hidden");
                    }
                });
            }
        }

        // ------------------------------------------------------
        // DESKTOP BUTTONS
        // ------------------------------------------------------
        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                applyFilter(btn.dataset.filter);
            });
        });

        // ------------------------------------------------------
        // MOBILE DROPDOWN
        // ------------------------------------------------------
        if (dropdown && dropdownSelected && dropdownItems.length > 0) {
            // открыть/закрыть
            dropdownSelected.addEventListener("click", () => {
                dropdown.classList.toggle("open");
            });

            // клик по пункту
            dropdownItems.forEach(item => {
                item.addEventListener("click", () => {
                    const filter = item.dataset.filter;
                    applyFilter(filter);
                    dropdown.classList.remove("open");
                });
            });
        }

        // ------------------------------------------------------
        // DEFAULT
        // ------------------------------------------------------
        applyFilter("all");
    }

    // ======================================================
    // MAGNET BUTTON PROJECTS
    // ======================================================
    const container = document.querySelector(".projects-page-contact");
    const btn = document.querySelector(".projects-page-button");
    const title = document.querySelector(".projects-page-title");

    if (container && btn && title) {
        btn.style.position = "absolute";

        const cRect = container.getBoundingClientRect();
        const btnW = btn.offsetWidth;
        const btnH = btn.offsetHeight;

        let btnX = (cRect.width - btnW) / 2;
        let btnY = (cRect.height - btnH) / 2;

        let targetX = btnX;
        let targetY = btnY;

        btn.style.left = btnX + "px";
        btn.style.top = btnY + "px";

        const ease = 0.12;

        function animate() {
            btnX += (targetX - btnX) * ease;
            btnY += (targetY - btnY) * ease;

            btn.style.left = btnX + "px";
            btn.style.top = btnY + "px";

            requestAnimationFrame(animate);
        }
        animate();

        container.addEventListener("mousemove", (e) => {
            const cRect = container.getBoundingClientRect();
            const mx = e.clientX - cRect.left;
            const my = e.clientY - cRect.top;

            let x = mx - btnW / 2;
            let y = my - btnH / 2;

            x = Math.max(0, Math.min(x, cRect.width - btnW));
            y = Math.max(0, Math.min(y, cRect.height - btnH));

            targetX = x;
            targetY = y;

            const tLeft = title.offsetLeft;
            const tTop = title.offsetTop;
            const tRight = tLeft + title.offsetWidth;
            const tBottom = tTop + title.offsetHeight;

            const insideTitle =
                mx >= tLeft &&
                mx <= tRight &&
                my >= tTop &&
                my <= tBottom;

            btn.style.transform = insideTitle ? "scale(1.25)" : "scale(1)";
        });
    }

    // ======================================================
    // SERVICES ITEM TOGGLE
    // ======================================================
    document.querySelectorAll('.services-item-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const content = btn.querySelector('.services-item-content');
            if (content) {
                const isOpen = content.classList.contains('open');

                if (isOpen) {
                    btn.classList.remove('active');
                    content.classList.remove('open');
                } else {
                    btn.classList.add('active');
                    content.classList.add('open');
                }
            }
        });
    });

    // ======================================================
    // NEWS/BLOG TABS
    // ======================================================
    const tabs = document.querySelectorAll('.news-blog-mobile-tab');
    const blogSection = document.querySelector('.news-blog-mobile');
    const mediaSection = document.querySelector('.news-blog-media');

    if (tabs.length > 0 && blogSection && mediaSection) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                // переключаем активные табы
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // переключаем контент через классы
                if (index === 0) {
                    blogSection.classList.add('active');
                    mediaSection.classList.remove('active');
                } else {
                    blogSection.classList.remove('active');
                    mediaSection.classList.add('active');
                }
            });
        });
    }
});
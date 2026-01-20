document.addEventListener("DOMContentLoaded", () => {
    
    function elementExists(selector) {
        return document.querySelector(selector) !== null;
    }

    function elementsExist(selectors) {
        return selectors.every(selector => document.querySelector(selector) !== null);
    }

    function snapPx(v) {
        const dpr = window.devicePixelRatio || 1;
        return Math.round(v * dpr) / dpr;
    }

    function toNum(v) {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    }

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

    let isMenuOpen = false;
    let scrollPosition = 0;

    function freezeScroll() {
        scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;

        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollPosition}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
    }

    function unfreezeScroll() {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';

        window.scrollTo(0, scrollPosition);
    }

    function setMenuOpen(open) {
        isMenuOpen = open;

        const header = document.querySelector('.header');
        const headerPopup = document.querySelector('.header-popup');
        const icnMenus = document.querySelectorAll('.menu-icon');

        if (header) header.classList.toggle('header-menu-open', open);
        if (headerPopup) headerPopup.classList.toggle('active', open);
        icnMenus.forEach(btn => btn.classList.toggle('active', open));

        if (open) freezeScroll();
        else unfreezeScroll();
    }

    const headerPopup = document.querySelector('.header-popup');
    const icnMenus = document.querySelectorAll('.menu-icon');

    if (headerPopup && icnMenus.length) {
        icnMenus.forEach(btn => {
            btn.addEventListener('click', () => {
                setMenuOpen(!headerPopup.classList.contains('active'));
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMenuOpen) setMenuOpen(false);
        });

        headerPopup.addEventListener('click', (e) => {
            if (e.target === headerPopup && isMenuOpen) setMenuOpen(false);
        });
    }

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

        function initMagneticSlideButtons() {
            const slides = document.querySelectorAll(".swiper-slide");
            slides.forEach(slide => {
                const btn = slide.querySelector(".hero-slider-link");
                if (!btn) return;

                if (typeof gsap === 'undefined') return;

                btn.style.position = "absolute";
                btn.style.pointerEvents = "auto";
                btn.style.transition = "transform 0.25s ease-out";

                const strength = 0.30;

                slide.addEventListener("mousemove", (e) => {
                    const rect = slide.getBoundingClientRect();
                    const btnRect = btn.getBoundingClientRect();

                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    const btnCenterX = btnRect.left - rect.left + btnRect.width / 2;
                    const btnCenterY = btnRect.top - rect.top + btnRect.height / 2;

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

    const aboutPageSwiperEl = document.querySelector('.about-page-swiper');
    if (aboutPageSwiperEl && typeof Swiper !== 'undefined') {
        const arrow = document.querySelector('.about-swiper__next');
        if (arrow) {
            const arrowImg = arrow.querySelector('img');

            function setRotateVar(dir) {
                if (!arrowImg) return;
                arrowImg.style.setProperty('--aboutArrowRotate', dir === 'prev' ? 'rotate(180deg)' : 'rotate(0deg)');
            }

            function bounce() {
                arrow.classList.remove('is-bounce');
                arrow.offsetWidth; 
                arrow.classList.add('is-bounce');
            }

            function updateArrowDirection(sw) {
                const total = sw.slides.length - sw.loopedSlides * 2;
                const isLeftSide = sw.realIndex < total / 2;
                const dir = isLeftSide ? 'next' : 'prev';

                arrow.dataset.dir = dir;
                arrow.classList.toggle('is-prev', dir === 'prev');
                arrow.classList.toggle('is-next', dir === 'next');
                setRotateVar(dir);
            }

            const swiper = new Swiper('.about-page-swiper', {
                loop: true,
                centeredSlides: true,
                slidesPerView: 1.2,
                spaceBetween: 4,
                allowTouchMove: true,

                pagination: {
                    el: '.about-swiper__pagination',
                    clickable: true,
                },

                breakpoints: {
                    768: { slidesPerView: 1.6, spaceBetween: 18 },
                    1024: { slidesPerView: 2.1, spaceBetween: 18 },
                },

                on: {
                    init(sw) { 
                        updateArrowDirection(sw); 
                    },
                    slideChange(sw) { 
                        updateArrowDirection(sw); 
                    },
                },
            });

            function handleClick() {
                if (arrow.dataset.dir === 'prev') swiper.slidePrev();
                else swiper.slideNext();
                bounce();
            }

            arrow.addEventListener('click', handleClick);
            arrow.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            });
        }
    }

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

        function updateControlsWidth() {
            const activeSlide = document.querySelector('.philosophy-slide.swiper-slide-active');
            if (!activeSlide) return;
            
            const image = activeSlide.querySelector('.philosophy-slide-image');
            const controls = document.querySelector('.philosophy-controls');
            
            if (image && controls) {
                const imageWidth = image.offsetWidth;
                controls.style.width = `${imageWidth}px`;
            }
        }

        if (philosophySliderEl.querySelector('.philosophy-slide-image')) {
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
    }

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

    const filterButtons = document.querySelectorAll(".projects-page-filters button");
    const list = document.querySelector(".projects-page-list");
    const items = list ? Array.from(list.querySelectorAll(".projects-page-item")) : [];

    if (filterButtons.length > 0 && list && items.length > 0) {
        const dropdown = document.querySelector(".projects-page-filters-mobile");
        const dropdownSelected = dropdown?.querySelector(".ppf-mobile-selected");
        const dropdownList = dropdown?.querySelector(".ppf-mobile-list");
        const dropdownItems = dropdown?.querySelectorAll(".ppf-mobile-item");

        function applyFilter(filter) {
            filterButtons.forEach(b => b.classList.remove("active"));
            const activeBtn = document.querySelector(`.projects-page-filters button[data-filter="${filter}"]`);
            if (activeBtn) activeBtn.classList.add("active");

            if (dropdownSelected) {
                const txt = document.querySelector(`.ppf-mobile-item[data-filter="${filter}"]`)?.textContent;
                if (txt) dropdownSelected.firstChild.textContent = txt;
            }

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

        filterButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                applyFilter(btn.dataset.filter);
            });
        });

        if (dropdown && dropdownSelected && dropdownItems.length > 0) {
            dropdownSelected.addEventListener("click", () => {
                dropdown.classList.toggle("open");
            });

            dropdownItems.forEach(item => {
                item.addEventListener("click", () => {
                    const filter = item.dataset.filter;
                    applyFilter(filter);
                    dropdown.classList.remove("open");
                });
            });
        }

        applyFilter("all");
    }

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

            const insideTitle = mx >= tLeft && mx <= tRight && my >= tTop && my <= tBottom;
            btn.style.transform = insideTitle ? "scale(1.25)" : "scale(1)";
        });
    }

    const serviceBtns = document.querySelectorAll('.services-item-btn');
    if (serviceBtns.length > 0) {
        serviceBtns.forEach((btn) => {
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
    }

    const tabs = document.querySelectorAll('.news-blog-mobile-tab');
    const blogSection = document.querySelector('.news-blog-mobile');
    const mediaSection = document.querySelector('.news-blog-media');

    if (tabs.length > 0 && blogSection && mediaSection) {
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

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

    const filters = document.querySelectorAll('.services-filter');
    const serviceItems = document.querySelectorAll('.services-item');

    if (filters.length > 0 && serviceItems.length > 0) {
        serviceItems.forEach(el => el.classList.add('has-offset'));

        filters.forEach(filter => {
            filter.addEventListener('click', () => {
                const cat = filter.dataset.filter;
                const target = document.querySelector(`.services-item[data-category="${cat}"]`);
                if (!target) return;

                filters.forEach(b => b.classList.remove('is-active'));
                filter.classList.add('is-active');

                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }
    
    const teamWrap = document.querySelector('.about-page-team-photo-wrap');
    const teamBtn = document.querySelector('.about-page-team-photo-button');
    
    if (teamWrap && teamBtn) {
        const teamMQ = window.matchMedia('(max-width: 992px)');
        const TEAM_VISIBLE = 6;

        const getTeamItems = () =>
            Array.from(teamWrap.querySelectorAll('.about-page-team-photo'));

        const applyTeamHidden = () => {
            const items = getTeamItems();
            const expanded = teamWrap.classList.contains('is-expanded');

            items.forEach((el, idx) => {
                el.classList.remove('is-revealing');
                el.style.animationDelay = '';

                if (!teamMQ.matches) {
                    el.style.display = '';
                    return;
                }

                if (!expanded && idx >= TEAM_VISIBLE) el.style.display = 'none';
                else el.style.display = '';
            });

            if (!teamMQ.matches) {
                teamWrap.classList.remove('is-expanded');
                teamBtn.style.display = '';
                return;
            }

            teamBtn.style.display = 'flex';

            if (expanded) {
                items.slice(TEAM_VISIBLE).forEach((el, i) => {
                    el.classList.add('is-revealing');
                    el.style.animationDelay = `${i * 60}ms`;
                });
            }
        };

        teamBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!teamMQ.matches) return;
            teamWrap.classList.toggle('is-expanded');
            applyTeamHidden();
        });

        if (teamMQ.addEventListener) teamMQ.addEventListener('change', applyTeamHidden);
        else teamMQ.addListener(applyTeamHidden);

        applyTeamHidden();
    }

    function initPhilosophyVerticalLine() {
        const section = document.querySelector('.philosophy');
        const topLine = document.querySelector('.philosophy-line-horizontal-top');
        const bottomLine = document.querySelector('.philosophy-line-horizontal');
        const vLine = document.querySelector('.philosophy-line-vertical');
        
        if (!section || !topLine || !bottomLine || !vLine) return;

        const gapPx = 0;

        function update() {
            requestAnimationFrame(() => {
                const sRect = section.getBoundingClientRect();
                const topRect = topLine.getBoundingClientRect();
                const bottomRect = bottomLine.getBoundingClientRect();

                const startY = topRect.bottom - sRect.top + gapPx;
                const endY = bottomRect.top - sRect.top - gapPx;

                const top = snapPx(Math.min(startY, endY));
                const height = snapPx(Math.max(0, Math.abs(endY - startY)));

                vLine.style.top = top + 'px';
                vLine.style.height = height + 'px';
            });
        }

        update();
        window.addEventListener('resize', update);

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(update);
            ro.observe(document.documentElement);
            ro.observe(section);
            ro.observe(topLine);
            ro.observe(bottomLine);
        }
    }

    function initClientsHorizontalLine() {
        const horizontal = document.querySelector('.philosophy-line-horizontal');
        const vertical = document.querySelector('.clients-line-vertical');
        if (!horizontal || !vertical) return;

        const baseTop = 70;
        const baseWidth = window.innerWidth;
        const sensitivity = 4;
        const endOffsetPx = 0;

        function update() {
            const currentWidth = window.innerWidth;
            let ratio = currentWidth / baseWidth;

            let adjustedRatio = 1 - ((1 - ratio) / sensitivity);
            if (adjustedRatio < 0.6) adjustedRatio = 0.6;

            horizontal.style.top = (baseTop * adjustedRatio) + '%';

            requestAnimationFrame(() => {
                const vRect = vertical.getBoundingClientRect();
                const hRect = horizontal.getBoundingClientRect();

                const hs = getComputedStyle(horizontal);
                const hBorderTop = toNum(hs.borderTopWidth);

                const targetY = hRect.top + hBorderTop + endOffsetPx;
                const height = snapPx(targetY - vRect.top);

                vertical.style.height = height > 0 ? height + 'px' : '0px';
            });
        }

        update();
        window.addEventListener('resize', update);

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(update);
            ro.observe(document.documentElement);
            ro.observe(horizontal);
            ro.observe(vertical);
        }
    }

    function initBlogVerticalLine() {
        const blog = document.querySelector('.blog');
        const blogLine = document.querySelector('.blog-line-vertical');
        const phLine = document.querySelector('.philosophy-line-horizontal');
        if (!blog || !blogLine || !phLine) return;

        const breakpoint = 992;
        const gapPx = 0;

        function update() {
            if (window.innerWidth > breakpoint) {
                blogLine.style.top = '';
                return;
            }

            requestAnimationFrame(() => {
                const blogRect = blog.getBoundingClientRect();
                const phRect = phLine.getBoundingClientRect();
                const desiredTop = (phRect.bottom - blogRect.top) + gapPx;
                blogLine.style.top = desiredTop + 'px';
            });
        }

        update();
        window.addEventListener('resize', update);

        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(update);
            ro.observe(document.documentElement);
            ro.observe(blog);
            ro.observe(phLine);
        }
    }

    function initMarquee() {
        const marqueeTrack = document.querySelector(".js-marquee");
        if (!marqueeTrack) return;

        const parent = marqueeTrack.parentElement;
        if (!parent) return;

        let totalWidth = marqueeTrack.offsetWidth;
        let clones = [marqueeTrack];

        while (totalWidth < parent.offsetWidth * 2.5) {
            const clone = marqueeTrack.cloneNode(true);
            parent.appendChild(clone);
            clones.push(clone);
            totalWidth += clone.offsetWidth;
        }

        if (typeof gsap !== 'undefined') {
            gsap.set(clones, { x: 0 });

            gsap.to(clones, {
                x: () => -clones[0].offsetWidth,
                duration: 12, 
                ease: "none",
                repeat: -1,
                modifiers: {
                    x: gsap.utils.wrap(-clones[0].offsetWidth, 0) 
                }
            });
        }
    }


    initPhilosophyVerticalLine();
    initClientsHorizontalLine();
    initBlogVerticalLine();
    initMarquee();

});
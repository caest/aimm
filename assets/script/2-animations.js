// =============================================
// PAGE INITIALIZATION
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    function forceScrollTop() {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    forceScrollTop();
    setTimeout(forceScrollTop, 10);
    setTimeout(forceScrollTop, 30);
    setTimeout(forceScrollTop, 60);
    setTimeout(forceScrollTop, 120);

    gsap.registerPlugin(ScrollToPlugin);

    let heroAnimationDone = false;
    let sectionLocked = true;
    let currentSection = "hero";
    let sectionMode = true;
    let isManualScroll = false;
    let heroScrollEnabled = true;
    let projectsAnimated = false;
    let aboutWasShown = false;
    let aboutAnimationDone = false;
    let clientsAnimated = false;
    let philosophyAnimated = false;
    let blogAnimated = false;
    let qualityAnimated = false;
    let socialAnimated = false;

    // Переменные для навигации
    let cardScrollLock = false;
    let currentCardIndex = 0;

    // =============================================
    // HIDE SECTIONS ON LOAD
    // =============================================
    function initHideSections() {
        const sections = [
            ".clients",
            ".philosophy", 
            ".blog",
            ".quality",
            ".social"
        ];
        
        sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) {
                gsap.set(section, {
                    opacity: 0,
                    y: 120,
                   /*  pointerEvents: "none" */
                });
            }
        });
    }
initHideProjects(); 
    initHideSections();

    // =============================================
    // PRELOADER
    // =============================================
    const preloader = document.getElementById("preloader");
    const percentText = document.querySelector(".preloader-percent");

    if (preloader && percentText) {
        runPreloader(() => {
            preloader.classList.add("preloader-hide");
            setTimeout(startHeroAnimation, 300);
        });
    } else {
        startHeroAnimation();
    }

    function runPreloader(done) {
        let p = 0;
        const int = setInterval(() => {
            p++;
            if (percentText) percentText.textContent = p + "%";
            if (p >= 100) {
                clearInterval(int);
                setTimeout(done, 200);
            }
        }, 30);
    }

    // =============================================
    // HERO ANIMATION
    // =============================================

function startHeroAnimation() {
    forceScrollTop();

    const hero = document.querySelector(".hero");
    if (hero) hero.classList.remove("hero-hidden");


    const titleRows = document.querySelectorAll(".hero-title-row");
    titleRows.forEach(row => {
        const text = row.textContent.trim();
        row.innerHTML = ""; 

        [...text].forEach((char) => {
            const span = document.createElement("span");
            span.classList.add("hero-letter");
            span.textContent = char;
            row.appendChild(span);
        });
    });


    const typingStyle = document.createElement("style");
    typingStyle.textContent = `
        .hero-letter {
            display: inline-block;
            opacity: 0;
            filter: blur(6px);
            transform: translateY(20px);
        }
    `;
    document.head.appendChild(typingStyle);


    const sliderWrapper = ".hero-slider-wrapper";
    const sliderImg = ".hero-slider img";
    const sliderControls = ".hero-slider-buttons > div, .swiper-fraction, .hero-slider-caption";
    const sliderPagination = ".hero-slider-pagination";

    gsap.set(sliderWrapper, { opacity: 0, filter: "blur(20px)", y: 40 });
    gsap.set(sliderImg, { scale: 1.12 });
    gsap.set(sliderControls, { opacity: 0, y: 20 });
    gsap.set(sliderPagination, { opacity: 0, y: 15 });


    gsap.set(".hero-line-vertical", { scaleY: 0, transformOrigin: "top center" });
    gsap.set(".hero-line-horizontal", { scaleX: 0, transformOrigin: "left center" });

    const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
            heroAnimationDone = true;
            sectionLocked = false;
            isManualScroll = false;
            heroScrollEnabled = true;
        }
    });


    tl.to(".hero-line-vertical", { scaleY: 1, duration: 1.2 });
    tl.to(".hero-line-horizontal", { scaleX: 1, duration: 1.2 }, "-=0.6");

    // 2. PREMIUM TYPING TITLE
    tl.to(".hero-letter", {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        stagger: 0.04,
        duration: 0.45
    }, "-=0.4");

    // 3. Slider appearance — premium
    tl.to(sliderWrapper, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1.6
    }, "-=0.9");

    tl.to(sliderImg, {
        scale: 1,
        duration: 1.8,
        ease: "power2.out"
    }, "-=1.4");

    // 4. Slider UI
    tl.to(sliderControls, {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        duration: 0.8
    }, "-=1.2");

    tl.to(sliderPagination, {
        opacity: 1,
        y: 0,
        duration: 0.6
    }, "-=1");

    // 5. Description
    tl.from(".hero-description", {
        opacity: 0,
        y: 25,
        duration: 0.9
    }, "-=0.8");

    // 6. "Keep in touch" link
    tl.from(".hero-link", {
        opacity: 0,
        x: -40,
        duration: 1
    }, "-=0.7");

    // 7. Scroll text
    tl.from(".hero-scroll", {
        opacity: 0,
        y: 20,
        duration: 0.8
    }, "-=0.6");
}


  // =============================================
// ABOUT ANIMATION (PREMIUM + original counts)
// =============================================
function startAboutAnimation() {
    const vertical = document.querySelector(".about-line-vertical");
    const horizontal = document.querySelector(".about-line-horizontal");
    const slider = document.querySelector(".about-slider");
    const sliderFraction = document.querySelector(".about-slider-fraction");
    const circle = document.querySelector(".about-circle");
    const marquee = document.querySelector(".about-marque");
    const description = document.querySelector(".about-description");
    const counts = document.querySelectorAll(".about-count");

    if (!vertical || !horizontal || !slider) return;

    gsap.killTweensOf([
        vertical, horizontal, slider, circle, marquee,
        sliderFraction, description, counts
    ]);

    // -------------------------------------------------
    // PREMIUM PRESETS (except counts)
    // -------------------------------------------------

    gsap.set(vertical, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "top center"
    });

    gsap.set(horizontal, {
        opacity: 0,
        scaleX: 0,
        transformOrigin: "left center"
    });

    // slider: mask reveal + blur cinematic
    gsap.set(slider, {
        opacity: 0,
        y: 60,
        filter: "blur(30px)",
        maskImage: "linear-gradient(black 0%, transparent 0%)",
        WebkitMaskImage: "linear-gradient(black 0%, transparent 0%)"
    });

    // images inside slider
    gsap.set(slider.querySelectorAll("img"), {
        scale: 1.18,
        filter: "blur(10px)"
    });

    if (sliderFraction) gsap.set(sliderFraction, { opacity: 0, x: 80 });

    if (circle) {
        gsap.set(circle, {
            opacity: 0,
            x: 100,
            rotate: -20
        });
    }

    if (marquee) {
        gsap.set(marquee, {
            opacity: 0,
            y: 30,
            rotateX: 25,
            transformOrigin: "center bottom"
        });
    }

    if (description) {
        gsap.set(description, {
            opacity: 0,
            y: 30
        });
    }

    // -------------------------------------------------
    // COUNTS — RESTORE ORIGINAL ANIMATION PRESETS
    // -------------------------------------------------

    const firstCount = counts[0];
    if (firstCount) {
        gsap.set(firstCount, { opacity: 0, y: "+=50" });
    }

    // -------------------------------------------------
    // TIMELINE
    // -------------------------------------------------

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. LINES
    tl.to(vertical, { opacity: 1, scaleY: 1, duration: 1.2 });
    tl.to(horizontal, { opacity: 1, scaleX: 1, duration: 1.2 }, "-=0.6");

    // 2. SLIDER WRAPPER — cinematic reveal
    tl.to(slider, {
        opacity: 1,
        y: 0,
        duration: 1.4,
        ease: "power3.out",
        maskImage: "linear-gradient(black 100%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(black 100%, transparent 100%)",
        filter: "blur(0px)"
    }, "-=0.8");

    // 3. SLIDER IMAGES — cinematic zoom out
    tl.to(slider.querySelectorAll("img"), {
        scale: 1,
        filter: "blur(0px)",
        duration: 1.6,
        ease: "power2.out"
    }, "-=1.3");

    // 4. SLIDER FRACTION
    if (sliderFraction) {
        tl.to(sliderFraction, {
            opacity: 1,
            x: 0,
            duration: 0.9
        }, "-=1.0");
    }

    // 5. MARQUEE — premium 3D intro
    if (marquee) {
        tl.to(marquee, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.9");
    }

    // 6. CIRCLE — premium spin intro
    if (circle) {
        tl.to(circle, {
            opacity: 1,
            x: 0,
            rotate: 0,
            duration: 1.2
        }, "-=1.0");
    }

    // 7. DESCRIPTION
    if (description) {
        tl.to(description, {
            opacity: 1,
            y: 0,
            duration: 1
        }, "-=0.8");
    }

    // -------------------------------------------------
    // 8. COUNTS — ORIGINAL ANIMATION (as requested)
    // -------------------------------------------------

    if (firstCount) {
        const span = firstCount.querySelector("span");

        tl.to(firstCount, {
            opacity: 1,
            y: 0,
            fontSize: "clamp(6rem, 10vw, 20rem)",
            duration: 1.2,
            ease: "power4.out",
            onStart: () => {
                if (span) {
                    gsap.fromTo(
                        span,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.6 }
                    );
                }
            }
        }, "-=0.1");
    }

    // -------------------------------------------------
    // 9. CALLBACK
    // -------------------------------------------------
    tl.call(() => {
        startAboutCountRotation();
        aboutAnimationDone = true;
        aboutWasShown = true;
    });
}


  function goToAbout() {
    if (sectionLocked) return;

    sectionLocked = true;
    currentSection = "about";
    isManualScroll = true;

    // ПОКАЗЫВАЕМ кнопки при переходе на about
    showHeroButtons();

    const aboutSection = document.querySelector(".about");
    if (!aboutSection) return;

    gsap.to(window, {
        duration: 1.1,
        scrollTo: aboutSection.offsetTop,
        ease: "power3.inOut",
        onStart: () => {
            if (!aboutWasShown) startAboutAnimation();
        },
        onComplete: () => {
            sectionLocked = false;
            isManualScroll = false;
        }
    });
}

function goToProjects() {
    if (sectionLocked) return;

    const projects = document.querySelector(".projects");
    if (!projects) return;

    sectionLocked = true;
    currentSection = "projects";

    // СКРЫВАЕМ кнопки при уходе с about на projects
    gsap.to([".hero-link", ".hero-scroll", ".header"], {
        opacity: 0,
        y: 20,
        duration: 0.5,
        ease: "power3.out"
    });

    gsap.to(window, {
        duration: 1.1,
        scrollTo: projects.offsetTop,
        ease: "power3.inOut",
        onStart: () => {
            if (!projectsAnimated) startProjectsAnimation();
        },
        onComplete: () => {
            setTimeout(() => {
                sectionLocked = false;
                isManualScroll = false;
                sectionMode = false;
            }, 200);
        }
    });
}

function goToHero() {
    if (sectionLocked) return;

    sectionLocked = true;
    currentSection = "hero";
    heroScrollEnabled = true;

    // ПОКАЗЫВАЕМ кнопки при возврате к hero
    showHeroButtons();

    gsap.to(window, {
        duration: 1.1,
        scrollTo: 0,
        ease: "power3.inOut",
        onComplete: () => {
            setTimeout(() => {
                sectionLocked = false;
                isManualScroll = false;
            }, 200);
        }
    });
}

    // =============================================
    // HERO BUTTONS MANAGEMENT
    // =============================================
    function showHeroButtons() {
        gsap.to([".hero-link", ".hero-scroll", ".header"], {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out"
        });
    }

    function goToHero() {
        if (sectionLocked) return;

        sectionLocked = true;
        currentSection = "hero";
        heroScrollEnabled = true;

        showHeroButtons();

        gsap.to(window, {
            duration: 1.1,
            scrollTo: 0,
            ease: "power3.inOut",
            onComplete: () => {
                setTimeout(() => {
                    sectionLocked = false;
                    isManualScroll = false;
                }, 200);
            }
        });
    }

// =============================================
// PROJECTS ANIMATION - ТОЛЬКО ПРИ ПОЯВЛЕНИИ В ЭКРАНЕ
// =============================================
function startProjectsAnimation() {
    if (projectsAnimated) return;
    projectsAnimated = true;

    const verticalLine = document.querySelector('.projects-line-vertical');
    const cards = document.querySelectorAll(
        ".projects-one, .projects-second, .projects-third, .projects-four"
    );

    if (!verticalLine) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // ОТРИСОВКА ВЕРТИКАЛЬНОЙ ЛИНИИ
    tl.fromTo(verticalLine, 
        { 
            height: 0, 
            opacity: 0,
            transformOrigin: "top center" 
        },
        { 
            height: 600, 
            opacity: 1, 
            duration: 2 
        }
    );

    // ЗАПУСКАЕМ НАБЛЮДАТЕЛЬ ДЛЯ КАРТОЧЕК
    initProjectsCardsObserver(cards);
}

// =============================================
// OBSERVER ДЛЯ КАРТОЧЕК
// =============================================
function initProjectsCardsObserver(cards) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                animateCard(card);
                observer.unobserve(card);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: "0px 0px -50px 0px"
    });

    // НАЧИНАЕМ НАБЛЮДАТЬ ЗА КАЖДОЙ КАРТОЧКОЙ
    cards.forEach(card => {
        observer.observe(card);
    });
}

// =============================================
// АНИМАЦИЯ ОДНОЙ КАРТОЧКИ
// =============================================
function animateCard(card) {
    const svgBox = card.querySelector(".svg-animate");
    const label = card.querySelector(".projects-label");
    const name = card.querySelector(".projects-name");
    const img = card.querySelector("[class$='-image']");

    const cardTl = gsap.timeline({
        defaults: { ease: "power3.out" }
    });

    // Анимация появления карточки
    cardTl.to(card, {
        opacity: 1,
        marginTop: 0,
        filter: "blur(0px)",
        duration: 1.1
    });

    // Отрисовка SVG (если есть)
    if (svgBox) {
        cardTl.call(() => drawSVG(svgBox), null, "-=0.7");
    }

    // Остальные элементы
    if (img) cardTl.to(img, { opacity: 1, marginTop: 0, duration: 1.1 }, "-=0.9");
    if (label) cardTl.to(label, { opacity: 1, marginTop: 0, duration: 0.9 }, "-=0.6");
    if (name) cardTl.to(name, { opacity: 1, marginTop: 0, duration: 0.9 }, "-=0.5");
}

function initHideProjects() {
    const verticalLine = document.querySelector('.projects-line-vertical');
    const cards = document.querySelectorAll(
        ".projects-one, .projects-second, .projects-third, .projects-four"
    );

    // Скрываем вертикальную линию (начальное состояние для анимации)
    if (verticalLine) {
        gsap.set(verticalLine, { 
            height: 0, 
            opacity: 0 
        });
    }

    // Скрываем карточки
    cards.forEach(card => {
        const img = card.querySelector("[class$='-image']");
        const label = card.querySelector(".projects-label");
        const name = card.querySelector(".projects-name");

        gsap.set(card, { opacity: 0, marginTop: 80, filter: "blur(12px)" });
        if (img) gsap.set(img, { opacity: 0, marginTop: 40 });
        if (label) gsap.set(label, { opacity: 0, marginTop: 24 });
        if (name) gsap.set(name, { opacity: 0, marginTop: 24 });
    });
}
    // =============================================
    // PROJECTS NAVIGATION
    // =============================================
    function goToProjects() {
        if (sectionLocked) return;

        const projects = document.querySelector(".projects");
        if (!projects) return;

        sectionLocked = true;
        currentSection = "projects";

        gsap.to([".hero-link", ".hero-scroll", ".header"], {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power3.out"
        });

        gsap.to(window, {
            duration: 1.1,
            scrollTo: projects.offsetTop,
            ease: "power3.inOut",
            onStart: () => {
                if (!projectsAnimated) startProjectsAnimation();
            },
            onComplete: () => {
                setTimeout(() => {
                    sectionLocked = false;
                    isManualScroll = false;
                    sectionMode = false;
                }, 200);
            }
        });
    }

    // =============================================
    // SCROLL BUTTONS
    // =============================================
    const heroScroll = document.querySelector(".hero-scroll");
    if (heroScroll) {
        heroScroll.addEventListener("click", (e) => {
            e.preventDefault();
            if (sectionLocked) return;

            isManualScroll = true;

            if (currentSection === "hero") {
                goToAbout();
            } else if (currentSection === "about") {
                if (!aboutAnimationDone) return;
                goToProjects();
            }
        });
    }

    const aboutScroll = document.querySelector(".about-scroll");
    if (aboutScroll) {
        aboutScroll.addEventListener("click", (e) => {
            e.preventDefault();
            if (sectionLocked) return;

            isManualScroll = true;
            goToProjects();
        });
    }

    // =============================================
    // SVG ANIMATION
    // =============================================
    function drawSVG(svgBox) {
        const stroke = svgBox.querySelector(".num-stroke");
        const fill = svgBox.querySelector(".num-fill");
        const maskRect = svgBox.querySelector(".fill-mask-rect");

        if (!stroke || !fill || !maskRect) return;

        const len = stroke.getTotalLength();
        const bbox = stroke.getBBox();

        gsap.set(stroke, {
            strokeDasharray: len,
            strokeDashoffset: len,
            opacity: 1
        });

        gsap.set(fill, { opacity: 0 });
        gsap.set(maskRect, { y: -bbox.height });

        gsap.to(stroke, {
            strokeDashoffset: 0,
            duration: 1.8,
            ease: "power2.out",
            onComplete: () => {
                gsap.to(fill, {
                    opacity: 1,
                    duration: 0.3,
                    ease: "power1.out"
                });

                gsap.to(maskRect, {
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out"
                });
            }
        });
    }

    // =============================================
    // PROJECTS SCROLL ANIMATION (fallback)
    // =============================================
    function animateProjectsOnScroll() {
        if (!window.__animatedSVGCards) window.__animatedSVGCards = new Set();
        const animated = window.__animatedSVGCards;

        const cards = document.querySelectorAll(
            ".projects-one, .projects-second, .projects-third, .projects-four"
        );

        const viewport = window.innerHeight * 0.9;

        cards.forEach((card, i) => {
            if (animated.has(card)) return;

            const rect = card.getBoundingClientRect();
            if (rect.top < viewport) {
                animated.add(card);

                const svgBox = card.querySelector(".svg-animate");
                const label = card.querySelector(".projects-label");
                const name = card.querySelector(".projects-name");
                const img = card.querySelector("[class$='-image']");

                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    delay: i * 0.15
                });

                tl.to(card, {
                    opacity: 1,
                    marginTop: 0,
                    filter: "blur(0px)",
                    duration: 1.1
                });

                if (img) tl.to(img, { opacity: 1, marginTop: 0, duration: 1.1 }, "-=0.9");
                if (svgBox) tl.call(() => drawSVG(svgBox), null, "-=0.7");
                if (label) tl.to(label, { opacity: 1, marginTop: 0, duration: 0.9 }, "-=0.6");
                if (name) tl.to(name, { opacity: 1, marginTop: 0, duration: 0.9 }, "-=0.5");
            }
        });
    }

    // Инициализация скрытия проектов
    initHideProjects();
    window.addEventListener("scroll", animateProjectsOnScroll);

    // =============================================
    // WHEEL NAVIGATION
    // =============================================
    window.addEventListener("wheel", (e) => {
        if (!sectionMode) return;

        e.preventDefault();
        if (isManualScroll) return;
        if (!heroAnimationDone || sectionLocked) return;

        if (currentSection === "hero" && e.deltaY > 0) {
            goToAbout();
        } else if (currentSection === "about" && e.deltaY < 0) {
            goToHero();
        } else if (currentSection === "about" && e.deltaY > 0) {
            goToProjects();
        } else if (currentSection === "projects" && e.deltaY < 0) {
            goToAbout();
        }
    }, { passive: false });

// =============================================
// ABOUT COUNT ROTATION (first number black)
// =============================================
function startAboutCountRotation() {
    const items = document.querySelectorAll(".about-count");
    if (!items.length) return;

    let index = 0;

    function getGap() {
        const w = document.documentElement.clientWidth;
        if (w > 1980) return 200;
        if (w > 1600) return 160;
        if (w <= 1380) return 40;
        return 60;
    }

    const HEIGHT = 120;
    let GAP = getGap();

    // ======================================================
    // INITIAL STATES (with proper black first item)
    // ======================================================
    items.forEach((item, i) => {
        const span = item.querySelector("span");

        // MAIN FIRST ITEM — MUST BE BLACK FROM START
        if (i === 0) {
            gsap.set(item, {
                y: 0,
                opacity: 1,
                fontSize: "clamp(6rem, 10vw, 20rem)",
                color: "#000"
            });

            if (span) gsap.set(span, {
                opacity: 1,
                y: 0,
                color: "#999"
            });

            return;
        }

        // SECOND ITEM (preview)
        if (i === 1) {
            gsap.set(item, {
                y: HEIGHT + GAP,
                opacity: 0.15,
                fontSize: "clamp(3rem, 6vw, 10rem)",
                color: "#999"
            });
        }

        // ALL BELOW
        if (i > 1) {
            gsap.set(item, {
                y: (HEIGHT + GAP) * 1.25,
                opacity: 0,
                fontSize: "clamp(3rem, 6vw, 10rem)",
                color: "#999"
            });
        }

        if (span) gsap.set(span, { opacity: 0, y: 10, color: "#999" });
    });

    // ======================================================
    // ROTATION FUNCTION
    // ======================================================
    function rotate() {
        GAP = getGap();

        const current = items[index];
        const next = items[(index + 1) % items.length];
        const preview = items[(index + 2) % items.length];

        if (!current || !next || !preview) return;

        const currentSpan = current.querySelector("span");
        const nextSpan = next.querySelector("span");

        // HIDE CURRENT SPAN
        if (currentSpan) {
            gsap.to(currentSpan, {
                opacity: 0,
                y: 10,
                duration: 0.4,
                ease: "power2.in"
            });
        }

        // CURRENT GOES UP
        gsap.to(current, {
            y: -HEIGHT,
            opacity: 0,
            fontSize: "clamp(3rem, 6vw, 10rem)",
            color: "#999",
            duration: 1.2,
            ease: "power4.inOut"
        });

        // NEXT BECOMES MAIN BLACK NUMBER
        gsap.to(next, {
            y: 0,
            opacity: 1,
            fontSize: "clamp(6rem, 10vw, 20rem)",
            color: "#000",
            duration: 1.2,
            ease: "power4.inOut",
            onStart: () => {
                if (nextSpan) {
                    gsap.set(nextSpan, { color: "#999" });

                    gsap.fromTo(
                        nextSpan,
                        { opacity: 0, y: 10 },
                        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                    );
                }
            }
        });

        // PREPARE PREVIEW (BOTTOM)
        gsap.set(preview, {
            y: (HEIGHT + GAP) * 1.25,
            opacity: 0,
            fontSize: "clamp(3rem, 6vw, 10rem)",
            color: "#999"
        });

        // MOVE PREVIEW TO MIDDLE POSITION
        gsap.to(preview, {
            y: HEIGHT + GAP,
            opacity: 0.15,
            duration: 1.3,
            ease: "power4.out"
        });

        index = (index + 1) % items.length;
        setTimeout(rotate, 5000);
    }

    // START ROTATION AFTER DELAY
    setTimeout(rotate, 5000);

    window.addEventListener("resize", () => {
        GAP = getGap();
    });
}



    // =============================================
    // SECTION MODE MANAGEMENT
    // =============================================
    function disableSectionModeAfterProjects() {
        const projects = document.querySelector(".projects");
        if (!projects) return;

        const top = projects.offsetTop;
        const height = projects.offsetHeight;

        if (currentSection === "projects" && window.scrollY > top + height - 200) {
            sectionMode = false;
            sectionLocked = false;
        }
    }

    window.addEventListener("scroll", disableSectionModeAfterProjects);

    // =============================================
    // PROJECTS CARD-BY-CARD SCROLL SNAP
    // =============================================
    function initProjectsCardNavigation() {
        const wrap = document.querySelector(".projects-wrap");
        if (!wrap) return;

        const cards = Array.from(wrap.children);
        if (!cards.length) return;

        currentCardIndex = 0;

        function isInsideCardsZone() {
            const rect = wrap.getBoundingClientRect();
            return rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3;
        }

        function goToCard(i) {
            if (i < 0 || i >= cards.length) return;

            currentCardIndex = i;
            cardScrollLock = true;

            gsap.to(window, {
                duration: 0.85,
                scrollTo: { y: cards[i], offsetY: 0 },
                ease: "power3.inOut",
                onComplete: () => setTimeout(() => cardScrollLock = false, 60)
            });
        }

        function goToClients() {
            const clients = document.querySelector(".clients");
            if (!clients) return goToPhilosophy();

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: clients.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    startClientsAnimation();
                }
            });
        }

        function goToPhilosophy() {
            const philosophySection = document.querySelector(".philosophy");
            if (!philosophySection) return goToBlog();

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: philosophySection.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    startPhilosophyAnimation();
                }
            });
        }

        function goToBlog() {
            const blog = document.querySelector(".blog");
            if (!blog) return goToQuality();

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: blog.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    startBlogAnimation();
                }
            });
        }

        function goToQuality() {
            const quality = document.querySelector(".quality");
            if (!quality) return goToSocial();

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: quality.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    startQualityAnimation();
                }
            });
        }

        function goToSocial() {
            const social = document.querySelector(".social");
            if (!social) return;

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: social.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    startSocialAnimation();
                }
            });
        }

        window.addEventListener("wheel", (e) => {
            if (!isInsideCardsZone()) return;
            if (cardScrollLock) {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            if (e.deltaY > 0) {
                if (currentCardIndex === cards.length - 1) {
                    // Последовательный переход через все секции
                    if (document.querySelector(".clients") && !clientsAnimated) {
                        goToClients();
                    } else if (document.querySelector(".philosophy") && !philosophyAnimated) {
                        goToPhilosophy();
                    } else if (document.querySelector(".blog") && !blogAnimated) {
                        goToBlog();
                    } else if (document.querySelector(".quality") && !qualityAnimated) {
                        goToQuality();
                    } else if (document.querySelector(".social") && !socialAnimated) {
                        goToSocial();
                    }
                    return;
                }

                goToCard(currentCardIndex + 1);
                return;
            }

            if (e.deltaY < 0) {
                if (currentCardIndex === 0) {
                    sectionMode = true; 
                    return;
                }

                goToCard(currentCardIndex - 1);
            }

        }, { passive: false });
    }

    initProjectsCardNavigation();

    // =============================================
    // CLIENTS SECTION OBSERVER
    // =============================================
    function initClientsObserver() {
        const section = document.querySelector(".clients");
        if (!section) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                    gsap.to(section, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        pointerEvents: "auto"
                    });

                    startClientsAnimation();
                    observer.disconnect();
                }
            });
        }, {
            threshold: [0, 0.3, 0.6]
        });

        observer.observe(section);
    }

    initClientsObserver();

    // =============================================
    // CLIENTS SECTION ANIMATION
    // =============================================
function startClientsAnimation() {
    if (clientsAnimated) return;
    clientsAnimated = true;

    const section = document.querySelector(".clients");
    if (!section) return;

    const verticalLine = section.querySelector(".clients-line-vertical");
    const horizontalLine = section.querySelector(".clients-line-horizontal");
    const title = section.querySelector(".clients-title");
    const count = section.querySelector(".clients-count");
    const logos = section.querySelectorAll(".clients-logo");
    const more = section.querySelector(".clients-see-more");

    // Устанавливаем начальные состояния для линий
    gsap.set(verticalLine, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(horizontalLine, { scaleX: 0, transformOrigin: "left center" });
    
    gsap.set([title, count], { opacity: 0, y: 40 });
    gsap.set(logos, { opacity: 0, y: 30, filter: "blur(8px)" });
    gsap.set(more, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Анимация линий
    tl.to(verticalLine, { scaleY: 1, duration: 1.2 });
    tl.to(horizontalLine, { scaleX: 1, duration: 1.2 }, "-=0.6");

    // 2. Заголовок и счетчик
    tl.to(title, { opacity: 1, y: 0, duration: 0.8 }, "-=0.8");
    tl.to(count, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    // 3. Логотипы
    tl.to(logos, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        stagger: 0.12
    }, "-=0.3");

    // 4. Кнопка "See more"
    tl.to(more, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
}
// =============================================
// PHILOSOPHY SECTION OBSERVER
// =============================================
function initPhilosophyObserver() {
    const section = document.querySelector(".philosophy");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    pointerEvents: "auto"
                });

                startPhilosophyAnimation();
                observer.disconnect();
            }
        });
    }, {
        threshold: [0, 0.3, 0.6]
    });

    observer.observe(section);
}
initPhilosophyObserver();


// =============================================
// PREMIUM PHILOSOPHY ANIMATION
// =============================================
function startPhilosophyAnimation() {
    if (window.philosophyAnimated) return;
    window.philosophyAnimated = true;

    const section = document.querySelector(".philosophy");

    const title = section.querySelector(".philosophy-title");
    const description = section.querySelector(".philosophy-description");

    const teamImg = section.querySelector(".philosophy-column img");
    const slideText = section.querySelector(".philosophy-slide-text");

    const sliderWrap = section.querySelector(".philosophy-slider-wrap");
    const slides = section.querySelectorAll(".philosophy-slide-image");

    const controls = section.querySelector(".philosophy-controls");
    const progressSpan = section.querySelector(".philosophy-progress span");

    // INITIAL STATES — CLEAN AND SAFE
    gsap.set(title, { opacity: 0, y: 30, letterSpacing: "3px" });
    gsap.set(description, { opacity: 0, y: 40 });

    gsap.set(teamImg, { opacity: 0, scale: 1.15, y: 40 });
    gsap.set(slideText, { opacity: 0, y: 40 });

    gsap.set(sliderWrap, { opacity: 0, y: 50 });
    gsap.set(slides, { opacity: 0, y: 60, scale: 1.1 });

    gsap.set(controls, { opacity: 0, y: 20 });
    gsap.set(progressSpan, { width: "0%" });


    // PREMIUM TIMELINE
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Title
    tl.to(title, {
        opacity: 1,
        y: 0,
        letterSpacing: "0px",
        duration: 1.1,
        ease: "power4.out"
    });

    // 2. Description
    tl.to(description, {
        opacity: 1,
        y: 0,
        duration: 1
    }, "-=0.6");

    // 3. Team Image (zoom-out premium)
    tl.to(teamImg, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.1
    }, "-=0.5");

    // 4. Text under image
    tl.to(slideText, {
        opacity: 1,
        y: 0,
        duration: 1
    }, "-=0.7");

    // 5. Slider wrapper
    tl.to(sliderWrap, {
        opacity: 1,
        y: 0,
        duration: 1
    }, "-=0.7");

    // 6. Slides (image reveal stagger)
    tl.to(slides, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        stagger: 0.15
    }, "-=0.9");

    // 7. Controls
    tl.to(controls, {
        opacity: 1,
        y: 0,
        duration: 0.8
    }, "-=0.5");

    // 8. Progress bar animation (premium)
    tl.to(progressSpan, {
        width: "100%",
        duration: 1.2,
        ease: "power2.out"
    }, "-=0.6");
}


// =============================================
// BLOG SECTION OBSERVER
// =============================================
function initBlogObserver() {
    const section = document.querySelector(".blog");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    pointerEvents: "auto"
                });

                startBlogAnimation();
                observer.disconnect();
            }
        });
    }, {
        threshold: [0, 0.3, 0.6]
    });

    observer.observe(section);
}

initBlogObserver();


// =============================================
// BLOG SECTION ANIMATION
// =============================================
function startBlogAnimation() {
    if (window.blogAnimated) return;
    window.blogAnimated = true;

    const section = document.querySelector(".blog");
    if (!section) return;

    const title = section.querySelector(".blog-title");
    const sliderWrap = section.querySelector(".blog-slider-wrap");
    const prevBtn = section.querySelector(".blog-button-prev");
    const nextBtn = section.querySelector(".blog-button-next");
    const slides = section.querySelectorAll(".blog-slide");
    const slideImages = section.querySelectorAll(".blog-slide-image");

    // INITIAL STATES
    gsap.set(title, { opacity: 0, y: 40 });
    gsap.set(sliderWrap, { opacity: 0, y: 60 });
    gsap.set([prevBtn, nextBtn], { opacity: 0, x: -30 });

    // images = делает картинку во весь экран
    // scale = 2.2 — выглядит как fullscreen expansion
    gsap.set(slides, { opacity: 0 });
    gsap.set(slideImages, {
        scale: 2.2,
        opacity: 0,
        y: 40
    });


    // TIMELINE
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Title
    tl.to(title, {
        opacity: 1,
        y: 0,
        duration: 0.8
    });

    // 2. Slider wrapper
    tl.to(sliderWrap, {
        opacity: 1,
        y: 0,
        duration: 0.9
    }, "-=0.4");

    // 3. Buttons
    tl.to([prevBtn, nextBtn], {
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.1
    }, "-=0.3");

    // 4. Slides appear
    tl.to(slides, {
        opacity: 1,
        duration: 0.5
    }, "-=0.4");

    // 5. FULLSCREEN → NORMAL
    tl.to(slideImages, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.3,
        stagger: 0.2
    }, "-=0.3");
}


    // =============================================
    // QUALITY SECTION OBSERVER
    // =============================================
    function initQualityObserver() {
        const section = document.querySelector(".quality");
        if (!section) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                    gsap.to(section, {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: "power3.out",
                        pointerEvents: "auto"
                    });

                    startQualityAnimation();
                    observer.disconnect();
                }
            });
        }, {
            threshold: [0, 0.3, 0.6]
        });

        observer.observe(section);
    }

    initQualityObserver();
// =============================================
// QUALITY SECTION ANIMATION (PREMIUM)
// =============================================
function startQualityAnimation() {
    if (window.qualityAnimated) return;
    window.qualityAnimated = true;

    const section = document.querySelector(".quality");
    if (!section) return;

    const label = section.querySelector(".quality-label");
    const titleInner = section.querySelector(".quality-title-inner");
    const link = section.querySelector(".quality-link");

    gsap.set(label, { opacity: 0, y: 50, rotate: -5 });
    gsap.set(titleInner, { opacity: 0, y: 60 });
    gsap.set(link, { opacity: 0, scale: 0.8, rotate: -10 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(label, {
        opacity: 1,
        y: 0,
        rotate: 0,
        duration: 1
    })
    .to(titleInner, {
        opacity: 1,
        y: 0,
        duration: 1.2
    }, "-=0.6");

    gsap.to(titleInner, {
        x: "-50%",
        duration: 40,
        ease: "none",
        repeat: -1
    });

    tl.to(link, {
        opacity: 1,
        scale: 1,
        rotate: 0,
        duration: 0.8
    }, "-=0.4");
}



 // =============================================
// SOCIAL SECTION OBSERVER
// =============================================
function initSocialObserver() {
    const section = document.querySelector(".social");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    pointerEvents: "auto"
                });

                startSocialAnimation();
                observer.disconnect();
            }
        });
    }, {
        threshold: [0, 0.3, 0.6]
    });

    observer.observe(section);
}
initSocialObserver();

function createInfiniteMarquee(rowSelector, speed = 25, direction = 1, gap = 350) {
    console.group(`🔥 MARQUEE INIT: ${rowSelector}`);

    const row = document.querySelector(rowSelector);
    if (!row) {
        console.warn("❌ Row not found:", rowSelector);
        console.groupEnd();
        return;
    }

    const inner = row.querySelector(".social-marquee-inner");
    if (!inner) {
        console.warn("❌ .social-marquee-inner not found inside:", rowSelector);
        console.groupEnd();
        return;
    }

    // устанавливаем gap
    inner.style.gap = gap + "px";

    // исходные карточки
    const originalItems = Array.from(inner.children);
    console.log("📦 originalItems length:", originalItems.length);

    originalItems.forEach((item, i) => {
        console.log(
            `  ▸ original item[${i}] width:`,
            item.getBoundingClientRect().width
        );
    });

    // считаем базовую ширину одного набора
    const baseWidth = originalItems.reduce((acc, item) => {
        const w = item.getBoundingClientRect().width;
        return acc + w + gap;
    }, 0);

    console.log("📏 baseWidth (one set):", baseWidth);

    // очищаем ленту
    inner.innerHTML = "";

    // клонируем набор 3 раза подряд
    for (let i = 0; i < 3; i++) {
        originalItems.forEach((item, idx) => {
            const clone = item.cloneNode(true);
            inner.appendChild(clone);
        });
    }

    const allItems = Array.from(inner.children);
    console.log("📦 after clone allItems length:", allItems.length);
    console.log("📐 inner.scrollWidth after clone:", inner.scrollWidth);

    const loopWidth = baseWidth;
    console.log("🔁 loopWidth used in GSAP:", loopWidth);
    console.log("⚙ direction:", direction, " speed:", speed, " gap:", gap);

    gsap.set(inner, { x: 0 });

    // ИСПРАВЛЕННЫЙ МОДИФИКАТОР ДЛЯ ВСЕХ НАПРАВЛЕНИЙ
    gsap.to(inner, {
        x: direction === 1 ? -loopWidth : loopWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
        onStart: () => {
            console.log(`▶ GSAP started for ${rowSelector}`);
        },
        onRepeat: () => {
            console.log(`🔄 GSAP repeat for ${rowSelector}`);
        },
        modifiers: {
            x: gsap.utils.unitize(x => {
                const raw = parseFloat(x);
                let modded;
                
                if (direction === 1) {
                    // Движение влево (стандартное)
                    modded = raw % -loopWidth;
                } else {
                    // Движение вправо - ИСПРАВЛЕННАЯ ЛОГИКА
                    modded = (raw % loopWidth) - loopWidth;
                }

                if (!inner._modLogCount) inner._modLogCount = 0;
                if (inner._modLogCount < 5) {
                    console.log(
                        `   ✏ modifiers.x (${rowSelector}) raw:`,
                        raw,
                        "=> modded:",
                        modded,
                        "direction:",
                        direction
                    );
                    inner._modLogCount++;
                }

                return modded;
            })
        }
    });

    // анимация появления
    gsap.to(inner, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        onComplete: () => {
            console.log(`✅ appear tween complete for ${rowSelector}`);
            console.groupEnd();
        }
    });
}
// =============================================
// SOCIAL MASTER ANIMATION - С ТАЙМЛАЙНОМ
// =============================================
function startSocialAnimation() {
    if (window.socialAnimated) return;
    window.socialAnimated = true;

    const section = document.querySelector(".social");
    const links = section.querySelectorAll(".social-link");
    const title = section.querySelector(".social-title");

    gsap.set(links, { opacity: 0, y: 40 });
    gsap.set(title, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Links
    tl.to(links, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08
    });

    // Title
    tl.to(title, {
        opacity: 1,
        scale: 1,
        duration: 1
    }, "-=0.5");

    // Запускаем три ленты ПО ОЧЕРЕДИ В ТАЙМЛАЙНЕ
    tl.call(() => createInfiniteMarquee(".marquee-1", 40, 1), [], "+=0.3")
      .call(() => createInfiniteMarquee(".marquee-2", 28, -1), [], "+=0.2")
      .call(() => createInfiniteMarquee(".marquee-3", 34, 1), [], "+=0.1");
}


    // =============================================
    // SMOOTH TRANSITIONS BETWEEN ALL SECTIONS
    // =============================================
    function initSmoothTransitions() {
        const allSections = [
            { selector: '.hero', animated: () => true, startAnimation: startHeroAnimation },
            { selector: '.about', animated: () => aboutAnimationDone, startAnimation: startAboutAnimation },
            { selector: '.projects', animated: () => projectsAnimated, startAnimation: startProjectsAnimation },
            { selector: '.clients', animated: () => clientsAnimated, startAnimation: startClientsAnimation },
            { selector: '.philosophy', animated: () => philosophyAnimated, startAnimation: startPhilosophyAnimation },
            { selector: '.blog', animated: () => blogAnimated, startAnimation: startBlogAnimation },
            { selector: '.quality', animated: () => qualityAnimated, startAnimation: startQualityAnimation },
            { selector: '.social', animated: () => socialAnimated, startAnimation: startSocialAnimation }
        ];

        function getCurrentSection() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            for (let i = allSections.length - 1; i >= 0; i--) {
                const section = allSections[i];
                const element = document.querySelector(section.selector);
                if (!element) continue;
                
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + scrollY;
                const elementBottom = elementTop + element.offsetHeight;
                
                // Если секция видна в окне
                if (scrollY >= elementTop - windowHeight * 0.3 && scrollY <= elementBottom - windowHeight * 0.3) {
                    return { section: section, index: i };
                }
            }
            return null;
        }

        function goToSection(index) {
            if (index < 0 || index >= allSections.length) return;
            
            const targetSection = allSections[index];
            const element = document.querySelector(targetSection.selector);
            if (!element) return;

            cardScrollLock = true;

            gsap.to(window, {
                duration: 1.1,
                scrollTo: element.offsetTop,
                ease: "power3.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        cardScrollLock = false;
                    }, 150);

                    // Запускаем анимацию если она еще не была запущена
                    if (!targetSection.animated()) {
                        targetSection.startAnimation();
                    }
                }
            });
        }

        function handleSectionWheel(e) {
            if (cardScrollLock) return;
            if (sectionMode && currentSection !== "projects") return;

            const current = getCurrentSection();
            if (!current) return;

            e.preventDefault();

            if (e.deltaY > 0) {
                // Скролл вниз - переходим к следующей секции
                if (current.index < allSections.length - 1) {
                    goToSection(current.index + 1);
                }
            } else if (e.deltaY < 0) {
                // Скролл вверх - переходим к предыдущей секции
                if (current.index > 0) {
                    goToSection(current.index - 1);
                }
            }
        }

        window.addEventListener('wheel', handleSectionWheel, { passive: false });
    }

    initSmoothTransitions();
});
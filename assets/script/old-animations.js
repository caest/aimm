 // =============================================
// PAGE INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
    // =============================================
// HIDE CLIENTS ON LOAD
// =============================================
function initHideClients() {
    const sec = document.querySelector(".clients");
    if (!sec) return;

    gsap.set(sec, {
        opacity: 0,
        y: 120,
        pointerEvents: "none"
    });
}

initHideClients();




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

        gsap.set(".hero-line-vertical", {
            scaleY: 0,
            transformOrigin: "top center"
        });

        gsap.set(".hero-line-horizontal", {
            scaleX: 0,
            transformOrigin: "left center"
        });

        const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => {
                heroAnimationDone = true;
                sectionLocked = false;
                isManualScroll = false;
                heroScrollEnabled = true;
            }
        });

        tl.to(".hero-line-vertical", { scaleY: 1, duration: 1.4 });
        tl.to(".hero-line-horizontal", { scaleX: 1, duration: 1.4 }, "-=0.7");
        tl.from(".hero-title-row", {
            opacity: 0,
            y: 40,
            duration: 2,
            stagger: 0.25
        });
        tl.from(".hero-anim", {
            opacity: 0,
            x: -40,
            duration: 1
        }, "-=1.6");
        tl.from(".hero-description", {
            opacity: 0,
            y: 25,
            duration: 0.8
        }, "-=1.2");
        tl.from(".hero-link", {
            opacity: 0,
            x: -50,
            duration: 1
        });
        tl.from(".hero-scroll", {
            opacity: 0,
            y: 20,
            duration: 1
        }, "-=1");
    }

    // =============================================
    // ABOUT ANIMATION
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

        gsap.set(vertical, { opacity: 0, scaleY: 0, transformOrigin: "top center" });
        gsap.set(horizontal, { opacity: 0, scaleX: 0, transformOrigin: "left center" });
        gsap.set(slider, { opacity: 0, y: 40 });

        if (sliderFraction) gsap.set(sliderFraction, { opacity: 0, x: 60 });
        if (circle) gsap.set(circle, { opacity: 0, x: 80 });
        if (marquee) gsap.set(marquee, { opacity: 0, y: 20 });
        if (description) gsap.set(description, { opacity: 0, y: 30 });
        if (counts[0]) gsap.set(counts[0], { opacity: 0, y: "+=50" });

        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.to(vertical, { opacity: 1, scaleY: 1, duration: 1.2 });
        tl.to(horizontal, { opacity: 1, scaleX: 1, duration: 1.2 }, "-=0.6");
        tl.to(slider, { opacity: 1, y: 0, duration: 0.7 }, "-=0.3");

        if (sliderFraction) tl.to(sliderFraction, { opacity: 1, x: 0, duration: 0.8 }, "-=0.2");
        if (marquee) tl.to(marquee, { opacity: 1, y: 0, duration: 0.8 }, "-=0.1");
        if (circle) tl.to(circle, { opacity: 1, x: 0, duration: 0.8 }, "-=0.4");
        if (description) tl.to(description, { opacity: 1, y: 0, duration: 0.9 }, "-=0.1");

        const firstCount = counts[0];
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

    // =============================================
    // HERO BUTTONS MANAGEMENT
    // =============================================
    function showHeroButtons() {
        gsap.to([".hero-link", ".hero-scroll"], {
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
    // PROJECTS NAVIGATION
    // =============================================
    function goToProjects() {
        if (sectionLocked) return;

        const projects = document.querySelector(".projects");
        if (!projects) return;

        sectionLocked = true;
        currentSection = "projects";

        gsap.to([".hero-link", ".hero-scroll"], {
            opacity: 0,
            y: 20,
            duration: 0.5,
            ease: "power3.out"
        });

        gsap.to(window, {
            duration: 1.1,
            scrollTo: projects.offsetTop,
            ease: "power3.inOut",
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
    // PROJECTS CARDS ANIMATION
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

    function initHideProjectCards() {
        const cards = document.querySelectorAll(
            ".projects-one, .projects-second, .projects-third, .projects-four"
        );

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

    initHideProjectCards();
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
    // ABOUT COUNT ROTATION
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

        items.forEach((item, i) => {
            const span = item.querySelector("span");
            if (i === 0) return;

            if (i === 1) {
                gsap.set(item, {
                    y: HEIGHT + GAP,
                    opacity: 0.15,
                    fontSize: "clamp(3rem, 6vw, 10rem)",
                    color: "#999"
                });
                if (span) gsap.set(span, { opacity: 0, y: 10 });
            } else {
                gsap.set(item, {
                    y: (HEIGHT + GAP) * 1.25,
                    opacity: 0,
                    fontSize: "clamp(3rem, 6vw, 10rem)",
                    color: "#999"
                });
                if (span) gsap.set(span, { opacity: 0, y: 10 });
            }
        });

        function rotate() {
            GAP = getGap();

            const current = items[index];
            const next = items[(index + 1) % items.length];
            const preview = items[(index + 2) % items.length];

            if (!current || !next || !preview) return;

            const currentSpan = current.querySelector("span");
            const nextSpan = next.querySelector("span");

            if (currentSpan) {
                gsap.to(currentSpan, {
                    opacity: 0,
                    y: 10,
                    duration: 0.4,
                    ease: "power2.in"
                });
            }

            gsap.to(current, {
                y: -HEIGHT,
                opacity: 0,
                fontSize: "clamp(3rem, 6vw, 10rem)",
                color: "#999",
                duration: 1.2,
                ease: "power4.inOut"
            });

            gsap.to(next, {
                y: 0,
                opacity: 1,
                fontSize: "clamp(6rem, 10vw, 20rem)",
                color: "#000",
                duration: 1.2,
                ease: "power4.inOut",
                onStart: () => {
                    if (nextSpan) {
                        gsap.fromTo(
                            nextSpan,
                            { opacity: 0, y: 10 },
                            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
                        );
                    }
                }
            });

            gsap.set(preview, {
                y: (HEIGHT + GAP) * 1.25,
                opacity: 0,
                fontSize: "clamp(3rem, 6vw, 10rem)",
                color: "#999"
            });

            gsap.to(preview, {
                y: HEIGHT + GAP,
                opacity: 0.15,
                duration: 1.3,
                ease: "power4.out"
            });

            index = (index + 1) % items.length;
            setTimeout(rotate, 5000);
        }

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
// PROJECTS CARD-BY-CARD SCROLL SNAP (with jump to clients)
// =============================================
(function () {

    const wrap = document.querySelector(".projects-wrap");
    const clients = document.querySelector(".clients");
    if (!wrap) return;

    const cards = Array.from(wrap.children);
    if (!cards.length) return;

    let index = 0;
    let cardScrollLock = false;

    function isInsideCardsZone() {
        const rect = wrap.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.7;
    }

    function goToCard(i) {
        if (i < 0 || i >= cards.length) return;

        index = i;
        cardScrollLock = true;

        gsap.to(window, {
            duration: 0.85,
            scrollTo: { y: cards[i], offsetY: 0 },
            ease: "power3.inOut",
            onComplete: () => setTimeout(() => cardScrollLock = false, 60)
        });
    }

    function goToClients() {
        if (!clients) return;

        cardScrollLock = true;

        gsap.to(window, {
            duration: 1.1,
            scrollTo: clients.offsetTop,
            ease: "power3.inOut",
            onComplete: () => {
                setTimeout(() => {
                    cardScrollLock = false;
                }, 150);

                startClientsAnimation(); // <<< запускаем TL секции Clients
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

        // вниз
        if (e.deltaY > 0) {

            // если последняя карточка → переходим к clients
            if (index === cards.length - 1) {
                goToClients();
                return;
            }

            goToCard(index + 1);
            return;
        }

        // вверх
        if (e.deltaY < 0) {

            if (index === 0) {
                sectionMode = true; 
                return;
            }

            goToCard(index - 1);
        }

    }, { passive: false });

})();
// =============================================
// CLIENTS SECTION TRIGGER — запускается только когда секция входит в экран
// =============================================
function initClientsObserver() {
    const section = document.querySelector(".clients");
    if (!section) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {

                // плавное появление всей секции
                gsap.to(section, {
                    opacity: 1,
                    y: 0,
                    duration: 0.9,
                    ease: "power3.out",
                    pointerEvents: "auto"
                });

                // старт анимации логотипов
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
let clientsAnimated = false;

function startClientsAnimation() {

    if (clientsAnimated) return;
    clientsAnimated = true;

    const section = document.querySelector(".clients");
    if (!section) return;

    const title = section.querySelector(".clients-title");
    const count = section.querySelector(".clients-count");

    const logos = section.querySelectorAll(".clients-logo");
    const more = section.querySelector(".clients-see-more");

    gsap.set([title, count], { opacity: 0, y: 40 });
    gsap.set(logos, { opacity: 0, y: 30, filter: "blur(8px)" });
    gsap.set(more, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(title, { opacity: 1, y: 0, duration: 0.8 });
    tl.to(count, { opacity: 1, y: 0, duration: 0.8 }, "-=0.6");

    tl.to(logos, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        stagger: 0.12
    }, "-=0.3");

    tl.to(more, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4");
}


});
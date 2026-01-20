document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

    const sectionSelectors = [
        ".hero",
        ".about",
        ".projects",
        ".projects-second-wrap",
        ".projects-four-wrap",
        ".clients",
        ".philosophy",
        ".blog",
        ".quality",
        ".social",
    ];

    const sections = sectionSelectors
        .map(sel => document.querySelector(sel))
        .filter(Boolean);

    initSectionScroll(sections);
    initParallax();
    initSectionTimelines(sections);
});


// ======================================================
// SECTION SCROLL (как у тебя было)
// ======================================================
function initSectionScroll(sections) {
    let isBusy = false;
    let currentIndex = getClosestSectionIndex(sections);

    window.addEventListener("wheel", (e) => {
        if (isBusy) return;

        const direction = e.deltaY > 0 ? 1 : -1;
        const nextIndex = currentIndex + direction;
        if (!sections[nextIndex]) return;

        isBusy = true;

        gsap.to(window, {
            duration: 1.0,
            scrollTo: sections[nextIndex],
            ease: "power3.out",
            onComplete: () => {
                currentIndex = nextIndex;
                isBusy = false;
            }
        });
    }, { passive: true });
}


// ======================================================
// PARALLAX (как у тебя было)
// ======================================================
function initParallax() {
    gsap.utils.toArray(".parallax").forEach(el => {
        gsap.to(el, {
            yPercent: -20,
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}


// ======================================================
// ФУНКЦИЯ: Получить ближайшую секцию
// ======================================================
function getClosestSectionIndex(sections) {
    let closestIndex = 0;
    let minDistance = Infinity;

    sections.forEach((sec, i) => {
        const dist = Math.abs(sec.getBoundingClientRect().top);
        if (dist < minDistance) {
            minDistance = dist;
            closestIndex = i;
        }
    });

    return closestIndex;
}


// ======================================================
// MAIN: СОЗДАЁМ ТАЙМЛАЙНЫ ДЛЯ КАЖДОЙ СЕКЦИИ
// ======================================================
function initSectionTimelines(sections) {

    sections.forEach(section => {

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                once: true
            }
        });

        // подключаем функции таймлайнов по селектору
        if (section.classList.contains("hero")) heroTimeline(tl, section);
        if (section.classList.contains("about")) aboutTimeline(tl, section);
        if (section.classList.contains("projects")) projectsTimeline(tl, section);
        if (section.classList.contains("projects-second-wrap")) projectsSecondTimeline(tl, section);
        if (section.classList.contains("projects-four-wrap")) projectsFourTimeline(tl, section);
        if (section.classList.contains("clients")) clientsTimeline(tl, section);
        if (section.classList.contains("philosophy")) philosophyTimeline(tl, section);
        if (section.classList.contains("blog")) blogTimeline(tl, section);
        if (section.classList.contains("quality")) qualityTimeline(tl, section);
        if (section.classList.contains("social")) socialTimeline(tl, section);
    });
}

function heroTimeline(tl, section) {
    const rows = section.querySelectorAll(".hero-title-row");

    rows.forEach(row => {
        const text = row.innerText.trim();
        const chars = text
            .split("")
            .map(c => c === " "
                ? `<span class="char space"> </span>`
                : `<span class="char">${c}</span>`
            )
            .join("");
        row.innerHTML = chars;
    });

    const chars = section.querySelectorAll(".char");

    tl.from(chars, {
        opacity: 0,
        y: () => gsap.utils.random(30, 70),
        x: () => gsap.utils.random(-25, 25),
        rotateX: () => gsap.utils.random(-35, 35),
        rotateY: () => gsap.utils.random(-20, 20),
        duration: 0.9,
        ease: "power3.out",
        stagger: {
            each: 0.055,
            from: "start"
        }
    });

    const desc = section.querySelector(".hero-description");
    const descText = desc.innerText;
    const descChars = descText
        .split("")
        .map(c => c === " "
            ? `<span class="desc-char space"> </span>`
            : `<span class="desc-char">${c}</span>`
        )
        .join("");
    desc.innerHTML = descChars;

    const dChars = desc.querySelectorAll(".desc-char");

    tl.from(dChars, {
        opacity: 0,
        y: () => gsap.utils.random(10, 25),
        x: () => gsap.utils.random(-10, 10),
        rotateX: () => gsap.utils.random(-10, 10),
        duration: 0.6,
        ease: "power2.out",
        stagger: {
            each: 0.015,
            from: "start"
        }
    }, "-=0.5");

    tl.from(section.querySelector(".swiper-slide-active img"), {
    opacity: 0,
    scale: 2,
    duration: 1.2,
    ease: "power3.out"
}, "-=0.3");

tl.from(section.querySelector(".swiper-slide-active .hero-slider-link"), {
    opacity: 0,
    x: 40,
    duration: 0.8,
    ease: "power3.out"
});

const bullets = section.querySelectorAll(".hero-slider-pagination .swiper-pagination-bullet");

tl.from(bullets, {
    opacity: 0,
    scale: 0,
    duration: 0.45,
    ease: "back.out(1.8)",
    stagger: 0.07
}, "-=0.2");



tl.from(section.querySelector(".swiper-fraction"), {
    opacity: 0,
    y: 12,
    duration: 0.5,
    ease: "power3.out"
});

const fraction = section.querySelector(".swiper-fraction");
const fractionText = fraction.innerText.trim();
const fractionChars = fractionText
    .split("")
    .map(c => c === " "
        ? `<span class="fraction-char space"> </span>`
        : `<span class="fraction-char">${c}</span>`
    )
    .join("");

fraction.innerHTML = fractionChars;

const fChars = fraction.querySelectorAll(".fraction-char");

tl.from(fChars, {
    opacity: 0,
    y: () => gsap.utils.random(10, 25),
    x: () => gsap.utils.random(-10, 10),
    rotateX: () => gsap.utils.random(-10, 10),
    rotateY: () => gsap.utils.random(-5, 5),
    duration: 0.45,
    ease: "power2.out",
    stagger: {
        each: 0.015,
        from: "start"
    }
}, "-=0.25");



// PROGRESS BAR
const progress = section.querySelector(".hero-slider-progress span");
tl.from(progress, {
    width: 0,
    duration: 1,
    ease: "power2.out"
}, "-=0.4");

// CAPTION — LETTER REVEAL
const caption = section.querySelector(".hero-slider-caption");
const captionText = caption.innerText.trim();
const captionChars = captionText
    .split("")
    .map(c => c === " "
        ? `<span class="cap-char space"> </span>`
        : `<span class="cap-char">${c}</span>`
    ).join("");

caption.innerHTML = captionChars;

const cChars = caption.querySelectorAll(".cap-char");

tl.from(cChars, {
    opacity: 0,
    y: 15,
    x: () => gsap.utils.random(-10, 10),
    rotateX: () => gsap.utils.random(-10, 10),
    duration: 0.55,
    ease: "power2.out",
    stagger: {
        each: 0.012,
        from: "start"
    }
}, "-=0.3");

tl.from(section.querySelector(".hero-slider-prev"), {
    opacity: 0,
    rotateY: -90,
    duration: 0.7,
    ease: "power3.out"
}, "-=0.2");

tl.from(section.querySelector(".hero-slider-next"), {
    opacity: 0,
    rotateY: 90,
    duration: 0.7,
    ease: "power3.out"
}, "-=0.35");


tl.from(section.querySelector(".hero-link"), {
    opacity: 0,
    filter: "blur(6px)",
    duration: 0.8,
    ease: "power1.out"
}, "-=0.3");


}


function aboutTimeline(tl, section) {
    // сюда анимации about
}

function projectsTimeline(tl, section) {
    // сюда анимации projects
}

function projectsSecondTimeline(tl, section) {
    // сюда анимации второго блока projects
}

function projectsFourTimeline(tl, section) {
    // сюда анимации четвертого блока projects
}

function clientsTimeline(tl, section) {
    // сюда анимации clients
}

function philosophyTimeline(tl, section) {
    // сюда анимации philosophy
}

function blogTimeline(tl, section) {
    // сюда анимации blog
}

function qualityTimeline(tl, section) {
    // сюда анимации quality
}

function socialTimeline(tl, section) {
    // сюда анимации social
}

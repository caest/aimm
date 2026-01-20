// =======================================================
// VLOGS PAGE — FULL PREMIUM ANIMATION FILE (FINAL VERSION)
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined") {
        console.error("GSAP not loaded");
        return;
    }
    if (typeof ScrollTrigger === "undefined") {
        console.error("ScrollTrigger not loaded");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    animatePremiumVlogsTitle();
    animatePremiumDescription();
    initVlogsAnimations();
});



// =======================================================
// SPLIT LETTERS (FIXED SPACES)
// =======================================================
function splitTextToSpans(element) {
    const text = element.textContent.trim();
    const chars = text.split(/(?<=.)/);

    element.innerHTML = "";

    chars.forEach(char => {
        const span = document.createElement("span");
        span.innerHTML = char === " " ? "&nbsp;" : char;
        element.appendChild(span);
    });

    return element.querySelectorAll("span");
}



// =======================================================
// SPLIT DESCRIPTION INTO WORDS
// =======================================================
function splitTextToWords(element) {
    const words = element.textContent.trim().split(" ");
    element.innerHTML = "";

    return words.map(word => {
        const span = document.createElement("span");
        span.textContent = word;

        span.style.display = "inline-block";
        span.style.whiteSpace = "nowrap";
        span.style.marginRight = "8px";

        element.appendChild(span);
        return span;
    });
}



// =======================================================
// PREMIUM TITLE (LETTERS)
// =======================================================
function animatePremiumVlogsTitle() {
    const title = document.querySelector(".vlogs-title");
    if (!title) return;

    const chars = splitTextToSpans(title);

    gsap.set(chars, {
        display: "inline-block",
        opacity: 0,
        y: 70,
        rotateX: -55,
        skewY: 10,
        filter: "blur(14px)",
        transformOrigin: "0% 50%",
        clipPath: "inset(0 0 100% 0)"
    });

    gsap.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        skewY: 0,
        filter: "blur(0px)",
        clipPath: "inset(0 0 0 0)",
        duration: 1.25,
        ease: "power4.out",
        stagger: {
            each: 0.018,
            from: "start"
        },
        scrollTrigger: {
            trigger: title,
            start: "top 85%",
            once: true
        }
    });
}



// =======================================================
// PREMIUM DESCRIPTION (WORDS)
// =======================================================
function animatePremiumDescription() {
    const descr = document.querySelector(".vlogs-description");
    if (!descr) return;

    const words = splitTextToWords(descr);

    gsap.set(words, {
        opacity: 0,
        y: 40,
        rotateX: -30,
        skewY: 8,
        filter: "blur(14px)",
        clipPath: "inset(0 0 100% 0)",
        transformOrigin: "0% 50%"
    });

    gsap.to(words, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        skewY: 0,
        filter: "blur(0px)",
        clipPath: "inset(0 0 0 0)",
        duration: 1.1,
        ease: "power3.out",
        stagger: {
            each: 0.045,
            from: "start"
        },
        scrollTrigger: {
            trigger: descr,
            start: "top 90%",
            once: true
        }
    });
}



// =======================================================
// SECTION ANIMATIONS (CARDS + IMAGES)
// =======================================================
function initVlogsAnimations() {
    const section = document.querySelector(".vlogs");
    if (!section) return;

    const items = section.querySelectorAll(".vlogs-item");
    const images = section.querySelectorAll(".vlogs-item img");

    gsap.set(section, { opacity: 1, visibility: "visible" });

    gsap.set(items, {
        opacity: 0,
        y: 90,
        scale: 0.88,
        filter: "blur(12px)"
    });

    gsap.set(images, {
        scale: 1.15,
        y: 35,
        filter: "brightness(0.65) blur(10px)"
    });

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            once: true
        },
        defaults: { duration: 1.2, ease: "power4.out" }
    });

    tl.to(items, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        stagger: {
            each: 0.1,
            from: "center"
        }
    }, 0.1);

    tl.to(images, {
        scale: 1,
        y: 0,
        filter: "brightness(1) blur(0px)",
        duration: 1.6,
        ease: "power4.out",
        stagger: {
            each: 0.08,
            from: "center"
        }
    }, "-=0.9");

    images.forEach(img => {
        gsap.to(img, {
            yPercent: -12,
            ease: "none",
            scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.25
            }
        });
    });

    items.forEach(item => {
        const img = item.querySelector("img");
        const text = item.querySelector("p");

        item.addEventListener("mouseenter", () => {
            gsap.to(item, {
                y: -6,
                scale: 1.03,
                duration: 0.35,
                ease: "power3.out"
            });

            gsap.to(img, {
                y: -12,
                scale: 1.05,
                filter: "brightness(1.15)",
                duration: 0.4,
                ease: "power3.out"
            });

            if (text) {
                gsap.to(text, {
                    y: -4,
                    letterSpacing: "0.06em",
                    duration: 0.35,
                    ease: "power3.out"
                });
            }
        });

        item.addEventListener("mouseleave", () => {
            gsap.to(item, {
                y: 0,
                scale: 1,
                duration: 0.45,
                ease: "power3.out"
            });

            gsap.to(img, {
                y: 0,
                scale: 1,
                filter: "brightness(1)",
                duration: 0.45,
                ease: "power3.out"
            });

            if (text) {
                gsap.to(text, {
                    y: 0,
                    letterSpacing: "0.02em",
                    duration: 0.35,
                    ease: "power3.out"
                });
            }
        });
    });
}

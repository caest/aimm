// ===============================================================
// PROJECTS PAGE — PREMIUM ANIMATION (NO WORD SPLIT, NO LETTERS)
// Architectural Slide-In + Parallax Lift + Smooth Stagger
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {
    animateProjectsPage();
});

function animateProjectsPage() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const title = document.querySelector(".projects-page-top .projects-page-title");
    const description = document.querySelector(".projects-page-description");
    const count = document.querySelector(".projects-page-count");
    const filters = document.querySelectorAll(".projects-page-filters button");
    const items = document.querySelectorAll(".projects-page-item");
    const contactTitle = document.querySelector(".projects-page-contact .projects-page-title");
    const contactButton = document.querySelector(".projects-page-button");

    // -----------------------------------------------------------
    // 1) MAIN TITLE — ARCHITECTURAL SLIDE + PARALLAX
    // -----------------------------------------------------------
    if (title) {
        gsap.set(title, { opacity: 0, y: 60, rotateX: 12, transformOrigin: "top center" });

        tl.to(title, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 1.3
        }, 0.1);

        // легкий premium micro-pulse
        tl.to(title, {
            y: -6,
            duration: 0.9,
            ease: "power1.inOut"
        }, "-=0.9");

        tl.to(title, {
            y: 0,
            duration: 0.9,
            ease: "power1.inOut"
        }, "-=0.5");
    }

    // -----------------------------------------------------------
    // 2) DESCRIPTION — SMOOTH FADE + DELAYED MOTION
    // -----------------------------------------------------------
    if (description) {
        gsap.set(description, { opacity: 0, y: 40 });

        tl.to(description, {
            opacity: 1,
            y: 0,
            duration: 1.1
        }, 0.45);
    }

    // -----------------------------------------------------------
    // 3) COUNT (92 / Realised ideas) — PREMIUM SCALE POP
    // -----------------------------------------------------------
    if (count) {
        gsap.set(count, { opacity: 0, y: 60, scale: 0.8 });

        tl.to(count, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "back.out(1.8)"
        }, 0.65);
    }

    // -----------------------------------------------------------
    // 4) FILTER BUTTONS — ARCHITECTURAL STAGGER
    // -----------------------------------------------------------
    if (filters.length > 0) {
        gsap.set(filters, { opacity: 0, y: 30 });

        tl.to(filters, {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08
        }, 0.9);
    }

    // -----------------------------------------------------------
    // 5) PROJECT CARD ITEMS — PREMIUM MASONRY STAGGER
    // -----------------------------------------------------------
    if (items.length > 0) {
        gsap.set(items, { opacity: 0, y: 70 });

        tl.to(items, {
            opacity: 1,
            y: 0,
            duration: 1.15,
            stagger: {
                amount: 1.0,
                from: "start"
            }
        }, 1.2);
    }

    // -----------------------------------------------------------
    // 6) CONTACT BLOCK TITLE — CLEAN FADE
    // -----------------------------------------------------------
    if (contactTitle) {
        gsap.set(contactTitle, { opacity: 0, y: 40 });

        tl.to(contactTitle, {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power3.out"
        }, "+=0.2");
    }

    // -----------------------------------------------------------
    // 7) CONTACT BUTTON — SLIDE UP + MICRO SCALE POP
    // -----------------------------------------------------------
    if (contactButton) {
        gsap.set(contactButton, { opacity: 0, y: 50, scale: 0.92 });

        tl.to(contactButton, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out"
        }, "-=0.6");
    }
}

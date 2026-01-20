// =======================================================
// CONTACTS — CINEMATIC SPLIT REVEAL (NEW PREMIUM VARIANT)
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    const tl = gsap.timeline({
        defaults: { duration: 1.2, ease: "power4.out" }
    });

    // ------------------------------------------------------
    // 1) Build two animated split-bars for the cinematic feel
    // ------------------------------------------------------
    const section = document.querySelector(".contacts");
    if (section) {
        const barTop = document.createElement("div");
        const barBottom = document.createElement("div");

        barTop.className = "contacts-split-bar contacts-split-bar-top";
        barBottom.className = "contacts-split-bar contacts-split-bar-bottom";

        section.prepend(barTop);
        section.append(barBottom);

        gsap.set([barTop, barBottom], {
            height: "0%",
            opacity: 1,
            background: "#000",
            position: "absolute",
            left: 0,
            right: 0,
            zIndex: 50
        });

        gsap.set(barTop, { top: 0 });
        gsap.set(barBottom, { bottom: 0 });

        tl.to(barTop, {
            height: "48%",
            duration: 0.9
        }, 0);

        tl.to(barBottom, {
            height: "52%",
            duration: 0.9
        }, 0);

        tl.to([barTop, barBottom], {
            height: 0,
            duration: 1.1,
            ease: "power4.inOut"
        }, 0.9);
    }

    // ------------------------------------------------------
    // 2) CIRCLE — kinetic overshoot entrance
    // ------------------------------------------------------
    const circle = document.querySelector(".contacts-circle");
    if (circle) {
        gsap.set(circle, { opacity: 0, scale: 0.7, y: 30 });

        tl.to(circle, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.3,
            ease: "back.out(2.4)"
        }, 0.65);
    }

    // ------------------------------------------------------
    // 3) TITLE — cinematic vertical slide + fade
    // ------------------------------------------------------
    const title = document.querySelector(".contacts-title");
    if (title) {
        gsap.set(title, { opacity: 0, y: 60 });

        tl.to(title, {
            opacity: 1,
            y: 0,
            duration: 1.35
        }, 0.75);
    }

    // ------------------------------------------------------
    // 4) IMAGE — smooth 2-phase kinetic entrance
    // ------------------------------------------------------
    const image = document.querySelector(".contacts__image");
    if (image) {
        gsap.set(image, { opacity: 0, y: 80, scale: 1.1 });

        tl.to(image, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.45,
            ease: "power3.out"
        }, 0.9);

        // micro movement to add premium feel
        tl.to(image, {
            y: -6,
            duration: 1.1,
            ease: "power1.inOut"
        }, "-=1.1");

        tl.to(image, {
            y: 0,
            duration: 1.1,
            ease: "power1.inOut"
        }, "-=0.4");
    }

    // ------------------------------------------------------
    // 5) INFO COLS — staggered cinematic reveal from below
    // ------------------------------------------------------
    const cols = document.querySelectorAll(".contacts-info-col");
    if (cols.length > 0) {
        cols.forEach((col, i) => {
            gsap.set(col, { opacity: 0, y: 45 });

            tl.to(col, {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: "power3.out"
            }, 1.05 + i * 0.18);
        });
    }

    // ------------------------------------------------------
    // 6) SOCIAL — sharp short stagger to finish the motion
    // ------------------------------------------------------
    const socials = document.querySelectorAll(".contacts-info-social");
    if (socials.length > 0) {
        gsap.set(socials, { opacity: 0, y: 20 });

        tl.to(socials, {
            opacity: 1,
            y: 0,
            stagger: 0.07,
            duration: 0.7,
            ease: "power2.out"
        }, "-=0.4");
    }

});

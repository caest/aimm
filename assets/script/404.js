// =======================================================
// ERROR PAGE — CINEMATIC SPLIT PREMIUM ANIMATION
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    const tl = gsap.timeline({
        defaults: { duration: 1.3, ease: "power4.out" }
    });

    const section = document.querySelector(".error-page");

    if (section) {
        // ----------------------------------------------
        // BUILD SPLIT BARS (top / bottom)
        // ----------------------------------------------
        const barTop = document.createElement("div");
        const barBottom = document.createElement("div");

        barTop.className = "error-split-bar error-split-bar-top";
        barBottom.className = "error-split-bar error-split-bar-bottom";

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

        // bars in
        tl.to(barTop, { height: "48%", duration: 1.0 }, 0);
        tl.to(barBottom, { height: "52%", duration: 1.0 }, 0);

        // bars out
        tl.to([barTop, barBottom], {
            height: 0,
            duration: 1.2,
            ease: "power4.inOut"
        }, 0.9);
    }

    // ----------------------------------------------
    // TITLE — kinetic cinematic reveal
    // ----------------------------------------------
    const title = document.querySelector(".error-page-title");
    if (title) {
        gsap.set(title, { opacity: 0, y: 80 });

        tl.to(title, {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power4.out"
        }, 0.7);

        // slight kinetic motion
        tl.to(title, {
            y: -6,
            duration: 1.1,
            ease: "power1.inOut"
        }, "-=0.8");

        tl.to(title, {
            y: 0,
            duration: 1.0,
            ease: "power1.inOut"
        }, "-=0.3");
    }

    // ----------------------------------------------
    // LINK — premium micro-stagger entrance
    // ----------------------------------------------
    const link = document.querySelector(".error-page-link");
    if (link) {
        gsap.set(link, { opacity: 0, y: 40, scale: 0.95 });

        tl.to(link, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out"
        }, 1.1);

        // tiny movement to feel alive
        tl.to(link, {
            y: -3,
            duration: 0.9,
            ease: "power1.inOut"
        }, "-=0.9");

        tl.to(link, {
            y: 0,
            duration: 0.9,
            ease: "power1.inOut"
        }, "-=0.4");
    }

});

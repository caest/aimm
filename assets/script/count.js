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

        if (i === 1) {
            gsap.set(item, {
                y: HEIGHT + GAP,
                opacity: 0.15,
                fontSize: "clamp(3rem, 6vw, 10rem)",
                color: "#999"
            });
        }

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
                    gsap.set(nextSpan, { color: "#999" });

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
function createInfiniteMarquee(rowSelector, speed = 25, direction = 1, gap = 350) {
    const row = document.querySelector(rowSelector);
    if (!row) return;

    const inner = row.querySelector(".social-marquee-inner");
    if (!inner) return;

    inner.style.gap = gap + "px";

    const originalItems = Array.from(inner.children);

    const baseWidth = originalItems.reduce((acc, item) => {
        const w = item.getBoundingClientRect().width;
        return acc + w + gap;
    }, 0);

    inner.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        originalItems.forEach((item, idx) => {
            const clone = item.cloneNode(true);
            inner.appendChild(clone);
        });
    }

    const loopWidth = baseWidth;

    gsap.set(inner, { x: 0 });

    gsap.to(inner, {
        x: direction === 1 ? -loopWidth : loopWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
        modifiers: {
            x: gsap.utils.unitize(x => {
                const raw = parseFloat(x);
                let modded;
                
                if (direction === 1) {
                    modded = raw % -loopWidth;
                } else {
                    modded = (raw % loopWidth) - loopWidth;
                }

                return modded;
            })
        }
    });

    gsap.to(inner, {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out"
    });
}

function startSocialAnimation() {
    if (window.socialAnimated) return;
    window.socialAnimated = true;

    const section = document.querySelector(".social");
    const links = section.querySelectorAll(".social-link");
    const title = section.querySelector(".social-title");

    gsap.set(links, { opacity: 0, y: 40 });
    gsap.set(title, { opacity: 0, scale: 0.85 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(links, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.08
    });

    tl.to(title, {
        opacity: 1,
        scale: 1,
        duration: 1
    }, "-=0.5");

    tl.call(() => createInfiniteMarquee(".marquee-1", 40, 1), [], "+=0.3")
      .call(() => createInfiniteMarquee(".marquee-2", 28, -1), [], "+=0.2")
      .call(() => createInfiniteMarquee(".marquee-3", 34, 1), [], "+=0.1");
}
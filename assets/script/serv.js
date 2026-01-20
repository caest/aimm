// =======================================================
// SERVICES PAGE — ULTRA PREMIUM ANIMATION
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.error("GSAP or ScrollTrigger missing");
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    animateFilters();
    animateServicesScroll();
    initServicesFiltersLogic();
});



// =======================================================
// ULTRA PREMIUM FILTERS ANIMATION
// =======================================================
function animateFilters() {
    const filters = document.querySelectorAll(".services-filter");
    if (!filters.length) return;

    gsap.set(filters, {
        opacity: 0,
        y: 40,
        scale: 0.92,
        rotateX: -25,
        filter: "blur(18px)"
    });

    gsap.to(filters, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 1.4,
        ease: "power4.out",
        stagger: {
            each: 0.08,
            from: "start"
        },
        scrollTrigger: {
            trigger: ".services-filters",
            start: "top 85%",
            once: true
        }
    });

    // лёгкий параллакс при входе
    filters.forEach((f, i) => {
        gsap.fromTo(f, { x: i % 2 === 0 ? -15 : 15 }, {
            x: 0,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".services-filters",
                start: "top 85%",
                once: true
            }
        });
    });
}



// =======================================================
// ULTRA PREMIUM SERVICE ITEMS
// =======================================================
function animateServicesScroll() {
    const items = document.querySelectorAll(".services-item");

    items.forEach(item => {
        const title = item.querySelector(".services-item-title");
        const descr = item.querySelector(".services-item-description");
        const btns  = item.querySelectorAll(".services-item-btn");

        gsap.set([title, descr, btns], {
            opacity: 0,
            y: 60,
            scale: 0.96,
            filter: "blur(18px)"
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: item,
                start: "top 80%",
                once: true
            },
            defaults: { ease: "power4.out" }
        });

        tl.to(title, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.2
        });

        tl.to(descr, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.1
        }, "-=0.7");

        tl.to(btns, {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.0,
            stagger: 0.1
        }, "-=0.5");
    });
}



// =======================================================
// FILTERS LOGIC (PREMIUM FADE)
// =======================================================
function initServicesFiltersLogic() {
    const filters = document.querySelectorAll(".services-filter");
    const items   = document.querySelectorAll(".services-item");

    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            const category = filter.dataset.filter;

            filters.forEach(f => f.classList.remove("active"));
            filter.classList.add("active");

            items.forEach(item => {
                const match = item.dataset.category === category;

                if (match) {
                    gsap.to(item, {
                        opacity: 1,
                        height: "auto",
                        marginTop: 40,
                        duration: 0.55,
                        ease: "power3.out"
                    });
                } else {
                    gsap.to(item, {
                        opacity: 0,
                        height: 0,
                        marginTop: 0,
                        duration: 0.45,
                        ease: "power2.inOut"
                    });
                }
            });
        });
    });
}

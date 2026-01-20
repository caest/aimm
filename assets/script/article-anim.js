// =====================================================
// PREMIUM ARTICLE PAGE ANIMATION (CLEAN VERSION)
// =====================================================
function initArticleAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const preview = document.querySelector(".article-preview");
    if (!preview) return;

    // -----------------------------------------
    // HERO PREVIEW FADE + PARALLAX
    // -----------------------------------------
    const bg = preview;
    const title = preview.querySelector(".article-title");
    const date = preview.querySelector(".article-data");

    gsap.set([title, date], {opacity: 0, y: 40});
    gsap.set(bg, {scale: 1.15});

    gsap.timeline({
        scrollTrigger: {
            trigger: preview,
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    })
    .to(bg, {scale: 1, ease: "none"}, 0);

    gsap.timeline({
        scrollTrigger: {
            trigger: preview,
            start: "top 75%"
        }
    })
    .to([title, date], {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15
    });

    // -----------------------------------------
    // ARTICLE PHOTO REVEAL
    // -----------------------------------------
    const articlePhoto = document.querySelector(".article-photo img");

    if (articlePhoto) {
        gsap.set(articlePhoto, {
            opacity: 0,
            y: 40,
            scale: 1.02
        });

        gsap.to(articlePhoto, {
            scrollTrigger: {
                trigger: articlePhoto,
                start: "top 85%"
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out"
        });
    }

    // -----------------------------------------
    // ARTICLE PARAGRAPHS
    // -----------------------------------------
    const paragraphs = document.querySelectorAll(".article-text p");

    paragraphs.forEach((p) => {
        gsap.set(p, {opacity: 0, y: 35});

        gsap.to(p, {
            scrollTrigger: {
                trigger: p,
                start: "top 90%"
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // -----------------------------------------
    // ARTICLE IMAGES
    // -----------------------------------------
    const galleryImgs = document.querySelectorAll(".article-images img");

    gsap.set(galleryImgs, {opacity: 0, y: 60, scale: 1.05});

    gsap.to(galleryImgs, {
        scrollTrigger: {
            trigger: ".article-images",
            start: "top 85%"
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.15
    });

    // -----------------------------------------
    // MORE NEWS BLOCK
    // -----------------------------------------
    const moreBlock = document.querySelector(".article-more");
    if (moreBlock) {
        gsap.set(moreBlock, {opacity: 0, y: 80});

        gsap.to(moreBlock, {
            scrollTrigger: {
                trigger: moreBlock,
                start: "top 95%"
            },
            opacity: 1,
            y: 0,
            duration: 1.3,
            ease: "power3.out"
        });
    }

    // -----------------------------------------
    // MORE NEWS ITEMS
    // -----------------------------------------
    const moreItems = document.querySelectorAll(".article-more-item");

    moreItems.forEach((item) => {
        gsap.set(item, {opacity: 0, y: 40, scale: 1.03});

        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 97%"
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out"
        });
    });
}

initArticleAnimations();

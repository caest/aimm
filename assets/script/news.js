// =======================================================
// NEWS PAGE — SIMPLE PREMIUM REVEAL (NO SCROLLTRIGGER)
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    // LEFT FEATURED BLOCK
    const featured = document.querySelector(".news-featured-wrap");
    if (featured) {
        gsap.from(featured, {
            opacity: 0,
            y: 40,
            filter: "blur(16px)",
            duration: 1.2,
            ease: "power4.out",
            delay: 0.1
        });

        gsap.from(
            featured.querySelectorAll(
                ".news-featured-read, .news-featured-date, .news-featured-title, .news-featured-text"
            ),
            {
                opacity: 0,
                y: 30,
                filter: "blur(14px)",
                stagger: 0.1,
                duration: 1.0,
                ease: "power3.out",
                delay: 0.25
            }
        );
    }

    // CENTER BLOG ITEMS
    const blogItems = document.querySelectorAll(".news-blog-item");
    gsap.from(blogItems, {
        opacity: 0,
        y: 35,
        filter: "blur(12px)",
        stagger: 0.08,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.4
    });

    // RIGHT MEDIA ITEMS
    const mediaItems = document.querySelectorAll(".news-media-item");
    gsap.from(mediaItems, {
        opacity: 0,
        y: 35,
        filter: "blur(12px)",
        stagger: 0.06,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.45
    });

    // MOBILE BLOG
    const mobileBlog = document.querySelectorAll(".news-blog-mobile .news-blog-item");
    gsap.from(mobileBlog, {
        opacity: 0,
        y: 30,
        filter: "blur(12px)",
        stagger: 0.07,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.5
    });

    // MOBILE MEDIA
    const mobileMedia = document.querySelectorAll(".news-blog-media .news-media-item");
    gsap.from(mobileMedia, {
        opacity: 0,
        y: 30,
        filter: "blur(12px)",
        stagger: 0.07,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.55
    });
});

const preloader = document.getElementById("preloader");
const percentText = document.querySelector(".preloader-percent");

if (preloader && percentText) {
    runPreloader(() => {
        preloader.classList.add("preloader-hide");
        setTimeout(startHeroAnimation, 300);
    });
} else {
    startHeroAnimation();
}

function runPreloader(done) {
    let p = 0;
    const int = setInterval(() => {
        p++;
        if (percentText) percentText.textContent = p + "%";
        if (p >= 100) {
            clearInterval(int);
            setTimeout(done, 200);
        }
    }, 30);
}
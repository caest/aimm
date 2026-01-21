import { makeTrigger } from '../core.js'

const ensureMask = (el, bgEl) => {
  if (!el) return null
  const cs = getComputedStyle(el)
  if (cs.position === 'static') el.style.position = 'relative'
  el.style.overflow = 'hidden'
  const mask = document.createElement('span')
  mask.setAttribute('data-reveal-mask', '')
  mask.style.position = 'absolute'
  mask.style.left = '0'
  mask.style.top = '0'
  mask.style.width = '100%'
  mask.style.height = '100%'
  mask.style.pointerEvents = 'none'
  mask.style.zIndex = '2'
  mask.style.transformOrigin = '0% 50%'
  const bg = bgEl ? getComputedStyle(bgEl).backgroundColor : getComputedStyle(document.body).backgroundColor
  mask.style.background = bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#fff'
  el.appendChild(mask)
  gsap.set(mask, { scaleX: 1 })
  return mask
}

function initCountAnimation() {
  const countItems = document.querySelectorAll(".about-count");
  if (!countItems.length) return;
  let currentIndex = 0;
  let rotationTimeout;
  
  const isMobile = window.innerWidth <= 992

  function getGap() {
      const w = document.documentElement.clientWidth;
      if (isMobile) return 30
      if (w > 1980) return 200;
      if (w > 1600) return 160;
      if (w <= 1380) return 40;
      return 60;
  }

  let GAP = getGap();
  const HEIGHT = isMobile ? 80 : 120;

  countItems.forEach((item, i) => {
      const span = item.querySelector("span");

      if (i === 0) {
          gsap.set(item, {
              y: 0,
              opacity: 1,
              fontSize: isMobile ? "clamp(4rem, 8vw, 12rem)" : "clamp(6rem, 10vw, 20rem)",
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
              opacity: isMobile ? 0.25 : 0.15,
              fontSize: isMobile ? "clamp(2.5rem, 5vw, 8rem)" : "clamp(3rem, 6vw, 10rem)",
              color: "#999"
          });
      }

      if (i > 1) {
          gsap.set(item, {
              y: (HEIGHT + GAP) * 1.25,
              opacity: 0,
              fontSize: isMobile ? "clamp(2.5rem, 5vw, 8rem)" : "clamp(3rem, 6vw, 10rem)",
              color: "#999"
          });
      }

      if (span) gsap.set(span, { opacity: 0, y: 10, color: "#999" });
  });

  function rotateCount() {
      GAP = getGap();

      const current = countItems[currentIndex];
      const next = countItems[(currentIndex + 1) % countItems.length];
      const preview = countItems[(currentIndex + 2) % countItems.length];

      if (!current || !next || !preview) return;

      const currentSpan = current.querySelector("span");
      const nextSpan = next.querySelector("span");

      if (currentSpan) {
          gsap.to(currentSpan, {
              opacity: 0,
              y: 10,
              duration: isMobile ? 0.3 : 0.4,
              ease: "power2.in"
          });
      }

      gsap.to(current, {
          y: -HEIGHT,
          opacity: 0,
          fontSize: isMobile ? "clamp(2.5rem, 5vw, 8rem)" : "clamp(3rem, 6vw, 10rem)",
          color: "#999",
          duration: isMobile ? 0.9 : 1.2,
          ease: "power4.inOut"
      });

      gsap.to(next, {
          y: 0,
          opacity: 1,
          fontSize: isMobile ? "clamp(4rem, 8vw, 12rem)" : "clamp(6rem, 10vw, 20rem)",
          color: "#000",
          duration: isMobile ? 0.9 : 1.2,
          ease: "power4.inOut",
          onStart: () => {
              if (nextSpan) {
                  gsap.set(nextSpan, { color: "#999" });

                  gsap.fromTo(
                      nextSpan,
                      { opacity: 0, y: 10 },
                      { opacity: 1, y: 0, duration: isMobile ? 0.5 : 0.6, ease: "power2.out" }
                  );
              }
          }
      });

      gsap.set(preview, {
          y: (HEIGHT + GAP) * 1.25,
          opacity: 0,
          fontSize: isMobile ? "clamp(2.5rem, 5vw, 8rem)" : "clamp(3rem, 6vw, 10rem)",
          color: "#999"
      });

      gsap.to(preview, {
          y: HEIGHT + GAP,
          opacity: isMobile ? 0.25 : 0.15,
          duration: isMobile ? 1.0 : 1.3,
          ease: "power4.out"
      });

      currentIndex = (currentIndex + 1) % countItems.length;
      rotationTimeout = setTimeout(rotateCount, isMobile ? 4000 : 5000);
  }

  function startRotation() {
      clearTimeout(rotationTimeout);
      rotationTimeout = setTimeout(rotateCount, isMobile ? 4000 : 5000);
  }

  function stopRotation() {
      clearTimeout(rotationTimeout);
  }

  function handleResize() {
      const newIsMobile = window.innerWidth <= 992
      if (isMobile !== newIsMobile) {
          stopRotation()
          window.removeEventListener("resize", handleResize)
          initCountAnimation()
          return
      }
      GAP = getGap();
      
      countItems.forEach((item, i) => {
          if (i === currentIndex) {
              gsap.set(item, { y: 0 });
          } else if (i === (currentIndex + 1) % countItems.length) {
              gsap.set(item, { y: HEIGHT + GAP });
          } else if (i === (currentIndex + 2) % countItems.length) {
              gsap.set(item, { y: (HEIGHT + GAP) * 1.25 });
          }
      });
  }

  window.addEventListener("resize", handleResize);

  startRotation();

  return {
      start: startRotation,
      stop: stopRotation,
      destroy: () => {
          stopRotation();
          window.removeEventListener("resize", handleResize);
      }
  };
}

function animateFirstCount(countItems) {
  if (!countItems || !countItems.length) return;

  const isMobile = window.innerWidth <= 992
  const firstCount = countItems[0];
  const span = firstCount.querySelector("span");

  gsap.set(firstCount, {
      opacity: 0,
      y: isMobile ? '+=30' : '+=50',
      fontSize: isMobile ? "clamp(4rem, 8vw, 12rem)" : "clamp(6rem, 10vw, 20rem)",
      color: "#000"
  });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to(firstCount, {
      opacity: 1,
      y: 0,
      duration: isMobile ? 0.9 : 1.2,
      ease: "power4.out",
      onStart: () => {
          if (span) {
              gsap.fromTo(
                  span,
                  { opacity: 0, y: 10 },
                  { opacity: 1, y: 0, duration: isMobile ? 0.5 : 0.6 }
              );
          }
      }
  });

  return tl;
}

function setupCountAnimation() {
  const countItems = document.querySelectorAll(".about-count");
  if (!countItems.length) return null;

  const firstAnimation = animateFirstCount(countItems);
  let rotationController = null;

  firstAnimation.eventCallback("onComplete", () => {
      rotationController = initCountAnimation();
  });

  return {
      playFirst: () => firstAnimation.play(),
      pauseFirst: () => firstAnimation.pause(),
      startRotation: () => rotationController?.start(),
      stopRotation: () => rotationController?.stop(),
      destroy: () => {
          firstAnimation.kill();
          rotationController?.destroy();
      }
  };
}

const initAboutPremium = (about) => {
  const isMobile = window.innerWidth <= 992
  
  const vLine = about.querySelector('.about-line-vertical')
  const hLine = about.querySelector('.about-line-horizontal')

  const circle = about.querySelector('.about-circle')
  const circleImg = circle ? circle.querySelector('img') : null

  const countWrapDesktop = about.querySelector('.about-column-desktop .about-count-wrap')
  const countWrapMobile = about.querySelector('.about-column-mobile .about-count-mobile-wrap')
  const cw = countWrapDesktop || countWrapMobile

  const slider = about.querySelector('.about-slider')
  const sliderImgs = about.querySelectorAll('.about-slider .swiper-slide img')

  const descDesktop = about.querySelector('.about-column-desktop .about-description')
  const descMobile = about.querySelector('.about-column-mobile .about-description')

  const fraction = about.querySelector('.about-slider-fraction')

  const marque = about.querySelector('.about-marque')
  const marqueTrack = about.querySelector('.about-marque__track')

  const cwMask = ensureMask(cw, about)
  const descDMask = ensureMask(descDesktop, about)
  const descMMask = ensureMask(descMobile, about)

  let countController = null

  const reset = () => {
    if (vLine) gsap.set(vLine, { scaleY: 0, transformOrigin: '50% 0%' })
    if (hLine) gsap.set(hLine, { scaleX: 0, transformOrigin: '0% 50%' })

    if (circle) gsap.set(circle, { 
      opacity: 0, 
      scale: isMobile ? 0.95 : 0.9, 
      rotate: isMobile ? -6 : -8, 
      filter: isMobile ? 'blur(4px)' : 'blur(6px)' 
    })
    if (circleImg) gsap.set(circleImg, { scale: isMobile ? 1.04 : 1.06 })

    if (cw) gsap.set(cw, { 
      opacity: 0, 
      y: isMobile ? 12 : 18, 
      filter: isMobile ? 'blur(4px)' : 'blur(6px)' 
    })
    if (cwMask) gsap.set(cwMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (slider) gsap.set(slider, { clipPath: 'inset(0% 0% 100% 0%)' })
    if (sliderImgs.length) gsap.set(sliderImgs, { 
      scale: isMobile ? 1.05 : 1.1, 
      filter: isMobile ? 'blur(8px)' : 'blur(10px)' 
    })

    if (fraction) gsap.set(fraction, { opacity: 0, y: isMobile ? 8 : 10 })

    if (descDesktop) gsap.set(descDesktop, { 
      opacity: 0, 
      y: isMobile ? 10 : 14, 
      filter: isMobile ? 'blur(3px)' : 'blur(4px)' 
    })
    if (descMobile) gsap.set(descMobile, { 
      opacity: 0, 
      y: isMobile ? 10 : 14, 
      filter: isMobile ? 'blur(3px)' : 'blur(4px)' 
    })
    if (descDMask) gsap.set(descDMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (descMMask) gsap.set(descMMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (marque) gsap.set(marque, { opacity: 0, y: isMobile ? 10 : 14 })
    if (marqueTrack) gsap.set(marqueTrack, { filter: isMobile ? 'blur(4px)' : 'blur(6px)' })
  }

  const tl = gsap.timeline({ paused: true })
  tl.timeScale(isMobile ? 1.0 : 1.12)

  const t0 = 0
  const tCircle = isMobile ? 0.6 : 0.95
  const tCount = isMobile ? 0.8 : 1.15
  const tStartCountLogic = isMobile ? 0.9 : 1.28
  const tSlider = isMobile ? 1.0 : 1.35
  const tText = isMobile ? 1.1 : 1.55
  const tMarque = isMobile ? 1.4 : 1.95

  if (vLine) tl.to(vLine, { 
    scaleY: 1, 
    duration: isMobile ? 0.7 : 0.95, 
    ease: 'power2.out' 
  }, t0)
  
  if (hLine) tl.to(hLine, { 
    scaleX: 1, 
    duration: isMobile ? 0.7 : 0.95, 
    ease: 'power2.out' 
  }, t0 + (isMobile ? 0.08 : 0.12))

  if (circle) tl.to(circle, {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    duration: isMobile ? 0.7 : 0.95,
    ease: 'power4.out'
  }, tCircle)

  if (circleImg) tl.to(circleImg, { 
    scale: 1, 
    duration: isMobile ? 0.8 : 1.05, 
    ease: 'power3.out' 
  }, tCircle)

  if (cwMask) tl.to(cwMask, { 
    scaleX: 0, 
    duration: isMobile ? 0.45 : 0.6, 
    ease: 'power3.inOut' 
  }, tCount)
  
  if (cw) tl.to(cw, { 
    opacity: 1, 
    y: 0, 
    duration: isMobile ? 0.45 : 0.6, 
    ease: 'power3.out' 
  }, tCount + 0.02)
  
  if (cw) tl.to(cw, { 
    filter: 'blur(0px)', 
    duration: isMobile ? 0.2 : 0.28, 
    ease: 'power2.out' 
  }, tCount + 0.12)

  tl.call(() => {
    countController?.destroy()
    countController = setupCountAnimation()
  }, null, tStartCountLogic)

  if (slider) tl.to(slider, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: isMobile ? 0.8 : 1.05,
    ease: 'power4.out'
  }, tSlider)

  if (sliderImgs.length) tl.to(sliderImgs, {
    scale: 1,
    filter: 'blur(0px)',
    duration: isMobile ? 0.85 : 1.1,
    ease: 'power3.out'
  }, tSlider)

  if (fraction) tl.to(fraction, { 
    opacity: 1, 
    y: 0, 
    duration: isMobile ? 0.6 : 0.75, 
    ease: 'power3.out' 
  }, tSlider + (isMobile ? 0.15 : 0.25))

  if (descDMask) tl.to(descDMask, { 
    scaleX: 0, 
    duration: isMobile ? 0.4 : 0.55, 
    ease: 'power3.inOut' 
  }, tText)
  
  if (descDesktop) tl.to(descDesktop, { 
    opacity: 1, 
    y: 0, 
    duration: isMobile ? 0.4 : 0.55, 
    ease: 'power3.out' 
  }, tText + 0.02)
  
  if (descDesktop) tl.to(descDesktop, { 
    filter: 'blur(0px)', 
    duration: isMobile ? 0.2 : 0.28, 
    ease: 'power2.out' 
  }, tText + 0.12)

  if (descMMask) tl.to(descMMask, { 
    scaleX: 0, 
    duration: isMobile ? 0.4 : 0.55, 
    ease: 'power3.inOut' 
  }, tText)
  
  if (descMobile) tl.to(descMobile, { 
    opacity: 1, 
    y: 0, 
    duration: isMobile ? 0.4 : 0.55, 
    ease: 'power3.out' 
  }, tText + 0.02)
  
  if (descMobile) tl.to(descMobile, { 
    filter: 'blur(0px)', 
    duration: isMobile ? 0.2 : 0.28, 
    ease: 'power2.out' 
  }, tText + 0.12)

  if (marque) tl.to(marque, { 
    opacity: 1, 
    y: 0, 
    duration: isMobile ? 0.65 : 0.85, 
    ease: 'power3.out' 
  }, tMarque)
  
  if (marqueTrack) tl.to(marqueTrack, { 
    filter: 'blur(0px)', 
    duration: isMobile ? 0.4 : 0.55, 
    ease: 'power2.out' 
  }, tMarque + 0.05)

  reset()

  makeTrigger({
    trigger: about,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => {
      countController?.destroy()
      countController = null
      reset()
      tl.play(0)
    },
    onEnterBack: () => {
      countController?.destroy()
      countController = null
      reset()
      tl.play(0)
    },
    onLeave: () => {
      tl.pause(0)
      countController?.destroy()
      countController = null
      reset()
    },
    onLeaveBack: () => {
      tl.pause(0)
      countController?.destroy()
      countController = null
      reset()
    }
  })
}

export const initAbout = () => {
  const about = document.querySelector('.about[data-snap]')
  if (!about) return
  initAboutPremium(about)
}
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger)

  gsap.defaults({ overwrite: 'auto' })

  /* =====================================================
     SERVICES PAGE ANIMATIONS
  ===================================================== */

  const initServicesPage = () => {
    const filtersWrap = document.querySelector('.services-filters')
    const filters = Array.from(document.querySelectorAll('.services-filter'))
    const items = Array.from(document.querySelectorAll('.services-item'))

    /* ---------- FILTERS ---------- */

    if (filtersWrap && filters.length) {
      gsap.from(filters, {
        scrollTrigger: {
          trigger: filtersWrap,
          start: 'top 92%',
          once: true
        },
        opacity: 0,
        y: 20,
        filter: 'blur(6px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12
      })

      const activate = (el) => {
        filters.forEach(f => f.classList.remove('active'))
        el.classList.add('active')

        gsap.fromTo(
          el,
          { y: 0 },
          { y: -3, duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1 }
        )
      }

      filters.forEach(el => {
        el.addEventListener('click', () => activate(el))
        el.addEventListener('mouseenter', () => {
          if (!el.classList.contains('active')) {
            gsap.to(el, { y: -2, duration: 0.3, ease: 'power2.out' })
          }
        })
        el.addEventListener('mouseleave', () => {
          if (!el.classList.contains('active')) {
            gsap.to(el, { y: 0, duration: 0.3, ease: 'power2.out' })
          }
        })
      })

      activate(filters[0])
    }

    /* ---------- SERVICES ITEMS ---------- */

    items.forEach(item => {
      const title = item.querySelector('.services-item-title')
      const desc = item.querySelector('.services-item-description')
      const btns = Array.from(item.querySelectorAll('.services-item-btn'))
      const icon = title ? title.querySelector('img') : null

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true
        }
      })

      // CARD
      tl.fromTo(
        item,
        { opacity: 0, y: 70 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out'
        }
      )

      // ICON
      if (icon) {
        tl.fromTo(
          icon,
          {
            opacity: 0,
            scale: 0.85,
            rotate: -10,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'back.out(1.4)'
          },
          '-=0.45'
        )
      }

      // TITLE
      if (title) {
        tl.fromTo(
          title,
          {
            opacity: 0,
            y: 26,
            skewY: 4,
            filter: 'blur(8px)'
          },
          {
            opacity: 1,
            y: 0,
            skewY: 0,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out'
          },
          '-=0.5'
        )
      }

      // DESCRIPTION
      if (desc) {
        tl.fromTo(
          desc,
          {
            opacity: 0,
            y: 22,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out'
          },
          '-=0.45'
        )
      }

      // BUTTONS
      if (btns.length) {
        tl.fromTo(
          btns,
          {
            opacity: 0,
            y: 18,
            filter: 'blur(6px)'
          },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.1
          },
          '-=0.5'
        )
      }
    })
  }

  /* =====================================================
     ABOUT PAGE ANIMATIONS
     (пока пусто — сюда будем писать дальше)
  ===================================================== */

const initAboutPage = () => {
  if (typeof gsap === 'undefined') return
  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger)

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  const section = document.querySelector('.about-page-start')
  if (!section) return

  const title = section.querySelector('h1')
  const image = section.querySelector('.about-page-start-image')

  /* ==========================
     TITLE — premium reveal
  ========================== */

  if (title) {
    gsap.set(title, {
      opacity: 0,
      x: -90,
      filter: 'blur(14px)'
    })

    gsap.to(title, {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true
      }
    })
  }

  /* ==========================
     IMAGE — reveal from right
  ========================== */

  if (image) {
    gsap.set(image, {
      opacity: 0,
      x: 80,
      scale: 0.98
    })

    gsap.to(image, {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 1.3,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        once: true
      }
    })

    /* ==========================
       IMAGE — OBJECT-POSITION SCROLL
       (ТО, ЧТО ТЫ ХОТЕЛ)
    ========================== */

    gsap.fromTo(
      image,
      {
        objectPosition: '50% 0%'
      },
      {
        objectPosition: '50% 45%',   // ЗАМЕТНОЕ движение
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,                 // явный premium-скролл
          invalidateOnRefresh: true
        }
      }
    )
  }
  /* ==========================
   SEO NAME IMG — SCROLL MOVE
========================== */

const seoNameImgs = document.querySelectorAll('.about-page-seo-name-img')

seoNameImgs.forEach((img, index) => {
  const dir = index % 2 === 0 ? 1 : -1

  gsap.fromTo(
    img,
    {
      y: -120 * dir
    },
    {
      y: 120 * dir,
      ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.about-page-seo'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        invalidateOnRefresh: true
      }
    }
  )
})

/* ==========================
   SEO TEXT — SIMPLE REVEAL
========================== */

document
  .querySelectorAll('.about-page-seo-description')
  .forEach(text => {
    gsap.fromTo(
      text,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: text,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse'
        }
      }
    )
  })
/* ==========================
   ABOUT DESCRIPTION — SIMPLE REVEAL
========================== */

document
  .querySelectorAll('.about-page-description-column')
  .forEach((col, i) => {
    gsap.fromTo(
      col,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        delay: i * 0.08,
        scrollTrigger: {
          trigger: col,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse'
        }
      }
    )
  })
/* ==========================
   SEO POSITION + NAME — REVEAL
========================== */

document
  .querySelectorAll('.about-page-seo-position, .about-page-seo-name')
  .forEach((el, i) => {
    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 20,
        filter: 'blur(6px)'
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power2.out',
        delay: i * 0.05,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse'
        }
      }
    )
  })
/* ==========================
   ABOUT IMAGE — SOFT REVEAL
========================== */

document
  .querySelectorAll('.about-page-img-anim')
  .forEach((img) => {
    gsap.fromTo(
      img,
      {
        opacity: 0,
        scale: 0.96,
        filter: 'blur(8px)'
      },
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: img,
          start: 'top 85%',
          toggleActions: 'play reverse play reverse'
        }
      }
    )
  })
/* ==========================
   TEAM TOP — PREMIUM REVEAL
========================== */

const teamTop = document.querySelector('.about-page-team-top')
if (teamTop) {
  const label = teamTop.querySelector('.title-label')
  const title = teamTop.querySelector('.title')
  const desc = teamTop.querySelector('.description')

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: teamTop,
      start: 'top 80%',
      toggleActions: 'play reverse play reverse'
    }
  })

  if (label) {
    tl.fromTo(
      label,
      {
        opacity: 0,
        y: 12
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }
    )
  }

  if (title) {
    tl.fromTo(
      title,
      {
        opacity: 0,
        x: -60,
        filter: 'blur(10px)'
      },
      {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out'
      },
      '-=0.1'
    )
  }

  if (desc) {
    tl.fromTo(
      desc,
      {
        opacity: 0,
        y: 24,
        filter: 'blur(6px)'
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out'
      },
      '-=0.3'
    )
  }
}

/* ==========================
   TEAM PHOTOS — GRID REVEAL
========================== */

const teamWrap = document.querySelector('.about-page-team-photo-wrap')
if (teamWrap) {
  const photos = Array.from(teamWrap.querySelectorAll('.about-page-team-photo'))

  photos.forEach((card, i) => {
    const img = card.querySelector('img')

    gsap.fromTo(
      card,
      {
        opacity: 0,
        y: 28,
        scale: 0.96,
        filter: 'blur(10px)'
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out',
        delay: i * 0.04,
        scrollTrigger: {
          trigger: teamWrap,
          start: 'top 82%',
          toggleActions: 'play reverse play reverse'
        }
      }
    )

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.06 },
        {
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: teamWrap,
            start: 'top 82%',
            toggleActions: 'play reverse play reverse'
          }
        }
      )
    }
  })
}
/* ==========================
   ABOUT SWIPER — ONLY REVEAL
========================== */

const aboutSwiper = document.querySelector('.about-page-swiper')
if (aboutSwiper && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.fromTo(
    aboutSwiper,
    {
      opacity: 0,
      y: 70,
      filter: 'blur(14px)'
    },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutSwiper,
        start: 'top 85%',
        toggleActions: 'play reverse play reverse',
        invalidateOnRefresh: true
      }
    }
  )
}
/* ==========================
   ABOUT PARTNER — REVEAL
========================== */

const partner = document.querySelector('.about-page-partner')
if (partner && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  const top = partner.querySelector('.about-page-partner-top')
  const logos = partner.querySelectorAll('.about-page-partner-logo')

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: partner,
      start: 'top 85%',
      toggleActions: 'play reverse play reverse',
      invalidateOnRefresh: true
    }
  })

  /* TOP (label + title + desc) */
  if (top) {
    tl.fromTo(
      top,
      {
        opacity: 0,
        y: 40,
        filter: 'blur(10px)'
      },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power3.out'
      }
    )
  }

  /* LOGOS */
  if (logos.length) {
    tl.fromTo(
      logos,
      {
        opacity: 0,
        y: 24,
        scale: 0.96,
        filter: 'blur(6px)'
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06
      },
      '-=0.4'
    )
  }
}


}




  initServicesPage()
  initAboutPage()

  ScrollTrigger.refresh()
})

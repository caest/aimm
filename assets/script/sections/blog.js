import { makeTrigger, splitToChars } from '../core.js'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const ensureMask = (el, bgEl) => {
  if (!el) return null

  const cs = getComputedStyle(el)
  if (cs.position === 'static') el.style.position = 'relative'
  el.style.overflow = 'hidden'

  const existing = el.querySelector(':scope > [data-reveal-mask]')
  if (existing) return existing

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

const wrapWords = (el) => {
  if (!el) return []
  if (el.querySelector('[data-w]')) return Array.from(el.querySelectorAll('[data-w]'))

  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  el.textContent = ''

  const frag = document.createDocumentFragment()
  const words = text.split(' ')

  words.forEach((w, i) => {
    const s = document.createElement('span')
    s.setAttribute('data-w', '')
    s.textContent = w
    s.style.display = 'inline-block'
    frag.appendChild(s)
    if (i !== words.length - 1) frag.appendChild(document.createTextNode(' '))
  })

  el.appendChild(frag)
  return Array.from(el.querySelectorAll('[data-w]'))
}

const setWillChange = (els, v) => {
  els.forEach((el) => {
    if (!el) return
    el.style.willChange = v
  })
}

const initBlogPremium = (blog) => {
  const lineH = blog.querySelector('.blog-line-horizontal')
  const lineV = blog.querySelector('.blog-line-vertical')

  const title = blog.querySelector('.blog-title')
  const titleChars = title ? splitToChars(title) : []

  const sliderWrap = blog.querySelector('.blog-slider-wrap')
  const slider = blog.querySelector('.blog-slider')

  const slides = Array.from(blog.querySelectorAll('.blog-slide'))
  const prev = blog.querySelector('.blog-button-prev')
  const next = blog.querySelector('.blog-button-next')

  const prevText = prev ? prev.querySelector('span') : null
  const nextText = next ? next.querySelector('span') : null
  const prevArrow = prev ? prev.querySelector('img') : null
  const nextArrow = next ? next.querySelector('img') : null

  const slideMeta = slides.map((s) => {
    const img = s.querySelector('.blog-slide-image')
    const date = s.querySelector('.blog-slide-data')
    const h = s.querySelector('.blog-slide-title')
    const hWords = wrapWords(h)
    const hMask = ensureMask(h, blog)

    const imageMask = ensureMask(img, blog)
    const dateMask = ensureMask(date, blog)

    if (img) img.style.transformOrigin = '50% 60%'

    return { s, img, date, h, hWords, hMask, imageMask, dateMask }
  })

  const allWC = [
    lineH,
    lineV,
    sliderWrap,
    slider,
    prev,
    next,
    prevText,
    nextText,
    prevArrow,
    nextArrow,
    ...titleChars,
    ...slideMeta.flatMap((it) => [it.s, it.img, it.date, it.h, it.hMask, it.imageMask, it.dateMask, ...it.hWords]),
  ].filter(Boolean)

  const makeDur = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440
    const k = clamp(w / 1440, 0.85, 1.08)
    return {
      lines: 0.9 / k,
      title: 1.05 / k,
      clip: 1.05 / k,
      card: 0.95 / k,
      image: 1.05 / k,
      meta: 0.65 / k,
      text: 0.85 / k,
      buttons: 0.75 / k,
    }
  }

  const reset = () => {
    const reduce = prefersReducedMotion()

    if (lineH) gsap.set(lineH, { scaleX: reduce ? 1 : 0, transformOrigin: '0% 50%' })
    if (lineV) gsap.set(lineV, { scaleY: reduce ? 1 : 0, transformOrigin: '50% 0%' })

    if (titleChars.length) {
      gsap.set(titleChars, reduce
        ? { opacity: 1, yPercent: 0, rotate: 0 }
        : { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' }
      )
    }

    if (sliderWrap) gsap.set(sliderWrap, { opacity: 1 })
    if (slider) gsap.set(slider, reduce ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 100% 0%)' })

    slideMeta.forEach((it) => {
      if (!it.s) return

      gsap.set(it.s, reduce
        ? { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }
        : { opacity: 0, y: 16, filter: 'blur(12px)', scale: 0.992, transformOrigin: '50% 60%' }
      )

      if (it.img) gsap.set(it.img, reduce
        ? { scale: 1, filter: 'blur(0px)', backgroundSize: '100%' }
        : { scale: 1.03, filter: 'blur(10px)', backgroundSize: '112%' }
      )

      if (it.imageMask) gsap.set(it.imageMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })

      if (it.date) gsap.set(it.date, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(8px)' })
      if (it.dateMask) gsap.set(it.dateMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })

      if (it.hMask) gsap.set(it.hMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })
      if (it.hWords.length) {
        gsap.set(it.hWords, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 12, filter: 'blur(10px)' })
      }
    })

    if (prev) gsap.set(prev, prefersReducedMotion() ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(8px)' })
    if (next) gsap.set(next, prefersReducedMotion() ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(8px)' })

    if (prevText) gsap.set(prevText, prefersReducedMotion() ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 })
    if (nextText) gsap.set(nextText, prefersReducedMotion() ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 })

    if (prevArrow) gsap.set(prevArrow, prefersReducedMotion() ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: 10, rotate: 8, transformOrigin: '50% 50%' })
    if (nextArrow) gsap.set(nextArrow, prefersReducedMotion() ? { opacity: 1, x: 0, rotate: 0 } : { opacity: 0, x: -10, rotate: -8, transformOrigin: '50% 50%' })
  }

  const buildTimeline = () => {
    const reduce = prefersReducedMotion()
    const d = makeDur()

    const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
    tl.timeScale(1.06)

    if (reduce) {
      tl.add(() => reset(), 0)
      return tl
    }

    const t0 = 0
    const tTitle = 0.18
    const tClip = 0.58
    const tCards = 0.72
    const tBtns = 1.55

    if (lineH) tl.to(lineH, { scaleX: 1, duration: d.lines, ease: 'power2.out' }, t0)
    if (lineV) tl.to(lineV, { scaleY: 1, duration: d.lines + 0.08, ease: 'power2.out' }, t0 + 0.08)

    if (titleChars.length) {
      tl.to(titleChars, {
        opacity: 1,
        yPercent: 0,
        rotate: 0,
        duration: d.title,
        ease: 'power4.out',
        stagger: { each: 0.022, from: 'start' },
      }, tTitle)
    }

    if (slider) tl.to(slider, { clipPath: 'inset(0% 0% 0% 0%)', duration: d.clip, ease: 'power4.out' }, tClip)

    slideMeta.forEach((it, i) => {
      const t = tCards + i * 0.085

      if (it.s) {
        tl.to(it.s, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          scale: 1,
          duration: d.card,
          ease: 'power3.out',
        }, t)
      }

      if (it.imageMask) tl.to(it.imageMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, t + 0.06)

      if (it.img) {
        tl.to(it.img, { scale: 1, backgroundSize: '100%', filter: 'blur(0px)', duration: d.image, ease: 'power3.out' }, t + 0.04)
      }

      if (it.dateMask) tl.to(it.dateMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, t + 0.18)
      if (it.date) tl.to(it.date, { opacity: 1, y: 0, filter: 'blur(0px)', duration: d.meta, ease: 'power3.out' }, t + 0.22)

      if (it.hMask) tl.to(it.hMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, t + 0.28)
      if (it.hWords.length) {
        tl.to(it.hWords, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: d.text,
          ease: 'power3.out',
          stagger: { each: 0.018, from: 'start' },
        }, t + 0.34)
      }
    })

    if (prev) tl.to(prev, { opacity: 1, y: 0, filter: 'blur(0px)', duration: d.buttons, ease: 'power3.out' }, tBtns)
    if (next) tl.to(next, { opacity: 1, y: 0, filter: 'blur(0px)', duration: d.buttons, ease: 'power3.out' }, tBtns + 0.08)

    if (prevText) tl.to(prevText, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, tBtns + 0.02)
    if (nextText) tl.to(nextText, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, tBtns + 0.1)

    if (prevArrow) tl.to(prevArrow, { opacity: 1, x: 0, rotate: 0, duration: 0.7, ease: 'power3.out' }, tBtns + 0.05)
    if (nextArrow) tl.to(nextArrow, { opacity: 1, x: 0, rotate: 0, duration: 0.7, ease: 'power3.out' }, tBtns + 0.13)

    return tl
  }

  let tl = null

  const applyPremiumHover = () => {
    const reduce = prefersReducedMotion()
    if (reduce) return

    slideMeta.forEach((it) => {
      if (!it.s || !it.img) return

      const enter = () => {
        gsap.to(it.img, { scale: 1.045, duration: 0.75, ease: 'power3.out' })
        gsap.to(it.s, { y: -2, duration: 0.55, ease: 'power3.out' })
      }

      const leave = () => {
        gsap.to(it.img, { scale: 1, duration: 0.8, ease: 'power3.out' })
        gsap.to(it.s, { y: 0, duration: 0.65, ease: 'power3.out' })
      }

      it.s.addEventListener('mouseenter', enter)
      it.s.addEventListener('mouseleave', leave)
    })
  }

  const play = () => {
    reset()
    if (!tl) tl = buildTimeline()
    tl.play(0)
  }

  const kill = () => {
    if (tl) tl.pause(0)
    reset()
  }

  const prepare = () => {
    setWillChange(allWC, 'transform, opacity, filter, clip-path')
  }

  const cleanup = () => {
    setWillChange(allWC, '')
  }

  prepare()
  reset()
  applyPremiumHover()

  let rAF = null
  const rebuildOnResize = () => {
    if (rAF) cancelAnimationFrame(rAF)
    rAF = requestAnimationFrame(() => {
      if (tl) {
        tl.kill()
        tl = null
      }
      reset()
    })
  }
  window.addEventListener('resize', rebuildOnResize, { passive: true })

  makeTrigger({
    trigger: blog,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => play(),
    onEnterBack: () => play(),
    onLeave: () => kill(),
    onLeaveBack: () => kill(),
  })

  const destroy = () => {
    window.removeEventListener('resize', rebuildOnResize)
    cleanup()
    if (tl) tl.kill()
    tl = null
    slideMeta.forEach((it) => {
      if (!it.s) return
      it.s.replaceWith(it.s.cloneNode(true))
    })
  }

  blog.__blogPremiumDestroy = destroy
}

export const initBlog = () => {
  const blog = document.querySelector('.blog[data-snap]')
  if (!blog) return
  initBlogPremium(blog)
}

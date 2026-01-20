import { splitToChars, makeTrigger } from '../core.js'

const initHeroTitle = (hero) => {
  const title = hero.querySelector('.hero-title[data-anim="titleChars"]')
  if (!title) return

  const rows = title.querySelectorAll('.hero-title-row')
  if (!rows.length) return

  const chars = []
  rows.forEach((row) => chars.push(...splitToChars(row)))

  const tl = gsap.timeline({ paused: true })
  tl.timeScale(1.05)

  const reset = () => {
    gsap.set(chars, { opacity: 0, yPercent: 120, rotate: 2, transformOrigin: '50% 100%' })
    tl.pause(0)
  }

  reset()

  tl.to(chars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 1.05,
    ease: 'power4.out',
    stagger: { each: 0.028, from: 'start' }
  })

  makeTrigger({
    trigger: hero,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => {
      reset()
      tl.play(0)
    },
    onEnterBack: () => {
      reset()
      tl.play(0)
    },
    onLeave: () => reset(),
    onLeaveBack: () => reset()
  })
}

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

const initHeroScrollButton = (hero) => {
  const btn = hero.querySelector('.hero-scroll')
  if (!btn) return

  btn.style.cursor = 'pointer'

  const all = Array.from(document.querySelectorAll('[data-snap]'))
  const idx = all.indexOf(hero)
  const next = idx >= 0 ? all[idx + 1] : null
  if (!next) return

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    const y = next.getBoundingClientRect().top + window.scrollY

    const l = window.__lenis
    if (l && typeof l.scrollTo === 'function') {
      l.scrollTo(y, { duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) })
      return
    }

    window.scrollTo({ top: y, behavior: 'smooth' })
  })
}

const initHeroPremiumRest = (hero) => {
  const vLine = hero.querySelector('.hero-line-vertical')
  const hLine = hero.querySelector('.hero-line-horizontal')

  const sliderWrap = hero.querySelector('.hero-slider-wrapper')
  const sliderImgs = hero.querySelectorAll('.hero-slider .swiper-slide img')

  const controls = hero.querySelector('.hero-slider-controls')
  const caption = hero.querySelector('.hero-slider-caption')
  const pagination = hero.querySelector('.hero-slider-pagination')
  const prev = hero.querySelector('.hero-slider-prev')
  const next = hero.querySelector('.hero-slider-next')

  const desc = hero.querySelector('.hero-description')
  const descM = hero.querySelector('.hero-description-mobile')

  const heroLink = hero.querySelector('.hero-link')
  const heroLinkText = heroLink ? heroLink.querySelector('span') : null
  const heroLinkIcon = heroLink ? heroLink.querySelector('img') : null
  const heroScroll = hero.querySelector('.hero-scroll')

  initHeroScrollButton(hero)

  const descMask = ensureMask(desc, hero)
  const descMMask = ensureMask(descM, hero)

  const tl = gsap.timeline({ paused: true })
  tl.timeScale(1.15)

  let oncePlayed = false

  const reset = () => {
    if (vLine) gsap.set(vLine, { scaleY: 0, transformOrigin: '50% 0%' })
    if (hLine) gsap.set(hLine, { scaleX: 0, transformOrigin: '0% 50%' })

    if (sliderWrap) gsap.set(sliderWrap, { clipPath: 'inset(0% 0% 100% 0%)' })
    if (sliderImgs.length) gsap.set(sliderImgs, { scale: 1.12, filter: 'blur(10px)' })

    if (controls) gsap.set(controls, { opacity: 0, y: 18 })
    if (caption) gsap.set(caption, { opacity: 0, y: 12 })
    if (pagination) gsap.set(pagination, { opacity: 0 })
    if (prev) gsap.set(prev, { opacity: 0, x: -14 })
    if (next) gsap.set(next, { opacity: 0, x: 14 })

    if (desc) gsap.set(desc, { opacity: 0, y: 14, filter: 'blur(4px)' })
    if (descM) gsap.set(descM, { opacity: 0, y: 14, filter: 'blur(4px)' })

    const m1 = desc ? desc.querySelector('[data-reveal-mask]') : null
    const m2 = descM ? descM.querySelector('[data-reveal-mask]') : null
    if (m1) gsap.set(m1, { scaleX: 1, transformOrigin: '0% 50%' })
    if (m2) gsap.set(m2, { scaleX: 1, transformOrigin: '0% 50%' })

    if (!oncePlayed) {
      if (heroLink) gsap.set(heroLink, { opacity: 0, scale: 0.92, rotate: -2, filter: 'blur(6px)' })
      if (heroLinkText) gsap.set(heroLinkText, { y: 10 })
      if (heroLinkIcon) gsap.set(heroLinkIcon, { opacity: 0, x: -8, rotate: -12 })
      if (heroScroll) gsap.set(heroScroll, { opacity: 0, y: 14 })
    }
  }

  const t0 = 0
  const tSlider = 1.0
  const tUi = 1.85
  const tText = 1.75
  const tCta = 2.55

  if (vLine) tl.to(vLine, { scaleY: 1, duration: 1.0, ease: 'power2.out' }, t0)
  if (hLine) tl.to(hLine, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, t0 + 0.12)

  if (sliderWrap) tl.to(sliderWrap, {
    clipPath: 'inset(0% 0% 0% 0%)',
    duration: 1.1,
    ease: 'power3.out'
  }, tSlider)

  if (sliderImgs.length) tl.to(sliderImgs, {
    scale: 1,
    filter: 'blur(0px)',
    duration: 1.15,
    ease: 'power3.out'
  }, tSlider)

  if (controls) tl.to(controls, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, tUi)
  if (caption) tl.to(caption, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, tUi + 0.12)
  if (pagination) tl.to(pagination, { opacity: 1, duration: 0.6, ease: 'power2.out' }, tUi + 0.18)
  if (prev) tl.to(prev, { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out' }, tUi + 0.2)
  if (next) tl.to(next, { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out' }, tUi + 0.28)

  if (descMask) tl.to(descMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, tText)
  if (desc) tl.to(desc, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, tText + 0.02)
  if (desc) tl.to(desc, { filter: 'blur(0px)', duration: 0.28, ease: 'power2.out' }, tText + 0.12)

  if (descMMask) tl.to(descMMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, tText)
  if (descM) tl.to(descM, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, tText + 0.02)
  if (descM) tl.to(descM, { filter: 'blur(0px)', duration: 0.28, ease: 'power2.out' }, tText + 0.12)

  if (heroLink) tl.to(heroLink, {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    duration: 0.85,
    ease: 'power4.out'
  }, tCta)

  if (heroLinkText) tl.to(heroLinkText, { y: 0, duration: 0.75, ease: 'power3.out' }, tCta + 0.06)
  if (heroLinkIcon) tl.to(heroLinkIcon, { opacity: 1, x: 0, rotate: 0, duration: 0.75, ease: 'power3.out' }, tCta + 0.12)
  if (heroScroll) tl.to(heroScroll, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, tCta + 0.2)

  reset()

  makeTrigger({
    trigger: hero,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => {
      reset()
      tl.play(0)
      oncePlayed = true
    },
    onEnterBack: () => {
      reset()
      tl.play(0)
    },
    onLeave: () => reset(),
    onLeaveBack: () => reset()
  })
}

export const initHero = () => {
  const hero = document.querySelector('.hero[data-snap]')
  if (!hero) return
  initHeroTitle(hero)
  initHeroPremiumRest(hero)
}

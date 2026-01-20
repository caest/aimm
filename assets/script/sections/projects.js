import { splitToChars, makeTrigger } from '../core.js'

const wrapTitleLines = (el) => {
  if (!el) return []
  if (el.querySelector('[data-line]')) return Array.from(el.querySelectorAll('[data-line]'))

  const parts = (el.innerHTML || '').split(/<br\s*\/?>/i).map((s) => s.trim())
  el.innerHTML = ''

  const frag = document.createDocumentFragment()

  parts.forEach((p, i) => {
    const line = document.createElement('span')
    line.setAttribute('data-line', '')
    line.style.display = 'block'
    line.style.overflow = 'hidden'

    const inner = document.createElement('span')
    inner.style.display = 'inline-block'
    inner.innerHTML = p

    line.appendChild(inner)
    frag.appendChild(line)

    if (i !== parts.length - 1) frag.appendChild(document.createTextNode('\n'))
  })

  el.appendChild(frag)
  return Array.from(el.querySelectorAll('[data-line]'))
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

const ensureMask = (el, bgEl) => {
  if (!el) return null
  const existing = el.querySelector(':scope > [data-reveal-mask]')
  if (existing) return existing

  const cs = getComputedStyle(el)
  if (cs.position === 'static') el.style.position = 'relative'
  el.style.overflow = 'hidden'

  const m = document.createElement('span')
  m.setAttribute('data-reveal-mask', '')
  m.style.position = 'absolute'
  m.style.left = '0'
  m.style.top = '0'
  m.style.width = '100%'
  m.style.height = '100%'
  m.style.pointerEvents = 'none'
  m.style.zIndex = '2'
  m.style.transformOrigin = '0% 50%'

  const bg = bgEl ? getComputedStyle(bgEl).backgroundColor : getComputedStyle(document.body).backgroundColor
  m.style.background = bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#fff'

  el.appendChild(m)
  gsap.set(m, { scaleX: 1 })
  return m
}

const toggleHeroUi = (hidden) => {
  const header = document.querySelector('header')
  const heroLink = document.querySelector('.hero-link')
  const heroScroll = document.querySelector('.hero-scroll')

  const v = hidden ? 0 : 1
  const y = hidden ? -12 : 0

  if (header) gsap.to(header, { opacity: v, y, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  if (heroLink) gsap.to(heroLink, { opacity: v, y, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
  if (heroScroll) gsap.to(heroScroll, { opacity: v, y, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
}

const initProjectsUiToggle = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  makeTrigger({
    trigger: section,
    start: 'top 90%',
    end: 'bottom top',
    once: false,
    onEnter: () => toggleHeroUi(true),
    onEnterBack: () => toggleHeroUi(true),
    onLeave: () => toggleHeroUi(true),
    onLeaveBack: () => toggleHeroUi(false)
  })
}

const initProjectsIntro = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const introBlock = section.querySelector('.projects-column[data-snap]')
  if (!introBlock) return

  const title = introBlock.querySelector('.projects-title')
  const desc = introBlock.querySelector('.projects-description')

  const textSlider = section.querySelector('.projects-text-slider')
  const sliderTitle = section.querySelector('.projects-text-slider-title')
  const sliderWrap = section.querySelector('.projects-text-slider-wrapper')
  const slides = Array.from(section.querySelectorAll('.projects-text-slider-wrapper .swiper-slide'))

  const controls = section.querySelector('.projects-slider-controls')
  const fraction = section.querySelector('.projects-slider-fraction')
  const progress = section.querySelector('.projects-slider-progress span')

  const lines = wrapTitleLines(title)
  const lineInners = lines.map((l) => l.firstElementChild).filter(Boolean)

  const titleChars = []
  lineInners.forEach((inner) => titleChars.push(...splitToChars(inner)))

  const descWords = wrapWords(desc)
  const descMask = ensureMask(desc, section)

  const sliderTitleChars = sliderTitle ? splitToChars(sliderTitle) : []
  const sliderTitleMask = ensureMask(sliderTitle, section)

  const slideNodes = slides.map((s) => {
    const h = s.querySelector('.projects-slide-title')
    const p = s.querySelector('.projects-slide-text')
    const more = s.querySelector('.projects-slide-more')
    const next = s.querySelector('.projects-slide-next')

    const hChars = h ? splitToChars(h) : []
    const pWords = p ? wrapWords(p) : []
    const pMask = ensureMask(p, section)

    return { s, hChars, pWords, pMask, more, next }
  })

  const tl = gsap.timeline({ paused: true })
  tl.timeScale(1.08)

  const reset = () => {
    if (titleChars.length) gsap.set(titleChars, { opacity: 0, yPercent: 130, rotate: 1.5, transformOrigin: '50% 100%' })

    if (descWords.length) gsap.set(descWords, { opacity: 0, y: 14, filter: 'blur(6px)' })
    if (descMask) gsap.set(descMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (textSlider) gsap.set(textSlider, { opacity: 0, y: 16, filter: 'blur(10px)' })

    if (sliderTitleChars.length) gsap.set(sliderTitleChars, { opacity: 0, yPercent: 120, rotate: 1.3, transformOrigin: '50% 100%' })
    if (sliderTitleMask) gsap.set(sliderTitleMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (sliderWrap) gsap.set(sliderWrap, { clipPath: 'inset(0% 0% 100% 0%)' })

    slideNodes.forEach((it) => {
      gsap.set(it.s, { opacity: 0, y: 18, filter: 'blur(10px)' })
      if (it.hChars.length) gsap.set(it.hChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })
      if (it.pWords.length) gsap.set(it.pWords, { opacity: 0, y: 12, filter: 'blur(6px)' })
      if (it.pMask) gsap.set(it.pMask, { scaleX: 1, transformOrigin: '0% 50%' })
      if (it.more) gsap.set(it.more, { opacity: 0, y: 10 })
      if (it.next) gsap.set(it.next, { opacity: 0, y: 10 })
    })

    if (controls) gsap.set(controls, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (fraction) gsap.set(fraction, { opacity: 0, y: 10 })
    if (progress) gsap.set(progress, { scaleX: 0, transformOrigin: '0% 50%' })

    tl.pause(0)
  }

  reset()

  tl.to(titleChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 1.05,
    ease: 'power4.out',
    stagger: { each: 0.022, from: 'start' }
  }, 0)

  if (descMask) tl.to(descMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, 0.65)
  tl.to(descWords, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.7,
    ease: 'power3.out',
    stagger: { each: 0.028, from: 'start' }
  }, 0.72)

  if (textSlider) tl.to(textSlider, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.95)

  if (sliderTitleMask) tl.to(sliderTitleMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 1.05)
  if (sliderTitleChars.length) tl.to(sliderTitleChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 0.85,
    ease: 'power4.out',
    stagger: { each: 0.02, from: 'start' }
  }, 1.08)

  if (sliderWrap) tl.to(sliderWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power4.out' }, 1.18)

  slideNodes.forEach((it, i) => {
    const t = 1.35 + i * 0.08

    tl.to(it.s, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out' }, t)

    if (it.hChars.length) tl.to(it.hChars, {
      opacity: 1,
      yPercent: 0,
      rotate: 0,
      duration: 0.85,
      ease: 'power4.out',
      stagger: { each: 0.014, from: 'start' }
    }, t + 0.08)

    if (it.pMask) tl.to(it.pMask, { scaleX: 0, duration: 0.48, ease: 'power3.inOut' }, t + 0.22)

    if (it.pWords.length) tl.to(it.pWords, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.6,
      ease: 'power3.out',
      stagger: { each: 0.018, from: 'start' }
    }, t + 0.26)

    if (it.more) tl.to(it.more, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, t + 0.42)
    if (it.next) tl.to(it.next, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, t + 0.48)
  })

  if (controls) tl.to(controls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 1.95)
  if (fraction) tl.to(fraction, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.0)
  if (progress) tl.to(progress, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 2.05)

  makeTrigger({
    trigger: introBlock,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => { reset(); tl.play(0) },
    onEnterBack: () => { reset(); tl.play(0) },
    onLeave: () => reset(),
    onLeaveBack: () => reset()
  })
}

export const initProject1 = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const block = section.querySelector('.projects-one-wrap[data-snap]')
  if (!block) return

  const media = block.querySelector('.projects-count-media')
  const img = block.querySelector('.projects-count-img, .projects-count-media img')
  if (!media || !img) return

  const blendSvg = block.querySelector('svg[class*="--blend"]')
  const baseSvg = block.querySelector('svg[class*="--base"]')
  const label = block.querySelector('.projects-label')
  const name = block.querySelector('.projects-name')

  const labelMask = ensureMask(label, section)
  const nameMask = ensureMask(name, section)

  const nameChars = name ? splitToChars(name) : []
  const labelWords = label ? wrapWords(label) : []

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1.08)

  const reset = () => {
    gsap.set(media, { clipPath: 'inset(50% 0% 50% 0%)' })
    gsap.set(img, { scale: 1.14, filter: 'blur(14px)' })

    const svgGroup = [baseSvg, blendSvg].filter(Boolean)
    if (svgGroup.length) gsap.set(svgGroup, { opacity: 0, y: 18, scale: 0.985, transformOrigin: '50% 85%' })

    if (labelMask) gsap.set(labelMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (nameMask) gsap.set(nameMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (labelWords.length) gsap.set(labelWords, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (nameChars.length) gsap.set(nameChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })

    tl.pause(0)
  }

  reset()

  tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, 0)
  tl.to(img, { scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out' }, 0.1)

  const svgGroup = [baseSvg, blendSvg].filter(Boolean)
  if (svgGroup.length) {
    tl.to(svgGroup, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.55)
  }

  if (labelMask) tl.to(labelMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.85)
  if (labelWords.length) tl.to(labelWords, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.55,
    ease: 'power3.out',
    stagger: { each: 0.03, from: 'start' }
  }, 0.9)

  if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
  if (nameChars.length) tl.to(nameChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: { each: 0.02, from: 'start' }
  }, 1.02)

  const getSnapScroller = () => {
    let p = block.parentElement
    while (p && p !== document.body) {
      const cs = getComputedStyle(p)
      const hasSnap = cs.scrollSnapType && cs.scrollSnapType !== 'none'
      const oy = cs.overflowY
      const scrollable = oy === 'auto' || oy === 'scroll'
      if (hasSnap && scrollable) return p
      p = p.parentElement
    }
    return window
  }

  const scroller = getSnapScroller()
  const isWindow = scroller === window

  const getSnapTop = (el) => {
    const r = el.getBoundingClientRect()
    if (isWindow) return r.top
    const sr = scroller.getBoundingClientRect()
    return r.top - sr.top
  }

  const getActiveSnapByTop = () => {
    const snaps = Array.from(section.querySelectorAll('[data-snap]'))
    if (!snaps.length) return null

    let best = null
    let bestDist = Infinity

    for (const el of snaps) {
      const d = Math.abs(getSnapTop(el))
      if (d < bestDist) {
        bestDist = d
        best = el
      }
    }
    return { el: best, dist: bestDist }
  }

  const SNAP_EPS = 24

  let active = false

  const activate = () => {
    active = true
    reset()
    tl.play(0)
  }

  const deactivate = () => {
    active = false
    reset()
  }

  const decide = () => {
    const res = getActiveSnapByTop()
    if (!res || !res.el) return

    const isSnapped = res.dist <= SNAP_EPS
    const isThis = res.el === block

    if (isSnapped && isThis) {
      if (!active) activate()
    } else {
      if (active) deactivate()
    }
  }

  let t = null
  const onScroll = () => {
    if (t) clearTimeout(t)
    t = setTimeout(decide, 140)
  }

  const target = isWindow ? window : scroller
  target.addEventListener('scroll', onScroll, { passive: true })

  const refresh = () => decide()

  if (img.decode) {
    img.decode().then(refresh).catch(refresh)
  } else {
    if (img.complete) refresh()
    else img.addEventListener('load', refresh, { once: true })
  }

  refresh()
}



export const initProject2 = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const block = section.querySelector('.projects-second-wrap[data-snap]')
  if (!block) return

  const media = block.querySelector('.projects-count-media')
  const img = block.querySelector('.projects-count-img, .projects-count-media img')
  if (!media || !img) return

  const blendSvg = block.querySelector('svg[class*="--blend"]')
  const baseSvg = block.querySelector('svg[class*="--base"]')
  const label = block.querySelector('.projects-label')
  const name = block.querySelector('.projects-name')

  const labelMask = ensureMask(label, section)
  const nameMask = ensureMask(name, section)

  const nameChars = name ? splitToChars(name) : []
  const labelWords = label ? wrapWords(label) : []

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1.08)

  const reset = () => {
    gsap.set(media, { clipPath: 'inset(50% 0% 50% 0%)' })
    gsap.set(img, { scale: 1.14, filter: 'blur(14px)' })

    const group = [baseSvg, blendSvg].filter(Boolean)
    if (group.length) gsap.set(group, { opacity: 0, y: 18, scale: 0.985, transformOrigin: '50% 85%' })

    if (labelMask) gsap.set(labelMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (nameMask) gsap.set(nameMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (labelWords.length) gsap.set(labelWords, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (nameChars.length) gsap.set(nameChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })

    tl.pause(0)
  }

  reset()

  tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, 0)
  tl.to(img, { scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out' }, 0.1)

  const svgGroup = [baseSvg, blendSvg].filter(Boolean)
  if (svgGroup.length) {
    tl.to(svgGroup, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.55)
  }

  if (labelMask) tl.to(labelMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.85)
  if (labelWords.length) tl.to(labelWords, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.55,
    ease: 'power3.out',
    stagger: { each: 0.03, from: 'start' }
  }, 0.9)

  if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
  if (nameChars.length) tl.to(nameChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: { each: 0.02, from: 'start' }
  }, 1.02)

  const getSnapScroller = () => {
    let p = block.parentElement
    while (p && p !== document.body) {
      const cs = getComputedStyle(p)
      const hasSnap = cs.scrollSnapType && cs.scrollSnapType !== 'none'
      const oy = cs.overflowY
      const scrollable = oy === 'auto' || oy === 'scroll'
      if (hasSnap && scrollable) return p
      p = p.parentElement
    }
    return window
  }

  const scroller = getSnapScroller()
  const isWindow = scroller === window

  const getSnapTop = (el) => {
    const r = el.getBoundingClientRect()
    if (isWindow) return r.top
    const sr = scroller.getBoundingClientRect()
    return r.top - sr.top
  }

  const getActiveSnapByTop = () => {
    const snaps = Array.from(section.querySelectorAll('[data-snap]'))
    if (!snaps.length) return null

    let best = null
    let bestDist = Infinity

    for (const el of snaps) {
      const d = Math.abs(getSnapTop(el))
      if (d < bestDist) {
        bestDist = d
        bestDist = d
        best = el
      }
    }

    return { el: best, dist: bestDist }
  }

  const SNAP_EPS = 24

  let active = false

  const activate = () => {
    active = true
    reset()
    tl.play(0)
  }

  const deactivate = () => {
    active = false
    reset()
  }

  const decide = () => {
    const res = getActiveSnapByTop()
    if (!res || !res.el) return

    const isSnapped = res.dist <= SNAP_EPS
    const isThis = res.el === block

    if (isSnapped && isThis) {
      if (!active) activate()
    } else {
      if (active) deactivate()
    }
  }

  let t = null
  const onScroll = () => {
    if (t) clearTimeout(t)
    t = setTimeout(decide, 140)
  }

  const target = isWindow ? window : scroller
  target.addEventListener('scroll', onScroll, { passive: true })

  const refresh = () => decide()

  if (img.decode) {
    img.decode().then(refresh).catch(refresh)
  } else {
    if (img.complete) refresh()
    else img.addEventListener('load', refresh, { once: true })
  }

  refresh()
}

export const initProject3 = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const block = section.querySelector('.projects-third-wrap[data-snap]')
  if (!block) return

  const media = block.querySelector('.projects-count-media')
  const img = block.querySelector('.projects-count-img, .projects-count-media img, .projects-count-media img')
  if (!media || !img) return

  const blendSvg = block.querySelector('svg[class*="--blend"]')
  const baseSvg = block.querySelector('svg[class*="--base"]')
  const label = block.querySelector('.projects-label')
  const name = block.querySelector('.projects-name')

  const labelMask = ensureMask(label, section)
  const nameMask = ensureMask(name, section)

  const nameChars = name ? splitToChars(name) : []
  const labelWords = label ? wrapWords(label) : []

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1.08)

  const reset = () => {
    gsap.set(media, { clipPath: 'inset(50% 0% 50% 0%)' })
    gsap.set(img, { scale: 1.14, filter: 'blur(14px)' })

    const svgGroup = [baseSvg, blendSvg].filter(Boolean)
    if (svgGroup.length) gsap.set(svgGroup, { opacity: 0, y: 18, scale: 0.985, transformOrigin: '50% 85%' })

    if (labelMask) gsap.set(labelMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (nameMask) gsap.set(nameMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (labelWords.length) gsap.set(labelWords, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (nameChars.length) gsap.set(nameChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })

    tl.pause(0)
  }

  reset()

  tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, 0)
  tl.to(img, { scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out' }, 0.1)

  const svgGroup = [baseSvg, blendSvg].filter(Boolean)
  if (svgGroup.length) {
    tl.to(svgGroup, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.55)
  }

  if (labelMask) tl.to(labelMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.85)
  if (labelWords.length) tl.to(labelWords, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.55,
    ease: 'power3.out',
    stagger: { each: 0.03, from: 'start' }
  }, 0.9)

  if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
  if (nameChars.length) tl.to(nameChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: { each: 0.02, from: 'start' }
  }, 1.02)

  const getSnapScroller = () => {
    let p = block.parentElement
    while (p && p !== document.body) {
      const cs = getComputedStyle(p)
      const hasSnap = cs.scrollSnapType && cs.scrollSnapType !== 'none'
      const oy = cs.overflowY
      const scrollable = oy === 'auto' || oy === 'scroll'
      if (hasSnap && scrollable) return p
      p = p.parentElement
    }
    return window
  }

  const scroller = getSnapScroller()
  const isWindow = scroller === window

  const getSnapTop = (el) => {
    const r = el.getBoundingClientRect()
    if (isWindow) return r.top
    const sr = scroller.getBoundingClientRect()
    return r.top - sr.top
  }

  const getActiveSnapByTop = () => {
    const snaps = Array.from(section.querySelectorAll('[data-snap]'))
    if (!snaps.length) return null

    let best = null
    let bestDist = Infinity

    for (const el of snaps) {
      const d = Math.abs(getSnapTop(el))
      if (d < bestDist) {
        bestDist = d
        best = el
      }
    }

    return { el: best, dist: bestDist }
  }

  const SNAP_EPS = 24

  let active = false

  const activate = () => {
    active = true
    reset()
    tl.play(0)
  }

  const deactivate = () => {
    active = false
    reset()
  }

  const decide = () => {
    const res = getActiveSnapByTop()
    if (!res || !res.el) return

    const isSnapped = res.dist <= SNAP_EPS
    const isThis = res.el === block

    if (isSnapped && isThis) {
      if (!active) activate()
    } else {
      if (active) deactivate()
    }
  }

  let t = null
  const onScroll = () => {
    if (t) clearTimeout(t)
    t = setTimeout(decide, 140)
  }

  const target = isWindow ? window : scroller
  target.addEventListener('scroll', onScroll, { passive: true })

  const refresh = () => decide()

  if (img.decode) {
    img.decode().then(refresh).catch(refresh)
  } else {
    if (img.complete) refresh()
    else img.addEventListener('load', refresh, { once: true })
  }

  refresh()
}

export const initProject4 = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const block = section.querySelector('.projects-four-wrap[data-snap]')
  if (!block) return

  const desktopMedia = block.querySelector('.projects-four-desktop .projects-count-media')
  const desktopImg = block.querySelector('.projects-four-desktop .projects-count-media img')
  const desktopBlendSvg = block.querySelector('.projects-four-desktop svg[class*="--blend"]')
  const desktopBaseSvg = block.querySelector('.projects-four-desktop svg[class*="--base"]')

  const mobMedia = block.querySelector('.projects-four-mob .projects-four-mob-media')
  const mobImg = block.querySelector('.projects-four-mob .projects-four-mob-media img')
  const mobBlendSvg = block.querySelector('.projects-four-mob svg[class*="--blend"]')
  const mobBaseSvg = block.querySelector('.projects-four-mob svg[class*="--base"]')

  const label = block.querySelector('.projects-label')
  const name = block.querySelector('.projects-name')

  const labelMask = ensureMask(label, section)
  const nameMask = ensureMask(name, section)

  const nameChars = name ? splitToChars(name) : []
  const labelWords = label ? wrapWords(label) : []

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1.08)

  const resetTarget = (media, img, baseSvg, blendSvg) => {
    if (!media || !img) return

    gsap.set(media, { clipPath: 'inset(50% 0% 50% 0%)' })
    gsap.set(img, { scale: 1.14, filter: 'blur(14px)' })

    const svgGroup = [baseSvg, blendSvg].filter(Boolean)
    if (svgGroup.length) gsap.set(svgGroup, { opacity: 0, y: 18, scale: 0.985, transformOrigin: '50% 85%' })
  }

  const buildTlTarget = (media, img, baseSvg, blendSvg, at = 0) => {
    if (!media || !img) return

    tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, at)
    tl.to(img, { scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out' }, at + 0.1)

    const svgGroup = [baseSvg, blendSvg].filter(Boolean)
    if (svgGroup.length) {
      tl.to(svgGroup, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, at + 0.55)
    }
  }

  const reset = () => {
    resetTarget(desktopMedia, desktopImg, desktopBaseSvg, desktopBlendSvg)
    resetTarget(mobMedia, mobImg, mobBaseSvg, mobBlendSvg)

    if (labelMask) gsap.set(labelMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (nameMask) gsap.set(nameMask, { scaleX: 1, transformOrigin: '0% 50%' })

    if (labelWords.length) gsap.set(labelWords, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (nameChars.length) gsap.set(nameChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })

    tl.pause(0)
  }

  reset()

  buildTlTarget(desktopMedia, desktopImg, desktopBaseSvg, desktopBlendSvg, 0)
  buildTlTarget(mobMedia, mobImg, mobBaseSvg, mobBlendSvg, 0)

  if (labelMask) tl.to(labelMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.85)
  if (labelWords.length) tl.to(labelWords, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 0.55,
    ease: 'power3.out',
    stagger: { each: 0.03, from: 'start' }
  }, 0.9)

  if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
  if (nameChars.length) tl.to(nameChars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: { each: 0.02, from: 'start' }
  }, 1.02)

  const getSnapScroller = () => {
    let p = block.parentElement
    while (p && p !== document.body) {
      const cs = getComputedStyle(p)
      const hasSnap = cs.scrollSnapType && cs.scrollSnapType !== 'none'
      const oy = cs.overflowY
      const scrollable = oy === 'auto' || oy === 'scroll'
      if (hasSnap && scrollable) return p
      p = p.parentElement
    }
    return window
  }

  const scroller = getSnapScroller()
  const isWindow = scroller === window

  const getSnapTop = (el) => {
    const r = el.getBoundingClientRect()
    if (isWindow) return r.top
    const sr = scroller.getBoundingClientRect()
    return r.top - sr.top
  }

  const getActiveSnapByTop = () => {
    const snaps = Array.from(section.querySelectorAll('[data-snap]'))
    if (!snaps.length) return null

    let best = null
    let bestDist = Infinity

    for (const el of snaps) {
      const d = Math.abs(getSnapTop(el))
      if (d < bestDist) {
        bestDist = d
        best = el
      }
    }

    return { el: best, dist: bestDist }
  }

  const SNAP_EPS = 24

  let active = false

  const activate = () => {
    active = true
    reset()
    tl.play(0)
  }

  const deactivate = () => {
    active = false
    reset()
  }

  const decide = () => {
    const res = getActiveSnapByTop()
    if (!res || !res.el) return

    const isSnapped = res.dist <= SNAP_EPS
    const isThis = res.el === block

    if (isSnapped && isThis) {
      if (!active) activate()
    } else {
      if (active) deactivate()
    }
  }

  let t = null
  const onScroll = () => {
    if (t) clearTimeout(t)
    t = setTimeout(decide, 140)
  }

  const target = isWindow ? window : scroller
  target.addEventListener('scroll', onScroll, { passive: true })

  const refresh = () => decide()

  const imgForLoad = desktopImg || mobImg
  if (imgForLoad && imgForLoad.decode) {
    imgForLoad.decode().then(refresh).catch(refresh)
  } else if (imgForLoad) {
    if (imgForLoad.complete) refresh()
    else imgForLoad.addEventListener('load', refresh, { once: true })
  } else {
    refresh()
  }

  refresh()
}


export const initProjects = () => {
  initProjectsUiToggle()
  initProjectsIntro()
  initProject1()
  initProject2()
  initProject3()
  initProject4()
}

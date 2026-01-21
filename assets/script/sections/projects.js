import { splitToChars, makeTrigger } from '../core.js'

const SNAP_EPS = 24
const BP = 992

const q = (root, sel) => (root ? root.querySelector(sel) : null)
const qa = (root, sel) => (root ? Array.from(root.querySelectorAll(sel)) : [])

const store = (el, key, val) => {
  if (!el) return
  el.dataset[key] = val
}

const getStored = (el, key) => (el ? el.dataset[key] : undefined)

const storeHTMLOnce = (el, key) => {
  if (!el) return
  const k = `orig_${key}`
  if (getStored(el, k) != null) return
  store(el, k, el.innerHTML || '')
}

const storeTextOnce = (el, key) => {
  if (!el) return
  const k = `orig_${key}`
  if (getStored(el, k) != null) return
  store(el, k, el.textContent || '')
}

const restoreHTML = (el, key) => {
  if (!el) return
  const k = `orig_${key}`
  const v = getStored(el, k)
  if (v == null) return
  el.innerHTML = v
  delete el.dataset[k]
}

const restoreText = (el, key) => {
  if (!el) return
  const k = `orig_${key}`
  const v = getStored(el, k)
  if (v == null) return
  el.textContent = v
  delete el.dataset[k]
}

const wrapTitleLines = (el) => {
  if (!el) return []
  const existing = el.querySelectorAll('[data-line]')
  if (existing.length) return Array.from(existing)

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
  const existing = el.querySelectorAll('[data-w]')
  if (existing.length) return Array.from(existing)

  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  el.textContent = ''

  const frag = document.createDocumentFragment()
  const words = text ? text.split(' ') : []

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

const getSnapScroller = (el) => {
  let p = el ? el.parentElement : null
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

const smoothDeactivate = (block, duration = 0.38) => {
  if (!block) return

  const masks = qa(block, '[data-reveal-mask]')
  const words = qa(block, '[data-w]')
  const lines = qa(block, '[data-line] span')
  const chars = qa(block, 'span').filter((n) => n && n.style && n.style.display === 'inline-block')

  const media = q(block, '.projects-count-media')
  const img = q(block, '.projects-count-img, .projects-count-media img')
  const svgGroup = qa(block, 'svg[class*="--base"], svg[class*="--blend"]')
  const more = q(block, '.projects-slide-more')
  const next = q(block, '.projects-slide-next')
  const controls = q(block, '.projects-slider-controls')
  const fraction = q(block, '.projects-slider-fraction')
  const progress = q(block, '.projects-slider-progress span')

  gsap.killTweensOf([masks, words, lines, chars, media, img, svgGroup, more, next, controls, fraction, progress].flat().filter(Boolean))

  const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })

  if (progress) tl.to(progress, { scaleX: 0, duration, ease: 'power2.out' }, 0)
  if (fraction) tl.to(fraction, { opacity: 0, y: 10, duration, ease: 'power2.out' }, 0)
  if (controls) tl.to(controls, { opacity: 0, y: 10, filter: 'blur(6px)', duration, ease: 'power2.out' }, 0)

  if (more) tl.to(more, { opacity: 0, y: 10, duration, ease: 'power2.out' }, 0)
  if (next) tl.to(next, { opacity: 0, y: 10, duration, ease: 'power2.out' }, 0)

  if (words.length) tl.to(words, { opacity: 0, y: 12, filter: 'blur(6px)', duration, ease: 'power2.out', stagger: { each: 0.003, from: 'end' } }, 0)
  if (chars.length) tl.to(chars, { opacity: 0, yPercent: 40, rotate: 0.6, duration, ease: 'power2.out', stagger: { each: 0.002, from: 'end' } }, 0)

  if (masks.length) tl.to(masks, { scaleX: 1, duration: duration * 0.9, ease: 'power2.inOut' }, 0.04)

  if (svgGroup.length) tl.to(svgGroup, { opacity: 0, y: 14, scale: 0.985, duration: duration * 0.95, ease: 'power2.out' }, 0)

  if (media) tl.to(media, { clipPath: 'inset(50% 0% 50% 0%)', duration: duration * 1.15, ease: 'power2.inOut' }, 0.02)
  if (img) tl.to(img, { scale: 1.12, filter: 'blur(10px)', duration: duration * 1.15, ease: 'power2.inOut' }, 0.02)

  return tl
}

const bindSnapActivation = (section, block, activateFn, deactivateFn, eps = SNAP_EPS) => {
  if (!section || !block) return () => {}

  const scroller = getSnapScroller(block)
  const isWindow = scroller === window

  const getSnapTop = (el) => {
    const r = el.getBoundingClientRect()
    if (isWindow) return r.top
    const sr = scroller.getBoundingClientRect()
    return r.top - sr.top
  }

  const getActiveSnapByTop = () => {
    const snaps = qa(section, '[data-snap]')
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

  let active = false

  const decide = () => {
    const res = getActiveSnapByTop()
    if (!res || !res.el) return

    const isSnapped = res.dist <= eps
    const isThis = res.el === block

    if (isSnapped && isThis) {
      if (!active) {
        active = true
        activateFn()
      }
    } else {
      if (active) {
        active = false
        deactivateFn()
      }
    }
  }

  let t = null
  const onScroll = () => {
    if (t) clearTimeout(t)
    t = setTimeout(decide, 140)
  }

  const target = isWindow ? window : scroller
  target.addEventListener('scroll', onScroll, { passive: true })

  const cleanup = () => {
    target.removeEventListener('scroll', onScroll)
    if (t) clearTimeout(t)
  }

  return { decide, cleanup }
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

const simpleReveal = (el, opts = {}) => {
  if (!el) return
  const { start = 'top 85%', y = 14, dur = 0.55, once = true } = opts

  gsap.killTweensOf(el)
  gsap.set(el, { opacity: 0, y, filter: 'blur(8px)' })

  makeTrigger({
    trigger: el,
    start,
    end: 'bottom top',
    once,
    onEnter: () => gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'power2.out', overwrite: 'auto' }),
    onEnterBack: () => gsap.to(el, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'power2.out', overwrite: 'auto' })
  })
}

const initProjectsMobile = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const restore = []

  const introBlock = q(section, '.projects-column[data-snap]')
  const blocks = qa(section, '[data-snap]').filter(Boolean)

  const restoreIntroDom = () => {
    if (!introBlock) return
    const title = q(introBlock, '.projects-title')
    const desc = q(introBlock, '.projects-description')
    const sliderTitle = q(section, '.projects-text-slider-title')

    restoreHTML(title, 'projects_title')
    restoreText(desc, 'projects_desc')
    restoreText(sliderTitle, 'projects_slider_title')

    qa(section, '[data-reveal-mask]').forEach((m) => m.remove())
    qa(section, '[data-w]').forEach((n) => {
      const p = n.parentElement
      if (!p) return
      const txt = p.textContent
      p.textContent = txt
    })
  }

  const storeIntroDom = () => {
    if (!introBlock) return
    const title = q(introBlock, '.projects-title')
    const desc = q(introBlock, '.projects-description')
    const sliderTitle = q(section, '.projects-text-slider-title')

    if (title) storeHTMLOnce(title, 'projects_title')
    if (desc) storeTextOnce(desc, 'projects_desc')
    if (sliderTitle) storeTextOnce(sliderTitle, 'projects_slider_title')
  }

  storeIntroDom()
  restore.push(restoreIntroDom)

  blocks.forEach((b) => {
    simpleReveal(b, { start: 'top 85%', y: 16, dur: 0.55, once: true })
  })

  const controls = q(section, '.projects-slider-controls')
  const fraction = q(section, '.projects-slider-fraction')
  const progress = q(section, '.projects-slider-progress span')

  if (controls) simpleReveal(controls, { start: 'top 90%', y: 10, dur: 0.5, once: true })
  if (fraction) simpleReveal(fraction, { start: 'top 90%', y: 10, dur: 0.5, once: true })
  if (progress) {
    gsap.set(progress, { scaleX: 0, transformOrigin: '0% 50%' })
    makeTrigger({
      trigger: section,
      start: 'top 85%',
      end: 'bottom top',
      once: true,
      onEnter: () => gsap.to(progress, { scaleX: 1, duration: 0.75, ease: 'power2.out', overwrite: 'auto' })
    })
  }

  return () => {
    restore.forEach((fn) => fn())
    blocks.forEach((b) => gsap.killTweensOf(b))
    if (controls) gsap.killTweensOf(controls)
    if (fraction) gsap.killTweensOf(fraction)
    if (progress) gsap.killTweensOf(progress)
  }
}

const initProjectsDesktop = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  const cleanups = []
  const restore = []

  const introBlock = q(section, '.projects-column[data-snap]')
  if (introBlock) {
    const title = q(introBlock, '.projects-title')
    const desc = q(introBlock, '.projects-description')
    const sliderTitle = q(section, '.projects-text-slider-title')

    if (title) storeHTMLOnce(title, 'projects_title')
    if (desc) storeTextOnce(desc, 'projects_desc')
    if (sliderTitle) storeTextOnce(sliderTitle, 'projects_slider_title')

    restore.push(() => {
      restoreHTML(title, 'projects_title')
      restoreText(desc, 'projects_desc')
      restoreText(sliderTitle, 'projects_slider_title')
      qa(section, '[data-reveal-mask]').forEach((m) => m.remove())
    })
  }

  const initProjectsIntro = () => {
    if (!introBlock) return

    const title = q(introBlock, '.projects-title')
    const desc = q(introBlock, '.projects-description')

    const textSlider = q(section, '.projects-text-slider')
    const sliderTitle = q(section, '.projects-text-slider-title')
    const sliderWrap = q(section, '.projects-text-slider-wrapper')
    const slides = qa(section, '.projects-text-slider-wrapper .swiper-slide')

    const controls = q(section, '.projects-slider-controls')
    const fraction = q(section, '.projects-slider-fraction')
    const progress = q(section, '.projects-slider-progress span')

    const lines = wrapTitleLines(title)
    const lineInners = lines.map((l) => l.firstElementChild).filter(Boolean)

    const titleChars = []
    lineInners.forEach((inner) => titleChars.push(...splitToChars(inner)))

    const descWords = wrapWords(desc)
    const descMask = ensureMask(desc, section)

    const sliderTitleChars = sliderTitle ? splitToChars(sliderTitle) : []
    const sliderTitleMask = ensureMask(sliderTitle, section)

    const slideNodes = slides.map((s) => {
      const h = q(s, '.projects-slide-title')
      const p = q(s, '.projects-slide-text')
      const more = q(s, '.projects-slide-more')
      const next = q(s, '.projects-slide-next')

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

    tl.to(
      titleChars,
      {
        opacity: 1,
        yPercent: 0,
        rotate: 0,
        duration: 1.05,
        ease: 'power4.out',
        stagger: { each: 0.022, from: 'start' }
      },
      0
    )

    if (descMask) tl.to(descMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, 0.65)
    tl.to(
      descWords,
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        ease: 'power3.out',
        stagger: { each: 0.028, from: 'start' }
      },
      0.72
    )

    if (textSlider) tl.to(textSlider, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.95)

    if (sliderTitleMask) tl.to(sliderTitleMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 1.05)
    if (sliderTitleChars.length)
      tl.to(
        sliderTitleChars,
        {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration: 0.85,
          ease: 'power4.out',
          stagger: { each: 0.02, from: 'start' }
        },
        1.08
      )

    if (sliderWrap) tl.to(sliderWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power4.out' }, 1.18)

    slideNodes.forEach((it, i) => {
      const t = 1.35 + i * 0.08

      tl.to(it.s, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out' }, t)

      if (it.hChars.length)
        tl.to(
          it.hChars,
          {
            opacity: 1,
            yPercent: 0,
            rotate: 0,
            duration: 0.85,
            ease: 'power4.out',
            stagger: { each: 0.014, from: 'start' }
          },
          t + 0.08
        )

      if (it.pMask) tl.to(it.pMask, { scaleX: 0, duration: 0.48, ease: 'power3.inOut' }, t + 0.22)

      if (it.pWords.length)
        tl.to(
          it.pWords,
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.6,
            ease: 'power3.out',
            stagger: { each: 0.018, from: 'start' }
          },
          t + 0.26
        )

      if (it.more) tl.to(it.more, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, t + 0.42)
      if (it.next) tl.to(it.next, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, t + 0.48)
    })

    if (controls) tl.to(controls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 1.95)
    if (fraction) tl.to(fraction, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.0)
    if (progress) tl.to(progress, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 2.05)

    let active = false
    const activate = () => {
      active = true
      reset()
      tl.play(0)
    }

    const deactivate = () => {
      active = false
      smoothDeactivate(introBlock, 0.42)
      gsap.delayedCall(0.44, () => {
        if (!active) reset()
      })
    }

    const binder = bindSnapActivation(section, introBlock, activate, deactivate, SNAP_EPS)
    cleanups.push(() => binder && binder.cleanup && binder.cleanup())

    const refresh = () => {
      if (binder && binder.decide) binder.decide()
    }

    refresh()
  }

  const makeProjectAnimator = ({
    section,
    block,
    mediaSel,
    imgSel,
    baseSvgSel,
    blendSvgSel,
    labelSel = '.projects-label',
    nameSel = '.projects-name',
    imgForLoadSel
  }) => {
    if (!section || !block) return

    const media = mediaSel ? q(block, mediaSel) : null
    const img = imgSel ? q(block, imgSel) : null

    const baseSvg = baseSvgSel ? q(block, baseSvgSel) : null
    const blendSvg = blendSvgSel ? q(block, blendSvgSel) : null

    const label = labelSel ? q(block, labelSel) : null
    const name = nameSel ? q(block, nameSel) : null

    const getSafeKey = (el, prefix) => {
      if (!el) return ''
      const className = el.className || ''
      const safe = className.replace(/[^a-zA-Z0-9]/g, '_')
      return `${prefix}_${safe || 'b'}`
    }

    const labelKey = getSafeKey(block, 'label')
    const nameKey = getSafeKey(block, 'name')

    if (label) storeTextOnce(label, labelKey)
    if (name) storeTextOnce(name, nameKey)
    
    restore.push(() => {
      restoreText(label, labelKey)
      restoreText(name, nameKey)
      qa(block, '[data-reveal-mask]').forEach((m) => m.remove())
    })

    const labelMask = ensureMask(label, section)
    const nameMask = ensureMask(name, section)

    const nameChars = name ? splitToChars(name) : []
    const labelWords = label ? wrapWords(label) : []

    const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
    tl.timeScale(1.08)

    const resetPrimary = () => {
      if (media && img) {
        gsap.set(media, { clipPath: 'inset(50% 0% 50% 0%)' })
        gsap.set(img, { scale: 1.14, filter: 'blur(14px)' })
      }

      const svgGroup = [baseSvg, blendSvg].filter(Boolean)
      if (svgGroup.length) gsap.set(svgGroup, { opacity: 0, y: 18, scale: 0.985, transformOrigin: '50% 85%' })

      if (labelMask) gsap.set(labelMask, { scaleX: 1, transformOrigin: '0% 50%' })
      if (nameMask) gsap.set(nameMask, { scaleX: 1, transformOrigin: '0% 50%' })

      if (labelWords.length) gsap.set(labelWords, { opacity: 0, y: 10, filter: 'blur(6px)' })
      if (nameChars.length) gsap.set(nameChars, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })

      tl.pause(0)
    }

    resetPrimary()

    if (media && img) {
      tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, 0)
      tl.to(img, { scale: 1, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out' }, 0.1)
    }

    const svgGroup = [baseSvg, blendSvg].filter(Boolean)
    if (svgGroup.length) {
      tl.to(svgGroup, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'power3.out' }, 0.55)
    }

    if (labelMask) tl.to(labelMask, { scaleX: 0, duration: 0.45, ease: 'power3.inOut' }, 0.85)
    if (labelWords.length)
      tl.to(
        labelWords,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.out',
          stagger: { each: 0.03, from: 'start' }
        },
        0.9
      )

    if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
    if (nameChars.length)
      tl.to(
        nameChars,
        {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: { each: 0.02, from: 'start' }
        },
        1.02
      )

    let active = false

    const activate = () => {
      active = true
      resetPrimary()
      tl.play(0)
    }

    const deactivate = () => {
      active = false
      smoothDeactivate(block, 0.36)
      gsap.delayedCall(0.38, () => {
        if (!active) resetPrimary()
      })
    }

    const binder = bindSnapActivation(section, block, activate, deactivate, SNAP_EPS)
    cleanups.push(() => binder && binder.cleanup && binder.cleanup())

    const refresh = () => {
      if (binder && binder.decide) binder.decide()
    }

    const imgForLoad = imgForLoadSel ? q(block, imgForLoadSel) : img
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

  const initProject1 = () => {
    const block = q(section, '.projects-one-wrap[data-snap]')
    if (!block) return
    makeProjectAnimator({
      section,
      block,
      mediaSel: '.projects-count-media',
      imgSel: '.projects-count-img, .projects-count-media img',
      baseSvgSel: 'svg[class*="--base"]',
      blendSvgSel: 'svg[class*="--blend"]'
    })
  }

  const initProject2 = () => {
    const block = q(section, '.projects-second-wrap[data-snap]')
    if (!block) return
    makeProjectAnimator({
      section,
      block,
      mediaSel: '.projects-count-media',
      imgSel: '.projects-count-img, .projects-count-media img',
      baseSvgSel: 'svg[class*="--base"]',
      blendSvgSel: 'svg[class*="--blend"]'
    })
  }

  const initProject3 = () => {
    const block = q(section, '.projects-third-wrap[data-snap]')
    if (!block) return
    makeProjectAnimator({
      section,
      block,
      mediaSel: '.projects-count-media',
      imgSel: '.projects-count-img, .projects-count-media img',
      baseSvgSel: 'svg[class*="--base"]',
      blendSvgSel: 'svg[class*="--blend"]'
    })
  }

  const initProject4 = () => {
    const block = q(section, '.projects-four-wrap[data-snap]')
    if (!block) return

    const desktopMedia = q(block, '.projects-four-desktop .projects-count-media')
    const desktopImg = q(block, '.projects-four-desktop .projects-count-media img')
    const desktopBlendSvg = q(block, '.projects-four-desktop svg[class*="--blend"]')
    const desktopBaseSvg = q(block, '.projects-four-desktop svg[class*="--base"]')

    const mobMedia = q(block, '.projects-four-mob .projects-four-mob-media')
    const mobImg = q(block, '.projects-four-mob .projects-four-mob-media img')
    const mobBlendSvg = q(block, '.projects-four-mob svg[class*="--blend"]')
    const mobBaseSvg = q(block, '.projects-four-mob svg[class*="--base"]')

    const label = q(block, '.projects-label')
    const name = q(block, '.projects-name')

    const labelKey = 'p4_label'
    const nameKey = 'p4_name'

    if (label) storeTextOnce(label, labelKey)
    if (name) storeTextOnce(name, nameKey)
    restore.push(() => {
      restoreText(label, labelKey)
      restoreText(name, nameKey)
      qa(block, '[data-reveal-mask]').forEach((m) => m.remove())
    })

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
    if (labelWords.length)
      tl.to(
        labelWords,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.out',
          stagger: { each: 0.03, from: 'start' }
        },
        0.9
      )

    if (nameMask) tl.to(nameMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.0)
    if (nameChars.length)
      tl.to(
        nameChars,
        {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: { each: 0.02, from: 'start' }
        },
        1.02
      )

    let active = false

    const activate = () => {
      active = true
      reset()
      tl.play(0)
    }

    const deactivate = () => {
      active = false
      smoothDeactivate(block, 0.36)
      gsap.delayedCall(0.38, () => {
        if (!active) reset()
      })
    }

    const binder = bindSnapActivation(section, block, activate, deactivate, SNAP_EPS)
    cleanups.push(() => binder && binder.cleanup && binder.cleanup())

    const refresh = () => {
      if (binder && binder.decide) binder.decide()
    }

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

  initProjectsUiToggle()
  initProjectsIntro()
  initProject1()
  initProject2()
  initProject3()
  initProject4()

  return () => {
    cleanups.forEach((fn) => fn && fn())
    restore.forEach((fn) => fn && fn())
  }
}

export const initProjects = () => {
  const section = document.querySelector('.projects')
  if (!section) return

  let cleanup = null
  const mm = gsap.matchMedia()

  mm.add(`(min-width: ${BP}px)`, () => {
    if (cleanup) cleanup()
    cleanup = initProjectsDesktop() || null
    return () => {
      if (cleanup) cleanup()
      cleanup = null
    }
  })

  mm.add(`(max-width: ${BP - 1}px)`, () => {
    if (cleanup) cleanup()
    initProjectsUiToggle()
    cleanup = initProjectsMobile() || null
    return () => {
      if (cleanup) cleanup()
      cleanup = null
    }
  })
}
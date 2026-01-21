import { makeTrigger, splitToChars } from '../core.js'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobile992 = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(max-width: 992px)').matches

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

const splitToWordsKeepHTML = (el) => {
  if (!el) return []

  const nodes = Array.from(el.childNodes)
  el.innerHTML = ''

  const frag = document.createDocumentFragment()

  const pushWord = (word) => {
    const s = document.createElement('span')
    s.setAttribute('data-w', '')
    s.style.display = 'inline-block'
    s.textContent = word
    frag.appendChild(s)
  }

  const walkText = (text) => {
    const parts = String(text).split(/(\s+)/)
    parts.forEach((p) => {
      if (!p) return
      if (/^\s+$/.test(p)) {
        frag.appendChild(document.createTextNode(p))
      } else {
        pushWord(p)
      }
    })
  }

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      walkText(node.textContent)
      return
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const wrap = document.createElement(node.tagName.toLowerCase())
      for (const attr of node.attributes) wrap.setAttribute(attr.name, attr.value)

      const innerFrag = document.createDocumentFragment()
      const innerParts = String(node.textContent || '').split(/(\s+)/)

      innerParts.forEach((p) => {
        if (!p) return
        if (/^\s+$/.test(p)) {
          innerFrag.appendChild(document.createTextNode(p))
        } else {
          const w = document.createElement('span')
          w.setAttribute('data-w', '')
          w.style.display = 'inline-block'
          w.textContent = p
          innerFrag.appendChild(w)
        }
      })

      wrap.appendChild(innerFrag)
      frag.appendChild(wrap)
      return
    }
  })

  el.appendChild(frag)
  return Array.from(el.querySelectorAll('[data-w]'))
}

const wrapLinesInP = (p) => {
  if (!p) return []
  if (p.querySelector('[data-l]')) return Array.from(p.querySelectorAll('[data-l]'))

  const text = (p.textContent || '').replace(/\s+/g, ' ').trim()
  p.textContent = ''

  const maxChars = 54
  const words = text.split(' ')
  const lines = []
  let line = ''

  words.forEach((w) => {
    const next = line ? `${line} ${w}` : w
    if (next.length > maxChars) {
      if (line) lines.push(line)
      line = w
    } else {
      line = next
    }
  })
  if (line) lines.push(line)

  const frag = document.createDocumentFragment()
  lines.forEach((l, i) => {
    const span = document.createElement('span')
    span.setAttribute('data-l', '')
    span.style.display = 'block'
    span.textContent = l
    frag.appendChild(span)
    if (i !== lines.length - 1) frag.appendChild(document.createTextNode('\n'))
  })

  p.appendChild(frag)
  return Array.from(p.querySelectorAll('[data-l]'))
}

const initPhilosophyPremium = (ph) => {
  const reduce = prefersReducedMotion()
  const mobile = isMobile992()

  const lineH = ph.querySelector('.philosophy-line-horizontal')
  const lineV = ph.querySelector('.philosophy-line-vertical')
  const lineHT = ph.querySelector('.philosophy-line-horizontal-top')

  const title = ph.querySelector('.philosophy-title')
  const desc = ph.querySelector('.philosophy-description')

  const leftImg = ph.querySelector('.philosophy-column > img')
  const leftText = ph.querySelector('.philosophy-slide-text')
  const leftPs = leftText ? Array.from(leftText.querySelectorAll('p')) : []

  const sliderWrap = ph.querySelector('.philosophy-slider-wrap')
  const slider = ph.querySelector('.philosophy-slider')
  const slideImgs = Array.from(ph.querySelectorAll('.philosophy-slide-image'))

  const controls = ph.querySelector('.philosophy-controls')
  const fraction = ph.querySelector('.philosophy-fraction')
  const progress = ph.querySelector('.philosophy-progress span')

  if (mobile) {
    const items = [title, desc, leftImg, leftText, sliderWrap, controls, fraction].filter(Boolean)

    const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })

    const reset = () => {
      if (lineH) gsap.set(lineH, { scaleX: 1, clearProps: 'transformOrigin' })
      if (lineV) gsap.set(lineV, { scaleY: 1, clearProps: 'transformOrigin' })
      if (lineHT) gsap.set(lineHT, { scaleX: 1, clearProps: 'transformOrigin' })

      if (items.length) gsap.set(items, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(10px)' })
      if (progress) gsap.set(progress, reduce ? { scaleX: 1 } : { scaleX: 0, transformOrigin: '0% 50%' })
      if (slider) gsap.set(slider, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(10px)' })
      if (slideImgs.length) gsap.set(slideImgs, reduce ? { scale: 1, filter: 'blur(0px)' } : { scale: 1.02, filter: 'blur(6px)' })

      tl.pause(0)
    }

    if (!reduce) {
      tl.to(items, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08
      }, 0)

      if (slider) tl.to(slider, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 0.25)
      if (slideImgs.length) tl.to(slideImgs, { scale: 1, filter: 'blur(0px)', duration: 1.0, ease: 'power3.out' }, 0.25)
      if (progress) tl.to(progress, { scaleX: 1, duration: 0.9, ease: 'power2.out' }, 0.55)
    } else {
      tl.add(() => {}, 0)
    }

    reset()

    makeTrigger({
      trigger: ph,
      start: 'top 90%',
      end: 'bottom top',
      once: false,
      onEnter: () => { reset(); tl.play(0) },
      onEnterBack: () => { reset(); tl.play(0) },
      onLeave: () => { tl.pause(0); reset() },
      onLeaveBack: () => { tl.pause(0); reset() }
    })

    return
  }

  const titleChars = title ? splitToChars(title) : []
  const descWords = splitToWordsKeepHTML(desc)

  const leftImgMask = ensureMask(leftImg, ph)
  const leftTextMask = ensureMask(leftText, ph)
  const sliderWrapMask = ensureMask(sliderWrap, ph)

  const pLines = leftPs.flatMap((p) => wrapLinesInP(p))

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1)

  const reset = () => {
    if (lineH) gsap.set(lineH, { scaleX: reduce ? 1 : 0, transformOrigin: '0% 50%' })
    if (lineV) gsap.set(lineV, { scaleY: reduce ? 1 : 0, transformOrigin: '50% 0%' })
    if (lineHT) gsap.set(lineHT, { scaleX: reduce ? 1 : 0, transformOrigin: '0% 50%' })

    if (titleChars.length) gsap.set(titleChars, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 8, filter: 'blur(14px)' })
    if (descWords.length) gsap.set(descWords, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(14px)' })

    if (leftImg) {
      leftImg.style.transformOrigin = '50% 60%'
      gsap.set(leftImg, reduce ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : { opacity: 0, y: 16, scale: 1.03, filter: 'blur(14px)' })
    }
    if (leftImgMask) gsap.set(leftImgMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })

    if (leftText) gsap.set(leftText, reduce ? { opacity: 1 } : { opacity: 1 })
    if (leftTextMask) gsap.set(leftTextMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })
    if (pLines.length) gsap.set(pLines, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(12px)' })

    if (sliderWrap) gsap.set(sliderWrap, reduce ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 0% 100% 0%)' })
    if (sliderWrapMask) gsap.set(sliderWrapMask, reduce ? { scaleX: 0 } : { scaleX: 1, transformOrigin: '0% 50%' })

    if (slider) gsap.set(slider, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 14, filter: 'blur(14px)' })

    if (slideImgs.length) {
      slideImgs.forEach((img) => (img.style.transformOrigin = '50% 60%'))
      gsap.set(slideImgs, reduce ? { scale: 1, filter: 'blur(0px)' } : { scale: 1.06, filter: 'blur(10px)' })
    }

    if (controls) gsap.set(controls, reduce ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 10, filter: 'blur(10px)' })
    if (fraction) gsap.set(fraction, reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 })
    if (progress) gsap.set(progress, reduce ? { scaleX: 1 } : { scaleX: 0, transformOrigin: '0% 50%' })

    tl.pause(0)
  }

  const tLines = 0
  const tTitle = 0.22
  const tDesc = 0.58
  const tLeft = 1.05
  const tSlider = 1.45
  const tControls = 2.1

  if (!reduce) {
    if (lineH) tl.to(lineH, { scaleX: 1, duration: 0.95, ease: 'power2.out' }, tLines)
    if (lineV) tl.to(lineV, { scaleY: 1, duration: 1.05, ease: 'power2.out' }, tLines + 0.08)
    if (lineHT) tl.to(lineHT, { scaleX: 1, duration: 0.95, ease: 'power2.out' }, tLines + 0.18)

    if (titleChars.length) {
      tl.to(titleChars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.15,
        ease: 'power3.out',
        stagger: { each: 0.055, from: 'start' }
      }, tTitle)
    }

    if (descWords.length) {
      tl.to(descWords, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
        stagger: { each: 0.035, from: 'start' }
      }, tDesc)
    }

    if (leftImgMask) tl.to(leftImgMask, { scaleX: 0, duration: 0.6, ease: 'power3.inOut' }, tLeft - 0.08)
    if (leftImg) tl.to(leftImg, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out' }, tLeft)

    if (leftTextMask) tl.to(leftTextMask, { scaleX: 0, duration: 0.6, ease: 'power3.inOut' }, tLeft + 0.14)
    if (pLines.length) {
      tl.to(pLines, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: { each: 0.06, from: 'start' }
      }, tLeft + 0.22)
    }

    if (sliderWrapMask) tl.to(sliderWrapMask, { scaleX: 0, duration: 0.65, ease: 'power3.inOut' }, tSlider - 0.1)
    if (sliderWrap) tl.to(sliderWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power4.out' }, tSlider)
    if (slider) tl.to(slider, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.95, ease: 'power3.out' }, tSlider + 0.06)
    if (slideImgs.length) tl.to(slideImgs, { scale: 1, filter: 'blur(0px)', duration: 1.15, ease: 'power3.out' }, tSlider + 0.1)

    if (controls) tl.to(controls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' }, tControls)
    if (fraction) tl.to(fraction, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, tControls + 0.05)
    if (progress) tl.to(progress, { scaleX: 1, duration: 1.0, ease: 'power2.out' }, tControls + 0.12)
  } else {
    tl.add(() => {}, 0)
  }

  const applyHover = () => {
    if (reduce) return

    if (leftImg) {
      leftImg.addEventListener('mouseenter', () => gsap.to(leftImg, { scale: 1.03, duration: 0.9, ease: 'power3.out' }))
      leftImg.addEventListener('mouseleave', () => gsap.to(leftImg, { scale: 1, duration: 0.95, ease: 'power3.out' }))
    }

    slideImgs.forEach((img) => {
      img.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.04, duration: 0.9, ease: 'power3.out' }))
      img.addEventListener('mouseleave', () => gsap.to(img, { scale: 1, duration: 0.95, ease: 'power3.out' }))
    })
  }

  reset()
  applyHover()

  makeTrigger({
    trigger: ph,
    start: 'top 85%',
    end: 'bottom top',
    once: false,
    onEnter: () => { reset(); tl.play(0) },
    onEnterBack: () => { reset(); tl.play(0) },
    onLeave: () => { tl.pause(0); reset() },
    onLeaveBack: () => { tl.pause(0); reset() }
  })
}

export const initPhilosophy = () => {
  const ph = document.querySelector('.philosophy[data-snap]')
  if (!ph) return
  initPhilosophyPremium(ph)
}

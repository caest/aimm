import { makeTrigger, splitToChars } from '../core.js'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isMobile = () => window.innerWidth < 992

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
  const mobile = isMobile()

  if (mobile) {
    const animatedElements = [
      ...Array.from(ph.querySelectorAll('.philosophy-title, .philosophy-description, .philosophy-column, .philosophy-slider-wrap')),
      ...Array.from(ph.querySelectorAll('img, .philosophy-slide-text, .philosophy-controls'))
    ]

    animatedElements.forEach(el => {
      if (el) {
        gsap.set(el, { 
          opacity: 0, 
          y: 20
        })
      }
    })

    const tl = gsap.timeline({ paused: true })
    
    tl.to(animatedElements, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      stagger: 0.1
    }, 0)

    makeTrigger({
      trigger: ph,
      start: 'top 85%',
      end: 'bottom top',
      once: true,
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play()
    })

    return
  }

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

  const titleChars = title ? splitToChars(title) : []
  const descWords = splitToWordsKeepHTML(desc)

  const leftImgMask = ensureMask(leftImg, ph)
  const leftTextMask = ensureMask(leftText, ph)
  const sliderWrapMask = ensureMask(sliderWrap, ph)

  const pLines = leftPs.flatMap((p) => wrapLinesInP(p))

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
  }

  const applyHover = () => {
    if (reduce) return

    if (leftImg) {
      leftImg.addEventListener('mouseenter', () => gsap.to(leftImg, { scale: 1.03, duration: 0.6, ease: 'power3.out' }))
      leftImg.addEventListener('mouseleave', () => gsap.to(leftImg, { scale: 1, duration: 0.7, ease: 'power3.out' }))
    }

    slideImgs.forEach((img) => {
      img.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.04, duration: 0.6, ease: 'power3.out' }))
      img.addEventListener('mouseleave', () => gsap.to(img, { scale: 1, duration: 0.7, ease: 'power3.out' }))
    })
  }

  reset()
  applyHover()

  // Быстрая анимация при скролле
  if (!reduce) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ph,
        start: 'top 75%',
        end: 'bottom 50%',
        scrub: 0.8,
        markers: false
      }
    })

    if (lineH) tl.to(lineH, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0)
    if (lineV) tl.to(lineV, { scaleY: 1, duration: 0.9, ease: 'power2.out' }, 0.1)
    if (lineHT) tl.to(lineHT, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.15)

    if (titleChars.length) {
      tl.to(titleChars, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: 'power3.out',
        stagger: { each: 0.04, from: 'start' }
      }, 0.2)
    }

    if (descWords.length) {
      tl.to(descWords, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'power3.out',
        stagger: { each: 0.025, from: 'start' }
      }, 0.5)
    }

    if (leftImgMask) tl.to(leftImgMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 0.9)
    if (leftImg) tl.to(leftImg, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 1.0)

    if (leftTextMask) tl.to(leftTextMask, { scaleX: 0, duration: 0.5, ease: 'power3.inOut' }, 1.1)
    if (pLines.length) {
      tl.to(pLines, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power3.out',
        stagger: { each: 0.04, from: 'start' }
      }, 1.2)
    }

    if (sliderWrapMask) tl.to(sliderWrapMask, { scaleX: 0, duration: 0.6, ease: 'power3.inOut' }, 1.5)
    if (sliderWrap) tl.to(sliderWrap, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power4.out' }, 1.6)
    if (slider) tl.to(slider, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 1.7)
    if (slideImgs.length) tl.to(slideImgs, { scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 1.8)

    if (controls) tl.to(controls, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, 2.0)
    if (fraction) tl.to(fraction, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 2.05)
    if (progress) tl.to(progress, { scaleX: 1, duration: 0.8, ease: 'power2.out' }, 2.1)
  }
}

export const initPhilosophy = () => {
  const ph = document.querySelector('.philosophy')
  if (!ph) return
  initPhilosophyPremium(ph)
}
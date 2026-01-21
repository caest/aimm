import { makeTrigger, splitToChars } from '../core.js'

const COLOR = '#E6E6E6'

const ensureBaseLayout = (social) => {
  const cs = getComputedStyle(social)
  if (cs.position === 'static') social.style.position = 'relative'
  if (cs.overflow === 'visible') social.style.overflow = 'hidden'
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

const ensureTopBorder = (social) => {
  let el = social.querySelector('[data-social-top-border]')
  if (!el) {
    el = document.createElement('div')
    el.setAttribute('data-social-top-border', '')
    social.appendChild(el)
  }

  el.style.position = 'absolute'
  el.style.left = '0'
  el.style.top = '0'
  el.style.width = '100%'
  el.style.height = '2px'
  el.style.background = COLOR
  el.style.pointerEvents = 'none'
  el.style.zIndex = '9999'
  el.style.transformOrigin = '0% 50%'

  return el
}

const ensureVWrap = (social) => {
  let el = social.querySelector('[data-social-vwrap]')
  if (!el) {
    el = document.createElement('div')
    el.setAttribute('data-social-vwrap', '')
    social.appendChild(el)
  }

  el.style.position = 'absolute'
  el.style.left = '0'
  el.style.top = '0'
  el.style.width = '100%'
  el.style.height = '100%'
  el.style.pointerEvents = 'none'
  el.style.zIndex = '-1'

  return el
}

const buildVLines = (social, vwrap) => {
  const links = Array.from(social.querySelectorAll('.social-link'))
  vwrap.innerHTML = ''
  if (!links.length) return []

  const sRect = social.getBoundingClientRect()
  
  // Получаем ширину окна
  const windowWidth = window.innerWidth
  // Определяем, нужно ли ограничивать количество линий до 1
  const shouldLimitToOne = windowWidth <= 992
  
  // Если ширина окна <= 992px, берем только первую ссылку
  const linksToProcess = shouldLimitToOne ? [links[0]] : links

  return linksToProcess.map((a, i) => {
    const r = a.getBoundingClientRect()
    const x = Math.round(r.right - sRect.left)

    const line = document.createElement('span')
    line.setAttribute('data-social-vline', String(i))
    line.style.position = 'absolute'
    line.style.left = `${x}px`
    line.style.top = '50%'
    line.style.width = '2px'
    line.style.height = '3000px'
    line.style.background = COLOR
    line.style.pointerEvents = 'none'
    line.style.transformOrigin = '50% 0%'
    line.style.transform = 'translateY(-50%) scaleY(0)'

    vwrap.appendChild(line)
    return line
  })
}

/* ===========================
   MARQUEE (infinite, auto-duplicate)
=========================== */

const marqueeState = new WeakMap()

const ensureMarqueeClones = (row, minGap = 90) => {
  const inner = row.querySelector('.social-marquee-inner')
  if (!inner) return null

  inner.style.display = 'flex'
  inner.style.flexWrap = 'nowrap'
  inner.style.alignItems = 'stretch'
  inner.style.willChange = 'transform'
  inner.style.gap = `${minGap}px`

  Array.from(inner.querySelectorAll('[data-marquee-clone="1"]')).forEach((n) => n.remove())

  const originals = Array.from(inner.children)
  if (!originals.length) return inner

  const rowW = row.getBoundingClientRect().width
  const maxLoops = 14

  let loops = 0
  while (inner.scrollWidth < rowW * 1.6 && loops < maxLoops) {
    originals.forEach((node) => {
      const clone = node.cloneNode(true)
      clone.setAttribute('data-marquee-clone', '1')
      inner.appendChild(clone)
    })
    loops += 1
  }

  return inner
}

const startMarquee = (row, dir = 1, speed = 90, gap = 90) => {
  const inner = ensureMarqueeClones(row, gap)
  if (!inner) return null

  const totalW = inner.scrollWidth
  if (!totalW) return null

  const distance = totalW / 2
  const duration = Math.max(10, distance / speed)

  gsap.killTweensOf(inner)
  gsap.set(inner, { x: 0 })

  const tween = gsap.to(inner, {
    x: dir > 0 ? -distance : distance,
    duration,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: (value) => {
        const v = parseFloat(value) || 0
        const m = distance
        const wrapped = ((v % m) + m) % m
        return `${-wrapped}px`
      }
    }
  })

  marqueeState.set(row, { inner, tween })
  return tween
}

const stopMarquee = (row) => {
  const st = marqueeState.get(row)
  if (!st) return
  gsap.killTweensOf(st.inner)
  marqueeState.delete(row)
}

/* ===========================
   INIT
=========================== */

const initSocialPremium = (social) => {
  ensureBaseLayout(social)

  const topBorder = ensureTopBorder(social)
  const vwrap = ensureVWrap(social)

  const linksWrap = social.querySelector('.social-links')
  const links = Array.from(social.querySelectorAll('.social-link'))

  const title = social.querySelector('.social-title')
  const titleImg = title ? title.querySelector('img') : null

  const rows = Array.from(social.querySelectorAll('.social-marquee-row'))

  const linkMasks = links.map((a) => ensureMask(a, social))
  const linkChars = links.map((a) => splitToChars(a))

  let vlines = buildVLines(social, vwrap)

  const reset = () => {
    gsap.set(topBorder, { scaleX: 0 })
    if (vlines.length) gsap.set(vlines, { scaleY: 0 })

    if (linksWrap) gsap.set(linksWrap, { opacity: 1 })

    links.forEach((a, i) => {
      const m = linkMasks[i]
      const ch = linkChars[i]
      if (m) gsap.set(m, { scaleX: 1, transformOrigin: '0% 50%' })
      if (ch && ch.length) gsap.set(ch, { opacity: 0, yPercent: 120, rotate: 1.2, transformOrigin: '50% 100%' })
      gsap.set(a, { opacity: 1 })
    })

    if (title) gsap.set(title, { opacity: 0, y: 16, filter: 'blur(10px)' })
    if (titleImg) gsap.set(titleImg, { scale: 1.05, transformOrigin: '50% 50%' })

    rows.forEach((row, i) => {
      const fromX = i % 2 === 0 ? -48 : 48
      gsap.set(row, { opacity: 0, x: fromX, filter: 'blur(10px)' })
    })
  }

  const startRows = () => {
    rows.forEach((row, i) => {
      const dir = i % 2 === 0 ? 1 : -1
      startMarquee(row, dir, 70, 240)
    })
  }

  const stopRows = () => {
    rows.forEach((row) => stopMarquee(row))
  }

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(0.88)

  const noteSlow = (d) => d + 0.22

  const rebuild = () => {
    vlines = buildVLines(social, vwrap)

    tl.clear()
    reset()

    tl.to(topBorder, { scaleX: 1, duration: noteSlow(0.45), ease: 'power2.out' }, 0)

    if (vlines.length) {
      tl.to(vlines, {
        scaleY: 1,
        duration: noteSlow(0.85),
        ease: 'power2.out',
        stagger: 0.09
      }, 0.12)
    }

    links.forEach((a, i) => {
      const m = linkMasks[i]
      const ch = linkChars[i]
      const t = 0.36 + i * 0.14

      if (m) tl.to(m, { scaleX: 0, duration: noteSlow(0.45), ease: 'power3.inOut' }, t)

      if (ch && ch.length) {
        tl.to(ch, {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration: noteSlow(0.75),
          ease: 'power4.out',
          stagger: { each: 0.024, from: 'start' }
        }, t + 0.08)
      }
    })

    if (title) tl.to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: noteSlow(0.8), ease: 'power3.out' }, 1.18)
    if (titleImg) tl.to(titleImg, { scale: 1, duration: noteSlow(0.9), ease: 'power3.out' }, 1.18)

    rows.forEach((row, i) => {
      const t = 1.55 + i * 0.18
      tl.to(row, { opacity: 1, x: 0, filter: 'blur(0px)', duration: noteSlow(0.9), ease: 'power3.out' }, t)
    })
  }

  rebuild()

  const handleResize = () => {
    stopRows()
    rebuild()
    startRows()
    ScrollTrigger.refresh()
  }

  const ro = new ResizeObserver(handleResize)
  
  // Также отслеживаем изменение размера окна
  window.addEventListener('resize', handleResize)

  ro.observe(social)
  links.forEach((a) => ro.observe(a))
  rows.forEach((r) => ro.observe(r))

  makeTrigger({
    trigger: social,
    start: 'top 80%',
    end: 'bottom top',
    once: false,
    onEnter: () => {
      stopRows()
      rebuild()
      tl.play(0)
      startRows()
    },
    onEnterBack: () => {
      stopRows()
      rebuild()
      tl.play(0)
      startRows()
    },
    onLeave: () => {
      tl.pause(0)
      reset()
      stopRows()
    },
    onLeaveBack: () => {
      tl.pause(0)
      reset()
      stopRows()
    }
  })

  ScrollTrigger.refresh()
  
  // Убираем обработчик при уничтожении компонента (опционально)
  return () => {
    window.removeEventListener('resize', handleResize)
    ro.disconnect()
  }
}

export const initSocial = () => {
  const social = document.querySelector('.social[data-snap], .social')
  if (!social) return
  initSocialPremium(social)
}
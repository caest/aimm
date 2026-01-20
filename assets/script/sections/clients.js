import { makeTrigger, splitToChars } from '../core.js'

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

const wrapLogosForGrid = (wrap) => {
  if (!wrap) return []
  const nodes = Array.from(wrap.children).filter((n) => n && n.nodeType === 1)
  nodes.forEach((el) => {
    const cs = getComputedStyle(el)
    if (cs.display === 'inline') el.style.display = 'block'
    el.style.willChange = 'transform, opacity, filter'
  })
  return nodes
}

const parseCountNumber = (text) => {
  const m = String(text || '').match(/\d+/g)
  if (!m) return 0
  return parseInt(m.join(''), 10) || 0
}

const formatCountText = (original, n) => {
  const str = String(original || '')
  return str.replace(/\d+/g, (m) => String(n).padStart(m.length, '0'))
}

const initClientsPremium = (clients) => {
  const vLine = clients.querySelector('.clients-line-vertical')
  const hLine = clients.querySelector('.clients-line-horizontal')

  const title = clients.querySelector('.clients-title')
  const count = clients.querySelector('.clients-count')

  const logosWrap = clients.querySelector('.clients-logo-wrap')
  const seeMore = clients.querySelector('.clients-see-more')
  const seeMoreArrow = seeMore ? seeMore.querySelector('img') : null
  const seeMoreText = seeMore ? seeMore.querySelector('span') : null

  const titleChars = title ? splitToChars(title) : []

  const countMask = ensureMask(count, clients)
  const countOriginal = count ? (count.textContent || '').trim() : ''
  const countTarget = parseCountNumber(countOriginal)

  const logos = wrapLogosForGrid(logosWrap)

  const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } })
  tl.timeScale(1.12)

  const reset = () => {
    if (vLine) gsap.set(vLine, { scaleY: 0, transformOrigin: '50% 0%' })
    if (hLine) gsap.set(hLine, { scaleX: 0, transformOrigin: '0% 50%' })

    if (titleChars.length) gsap.set(titleChars, { opacity: 0, yPercent: 130, rotate: 1.5, transformOrigin: '50% 100%' })

    if (count) gsap.set(count, { opacity: 0, y: 10, filter: 'blur(6px)' })
    if (countMask) gsap.set(countMask, { scaleX: 1, transformOrigin: '0% 50%' })
    if (count) count.textContent = formatCountText(countOriginal, 0)

    if (logos.length) gsap.set(logos, { opacity: 0, y: 20, scale: 0.985, filter: 'blur(10px)' })

    if (seeMore) gsap.set(seeMore, { opacity: 0, y: 12, filter: 'blur(6px)' })
    if (seeMoreText) gsap.set(seeMoreText, { opacity: 0, y: 10 })
    if (seeMoreArrow) gsap.set(seeMoreArrow, { opacity: 0, x: -10, rotate: -10, transformOrigin: '50% 50%' })

    tl.pause(0)
  }

  const tLines = 0
  const tTitle = 0.22
  const tCount = 0.55
  const tLogos = 0.78
  const tMore = 1.35

  if (vLine) tl.to(vLine, { scaleY: 1, duration: 0.85, ease: 'power2.out' }, tLines)
  if (hLine) tl.to(hLine, { scaleX: 1, duration: 0.85, ease: 'power2.out' }, tLines + 0.06)

  if (titleChars.length) {
    tl.to(titleChars, {
      opacity: 1,
      yPercent: 0,
      rotate: 0,
      duration: 1.05,
      ease: 'power4.out',
      stagger: { each: 0.022, from: 'start' }
    }, tTitle)
  }

  if (countMask) tl.to(countMask, { scaleX: 0, duration: 0.55, ease: 'power3.inOut' }, tCount)
  if (count) tl.to(count, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, tCount + 0.06)

  tl.fromTo(
    { v: 0 },
    { v: 0 },
    {
      v: countTarget,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: function () {
        if (!count) return
        const v = Math.round(this.targets()[0].v)
        count.textContent = formatCountText(countOriginal, v)
      }
    },
    tCount + 0.08
  )

  if (logos.length) {
    tl.to(logos, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
      stagger: { each: 0.06, from: 'start' }
    }, tLogos)
  }

  if (seeMore) tl.to(seeMore, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }, tMore)
  if (seeMoreText) tl.to(seeMoreText, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, tMore + 0.05)
  if (seeMoreArrow) tl.to(seeMoreArrow, { opacity: 1, x: 0, rotate: 0, duration: 0.7, ease: 'power3.out' }, tMore + 0.08)

  reset()

  makeTrigger({
    trigger: clients,
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
    onLeave: () => {
      tl.pause(0)
      reset()
    },
    onLeaveBack: () => {
      tl.pause(0)
      reset()
    }
  })
}

export const initClients = () => {
  const clients = document.querySelector('.clients[data-snap]')
  if (!clients) return
  initClientsPremium(clients)
}

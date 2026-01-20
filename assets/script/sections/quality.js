const state = new WeakMap()

const ensureBase = (quality) => {
  const cs = getComputedStyle(quality)
  if (cs.position === 'static') quality.style.position = 'relative'
  if (cs.overflow === 'visible') quality.style.overflow = 'hidden'
}

const getTitle = (quality) => quality.querySelector('.quality-title')
const getInner = (quality) => quality.querySelector('.quality-title-inner')
const getLabel = (quality) => quality.querySelector('.quality-label')
const getLink = (quality) => quality.querySelector('.quality-link')

const applyEdgeFadeToViewport = (viewport, fadePx = 160) => {
  if (!viewport) return

  const mask = `linear-gradient(90deg,
    rgba(0,0,0,0) 0px,
    rgba(0,0,0,1) ${fadePx}px,
    rgba(0,0,0,1) calc(100% - ${fadePx}px),
    rgba(0,0,0,0) 100%)`

  viewport.style.overflow = 'hidden'
  viewport.style.willChange = 'transform'
  viewport.style.width = '100%'
  viewport.style.left = '0'
  viewport.style.right = '0'
  viewport.style.maxWidth = '100%'

  const cs = getComputedStyle(viewport)
  const base = cs.transform && cs.transform !== 'none' ? cs.transform : ''
  viewport.style.transform = base ? `${base} translateZ(0)` : 'translateZ(0)'

  viewport.style.webkitMaskImage = mask
  viewport.style.maskImage = mask
  viewport.style.webkitMaskRepeat = 'no-repeat'
  viewport.style.maskRepeat = 'no-repeat'
  viewport.style.webkitMaskSize = '100% 100%'
  viewport.style.maskSize = '100% 100%'
  viewport.style.webkitMaskPosition = '0 0'
  viewport.style.maskPosition = '0 0'
}

const ensureClones = (title, inner) => {
  if (!title || !inner) return false

  inner.style.display = 'flex'
  inner.style.flexWrap = 'nowrap'
  inner.style.alignItems = 'center'
  inner.style.willChange = 'transform'
  inner.style.gap = '48px'

  Array.from(inner.querySelectorAll('[data-quality-clone="1"]')).forEach((n) => n.remove())

  const originals = Array.from(inner.children)
  if (!originals.length) return false

  const titleW = title.getBoundingClientRect().width || window.innerWidth

  let loops = 0
  const maxLoops = 60

  while (inner.scrollWidth < titleW * 3.2 && loops < maxLoops) {
    originals.forEach((node) => {
      const clone = node.cloneNode(true)
      clone.setAttribute('data-quality-clone', '1')
      inner.appendChild(clone)
    })
    loops += 1
  }

  return true
}

const startMarquee = (quality, inner, { speed = 55, direction = -1 } = {}) => {
  if (!inner) return null

  const totalW = inner.scrollWidth
  if (!totalW) return null

  const distance = totalW / 2
  const duration = Math.max(10, distance / speed)

  gsap.killTweensOf(inner)
  gsap.set(inner, { x: 0 })

  const tween = gsap.to(inner, {
    x: direction < 0 ? -distance : distance,
    duration,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: (value) => {
        const v = parseFloat(value) || 0
        const m = distance
        const wrapped = ((v % m) + m) % m
        return `${direction < 0 ? -wrapped : wrapped}px`
      }
    }
  })

  state.set(quality, { ...(state.get(quality) || {}), inner, tween })
  return tween
}

const stopMarquee = (quality) => {
  const st = state.get(quality)
  if (!st || !st.inner) return
  gsap.killTweensOf(st.inner)
  state.delete(quality)
}

const initReveal = (quality) => {
  const label = getLabel(quality)
  const link = getLink(quality)
  if (!label && !link) return

  const setHidden = (el) => {
    if (!el) return
    el.style.willChange = 'transform,opacity,filter'
    gsap.set(el, { autoAlpha: 0, y: 28, scale: 0.985, filter: 'blur(10px)' })
  }

  setHidden(label)
  setHidden(link)

  const tl = gsap.timeline({ paused: true })
  if (label) {
    tl.to(label, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.15,
      ease: 'power3.out',
      clearProps: 'willChange,filter'
    })
  }
  if (link) {
    tl.to(
      link,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.15,
        ease: 'power3.out',
        clearProps: 'willChange,filter'
      },
      label ? '-=0.7' : 0
    )
    tl.fromTo(
      link,
      { boxShadow: '0 0 0 rgba(0,0,0,0)' },
      { boxShadow: '0 18px 40px rgba(0,0,0,0.18)', duration: 0.6, ease: 'power2.out' },
      '-=0.9'
    )
  }

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: quality,
      start: 'top 82%',
      once: true,
      onEnter: () => tl.play(0)
    })
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        tl.play(0)
        io.disconnect()
      })
    },
    { threshold: 0.18 }
  )

  io.observe(quality)
}

const initMagnet = (quality) => {
  const link = getLink(quality)
  if (!link) return

  link.style.willChange = 'transform'

  const setX = gsap.quickTo(link, 'x', { duration: 0.25, ease: 'power3.out' })
  const setY = gsap.quickTo(link, 'y', { duration: 0.25, ease: 'power3.out' })

  const strength = 0.28
  const maxShift = 34

  const onMove = (e) => {
    const r = link.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const x = Math.max(-maxShift, Math.min(maxShift, dx * strength))
    const y = Math.max(-maxShift, Math.min(maxShift, dy * strength))
    setX(x)
    setY(y)
  }

  const onLeave = () => {
    setX(0)
    setY(0)
  }

  link.addEventListener('mousemove', onMove)
  link.addEventListener('mouseleave', onLeave)

  state.set(quality, { ...(state.get(quality) || {}), magnet: { link, onMove, onLeave } })
}

const initParallaxBg = (quality) => {
  const cs = getComputedStyle(quality)
  const bg = cs.backgroundImage
  if (!bg || bg === 'none') return

  quality.style.backgroundRepeat = 'no-repeat'
  quality.style.backgroundPosition = 'center 50%'
  quality.style.backgroundSize = 'cover'
  quality.style.willChange = 'background-position'

  const maxShift = 180
  let raf = 0

  const update = () => {
    raf = 0
    const r = quality.getBoundingClientRect()
    const vh = window.innerHeight || 0
    const total = r.height + vh
    if (total <= 0) return

    const progress = (vh - r.top) / total
    const clamped = Math.max(0, Math.min(1, progress))
    const shift = (clamped - 0.5) * 2 * maxShift

    quality.style.backgroundPosition = `center calc(50% + ${shift}px)`
  }

  const onScroll = () => {
    if (raf) return
    raf = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  state.set(quality, { ...(state.get(quality) || {}), parallax: { onScroll } })
}

export const initQuality = () => {
  const quality = document.querySelector('.quality[data-snap], .quality')
  if (!quality) return

  ensureBase(quality)

  const title = getTitle(quality)
  const inner = getInner(quality)
  if (!title || !inner) return

  const rebuild = () => {
    stopMarquee(quality)

    title.style.width = '100%'
    title.style.left = '0'
    title.style.right = '0'
    title.style.maxWidth = '100%'

    applyEdgeFadeToViewport(title, 160)
    ensureClones(title, inner)
    startMarquee(quality, inner, { speed: 55, direction: -1 })
  }

  rebuild()

  initParallaxBg(quality)
  initReveal(quality)
  initMagnet(quality)

  const ro = new ResizeObserver(() => rebuild())
  ro.observe(quality)
  ro.observe(title)
  ro.observe(inner)
}

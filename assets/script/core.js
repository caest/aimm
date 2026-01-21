import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'

gsap.registerPlugin(ScrollTrigger)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const isEditableTarget = (t) => {
  if (!t) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}

const hasScrollableParent = (t) => {
  let el = t
  while (el && el !== document.documentElement) {
    const cs = getComputedStyle(el)
    const oy = cs.overflowY
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true
    el = el.parentElement
  }
  return false
}

export const initSmoothSnap = ({
  sectionSelector = '[data-snap]',
  duration = 1.0,
  threshold = 70,
  cooldown = 900,
  wheelMultiplier = 1,
  lerp = 0.12,
  smoothWheel = true,
  smoothTouch = false,
  disableAt = 992
} = {}) => {
  const reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const mql = window.matchMedia(`(max-width: ${disableAt}px)`)

  const state = {
    active: false,
    locked: false,
    acc: 0,
    lastDir: 0,
    lenis: null,
    tickerFn: null,
    onWheel: null,
    onKey: null,
    onResize: null,
    onRefresh: null,
    onMql: null,
    restoreSnap: null
  }

  const disableCssSnap = () => {
    const html = document.documentElement
    const body = document.body
    if (!html || !body) return

    const prevHtml = html.style.scrollSnapType
    const prevBody = body.style.scrollSnapType

    html.style.scrollSnapType = 'none'
    body.style.scrollSnapType = 'none'

    state.restoreSnap = () => {
      html.style.scrollSnapType = prevHtml
      body.style.scrollSnapType = prevBody
    }
  }

  const setNativeScrollerProxy = () => {
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) window.scrollTo(0, value)
        return window.scrollY || document.documentElement.scrollTop || 0
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      }
    })
  }

  const getSections = () =>
    Array.from(document.querySelectorAll(sectionSelector)).filter(Boolean)

  const getActiveIndex = (sections) => {
    if (!sections.length) return -1
    const y = window.scrollY || 0
    const vh = window.innerHeight || 1
    const probe = y + vh * 0.35
    let best = 0
    let bestDist = Infinity
    for (let i = 0; i < sections.length; i++) {
      const top = sections[i].getBoundingClientRect().top + y
      const dist = Math.abs(top - probe)
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    }
    return best
  }

  const scrollToIndex = (sections, idx) => {
    if (!sections.length || !state.lenis) return
    const i = clamp(idx, 0, sections.length - 1)
    const el = sections[i]
    state.locked = true

    state.lenis.scrollTo(el, {
      duration,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    })

    window.clearTimeout(scrollToIndex.__t)
    scrollToIndex.__t = window.setTimeout(() => {
      state.locked = false
    }, cooldown)
  }

  const setupDesktop = () => {
    if (state.active) return
    state.active = true

    if (state.restoreSnap) {
      state.restoreSnap()
      state.restoreSnap = null
    }

    const lenis = new Lenis({
      smoothWheel: reduced ? false : smoothWheel,
      smoothTouch: reduced ? false : smoothTouch,
      lerp,
      wheelMultiplier
    })

    state.lenis = lenis
    window.__lenis = lenis

    state.tickerFn = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(state.tickerFn)
    gsap.ticker.lagSmoothing(0)

    lenis.on('scroll', () => ScrollTrigger.update())

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: true })
        return window.scrollY || document.documentElement.scrollTop || 0
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      }
    })

    state.onWheel = (e) => {
      if (!state.active || state.locked || reduced) return
      if (e.ctrlKey || e.metaKey) return
      if (isEditableTarget(e.target) || hasScrollableParent(e.target)) return

      const sections = getSections()
      if (sections.length < 2) return

      const dy = e.deltaY
      const dir = dy > 0 ? 1 : -1

      if (state.lastDir && dir !== state.lastDir) state.acc = 0
      state.lastDir = dir
      state.acc += Math.abs(dy)

      if (state.acc < threshold) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      state.acc = 0

      const current = getActiveIndex(sections)
      if (current < 0) return
      scrollToIndex(sections, current + dir)
    }

    state.onKey = (e) => {
      if (!state.active || state.locked || reduced) return
      if (isEditableTarget(e.target) || hasScrollableParent(e.target)) return

      const sections = getSections()
      if (sections.length < 2) return

      const keysDown = ['ArrowDown', 'PageDown', 'Space']
      const keysUp = ['ArrowUp', 'PageUp']
      let dir = 0
      if (keysDown.includes(e.code)) dir = 1
      if (keysUp.includes(e.code)) dir = -1
      if (!dir) return

      e.preventDefault()

      const current = getActiveIndex(sections)
      if (current < 0) return
      scrollToIndex(sections, current + dir)
    }

    state.onResize = () => {
      state.acc = 0
      state.locked = false
      ScrollTrigger.refresh()
    }

    state.onRefresh = () => lenis.resize()

    window.addEventListener('wheel', state.onWheel, { passive: false })
    window.addEventListener('keydown', state.onKey, { passive: false })
    window.addEventListener('resize', state.onResize)
    ScrollTrigger.addEventListener('refresh', state.onRefresh)

    ScrollTrigger.refresh()
  }

  const teardownToMobile = () => {
    disableCssSnap()

    if (!state.active) {
      setNativeScrollerProxy()
      ScrollTrigger.refresh()
      return
    }

    state.active = false
    state.acc = 0
    state.lastDir = 0
    state.locked = false

    if (state.onWheel) window.removeEventListener('wheel', state.onWheel)
    if (state.onKey) window.removeEventListener('keydown', state.onKey)
    if (state.onResize) window.removeEventListener('resize', state.onResize)
    if (state.onRefresh) ScrollTrigger.removeEventListener('refresh', state.onRefresh)

    state.onWheel = null
    state.onKey = null
    state.onResize = null
    state.onRefresh = null

    if (state.tickerFn) gsap.ticker.remove(state.tickerFn)
    state.tickerFn = null

    if (state.lenis) {
      try {
        state.lenis.destroy()
      } catch (_) {}
    }

    state.lenis = null
    delete window.__lenis

    setNativeScrollerProxy()
    ScrollTrigger.clearScrollMemory()
    ScrollTrigger.refresh()
  }

  state.onMql = () => {
    if (mql.matches) teardownToMobile()
    else setupDesktop()
  }

  mql.addEventListener('change', state.onMql)

  if (mql.matches) teardownToMobile()
  else setupDesktop()

  const api = {
    get enabled() {
      return state.active
    },
    get lenis() {
      return state.lenis
    },
    destroy() {
      mql.removeEventListener('change', state.onMql)
      teardownToMobile()
      if (state.restoreSnap) {
        state.restoreSnap()
        state.restoreSnap = null
      }
    }
  }

  return { lenis: state.lenis, snap: api }
}

export const splitToChars = (el) => {
  const text = el.textContent || ''
  el.textContent = ''
  const frag = document.createDocumentFragment()

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === ' ') {
      frag.appendChild(document.createTextNode(' '))
      continue
    }
    const s = document.createElement('span')
    s.textContent = ch
    s.style.display = 'inline-block'
    frag.appendChild(s)
  }

  el.appendChild(frag)
  return Array.from(el.querySelectorAll('span'))
}

export const makeTrigger = ({
  trigger,
  start = 'top 80%',
  end = 'bottom top',
  once = false,
  onEnter,
  onEnterBack,
  onLeave,
  onLeaveBack,
  reset = true
}) => {
  if (once) {
    return ScrollTrigger.create({
      trigger,
      start,
      once: true,
      onEnter
    })
  }

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter,
    onEnterBack: onEnterBack || onEnter,
    onLeave: reset ? (onLeave || (() => {})) : onLeave,
    onLeaveBack: reset ? (onLeaveBack || onLeave || (() => {})) : onLeaveBack
  })
}

export const bindReplay = (
  section,
  tl,
  { start = 'top 80%', end = 'bottom top', timeScale = 1, onEnter, onLeave } = {}
) => {
  tl.pause(0)
  tl.timeScale(timeScale)

  return makeTrigger({
    trigger: section,
    start,
    end,
    once: false,
    reset: true,
    onEnter: () => {
      tl.restart()
      if (onEnter) onEnter()
    },
    onEnterBack: () => {
      tl.restart()
      if (onEnter) onEnter()
    },
    onLeave: () => {
      tl.pause(0)
      if (onLeave) onLeave()
    },
    onLeaveBack: () => {
      tl.pause(0)
      if (onLeave) onLeave()
    }
  })
}

import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'
import Snap from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis-snap.mjs'

gsap.registerPlugin(ScrollTrigger)

const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

const isEditableTarget = (t) => {
  if (!t) return false
  const el = t.nodeType === 1 ? t : t.parentElement
  if (!el) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const getTop = (el) => {
  const r = el.getBoundingClientRect()
  return r.top + (window.scrollY || window.pageYOffset || 0)
}

const getClosestIndex = (items, y) => {
  if (!items.length) return 0
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < items.length; i++) {
    const d = Math.abs(items[i].top - y)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

export const initSmoothSnap = (opts = {}) => {
  const {
    sectionSelector = '[data-snap]',
    disableAt = 0,
    resetToTopOnLoad = false,

    duration = 0.9,
    easing = (t) => 1 - Math.pow(1 - t, 3),

    lerp = 0.08,
    wheelMultiplier = 1,
    touchMultiplier = 1,
    normalizeWheel = true,

    keyEnabled = true,
    keyCooldown = 260,
    keyStep = 1,
    keyPreventDefault = true,

    wheelThreshold = 22,
    wheelAccMultiplier = 2.4,
    cooldown = 220
  } = opts

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const disabledByWidth = () => disableAt > 0 && window.innerWidth <= disableAt

  if (resetToTopOnLoad) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  const lenis = new Lenis({
    smoothWheel: false,
    smoothTouch: false,
    lerp: reduced ? 1 : lerp,
    wheelMultiplier,
    touchMultiplier,
    normalizeWheel
  })

  window.__lenis = lenis

  let snap = null
  let items = []
  let isDisabled = false
  let wheelAcc = 0
  let wheelLock = 0
  let keyLock = 0

  const buildItems = () => {
    const els = Array.from(document.querySelectorAll(sectionSelector))
    items = els
      .map((el) => ({ el, top: getTop(el) }))
      .sort((a, b) => a.top - b.top)
  }

  const refreshAll = () => {
    buildItems()
    if (snap && typeof snap.refresh === 'function') snap.refresh()
    ScrollTrigger.refresh()
  }

  const setDisabled = (v) => {
    isDisabled = v
    if (isDisabled) {
      snap = null
      wheelAcc = 0
      wheelLock = 0
      keyLock = 0
      lenis.options.lerp = 1
      return
    }

    lenis.options.lerp = reduced ? 1 : lerp

    snap = new Snap(lenis, { type: 'mandatory' })
    Array.from(document.querySelectorAll(sectionSelector)).forEach((el) => snap.addElement(el))
    refreshAll()
  }

  const applyDisableRules = () => {
    const next = reduced ? true : disabledByWidth()
    if (next !== isDisabled) setDisabled(next)
  }

  const scrollToIndex = (idx, immediate = false) => {
    if (!items.length) return
    const i = clamp(idx, 0, items.length - 1)
    const top = items[i].top
    lenis.scrollTo(top, {
      immediate,
      duration: immediate ? 0 : duration,
      easing,
      lock: true,
      force: true
    })
  }

  const scrollToRelative = (dir) => {
    if (!items.length) return
    const y = window.scrollY || window.pageYOffset || 0
    const cur = getClosestIndex(items, y)
    const next = clamp(cur + dir * keyStep, 0, items.length - 1)
    if (next === cur) return
    scrollToIndex(next)
  }

  const onKeyDown = (e) => {
    if (!keyEnabled) return
    if (isDisabled) return
    if (e.defaultPrevented) return
    if (isEditableTarget(e.target)) return
    if (e.ctrlKey || e.altKey || e.metaKey) return

    const now = performance.now()
    if (now < keyLock) return

    let dir = 0
    let handled = false

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      dir = 1
      handled = true
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      dir = -1
      handled = true
    } else if (e.key === ' ' || e.code === 'Space') {
      dir = e.shiftKey ? -1 : 1
      handled = true
    } else if (e.key === 'Home') {
      handled = true
      scrollToIndex(0)
    } else if (e.key === 'End') {
      handled = true
      scrollToIndex(items.length - 1)
    }

    if (!handled) return

    keyLock = now + keyCooldown
    if (keyPreventDefault) e.preventDefault()

    if (dir !== 0) scrollToRelative(dir)
  }

  const onWheel = (e) => {
    if (isDisabled) return
    if (e.defaultPrevented) return
    if (isEditableTarget(e.target)) return

    e.preventDefault()

    const now = performance.now()
    if (now < wheelLock) return

    const dy = e.deltaY || 0
    if (dy === 0) return

    wheelAcc += dy * wheelAccMultiplier

    if (Math.abs(wheelAcc) < wheelThreshold) return

    const dir = wheelAcc > 0 ? 1 : -1
    wheelAcc = 0
    wheelLock = now + cooldown
    scrollToRelative(dir)
  }

  lenis.on('scroll', () => ScrollTrigger.update())

  function raf(t) {
    lenis.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  applyDisableRules()

  window.addEventListener('resize', () => {
    applyDisableRules()
    if (!isDisabled) refreshAll()
  })

  window.addEventListener('orientationchange', () => {
    applyDisableRules()
    if (!isDisabled) refreshAll()
  })

  window.addEventListener('load', () => {
    if (resetToTopOnLoad) {
      window.scrollTo(0, 0)
      lenis.scrollTo(0, { immediate: true, force: true })
    }
    applyDisableRules()
    refreshAll()
  })

  document.addEventListener('keydown', onKeyDown, { passive: false })
  window.addEventListener('wheel', onWheel, { passive: false })

  buildItems()
  if (!isDisabled) {
    snap = new Snap(lenis, { type: 'mandatory' })
    Array.from(document.querySelectorAll(sectionSelector)).forEach((el) => snap.addElement(el))
  }

  if (resetToTopOnLoad) lenis.scrollTo(0, { immediate: true, force: true })

  return {
    lenis,
    snap,
    refresh: refreshAll,
    scrollToIndex,
    scrollToRelative
  }
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
  {
    start = 'top 80%',
    end = 'bottom top',
    timeScale = 1,
    onEnter,
    onLeave
  } = {}
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

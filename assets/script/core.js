import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'
import Snap from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis-snap.mjs'

gsap.registerPlugin(ScrollTrigger)

export const initSmoothSnap = () => {
  const lenis = new Lenis({ smoothWheel: true, smoothTouch: false })
  window.__lenis = lenis

  const snap = new Snap(lenis, { type: 'mandatory' })

  Array.from(document.querySelectorAll('[data-snap]')).forEach((el) => snap.addElement(el))

  lenis.on('scroll', () => ScrollTrigger.update())

  function raf(t) {
    lenis.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return { lenis, snap }
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

/*
  makeTrigger:
  - по умолчанию анимация ПОВТОРЯЕТСЯ при возврате (onEnter + onEnterBack)
  - reset при уходе (onLeave + onLeaveBack) если once = false
  - если once = true — ведёт себя как раньше (одноразово)
*/
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

/*
  bindReplay:
  удобная обёртка для таймлайна — чтобы секция ВСЕГДА переигрывалась при возврате
  + опциональные хуки для таймеров/контроллеров (каунты и т.п.)
*/
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

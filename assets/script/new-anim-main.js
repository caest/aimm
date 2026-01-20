import Lenis from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis.mjs'
import Snap from 'https://cdn.jsdelivr.net/npm/lenis@1.3.17/dist/lenis-snap.mjs'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  smoothWheel: true,
  smoothTouch: false
})

const snap = new Snap(lenis, { type: 'mandatory' })

Array.from(document.querySelectorAll('[data-snap]')).forEach((el) => snap.addElement(el))

lenis.on('scroll', () => {
  ScrollTrigger.update()
})

function raf(t) {
  lenis.raf(t)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

const splitToChars = (el) => {
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

const initHeroTitleChars = () => {
  const title = document.querySelector('.hero-title[data-anim="titleChars"]')
  if (!title) return

  const rows = title.querySelectorAll('.hero-title-row')
  if (!rows.length) return

  const chars = []
  rows.forEach((row) => chars.push(...splitToChars(row)))

  gsap.set(chars, {
    opacity: 0,
    yPercent: 120,
    rotate: 2,
    transformOrigin: '50% 100%'
  })

  const tl = gsap.timeline({ paused: true })

  tl.to(chars, {
    opacity: 1,
    yPercent: 0,
    rotate: 0,
    duration: 1.05,
    ease: 'power4.out',
    stagger: { each: 0.028, from: 'start' }
  })

  ScrollTrigger.create({
    trigger: title,
    start: 'top 80%',
    once: true,
    onEnter: () => tl.play(0)
  })
}

initHeroTitleChars()
ScrollTrigger.refresh()

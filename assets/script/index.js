import { initSmoothSnap } from './core.js'
import { initHero } from './sections/hero.js'
import { initAbout } from './sections/about.js'
import { initProjects } from './sections/projects.js'
import { initClients } from './sections/clients.js'
import { initPhilosophy } from './sections/philosophy.js'
import { initBlog } from './sections/blog.js'
import { initQuality } from './sections/quality.js'
import { initSocial } from './sections/social.js'

if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

const { snap, refresh, lenis } = initSmoothSnap({
  sectionSelector: '[data-snap]',
  disableAt: 992,

  lerp: 0.075,
  normalizeWheel: true,

  wheelThreshold: 18,
  wheelAccMultiplier: 2.6,
  cooldown: 240,

  duration: 0.95,
  resetToTopOnLoad: true,

  keyEnabled: true,
  keyCooldown: 240,
  keyStep: 1,
  keyPreventDefault: true
})

initHero()
initAbout()
initProjects()
initClients()
initPhilosophy()
initBlog()
initQuality()
initSocial()

if (snap && typeof snap.refresh === 'function') snap.refresh()
if (typeof refresh === 'function') refresh()

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    window.scrollTo(0, 0)
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    if (typeof refresh === 'function') refresh()
  }
})

 
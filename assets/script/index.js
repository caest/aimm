import { initSmoothSnap } from './core.js'
import { initHero } from './sections/hero.js'
import { initAbout } from './sections/about.js'
import { initProjects } from './sections/projects.js'
import { initClients } from './sections/clients.js'
import { initPhilosophy } from './sections/philosophy.js'
import { initBlog } from './sections/blog.js'
import { initQuality } from './sections/quality.js'
import { initSocial } from './sections/social.js'

initSmoothSnap()
initHero()
initAbout()
initProjects()
initClients()
initPhilosophy()
initBlog()
initQuality()
initSocial()

ScrollTrigger.refresh()

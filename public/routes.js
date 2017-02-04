import Home from './components/Home.vue'
import Course from './components/Classes/Course.vue'
import Classes from './components/Classes/Classes.vue'
import About from './components/About.vue'

export const routes = [
  { path: '/', component: Home },
  { path: '/course/:id', component: Course, props: true },
  { path: '/classes', component: Classes },
  { path: '/about', component: About }
]

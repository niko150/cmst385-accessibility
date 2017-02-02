import Home from './vues/Home.vue';
import Class from './vues/Classes/Class.vue';
import Classes from './vues/Classes/Classes.vue';
import About from './vues/About.vue'

export const routes = [
  { path: '/', component: Home },
  { path: '/class', component: Class },
  { path: '/classes', component: Classes },
  { path: '/about', component: About }
]
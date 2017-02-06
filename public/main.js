import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource-2'
import VueHighlightJS from 'vue-highlightjs'

import App from './App.vue'
import {routes} from './routes'
import store from './store/store'

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(VueHighlightJS)

const router = new VueRouter({
  mode: 'history',
  routes,
  http: {
    root: '/api'
  }
})

let app = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
app.eslint_decorated = true

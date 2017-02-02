import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource';

import App from './vues/App.vue'
import {routes} from './routes'
import store from './store/store'

Vue.use(VueRouter)
Vue.use(VueResource)

Vue.http.options.root = 'https://cmst385-accessibility.firebaseio.com/'

const router = new VueRouter({
  mode: 'history',
  routes
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

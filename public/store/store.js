import Vue from 'vue'
import Vuex from 'vuex'
import VuexFire from '../lib/vuexfire'
import firebase from 'firebase'

import config from '../config'

Vue.use(Vuex)
Vue.use(VuexFire)

Vue.config.debug = true

const firebaseApp = firebase.initializeApp(config.firebase)
const db = firebaseApp.database()

var store = new Vuex.Store({
  state: {
    classes: {
    }
  },
  getters: {
    classes: state => state.classes
  },
  mutations: VuexFire.mutations
})

db.ref('Classes').once('value')
  .then((snapshot) => { store.state.classes = snapshot.val() })

export const classes = {
  ref: db.ref('Classes'),
  computed: Vuex.mapGetters(['classes'])
}
export default store

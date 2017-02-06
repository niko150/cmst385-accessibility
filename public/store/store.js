import Vue from 'vue'
import Vuex from 'vuex'
import VuexFire from '../lib/vuexfire'
import firebase from 'firebase'

import config from '../config'
import assessments from './modules/assessments'

Vue.use(Vuex)
Vue.use(VuexFire)

Vue.config.debug = true

const firebaseApp = firebase.initializeApp(config.firebase)
const db = firebaseApp.database()

var store = new Vuex.Store({
  state: {
    classes: {
    },
    title: 'CMST385-Accessibility'
  },
  getters: {
    classes: state => state.classes,
    title: state => state.title
  },
  mutations: VuexFire.mutations,
  modules: {assessments}
})

db.ref('Classes').once('value')
  .then((snapshot) => { store.state.classes = snapshot.val() })

//let provider = new firebase.auth.GoogleAuthProvider()
/*this.$http.get('/assessments/').then(response => {
    // success callback
  }, response => {
    // error callback
  });*/

export const classes = {
  ref: db.ref('Classes'),
  computed: Vuex.mapGetters(['classes'])
}
export default store

import Vue from 'vue';
import Vuex from 'vuex';

import {classes} from './modules/classes'

Vue.use(Vuex)

export default new Vuex.Store({
  actions: {
    loadData: ({commit}, dataSource) => {
      Vue.http.get(dataSource + '.json')
        .then(response => response.json())
        .then(data => {
          if(data) {
            console.log('[store] loadData - data returned', dataSource, data)
            switch(dataSource) {
              case 'Classes':
                commit('setClasses', data)
                break;
            }
          }
        })
    }
  },
  modules: {classes}
})
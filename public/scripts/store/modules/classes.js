const state = {
  classes: {}
}

const getters = {
  getClasses: state => state.classes,
  getClass: (state, key) => state.classes[key]
}

const mutations = {
  setClasses: (state, classes) => state.classes = classes,
}

const actions = {
  initClasses: ({commit}) => {
    commit('loadData', 'Classes')
  }
}

export default {state, getters, mutations, actions}
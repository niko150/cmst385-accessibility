function prep_assessment(state, className, outcomeIndex) {
  if (!(className in state.assessments))
    state.assessments[className] = {}
  if (outcomeIndex !== undefined && (!state.assessments[className][outcomeIndex]))
    state.assessments[className][outcomeIndex] = {reason: '', status: undefined}
}

class Assessment {
  constructor (status, reason='') {
    this.reason = reason
    this.status = status
  }
}
Assessment.STATUSES = ['unassessed', 'passing', 'lacking']

export {Assessment}

export default {
  state: {
    assessments: {}
  },
  getters: {
    getAssessments: state => (className) => {
      let rt
      if(!className) {
        rt = state.assessments
      } else {
        prep_assessment(state, className)
        rt = state.assessments[className]
      }
      return rt
    },
    getStatus:(state) => (className, outcomeIndex) => {
      return state.assessments[className][outcomeIndex].status
    }
  },
  mutations: {
    GET_ASSESSMENT (state, payload){
      prep_assessment(state, payload.className, payload.outcomeIndex)
      return state.assessments[payload.className][payload.outcomeIndex]
    },
    TOUCH_ASSESSMENT (state, payload){
      prep_assessment(state, payload.className, payload.outcomeIndex)
    },
    MODIFY_ASSESSMENTS (state, payload){
      console.log('MODIFY_ASSESSMENTS', payload)
      prep_assessment(state, payload.className)
      state.assessments[payload.className] = payload.assessment
    },
    MODIFY_ASSESSMENT (state, payload){
      prep_assessment(state, payload.className, payload.outcomeIndex)
      if (payload.assessment.reason)
        state.assessments[payload.className][payload.outcomeIndex].reason = 
          payload.assessment.reason
      if (payload.assessment.status)
        state.assessments[payload.className][payload.outcomeIndex].status = 
          payload.assessment.status
    },
    REMOVE_ASSESSMENT (state, payload){
      delete state.assessments[payload.className][payload.outcomeIndex]
    },
    PASS_ASSESSMENT (state, payload){
      console.log('passing', payload)
      prep_assessment(state, payload.className, payload.outcomeIndex)
      state.assessments[payload.className][payload.outcomeIndex].status = 'passing'
    },
    FLAG_ASSESSMENT (state, payload){
      console.log('flagging', payload)
      prep_assessment(state, payload.className, payload.outcomeIndex)
      state.assessments[payload.className][payload.outcomeIndex].status = 'lacking'
    },
    CLEAR_ASSESSMENT (state, payload){
      console.log('clearing', payload)
      prep_assessment(state, payload)
      state.assessments[payload.className][payload.outcomeIndex].status = undefined
      //state.assessments[payload.className][payload.outcomeIndex].reason = ''      
    }
  },
  actions: {
    getAssessment ({commit}, payload){
      commit('GET_ASSESSMENT', payload)
    },
    touchAssessment ({commit}, payload){
      commit('TOUCH_ASSESSMENT', payload)
    },
    modifyAssessments ({commit}, payload){
      commit('MODIFY_ASSESSMENTS', payload)
    },
    modifyAssessment ({commit}, payload){
      commit('MODIFY_ASSESSMENT', payload)
    },
    removeAssessment ({commit}, payload){
      commit('REMOVE_ASSESSMENT', payload)
    },
    passAssessment ({commit}, payload){
      commit('PASS_ASSESSMENT', payload)
    },
    flagAssessment ({commit}, payload) {
      commit('FLAG_ASSESSMENT', payload)
    },
    clearAssessment ({commit}, payload){
      commit('CLEAR_ASSESSMENT', payload)
    }
  }
}
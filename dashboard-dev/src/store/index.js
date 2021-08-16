import { createStore } from 'vuex'
import { UserModule } from './User'

export default createStore({
  state: {
  },
  
  // Affects the state
  mutations: {
  },
  
  // Functions that call mutations
  actions: {
  },
  
  modules: {
    User: UserModule
  
  }
})

export const UserModule = {
    namespaced: true,

    state: {
        user: null
    },

    // Affects the state
    mutations: {
        SET_USER(state, user) {
            state.user = user
            console.log(state)
        }
    },

    // Functions that call mutations
    actions: {
        setUser({ commit }, user) {
            console.log("action setUser", user)
            commit('SET_USER', user)
        }
    },

    modules: {

    }
}
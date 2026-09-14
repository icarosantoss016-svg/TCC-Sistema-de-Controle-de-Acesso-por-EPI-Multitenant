import api from '@/service/api'

const state = {
  token: localStorage.getItem('token') || null,
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
}

const getters = {
  estadoAutenticado: (state) => !!state.token,
}

const mutations = {
  SET_AUTH(state, { token, usuario }) {
    state.token = token
    state.usuario = usuario
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
  },
  LOGOUT(state) {
    state.token = null
    state.usuario = null
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },
}

const actions = {
  async login({ commit }, { login, senha }) {
    try {
      const { data } = await api.post('/login', { login, senha })

<<<<<<< HEAD
        try {
            const {data} = await api.post('/login',{login,senha})
    
            commit('SET_AUTH',{token:data.token,usuario:data.usuario})
            
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            throw error
        }
    },
    logout({commit}){
        commit('LOGOUT')
=======
      commit('SET_AUTH', { token: data.token, usuario: { login } })
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      throw error
>>>>>>> 991652c069482f638cd6ec4ddbee66bfcc05c514
    }
  },
  logout({ commit }) {
    commit('LOGOUT')
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

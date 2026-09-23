import api from '@/service/api'

const state = {
  usuario: [],
  usuarioSelecionado: null,
  carregando: false,
  error: null,
}

const getters = {
  usuario: (state) => state.usuario,
  usuarioSelecionado: (state) => state.usuarioSelecionado,
  todosUsuarios: (state) => state.usuario,
  estaCarregando: (state) => state.carregando,
  error: (state) => state.error,
}

const mutations = {
  SET_USUARIO(state, usuarioDaApi) {
    state.usuario = Array.isArray(usuarioDaApi) ? usuarioDaApi : (usuarioDaApi?.usuarios || [])
  },
  SET_USUARIO_SELECIONADO(state, usuario) {
    state.usuarioSelecionado = usuario
  },
  LIMPAR_USUARIO_SELECIONADO(state) {
    state.usuarioSelecionado = null
  },
  SET_CARREGANDO(state, status) {
    state.carregando = status
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_USUARIO(state, usuario) {
    const item = usuario?.usuario || usuario
    state.usuario.unshift(item)
  },
  UPDATE_USUARIO(state, usuarioAtt) {
    const item = usuarioAtt?.usuario || usuarioAtt
    const index = state.usuario.findIndex((u) => u.id_usuario === item.id_usuario)
    if (index !== -1) {
      state.usuario.splice(index, 1, item)
    }
  },
  DELETE_USUARIO(state, id_usuario) {
    state.usuario = state.usuario.filter((u) => u.id_usuario !== id_usuario)
  },
}

const actions = {
  async listarUsuarios({ commit }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/listaUsuario')
      commit('SET_USUARIO', resposta.data)
    } catch (error) {
      console.error('Erro ao buscar usuarios:', error)
      commit('SET_ERROR', 'Não foi possível carregar os usuarios.')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async criarUsuario({ commit }, usuario) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.post('/api/criarusuario', usuario)
      commit('ADD_USUARIO', resposta.data)
      return resposta.data
    } catch (error) {
      console.error('Erro ao cadastrar usuario:', error)
      commit('SET_ERROR', error.response?.data?.error || 'Não foi possível cadastrar usuario.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async atualizarUsuario({ commit }, usuario) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.put(`/api/atualizarUsuario/${usuario.id_usuario}`, usuario)
      commit('UPDATE_USUARIO', resposta.data)
      return resposta.data
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error)
      commit('SET_ERROR', error.response?.data?.error || 'Não foi possível atualizar usuario.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async alterarSenha({ commit }, usuario) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.put(`/api/atualizarSenha/${usuario.id_usuario}`, {
        senha: usuario.senha,
      })
      commit('UPDATE_USUARIO', resposta.data)
    } catch (error) {
      console.error('Erro ao atualizar senha:', error)
      commit('SET_ERROR', 'Não foi possível atualizar senha.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async deletarUsuario({ commit }, id_usuario) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      await api.delete(`/api/deletarUsuario/${id_usuario}`)
      commit('DELETE_USUARIO', id_usuario)
    } catch (error) {
      console.error('Erro ao deletar usuario:', error)
      commit('SET_ERROR', 'Não foi possível deletar usuario.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async buscarUsuarioId({ commit }, usuario) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get(`/api/buscarUsuario/${usuario.id_usuario}`)
      commit('SET_USUARIO_SELECIONADO', resposta.data)
    } catch (error) {
      console.error('Erro ao buscar usuario:', error)
      commit('SET_ERROR', 'Não foi possível buscar usuario.')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

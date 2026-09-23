import api from '@/service/api'

const state = {
  solicitacoes: [],
  carregando: false,
  error: null,
}

const getters = {
  todasSolicitacoes: (state) => state.solicitacoes,
  solicitacoesPendentes: (state) => state.solicitacoes.filter((s) => s.status === 'PENDENTE'),
  estaCarregando: (state) => state.carregando,
  error: (state) => state.error,
}

const mutations = {
  SET_SOLICITACOES(state, lista) {
    state.solicitacoes = Array.isArray(lista) ? lista : []
  },
  SET_CARREGANDO(state, status) {
    state.carregando = status
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ATUALIZAR_STATUS_SOLICITACAO(state, { id_solicitacao, status }) {
    const item = state.solicitacoes.find((s) => s.id_solicitacao === id_solicitacao)
    if (item) {
      item.status = status
    }
  },
}

const actions = {
  async listarSolicitacoes({ commit }, params = {}) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/solicitacoes', { params })
      commit('SET_SOLICITACOES', resposta.data)
      return resposta.data
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
      commit('SET_ERROR', 'Não foi possível carregar as solicitações de acesso.')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async criarSolicitacao({ commit }, dados) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.post('/api/solicitacoes', dados)
      return resposta.data
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error)
      commit('SET_ERROR', error.response?.data?.error || 'Erro ao enviar solicitação.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async aprovarSolicitacao({ commit }, { id_solicitacao, empresas_ids }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.put(`/api/solicitacoes/${id_solicitacao}/aprovar`, { empresas_ids })
      commit('ATUALIZAR_STATUS_SOLICITACAO', { id_solicitacao, status: 'APROVADA' })
      return resposta.data
    } catch (error) {
      console.error('Erro ao aprovar solicitação:', error)
      commit('SET_ERROR', error.response?.data?.error || 'Erro ao aprovar solicitação.')
      throw error
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async negarSolicitacao({ commit }, { id_solicitacao, motivo }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.put(`/api/solicitacoes/${id_solicitacao}/negar`, { motivo })
      commit('ATUALIZAR_STATUS_SOLICITACAO', { id_solicitacao, status: 'NEGADA' })
      return resposta.data
    } catch (error) {
      console.error('Erro ao negar solicitação:', error)
      commit('SET_ERROR', error.response?.data?.error || 'Erro ao negar solicitação.')
      throw error
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

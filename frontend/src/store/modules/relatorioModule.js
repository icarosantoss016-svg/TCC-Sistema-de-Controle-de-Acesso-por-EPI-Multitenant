import api from '@/service/api'

const state = {
  listaGeral: {},
  rankingEpis: {},
  rankingSetores: {},
  relatorioCiclo: {},
  carregando: false,
  error: null,
}

const getters = {
  listaGeral: (state) => state.listaGeral,
  rankingEpis: (state) => state.rankingEpis,
  rankingSetores: (state) => state.rankingSetores,
  relatorioCiclo: (state) => state.relatorioCiclo,
  estaCarregando: (state) => state.carregando,
  error: (state) => state.error,
}

const mutations = {
  SET_LISTA_GERAL(state, dadosApi) {
    state.listaGeral = dadosApi
  },
  SET_RANKING_EPI(state, dadosApi) {
    state.rankingEpis = dadosApi
  },
  SET_RANKING_SETORES(state, dadosApi) {
    state.rankingSetores = dadosApi
  },
  SET_RELATORIO_CICLO(state, dadosApi) {
    state.relatorioCiclo = dadosApi
  },
  SET_CARREGANDO(state, status) {
    state.carregando = status
  },
  SET_ERROR(state, error) {
    state.error = error
  },
}

const actions = {
  async buscarListaGeral({ commit }, status = null) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/relatorios/geral', {
        params: status ? { status } : {},
      })

      commit('SET_LISTA_GERAL', resposta.data)
    } catch (error) {
      console.error('Erro ao carregar a lista de geral de acessos.:', error)
      commit('SET_ERROR', 'Não foi possível carregar lista geral de acessos.')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async buscarRankingEpis({ commit }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/relatorios/ranking-epis')
      commit('SET_RANKING_EPI', resposta.data)
    } catch (error) {
      console.error('Erro ao buscar ranking de EPIs mais esqueicidos:', error)
      commit('SET_ERROR', 'Não foi possível carregar ranking de EPIs esquecidos.')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async buscarRankingSetores({ commit }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/relatorios/ranking-setores')

      commit('SET_RANKING_SETORES', resposta.data)
    } catch (error) {
      console.error('Erro ao buscar ranking de setores com mais infrações:', error)
      commit('SET_ERROR', 'Não foi possível carregar setores comm mais infrações')
    } finally {
      commit('SET_CARREGANDO', false)
    }
  },

  async buscarRelatorioCiclo({ commit }, { inicio, fim }) {
    commit('SET_CARREGANDO', true)
    commit('SET_ERROR', null)

    try {
      const resposta = await api.get('/api/relatorios/ciclo', {
        params: { inicio, fim },
      })
      commit('SET_RELATORIO_CICLO', resposta.data)
    } catch (error) {
      console.error('Erro ao buscar realatório de ciclo:', error)
      commit('SET_ERROR', 'Não foi possível carregar relatório de ciclo.')
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

import api from '@/service/api'

const state ={ 
    regraEpi:[],
    regraEpiSelecionada:null,
    carregando:false,
    error:null
}

const getters={
    regraEpi:  (state) => state.regraEpi,
    regraEpiSelecionada:(state)=>state.regraEpiSelecionada,
    todasRegrasEpi:(state)=> state.regraEpi,
    estaCarregando:(state)=>state.carregando,
    error:(state) =>state.error
}

const mutations={
    SET_REGRA(state, regraEpiDaApi){
        state.regraEpi=regraEpiDaApi
    },
    SET_REGRA_SELECIONADA(state,regraEpi){
        state.regraEpiSelecionada = regraEpi
    },
    LIMPAR_REGRA_SELECIONADA(state){
        state.regraEpiSelecionada=nulll
    },
    SET_CARREGANDO(state,status){
        state.carregando = status
    },
    SET_ERROR(state,error){
        state.error= error
    },
    ADD_REGRA(state, regraEpi){
        state.regraEpi.push(regraEpi)
    },
    UPDATE_REGRA(state,regraEpiAtt){
        const index = state.regraEpi.findIndex((r)=>r.id_regra === regraEpiAtt.id_regra)

        if(index!== -1){
            state.regraEpi.splice(index,1,regraEpiAtt)
        }
    }, 
    DELETE_REGRA(state, id_regra){
        state.regraEpi = state.regraEpi.filter((r)=>r.id_regra!==id_regra)
    }
}

const actions={
    async listarRegras({commit}){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR',null)
        
        try {
            const resposta = await api.get('/api/listarRegra')

            commit('SET_REGRA', resposta.data)
        } catch (error) {
            console.error('Erroao buscar Regras de EPI:', error)
            commit('SET_ERROR', 'Não foi possível carregar as regras de EPI.')
            
        }finally{
            commit('SET_CARREGANDO',false)
        }
    },
    
    async criarRegraEpi({commit}, regraEpi){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR', null)

        try {
            const resposta = await api.post('/api/criarRegra',{
                id_setor: regraEpi.id_setor,
                nome_Epi: regraEpi.nome_Epi,
                nome_exibicao: regraEpi.nome_exibicao
            })

            commit('ADD_REGRA', resposta.data)
        } catch (error) {
            console.error('Erro ao cadastrar nova regra de EPI:', error)
            commit('SET_ERROR','Não foi possível cadastrar Regra de EPI.')
            
        }finally{
            commit('SET_CARREGANDO', false)
        }
    },

    async atualizarRegraEpi({commit}, regraEpi){
        commit('SET_CARREGANDO', true)
        commit('SET_ERROR',null)

        try {
            const resposta = await api.put(`/api/atulaizarRegra/${regraEpi.id_regra}`,{
                id_setor:regraEpi.id_setor,
                nome_Epi:regraEpi.nome_Epi,
                nome_exibicao:regraEpi.nome_exibicao
            })
            commit('UPDATE_REGRA', resposta.data)
        } catch (error) {
            console.error('Erro ao atualizar regra EPI:', error)
            commit('SET_ERROR', 'Não possível ataulzar a regra de EPI.')
        }finally{
            commit('SET_CARREGANDO',false)
        }
    },

    async deletarRegraEpi({commit},regraEpi){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR', null)

        try {
            await api.delete(`/api/deletarRegra/${regraEpi.id_regra}`)
            commit('DELETE_REGRA', regraEpi.id_regra)
        } catch (error) {
            console.error('Erro ao deletar regra EPI:',error)
            commit('SET_ERROR', 'Não foi possível deletar regra EPI.')
            
        }finally{
            commit('SET_CARREGANDO',false)
        }
    },
    
    async buscarRegraId({commit},regraEpi){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR', null)

        try {
            const resposta = await api.get(`/api/buscarRegra/${regraEpi.id_regra}`)
            commit('SET_REGRA_SELECIONADA', resposta.data)
        } catch (error) {
            console.error('Erro ao buscas regra de EPI:', error)
            commit('SET_ERROR', 'Não foi possível buscar EPis')
            
        }finally{
            commit('SET_CARREGANDO', false)
        }
    }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
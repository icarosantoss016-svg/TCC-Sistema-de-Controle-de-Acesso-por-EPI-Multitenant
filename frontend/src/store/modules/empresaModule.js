import api from '@/service/api'

const state ={
    empresa:[],
    empresaSelecionada:null,
    carregando:false,
    error:null
}

const getters={
    empresa: (state) =>state.empresa,
    todasEmpresas:(state) => state.empresa,
    empresaSelecionada:(state)=> state.empresaSelecionada,
    estaCarregando: (state) => state.carregando,
    error:(state) => state.error
}

const mutations={
    SET_EMPRESA(state, empresaDaApi){
        state.empresa = empresaDaApi
    },
    SET_EMPRESA_SELECIONADA(state,empresa){
        state.empresaSelecionada = empresa
    },

    LIMPAR_EMPRESA_SELECIONADA(state){
        state.empresaSelecionada = null
    },
    SET_CARREGANDO(state,status){
        state.carregando=status
    },
    SET_ERROR(state,error){
        state.error=error
    },
    ADD_EMPRESA(state,empresa){
        state.empresa.push(empresa)
    },
    UPDATE_EMPRESA(state,empresaAtt){
        const index = state.empresa.findIndex((e)=>e.id_empresa ===empresaAtt.id_empresa)

        if(index!==-1){
            state.empresa.splice(index, 1, empresaAtt)
        }
    },
    DELETE_EMPRESA(state, id_empresa){
        state.empresa= state.empresa.filter((e)=>e.id_empresa!==id_empresa)
    }
}

const actions={
    async listaEmpresas({commit}){
        commit('SET_CARREGANDO', true)
        commit ('SET_ERROR', null)
        try {
            const resposta = await api.get('/api/listaEmpresa')
            commit ('SET_EMPRESA', resposta.data)
        } catch (error) {
            console.error('Erro ao buscar empresas:', error)
            commit('SET_ERROR', 'Não foi possível carregar as empresas.')
            
        }finally{
            commit('SET_CARREGANDO', false)
        }
    },

    async criarEmpresa({commit},empresa){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR', null)
        try {
            const resposta= await api.post('/api/criarEmpresa',{
                nome:empresa.nome,
                cnpj:empresa.cnpj,
                ramo:empresa.ramo
            })
            commit('ADD_EMPRESA', resposta.data)
        } catch (error) {
            console.error('Erro ao cadastrar empresa:', error)
            commit('SET_ERROR','Não foi possível cadastrar a empresa.')            
        }finally{
            commit('SET_CARREGANDO', false)
        }
    },

    async atualizarEmpresa({commit},empresa){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR',null)

        try {
            const resposta= await api.put(`/api/atualizarEmpresa/${empresa.id_empresa}`,{
                nome:empresa.nome,
                cnpj:empresa.cnpj,
                ramo:empresa.ramo
            })
            commit('UPDATE_EMPRESA',resposta.data)
        } catch (error) {
            console.error('Erro ao atualizar empesa:',error)
            commit('SET_ERROR','Não foi possível atulizar empresa.')    
        }finally{
            commit('SET_CARREGANDO',false)
        }
    },

    async deletarEmpresa({commit},id_empresa){
        commit('SET_CARREGANDO',true)
        commit('SET_ERROR',null)

        try {
            await api.delete(`/api/deletarEmpresa/${id_empresa}`)
            commit('DELETE_EMPRESA',id_empresa)
        } catch (error) {
            console.error('Erro ao deletar empresa',error)
            commit('SET_ERROR','Não foi possível deletar a empresa.')
            
        }finally{
            commit('SET_CARREGANDO',false)
        }
    },

    async buscarEmpresaCnpj ({commit},empresa){
        commit ('SET_CARREGANDO', true)
        commit ('SET_ERROR',null)

        try {
            const resposta = await api.get(`/api/empresa/cnpj/${empresa.cnpj}`)
            commit('SET_EMPRESA_SELECIONADA',resposta.data)
        } catch (error) {
            console.error('Erro ao buscar empresa:',error)
            commit('SET_ERROR','Não foi possível carregar empresa.')           
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
import { createStore} from 'vuex'
import auth from './modules/authModule'
import empresa from './modules/empresaModule'
import regraEpi from './modules/regraEpiModule'
import relatorio from './modules/relatorioModule'
import setor from './modules/setorModule'
import usuario from './modules/usuarioModule'

export default createStore({
    modules:{
        auth,
        empresa,
        regraEpi,
        relatorio,
        setor,
        usuario
    }
})
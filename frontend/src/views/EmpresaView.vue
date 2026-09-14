<script setup>
import{ref, computed, onMounted} from 'vue'
import { useStore } from 'vuex'
import { Search, Plus, Server } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import EmpresaFormModal from '@/components/empresas/EmpresaFormModal.vue'
import EmpresaTable from '@/components/empresas/EmpresaTable.vue'

const store =useStore()

onMounted(()=>{
    store.dispatch('empresa/listaEmpresas')
    store.dispatch('setor/listarSetores')
})

const busca = ref('')
const formAberto=ref(false)
const empresaEditando=ref(false)
const confirmAberto=ref(false)
const empresaParaExcluir= ref(false)
const excluindo= ref(false)

const empresasComContagem = computed(()=>{
    const empresas = store.getters['empresa/todasEmpresas']
    const setores = store.getters['setor/todosSetores']

    return empresas.map((empresa)=>{
        const setoresDaEmpresa =setores.filter((s)=>s.id_empresa === empresa.id_empresa)
        return{
            ...empresa, 
            quantidadeSetores: setoresDaEmpresa.length
        }
    })
})

const empresasFiltradas = computed(()=>{
    if(!busca.value.trim()){
        return empresasComContagem.value
    }

    const termo = busca.busca.toLowerCase()
    return empresasComContagem.value.filter((e)=> 
    e.nome.toLowerCase().includes(termo))||
    e.cnpj.toLowerCase().includes(termo)||
    e.ramo.toLowerCase().includes(termo)
})

function abrirCriar(){
    empresaEditando.value=null
    formAberto.value=true
}

function abrirEditar(empresa){
    empresaEditando.value=empresa
    formAberto.value=true
}

function abrirExclusao(empresa){
    empresaParaExcluir.value=empresa
    confirmAberto=true
}

async function confirmarExclusao () {
    excluindo.value=true
    try {
        await store.dispatch('empresa/deletarEmpresa', empresaParaExcluir.value.id_empresa)
        confirmAberto.value=false
    } finally {
        excluindo.value=false
    }
}
</script>

<template>
    <div class="p-8">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-display font-bold text-text-0">Empresas</h1>
            <BaseButton variant="primary" @click="abrirCriar">
            <span class="flex items-center gap-2">
                <Plus class="w-4 h-4"/>
                Cadastrar empresa
            </span>
            </BaseButton>
        </div>
        
        <div>
            <BaseInput v-model="busca" placeholder="Busca por nome, CNPJ ou ramo" :icon="Search"/>
        </div>

        <div>
            <EmpresaTable
                :empresas="empresasFiltradas"
                @editar="abrirCriar"
                @excluir="abrirExclusao"
            />
        </div>
    </div>

    <EmpresaFormModal
        :aberto="formAberto"
        :empresa-para-editar="empresaEditando"
        @fechar="formAberto=false"
    />

    <BaseConfirmDialog
        :aberto="confirmAberto"
        titulo="Excluir empresa"
        :mensagem="`Tem certeza que deseja excluir ${empresaParaExcluir?.nome}? Essa ação não pode ser desfeita.`"
        :carregando="excluindo"
        @cancelar="confirmAberto=false"
        @confirmar="confirmAberto"
    />
</template>
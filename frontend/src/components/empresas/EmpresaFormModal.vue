<script setup>
import {ref,computed, watch} from 'vue'
import{useStore} from 'vuex'
import BaseModal from '../ui/BaseModal.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseButton from '../ui/BaseButton.vue'

const props =defineProps({
    aberto:Boolean,
    empresaParaEditar:{
        type:Object,
        default:null
    }
})

const emit=defineEmits(['fechar'])

const store = useStore()

const estaEditando = computed(()=>{
    return !!props.empresaParaEditar
})
const tituloModal=computed(()=>estaEditando.value ? 'Editar empresa' : 'Cadastrar nova empresa')

const nome = ref('')
const cnpj = ref('')
const ramo = ref('')

watch(()=>props.empresaParaEditar,(novaEmpresa)=>{
    if(novaEmpresa){
        nome.value=novaEmpresa.nome
        cnpj.value=novaEmpresa.cnpj
        ramo.value=novaEmpresa.ramo
    }else{
        nome.value=''
        cnpj.value=''
        ramo.value=''
    }
})

const carregando =ref(false)
const erro=ref('')

async function aoSalvar(){
    carregando.value=true
    erro.value=''

    try {
        if(estaEditando.value){
            await store.dispatch('empresa/atualizarEmpresa',{
                id_empresa:props.empresaParaEditar.id_empresa,
                nome:nome.value,
                cnpj:cnpj.value,
                ramo:ramo.value
            })
        }else{
            await store.dispatch('empresa/criarEmpresa',{
                nome:nome.value,
                cnpj:cnpj.value,
                ramo:ramo.value
            }
            )
        }
        emit('fechar')
    } catch (error) {
        erro.value='Não foi possível salvar a empresa. Confira os dados e tente novamente.'
    }finally{
        carregando.value=false
    }
}
</script>

<template>
    <BaseModal
        :aberto="aberto"
        :titulo="tituloModal"
        @fechar="emit('fechar')"
    >
    <form class="flex flex-col gap-4" @submit.prevent="aoSalvar">
        <BaseInput v-model="nome" label="Nome da empresa" placeholder="Ex:Indústria XYZ Ltda"/>
        <BaseInput v-model="cnpj" label="CPNJ" placeholder="00.000.000/000-00"/>
        <BaseInput v-model="ramo" label="Ramo de Atuação" placeholder="Fundição e Usinagem"/>

        <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

        <BaseButton variant="primary" :disabled="carregando">
            {{ carregando ? 'Salvando...' : 'Salvar' }}
        </BaseButton>
    </form>
    </BaseModal>
</template>
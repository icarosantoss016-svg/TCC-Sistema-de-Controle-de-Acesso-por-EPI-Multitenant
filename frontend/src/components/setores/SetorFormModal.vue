<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  aberto: Boolean,
  setorParaEditar: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['fechar', 'salvo'])
const store = useStore()

const estaEditando = computed(() => !!props.setorParaEditar)
const tituloModal = computed(() => (estaEditando.value ? 'Editar setor' : 'Cadastrar novo setor'))

const empresas = computed(() => store.getters['empresa/todasEmpresas'] || [])

const nomeSetor = ref('')
const idEmpresa = ref('')
const carregando = ref(false)
const erro = ref('')

watch(
  () => props.setorParaEditar,
  (novoSetor) => {
    if (novoSetor) {
      nomeSetor.value = novoSetor.nome_setor || novoSetor.nome || ''
      idEmpresa.value = novoSetor.id_empresa || ''
    } else {
      nomeSetor.value = ''
      idEmpresa.value = empresas.value.length > 0 ? empresas.value[0].id_empresa : ''
    }
    erro.value = ''
  },
  { immediate: true },
)

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto && !props.setorParaEditar && empresas.value.length > 0 && !idEmpresa.value) {
      idEmpresa.value = empresas.value[0].id_empresa
    }
    erro.value = ''
  },
)

async function aoSalvar() {
  if (!nomeSetor.value.trim()) {
    erro.value = 'O nome do setor é obrigatório.'
    return
  }

  if (!idEmpresa.value) {
    erro.value = 'Selecione uma empresa vinculada ao setor.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    if (estaEditando.value) {
      await store.dispatch('setor/atualizarSetor', {
        id_setor: props.setorParaEditar.id_setor,
        nome_setor: nomeSetor.value.trim(),
        id_empresa: Number(idEmpresa.value),
      })
      emit('salvo', 'Setor atualizado com sucesso!')
    } else {
      await store.dispatch('setor/criarSetor', {
        nome_setor: nomeSetor.value.trim(),
        id_empresa: Number(idEmpresa.value),
      })
      emit('salvo', 'Setor cadastrado com sucesso!')
    }
    emit('fechar')
  } catch {
    erro.value = 'Não foi possível salvar o setor. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal :aberto="aberto" :titulo="tituloModal" @fechar="emit('fechar')">
    <form class="flex flex-col gap-4" @submit.prevent="aoSalvar">
      <BaseInput v-model="nomeSetor" label="Nome do Setor" placeholder="Ex: Linha de Montagem A" />

      <div>
        <label class="block text-caption font-medium text-text-2 mb-1.5"> Empresa </label>
        <select
          v-model="idEmpresa"
          class="w-full h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
        >
          <option value="" disabled>Selecione uma empresa</option>
          <option v-for="emp in empresas" :key="emp.id_empresa" :value="emp.id_empresa">
            {{ emp.nome }}
          </option>
        </select>
      </div>

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-2">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Salvando...' : estaEditando ? 'Salvar alterações' : 'Cadastrar setor' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

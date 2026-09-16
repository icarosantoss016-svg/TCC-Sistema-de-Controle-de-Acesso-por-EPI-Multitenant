<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  aberto: Boolean,
  setor: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['fechar', 'salvo'])
const store = useStore()

const nomeEpi = ref('')
const nomeExibicao = ref('')
const carregando = ref(false)
const erro = ref('')

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      nomeEpi.value = ''
      nomeExibicao.value = ''
      erro.value = ''
    }
  },
)

async function aoSalvar() {
  if (!nomeEpi.value.trim()) {
    erro.value = 'O nome técnico do EPI é obrigatório.'
    return
  }

  if (!nomeExibicao.value.trim()) {
    erro.value = 'O nome de exibição do EPI é obrigatório.'
    return
  }

  if (!props.setor?.id_setor) {
    erro.value = 'Setor inválido.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    await store.dispatch('regraEpi/criarRegraEpi', {
      id_setor: props.setor.id_setor,
      nome_Epi: nomeEpi.value.trim().toLowerCase(),
      nome_exibicao: nomeExibicao.value.trim(),
    })
    emit('salvo', `Regra de EPI "${nomeExibicao.value.trim()}" vinculada com sucesso!`)
    emit('fechar')
  } catch {
    erro.value = 'Não foi possível cadastrar a regra de EPI. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal
    :aberto="aberto"
    :titulo="`Adicionar EPI ao Setor ${setor?.nome_setor ? '— ' + setor.nome_setor : ''}`"
    @fechar="emit('fechar')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="aoSalvar">
      <BaseInput
        v-model="nomeExibicao"
        label="Nome de Exibição"
        placeholder="Ex: Capacete de Segurança"
      />

      <BaseInput
        v-model="nomeEpi"
        label="Nome Técnico (Classe de detecção IA)"
        placeholder="Ex: capacete, luvas, oculos"
      />

      <p class="text-caption text-text-3">
        Dica: O nome técnico é usado pela IA para conferência visual e o nome de exibição aparece
        nos relatórios e painéis.
      </p>

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-2">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Vinculando...' : 'Adicionar EPI' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

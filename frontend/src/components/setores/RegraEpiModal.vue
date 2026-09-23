<script setup>
import { ref, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { HardHat, Hand, Shirt } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
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

// Lista fixa dos 3 EPIs suportados no MVP pelo modelo treinado
const episSuportados = [
  {
    chave: 'capacete',
    nomeExibicao: 'Capacete de Segurança',
    descricao: 'Proteção craniana obrigatória.',
    icone: HardHat,
  },
  {
    chave: 'luvas',
    nomeExibicao: 'Luvas de Proteção',
    descricao: 'Proteção para as mãos e manuseio.',
    icone: Hand,
  },
  {
    chave: 'colete',
    nomeExibicao: 'Colete Refletivo',
    descricao: 'Vestimenta de alta visibilidade.',
    icone: Shirt,
  },
]

// Estado reativo dos switches
const statusToggles = ref({
  capacete: false,
  luvas: false,
  colete: false,
})

const carregando = ref(false)
const erro = ref('')

// Obtém as regras atuais do setor a partir do Vuex
const regrasAtuaisDoSetor = computed(() => {
  if (!props.setor?.id_setor) return []
  const todasRegras = store.getters['regraEpi/todasRegrasEpi'] || []
  return todasRegras.filter((r) => r.id_setor === props.setor.id_setor)
})

// Sincroniza o estado dos toggles sempre que o modal abre ou o setor muda
watch(
  () => [props.aberto, props.setor],
  ([estaAberto]) => {
    if (estaAberto && props.setor) {
      erro.value = ''
      const regras = regrasAtuaisDoSetor.value

      statusToggles.value = {
        capacete: regras.some(
          (r) =>
            r.nome_Epi?.toLowerCase().includes('capacete') ||
            r.nome_exibicao?.toLowerCase().includes('capacete'),
        ),
        luvas: regras.some(
          (r) =>
            r.nome_Epi?.toLowerCase().includes('luva') ||
            r.nome_exibicao?.toLowerCase().includes('luva'),
        ),
        colete: regras.some(
          (r) =>
            r.nome_Epi?.toLowerCase().includes('colete') ||
            r.nome_exibicao?.toLowerCase().includes('colete'),
        ),
      }
    }
  },
  { immediate: true },
)

function alternarToggle(chave) {
  statusToggles.value[chave] = !statusToggles.value[chave]
}

async function aoSalvar() {
  if (!props.setor?.id_setor) {
    erro.value = 'Setor inválido.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const regrasExistentes = regrasAtuaisDoSetor.value
    const promises = []

    for (const epi of episSuportados) {
      const estaAtivo = statusToggles.value[epi.chave]
      const regraEncontrada = regrasExistentes.find(
        (r) =>
          r.nome_Epi?.toLowerCase().includes(epi.chave) ||
          r.nome_exibicao?.toLowerCase().includes(epi.chave),
      )

      if (estaAtivo && !regraEncontrada) {
        // Criar regra de EPI vinculada ao setor
        promises.push(
          store.dispatch('regraEpi/criarRegraEpi', {
            id_setor: props.setor.id_setor,
            nome_Epi: epi.chave,
            nome_exibicao: epi.nomeExibicao,
          }),
        )
      } else if (!estaAtivo && regraEncontrada) {
        // Remover regra desativada
        promises.push(
          store.dispatch('regraEpi/deletarRegraEpi', {
            id_regra: regraEncontrada.id_regra,
          }),
        )
      }
    }

    await Promise.all(promises)
    await store.dispatch('regraEpi/listarRegras')

    emit('salvo', 'Regras de EPI atualizadas com sucesso!')
    emit('fechar')
  } catch {
    erro.value = 'Não foi possível salvar as regras de EPI. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal
    :aberto="aberto"
    :titulo="`Configurar EPIs — ${setor?.nome_setor || setor?.nome || ''}`"
    @fechar="emit('fechar')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="aoSalvar">
      <p class="text-caption text-text-2">
        Habilite os EPIs que o modelo de IA deve exigir para liberação de acesso neste setor:
      </p>

      <!-- Lista de 3 EPIs suportados no MVP com Toggle Switches -->
      <div class="space-y-3">
        <div
          v-for="epi in episSuportados"
          :key="epi.chave"
          @click="alternarToggle(epi.chave)"
          class="flex items-center justify-between p-3.5 rounded-md border transition-all cursor-pointer select-none"
          :class="[
            statusToggles[epi.chave]
              ? 'bg-accent/8 border-accent/40 shadow-xs'
              : 'bg-bg-1 border-border hover:bg-bg-2',
          ]"
        >
          <!-- Ícone e Descrição do EPI -->
          <div class="flex items-center gap-3 min-w-0 pr-4">
            <div
              class="w-9 h-9 rounded-md flex items-center justify-center shrink-0 transition-colors"
              :class="[
                statusToggles[epi.chave] ? 'bg-accent text-white shadow-sm' : 'bg-bg-3 text-text-2',
              ]"
            >
              <component :is="epi.icone" class="w-5 h-5" />
            </div>

            <div class="flex flex-col min-w-0">
              <span
                class="text-body font-semibold truncate leading-tight"
                :class="[statusToggles[epi.chave] ? 'text-text-0' : 'text-text-1']"
              >
                {{ epi.nomeExibicao }}
              </span>
              <span class="text-caption text-text-2 truncate mt-0.5">
                {{ epi.descricao }}
              </span>
            </div>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            role="switch"
            :aria-checked="statusToggles[epi.chave]"
            @click.stop="alternarToggle(epi.chave)"
            class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="[statusToggles[epi.chave] ? 'bg-accent' : 'bg-bg-4']"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="[statusToggles[epi.chave] ? 'translate-x-5' : 'translate-x-0']"
            />
          </button>
        </div>
      </div>

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-3 pt-3 border-t border-border-soft">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Salvando...' : 'Salvar Regras' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

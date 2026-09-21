<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  aberto: Boolean,
  solicitacao: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['fechar', 'aprovado'])
const store = useStore()

const empresasSelecionadas = ref([])
const carregando = ref(false)
const erro = ref('')

const todasEmpresas = computed(() => store.getters['empresa/todasEmpresas'] || [])

watch(
  () => [props.aberto, props.solicitacao],
  ([estaAberto]) => {
    if (estaAberto) {
      erro.value = ''
      empresasSelecionadas.value = todasEmpresas.value.length > 0 ? [todasEmpresas.value[0].id_empresa] : []
    }
  },
  { immediate: true },
)

function alternarEmpresa(idEmpresa) {
  const idx = empresasSelecionadas.value.indexOf(idEmpresa)
  if (idx !== -1) {
    if (empresasSelecionadas.value.length > 1) {
      empresasSelecionadas.value.splice(idx, 1)
    }
  } else {
    empresasSelecionadas.value.push(idEmpresa)
  }
}

async function aoAprovar() {
  if (empresasSelecionadas.value.length === 0) {
    erro.value = 'Selecione ao menos uma empresa para vincular o novo gestor.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    await store.dispatch('solicitacao/aprovarSolicitacao', {
      id_solicitacao: props.solicitacao.id_solicitacao,
      empresas_ids: empresasSelecionadas.value,
    })
    emit('aprovado', `Solicitação de ${props.solicitacao.nome} aprovada com sucesso!`)
    emit('fechar')
  } catch (err) {
    erro.value = err.response?.data?.error || 'Erro ao aprovar solicitação.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal
    :aberto="aberto"
    :titulo="`Aprovar Solicitação — ${solicitacao?.nome || ''}`"
    @fechar="emit('fechar')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="aoAprovar">
      <div class="bg-bg-1 border border-border rounded-md p-3">
        <p class="text-caption text-text-0 font-semibold">{{ solicitacao?.nome }}</p>
        <p class="text-caption text-text-2 font-mono">{{ solicitacao?.login }} — {{ solicitacao?.cargo }}</p>
      </div>

      <div>
        <label class="block text-caption font-semibold text-text-1 mb-1.5">
          Selecione a(s) Empresa(s) vinculada(s) ao novo ADM_EMPRESA:
        </label>
        <p class="text-caption text-text-3 mb-2.5">
          O usuário terá permissão de gestão de setores e técnicos nas empresas selecionadas:
        </p>

        <div class="space-y-2 max-h-48 overflow-y-auto p-1">
          <div
            v-for="empresa in todasEmpresas"
            :key="empresa.id_empresa"
            @click="alternarEmpresa(empresa.id_empresa)"
            class="flex items-center justify-between p-3 rounded-md border text-body transition-colors cursor-pointer select-none"
            :class="[
              empresasSelecionadas.includes(empresa.id_empresa)
                ? 'bg-accent/10 border-accent text-text-0 font-medium'
                : 'bg-bg-1 border-border text-text-2 hover:bg-bg-2'
            ]"
          >
            <div>
              <span class="block truncate font-semibold">{{ empresa.nome }}</span>
              <span class="text-caption text-text-3 font-mono">CNPJ: {{ empresa.cnpj }}</span>
            </div>
            <input
              type="checkbox"
              :checked="empresasSelecionadas.includes(empresa.id_empresa)"
              @click.stop="alternarEmpresa(empresa.id_empresa)"
              class="accent-accent cursor-pointer rounded-sm"
            />
          </div>
        </div>
      </div>

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-3 pt-3 border-t border-border-soft">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Aprovando...' : 'Confirmar Aprovação' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<!--
  View: SolicitacoesAcessoView.vue
  Descrição: Tela administrativa exclusiva do perfil ADMIN para revisar, aprovar e negar solicitações de acesso.
-->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Check, X, Clock, CheckCircle2, XCircle } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import AprovarSolicitacaoModal from '@/components/solicitacoes/AprovarSolicitacaoModal.vue'

const store = useStore()

// Polling automático de 30s para verificar novas solicitações pendentes
let _pollingSolicitacoes = null

onMounted(async () => {
  await Promise.all([
    store.dispatch('solicitacao/listarSolicitacoes'),
    store.dispatch('empresa/listaEmpresas'),
  ])
  _pollingSolicitacoes = setInterval(() => {
    store.dispatch('solicitacao/listarSolicitacoes')
  }, 30000)
})

onUnmounted(() => {
  clearInterval(_pollingSolicitacoes)
})

const filtroStatus = ref('PENDENTE') // 'TODAS' | 'PENDENTE' | 'APROVADA' | 'NEGADA'
const modalAprovarAberto = ref(false)
const solicitacaoParaAprovar = ref(null)

const confirmNegarAberto = ref(false)
const solicitacaoParaNegar = ref(null)
const negando = ref(false)

// Toast
const toastVisivel = ref(false)
const toastMensagem = ref('')
const toastTipo = ref('success')
let toastTimer = null

function mostrarToast(mensagem, tipo = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toastMensagem.value = mensagem
  toastTipo.value = tipo
  toastVisivel.value = true
  toastTimer = setTimeout(() => {
    toastVisivel.value = false
  }, 3500)
}

const todasSolicitacoes = computed(() => store.getters['solicitacao/todasSolicitacoes'] || [])

const solicitacoesFiltradas = computed(() => {
  if (filtroStatus.value === 'TODAS') return todasSolicitacoes.value
  return todasSolicitacoes.value.filter((s) => s.status === filtroStatus.value)
})

const totalPendentes = computed(() => todasSolicitacoes.value.filter((s) => s.status === 'PENDENTE').length)
const totalAprovadas = computed(() => todasSolicitacoes.value.filter((s) => s.status === 'APROVADA').length)
const totalNegadas = computed(() => todasSolicitacoes.value.filter((s) => s.status === 'NEGADA').length)

function formatarData(dataIso) {
  if (!dataIso) return '-'
  const d = new Date(dataIso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function abrirAprovar(solicitacao) {
  solicitacaoParaAprovar.value = solicitacao
  modalAprovarAberto.value = true
}

function abrirNegar(solicitacao) {
  solicitacaoParaNegar.value = solicitacao
  confirmNegarAberto.value = true
}

async function executarNegar() {
  if (!solicitacaoParaNegar.value) return
  negando.value = true
  try {
    await store.dispatch('solicitacao/negarSolicitacao', {
      id_solicitacao: solicitacaoParaNegar.value.id_solicitacao,
      motivo: 'Solicitação não autorizada pelo administrador.',
    })
    mostrarToast('Solicitação de acesso negada.')
    confirmNegarAberto.value = false
  } catch {
    mostrarToast('Erro ao negar solicitação.', 'error')
  } finally {
    negando.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-bg-0">
    <Sidebar />

    <main class="flex-1 min-w-0 p-8">
      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-caption font-semibold text-text-3 uppercase tracking-wider">
              Segurança & Provisionamento
            </span>
            <span
              v-if="totalPendentes > 0"
              class="text-caption font-mono font-bold text-accent bg-accent/12 px-2.5 py-0.5 rounded-sm"
            >
              {{ totalPendentes }} PENDENTE{{ totalPendentes > 1 ? 'S' : '' }}
            </span>
          </div>
          <h1 class="text-display font-bold text-text-0">Solicitações de Acesso</h1>
          <p class="text-body text-text-2 mt-1">
            Revise pedidos de cadastro de gestores de segurança e autorize o vínculo com empresas.
          </p>
        </div>
      </div>

      <!-- Abas / Filtros de Status -->
      <div class="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <button
          type="button"
          @click="filtroStatus = 'PENDENTE'"
          class="px-4 py-2 rounded-md text-caption font-semibold transition-colors cursor-pointer flex items-center gap-2"
          :class="[
            filtroStatus === 'PENDENTE'
              ? 'bg-accent text-white shadow-sm'
              : 'bg-bg-1 text-text-1 hover:bg-bg-2'
          ]"
        >
          <Clock class="w-4 h-4" />
          <span>Pendentes ({{ totalPendentes }})</span>
        </button>

        <button
          type="button"
          @click="filtroStatus = 'APROVADA'"
          class="px-4 py-2 rounded-md text-caption font-semibold transition-colors cursor-pointer flex items-center gap-2"
          :class="[
            filtroStatus === 'APROVADA'
              ? 'bg-success text-white shadow-sm'
              : 'bg-bg-1 text-text-1 hover:bg-bg-2'
          ]"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Aprovadas ({{ totalAprovadas }})</span>
        </button>

        <button
          type="button"
          @click="filtroStatus = 'NEGADA'"
          class="px-4 py-2 rounded-md text-caption font-semibold transition-colors cursor-pointer flex items-center gap-2"
          :class="[
            filtroStatus === 'NEGADA'
              ? 'bg-danger text-white shadow-sm'
              : 'bg-bg-1 text-text-1 hover:bg-bg-2'
          ]"
        >
          <XCircle class="w-4 h-4" />
          <span>Negadas ({{ totalNegadas }})</span>
        </button>

        <button
          type="button"
          @click="filtroStatus = 'TODAS'"
          class="px-4 py-2 rounded-md text-caption font-semibold transition-colors cursor-pointer ml-auto"
          :class="[
            filtroStatus === 'TODAS'
              ? 'bg-bg-3 text-text-0 font-bold'
              : 'text-text-2 hover:bg-bg-2'
          ]"
        >
          Ver Todas ({{ todasSolicitacoes.length }})
        </button>
      </div>

      <!-- Tabela de Solicitações -->
      <div class="bg-bg-0 border border-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bg-1 border-b border-border text-[11px] font-semibold text-text-3 uppercase tracking-wider">
                <th class="py-3.5 px-6">Solicitante</th>
                <th class="py-3.5 px-4">Cargo Desejado</th>
                <th class="py-3.5 px-4">Data do Pedido</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr
                v-for="solicitacao in solicitacoesFiltradas"
                :key="solicitacao.id_solicitacao"
                class="hover:bg-bg-1/60 transition-colors"
              >
                <!-- Solicitante -->
                <td class="py-4 px-6">
                  <div>
                    <span class="text-body font-semibold text-text-0 block truncate">
                      {{ solicitacao.nome }}
                    </span>
                    <span class="text-caption text-text-2 font-mono truncate block">
                      {{ solicitacao.login }}
                    </span>
                  </div>
                </td>

                <!-- Cargo -->
                <td class="py-4 px-4 text-body text-text-1">
                  {{ solicitacao.cargo || 'Gestor de Segurança' }}
                </td>

                <!-- Data do Pedido -->
                <td class="py-4 px-4 font-mono text-caption text-text-2">
                  {{ formatarData(solicitacao.createdAt) }}
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-semibold"
                    :class="[
                      solicitacao.status === 'APROVADA'
                        ? 'bg-success/12 text-success'
                        : solicitacao.status === 'NEGADA'
                        ? 'bg-danger/12 text-danger'
                        : 'bg-warning/12 text-warning'
                    ]"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="[
                        solicitacao.status === 'APROVADA'
                          ? 'bg-success'
                          : solicitacao.status === 'NEGADA'
                          ? 'bg-danger'
                          : 'bg-warning'
                      ]"
                    />
                    {{ solicitacao.status }}
                  </span>
                </td>

                <!-- Ações -->
                <td class="py-4 px-6 text-right">
                  <div
                    v-if="solicitacao.status === 'PENDENTE'"
                    class="flex items-center justify-end gap-2"
                  >
                    <BaseButton
                      variant="primary"
                      @click="abrirAprovar(solicitacao)"
                      class="h-9 px-3"
                      title="Aprovar e vincular a empresas"
                    >
                      <span class="flex items-center gap-1.5 text-caption">
                        <Check class="w-4 h-4" />
                        <span>Aprovar</span>
                      </span>
                    </BaseButton>

                    <button
                      type="button"
                      @click="abrirNegar(solicitacao)"
                      class="w-9 h-9 rounded-md bg-danger/12 hover:bg-danger/20 flex items-center justify-center text-danger transition-colors cursor-pointer"
                      title="Negar solicitação"
                    >
                      <X class="w-4 h-4" />
                    </button>
                  </div>
                  <span v-else class="text-caption text-text-3 italic">
                    Processada
                  </span>
                </td>
              </tr>

              <tr v-if="solicitacoesFiltradas.length === 0">
                <td colspan="5" class="py-12 text-center text-caption text-text-3">
                  Nenhuma solicitação encontrada nesta categoria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal de Aprovação -->
    <AprovarSolicitacaoModal
      :aberto="modalAprovarAberto"
      :solicitacao="solicitacaoParaAprovar"
      @fechar="modalAprovarAberto = false"
      @aprovado="mostrarToast"
    />

    <!-- Diálogo de Confirmação para Negar -->
    <BaseConfirmDialog
      :aberto="confirmNegarAberto"
      titulo="Negar Solicitação de Acesso"
      :mensagem="`Tem certeza que deseja negar a solicitação de ${solicitacaoParaNegar?.nome}? O usuário não terá acesso ao sistema.`"
      :carregando="negando"
      @cancelar="confirmNegarAberto = false"
      @confirmar="executarNegar"
    />

    <!-- Toast de Notificação -->
    <Toast
      :visivel="toastVisivel"
      :mensagem="toastMensagem"
      :tipo="toastTipo"
      @fechar="toastVisivel = false"
    />
  </div>
</template>

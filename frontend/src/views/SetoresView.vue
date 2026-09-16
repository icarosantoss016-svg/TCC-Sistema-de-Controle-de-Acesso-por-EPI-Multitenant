<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  Search,
  Plus,
  Building2,
  ShieldCheck,
  Pencil,
  Trash2,
  HardHat,
  Hand,
  Glasses,
  Ear,
  Shirt,
  X,
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import SetorFormModal from '@/components/setores/SetorFormModal.vue'
import RegraEpiModal from '@/components/setores/RegraEpiModal.vue'

const store = useStore()

// Carrega os dados de setores, regras de EPI e empresas ao montar o componente
onMounted(async () => {
  await Promise.all([
    store.dispatch('setor/listaSetores'),
    store.dispatch('regraEpi/listarRegras'),
    store.dispatch('empresa/listaEmpresas'),
  ])
})

// Estados locais de busca e controle de modais
const busca = ref('')
const modalSetorAberto = ref(false)
const setorEditando = ref(null)
const modalRegraAberto = ref(false)
const setorParaRegra = ref(null)

// Estados de confirmação e exclusão
const confirmExclusaoAberto = ref(false)
const setorParaExcluir = ref(null)
const regraParaExcluir = ref(null)
const tipoExclusao = ref('setor') // 'setor' | 'regra'
const excluindo = ref(false)

// Estado do Toast de notificação
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

// Getters reativos da Store
const todosSetores = computed(() => store.getters['setor/todosSetores'] || [])
const todasRegras = computed(() => store.getters['regraEpi/todasRegrasEpi'] || [])
const todasEmpresas = computed(() => store.getters['empresa/todasEmpresas'] || [])

/**
 * Mapeia cada setor vinculando o nome da empresa e a lista de regras de EPI correspondentes.
 */
const setoresCompletos = computed(() => {
  const setores = todosSetores.value
  const regras = todasRegras.value
  const empresas = todasEmpresas.value

  return setores.map((setor) => {
    const empresa = empresas.find((e) => e.id_empresa === setor.id_empresa)
    const regrasDoSetor = regras.filter((r) => r.id_setor === setor.id_setor)

    return {
      ...setor,
      nomeEmpresa: empresa ? empresa.nome : 'Empresa não identificada',
      regras: regrasDoSetor,
      totalRegras: regrasDoSetor.length,
    }
  })
})

/**
 * Filtro reativo de busca por nome do setor ou da empresa vinculada.
 */
const setoresFiltrados = computed(() => {
  if (!busca.value.trim()) {
    return setoresCompletos.value
  }

  const termo = busca.value.toLowerCase().trim()
  return setoresCompletos.value.filter((s) => {
    const nomeSetor = (s.nome_setor || s.nome || '').toLowerCase()
    const nomeEmpresa = (s.nomeEmpresa || '').toLowerCase()
    return nomeSetor.includes(termo) || nomeEmpresa.includes(termo)
  })
})

/**
 * KPIs calculados dinamicamente com base nos dados carregados da API.
 */
const totalPostosMonitorados = computed(() => todosSetores.value.length)
const totalRegrasAtivas = computed(() => todasRegras.value.length)

/**
 * Mapeamento semântico de ícone de EPI a partir do nome cadastrado.
 */
function obterIconeEpi(nome) {
  if (!nome) return ShieldCheck
  const n = nome.toLowerCase()
  if (n.includes('capacete')) return HardHat
  if (n.includes('luva')) return Hand
  if (n.includes('óculos') || n.includes('oculos')) return Glasses
  if (n.includes('auricular') || n.includes('abafador') || n.includes('ouvido')) return Ear
  if (
    n.includes('colete') ||
    n.includes('avental') ||
    n.includes('camisa') ||
    n.includes('uniforme')
  )
    return Shirt
  return ShieldCheck
}

/**
 * Formata o ID do setor no padrão de badge (ex.: #SET-041).
 */
function formatarIdSetor(id) {
  if (!id) return '#SET-000'
  return `#SET-${String(id).padStart(3, '0')}`
}

// Ações do Setor
function abrirCriarSetor() {
  setorEditando.value = null
  modalSetorAberto.value = true
}

function abrirEditarSetor(setor) {
  setorEditando.value = setor
  modalSetorAberto.value = true
}

function abrirExclusaoSetor(setor) {
  tipoExclusao.value = 'setor'
  setorParaExcluir.value = setor
  confirmExclusaoAberto.value = true
}

// Ações de Regras de EPI
function abrirAdicionarEpi(setor) {
  setorParaRegra.value = setor
  modalRegraAberto.value = true
}

function abrirExclusaoRegra(regra) {
  tipoExclusao.value = 'regra'
  regraParaExcluir.value = regra
  confirmExclusaoAberto.value = true
}

// Confirmação de exclusão
async function executarExclusao() {
  excluindo.value = true
  try {
    if (tipoExclusao.value === 'setor' && setorParaExcluir.value) {
      await store.dispatch('setor/deletarSetor', setorParaExcluir.value.id_setor)
      mostrarToast('Setor removido com sucesso!')
    } else if (tipoExclusao.value === 'regra' && regraParaExcluir.value) {
      await store.dispatch('regraEpi/deletarRegraEpi', regraParaExcluir.value)
      mostrarToast('Regra de EPI removida com sucesso!')
    }
    confirmExclusaoAberto.value = false
  } catch {
    mostrarToast('Não foi possível realizar a exclusão. Tente novamente.', 'error')
  } finally {
    excluindo.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-bg-0">
    <!-- Barra de navegação lateral -->
    <Sidebar />

    <!-- Conteúdo principal da página de Setores -->
    <main class="flex-1 min-w-0 p-8">
      <!-- Cabeçalho -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-caption font-semibold text-text-3 uppercase tracking-wider">
              Módulo de Câmeras
            </span>
            <span
              class="text-caption font-mono font-semibold text-accent bg-accent/12 px-2 py-0.5 rounded-sm"
            >
              SUPERVISÃO
            </span>
          </div>
          <h1 class="text-display font-bold text-text-0">Setores</h1>
          <p class="text-body text-text-2 mt-1">
            Gerencie os postos monitorados, parâmetros de acesso e regras de EPI obrigatórias.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-64">
            <BaseInput
              v-model="busca"
              placeholder="Buscar por setor ou empresa..."
              :icon="Search"
            />
          </div>

          <BaseButton variant="primary" @click="abrirCriarSetor">
            <span class="flex items-center gap-2">
              <Plus class="w-4 h-4" />
              Cadastrar setor
            </span>
          </BaseButton>
        </div>
      </div>

      <!-- Linha de KPIs (2 colunas) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- KPI 1: Postos Monitorados -->
        <div
          class="bg-bg-0 border border-border rounded-lg p-6 flex items-center justify-between shadow-sm"
        >
          <div>
            <span
              class="text-caption font-semibold text-text-3 uppercase tracking-wider block mb-1"
            >
              Postos Monitorados
            </span>
            <div class="text-display font-bold text-text-0">
              {{ String(totalPostosMonitorados).padStart(2, '0') }}
            </div>
            <span class="text-caption text-text-2 mt-1 block">
              Setores cadastrados e em operação
            </span>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-accent/12 flex items-center justify-center text-accent shrink-0"
          >
            <Building2 class="w-6 h-6" />
          </div>
        </div>

        <!-- KPI 2: Regras de EPI Ativas -->
        <div
          class="bg-bg-0 border border-border rounded-lg p-6 flex items-center justify-between shadow-sm"
        >
          <div>
            <span
              class="text-caption font-semibold text-text-3 uppercase tracking-wider block mb-1"
            >
              Regras de EPI Ativas
            </span>
            <div class="text-display font-bold text-text-0">
              {{ String(totalRegrasAtivas).padStart(2, '0') }}
            </div>
            <span class="text-caption text-text-2 mt-1 block">
              Equipamentos parametrizados para verificação
            </span>
          </div>
          <div
            class="w-12 h-12 rounded-full bg-accent/12 flex items-center justify-center text-accent shrink-0"
          >
            <ShieldCheck class="w-6 h-6" />
          </div>
        </div>
      </div>

      <!-- Grid de Cards de Setores -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Cards dos Setores Cadastrados -->
        <div
          v-for="setor in setoresFiltrados"
          :key="setor.id_setor"
          class="bg-bg-0 border border-border rounded-lg p-6 flex flex-col justify-between hover:border-text-3/40 transition-colors shadow-sm"
        >
          <div>
            <!-- Topo do Card: Badge + Nome + Ações -->
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="min-w-0">
                <span
                  class="font-mono text-caption font-bold text-accent bg-accent/12 px-2.5 py-1 rounded-sm inline-block mb-2"
                >
                  {{ formatarIdSetor(setor.id_setor) }}
                </span>
                <h3 class="text-heading font-bold text-text-0 truncate">
                  {{ setor.nome_setor || setor.nome }}
                </h3>
                <p class="text-caption text-text-2 truncate mt-0.5">
                  {{ setor.nomeEmpresa }}
                </p>
              </div>

              <!-- Grupo de Botões de Ação -->
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="abrirAdicionarEpi(setor)"
                  class="w-8 h-8 rounded-icon bg-bg-2 hover:bg-bg-3 flex items-center justify-center text-text-1 hover:text-accent transition-colors cursor-pointer"
                  title="Configurar EPIs deste setor"
                >
                  <Plus class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="abrirEditarSetor(setor)"
                  class="w-8 h-8 rounded-icon bg-bg-2 hover:bg-bg-3 flex items-center justify-center text-text-1 hover:text-text-0 transition-colors cursor-pointer"
                  title="Editar setor"
                >
                  <Pencil class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  @click="abrirExclusaoSetor(setor)"
                  class="w-8 h-8 rounded-icon bg-danger/12 hover:bg-danger/20 flex items-center justify-center text-danger transition-colors cursor-pointer"
                  title="Remover setor"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Divisor -->
            <div class="border-t border-border-soft my-4" />

            <!-- Seção de Chips de EPI -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-caption font-semibold text-text-3 uppercase tracking-wider">
                  EPIs Obrigatórios
                </span>
                <span class="text-caption font-medium text-text-2">
                  {{ setor.totalRegras }} {{ setor.totalRegras === 1 ? 'item' : 'itens' }}
                </span>
              </div>

              <!-- Lista de Chips -->
              <div v-if="setor.regras.length > 0" class="flex flex-wrap gap-2">
                <div
                  v-for="regra in setor.regras"
                  :key="regra.id_regra"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-2 border border-border text-caption font-medium text-text-1 group"
                >
                  <component
                    :is="obterIconeEpi(regra.nome_Epi || regra.nome_exibicao)"
                    class="w-3.5 h-3.5 text-text-2"
                  />
                  <span>{{ regra.nome_exibicao || regra.nome_Epi }}</span>
                  <button
                    type="button"
                    @click.stop="abrirExclusaoRegra(regra)"
                    class="p-0.5 rounded-full text-text-3 hover:text-danger opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remover regra de EPI"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Estado sem regras cadastradas -->
              <div v-else class="flex items-center justify-between py-2 text-caption text-text-3">
                <span>Nenhum EPI configurado para este setor.</span>
                <button
                  type="button"
                  @click="abrirAdicionarEpi(setor)"
                  class="text-accent hover:text-accent-hover font-medium cursor-pointer"
                >
                  + Configurar EPIs
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Card de Estado Vazio / Ação: "+ Novo setor" (Último item do Grid) -->
        <div
          @click="abrirCriarSetor"
          class="border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] group shadow-sm"
        >
          <div
            class="w-12 h-12 rounded-full bg-bg-2 group-hover:bg-accent group-hover:text-white flex items-center justify-center text-text-2 transition-colors mb-3"
          >
            <Plus class="w-6 h-6" />
          </div>
          <h4 class="text-heading font-bold text-text-0 group-hover:text-accent transition-colors">
            Cadastrar Novo Setor
          </h4>
          <p class="text-caption text-text-2 mt-1">
            Clique aqui para parametrizar um novo posto monitorado
          </p>
        </div>
      </div>
    </main>

    <!-- Modal de Criação e Edição de Setor -->
    <SetorFormModal
      :aberto="modalSetorAberto"
      :setor-para-editar="setorEditando"
      @fechar="modalSetorAberto = false"
      @salvo="mostrarToast"
    />

    <!-- Modal de Criação de Regra de EPI -->
    <RegraEpiModal
      :aberto="modalRegraAberto"
      :setor="setorParaRegra"
      @fechar="modalRegraAberto = false"
      @salvo="mostrarToast"
    />

    <!-- Diálogo de Confirmação de Exclusão -->
    <BaseConfirmDialog
      :aberto="confirmExclusaoAberto"
      :titulo="tipoExclusao === 'setor' ? 'Excluir Setor' : 'Remover Regra de EPI'"
      :mensagem="
        tipoExclusao === 'setor'
          ? `Tem certeza que deseja excluir o setor ${setorParaExcluir?.nome_setor || setorParaExcluir?.nome}? Esta ação removerá também as regras vinculadas.`
          : `Tem certeza que deseja remover a regra do EPI ${regraParaExcluir?.nome_exibicao || regraParaExcluir?.nome_Epi}?`
      "
      :carregando="excluindo"
      @cancelar="confirmExclusaoAberto = false"
      @confirmar="executarExclusao"
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

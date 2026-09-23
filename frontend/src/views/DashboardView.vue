
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Building2,
  RefreshCw,
  Clock,
  Search,
  HardHat,
  Hand,
  Shirt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const store = useStore()

const periodoSelecionado = ref('30') 
const filtroStatus = ref('TODOS') 
const buscaLog = ref('')
const paginaAtual = ref(1)
const itensPorPagina = 8
const atualizando = ref(false)

async function carregarDadosDashboard() {
  atualizando.value = true
  try {
    await Promise.all([
      store.dispatch('relatorio/buscarListaGeral'),
      store.dispatch('relatorio/buscarRankingEpis'),
      store.dispatch('relatorio/buscarRankingSetores'),
      store.dispatch('setor/listaSetores'),
      store.dispatch('empresa/listaEmpresas'),
    ])
  } catch (error) {
    console.error('Erro ao sincronizar dados do Dashboard:', error)
  } finally {
    atualizando.value = false
  }
}

onMounted(() => {
  carregarDadosDashboard()
})

const usuarioLogado = computed(() => store.state.auth?.usuario)
const todosSetores = computed(() => store.getters['setor/todosSetores'] || [])
const todasEmpresas = computed(() => store.getters['empresa/todasEmpresas'] || [])
const carregando = computed(() => store.getters['relatorio/estaCarregando'] || atualizando.value)

const logsBrutos = computed(() => {
  const dados = store.getters['relatorio/listaGeral']
  return Array.isArray(dados) ? dados : []
})

const logsDoPeriodo = computed(() => {
  if (periodoSelecionado.value === 'todos') {
    return logsBrutos.value
  }

  const dias = parseInt(periodoSelecionado.value, 10) || 30
  const limiteData = new Date()
  limiteData.setDate(limiteData.getDate() - dias)

  return logsBrutos.value.filter((log) => {
    const dataLog = new Date(log.createdAt || log.data_hora)
    return dataLog >= limiteData
  })
})

const totalAcessos = computed(() => logsDoPeriodo.value.length)

const totalPermitidos = computed(() => {
  return logsDoPeriodo.value.filter((l) => l.status_acesso === 'PERMITIDO').length
})

const totalNegados = computed(() => {
  return logsDoPeriodo.value.filter((l) => l.status_acesso === 'NEGADO').length
})

const taxaConformidade = computed(() => {
  if (totalAcessos.value === 0) return 100
  return Number(((totalPermitidos.value / totalAcessos.value) * 100).toFixed(1))
})

const totalSetoresAtivos = computed(() => todosSetores.value.length)

const rankingEpisCalculado = computed(() => {
  const contagem = {}
  const logsNegados = logsDoPeriodo.value.filter((l) => l.status_acesso === 'NEGADO')

  logsNegados.forEach((log) => {
    const esquecidos = obterItensAusentes(log)
    esquecidos.forEach((item) => {
      const nomeFormatado = String(item).trim()
      if (nomeFormatado) {
        contagem[nomeFormatado] = (contagem[nomeFormatado] || 0) + 1
      }
    })
  })

  const lista = Object.keys(contagem).map((epi) => ({
    epi,
    quantidade: contagem[epi],
  }))

  lista.sort((a, b) => b.quantidade - a.quantidade)

  if (lista.length === 0) {
    const storeRanking = store.getters['relatorio/rankingEpis']
    if (Array.isArray(storeRanking) && storeRanking.length > 0) {
      return storeRanking
    }
  }

  return lista
})

const maxEpiQuantidade = computed(() => {
  if (rankingEpisCalculado.value.length === 0) return 1
  return Math.max(...rankingEpisCalculado.value.map((e) => e.quantidade))
})

const rankingSetoresCalculado = computed(() => {
  const contagem = {}
  const logsNegados = logsDoPeriodo.value.filter((l) => l.status_acesso === 'NEGADO')

  logsNegados.forEach((log) => {
    const nomeSetor = log.Setor?.nome_setor || log.Setor?.nome || 'Setor não identificado'
    contagem[nomeSetor] = (contagem[nomeSetor] || 0) + 1
  })

  const lista = Object.keys(contagem).map((setor) => ({
    setor,
    quantidade: contagem[setor],
  }))

  lista.sort((a, b) => b.quantidade - a.quantidade)

  if (lista.length === 0) {
    const storeRanking = store.getters['relatorio/rankingSetores']
    if (Array.isArray(storeRanking) && storeRanking.length > 0) {
      return storeRanking
    }
  }

  return lista
})

const logsFiltrados = computed(() => {
  let lista = logsDoPeriodo.value

  if (filtroStatus.value !== 'TODOS') {
    lista = lista.filter((log) => log.status_acesso === filtroStatus.value)
  }

  if (buscaLog.value.trim()) {
    const termo = buscaLog.value.toLowerCase().trim()
    lista = lista.filter((log) => {
      const setorNome = (log.Setor?.nome_setor || log.Setor?.nome || '').toLowerCase()
      const empresaNome = (log.Setor?.Empresa?.nome || '').toLowerCase()
      const itens = obterItensAusentes(log).join(' ').toLowerCase()
      const idSetor = String(log.id_setor || log.Setor?.id_setor || '')

      return (
        setorNome.includes(termo) ||
        empresaNome.includes(termo) ||
        itens.includes(termo) ||
        idSetor.includes(termo)
      )
    })
  }

  return lista
})

const totalPaginas = computed(() => {
  return Math.ceil(logsFiltrados.value.length / itensPorPagina) || 1
})

const logsPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  return logsFiltrados.value.slice(inicio, inicio + itensPorPagina)
})

function mudarPagina(novaPagina) {
  if (novaPagina >= 1 && novaPagina <= totalPaginas.value) {
    paginaAtual.value = novaPagina
  }
}

function alterarFiltroStatus(status) {
  filtroStatus.value = status
  paginaAtual.value = 1
}

function formatarDataHora(data) {
  if (!data) return '-'
  try {
    const d = new Date(data)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return String(data)
  }
}

function formatarIdSetor(id) {
  if (!id) return '#SET-000'
  return `#SET-${String(id).padStart(3, '0')}`
}

function obterItensAusentes(log) {
  if (log.status_acesso === 'PERMITIDO') return []
  if (!log.itens_esquecidos) return []
  if (Array.isArray(log.itens_esquecidos)) return log.itens_esquecidos
  try {
    const parsed = JSON.parse(log.itens_esquecidos)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [String(log.itens_esquecidos)]
  }
}

function obterIconeEpi(nome) {
  if (!nome) return ShieldAlert
  const n = String(nome).toLowerCase()
  if (n.includes('capacete')) return HardHat
  if (n.includes('luva')) return Hand
  if (n.includes('colete')) return Shirt
  return ShieldAlert
}

function formatarNomeEpi(nome) {
  if (!nome) return 'Item não identificado'
  const n = String(nome).toLowerCase()
  if (n.includes('capacete')) return 'Capacete'
  if (n.includes('colete')) return 'Colete'
  if (n.includes('luva')) return 'Luvas'
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}
</script>

<template>
  <div class="flex min-h-screen bg-bg-0">
    <Sidebar />

    <main class="flex-1 min-w-0 p-8 overflow-y-auto">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-caption font-semibold text-text-3 uppercase tracking-wider">
              Painel de Controle & Métricas
            </span>
            <span
              class="text-caption font-mono font-semibold text-accent bg-accent/12 px-2.5 py-0.5 rounded-sm"
            >
              {{ totalAcessos }} REGISTROS
            </span>
          </div>
          <h1 class="text-display font-bold text-text-0">Dashboard</h1>
          <p class="text-body text-text-2 mt-1">
            Métricas de conformidade operacional, auditoria em tempo real e infrações detectadas por câmera.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-bg-1 border border-border rounded-md px-3 h-11 shadow-sm">
            <Clock class="w-4 h-4 text-text-3 shrink-0" />
            <select
              v-model="periodoSelecionado"
              class="bg-transparent text-body text-text-0 font-medium outline-none cursor-pointer pr-2"
              title="Filtrar período de análise"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="todos">Todo o histórico</option>
            </select>
          </div>

          <BaseButton
            variant="secondary"
            @click="carregarDadosDashboard"
            :disabled="carregando"
            title="Atualizar dados do dashboard"
          >
            <span class="flex items-center gap-2">
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': carregando }" />
              <span class="hidden sm:inline">Atualizar</span>
            </span>
          </BaseButton>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-bg-1 border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div class="flex items-center justify-between text-text-2 mb-3">
            <span class="text-caption font-semibold uppercase tracking-wider text-text-3">
              Acessos no Período
            </span>
            <div class="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent">
              <Activity class="w-4 h-4" />
            </div>
          </div>
          <div>
            <div class="font-mono text-display font-bold text-text-0 mb-1">
              {{ totalAcessos }}
            </div>
            <div class="flex items-center gap-2 text-caption text-text-2">
              <span class="inline-flex items-center text-success font-medium">
                <CheckCircle2 class="w-3.5 h-3.5 mr-1" />
                {{ totalPermitidos }} liberados
              </span>
              <span>·</span>
              <span class="inline-flex items-center text-danger font-medium">
                <XCircle class="w-3.5 h-3.5 mr-1" />
                {{ totalNegados }} negados
              </span>
            </div>
          </div>
        </div>

        <div class="bg-bg-1 border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div class="flex items-center justify-between text-text-2 mb-3">
            <span class="text-caption font-semibold uppercase tracking-wider text-text-3">
              Taxa de Conformidade
            </span>
            <div
              class="w-8 h-8 rounded-md flex items-center justify-center"
              :class="taxaConformidade >= 80 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'"
            >
              <ShieldCheck class="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              class="font-mono text-display font-bold mb-1"
              :class="taxaConformidade >= 80 ? 'text-success' : taxaConformidade >= 60 ? 'text-warning' : 'text-danger'"
            >
              {{ taxaConformidade }}%
            </div>
            <div class="w-full bg-bg-3 h-1.5 rounded-full overflow-hidden mb-1">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="taxaConformidade >= 80 ? 'bg-success' : taxaConformidade >= 60 ? 'bg-warning' : 'bg-danger'"
                :style="{ width: `${taxaConformidade}%` }"
              />
            </div>
            <p class="text-caption text-text-3">
              {{ taxaConformidade >= 90 ? 'Excelente aderência a EPIs' : 'Atenção a itens esquecidos' }}
            </p>
          </div>
        </div>

        <div class="bg-bg-1 border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div class="flex items-center justify-between text-text-2 mb-3">
            <span class="text-caption font-semibold uppercase tracking-wider text-text-3">
              Setores Monitorados
            </span>
            <div class="w-8 h-8 rounded-md bg-bg-2 flex items-center justify-center text-text-1">
              <Building2 class="w-4 h-4" />
            </div>
          </div>
          <div>
            <div class="font-mono text-display font-bold text-text-0 mb-1">
              {{ totalSetoresAtivos }}
            </div>
            <p class="text-caption text-text-2">
              Postos fabris com regras parametrizadas
            </p>
          </div>
        </div>

        <div class="bg-bg-1 border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div class="flex items-center justify-between text-text-2 mb-3">
            <span class="text-caption font-semibold uppercase tracking-wider text-text-3">
              Infrações no Período
            </span>
            <div class="w-8 h-8 rounded-md bg-danger/10 flex items-center justify-center text-danger">
              <ShieldAlert class="w-4 h-4" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-display font-bold text-danger">
                {{ totalNegados }}
              </span>
              <span
                v-if="totalNegados > 0"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold bg-danger/12 text-danger"
              >
                {{ totalAcessos > 0 ? Math.round((totalNegados / totalAcessos) * 100) : 0 }}% de bloqueio
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-semibold bg-success/12 text-success"
              >
                0 infrações
              </span>
            </div>
            <p class="text-caption text-text-2">
              Tentativas sem os EPIs obrigatórios
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-bg-1 border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <ShieldAlert class="w-5 h-5 text-accent" />
                <h2 class="text-heading font-bold text-text-0">EPIs Mais Esquecidos</h2>
              </div>
              <span class="text-caption font-mono text-text-3 bg-bg-2 px-2.5 py-0.5 rounded">
                {{ totalNegados }} ocorrências
              </span>
            </div>
            <p class="text-caption text-text-2 mb-6">
              Distribuição proporcional de itens não detectados nos acessos negados.
            </p>

            <div v-if="rankingEpisCalculado.length > 0" class="space-y-4">
              <div
                v-for="item in rankingEpisCalculado"
                :key="item.epi"
                class="group"
              >
                <div class="flex items-center justify-between text-body mb-1.5">
                  <div class="flex items-center gap-2">
                    <component
                      :is="obterIconeEpi(item.epi)"
                      class="w-4 h-4 text-accent shrink-0"
                    />
                    <span class="font-medium text-text-0">
                      {{ formatarNomeEpi(item.epi) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 font-mono">
                    <span class="text-caption text-text-2">
                      {{ totalNegados > 0 ? Math.round((item.quantidade / totalNegados) * 100) : 0 }}%
                    </span>
                    <span class="text-caption font-bold text-danger bg-danger/10 px-2 py-0.5 rounded">
                      {{ item.quantidade }}x
                    </span>
                  </div>
                </div>

                <div class="w-full h-2.5 rounded-full bg-bg-3 overflow-hidden">
                  <div
                    class="h-full bg-accent rounded-full transition-all duration-500 group-hover:bg-accent-hover"
                    :style="{ width: `${Math.min(100, Math.round((item.quantidade / maxEpiQuantidade) * 100))}%` }"
                  />
                </div>
              </div>
            </div>

            <div v-else class="py-10 text-center text-text-3">
              <ShieldCheck class="w-10 h-10 mx-auto text-success/60 mb-2" />
              <p class="font-medium text-body text-text-1">Conformidade total!</p>
              <p class="text-caption mt-1">Nenhum EPI ausente foi registrado no período selecionado.</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-border-soft flex items-center justify-between text-caption text-text-3">
            <span>Validação de itens obrigatórios por setor</span>
            <span class="font-mono text-accent">Auditoria de EPIs</span>
          </div>
        </div>

        <div class="bg-bg-1 border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-warning" />
                <h2 class="text-heading font-bold text-text-0">Setores com Mais Infrações</h2>
              </div>
              <span class="text-caption font-semibold uppercase text-warning bg-warning/10 px-2.5 py-0.5 rounded">
                Pontos de Risco
              </span>
            </div>
            <p class="text-caption text-text-2 mb-6">
              Setores fabris que registraram maior incidência de bloqueio por falta de EPI.
            </p>

            <div v-if="rankingSetoresCalculado.length > 0" class="space-y-3">
              <div
                v-for="(item, index) in rankingSetoresCalculado"
                :key="item.setor"
                class="flex items-center justify-between p-3 rounded-md bg-bg-2/50 border border-border hover:bg-bg-2 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="w-6 h-6 rounded-full flex items-center justify-center font-mono text-caption font-bold"
                    :class="index === 0 ? 'bg-accent text-white' : 'bg-bg-3 text-text-2'"
                  >
                    {{ index + 1 }}
                  </span>
                  <div>
                    <span class="font-medium text-body text-text-0 block">
                      {{ item.setor }}
                    </span>
                    <span class="text-caption text-text-3">
                      Posto de monitoramento setorial
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2 font-mono">
                  <span class="text-caption font-semibold text-accent bg-accent/12 px-2.5 py-1 rounded">
                    {{ item.quantidade }} {{ item.quantidade === 1 ? 'bloqueio' : 'bloqueios' }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="py-10 text-center text-text-3">
              <CheckCircle2 class="w-10 h-10 mx-auto text-success/60 mb-2" />
              <p class="font-medium text-body text-text-1">Setores seguros!</p>
              <p class="text-caption mt-1">Nenhuma infração registrada nos postos monitorados.</p>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-border-soft flex items-center justify-between text-caption text-text-3">
            <span>Infrações agregadas por posto fabril</span>
            <span class="font-mono text-text-2">Auditoria Setorial</span>
          </div>
        </div>
      </div>

      <div class="bg-bg-0 border border-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-1/50">
          <div>
            <h2 class="text-heading font-bold text-text-0">Log de Acessos em Tempo Real</h2>
            <p class="text-caption text-text-2 mt-0.5">
              Registro completo de todas as validações capturadas pelas câmeras industriais.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="w-full sm:w-60">
              <BaseInput
                v-model="buscaLog"
                placeholder="Buscar por setor, empresa ou EPI..."
                :icon="Search"
              />
            </div>

            <div class="flex items-center bg-bg-2 p-1 rounded-md border border-border">
              <button
                type="button"
                @click="alterarFiltroStatus('TODOS')"
                class="px-3 py-1 text-caption font-medium rounded-sm transition-colors cursor-pointer"
                :class="
                  filtroStatus === 'TODOS'
                    ? 'bg-bg-0 text-text-0 shadow-sm font-semibold'
                    : 'text-text-2 hover:text-text-0'
                "
              >
                Todos
              </button>
              <button
                type="button"
                @click="alterarFiltroStatus('PERMITIDO')"
                class="px-3 py-1 text-caption font-medium rounded-sm transition-colors cursor-pointer"
                :class="
                  filtroStatus === 'PERMITIDO'
                    ? 'bg-success text-white shadow-sm font-semibold'
                    : 'text-text-2 hover:text-text-0'
                "
              >
                Permitidos
              </button>
              <button
                type="button"
                @click="alterarFiltroStatus('NEGADO')"
                class="px-3 py-1 text-caption font-medium rounded-sm transition-colors cursor-pointer"
                :class="
                  filtroStatus === 'NEGADO'
                    ? 'bg-danger text-white shadow-sm font-semibold'
                    : 'text-text-2 hover:text-text-0'
                "
              >
                Negados
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bg-1 border-b border-border text-[11px] font-semibold text-text-3 uppercase tracking-wider">
                <th class="py-3.5 px-6">Data / Hora</th>
                <th class="py-3.5 px-6">Setor</th>
                <th class="py-3.5 px-6">Empresa Vinculada</th>
                <th class="py-3.5 px-6">Status do Acesso</th>
                <th class="py-3.5 px-6">Equipamentos Ausentes / Detalhes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <!-- Loading State -->
              <tr v-if="carregando && logsFiltrados.length === 0">
                <td colspan="5" class="py-12 text-center text-text-2">
                  <div class="flex items-center justify-center gap-2">
                    <RefreshCw class="w-5 h-5 animate-spin text-accent" />
                    <span>Carregando histórico de acessos...</span>
                  </div>
                </td>
              </tr>

              <tr v-else-if="logsPaginados.length === 0">
                <td colspan="5" class="py-12 text-center text-text-3">
                  <Clock class="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p class="font-medium text-body text-text-1">Nenhum registro encontrado</p>
                  <p class="text-caption mt-1">
                    Nenhuma tentativa de acesso corresponde aos filtros aplicados.
                  </p>
                </td>
              </tr>

              <tr
                v-for="log in logsPaginados"
                :key="log.id_log || log.id || log.createdAt"
                class="hover:bg-bg-1/60 transition-colors"
              >
                <td class="py-4 px-6 text-body font-mono text-text-1 whitespace-nowrap">
                  {{ formatarDataHora(log.data_hora || log.createdAt) }}
                </td>

                <td class="py-4 px-6">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-text-0">
                      {{ log.Setor?.nome_setor || log.Setor?.nome || 'Posto não identificado' }}
                    </span>
                    <span
                      v-if="log.Setor?.id_setor || log.id_setor"
                      class="text-caption font-mono text-text-3 px-1.5 py-0.5 rounded bg-bg-2 border border-border"
                    >
                      {{ formatarIdSetor(log.Setor?.id_setor || log.id_setor) }}
                    </span>
                  </div>
                </td>

                <td class="py-4 px-6 text-body text-text-2">
                  {{ log.Setor?.Empresa?.nome || '-' }}
                </td>

                <td class="py-4 px-6">
                  <span
                    v-if="log.status_acesso === 'PERMITIDO'"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium bg-success/12 text-success border border-success/20"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    Permitido
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium bg-danger/12 text-danger border border-danger/20"
                  >
                    <XCircle class="w-3.5 h-3.5" />
                    Negado
                  </span>
                </td>

                <td class="py-4 px-6">
                  <div
                    v-if="log.status_acesso === 'PERMITIDO'"
                    class="flex items-center gap-1.5 text-caption text-text-3"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 text-success" />
                    <span>Em conformidade com as regras do setor</span>
                  </div>
                  <div
                    v-else-if="obterItensAusentes(log).length > 0"
                    class="flex flex-wrap gap-1.5"
                  >
                    <span
                      v-for="(item, idx) in obterItensAusentes(log)"
                      :key="idx"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-caption font-medium bg-danger/10 text-danger border border-danger/20"
                    >
                      <component :is="obterIconeEpi(item)" class="w-3 h-3" />
                      {{ formatarNomeEpi(item) }}
                    </span>
                  </div>
                  <span v-else class="text-caption text-text-3">
                    Infração de EPI detectada
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="logsFiltrados.length > 0"
          class="p-4 border-t border-border bg-bg-1/40 flex items-center justify-between text-caption text-text-2"
        >
          <div>
            Exibindo
            <span class="font-semibold text-text-0">
              {{ (paginaAtual - 1) * itensPorPagina + 1 }}
            </span>
            a
            <span class="font-semibold text-text-0">
              {{ Math.min(paginaAtual * itensPorPagina, logsFiltrados.length) }}
            </span>
            de
            <span class="font-semibold text-text-0">{{ logsFiltrados.length }}</span>
            registros
          </div>

          <div class="flex items-center gap-2">
            <BaseButton
              variant="secondary"
              :disabled="paginaAtual === 1"
              @click="mudarPagina(paginaAtual - 1)"
              class="h-8 px-2.5 text-caption"
            >
              <span class="flex items-center gap-1">
                <ChevronLeft class="w-3.5 h-3.5" />
                <span>Anterior</span>
              </span>
            </BaseButton>

            <span class="font-mono px-2 font-medium text-text-1">
              {{ paginaAtual }} / {{ totalPaginas }}
            </span>

            <BaseButton
              variant="secondary"
              :disabled="paginaAtual === totalPaginas"
              @click="mudarPagina(paginaAtual + 1)"
              class="h-8 px-2.5 text-caption"
            >
              <span class="flex items-center gap-1">
                <span>Próxima</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </span>
            </BaseButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

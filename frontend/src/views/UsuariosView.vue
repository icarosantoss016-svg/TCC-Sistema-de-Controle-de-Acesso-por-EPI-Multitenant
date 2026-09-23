<!--
  View: UsuariosView.vue
  Descrição: Gestão administrativa de usuários e sub-usuários vinculados a setores.
  Integra com a Sidebar, filtros client-side, tabela com paginação e modais de cadastro/edição.
-->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  Search,
  Plus,
  Building2,
  Pencil,
  Trash2,
  RotateCcw,
  IdCard,
} from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import UsuarioFormModal from '@/components/usuarios/UsuarioFormModal.vue'

const store = useStore()

onMounted(async () => {
  await Promise.all([
    store.dispatch('usuario/listarUsuarios'),
    store.dispatch('empresa/listaEmpresas'),
    store.dispatch('setor/listaSetores'),
  ])
})

// Estados locais de filtros
const busca = ref('')
const filtroCargo = ref('')
const filtroEmpresa = ref('')
const filtroStatus = ref('')
const paginaAtual = ref(1)
const itensPorPagina = 8

// Modais e Diálogos
const modalUsuarioAberto = ref(false)
const usuarioEditando = ref(null)
const confirmExclusaoAberto = ref(false)
const usuarioParaExcluir = ref(null)
const excluindo = ref(false)

// Toast de feedback
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

// Getters da Store
const usuarioLogado = computed(() => store.state.auth?.usuario)
const ehAdminGeral = computed(() => usuarioLogado.value?.perfil === 'ADMIN')
const todosUsuarios = computed(() => store.getters['usuario/todosUsuarios'] || [])
const todasEmpresas = computed(() => store.getters['empresa/todasEmpresas'] || [])

// Contagem de usuários ativos e total
const totalUsuarios = computed(() => todosUsuarios.value.length)
const totalAtivos = computed(() => todosUsuarios.value.filter((u) => u.status !== 'INATIVO').length)

// Lista de cargos únicos para o select de filtro
const cargosDisponiveis = computed(() => {
  const cargos = todosUsuarios.value.map((u) => u.cargo).filter(Boolean)
  return [...new Set(cargos)]
})

/**
 * Filtro client-side sobre a lista de usuários carregada
 */
const usuariosFiltrados = computed(() => {
  let lista = todosUsuarios.value

  if (busca.value.trim()) {
    const termo = busca.value.toLowerCase().trim()
    lista = lista.filter(
      (u) =>
        (u.nome || '').toLowerCase().includes(termo) ||
        (u.login || '').toLowerCase().includes(termo) ||
        String(u.id_usuario).includes(termo),
    )
  }

  if (filtroCargo.value) {
    lista = lista.filter((u) => u.cargo === filtroCargo.value)
  }

  if (filtroEmpresa.value) {
    lista = lista.filter((u) => {
      const empresasIds = u.Empresas?.map((e) => e.id_empresa) || [u.id_empresa]
      return empresasIds.includes(Number(filtroEmpresa.value))
    })
  }

  if (filtroStatus.value) {
    lista = lista.filter((u) => (u.status || 'ATIVO') === filtroStatus.value)
  }

  return lista
})

// Paginação
const totalPaginas = computed(() => Math.max(1, Math.ceil(usuariosFiltrados.value.length / itensPorPagina)))

const usuariosPaginados = computed(() => {
  const inicio = (paginaAtual.value - 1) * itensPorPagina
  return usuariosFiltrados.value.slice(inicio, inicio + itensPorPagina)
})

function limparFiltros() {
  busca.value = ''
  filtroCargo.value = ''
  filtroEmpresa.value = ''
  filtroStatus.value = ''
  paginaAtual.value = 1
}

function obterIniciais(nome) {
  if (!nome) return 'US'
  const partes = nome.trim().split(' ')
  if (partes.length > 1) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
  }
  return nome.substring(0, 2).toUpperCase()
}

function obterNomeEmpresas(usuario) {
  if (usuario.Empresas && usuario.Empresas.length > 0) {
    return usuario.Empresas.map((e) => e.nome).join(', ')
  }
  const emp = todasEmpresas.value.find((e) => e.id_empresa === usuario.id_empresa)
  return emp ? emp.nome : (usuario.perfil === 'ADMIN' ? 'Acesso Global' : 'Empresa não identificada')
}

function formatarSetoresAtribuidos(usuario) {
  if (usuario.perfil === 'ADMIN' || usuario.perfil === 'ADM_EMPRESA') {
    return 'Acesso a todos os setores'
  }
  if (!usuario.Setors || usuario.Setors.length === 0) {
    return 'Nenhum setor atribuído'
  }
  return usuario.Setors.map((s) => s.nome_setor).join(', ')
}

// Ações
function abrirCriarUsuario() {
  usuarioEditando.value = null
  modalUsuarioAberto.value = true
}

function abrirEditarUsuario(usuario) {
  usuarioEditando.value = usuario
  modalUsuarioAberto.value = true
}

function abrirExclusaoUsuario(usuario) {
  usuarioParaExcluir.value = usuario
  confirmExclusaoAberto.value = true
}

async function executarExclusao() {
  if (!usuarioParaExcluir.value) return
  excluindo.value = true
  try {
    await store.dispatch('usuario/deletarUsuario', usuarioParaExcluir.value.id_usuario)
    mostrarToast('Usuário removido com sucesso!')
    confirmExclusaoAberto.value = false
  } catch {
    mostrarToast('Não foi possível remover o usuário. Tente novamente.', 'error')
  } finally {
    excluindo.value = false
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
              Controle de Acesso & Credenciais
            </span>
            <span class="text-caption font-mono font-semibold text-accent bg-accent/12 px-2.5 py-0.5 rounded-sm">
              {{ totalAtivos }} / {{ totalUsuarios }} ATIVOS
            </span>
          </div>
          <h1 class="text-display font-bold text-text-0">Usuários</h1>
          <p class="text-body text-text-2 mt-1">
            Gerencie técnicos, gestores de segurança e sub-usuários vinculados a postos de monitoramento.
          </p>
        </div>

        <BaseButton variant="primary" @click="abrirCriarUsuario">
          <span class="flex items-center gap-2">
            <Plus class="w-4 h-4" />
            Cadastrar usuário
          </span>
        </BaseButton>
      </div>

      <!-- Barra de Filtros -->
      <div class="bg-bg-1 border border-border rounded-lg p-4 mb-6 flex flex-wrap items-center gap-3">
        <div class="w-full sm:w-64">
          <BaseInput
            v-model="busca"
            placeholder="Buscar por nome, login ou ID..."
            :icon="Search"
          />
        </div>

        <select
          v-model="filtroCargo"
          class="h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
        >
          <option value="">Todos os cargos</option>
          <option v-for="c in cargosDisponiveis" :key="c" :value="c">
            {{ c }}
          </option>
        </select>

        <select
          v-if="ehAdminGeral"
          v-model="filtroEmpresa"
          class="h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
        >
          <option value="">Todas as empresas</option>
          <option v-for="emp in todasEmpresas" :key="emp.id_empresa" :value="emp.id_empresa">
            {{ emp.nome }}
          </option>
        </select>

        <select
          v-model="filtroStatus"
          class="h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
        >
          <option value="">Todos os status</option>
          <option value="ATIVO">Ativos</option>
          <option value="INATIVO">Inativos</option>
        </select>

        <BaseButton
          type="button"
          variant="secondary"
          @click="limparFiltros"
          class="ml-auto"
          title="Limpar filtros"
        >
          <span class="flex items-center gap-1.5">
            <RotateCcw class="w-4 h-4" />
            <span>Limpar</span>
          </span>
        </BaseButton>
      </div>

      <!-- Tabela de Usuários -->
      <div class="bg-bg-0 border border-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bg-1 border-b border-border text-[11px] font-semibold text-text-3 uppercase tracking-wider">
                <th class="py-3.5 px-6">Usuário / Credencial</th>
                <th class="py-3.5 px-4">Cargo Técnico</th>
                <th class="py-3.5 px-4">Empresa Vinculada</th>
                <th class="py-3.5 px-4">Setores Atribuídos</th>
                <th class="py-3.5 px-4">Status</th>
                <th class="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border-soft">
              <tr
                v-for="usuario in usuariosPaginados"
                :key="usuario.id_usuario"
                class="hover:bg-bg-1/60 transition-colors group"
              >
                <!-- Usuário / Avatar / Login -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-bg-3 flex items-center justify-center font-bold text-caption text-text-0 shrink-0"
                    >
                      {{ obterIniciais(usuario.nome || usuario.login) }}
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-body font-semibold text-text-0 truncate">
                          {{ usuario.nome || usuario.login }}
                        </span>
                        <span class="text-[11px] font-mono text-text-3 font-semibold">
                          #{{ usuario.id_usuario }}
                        </span>
                      </div>
                      <span class="text-caption text-text-2 font-mono truncate block">
                        {{ usuario.login }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Cargo Técnico -->
                <td class="py-4 px-4 text-body text-text-1">
                  <div class="flex items-center gap-1.5">
                    <IdCard class="w-4 h-4 text-text-3 shrink-0" />
                    <span class="truncate">{{ usuario.cargo || 'Técnico de Segurança' }}</span>
                  </div>
                </td>

                <!-- Empresa Vinculada -->
                <td class="py-4 px-4 text-body text-text-1">
                  <div class="flex items-center gap-1.5">
                    <Building2 class="w-4 h-4 text-text-3 shrink-0" />
                    <span class="truncate">{{ obterNomeEmpresas(usuario) }}</span>
                  </div>
                </td>

                <!-- Setores Atribuídos -->
                <td class="py-4 px-4 text-caption text-text-2 max-w-xs">
                  <span
                    class="truncate block"
                    :class="[
                      usuario.perfil === 'ADMIN' || usuario.perfil === 'ADM_EMPRESA'
                        ? 'text-text-3 font-medium'
                        : usuario.Setors && usuario.Setors.length > 0
                        ? 'text-accent font-medium'
                        : 'text-danger font-medium'
                    ]"
                  >
                    {{ formatarSetoresAtribuidos(usuario) }}
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-caption font-semibold"
                    :class="[
                      usuario.status !== 'INATIVO'
                        ? 'bg-success/12 text-success'
                        : 'bg-bg-3 text-text-3'
                    ]"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="[usuario.status !== 'INATIVO' ? 'bg-success' : 'bg-text-3']"
                    />
                    {{ usuario.status !== 'INATIVO' ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>

                <!-- Ações -->
                <td class="py-4 px-6 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      @click="abrirEditarUsuario(usuario)"
                      class="w-8 h-8 rounded-icon bg-bg-2 hover:bg-bg-3 flex items-center justify-center text-text-1 hover:text-text-0 transition-colors cursor-pointer"
                      title="Editar usuário"
                    >
                      <Pencil class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="abrirExclusaoUsuario(usuario)"
                      class="w-8 h-8 rounded-icon bg-danger/12 hover:bg-danger/20 flex items-center justify-center text-danger transition-colors cursor-pointer"
                      title="Remover usuário"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="usuariosPaginados.length === 0">
                <td colspan="6" class="py-12 text-center text-caption text-text-3">
                  Nenhum usuário encontrado com os filtros aplicados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div class="p-4 bg-bg-1 border-t border-border flex items-center justify-between text-caption text-text-2">
          <span>
            Mostrando {{ usuariosPaginados.length }} de {{ usuariosFiltrados.length }} usuários
          </span>
          <div class="flex items-center gap-2">
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="paginaAtual === 1"
              @click="paginaAtual--"
            >
              Anterior
            </BaseButton>
            <span class="font-mono font-semibold px-2">
              {{ paginaAtual }} / {{ totalPaginas }}
            </span>
            <BaseButton
              type="button"
              variant="secondary"
              :disabled="paginaAtual === totalPaginas"
              @click="paginaAtual++"
            >
              Próxima
            </BaseButton>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de Criação e Edição de Usuário -->
    <UsuarioFormModal
      :aberto="modalUsuarioAberto"
      :usuario-para-editar="usuarioEditando"
      @fechar="modalUsuarioAberto = false"
      @salvo="mostrarToast"
    />

    <!-- Diálogo de Confirmação de Exclusão -->
    <BaseConfirmDialog
      :aberto="confirmExclusaoAberto"
      titulo="Remover Usuário"
      :mensagem="`Tem certeza que deseja remover ${usuarioParaExcluir?.nome || usuarioParaExcluir?.login}? Esta ação não pode ser desfeita.`"
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

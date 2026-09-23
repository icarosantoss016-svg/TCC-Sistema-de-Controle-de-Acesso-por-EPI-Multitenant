<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  Building2,
  Video,
  IdCard,
  UserCheck,
  BarChart3,
  ChevronDown,
  LogOut,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useStore()

const menuAberto = ref(false)

const exAdminItensMenu = [
  {
    titulo: 'Empresas',
    subtitulo: 'Parceiras e clientes',
    rota: '/empresas',
    icone: Building2,
    perfis: ['ADMIN'],
  },
  {
    titulo: 'Solicitações',
    subtitulo: 'Revisão de acessos',
    rota: '/solicitacoes-acesso',
    icone: UserCheck,
    perfis: ['ADMIN'],
  }
]

// Lista mestre de itens de navegação com restrição por perfil
const todosItensMenu = [
  {
    titulo: 'Setores',
    subtitulo: 'Monitoramento câmeras',
    rota: '/setores',
    icone: Video,
    perfis: ['ADMIN', 'ADM_EMPRESA', 'USUARIO'],
  },
  {
    titulo: 'Usuários',
    subtitulo: 'Técnicos e gestores',
    rota: '/usuarios',
    icone: IdCard,
    perfis: ['ADMIN', 'ADM_EMPRESA'],
  },
  {
    titulo: 'Dashboard',
    subtitulo: 'Métricas e conformidade',
    rota: '/dashboard',
    icone: BarChart3,
    perfis: ['ADMIN', 'ADM_EMPRESA', 'USUARIO'],
  },
]

/**
 * Dados reais do usuário autenticado no Vuex/localStorage
 */
const usuarioAutenticado = computed(() => {
  const usuarioStore = store?.state?.auth?.usuario || JSON.parse(localStorage.getItem('usuario') || 'null')
  const nome = usuarioStore?.nome || usuarioStore?.login || 'Usuário'
  const partes = nome.trim().split(' ')
  const iniciais = partes.length > 1
    ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
    : nome.substring(0, 2).toUpperCase()

  return {
    id: usuarioStore?.id || usuarioStore?.id_usuario,
    nome,
    login: usuarioStore?.login || '',
    cargo: usuarioStore?.cargo || (usuarioStore?.perfil === 'ADMIN' ? 'Administrador' : 'Gestor de Segurança'),
    perfil: usuarioStore?.perfil || 'USUARIO',
    iniciais,
  }
})

/**
 * Filtra os itens visíveis no menu conforme o perfil do usuário logado
 */
const itensMenuVisiveis = computed(() => {
  const perfil = usuarioAutenticado.value.perfil
  return todosItensMenu.filter((item) => item.perfis.includes(perfil))
})

/**
 * Verifica se a rota do item corresponde à URL ativa
 */
function isItemAtivo(rotaItem) {
  if (!route) return false
  if (route.path === rotaItem || route.path.startsWith(`${rotaItem}/`)) {
    return true
  }
  return false
}

function alternarMenuUsuario() {
  menuAberto.value = !menuAberto.value
}

async function aoSair() {
  await store.dispatch('auth/logout')
  router.push('/login')
}
</script>

<template>
  <aside
    class="w-[264px] h-screen shrink-0 bg-bg-1 border-r border-border flex flex-col justify-between select-none sticky top-0 z-30"
  >
    <!-- Topo da Sidebar: Cabeçalho com Logo e Navegação -->
    <div class="flex flex-col">
      <!-- Cabeçalho / Logo -->
      <div class="h-16 px-5 flex items-center gap-3 border-b border-border">
        <div
          class="w-9 h-9 rounded-sm bg-accent flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
        >
          SZ
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-body font-bold text-text-0 truncate leading-tight"> SafeZone </span>
          <span class="text-caption text-text-2 truncate leading-tight"> Controle de EPI </span>
        </div>
      </div>

      <!-- Seção de Navegação: Somente ADMIN -->
      <template v-if="usuarioAutenticado.perfil === 'ADMIN'">
        <div class="px-3 pt-6 pb-2">
          <span class="px-3 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
            GERENCIAMENTO ADMIN
          </span>
        </div>
        
        <!-- Lista somente admin -->
        <nav class="px-3 space-y-1">
          <router-link
            v-for="item in exAdminItensMenu"
            :key="item.rota"
            :to="item.rota"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors group"
            :class="[
              isItemAtivo(item.rota)
                ? 'bg-accent/12 text-accent border-l-4 border-accent pl-2.5 font-medium'
                : 'text-text-1 hover:bg-bg-2 border-l-4 border-transparent pl-2.5',
            ]"
          >
            <!-- Ícone do item -->
            <component
              :is="item.icone"
              class="w-5 h-5 shrink-0 transition-colors"
              :class="[
                isItemAtivo(item.rota) ? 'text-accent' : 'text-text-2 group-hover:text-text-1',
              ]"
            />

            <!-- Textos do item: Título e Subtítulo -->
            <div class="flex flex-col min-w-0">
              <span
                class="text-body leading-tight truncate font-medium"
                :class="[
                  isItemAtivo(item.rota) ? 'text-accent' : 'text-text-0 group-hover:text-text-0',
                ]"
              >
                {{ item.titulo }}
              </span>
              <span
                class="text-caption leading-tight truncate mt-0.5"
                :class="[isItemAtivo(item.rota) ? 'text-accent/80' : 'text-text-2']"
              >
                {{ item.subtitulo }}
              </span>
            </div>
          </router-link>
        </nav>
      </template>

      <div class="px-3 pt-6 pb-2">
        <span class="px-3 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
          SISTEMA DE CONTROLE
        </span>
      </div>

      <!-- Lista de Itens do Menu TODOS OS USUÁRIOS -->
      <nav class="px-3 space-y-1">
        <router-link
          v-for="item in itensMenuVisiveis"
          :key="item.rota"
          :to="item.rota"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors group"
          :class="[
            isItemAtivo(item.rota)
              ? 'bg-accent/12 text-accent border-l-4 border-accent pl-2.5 font-medium'
              : 'text-text-1 hover:bg-bg-2 border-l-4 border-transparent pl-2.5',
          ]"
        >
          <!-- Ícone do item -->
          <component
            :is="item.icone"
            class="w-5 h-5 shrink-0 transition-colors"
            :class="[
              isItemAtivo(item.rota) ? 'text-accent' : 'text-text-2 group-hover:text-text-1',
            ]"
          />

          <!-- Textos do item: Título e Subtítulo -->
          <div class="flex flex-col min-w-0">
            <span
              class="text-body leading-tight truncate font-medium"
              :class="[
                isItemAtivo(item.rota) ? 'text-accent' : 'text-text-0 group-hover:text-text-0',
              ]"
            >
              {{ item.titulo }}
            </span>
            <span
              class="text-caption leading-tight truncate mt-0.5"
              :class="[isItemAtivo(item.rota) ? 'text-accent/80' : 'text-text-2']"
            >
              {{ item.subtitulo }}
            </span>
          </div>
        </router-link>
      </nav>
    </div>

    <!-- Rodapé: Card do Usuário Logado + Dropdown de Logout -->
    <div class="border-t border-border p-3 relative">
      <!-- Menu flutuante de ações do usuário -->
      <div
        v-if="menuAberto"
        class="absolute bottom-16 left-3 right-3 bg-bg-0 border border-border rounded-lg shadow-lg p-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150"
      >
        <div class="px-3 py-2 border-b border-border-soft mb-1">
          <p class="text-caption font-semibold text-text-0 truncate">
            {{ usuarioAutenticado.nome }}
          </p>
          <p class="text-[11px] text-text-3 font-mono truncate">
            {{ usuarioAutenticado.login }}
          </p>
        </div>
        <button
          type="button"
          @click="aoSair"
          class="w-full flex items-center gap-2 px-3 py-2 text-caption font-medium text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
        >
          <LogOut class="w-4 h-4 shrink-0" />
          <span>Sair da conta</span>
        </button>
      </div>

      <button
        type="button"
        @click="alternarMenuUsuario"
        class="w-full flex items-center gap-3 p-2 rounded-md hover:bg-bg-2 transition-colors cursor-pointer text-left focus:outline-none"
      >
        <!-- Avatar com indicador de status online -->
        <div
          class="relative w-9 h-9 rounded-full bg-bg-3 flex items-center justify-center font-semibold text-caption text-text-1 shrink-0"
        >
          {{ usuarioAutenticado.iniciais }}
          <span
            class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-bg-1"
            title="Online"
          />
        </div>

        <!-- Nome e Cargo -->
        <div class="flex flex-col min-w-0 flex-1">
          <span class="text-body font-semibold text-text-0 truncate leading-tight">
            {{ usuarioAutenticado.nome }}
          </span>
          <span class="text-caption text-text-2 truncate leading-tight">
            {{ usuarioAutenticado.cargo }}
          </span>
        </div>

        <!-- Ícone de expansão -->
        <ChevronDown
          class="w-4 h-4 text-text-3 shrink-0 ml-auto transition-transform duration-200"
          :class="[menuAberto ? 'rotate-180 text-text-0' : '']"
        />
      </button>
    </div>
  </aside>
</template>

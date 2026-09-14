<!--
  Componente: Sidebar.vue
  Descrição: Barra de navegação lateral fixa para as telas administrativas do sistema SafeZone.
  Permite navegação entre as seções de Empresas, Setores, Usuários e Dashboard.
-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { Building2, Video, IdCard, BarChart3, ChevronDown } from 'lucide-vue-next'

const route = useRoute()
const store = useStore()

// Lista fixa de itens do menu de navegação lateral (na ordem solicitada)
const itensMenu = [
  {
    titulo: 'Empresas',
    subtitulo: 'Parceiras e setores',
    rota: '/empresas',
    icone: Building2,
  },
  {
    titulo: 'Setores',
    subtitulo: 'Monitoramento câmeras',
    rota: '/setores',
    icone: Video,
  },
  {
    titulo: 'Usuários',
    subtitulo: 'Técnicos e engenheiros',
    rota: '/usuarios',
    icone: IdCard,
  },
  {
    titulo: 'Dashboard',
    subtitulo: 'Métricas e conformidade',
    rota: '/dashboard',
    icone: BarChart3,
  },
]

/**
 * Dados do usuário autenticado obtidos do Vuex (se houver), ou valores padrão de placeholder.
 * // TODO: substituir por dados do usuário autenticado quando o módulo de auth estiver 100% integrado
 */
const usuarioAutenticado = computed(() => {
  const usuarioStore = store?.state?.auth?.usuario
  return {
    nome: usuarioStore?.nome || usuarioStore?.login || 'Lucas Cintra',
    cargo: usuarioStore?.cargo || 'Administrador',
    iniciais: 'LC',
  }
})

/**
 * Função para verificar se determinado item do menu corresponde à rota atual.
 * Compara o caminho da URL (route.path) e trata o fallback da página inicial ('/').
 */
function isItemAtivo(rotaItem) {
  if (!route) return false

  // Rota exata ou sub-rota
  if (route.path === rotaItem || route.path.startsWith(`${rotaItem}/`)) {
    return true
  }

  // Se a rota atual for a raiz ('/'), destaca 'Empresas' como padrão inicial
  if (route.path === '/' && rotaItem === '/empresas') {
    return true
  }

  return false
}

// TODO: implementar expansão do menu de perfil/logout ao clicar no rodapé
function abrirMenuUsuario() {
  // Ação visual / stub para futura integração
}
</script>

<template>
  <aside
    class="w-[264px] h-screen shrink-0 bg-bg-1 border-r border-border flex flex-col justify-between select-none sticky top-0"
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

      <!-- Seção de Navegação -->
      <div class="px-3 pt-6 pb-2">
        <span class="px-3 text-[11px] font-semibold text-text-3 uppercase tracking-wider">
          SISTEMA DE CONTROLE
        </span>
      </div>

      <!-- Lista de Itens do Menu -->
      <nav class="px-3 space-y-1">
        <router-link
          v-for="item in itensMenu"
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

    <!-- Rodapé: Card do Usuário Logado -->
    <div class="border-t border-border p-3">
      <button
        type="button"
        @click="abrirMenuUsuario"
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

        <!-- Ícone de expansão (stub para menu da conta) -->
        <ChevronDown class="w-4 h-4 text-text-3 shrink-0 ml-auto" />
      </button>
    </div>
  </aside>
</template>

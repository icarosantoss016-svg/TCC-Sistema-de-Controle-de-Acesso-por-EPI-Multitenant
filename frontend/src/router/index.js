import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import LandingView from '@/views/LandingView.vue'
import EmpresaView from '@/views/EmpresaView.vue'
import LoginView from '@/views/LoginView.vue'
import SetoresView from '@/views/SetoresView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import SolicitacoesAcessoView from '@/views/SolicitacoesAcessoView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
      meta: { publico: true },
    },
    {
      path: '/landing',
      redirect: '/',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { publico: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requerAuth: true, perfisPermitidos: ['ADMIN', 'ADM_EMPRESA', 'USUARIO'] },
    },
    {
      path: '/empresas',
      name: 'empresas',
      component: EmpresaView,
      meta: { requerAuth: true, perfisPermitidos: ['ADMIN'] },
    },
    {
      path: '/setores',
      name: 'setores',
      component: SetoresView,
      meta: { requerAuth: true, perfisPermitidos: ['ADMIN', 'ADM_EMPRESA', 'USUARIO'] },
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosView,
      meta: { requerAuth: true, perfisPermitidos: ['ADMIN', 'ADM_EMPRESA'] },
    },
    {
      path: '/solicitacoes-acesso',
      name: 'solicitacoes-acesso',
      component: SolicitacoesAcessoView,
      meta: { requerAuth: true, perfisPermitidos: ['ADMIN'] },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Guarda Global de Navegação (RBAC + Autenticação)
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const usuario = store.state.auth?.usuario || JSON.parse(localStorage.getItem('usuario') || 'null')

  // Se rota pública (como landing e login), permite acesso direto
  if (to.meta.publico) {
    if (to.name === 'login' && token && usuario) {
      // Se já está logado e tenta ir pro login, redireciona para a página pós-login
      return usuario.perfil === 'ADMIN' ? '/empresas' : '/dashboard'
    }
    return true
  }

  // Se a rota requer autenticação e não há token, redireciona para login
  if (!token || !usuario) {
    return '/login'
  }

  // Verifica permissão por perfil (RBAC)
  const perfisPermitidos = to.meta.perfisPermitidos
  if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
    // Redireciona para a tela permitida do perfil
    return usuario.perfil === 'ADMIN' ? '/empresas' : '/dashboard'
  }

  return true
})

export default router

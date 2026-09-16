import { createRouter, createWebHistory } from 'vue-router'
import EmpresaView from '@/views/EmpresaView.vue'
import LoginView from '@/views/LoginView.vue'
import SetoresView from '@/views/SetoresView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/empresas',
      name: 'empresas',
      component: EmpresaView,
    },
    {
      path: '/setores',
      name: 'setores',
      component: SetoresView,
    },
  ],
})

export default router

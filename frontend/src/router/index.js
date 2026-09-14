import { createRouter, createWebHistory } from 'vue-router'
import EmpresaView from '@/views/EmpresaView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/empresas',
    },
    {
      path: '/empresas',
      name: 'empresas',
      component: EmpresaView,
    },
  ],
})

export default router

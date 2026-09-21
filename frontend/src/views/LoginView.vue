<script setup>
import { ref } from 'vue'
import { User, Lock, ArrowRight, UserPlus } from 'lucide-vue-next'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Toast from '@/components/ui/Toast.vue'
import SolicitarAcessoModal from '@/components/solicitacoes/SolicitarAcessoModal.vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const login = ref('')
const senha = ref('')
const carregando = ref(false)
const erroLogin = ref('')
const modalSolicitacaoAberto = ref(false)

// Toast de feedback
const toastVisivel = ref(false)
const toastMensagem = ref('')
let toastTimer = null

function mostrarToast(mensagem) {
  if (toastTimer) clearTimeout(toastTimer)
  toastMensagem.value = mensagem
  toastVisivel.value = true
  toastTimer = setTimeout(() => {
    toastVisivel.value = false
  }, 4000)
}

const store = useStore()
const router = useRouter()

async function aoEnviar() {
  carregando.value = true
  erroLogin.value = ''

  try {
    await store.dispatch('auth/login', {
      login: login.value,
      senha: senha.value,
    })

    const usuario = store.state.auth?.usuario
    if (usuario?.perfil === 'ADMIN') {
      router.push('/empresas')
    } else {
      router.push('/setores')
    }
  } catch (err) {
    erroLogin.value = err.response?.data?.error || 'Usuário ou senha inválidos.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-bg-1 p-8">
    <div class="w-full max-w-md bg-bg-0 rounded-lg shadow-xl p-8">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="bg-accent w-11 h-11 rounded-md flex items-center justify-center text-white font-bold text-display"
        >
          SZ
        </div>
        <div class="font-bold text-heading text-text-0">
          <span>SAFEZONE</span>
          <p class="text-caption text-text-2">Controle Setorial de EPI</p>
        </div>
      </div>

      <h1 class="text-heading font-bold text-text-0 mb-1">Entrar na sua conta</h1>
      <p class="text-caption text-text-2 mb-6">
        Acesso restrito a técnicos e engenheiros de segurança do trabalho autorizados.
      </p>

      <form class="flex flex-col gap-1" @submit.prevent="aoEnviar">
        <BaseInput v-model="login" label="Usuário" placeholder="Insira seu usuário" :icon="User" />

        <BaseInput
          v-model="senha"
          label="Senha"
          type="password"
          placeholder="••••••••"
          :icon="Lock"
        />
        <p v-if="erroLogin" class="text-caption text-danger">{{ erroLogin }}</p>

        <BaseButton variant="primary" :disabled="carregando" class="mt-3">
          <span class="flex items-center justify-center gap-1">
            {{ carregando ? 'Entrando...' : 'Entrar' }}
            <ArrowRight v-if="!carregando" class="w-4 h-4 mt-1" />
          </span>
        </BaseButton>
      </form>

      <!-- Divisor e link para solicitação pública de acesso -->
      <div class="mt-6 pt-4 border-t border-border-soft text-center">
        <p class="text-caption text-text-2 mb-2">Ainda não possui credencial?</p>
        <button
          type="button"
          @click="modalSolicitacaoAberto = true"
          class="inline-flex items-center gap-1.5 text-caption font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer"
        >
          <UserPlus class="w-4 h-4" />
          <span>Solicitar acesso à plataforma</span>
        </button>
      </div>
    </div>

    <!-- Modal Público de Solicitação de Acesso -->
    <SolicitarAcessoModal
      :aberto="modalSolicitacaoAberto"
      @fechar="modalSolicitacaoAberto = false"
      @sucesso="mostrarToast"
    />

    <!-- Toast de Notificação -->
    <Toast
      :visivel="toastVisivel"
      :mensagem="toastMensagem"
      tipo="success"
      @fechar="toastVisivel = false"
    />
  </div>
</template>

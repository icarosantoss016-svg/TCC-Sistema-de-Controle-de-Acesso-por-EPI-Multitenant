<script setup>
import { ref, watch } from 'vue'
import { useStore } from 'vuex'
import { User, Mail, Briefcase, Lock, AtSign } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  aberto: Boolean,
})

const emit = defineEmits(['fechar', 'sucesso'])
const store = useStore()

const nome = ref('')
const login = ref('')
const email = ref('')
const cargo = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      nome.value = ''
      login.value = ''
      email.value = ''
      cargo.value = ''
      senha.value = ''
      erro.value = ''
    }
  },
)

async function aoEnviar() {
  if (!nome.value.trim() || !login.value.trim() || !senha.value.trim()) {
    erro.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const resposta = await store.dispatch('solicitacao/criarSolicitacao', {
      nome: nome.value.trim(),
      login: login.value.trim(),
      email: email.value.trim() || login.value.trim(),
      cargo: cargo.value.trim() || 'Gestor de Segurança',
      senha: senha.value.trim(),
    })

    emit('sucesso', resposta.mensagem || 'Solicitação enviada com sucesso! Aguarde aprovação.')
    emit('fechar')
  } catch (error) {
    erro.value = error.response?.data?.error || 'Erro ao enviar solicitação.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal
    :aberto="aberto"
    titulo="Solicitar Acesso à Plataforma"
    @fechar="emit('fechar')"
  >
    <form class="flex flex-col gap-3" @submit.prevent="aoEnviar">
      <p class="text-caption text-text-2 mb-1">
        Envie seus dados para que o administrador aprove sua conta corporativa.
      </p>

      <BaseInput
        v-model="nome"
        label="Nome Completo *"
        placeholder="Ex: João da Silva"
        :icon="User"
      />

      <BaseInput
        v-model="login"
        label="Login / Nome de Usuário *"
        placeholder="Ex: joao.silva"
        :icon="AtSign"
      />

      <BaseInput
        v-model="email"
        label="E-mail Corporativo"
        type="email"
        placeholder="joao@empresa.com.br"
        :icon="Mail"
      />

      <BaseInput
        v-model="cargo"
        label="Cargo / Função Técnica"
        placeholder="Ex: Engenheiro de Segurança do Trabalho"
        :icon="Briefcase"
      />

      <BaseInput
        v-model="senha"
        label="Senha de Acesso *"
        type="password"
        placeholder="Mínimo 4 caracteres"
        :icon="Lock"
      />

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-3 pt-2 border-t border-border-soft">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Enviando...' : 'Enviar Solicitação' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

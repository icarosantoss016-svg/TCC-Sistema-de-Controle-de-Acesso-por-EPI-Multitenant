<script setup>
import { ref, watch } from 'vue'
import { User, Lock, KeyRound, Check } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import api from '@/service/api'

const props = defineProps({
  aberto: Boolean,
})

const emit = defineEmits(['fechar', 'sucesso'])

const login = ref('')
const novaSenha = ref('')
const confirmarSenha = ref('')
const carregando = ref(false)
const erro = ref('')

watch(
  () => props.aberto,
  (estaAberto) => {
    if (estaAberto) {
      login.value = ''
      novaSenha.value = ''
      confirmarSenha.value = ''
      erro.value = ''
    }
  },
)

async function aoEnviar() {
  if (!login.value.trim()) {
    erro.value = 'Informe seu usuário/login.'
    return
  }

  if (!novaSenha.value.trim() || novaSenha.value.trim().length < 4) {
    erro.value = 'A nova senha deve ter no mínimo 4 caracteres.'
    return
  }

  if (novaSenha.value !== confirmarSenha.value) {
    erro.value = 'A confirmação de senha não confere.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const resposta = await api.post('/api/redefinir-senha', {
      login: login.value.trim(),
      novaSenha: novaSenha.value.trim(),
    })

    emit('sucesso', resposta.data?.mensagem || 'Senha redefinida com sucesso! Faça login com a nova senha.')
    emit('fechar')
  } catch (error) {
    erro.value = error.response?.data?.error || 'Não foi possível redefinir sua senha. Verifique os dados.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal
    :aberto="aberto"
    titulo="Redefinir sua Senha"
    @fechar="emit('fechar')"
  >
    <form class="flex flex-col gap-4" @submit.prevent="aoEnviar">
      <div class="flex items-start gap-3 p-3.5 rounded-lg bg-bg-2 border border-border">
        <KeyRound class="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <p class="text-caption text-text-2">
          Informe seu usuário cadastrado e defina uma nova senha de acesso.
        </p>
      </div>

      <BaseInput
        v-model="login"
        label="Usuário / Login *"
        placeholder="Ex: joao.silva"
        :icon="User"
      />

      <BaseInput
        v-model="novaSenha"
        label="Nova Senha *"
        type="password"
        placeholder="Mínimo 4 caracteres"
        :icon="Lock"
      />

      <BaseInput
        v-model="confirmarSenha"
        label="Confirmar Nova Senha *"
        type="password"
        placeholder="Repita a nova senha"
        :icon="Lock"
      />

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-2 pt-3 border-t border-border-soft">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          <span class="flex items-center gap-1.5">
            <Check v-if="!carregando" class="w-4 h-4" />
            <span>{{ carregando ? 'Redefinindo...' : 'Salvar Nova Senha' }}</span>
          </span>
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

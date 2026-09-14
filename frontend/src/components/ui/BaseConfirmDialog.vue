<script setup>
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

defineProps({
  aberto: Boolean,
  titulo: {
    type: String,
    default: 'Comfirma ação?',
  },
  mensagem: String,
  carregando: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirmar', 'cancelar'])
</script>

<template>
  <BaseModal :aberto="aberto" titulo="titulo" @fechar="emit('cancelar')">
    <p>{{ mensagem }}</p>

    <div class="flex gap-3 justify-end">
      <BaseButton variant="secondary" @click="emit('cancelar')"> Cancelar </BaseButton>
      <BaseButton variant="danger" :disabled="carregando" @click="emit('confirmar')">
        {{ carregando ? 'Excluindo' : 'Excluir' }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

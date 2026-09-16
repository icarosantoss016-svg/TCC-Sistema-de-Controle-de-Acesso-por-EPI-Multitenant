<script setup>
import { CheckCircle2, AlertCircle, X } from 'lucide-vue-next'

defineProps({
  visivel: {
    type: Boolean,
    default: false,
  },
  mensagem: {
    type: String,
    default: '',
  },
  tipo: {
    type: String,
    default: 'success', // 'success' | 'error'
  },
})

const emit = defineEmits(['fechar'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-4 opacity-0"
  >
    <div
      v-if="visivel"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-bg-0 border border-border rounded-md shadow-lg max-w-md"
      role="alert"
    >
      <CheckCircle2 v-if="tipo === 'success'" class="w-5 h-5 text-success shrink-0" />
      <AlertCircle v-else class="w-5 h-5 text-danger shrink-0" />

      <span class="text-body text-text-0 flex-1">
        {{ mensagem }}
      </span>

      <button
        type="button"
        @click="emit('fechar')"
        class="p-1 rounded-sm text-text-3 hover:text-text-1 hover:bg-bg-2 transition-colors cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

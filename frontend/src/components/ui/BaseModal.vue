<script setup>
import { X } from 'lucide-vue-next'
defineProps({
  aberto: Boolean,
  titulo: String,
})

const emit = defineEmits(['fechar'])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="aberto"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-0/40"
      @click.self="emit('fechar')"
    >
      <div class="relative w-full max-w-lg bg-bg-0 rounded-lg shadow-xl overflow-hidden">
        <div class="px-6 py-4 bg-bg-1 flex items-center justify-between">
          <h3 class="text-heading font-bold text-text-0">{{ titulo }}</h3>
          <button
            @click="emit('fechar')"
            class="w-8 h-8 rounded-icon bg-bg-2 hover:bg-bg-3 flex items-center justify-center transition-colors"
          >
            <X class="w-4 h-4 text-text-2" />
          </button>
        </div>

        <div class="p-6">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

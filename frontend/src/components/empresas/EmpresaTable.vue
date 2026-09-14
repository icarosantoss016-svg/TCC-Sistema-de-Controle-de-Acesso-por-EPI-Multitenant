<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'
import BaseButton from '../ui/BaseButton.vue'

defineProps({
  empresas: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['editar', 'excluir'])
</script>

<template>
  <table class="w-full">
    <thead>
      <tr class="border-b border-border text-caption text-text-2 text-left">
        <th class="py-3 px-4 font-medium">Nome</th>
        <th class="py-3 px-4 font-medium">CNPJ</th>
        <th class="py-3 px-4 font-medium">Ramo</th>
        <th class="py-3 px-4 font-medium">Setores</th>
        <th class="py-3 px-4 font-medium text-right">Ações</th>
      </tr>
    </thead>
    <tbody class="bg-accent/5">
      <tr
        v-for="empresa in empresas"
        :key="empresa.id_empresa"
        class="border-b border-border-soft text-body text-text-1 hover:bg-accent-hover/10"
      >
        <td class="py-3 px-4 font-medium text-text-0">{{ empresa.nome }}</td>
        <td class="py-3 px-4 font-mono text-text-0">{{ empresa.cnpj }}</td>
        <td class="py-3 px-4">{{ empresa.ramo }}</td>
        <td class="py-3 px-4">{{ empresa.quantidadeSetores }} setores</td>
        <td class="py-3 px-4">
          <div class="flex gap-2 justify-end">
            <BaseButton variant="secondary" icon-only @click="emit('editar', empresa)">
              <Pencil class="w-4 h-4" />
            </BaseButton>
            <BaseButton variant="danger" icon-only @click="emit('excluir', empresa)">
              <Trash2 class="w-4 h-4" />
            </BaseButton>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

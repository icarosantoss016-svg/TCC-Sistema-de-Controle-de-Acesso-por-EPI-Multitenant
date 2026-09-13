<script setup>
import { ref } from 'vue'
import EmpresaFormModal from '@/components/empresas/EmpresaFormModal.vue'

const aberto = ref(true)
</script>

<template>
  <EmpresaFormModal :aberto="aberto" @fechar="aberto = false" />
</template>
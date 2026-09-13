<script setup>
import EmpresaTable from '@/components/empresas/EmpresaTable.vue'

const empresasTeste = [
  { id_empresa: 1, nome: 'Indústria Teste A', cnpj: '11.111.111/0001-11', ramo: 'Metalurgia', quantidadeSetores: 3 },
  { id_empresa: 2, nome: 'Indústria Teste B', cnpj: '22.222.222/0001-22', ramo: 'Química', quantidadeSetores: 1 }
]

function aoEditar(empresa) {
  console.log('Editar:', empresa)
}
function aoExcluir(empresa) {
  console.log('Excluir:', empresa)
}
</script>

<template>
  <EmpresaTable :empresas="empresasTeste" @editar="aoEditar" @excluir="aoExcluir" />
</template>
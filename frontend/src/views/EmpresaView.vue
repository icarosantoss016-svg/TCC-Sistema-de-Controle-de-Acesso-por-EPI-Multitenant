<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { Search, Plus } from 'lucide-vue-next'
import Sidebar from '@/components/layout/Sidebar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import EmpresaFormModal from '@/components/empresas/EmpresaFormModal.vue'
import EmpresaTable from '@/components/empresas/EmpresaTable.vue'

const store = useStore()

onMounted(() => {
  store.dispatch('empresa/listaEmpresas')
  store.dispatch('setor/listarSetores')
})

const busca = ref('')
const formAberto = ref(false)
const empresaEditando = ref(null)
const confirmAberto = ref(false)
const empresaParaExcluir = ref(null)
const excluindo = ref(false)

const empresasComContagem = computed(() => {
  const empresas = store.getters['empresa/todasEmpresas']
  const setores = store.getters['setor/todosSetores']

  return empresas.map((empresa) => {
    const setoresDaEmpresa = setores.filter((s) => s.id_empresa === empresa.id_empresa)
    return {
      ...empresa,
      quantidadeSetores: setoresDaEmpresa.length,
    }
  })
})

const empresasFiltradas = computed(() => {
  if (!busca.value.trim()) {
    return empresasComContagem.value
  }

  const termo = busca.value.toLowerCase()
  return empresasComContagem.value.filter(
    (e) =>
      e.nome?.toLowerCase().includes(termo) ||
      e.cnpj?.toLowerCase().includes(termo) ||
      e.ramo?.toLowerCase().includes(termo),
  )
})

function abrirCriar() {
  empresaEditando.value = null
  formAberto.value = true
}

function abrirEditar(empresa) {
  empresaEditando.value = empresa
  formAberto.value = true
}

function abrirExclusao(empresa) {
  empresaParaExcluir.value = empresa
  confirmAberto.value = true
}

async function confirmarExclusao() {
  excluindo.value = true
  try {
    await store.dispatch('empresa/deletarEmpresa', empresaParaExcluir.value.id_empresa)
    confirmAberto.value = false
  } finally {
    excluindo.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-bg-0">
    <!-- Barra de navegação lateral -->
    <Sidebar />

    <!-- Conteúdo principal da página de Empresas -->
    <main class="flex-1 min-w-0 p-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-display font-bold text-text-0">Empresas</h1>
        <BaseButton variant="primary" @click="abrirCriar">
          <span class="flex items-center gap-2">
            <Plus class="w-4 h-4" />
            Cadastrar empresa
          </span>
        </BaseButton>
      </div>

      <div class="mb-6">
        <BaseInput v-model="busca" placeholder="Busca por nome, CNPJ ou ramo" :icon="Search" />
      </div>

      <div>
        <EmpresaTable
          :empresas="empresasFiltradas"
          @editar="abrirEditar"
          @excluir="abrirExclusao"
        />
      </div>
    </main>

    <EmpresaFormModal
      :aberto="formAberto"
      :empresa-para-editar="empresaEditando"
      @fechar="formAberto = false"
    />

    <BaseConfirmDialog
      :aberto="confirmAberto"
      titulo="Excluir empresa"
      :mensagem="`Tem certeza que deseja excluir ${empresaParaExcluir?.nome}? Essa ação não pode ser desfeita.`"
      :carregando="excluindo"
      @cancelar="confirmAberto = false"
      @confirmar="confirmarExclusao"
    />
  </div>
</template>

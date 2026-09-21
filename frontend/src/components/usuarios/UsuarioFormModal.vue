<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { RefreshCw, Eye, EyeOff } from 'lucide-vue-next'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  aberto: Boolean,
  usuarioParaEditar: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['fechar', 'salvo'])
const store = useStore()

const usuarioLogado = computed(() => store.state.auth?.usuario)
const ehAdminGeral = computed(() => usuarioLogado.value?.perfil === 'ADMIN')

const estaEditando = computed(() => !!props.usuarioParaEditar)
const tituloModal = computed(() => (estaEditando.value ? 'Editar Usuário' : 'Cadastrar Novo Usuário'))

// Dados do formulário
const nome = ref('')
const login = ref('')
const cargo = ref('')
const senha = ref('')
const perfil = ref('USUARIO')
const status = ref('ATIVO')
const empresasSelecionadas = ref([])
const setoresSelecionados = ref([])

const mostrarSenha = ref(false)
const carregando = ref(false)
const erro = ref('')

// Getters da Store
const todasEmpresas = computed(() => store.getters['empresa/todasEmpresas'] || [])
const todosSetores = computed(() => store.getters['setor/todosSetores'] || [])

// Setores disponíveis para seleção (filtrados pela empresa do usuário logado se for ADM_EMPRESA)
const setoresDisponiveis = computed(() => {
  if (ehAdminGeral.value) {
    if (empresasSelecionadas.value.length === 0) return todosSetores.value
    return todosSetores.value.filter((s) => empresasSelecionadas.value.includes(s.id_empresa))
  }
  const empresaId = usuarioLogado.value?.id_empresa || usuarioLogado.value?.empresas_ids?.[0]
  return todosSetores.value.filter((s) => s.id_empresa === empresaId)
})

function gerarSenhaAleatoria() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%*'
  let pass = ''
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  senha.value = pass
  mostrarSenha.value = true
}

function alternarSetor(idSetor) {
  const idx = setoresSelecionados.value.indexOf(idSetor)
  if (idx !== -1) {
    setoresSelecionados.value.splice(idx, 1)
  } else {
    setoresSelecionados.value.push(idSetor)
  }
}

watch(
  () => [props.aberto, props.usuarioParaEditar],
  ([estaAberto, usuario]) => {
    if (estaAberto) {
      erro.value = ''
      mostrarSenha.value = false

      if (usuario) {
        nome.value = usuario.nome || ''
        login.value = usuario.login || ''
        cargo.value = usuario.cargo || ''
        perfil.value = usuario.perfil || 'USUARIO'
        status.value = usuario.status || 'ATIVO'
        senha.value = ''

        // Empresas vinculadas
        empresasSelecionadas.value = usuario.Empresas?.map((e) => e.id_empresa) || (usuario.id_empresa ? [usuario.id_empresa] : [])

        // Setores atribuídos
        setoresSelecionados.value = usuario.Setors?.map((s) => s.id_setor) || []
      } else {
        nome.value = ''
        login.value = ''
        cargo.value = ''
        status.value = 'ATIVO'
        perfil.value = ehAdminGeral.value ? 'USUARIO' : 'USUARIO'
        empresasSelecionadas.value = ehAdminGeral.value
          ? (todasEmpresas.value[0] ? [todasEmpresas.value[0].id_empresa] : [])
          : (usuarioLogado.value?.id_empresa ? [usuarioLogado.value.id_empresa] : [])
        setoresSelecionados.value = []
        gerarSenhaAleatoria()
      }
    }
  },
  { immediate: true },
)

async function aoSalvar() {
  if (!nome.value.trim()) {
    erro.value = 'Nome completo é obrigatório.'
    return
  }

  if (!login.value.trim()) {
    erro.value = 'Login é obrigatório.'
    return
  }

  if (!estaEditando.value && !senha.value.trim()) {
    erro.value = 'Senha é obrigatória para novos usuários.'
    return
  }

  carregando.value = true
  erro.value = ''

  try {
    const payload = {
      nome: nome.value.trim(),
      login: login.value.trim(),
      cargo: cargo.value.trim() || 'Técnico de Segurança',
      status: status.value,
      perfil: perfil.value,
      empresas_ids: empresasSelecionadas.value,
      id_empresa: empresasSelecionadas.value[0] || null,
      setores_ids: setoresSelecionados.value,
    }

    if (senha.value.trim()) {
      payload.senha = senha.value.trim()
    }

    if (estaEditando.value) {
      await store.dispatch('usuario/atualizarUsuario', {
        id_usuario: props.usuarioParaEditar.id_usuario,
        ...payload,
      })
      emit('salvo', 'Usuário atualizado com sucesso!')
    } else {
      await store.dispatch('usuario/criarUsuario', payload)
      emit('salvo', 'Usuário cadastrado com sucesso!')
    }

    await store.dispatch('usuario/listarUsuarios')
    emit('fechar')
  } catch (error) {
    erro.value = error.response?.data?.error || 'Erro ao salvar usuário.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <BaseModal :aberto="aberto" :titulo="tituloModal" @fechar="emit('fechar')">
    <form class="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1" @submit.prevent="aoSalvar">
      <BaseInput
        v-model="nome"
        label="Nome Completo *"
        placeholder="Ex: Carlos Eduardo Santos"
      />

      <BaseInput
        v-model="login"
        label="Login / E-mail *"
        placeholder="Ex: carlos.santos"
        :disabled="estaEditando"
      />

      <BaseInput
        v-model="cargo"
        label="Cargo / Função Técnica"
        placeholder="Ex: Técnico de Segurança do Trabalho"
      />

      <!-- Campo de Senha -->
      <div>
        <label class="block text-caption font-medium text-text-2 mb-1.5">
          {{ estaEditando ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso *' }}
        </label>
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <input
              :value="senha"
              @input="senha = $event.target.value"
              :type="mostrarSenha ? 'text' : 'password'"
              placeholder="Digite ou gere uma senha"
              class="w-full h-11 pl-3 pr-9 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors"
            />
            <button
              type="button"
              @click="mostrarSenha = !mostrarSenha"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 cursor-pointer"
            >
              <component :is="mostrarSenha ? EyeOff : Eye" class="w-4 h-4" />
            </button>
          </div>
          <BaseButton
            type="button"
            variant="secondary"
            @click="gerarSenhaAleatoria"
            class="shrink-0"
            title="Gerar senha aleatória"
          >
            <span class="flex items-center gap-1.5">
              <RefreshCw class="w-4 h-4" />
              <span>Gerar</span>
            </span>
          </BaseButton>
        </div>
      </div>

      <!-- Campos Exclusivos de ADMIN (Perfil e Empresas) -->
      <div v-if="ehAdminGeral" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-caption font-medium text-text-2 mb-1.5">
            Perfil de Acesso
          </label>
          <select
            v-model="perfil"
            class="w-full h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
          >
            <option value="USUARIO">USUÁRIO (Técnico Setorial)</option>
            <option value="ADM_EMPRESA">ADM EMPRESA (Gestor)</option>
            <option value="ADMIN">ADMIN (Geral do Sistema)</option>
          </select>
        </div>

        <div>
          <label class="block text-caption font-medium text-text-2 mb-1.5">
            Empresa Principal
          </label>
          <select
            v-model="empresasSelecionadas[0]"
            class="w-full h-11 px-3 rounded-md bg-bg-2 border border-transparent text-body text-text-0 focus:border-accent focus:bg-bg-0 outline-none transition-colors cursor-pointer"
          >
            <option
              v-for="emp in todasEmpresas"
              :key="emp.id_empresa"
              :value="emp.id_empresa"
            >
              {{ emp.nome }}
            </option>
          </select>
        </div>
      </div>

      <!-- Status do Usuário (Ativo / Inativo) -->
      <div>
        <label class="block text-caption font-medium text-text-2 mb-1.5">
          Status da Conta
        </label>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 cursor-pointer text-body">
            <input
              type="radio"
              v-model="status"
              value="ATIVO"
              class="accent-accent"
            />
            <span class="text-success font-medium">Ativo</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-body">
            <input
              type="radio"
              v-model="status"
              value="INATIVO"
              class="accent-accent"
            />
            <span class="text-text-3">Inativo (Acesso bloqueado)</span>
          </label>
        </div>
      </div>

      <!-- Setores Atribuídos (para sub-usuários) -->
      <div v-if="perfil === 'USUARIO'" class="border-t border-border-soft pt-3">
        <label class="block text-caption font-semibold text-text-1 mb-1.5">
          Setores Atribuídos (Permissão de Acesso e Gestão)
        </label>
        <p class="text-caption text-text-3 mb-2.5">
          Selecione quais setores este técnico poderá visualizar, parametrizar e auditar:
        </p>

        <div v-if="setoresDisponiveis.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
          <div
            v-for="setor in setoresDisponiveis"
            :key="setor.id_setor"
            @click="alternarSetor(setor.id_setor)"
            class="flex items-center gap-2.5 p-2.5 rounded-md border text-caption transition-colors cursor-pointer select-none"
            :class="[
              setoresSelecionados.includes(setor.id_setor)
                ? 'bg-accent/10 border-accent text-text-0 font-medium'
                : 'bg-bg-1 border-border text-text-2 hover:bg-bg-2'
            ]"
          >
            <input
              type="checkbox"
              :checked="setoresSelecionados.includes(setor.id_setor)"
              @click.stop="alternarSetor(setor.id_setor)"
              class="accent-accent cursor-pointer rounded-sm"
            />
            <span class="truncate">{{ setor.nome_setor || setor.nome }}</span>
          </div>
        </div>
        <p v-else class="text-caption text-text-3 italic">
          Nenhum setor disponível cadastrado na empresa.
        </p>
      </div>

      <p v-if="erro" class="text-caption text-danger">{{ erro }}</p>

      <div class="flex justify-end gap-3 mt-3 pt-3 border-t border-border-soft">
        <BaseButton type="button" variant="secondary" @click="emit('fechar')">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" :disabled="carregando">
          {{ carregando ? 'Salvando...' : estaEditando ? 'Salvar Alterações' : 'Cadastrar Usuário' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

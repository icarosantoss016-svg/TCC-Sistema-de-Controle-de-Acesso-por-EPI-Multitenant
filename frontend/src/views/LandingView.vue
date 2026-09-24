<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import {
  LogIn,
  ArrowRight,
  ShieldCheck,
  HardHat,
  AlertTriangle,
  FileText,
  Users,
  EyeOff,
  CheckCircle2,
  XCircle,
  Cpu,
  Building2,
  Camera,
  Activity,
  Lock,
  Check,
  Database,
  Monitor,
  Menu,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const store = useStore()

const menuMobileAberto = ref(false)

const usuarioLogado = computed(() => {
  return store?.state?.auth?.usuario || JSON.parse(localStorage.getItem('usuario') || 'null')
})

function irParaLogin() {
  if (usuarioLogado.value) {
    if (usuarioLogado.value.perfil === 'ADMIN') {
      router.push('/empresas')
    } else {
      router.push('/dashboard')
    }
  } else {
    router.push('/login')
  }
}

// Simulação em tempo real do fluxo de verificação (Câmera -> YOLO -> API -> Log)
const historicoExemplos = [
  { setor: 'Fundição A', items: 'Capacete ✓  Luvas ✓', status: 'PERMITIDO', permitido: true },
  { setor: 'Laboratório 2', items: 'Máscara ✗ (item ausente)', status: 'NEGADO', permitido: false },
  { setor: 'Usinagem 3', items: 'Óculos ✓  Luvas ✓', status: 'PERMITIDO', permitido: true },
  { setor: 'Fundição A', items: 'Capacete ✗ (item ausente)', status: 'NEGADO', permitido: false },
  { setor: 'Laboratório 2', items: 'Máscara ✓  Touca ✓', status: 'PERMITIDO', permitido: true },
  { setor: 'Usinagem 3', items: 'Óculos ✗ (item ausente)', status: 'NEGADO', permitido: false },
  { setor: 'Almoxarifado B', items: 'Botina ✓  Colete ✓', status: 'PERMITIDO', permitido: true },
  { setor: 'Cabine de Pintura', items: 'Respirador ✗ (item ausente)', status: 'NEGADO', permitido: false },
]

const logs = ref([])
let logIndex = 0
let logInterval = null

function gerarLog(indice) {
  const item = historicoExemplos[indice % historicoExemplos.length]
  const agora = new Date()
  return {
    ...item,
    id: Date.now() + Math.random(),
    hora: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  }
}

function adicionarNovoLog() {
  logs.value.unshift(gerarLog(logIndex))
  logIndex++
  if (logs.value.length > 5) {
    logs.value.pop()
  }
}

onMounted(() => {
  // Preenche os 3 primeiros registros
  logs.value = [gerarLog(0), gerarLog(1), gerarLog(2)]
  logIndex = 3

  const prefereReducaoMovimento =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!prefereReducaoMovimento) {
    logInterval = setInterval(adicionarNovoLog, 3200)
  }
})

onUnmounted(() => {
  if (logInterval) clearInterval(logInterval)
})

const equipe = [
  { iniciais: 'IS', nome: 'Ícaro da Silva Santos' },
  { iniciais: 'LC', nome: 'Lucas Souza Reis Cintra' },
  { iniciais: 'GL', nome: 'Guilherme Oliveira Lopes' },
  { iniciais: 'LM', nome: 'Lucas Mendes Varejão' },
  { iniciais: 'LC', nome: 'Luiz Henrique Moraes Cerqueira' },
]

const badgesStack = [
  'Node.js',
  'Express',
  'Sequelize',
  'SQLite',
  'PostgreSQL',
  'JWT',
  'bcrypt',
  'Python',
  'OpenCV',
  'YOLOv8/v9 (Ultralytics)',
  'Vue 3',
  'Vuex',
  'Tailwind CSS',
  'Vite',
]

const rotasApi = [
  { metodo: 'POST', rota: '/login', desc: 'Autenticação de usuários, retorna token JWT' },
  { metodo: 'POST', rota: '/api/acesso', desc: 'Recebe a detecção da câmera e valida o acesso por setor' },
  { metodo: 'GET', rota: '/api/relatorios/ranking-epis', desc: 'Ranking consolidado dos EPIs mais esquecidos' },
  { metodo: 'GET', rota: '/api/relatorios/ranking-setores', desc: 'Setores críticos com mais infrações detectadas' },
  { metodo: 'GET', rota: '/api/relatorios/ciclo', desc: 'Relatório por período com conformidade e ranking completo' },
]
</script>

<template>
  <div class="min-h-screen bg-bg-1 text-text-0 font-sans selection:bg-accent/20">
    <!-- Faixa zebrada industrial (Hazard Strip) -->
    <div class="h-2 w-full bg-[repeating-linear-gradient(135deg,#f5a623_0_16px,#1a1b1e_16px_32px)]"></div>

    <!-- Navegação Superior Fixa -->
    <header class="sticky top-0 z-40 bg-bg-0/95 backdrop-blur-md border-b border-border shadow-xs">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <!-- Logo e Identidade Visual -->
        <a href="#top" class="flex items-center gap-3 group text-decoration-none">
          <div
            class="w-9 h-9 rounded-md bg-accent flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 transition-transform group-hover:scale-105"
          >
            SZ
          </div>
          <div class="flex flex-col">
            <span class="text-body font-bold text-text-0 leading-tight">SafeZone</span>
            <span class="text-[11px] text-text-2 leading-tight">Controle Setorial de EPI</span>
          </div>
        </a>

        <!-- Links de Navegação Desktop -->
        <nav class="hidden md:flex items-center gap-6 text-body">
          <a href="#problema" class="text-text-2 hover:text-text-0 transition-colors">O problema</a>
          <a href="#como-funciona" class="text-text-2 hover:text-text-0 transition-colors">Como funciona</a>
          <a href="#funcionalidades" class="text-text-2 hover:text-text-0 transition-colors">Funcionalidades</a>
          <a href="#arquitetura" class="text-text-2 hover:text-text-0 transition-colors">Arquitetura</a>
          <a href="#equipe" class="text-text-2 hover:text-text-0 transition-colors">Equipe</a>
        </nav>

        <!-- Ação Principal: Botão que liga para a View de Login -->
        <div class="hidden sm:flex items-center gap-3">
          <button
            type="button"
            @click="irParaLogin"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover active:bg-accent-press text-white font-semibold text-body transition-colors cursor-pointer shadow-sm"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ usuarioLogado ? 'Ir para o Painel' : 'Acessar Sistema' }}</span>
          </button>
        </div>

        <!-- Menu Mobile Toggle -->
        <button
          type="button"
          @click="menuMobileAberto = !menuMobileAberto"
          class="md:hidden p-2 rounded-md text-text-2 hover:text-text-0 hover:bg-bg-2 cursor-pointer transition-colors"
          aria-label="Abrir menu"
        >
          <Menu v-if="!menuMobileAberto" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>
      </div>

      <!-- Menu Dropdown Mobile -->
      <div
        v-if="menuMobileAberto"
        class="md:hidden border-t border-border bg-bg-0 px-4 py-4 space-y-3 shadow-lg"
      >
        <a
          href="#problema"
          @click="menuMobileAberto = false"
          class="block py-2 text-text-2 hover:text-text-0 text-body"
        >
          O problema
        </a>
        <a
          href="#como-funciona"
          @click="menuMobileAberto = false"
          class="block py-2 text-text-2 hover:text-text-0 text-body"
        >
          Como funciona
        </a>
        <a
          href="#funcionalidades"
          @click="menuMobileAberto = false"
          class="block py-2 text-text-2 hover:text-text-0 text-body"
        >
          Funcionalidades
        </a>
        <a
          href="#arquitetura"
          @click="menuMobileAberto = false"
          class="block py-2 text-text-2 hover:text-text-0 text-body"
        >
          Arquitetura
        </a>
        <a
          href="#equipe"
          @click="menuMobileAberto = false"
          class="block py-2 text-text-2 hover:text-text-0 text-body"
        >
          Equipe
        </a>
        <div class="pt-2 border-t border-border-soft">
          <button
            type="button"
            @click="irParaLogin"
            class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-accent text-white font-semibold text-body cursor-pointer"
          >
            <LogIn class="w-4 h-4" />
            <span>{{ usuarioLogado ? 'Ir para o Painel' : 'Acessar Sistema' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main id="top">
      <!-- HERO SECTION -->
      <section class="py-14 md:py-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <!-- Coluna de Texto e CTAs -->
            <div class="lg:col-span-7">
              <!-- Pill Status -->
              <div
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-bg-0 text-text-2 text-caption mb-6 shadow-xs"
              >
                <span class="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0"></span>
                <span>TCC em andamento — Desenvolvimento de Sistemas, SENAI Bahia</span>
              </div>

              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-text-0 tracking-tight leading-none mb-4">
                SafeZone
              </h1>

              <p class="text-xl sm:text-2xl font-semibold text-text-0 mb-4">
                A catraca só abre se o EPI certo estiver no corpo certo.
              </p>

              <p class="text-body text-text-2 max-w-xl mb-8 leading-relaxed">
                Sistema de controle de acesso industrial multitenant que usa visão computacional para verificar,
                em cada setor, se o colaborador está com os equipamentos de proteção obrigatórios — sem depender
                de um fiscal presente 24 horas por dia.
              </p>

              <!-- Botões de Ação Hero: Botão repositório alterado para view de login -->
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  @click="irParaLogin"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-accent hover:bg-accent-hover active:bg-accent-press text-white font-semibold text-body transition-colors cursor-pointer shadow-sm"
                >
                  <LogIn class="w-4 h-4" />
                  <span>{{ usuarioLogado ? 'Ir para o Painel' : 'Acessar Sistema' }}</span>
                  <ArrowRight class="w-4 h-4 ml-1" />
                </button>

                <a
                  href="#como-funciona"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md border border-border bg-bg-0 hover:bg-bg-2 text-text-1 font-semibold text-body transition-colors shadow-xs"
                >
                  Como funciona
                </a>
              </div>
            </div>

            <!-- Coluna Visual: Console Terminal de Logs ao Vivo -->
            <div class="lg:col-span-5">
              <div class="rounded-lg border border-border overflow-hidden bg-[#0c1116] shadow-xl">
                <!-- Cabeçalho do Terminal -->
                <div class="flex items-center justify-between px-4 py-3 bg-[#161f26] border-b border-[#24313d]">
                  <div class="flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#e5484d]/80 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#f5a623]/80 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-[#1fa24a]/80 inline-block"></span>
                  </div>
                  <span class="font-mono text-caption text-[#8ca0b3] flex items-center gap-1.5">
                    <Activity class="w-3.5 h-3.5 text-accent" />
                    log_acesso — simulação em tempo real
                  </span>
                </div>

                <!-- Corpo do Terminal com Log Animado -->
                <div class="p-4 font-mono text-xs space-y-2.5 min-h-[280px] flex flex-col justify-start bg-[#080d11]">
                  <div
                    v-for="log in logs"
                    :key="log.id"
                    class="p-2.5 rounded border border-[#212c38] bg-[#0f161d] flex flex-col gap-1 transition-all duration-300"
                  >
                    <div class="flex items-center justify-between text-[#8ca0b3] text-[11px]">
                      <span>SETOR: {{ log.setor }}</span>
                      <span>{{ log.hora }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-0.5">
                      <span class="text-[#e2e8f0] truncate">{{ log.items }}</span>
                      <span
                        class="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shrink-0"
                        :class="
                          log.permitido
                            ? 'bg-[#1fa24a]/20 text-[#34c77b] border border-[#1fa24a]/30'
                            : 'bg-[#e5484d]/20 text-[#ff6b6b] border border-[#e5484d]/30'
                        "
                      >
                        → {{ log.status }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Rodapé da Simulação -->
                <div class="px-4 py-2.5 bg-[#121920] border-t border-[#24313d] text-[11px] text-[#8ca0b3] flex items-center gap-2">
                  <Camera class="w-3.5 h-3.5 text-accent" />
                  <span>Fluxo contínuo: câmera física → YOLO (best.pt) → API → auditoria.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- DIFERENCIAL BANNER (Privacidade & LGPD) -->
      <section class="py-12 bg-bg-0 border-y border-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="border-l-4 border-accent bg-bg-1 rounded-r-lg p-6 sm:p-8 border-y border-r border-border shadow-xs">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div class="md:col-span-5">
                <span class="text-caption font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck class="w-4 h-4" />
                  Diferencial Técnico
                </span>
                <h2 class="text-2xl sm:text-3xl font-bold text-text-0 mt-1 mb-3">
                  Sem streaming. Sem fotos guardadas.
                </h2>
                <p class="text-body text-text-2 leading-relaxed">
                  A maioria das soluções de CFTV com IA transmite vídeo contínuo para a interface e armazena
                  imagens dos colaboradores — o que encarece a infraestrutura e gera risco jurídico sob a LGPD.
                  O SafeZone segue outro caminho.
                </p>
              </div>

              <div class="md:col-span-7 space-y-3.5">
                <div class="flex items-start gap-3">
                  <div class="p-1 rounded-sm bg-accent/15 text-accent mt-0.5 shrink-0">
                    <Check class="w-4 h-4 font-bold" />
                  </div>
                  <p class="text-body text-text-1">
                    A câmera processa a detecção localmente e envia apenas <strong class="text-text-0">JSON leve</strong> para a API — sem transmissão contínua de vídeo para a nuvem.
                  </p>
                </div>

                <div class="flex items-start gap-3">
                  <div class="p-1 rounded-sm bg-accent/15 text-accent mt-0.5 shrink-0">
                    <EyeOff class="w-4 h-4 font-bold" />
                  </div>
                  <p class="text-body text-text-1">
                    Reincidências são identificadas por um <strong class="text-text-0">ID em hash anônimo</strong>, nunca por fotos ou filmagens arquivadas em servidor.
                  </p>
                </div>

                <div class="flex items-start gap-3">
                  <div class="p-1 rounded-sm bg-accent/15 text-accent mt-0.5 shrink-0">
                    <ShieldCheck class="w-4 h-4 font-bold" />
                  </div>
                  <p class="text-body text-text-1">
                    Resultado: baixíssimo consumo de largura de banda e total conformidade com a <strong class="text-text-0">LGPD</strong> desde a concepção do design.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: O PROBLEMA -->
      <section id="problema" class="py-16 md:py-20">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-12">
            <span class="text-caption font-semibold text-accent uppercase tracking-wider">Contexto de Mercado</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-0 mt-1 mb-4">
              Fiscalizar EPI a pé não escala
            </h2>
            <p class="text-body text-text-2 leading-relaxed">
              Em setores de risco — fundição, laboratórios químicos, usinagem — o controle de EPI ainda depende,
              na maioria das plantas industriais, de técnicos circulando ou de vigilantes na portaria.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs hover:border-text-3 transition-colors">
              <div class="w-10 h-10 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-4">
                <Users class="w-5 h-5" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Cobertura incompleta</h3>
              <p class="text-body text-text-2">
                Não é viável manter um fiscal em todos os pontos de acesso, 24 horas por dia. Falhas humanas,
                distração e fadiga abrem brechas críticas no controle.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs hover:border-text-3 transition-colors">
              <div class="w-10 h-10 rounded-md bg-danger/15 text-danger flex items-center justify-center mb-4">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Custo do acidente</h3>
              <p class="text-body text-text-2">
                Um acidente de trabalho gera indenizações cíveis, aumento do Seguro de Acidente de Trabalho (SAT),
                processos trabalhistas e paralisação imediata da linha de produção.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs hover:border-text-3 transition-colors">
              <div class="w-10 h-10 rounded-md bg-warning/15 text-warning flex items-center justify-center mb-4">
                <FileText class="w-5 h-5" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Risco regulatório (NR-6)</h3>
              <p class="text-body text-text-2">
                A Norma Regulamentadora NR-6 exige fornecimento e fiscalização do uso obrigatório de EPI.
                Inconsistências no controle expõem a empresa a severas multas e autuações.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: COMO FUNCIONA -->
      <section id="como-funciona" class="py-16 md:py-20 bg-bg-0 border-t border-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-12">
            <span class="text-caption font-semibold text-accent uppercase tracking-wider">Passo a Passo</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-0 mt-1 mb-4">
              Como funciona
            </h2>
            <p class="text-body text-text-2 leading-relaxed">
              Do frame capturado pela câmera até o relatório analítico na mesa do gestor de SST, em 5 etapas sincronizadas.
            </p>
          </div>

          <div class="divide-y divide-border border-y border-border">
            <div class="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
              <div class="sm:col-span-2 text-3xl font-black text-accent font-mono">01</div>
              <div class="sm:col-span-3 font-bold text-heading text-text-0">Captura</div>
              <div class="sm:col-span-7 text-body text-text-2">
                A câmera instalada no setor captura uma imagem quando o colaborador aciona o ponto de verificação na catraca.
              </div>
            </div>

            <div class="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
              <div class="sm:col-span-2 text-3xl font-black text-accent font-mono">02</div>
              <div class="sm:col-span-3 font-bold text-heading text-text-0">Detecção via IA</div>
              <div class="sm:col-span-7 text-body text-text-2">
                Um modelo YOLO treinado (<code class="px-1.5 py-0.5 rounded bg-bg-2 font-mono text-xs text-text-1">best.pt</code>) identifica em milissegundos quais EPIs aparecem na imagem — como capacete, óculos, luvas ou colete.
              </div>
            </div>

            <div class="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
              <div class="sm:col-span-2 text-3xl font-black text-accent font-mono">03</div>
              <div class="sm:col-span-3 font-bold text-heading text-text-0">Verificação de Regra</div>
              <div class="sm:col-span-7 text-body text-text-2">
                A API compara os itens detectados pelo algoritmo com a matriz de regras de EPI cadastradas especificamente para aquele setor daquela empresa.
              </div>
            </div>

            <div class="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
              <div class="sm:col-span-2 text-3xl font-black text-accent font-mono">04</div>
              <div class="sm:col-span-3 font-bold text-heading text-text-0 flex items-center gap-2">
                <span>Decisão e Log</span>
              </div>
              <div class="sm:col-span-7 text-body text-text-2 flex flex-col gap-1">
                <span>O acesso é registrado instantaneamente no banco de dados com os status:</span>
                <div class="flex flex-wrap items-center gap-3 mt-1">
                  <span class="inline-flex items-center gap-1 text-success font-semibold text-xs bg-success/10 px-2 py-0.5 rounded">
                    <CheckCircle2 class="w-3.5 h-3.5" /> PERMITIDO
                  </span>
                  <span class="inline-flex items-center gap-1 text-danger font-semibold text-xs bg-danger/10 px-2 py-0.5 rounded">
                    <XCircle class="w-3.5 h-3.5" /> NEGADO (com itens ausentes)
                  </span>
                </div>
              </div>
            </div>

            <div class="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-baseline">
              <div class="sm:col-span-2 text-3xl font-black text-accent font-mono">05</div>
              <div class="sm:col-span-3 font-bold text-heading text-text-0">Relatórios & Ação</div>
              <div class="sm:col-span-7 text-body text-text-2">
                Rankings dos EPIs mais esquecidos, setores com mais infrações e evolução da taxa de conformidade ficam disponíveis em tempo real no dashboard.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: FUNCIONALIDADES -->
      <section id="funcionalidades" class="py-16 md:py-20 border-t border-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-12">
            <span class="text-caption font-semibold text-accent uppercase tracking-wider">Recursos da Plataforma</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-0 mt-1 mb-4">
              O que o sistema faz
            </h2>
            <p class="text-body text-text-2 leading-relaxed">
              Um painel de gestão completo para quem responde pela segurança do trabalho — sem precisar monitorar telas de câmera o dia todo.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <Lock class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Autenticação & RBAC</h3>
              <p class="text-body text-text-2">
                Acesso seguro baseado em perfis (ADMIN, ADM_EMPRESA e USUARIO), restringindo alterações de regras e setores apenas a técnicos e gestores autorizados.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <HardHat class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Cadastro de EPIs por Setor</h3>
              <p class="text-body text-text-2">
                Cada setor define suas exigências específicas — capacete e luvas na fundição, máscara e touca no laboratório químico.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <Camera class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Setorização e Câmeras</h3>
              <p class="text-body text-text-2">
                Vínculo direto entre a câmera física instalada, o posto monitorado e as regras aplicáveis àquele ponto de triagem.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <Activity class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Dashboard Analítico</h3>
              <p class="text-body text-text-2">
                Auditoria de conformidade em tempo real, volume de tentativas, itens com maior taxa de esquecimento e gráficos operacionais.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <Building2 class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Arquitetura Multitenant</h3>
              <p class="text-body text-text-2">
                Suporte nativo a múltiplas empresas clientes na mesma base, com isolamento total de setores, usuários, regras e logs de auditoria.
              </p>
            </div>

            <div class="bg-bg-0 border border-border rounded-lg p-6 shadow-xs">
              <div class="w-9 h-9 rounded-md bg-accent/15 text-accent flex items-center justify-center mb-3">
                <Cpu class="w-4 h-4" />
              </div>
              <h3 class="text-heading font-bold text-text-0 mb-2">Integração Física</h3>
              <p class="text-body text-text-2">
                Comunicação com catracas, relés e fechaduras eletrônicas via microcontroladores (ESP32/Arduino) acionados na validação positiva.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: ARQUITETURA E STACK -->
      <section id="arquitetura" class="py-16 md:py-20 bg-bg-0 border-t border-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-12">
            <span class="text-caption font-semibold text-accent uppercase tracking-wider">Engenharia do Software</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-0 mt-1 mb-4">
              Arquitetura e stack
            </h2>
            <p class="text-body text-text-2 leading-relaxed">
              Arquitetura cliente-servidor desacoplada: o sensor de visão computacional opera como cliente independente da aplicação web.
            </p>
          </div>

          <!-- Diagrama de Arquitetura -->
          <div class="bg-bg-1 border border-border rounded-lg p-6 sm:p-8 overflow-x-auto shadow-xs">
            <div class="min-w-[620px] flex items-center justify-between gap-4">
              <!-- Nó Câmera -->
              <div class="flex-1 bg-bg-0 border border-border rounded-md p-4 text-center shadow-xs">
                <div class="flex items-center justify-center gap-2 mb-1 text-text-0 font-bold text-body">
                  <Camera class="w-4 h-4 text-accent" />
                  <span>Câmera / Sensor</span>
                </div>
                <span class="font-mono text-caption text-text-2">Python · OpenCV · YOLO</span>
              </div>

              <div class="text-accent font-bold text-lg">→</div>

              <!-- Nó API -->
              <div class="flex-1 bg-bg-0 border border-border rounded-md p-4 text-center shadow-xs">
                <div class="flex items-center justify-center gap-2 mb-1 text-text-0 font-bold text-body">
                  <Cpu class="w-4 h-4 text-accent" />
                  <span>API Backend</span>
                </div>
                <span class="font-mono text-caption text-text-2">Node.js · Express · Sequelize</span>
              </div>

              <div class="text-accent font-bold text-lg">→</div>

              <!-- Nó Banco -->
              <div class="flex-1 bg-bg-0 border border-border rounded-md p-4 text-center shadow-xs">
                <div class="flex items-center justify-center gap-2 mb-1 text-text-0 font-bold text-body">
                  <Database class="w-4 h-4 text-accent" />
                  <span>Banco de Dados</span>
                </div>
                <span class="font-mono text-caption text-text-2">SQLite (dev) / PostgreSQL</span>
              </div>
            </div>

            <!-- Ramificação para o Dashboard -->
            <div class="min-w-[620px] flex flex-col items-center my-3">
              <span class="text-accent font-bold text-lg rotate-90 leading-none">→</span>
            </div>

            <div class="min-w-[620px] flex justify-center">
              <div class="w-80 bg-bg-0 border border-accent/40 rounded-md p-4 text-center shadow-xs">
                <div class="flex items-center justify-center gap-2 mb-1 text-text-0 font-bold text-body">
                  <Monitor class="w-4 h-4 text-accent" />
                  <span>Dashboard Web</span>
                </div>
                <span class="font-mono text-caption text-text-2">Vue 3 · Vuex · Tailwind CSS</span>
              </div>
            </div>
          </div>

          <!-- Badges de Tecnologias -->
          <div class="flex flex-wrap gap-2 mt-8">
            <span
              v-for="badge in badgesStack"
              :key="badge"
              class="px-3 py-1 rounded-md border border-border bg-bg-1 font-mono text-xs text-text-1"
            >
              {{ badge }}
            </span>
          </div>

          <!-- Tabela de Rotas da API -->
          <div class="mt-8 border border-border rounded-lg overflow-x-auto bg-bg-0 shadow-xs">
            <table class="w-full min-w-[620px] text-left border-collapse text-body">
              <thead>
                <tr class="border-b border-border bg-bg-2/60 text-text-2 font-mono text-caption">
                  <th class="py-3 px-4 font-semibold">Método</th>
                  <th class="py-3 px-4 font-semibold">Rota</th>
                  <th class="py-3 px-4 font-semibold">Descrição</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-soft font-mono text-xs">
                <tr v-for="rota in rotasApi" :key="rota.rota" class="hover:bg-bg-1/80 transition-colors">
                  <td class="py-3 px-4 font-bold text-accent">{{ rota.metodo }}</td>
                  <td class="py-3 px-4 text-text-0 font-semibold">{{ rota.rota }}</td>
                  <td class="py-3 px-4 text-text-2 font-sans text-caption">{{ rota.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SEÇÃO: EQUIPE -->
      <section id="equipe" class="py-16 md:py-20 border-t border-border">
        <div class="max-w-6xl mx-auto px-4 sm:px-6">
          <div class="max-w-2xl mb-12">
            <span class="text-caption font-semibold text-accent uppercase tracking-wider">Desenvolvedores</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-text-0 mt-1 mb-4">
              Equipe do Projeto
            </h2>
            <p class="text-body text-text-2 leading-relaxed">
              Trabalho de Conclusão de Curso — Curso Técnico em Desenvolvimento de Sistemas, SENAI Bahia (Unidade Lauro de Freitas).
            </p>
          </div>

          <!-- Grid dos Integrantes -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="membro in equipe"
              :key="membro.nome"
              class="bg-bg-0 border border-border rounded-lg p-4 flex items-center gap-3.5 shadow-xs"
            >
              <div
                class="w-11 h-11 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center font-bold text-accent text-body shrink-0 font-mono"
              >
                {{ membro.iniciais }}
              </div>
              <div class="min-w-0">
                <span class="font-bold text-text-0 text-body block truncate">{{ membro.nome }}</span>
                <span class="text-caption text-text-3 block">Desenvolvedor</span>
              </div>
            </div>
          </div>

          <!-- Nota de Status do Projeto -->
          <div class="mt-8 p-5 border border-border rounded-lg bg-bg-0 text-text-2 text-body leading-relaxed shadow-xs">
            <p>
              <strong class="text-text-0">Status:</strong> Projeto com backend em Node.js funcional,
              inteligência computacional via Ultralytics YOLO treinada para EPIs industriais, e frontend reativo
              em Vue 3 estruturado na branch <code class="px-1.5 py-0.5 rounded bg-bg-2 font-mono text-xs text-text-1">frontend_vue</code>.
              Piloto orçado em aproximadamente R$ 49.300 para três setores operacionais com catracas inteligentes.
            </p>
          </div>
        </div>
      </section>
    </main>

    <!-- Rodapé -->
    <div class="h-2 w-full bg-[repeating-linear-gradient(135deg,#f5a623_0_16px,#1a1b1e_16px_32px)]"></div>
    <footer class="bg-bg-0 border-t border-border py-10">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-md bg-accent flex items-center justify-center text-white font-bold text-sm shadow-sm"
            >
              SZ
            </div>
            <div>
              <span class="font-bold text-text-0 text-body leading-none block">SafeZone</span>
              <span class="text-[11px] text-text-3">Controle Setorial de EPI</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-6 text-caption text-text-2">
            <!-- Botão/Link que liga para a view de login -->
            <button
              type="button"
              @click="irParaLogin"
              class="font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <LogIn class="w-3.5 h-3.5" />
              <span>{{ usuarioLogado ? 'Painel Administrativo' : 'Acessar Sistema' }}</span>
            </button>
            <a href="#problema" class="hover:text-text-0 transition-colors">O problema</a>
            <a href="#como-funciona" class="hover:text-text-0 transition-colors">Como funciona</a>
            <a href="#arquitetura" class="hover:text-text-0 transition-colors">Arquitetura</a>
            <a href="#equipe" class="hover:text-text-0 transition-colors">Equipe</a>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-border-soft text-center sm:text-left text-caption text-text-3">
          TCC — Curso de Desenvolvimento de Sistemas, SENAI Bahia (Lauro de Freitas). Página de apresentação e controle operacional da plataforma SafeZone.
        </div>
      </div>
    </footer>
  </div>
</template>

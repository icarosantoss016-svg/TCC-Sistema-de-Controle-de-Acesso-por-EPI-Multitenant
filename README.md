# Sistema de Controle de Acesso por EPI (Multitenant)

> Trabalho de Conclusão de Curso, Desenvolvimento de Sistemas, SENAI Bahia.

Sistema de controle de acesso a setores industriais e laboratoriais com base na detecção automática de Equipamentos de Proteção Individual (EPI), usando visão computacional (YOLO). O projeto é **multitenant**: cada empresa cliente define seu próprio ramo de atuação, seus próprios setores e quais EPIs são obrigatórios em cada um, permitindo que, por exemplo, uma indústria exija capacete e luvas, enquanto um laboratório exija máscara e touca, tudo na mesma plataforma.

## Como funciona

1. Uma câmera instalada num setor captura uma imagem quando acionada.
2. Um modelo YOLO treinado (`best.pt`) identifica quais EPIs estão presentes na imagem.
3. O resultado é enviado para a API, que compara os itens detectados com as regras de EPI cadastradas para aquele setor.
4. O acesso é registrado como **PERMITIDO** ou **NEGADO**, com o log de quais itens foram esquecidos.
5. O painel administrativo exibe em tempo real o histórico de acessos, a taxa de conformidade e os rankings de infrações por setor e por tipo de EPI.

## Arquitetura

```
┌──────────────────┐      POST /api/acesso      ┌──────────────────┐      REST API / JWT     ┌──────────────────┐
│  camera/         │ ─────────────────────────► │                  │ ◄────────────────────── │  frontend/       │
│  reconhecimento. │   {id_setor, id_empresa,   │   API (Node.js)  │                         │  Vue 3 + Vite    │
│  py              │    itens_detectados}       │   Express +      │                         │  Tailwind + Vuex │
│  YOLO + OpenCV   │                            │   Sequelize      │                         └──────────────────┘
└──────────────────┘                            │                  │
                                                │                  │
┌──────────────────┐     login + provisiona     │                  │
│ camera/          │ ─────────────────────────► │                  │
│ instaladorCamera.│   empresa/setor via CNPJ   └────────┬─────────┘
│ py               │                                     │
└──────────────────┘                                     ▼
                                                  ┌──────────────┐
                                                  │   SQLite     │
                                                  │  (dev/local) │
                                                  └──────────────┘
```

## Tecnologias

**Backend**
- Node.js + Express
- Sequelize (ORM) + SQLite
- JWT (`jsonwebtoken`) para autenticação
- `bcrypt` para hash de senha
- CORS para integração com o frontend

**Frontend**
- Vue 3 (Composition API)
- Vite
- Vue Router (com navigation guards para controle RBAC)
- Vuex (gerenciamento centralizado de estado)
- Axios (com interceptors para injeção de token e tratamento de sessão)
- Tailwind CSS
- Lucide Icons (`lucide-vue-next`)

**Detecção (câmeras)**
- Python
- Ultralytics YOLO
- OpenCV
- `requests` (comunicação HTTP com a API)

## Estrutura do projeto

```
├── backend/
│   ├── config/
│   │   └── database.js          # conexão Sequelize com o SQLite
│   ├── models/                  # Empresa, Setor, Usuario, RegraEpi, LogAcesso, etc.
│   │   └── index.js             # associações entre os models
│   ├── controllers/             # regras de negócio de cada entidade
│   ├── routers/                 # definição das rotas da API
│   ├── middleware/              # autenticação JWT e autorização RBAC
│   ├── package.json
│   └── server.js                # ponto de entrada da API
├── camera/
│   ├── reconhecimento.py        # script que roda na câmera (loop de detecção)
│   ├── instaladorCamera.py      # script de provisionamento de novos setores
│   ├── best.pt                  # modelo YOLO treinado (capacete, colete, luva)
│   ├── requirements.txt         # dependências Python do módulo
│   └── package.json             # automação de instalação via npm
├── frontend/
│   ├── src/
│   │   ├── components/          # componentes modulares (ui, layout, modais)
│   │   ├── views/               # telas (Dashboard, Empresas, Setores, Usuários, etc.)
│   │   ├── router/              # rotas e proteção por perfil de acesso
│   │   ├── store/               # módulos do Vuex (auth, relatorios, setores, etc.)
│   │   └── service/             # cliente Axios configurado
│   ├── package.json
│   └── vite.config.js           # configuração do Vite
├── .gitignore
└── README.md
```

## Modelo de dados (resumo)

- **Empresa**: `nome`, `cnpj`, `ramo`
- **Setor**: pertence a uma Empresa, agrupa os postos de monitoramento
- **RegraEpi**: define, por setor, quais EPIs são obrigatórios (`nome_Epi`, nome técnico usado na comparação com a detecção, e `nome_exibicao`, nome amigável para relatórios)
- **Usuario**: possui `nome`, `cargo`, `login`, `senha`, `status` (`ATIVO`/`INATIVO`), `perfil` (`ADMIN`, `ADM_EMPRESA`, `USUARIO`) e vínculo com Empresa
- **UsuarioSetor**: tabela de associação N:N entre usuários técnicos e os setores autorizados
- **UsuarioEmpresa**: tabela de associação N:N entre gestores e empresas autorizadas
- **SolicitacaoAcesso**: registro de pedidos de cadastro externo para moderação do administrador
- **LogAcesso**: histórico de cada verificação de acesso, com status (`PERMITIDO`/`NEGADO`) e itens esquecidos

## Como rodar

### 1. Backend

```bash
cd backend
npm install
node server.js
```

O servidor sobe em `http://localhost:3000` e sincroniza automaticamente o banco SQLite na primeira execução, criando uma empresa e um usuário administrador padrão (`admin` / `admin123`).

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação web estará disponível no endereço indicado pelo Vite (normalmente `http://localhost:5173`).

### 3. Provisionar uma câmera nova

No terminal do módulo de câmera:

```bash
cd camera
npm install
npm run provisionar
```

*(Ou utilize diretamente `pip install -r requirements.txt` e `python instaladorCamera.py`)*

O assistente solicita login de administrador, o CNPJ da empresa cliente e o nome do novo setor, registrando o posto na API e fornecendo o comando para iniciar a captura.

### 4. Rodar o reconhecimento numa câmera provisionada

```bash
cd camera
python reconhecimento.py --setor <id_setor> --empresa <id_empresa>
```

Pressione `s` no terminal para capturar o frame da câmera e processar o acesso ou `n` para encerrar.

## Endpoints da API

Todas as rotas abaixo, exceto `/login`, `/api/acesso` e solicitações públicas, exigem o cabeçalho `Authorization: Bearer <token>`.

### Autenticação e acesso

| Método | Rota | Descrição |
|---|---|---|
| POST | `/login` | Autenticação, retorna token JWT e dados do usuário |
| POST | `/api/acesso` | Recebe detecção da câmera e verifica o acesso |

### Empresas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/criarEmpresa` | Cadastra uma empresa |
| GET | `/api/listaEmpresa` | Lista todas as empresas |
| GET | `/api/buscarEmpresa/:id` | Busca uma empresa pelo ID |
| GET | `/api/empresa/cnpj/:cnpj` | Busca uma empresa pelo CNPJ |
| PUT | `/api/atualizarEmpresa/:id` | Atualiza uma empresa |
| DELETE | `/api/deletarEmpresa/:id` | Remove uma empresa |

### Setores

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/criarSetor` | Cadastra um setor vinculado a uma empresa |
| GET | `/api/listarSetor` | Lista setores respeitando o escopo do usuário |
| GET | `/api/buscarSetor/:id` | Busca um setor pelo ID |
| PUT | `/api/atualizarSetor/:id` | Atualiza os dados de um setor |
| DELETE | `/api/deletarSetor/:id` | Remove um setor |

### Regras de EPI

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/criarRegra` | Cadastra uma regra de EPI para um setor |
| GET | `/api/listarRegra` | Lista todas as regras de EPI |
| GET | `/api/buscarRegra/:id` | Busca uma regra pelo ID |
| PUT | `/api/atulaizarRegra/:id` | Atualiza uma regra de EPI |
| DELETE | `/api/deletarRegra/:id` | Remove uma regra de EPI |

### Usuários

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/criarusuario` | Cadastra um usuário |
| GET | `/api/listaUsuario` | Lista usuários respeitando o escopo da empresa |
| GET | `/api/buscarUsuario/:id` | Busca um usuário pelo ID |
| PUT | `/api/atualizarUsuario/:id` | Atualiza os dados cadastrais de um usuário |
| PUT | `/api/atualizarSenha/:id` | Atualiza a senha de um usuário |
| DELETE | `/api/deletarUsuario/:id` | Remove um usuário |

### Relatórios e Dashboard

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/relatorios/geral` | Logs de acesso com filtros de status e setor |
| GET | `/api/relatorios/ranking-epis` | Ranking dos EPIs mais esquecidos |
| GET | `/api/relatorios/ranking-setores` | Ranking dos setores com mais infrações |
| GET | `/api/relatorios/ciclo` | Relatório consolidado por período |

### Solicitações de Acesso

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/solicitacoes` | Envia solicitação de acesso pública |
| GET | `/api/solicitacoes` | Lista solicitações para moderação do administrador |
| PUT | `/api/solicitacoes/:id/aprovar` | Aprova solicitação e cria o usuário no sistema |
| PUT | `/api/solicitacoes/:id/negar` | Rejeita uma solicitação de acesso |
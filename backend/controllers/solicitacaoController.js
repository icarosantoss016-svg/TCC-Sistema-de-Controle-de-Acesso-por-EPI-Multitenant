const { SolicitacaoAcesso, Usuario, Empresa } = require('../models')
const bcrypt = require('bcrypt')

exports.criarSolicitacao = async (req, res) => {
  try {
    const { nome, login, email, cargo, senha } = req.body

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ error: 'Nome completo é obrigatório.' })
    }

    if (!login || typeof login !== 'string' || !login.trim()) {
      return res.status(400).json({ error: 'Login/E-mail de acesso é obrigatório.' })
    }

    if (!senha || typeof senha !== 'string' || senha.trim().length < 4) {
      return res.status(400).json({ error: 'Senha deve ter no mínimo 4 caracteres.' })
    }

    // Verifica se login já existe em Usuario ou em Solicitação pendente
    const usuarioExistente = await Usuario.findOne({ where: { login: login.trim() } })
    if (usuarioExistente) {
      return res.status(409).json({ error: 'Este login já está cadastrado no sistema.' })
    }

    const solicitacaoPendente = await SolicitacaoAcesso.findOne({
      where: { login: login.trim(), status: 'PENDENTE' },
    })
    if (solicitacaoPendente) {
      return res.status(409).json({ error: 'Já existe uma solicitação pendente para este login.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha.trim(), salt)

    const novaSolicitacao = await SolicitacaoAcesso.create({
      nome: nome.trim(),
      login: login.trim(),
      email: email ? email.trim() : login.trim(),
      cargo: cargo ? cargo.trim() : 'Gestor de Segurança',
      senha: senhaCriptografada,
      status: 'PENDENTE',
    })

    return res.status(201).json({
      mensagem: 'Solicitação de acesso enviada com sucesso! Aguarde aprovação do administrador.',
      id: novaSolicitacao.id_solicitacao,
    })
  } catch (error) {
    console.error('Erro ao criar solicitação de acesso:', error)
    return res.status(500).json({ error: 'Erro interno ao criar solicitação de acesso.' })
  }
}

exports.listarSolicitacoes = async (req, res) => {
  try {
    const { status } = req.query
    const filtro = {}

    if (status && ['PENDENTE', 'APROVADA', 'NEGADA'].includes(status.toUpperCase())) {
      filtro.status = status.toUpperCase()
    }

    const solicitacoes = await SolicitacaoAcesso.findAll({
      where: filtro,
      attributes: { exclude: ['senha'] },
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json(solicitacoes)
  } catch (error) {
    console.error('Erro ao listar solicitações:', error)
    return res.status(500).json({ error: 'Erro interno ao listar solicitações.' })
  }
}

exports.aprovarSolicitacao = async (req, res) => {
  try {
    const { id } = req.params
    const { empresas_ids } = req.body

    const solicitacao = await SolicitacaoAcesso.findByPk(id)
    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' })
    }

    if (solicitacao.status !== 'PENDENTE') {
      return res.status(400).json({ error: `Esta solicitação já foi ${solicitacao.status.toLowerCase()}.` })
    }

    const empresasArray = Array.isArray(empresas_ids) && empresas_ids.length > 0 ? empresas_ids : []
    const empresaPrincipal = empresasArray[0] || null

    // Cria o usuário oficial com perfil ADM_EMPRESA
    const novoUsuario = await Usuario.create({
      login: solicitacao.login,
      nome: solicitacao.nome,
      cargo: solicitacao.cargo || 'Gestor de Segurança',
      senha: solicitacao.senha,
      perfil: 'ADM_EMPRESA',
      status: 'ATIVO',
      id_empresa: empresaPrincipal,
    })

    // Vincula a(s) empresa(s) selecionada(s)
    if (empresasArray.length > 0) {
      await novoUsuario.setEmpresas(empresasArray)
    }

    await solicitacao.update({ status: 'APROVADA' })

    return res.status(200).json({
      mensagem: `Solicitação aprovada! Usuário ${solicitacao.nome} criado como ADM_EMPRESA.`,
      usuario: novoUsuario,
    })
  } catch (error) {
    console.error('Erro ao aprovar solicitação:', error)
    return res.status(500).json({ error: 'Erro interno ao aprovar solicitação.' })
  }
}

exports.negarSolicitacao = async (req, res) => {
  try {
    const { id } = req.params
    const { motivo } = req.body

    const solicitacao = await SolicitacaoAcesso.findByPk(id)
    if (!solicitacao) {
      return res.status(404).json({ error: 'Solicitação não encontrada.' })
    }

    await solicitacao.update({
      status: 'NEGADA',
      motivo_resposta: motivo || null,
    })

    return res.status(200).json({ mensagem: 'Solicitação de acesso negada com sucesso.' })
  } catch (error) {
    console.error('Erro ao negar solicitação:', error)
    return res.status(500).json({ error: 'Erro interno ao negar solicitação.' })
  }
}

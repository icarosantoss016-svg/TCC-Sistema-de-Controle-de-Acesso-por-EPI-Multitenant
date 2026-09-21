const { Usuario, Empresa, Setor, UsuarioSetor, UsuarioEmpresa } = require('../models')
const bcrypt = require('bcrypt')

exports.criarUsuario = async (req, res) => {
  try {
    const { login, senha, perfil, nome, cargo, status, id_empresa, empresas_ids, setores_ids } = req.body
    const usuarioLogado = req.usuario

    if (!login || typeof login !== 'string' || !login.trim()) {
      return res.status(400).json({ error: 'Login/E-mail é obrigatório.' })
    }

    if (!senha || typeof senha !== 'string' || !senha.trim()) {
      return res.status(400).json({ error: 'Senha é obrigatória.' })
    }

    let perfilFinal = (perfil || 'USUARIO').trim().toUpperCase()
    let empresaIdFinal = id_empresa

    // Regras de negócio por perfil de quem está criando:
    if (usuarioLogado?.perfil === 'ADM_EMPRESA') {
      // ADM_EMPRESA só pode criar sub-usuários do tipo USUARIO na sua própria empresa
      perfilFinal = 'USUARIO'
      empresaIdFinal = usuarioLogado.id_empresa || (usuarioLogado.empresas_ids && usuarioLogado.empresas_ids[0])
    }

    const perfisPermitidos = ['ADMIN', 'ADM_EMPRESA', 'USUARIO']
    if (!perfisPermitidos.includes(perfilFinal)) {
      return res.status(400).json({ error: `Perfil inválido. Use: ${perfisPermitidos.join(', ')}` })
    }

    if (!empresaIdFinal && perfilFinal !== 'ADMIN') {
      return res.status(400).json({ error: 'ID da empresa é obrigatório para este perfil.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    const novoUsuario = await Usuario.create({
      login: login.trim(),
      senha: senhaCriptografada,
      perfil: perfilFinal,
      nome: nome ? nome.trim() : login.trim(),
      cargo: cargo ? cargo.trim() : (perfilFinal === 'ADMIN' ? 'Administrador' : 'Técnico de Segurança'),
      status: status === 'INATIVO' ? 'INATIVO' : 'ATIVO',
      id_empresa: empresaIdFinal || null,
    })

    // Vincula a(s) empresa(s) na tabela N:N
    const empresasParaVincular = Array.isArray(empresas_ids) && empresas_ids.length > 0
      ? empresas_ids
      : (empresaIdFinal ? [empresaIdFinal] : [])

    if (empresasParaVincular.length > 0) {
      await novoUsuario.setEmpresas(empresasParaVincular)
    }

    // Vincula os setores atribuídos na tabela N:N
    if (Array.isArray(setores_ids) && setores_ids.length > 0) {
      await novoUsuario.setSetors(setores_ids)
    }

    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso.',
      id: novoUsuario.id_usuario,
      usuario: novoUsuario,
    })
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Este login já está em uso.' })
    }
    console.error('Erro ao criar usuário:', error)
    return res.status(500).json({ error: 'Erro interno ao criar usuário.' })
  }
}

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarioLogado = req.usuario
    const filtro = {}

    // Escopo de dados por perfil:
    if (usuarioLogado?.perfil === 'ADM_EMPRESA') {
      const empresasDoUsuario = usuarioLogado.empresas_ids?.length > 0
        ? usuarioLogado.empresas_ids
        : [usuarioLogado.id_empresa]
      filtro.id_empresa = empresasDoUsuario
    }

    const usuarios = await Usuario.findAll({
      where: filtro,
      attributes: { exclude: ['senha'] },
      include: [
        { model: Empresa, through: { attributes: [] }, attributes: ['id_empresa', 'nome', 'cnpj'] },
        { model: Setor, through: { attributes: [] }, attributes: ['id_setor', 'nome_setor'] },
      ],
      order: [['id_usuario', 'DESC']],
    })

    return res.status(200).json(usuarios)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' })
  }
}

exports.buscarUsuarioId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
      include: [
        { model: Empresa, through: { attributes: [] } },
        { model: Setor, through: { attributes: [] } },
      ],
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    return res.status(200).json(usuario)
  } catch (error) {
    console.error('Erro ao buscar o usuário:', error)
    return res.status(500).json({ error: 'Erro interno ao buscar usuário.' })
  }
}

exports.atualizarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id)

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    const { nome, cargo, status, perfil, id_empresa, empresas_ids, setores_ids, senha } = req.body
    const dadosAtualizacao = {}

    if (nome !== undefined) dadosAtualizacao.nome = nome.trim()
    if (cargo !== undefined) dadosAtualizacao.cargo = cargo.trim()
    if (status !== undefined) dadosAtualizacao.status = status
    if (perfil !== undefined && req.usuario?.perfil === 'ADMIN') dadosAtualizacao.perfil = perfil
    if (id_empresa !== undefined) dadosAtualizacao.id_empresa = id_empresa

    if (senha && typeof senha === 'string' && senha.trim().length >= 4) {
      const salt = await bcrypt.genSalt(10)
      dadosAtualizacao.senha = await bcrypt.hash(senha, salt)
    }

    await usuario.update(dadosAtualizacao)

    // Atualiza vínculos de empresas
    if (empresas_ids && Array.isArray(empresas_ids)) {
      await usuario.setEmpresas(empresas_ids)
    }

    // Atualiza vínculos de setores
    if (setores_ids && Array.isArray(setores_ids)) {
      await usuario.setSetors(setores_ids)
    }

    const usuarioAtualizado = await Usuario.findByPk(usuario.id_usuario, {
      attributes: { exclude: ['senha'] },
      include: [
        { model: Empresa, through: { attributes: [] } },
        { model: Setor, through: { attributes: [] } },
      ],
    })

    return res.status(200).json({
      mensagem: 'Usuário atualizado com sucesso.',
      usuario: usuarioAtualizado,
    })
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' })
  }
}

exports.atualizarSenha = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id)

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    const { senha } = req.body
    if (!senha || typeof senha !== 'string' || !senha.trim()) {
      return res.status(400).json({ error: 'Senha é obrigatória.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(senha, salt)

    await usuario.update({ senha: senhaCriptografada })

    return res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' })
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return res.status(500).json({ error: 'Erro interno ao atualizar senha.' })
  }
}

exports.deletarUsuario = async (req, res) => {
  try {
    const linhasDeletadas = await Usuario.destroy({
      where: { id_usuario: req.params.id },
    })

    if (linhasDeletadas === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    return res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' })
  } catch (error) {
    console.error('Erro ao deletar o usuário:', error)
    return res.status(500).json({ error: 'Erro interno ao deletar usuário.' })
  }
}

exports.criarAdminPadrao = async () => {
  try {
    const adminExiste = await Usuario.findOne({ where: { login: 'admin' } })

    if (!adminExiste) {
      const senhaHash = await bcrypt.hash('admin123', 10)

      await Usuario.create({
        login: 'admin',
        nome: 'Administrador Geral',
        cargo: 'Administrador do Sistema',
        senha: senhaHash,
        perfil: 'ADMIN',
        status: 'ATIVO',
        id_empresa: 1,
      })
      console.log('Usuário admin padrão criado (Login: admin / Senha: admin123)')
    }
  } catch (error) {
    console.error('Erro ao criar usuário padrão:', error)
  }
}
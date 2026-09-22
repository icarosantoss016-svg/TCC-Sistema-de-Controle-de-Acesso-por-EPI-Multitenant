const jwt = require('jsonwebtoken')
const { Usuario, UsuarioEmpresa, UsuarioSetor } = require('../models')
require('dotenv').config()
const bcrypt = require('bcrypt')
const SECRET = process.env.SECRET || 'segredo_foda'

exports.login = async (req, res) => {
  try {
    const { login, senha } = req.body

    if (!login || typeof login !== 'string' || !login.trim()) {
      return res.status(400).json({ error: 'Login e senha são obrigatórios.' })
    }

    if (!senha || typeof senha !== 'string' || !senha.trim()) {
      return res.status(400).json({ error: 'Senha é obrigatória.' })
    }

    const usuario = await Usuario.findOne({
      where: { login: login.trim() },
    })

    if (!usuario) {
      return res.status(401).json({ error: 'Login ou senha inválidos' })
    }

    if (usuario.status === 'INATIVO') {
      return res.status(403).json({ error: 'Conta de usuário inativa. Contate o administrador do sistema.' })
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha)

    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Login ou senha inválidos.' })
    }

    // Identifica empresas vinculadas (via N:N ou id_empresa legado)
    const vinculosEmpresa = await UsuarioEmpresa.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_empresa'],
    })
    const empresasIds = vinculosEmpresa.map((v) => v.id_empresa)

    if (usuario.id_empresa && !empresasIds.includes(usuario.id_empresa)) {
      empresasIds.push(usuario.id_empresa)
    }

    // Identifica setores atribuídos
    const vinculosSetor = await UsuarioSetor.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_setor'],
    })
    const setoresIds = vinculosSetor.map((v) => v.id_setor)

    const tokenPayload = {
      id: usuario.id_usuario,
      login: usuario.login,
      nome: usuario.nome || usuario.login,
      cargo: usuario.cargo || 'Usuário',
      perfil: usuario.perfil,
      id_empresa: usuario.id_empresa,
      empresas_ids: empresasIds,
      setores_ids: setoresIds,
    }

    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '8h' })

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        id_usuario: usuario.id_usuario,
        login: usuario.login,
        nome: usuario.nome || usuario.login,
        cargo: usuario.cargo || (usuario.perfil === 'ADMIN' ? 'Administrador' : 'Técnico'),
        perfil: usuario.perfil,
        status: usuario.status,
        id_empresa: usuario.id_empresa,
        empresas_ids: empresasIds,
        setores_ids: setoresIds,
      },
    })
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error)
    res.status(500).json({ error: 'Erro interno ao autenticar usuário' })
  }
}

exports.redefinirSenha = async (req, res) => {
  try {
    const { login, novaSenha } = req.body

    if (!login || typeof login !== 'string' || !login.trim()) {
      return res.status(400).json({ error: 'Login/E-mail de acesso é obrigatório.' })
    }

    if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.trim().length < 4) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 4 caracteres.' })
    }

    const usuario = await Usuario.findOne({
      where: { login: login.trim() },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário com este login não foi encontrado.' })
    }

    const salt = await bcrypt.genSalt(10)
    const senhaCriptografada = await bcrypt.hash(novaSenha.trim(), salt)

    await usuario.update({ senha: senhaCriptografada })

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    })
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return res.status(500).json({ error: 'Erro interno ao redefinir senha.' })
  }
}
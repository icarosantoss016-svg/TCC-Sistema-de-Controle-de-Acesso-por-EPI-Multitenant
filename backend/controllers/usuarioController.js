const { Op } = require('sequelize')
const { Usuario, Empresa, Setor, UsuarioSetor, UsuarioEmpresa } = require('../models')
const bcrypt = require('bcrypt')

function obterEmpresasDoUsuarioLogado(usuarioLogado) {
  if (!usuarioLogado) return []
  if (usuarioLogado.empresas_ids?.length > 0) {
    return usuarioLogado.empresas_ids.map(Number)
  }
  return usuarioLogado.id_empresa ? [Number(usuarioLogado.id_empresa)] : []
}

exports.criarUsuario = async (req, res) => {
  try {
    const { login, senha, perfil, nome, cargo, status, id_empresa, empresas_ids, setores_ids } = req.body
    const usuarioLogado = req.usuario
    const isAdmEmpresa = usuarioLogado?.perfil === 'ADM_EMPRESA'
    const empresasDoGestor = obterEmpresasDoUsuarioLogado(usuarioLogado)

    if (!login || typeof login !== 'string' || !login.trim()) {
      return res.status(400).json({ error: 'Login/E-mail é obrigatório.' })
    }

    if (!senha || typeof senha !== 'string' || !senha.trim()) {
      return res.status(400).json({ error: 'Senha é obrigatória.' })
    }

    let perfilFinal = (perfil || 'USUARIO').trim().toUpperCase()
    let empresaIdFinal = id_empresa

    // Regras de negócio por perfil de quem está criando:
    if (isAdmEmpresa) {
      perfilFinal = 'USUARIO'
      empresaIdFinal = id_empresa || empresasDoGestor[0]
      if (!empresasDoGestor.includes(Number(empresaIdFinal))) {
        return res.status(403).json({ error: 'Você só pode criar usuários para sua própria empresa.' })
      }
    }

    const perfisPermitidos = ['ADMIN', 'ADM_EMPRESA', 'USUARIO']
    if (!perfisPermitidos.includes(perfilFinal)) {
      return res.status(400).json({ error: `Perfil inválido. Use: ${perfisPermitidos.join(', ')}` })
    }

    if (!empresaIdFinal && perfilFinal !== 'ADMIN') {
      return res.status(400).json({ error: 'ID da empresa é obrigatório para este perfil.' })
    }

    // Vincula a(s) empresa(s) na tabela N:N
    let empresasParaVincular = Array.isArray(empresas_ids) && empresas_ids.length > 0
      ? empresas_ids.map(Number)
      : (empresaIdFinal ? [Number(empresaIdFinal)] : [])

    if (isAdmEmpresa) {
      const empresasInvalidas = empresasParaVincular.filter((id) => !empresasDoGestor.includes(id))
      if (empresasInvalidas.length > 0) {
        return res.status(403).json({ error: 'Você não tem permissão para vincular empresas que não gerencia.' })
      }
    }

    // Validação de setores atribuídos
    const setoresParaVincular = Array.isArray(setores_ids) && setores_ids.length > 0
      ? setores_ids.map(Number)
      : []

    if (isAdmEmpresa && setoresParaVincular.length > 0) {
      const setoresValidos = await Setor.findAll({
        where: {
          id_setor: setoresParaVincular,
          id_empresa: empresasDoGestor,
        },
        attributes: ['id_setor'],
      })
      if (setoresValidos.length !== setoresParaVincular.length) {
        return res.status(403).json({ error: 'Você só pode atribuir setores pertencentes à sua empresa.' })
      }
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

    if (empresasParaVincular.length > 0) {
      await UsuarioEmpresa.bulkCreate(
        empresasParaVincular.map((empId) => ({
          id_usuario: novoUsuario.id_usuario,
          id_empresa: Number(empId),
        }))
      )
    }

    if (setoresParaVincular.length > 0) {
      await UsuarioSetor.bulkCreate(
        setoresParaVincular.map((setorId) => ({
          id_usuario: novoUsuario.id_usuario,
          id_setor: Number(setorId),
        }))
      )
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
    const isAdmEmpresa = usuarioLogado?.perfil === 'ADM_EMPRESA'
    const empresasDoGestor = obterEmpresasDoUsuarioLogado(usuarioLogado)

    const filtro = {}
    if (isAdmEmpresa) {
      filtro.perfil = { [Op.ne]: 'ADMIN' }
    }

    const usuarios = await Usuario.findAll({
      where: filtro,
      attributes: { exclude: ['senha'] },
      order: [['id_usuario', 'DESC']],
    })

    const usuariosCompletos = await Promise.all(
      usuarios.map(async (u) => {
        const uJson = u.toJSON()

        // Empresas
        const vinculosEmpresa = await UsuarioEmpresa.findAll({
          where: { id_usuario: u.id_usuario },
          attributes: ['id_empresa'],
        })
        const empIds = vinculosEmpresa.map((v) => Number(v.id_empresa))
        if (u.id_empresa && !empIds.includes(Number(u.id_empresa))) {
          empIds.push(Number(u.id_empresa))
        }
        const empresas = empIds.length > 0
          ? await Empresa.findAll({ where: { id_empresa: empIds }, attributes: ['id_empresa', 'nome', 'cnpj'] })
          : []

        // Setores
        const vinculosSetor = await UsuarioSetor.findAll({
          where: { id_usuario: u.id_usuario },
          attributes: ['id_setor'],
        })
        const setorIds = vinculosSetor.map((v) => Number(v.id_setor))
        const setores = setorIds.length > 0
          ? await Setor.findAll({ where: { id_setor: setorIds }, attributes: ['id_setor', 'nome_setor', 'id_empresa'] })
          : []

        uJson.Empresas = empresas
        uJson.Setors = setores
        uJson.setores = setores
        return uJson
      })
    )

    // Se for ADM_EMPRESA, filtra apenas usuários pertencentes a pelo menos uma das empresas do gestor
    const resultado = isAdmEmpresa
      ? usuariosCompletos.filter((u) => {
          const userEmpIds = u.Empresas.map((e) => Number(e.id_empresa))
          if (u.id_empresa) userEmpIds.push(Number(u.id_empresa))
          return userEmpIds.some((id) => empresasDoGestor.includes(id))
        })
      : usuariosCompletos

    return res.status(200).json(resultado)
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return res.status(500).json({ error: 'Erro interno ao listar usuários.' })
  }
}

exports.buscarUsuarioId = async (req, res) => {
  try {
    const usuarioLogado = req.usuario
    const isAdmEmpresa = usuarioLogado?.perfil === 'ADM_EMPRESA'
    const empresasDoGestor = obterEmpresasDoUsuarioLogado(usuarioLogado)

    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] },
    })

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    if (isAdmEmpresa && usuario.perfil === 'ADMIN') {
      return res.status(403).json({ error: 'Acesso não autorizado a este usuário.' })
    }

    const uJson = usuario.toJSON()

    // Empresas
    const vinculosEmpresa = await UsuarioEmpresa.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_empresa'],
    })
    const empIds = vinculosEmpresa.map((v) => Number(v.id_empresa))
    if (usuario.id_empresa && !empIds.includes(Number(usuario.id_empresa))) {
      empIds.push(Number(usuario.id_empresa))
    }

    if (isAdmEmpresa && !empIds.some((id) => empresasDoGestor.includes(id))) {
      return res.status(403).json({ error: 'Acesso não autorizado a usuários de outras empresas.' })
    }

    const empresas = empIds.length > 0
      ? await Empresa.findAll({ where: { id_empresa: empIds }, attributes: ['id_empresa', 'nome', 'cnpj'] })
      : []

    // Setores
    const vinculosSetor = await UsuarioSetor.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_setor'],
    })
    const setorIds = vinculosSetor.map((v) => Number(v.id_setor))
    const setores = setorIds.length > 0
      ? await Setor.findAll({ where: { id_setor: setorIds }, attributes: ['id_setor', 'nome_setor', 'id_empresa'] })
      : []

    uJson.Empresas = empresas
    uJson.Setors = setores
    uJson.setores = setores

    return res.status(200).json(uJson)
  } catch (error) {
    console.error('Erro ao buscar o usuário:', error)
    return res.status(500).json({ error: 'Erro interno ao buscar usuário.' })
  }
}

exports.atualizarUsuario = async (req, res) => {
  try {
    const usuarioLogado = req.usuario
    const isAdmEmpresa = usuarioLogado?.perfil === 'ADM_EMPRESA'
    const empresasDoGestor = obterEmpresasDoUsuarioLogado(usuarioLogado)

    const usuario = await Usuario.findByPk(req.params.id)
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    if (isAdmEmpresa) {
      if (usuario.perfil === 'ADMIN') {
        return res.status(403).json({ error: 'Você não tem permissão para alterar administradores.' })
      }

      const vinculosExistentes = await UsuarioEmpresa.findAll({
        where: { id_usuario: usuario.id_usuario },
        attributes: ['id_empresa'],
      })
      const empIdsExistentes = vinculosExistentes.map((v) => Number(v.id_empresa))
      if (usuario.id_empresa) empIdsExistentes.push(Number(usuario.id_empresa))

      if (!empIdsExistentes.some((id) => empresasDoGestor.includes(id))) {
        return res.status(403).json({ error: 'Você não tem permissão para editar usuários de outras empresas.' })
      }
    }

    const { nome, cargo, status, perfil, id_empresa, empresas_ids, setores_ids } = req.body
    const dadosAtualizacao = {}

    if (nome !== undefined) dadosAtualizacao.nome = nome.trim()
    if (cargo !== undefined) dadosAtualizacao.cargo = cargo.trim()
    if (status !== undefined) dadosAtualizacao.status = status
    if (perfil !== undefined && usuarioLogado?.perfil === 'ADMIN') {
      dadosAtualizacao.perfil = perfil
    }

    if (id_empresa !== undefined) {
      if (isAdmEmpresa && !empresasDoGestor.includes(Number(id_empresa))) {
        return res.status(403).json({ error: 'Você só pode atribuir sua própria empresa.' })
      }
      dadosAtualizacao.id_empresa = id_empresa
    }

    await usuario.update(dadosAtualizacao)

    // Atualiza vínculos de empresas
    if (empresas_ids !== undefined && Array.isArray(empresas_ids)) {
      const empIdsNumeros = empresas_ids.map(Number)
      if (isAdmEmpresa) {
        const invalidas = empIdsNumeros.filter((id) => !empresasDoGestor.includes(id))
        if (invalidas.length > 0) {
          return res.status(403).json({ error: 'Você não pode atribuir empresas que não gerencia.' })
        }
      }

      await UsuarioEmpresa.destroy({ where: { id_usuario: usuario.id_usuario } })
      if (empIdsNumeros.length > 0) {
        await UsuarioEmpresa.bulkCreate(
          empIdsNumeros.map((empId) => ({
            id_usuario: usuario.id_usuario,
            id_empresa: empId,
          }))
        )
      }
    }

    // Atualiza vínculos de setores
    if (setores_ids !== undefined && Array.isArray(setores_ids)) {
      const setorIdsNumeros = setores_ids.map(Number)
      if (isAdmEmpresa && setorIdsNumeros.length > 0) {
        const setoresValidos = await Setor.findAll({
          where: {
            id_setor: setorIdsNumeros,
            id_empresa: empresasDoGestor,
          },
          attributes: ['id_setor'],
        })
        if (setoresValidos.length !== setorIdsNumeros.length) {
          return res.status(403).json({ error: 'Você só pode atribuir setores pertencentes à sua empresa.' })
        }
      }

      await UsuarioSetor.destroy({ where: { id_usuario: usuario.id_usuario } })
      if (setorIdsNumeros.length > 0) {
        await UsuarioSetor.bulkCreate(
          setorIdsNumeros.map((setorId) => ({
            id_usuario: usuario.id_usuario,
            id_setor: setorId,
          }))
        )
      }
    }

    const vinculosEmpresa = await UsuarioEmpresa.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_empresa'],
    })
    const empIds = vinculosEmpresa.map((v) => Number(v.id_empresa))
    const empresas = empIds.length > 0
      ? await Empresa.findAll({ where: { id_empresa: empIds }, attributes: ['id_empresa', 'nome', 'cnpj'] })
      : []

    const vinculosSetor = await UsuarioSetor.findAll({
      where: { id_usuario: usuario.id_usuario },
      attributes: ['id_setor'],
    })
    const setorIds = vinculosSetor.map((v) => Number(v.id_setor))
    const setores = setorIds.length > 0
      ? await Setor.findAll({ where: { id_setor: setorIds }, attributes: ['id_setor', 'nome_setor', 'id_empresa'] })
      : []

    const usuarioAtualizado = usuario.toJSON()
    delete usuarioAtualizado.senha
    usuarioAtualizado.Empresas = empresas
    usuarioAtualizado.Setors = setores
    usuarioAtualizado.setores = setores

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
    const senhaCriptografada = await bcrypt.hash(senha.trim(), salt)

    await usuario.update({ senha: senhaCriptografada })

    return res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' })
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return res.status(500).json({ error: 'Erro interno ao atualizar senha.' })
  }
}

exports.deletarUsuario = async (req, res) => {
  try {
    const usuarioLogado = req.usuario
    const isAdmEmpresa = usuarioLogado?.perfil === 'ADM_EMPRESA'
    const empresasDoGestor = obterEmpresasDoUsuarioLogado(usuarioLogado)

    const usuario = await Usuario.findByPk(req.params.id)
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' })
    }

    if (isAdmEmpresa) {
      if (usuario.perfil === 'ADMIN') {
        return res.status(403).json({ error: 'Você não pode excluir um administrador.' })
      }

      const vinculosExistentes = await UsuarioEmpresa.findAll({
        where: { id_usuario: usuario.id_usuario },
        attributes: ['id_empresa'],
      })
      const empIdsExistentes = vinculosExistentes.map((v) => Number(v.id_empresa))
      if (usuario.id_empresa) empIdsExistentes.push(Number(usuario.id_empresa))

      if (!empIdsExistentes.some((id) => empresasDoGestor.includes(id))) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir usuários de outras empresas.' })
      }
    }

    await UsuarioEmpresa.destroy({ where: { id_usuario: usuario.id_usuario } })
    await UsuarioSetor.destroy({ where: { id_usuario: usuario.id_usuario } })
    await usuario.destroy()

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
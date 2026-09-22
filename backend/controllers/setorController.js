const { Setor, Empresa, Usuario, UsuarioSetor, RegraEpi } = require('../models')

exports.criarSetor = async (req, res) => {
  try {
    const { nome_setor, id_empresa } = req.body
    const usuarioLogado = req.usuario

    if (!nome_setor || nome_setor.trim() === '') {
      return res.status(400).json({ error: 'Nome do setor é obrigatório.' })
    }

    let empresaIdFinal = id_empresa

    if (usuarioLogado?.perfil !== 'ADMIN') {
      const empresasPermitidas = usuarioLogado.empresas_ids?.length > 0
        ? usuarioLogado.empresas_ids.map(Number)
        : (usuarioLogado.id_empresa ? [Number(usuarioLogado.id_empresa)] : [])

      if (id_empresa && !empresasPermitidas.includes(Number(id_empresa))) {
        return res.status(403).json({ error: 'Você não tem permissão para criar setores nesta empresa.' })
      }
      empresaIdFinal = id_empresa ? Number(id_empresa) : empresasPermitidas[0]
    }

    if (!empresaIdFinal || isNaN(empresaIdFinal)) {
      return res.status(400).json({ error: 'ID da empresa é obrigatório e deve ser um número.' })
    }

    const empresa = await Empresa.findByPk(empresaIdFinal)
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não localizada através do ID.' })
    }

    const novoSetor = await Setor.create({
      nome_setor: nome_setor.trim(),
      id_empresa: empresa.id_empresa,
    })

    // Se quem criou foi um USUARIO, auto-atribui o setor a ele
    if (usuarioLogado?.id) {
      await UsuarioSetor.create({
        id_usuario: usuarioLogado.id,
        id_setor: novoSetor.id_setor,
      }).catch(() => {})
    }

    return res.status(201).json({
      mensagem: 'Setor criado com sucesso.',
      setor: novoSetor,
    })
  } catch (erro) {
    console.error('Erro ao criar setor:', erro)
    return res.status(500).json({ error: 'Erro interno ao criar setor.' })
  }
}

exports.listarSetor = async (req, res) => {
  try {
    const usuarioLogado = req.usuario
    const filtro = {}

    if (usuarioLogado?.perfil === 'ADM_EMPRESA') {
      const empresasIds = usuarioLogado.empresas_ids?.length > 0
        ? usuarioLogado.empresas_ids.map(Number)
        : (usuarioLogado.id_empresa ? [Number(usuarioLogado.id_empresa)] : [])
      filtro.id_empresa = empresasIds
    } else if (usuarioLogado?.perfil === 'USUARIO') {
      // Busca os IDs dos setores atribuídos
      const vinculos = await UsuarioSetor.findAll({
        where: { id_usuario: usuarioLogado.id },
        attributes: ['id_setor'],
      })
      const setoresPermitidos = vinculos.map((v) => v.id_setor)
      filtro.id_setor = setoresPermitidos
    }

    const setores = await Setor.findAll({
      where: filtro,
      include: [
        { model: Empresa, attributes: ['id_empresa', 'nome', 'cnpj'] },
        { model: RegraEpi },
      ],
      order: [['id_setor', 'ASC']],
    })

    res.status(200).json({ setor: setores })
  } catch (erro) {
    console.error('Erro ao listar setores:', erro)
    return res.status(500).json({ error: 'Erro interno ao listar os setores.' })
  }
}

exports.buscarSetor = async (req, res) => {
  try {
    const { id } = req.params
    const setor = await Setor.findByPk(id, {
      include: [
        { model: Empresa, attributes: ['id_empresa', 'nome', 'cnpj'] },
        { model: RegraEpi },
      ],
    })

    if (!setor) {
      return res.status(404).json({ error: 'Setor não encontrado.' })
    }
    return res.status(200).json(setor)
  } catch (erro) {
    console.error('Erro ao buscar o setor:', erro)
    return res.status(500).json({ error: 'Erro interno ao buscar o setor.' })
  }
}

exports.atualizarSetor = async (req, res) => {
  try {
    const setor = await Setor.findByPk(req.params.id)
    const { nome_setor, id_empresa } = req.body
    const usuarioLogado = req.usuario

    if (!setor) {
      return res.status(404).json({ error: 'Setor não localizado.' })
    }

    if (!nome_setor || nome_setor.trim() === '') {
      return res.status(400).json({ error: 'Nome do setor é obrigatório.' })
    }

    if (usuarioLogado?.perfil !== 'ADMIN') {
      const empresasPermitidas = usuarioLogado.empresas_ids?.length > 0
        ? usuarioLogado.empresas_ids.map(Number)
        : (usuarioLogado.id_empresa ? [Number(usuarioLogado.id_empresa)] : [])

      if (!empresasPermitidas.includes(Number(setor.id_empresa))) {
        return res.status(403).json({ error: 'Você não tem permissão para alterar setores desta empresa.' })
      }
    }

    const dados = { nome_setor: nome_setor.trim() }
    if (id_empresa && usuarioLogado?.perfil === 'ADMIN') {
      dados.id_empresa = id_empresa
    }

    await setor.update(dados)

    res.status(200).json({ mensagem: 'Setor atualizado com sucesso.', setor })
  } catch (erro) {
    console.error('Erro ao editar setor:', erro)
    return res.status(500).json({ error: 'Erro interno ao editar setor.' })
  }
}

exports.deletarSetor = async (req, res) => {
  try {
    const { id } = req.params
    const setor = await Setor.findByPk(id)
    const usuarioLogado = req.usuario

    if (!setor) {
      return res.status(404).json({ error: 'Setor não encontrado.' })
    }

    if (usuarioLogado?.perfil !== 'ADMIN') {
      const empresasPermitidas = usuarioLogado.empresas_ids?.length > 0
        ? usuarioLogado.empresas_ids.map(Number)
        : (usuarioLogado.id_empresa ? [Number(usuarioLogado.id_empresa)] : [])

      if (!empresasPermitidas.includes(Number(setor.id_empresa))) {
        return res.status(403).json({ error: 'Você não tem permissão para excluir setores desta empresa.' })
      }
    }

    await RegraEpi.destroy({ where: { id_setor: id } })
    await UsuarioSetor.destroy({ where: { id_setor: id } })
    await setor.destroy()

    res.status(200).json({ mensagem: 'Setor deletado com sucesso.' })
  } catch (erro) {
    console.error('Erro ao deletar setor:', erro)
    return res.status(500).json({ error: 'Erro interno ao deletar setor.' })
  }
}
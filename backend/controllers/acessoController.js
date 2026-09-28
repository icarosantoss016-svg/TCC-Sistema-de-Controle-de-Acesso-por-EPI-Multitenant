const Setor = require('../models/setor')
const RegraEpi = require ('../models/regraEpi')
const Empresa = require ('../models/empresa')
const LogAcesso = require('../models/logAcesso')

// Mapeamento de sinônimos e traduções de EPIs (Português <-> Inglês)
const SINONIMOS_EPIS = {
    capacete: ['capacete', 'helmet', 'hard hat', 'hardhat'],
    luvas: ['luvas', 'luva', 'glove', 'gloves'],
    colete: ['colete', 'vest', 'safety vest', 'reflective vest'],
    oculos: ['oculos', 'óculos', 'glasses', 'safety glasses', 'goggles'],
    protetor_auricular: ['protetor_auricular', 'protetor auricular', 'ear protection', 'earmuffs', 'earplugs'],
    mascara: ['mascara', 'máscara', 'mask', 'face mask'],
}

function normalizarTexto(texto) {
    if (!texto || typeof texto !== 'string') return ''
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-_]/g, ' ')
        .trim()
}

function verificarItemPresente(epiExigido, itensDetectados) {
    const exigidoLimpo = normalizarTexto(epiExigido)
    const detectadosLimpos = itensDetectados.map(normalizarTexto)

    for (const [chave, sinonimos] of Object.entries(SINONIMOS_EPIS)) {
        const listaSinonimos = [chave, ...sinonimos].map(normalizarTexto)
        if (listaSinonimos.some((s) => exigidoLimpo === s || exigidoLimpo.includes(s) || s.includes(exigidoLimpo))) {
            return detectadosLimpos.some((detectado) =>
                listaSinonimos.some((s) => detectado === s || detectado.includes(s) || s.includes(detectado))
            )
        }
    }

    return detectadosLimpos.some((detectado) =>
        detectado === exigidoLimpo || detectado.includes(exigidoLimpo) || exigidoLimpo.includes(detectado)
    )
}

exports.verificarAcesso = async (req, res) => {
    try {
        const { id_setor, id_empresa, itens_detectados } = req.body

        if (!id_setor || !id_empresa || !Array.isArray(itens_detectados)) {
            return res.status(400).json({ erro: 'Dados incompletos enviados pela câmera.' })
        }

        const setor = await Setor.findOne({
            where: { id_setor: id_setor },
            include: RegraEpi,
        })

        if (!setor) {
            return res.status(400).json({ erro: 'Setor não encontrado.' })
        }

        if (setor.id_empresa !== id_empresa) {
            console.warn(`Câmera do setor ${id_setor} informou empresa ${id_empresa}, mas o setor pertence à empresa ${setor.id_empresa}`)
            return res.status(400).json({ erro: 'Setor não pertence a empresa informada.' })
        }

        const regrasDoSetor = setor.RegraEpis || []
        let esquecidos = []

        for (const regra of regrasDoSetor) {
            const epiExigido = regra.nome_Epi || regra.nome_exibicao
            if (!verificarItemPresente(epiExigido, itens_detectados)) {
                esquecidos.push(regra.nome_exibicao || regra.nome_Epi)
            }
        }
        const status = esquecidos.length === 0 ? 'PERMITIDO' : 'NEGADO'

        await LogAcesso.create({
            id_setor: id_setor,
            status_acesso: status,
            itens_esquecidos: esquecidos
        })

        return res.status(200).json({
            mensagem: "Processado com sucesso",
            acesso: status,
            esquecidos: esquecidos
        })
    } catch (erro) {
        console.error("Erro no processamento:", erro);
        return res.status(500).json({ erro: "Erro interno do servidor" })

    }
}
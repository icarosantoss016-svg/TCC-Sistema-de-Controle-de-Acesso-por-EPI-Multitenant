const express = require('express')
const router = express.Router()
const solicitacaoController = require('../controllers/solicitacaoController')
const authMiddleware = require('../middleware/authMiddleware')
const authorizarPerfil = require('../middleware/authorizarPerfil')

// Rota pública para solicitação de cadastro
router.post('/api/solicitacoes', solicitacaoController.criarSolicitacao)

// Rotas administrativas (Apenas ADMIN)
router.get(
  '/api/solicitacoes',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  solicitacaoController.listarSolicitacoes,
)

router.put(
  '/api/solicitacoes/:id/aprovar',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  solicitacaoController.aprovarSolicitacao,
)

router.put(
  '/api/solicitacoes/:id/negar',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  solicitacaoController.negarSolicitacao,
)

module.exports = router

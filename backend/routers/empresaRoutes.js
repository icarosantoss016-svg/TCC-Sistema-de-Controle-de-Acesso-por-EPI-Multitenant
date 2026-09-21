const express = require('express')
const router = express.Router()
const empresaController = require('../controllers/empresaContoller')
const authMiddleware = require('../middleware/authMiddleware')
const authorizarPerfil = require('../middleware/authorizarPerfil')

router.get(
  '/api/buscarEmpresa/:id',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  empresaController.buscarEmpresasId,
)

router.get(
  '/api/listaEmpresa',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  empresaController.listarEmpresas,
)

router.post(
  '/api/criarEmpresa',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  empresaController.criarEmpresa,
)

router.put(
  '/api/atualizarEmpresa/:id',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  empresaController.atualizarEmpresa,
)

router.delete(
  '/api/deletarEmpresa/:id',
  authMiddleware,
  authorizarPerfil('ADMIN'),
  empresaController.deletarEmpresa,
)

router.get(
  '/api/empresa/cnpj/:cnpj',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  empresaController.buscarEmpresasPorCNPJ,
)

module.exports = router
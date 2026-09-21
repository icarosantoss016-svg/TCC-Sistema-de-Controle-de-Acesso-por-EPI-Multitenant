const express = require('express')
const router = express.Router()
const usuarioController = require('../controllers/usuarioController')
const authMiddleware = require('../middleware/authMiddleware')
const authorizarPerfil = require('../middleware/authorizarPerfil')

router.post(
  '/api/criarusuario',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  usuarioController.criarUsuario,
)

router.get(
  '/api/listaUsuario',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  usuarioController.listarUsuarios,
)

router.get(
  '/api/buscarUsuario/:id',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  usuarioController.buscarUsuarioId,
)

router.put(
  '/api/atualizarUsuario/:id',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  usuarioController.atualizarUsuario,
)

router.put(
  '/api/atualizarSenha/:id',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA', 'USUARIO'),
  usuarioController.atualizarSenha,
)

router.delete(
  '/api/deletarUsuario/:id',
  authMiddleware,
  authorizarPerfil('ADMIN', 'ADM_EMPRESA'),
  usuarioController.deletarUsuario,
)

module.exports = router
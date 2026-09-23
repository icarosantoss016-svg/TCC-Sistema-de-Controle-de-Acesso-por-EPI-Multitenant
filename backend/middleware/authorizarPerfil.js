/**
 * Middleware de autorização por perfil de usuário (RBAC).
 * Deve ser executado após authMiddleware (que popula req.usuario).
 *
 * @param  {...string} perfisPermitidos - Lista de perfis autorizados (ex: 'ADMIN', 'ADM_EMPRESA', 'USUARIO')
 */
function authorizarPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    const perfilDoUsuario = req.usuario?.perfil

    if (!perfilDoUsuario || !perfisPermitidos.includes(perfilDoUsuario)) {
      return res.status(403).json({
        error: 'Você não tem permissão para acessar este recurso.',
      })
    }

    next()
  }
}

module.exports = authorizarPerfil

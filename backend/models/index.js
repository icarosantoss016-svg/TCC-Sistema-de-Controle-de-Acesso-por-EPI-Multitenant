const Empresa = require('./empresa')
const Setor = require('./setor')
const Usuario = require('./usuario')
const RegraEpi = require('./regraEpi')
const LogAcesso = require('./logAcesso')
const UsuarioSetor = require('./usuarioSetor')
const UsuarioEmpresa = require('./usuarioEmpresa')
const SolicitacaoAcesso = require('./solicitacaoAcesso')

// Empresa <-> Setor
Empresa.hasMany(Setor, { foreignKey: 'id_empresa' })
Setor.belongsTo(Empresa, { foreignKey: 'id_empresa' })

// Empresa <-> Usuario (relação 1:N legada + N:N via UsuarioEmpresa)
Empresa.hasMany(Usuario, { foreignKey: 'id_empresa' })
Usuario.belongsTo(Empresa, { foreignKey: 'id_empresa' })

Usuario.belongsToMany(Empresa, { through: UsuarioEmpresa, foreignKey: 'id_usuario', otherKey: 'id_empresa' })
Empresa.belongsToMany(Usuario, { through: UsuarioEmpresa, foreignKey: 'id_empresa', otherKey: 'id_usuario' })

// Usuario <-> Setor (relação N:N para sub-usuários)
Usuario.belongsToMany(Setor, { through: UsuarioSetor, foreignKey: 'id_usuario', otherKey: 'id_setor' })
Setor.belongsToMany(Usuario, { through: UsuarioSetor, foreignKey: 'id_setor', otherKey: 'id_usuario' })

// Setor <-> RegraEpi
Setor.hasMany(RegraEpi, { foreignKey: 'id_setor' })
RegraEpi.belongsTo(Setor, { foreignKey: 'id_setor' })

// Setor <-> LogAcesso
Setor.hasMany(LogAcesso, { foreignKey: 'id_setor' })
LogAcesso.belongsTo(Setor, { foreignKey: 'id_setor' })

module.exports = {
  Empresa,
  Setor,
  Usuario,
  RegraEpi,
  LogAcesso,
  UsuarioSetor,
  UsuarioEmpresa,
  SolicitacaoAcesso,
}
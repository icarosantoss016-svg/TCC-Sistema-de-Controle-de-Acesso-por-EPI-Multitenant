const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UsuarioEmpresa = sequelize.define('UsuarioEmpresa', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_empresa: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'usuario_empresas'
})

module.exports = UsuarioEmpresa

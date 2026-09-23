const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const UsuarioSetor = sequelize.define('UsuarioSetor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_setor: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'usuario_setores'
})

module.exports = UsuarioSetor

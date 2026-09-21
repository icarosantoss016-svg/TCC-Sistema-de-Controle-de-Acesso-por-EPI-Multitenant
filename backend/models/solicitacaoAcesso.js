const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const SolicitacaoAcesso = sequelize.define('SolicitacaoAcesso', {
    id_solicitacao: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cargo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDENTE', 'APROVADA', 'NEGADA'),
        defaultValue: 'PENDENTE',
        allowNull: false
    },
    motivo_resposta: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'solicitacoes_acesso'
})

module.exports = SolicitacaoAcesso

const { Sequelize } = require('sequelize')
require('dotenv').config()

const dialect = process.env.DB_DIALECT || 'postgres'

let sequelize

if (dialect === 'postgres') {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'false' ? false : {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    })
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'safezone_db',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'Senha',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false
          } : false
        },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
      }
    )
  }
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './tcc_banco.sqlite',
    logging: false
  })
}

sequelize
  .authenticate()
  .then(() => console.log(`[DB] Conectado ao banco de dados (${dialect}) com sucesso.`))
  .catch((error) => console.error(`[DB] Falha ao conectar no banco (${dialect}):`, error))

module.exports = sequelize
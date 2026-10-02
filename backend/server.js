const express = require('express')
const sequelize = require('./config/database')
require('./models')
const cors = require('cors')

const acessoRoutes = require('./routers/acessoRoutes')
const setorRoutes = require('./routers/setorRoutes')
const usuarioRoutes = require('./routers/usuarioRoutes')
const authRoutes = require('./routers/authRoutes')
const relatoriosRoutes = require('./routers/relatorioRoutes')
const empresaRoutes = require('./routers/empresaRoutes')
const regraEpiRoutes = require('./routers/regraEpiRoutes')
const solicitacaoRoutes = require('./routers/solicitacaoRoutes')
const { criarEmpresaAdmin } = require('./controllers/empresaContoller')
const { criarAdminPadrao } = require('./controllers/usuarioController')

const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ status: 'API SafeZone rodando com sucesso!' })
})

app.use(cors())
app.use(express.json())
app.use(acessoRoutes)
app.use(setorRoutes)
app.use(usuarioRoutes)
app.use(authRoutes)
app.use(relatoriosRoutes)
app.use(empresaRoutes)
app.use(regraEpiRoutes)
app.use(solicitacaoRoutes)
app.use('/', viewsRoutes)

sequelize
  .sync()
  .then(async () => {
    console.log('Banco de dados conectado e tabelas sincronizadas com sucesso.')
    await criarEmpresaAdmin()
    await criarAdminPadrao()
  })
  .catch((erro) => {
    console.error('Erro ao conectar com o banco de dados:', erro)
  })

  if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

  module.exports = app
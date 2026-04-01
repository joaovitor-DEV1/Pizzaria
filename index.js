// Carrega as variáveis de ambiente a partir do arquivo .env
require('dotenv').config()

// Importação dos módulos necessários (Express para o servidor, CORS para segurança de origem e Path para lidar com caminhos de arquivos)
const express = require('express')
const cors = require('cors')
const path = require('path')

// Inicializa a aplicação Express
const app = express()
// Define a porta em que o servidor vai rodar (usa a variável de ambiente ou 3001 por padrão)
const PORT = process.env.PORT || 3001

// Configuração de middlewares
app.use(cors()) // Habilita o CORS (permite que o frontend em outro domínio acesse a API)
app.use(express.json()) // Permite que a aplicação receba e envie dados no formato JSON
app.use(express.static(path.join(__dirname, 'public'))) // Define a pasta 'public' para servir arquivos estáticos (como HTML, CSS, JS do frontend)

// Importa o status de prontidão do banco de dados e as rotas da aplicação
const { ready } = require('./src/database/sqlite')
const routes = require('./src/routes/index')

// Aguarda a conexão com o banco de dados estar pronta (resolvida) antes de iniciar o servidor
ready.then(() => {
  // Conecta o arquivo de rotas ao caminho base '/api'
  app.use('/api', routes)

  // Rota simples de teste para verificar o status e a porta da API
  app.get('/teste', (req, res) => {
    res.json({ mensagem: 'API da Pizzaria funcionando!', status: 'online', porta: PORT })
  })

  // Rota "catch-all" (qualquer requisição que não foi capturada pelas rotas acima cai aqui)
  // Muito comum em Single Page Applications (SPAs) para devolver o index.html e deixar o frontend lidar com a navegação
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

  // Coloca o servidor no ar, "escutando" as requisições na porta definida
  app.listen(PORT, () => {
    console.log('=================================')
    console.log('Servidor rodando na porta ' + PORT)
    console.log('API: http://localhost:' + PORT + '/api')
    console.log('Front-end: http://localhost:' + PORT)
    console.log('=================================')
  })
}).catch(err => {
  // Se houver alguma falha na inicialização do banco de dados, o erro é capturado aqui
  console.error('Erro ao inicializar banco:', err)
  process.exit(1) // Encerra o processo do Node.js com código de erro (1)
})

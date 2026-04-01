// Importa a biblioteca jsonwebtoken para lidar com a verificação de tokens JWT
const jwt = require('jsonwebtoken');

/**
 * Verifica se o usuário enviou um token válido no cabeçalho da requisição.
 */
function autenticar(req, res, next) {
  // Obtém o cabeçalho 'authorization' da requisição (geralmente no formato "Bearer TOKEN")
  const authHeader = req.headers['authorization'];
  
  // Se o cabeçalho existir, divide a string pelo espaço e pega apenas a segunda parte (o token em si)
  const token      = authHeader && authHeader.split(' ')[1];

  // Se o token não estiver presente, retorna erro 401 (Não Autorizado)
  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido. Faça login.' });
  }

  try {
    // Tenta decodificar e verificar o token usando a chave secreta definida no seu arquivo .env
    const payload  = jwt.verify(token, process.env.JWT_SECRET);
    
    // Se o token for válido, anexa os dados do usuário (payload) ao objeto da requisição (req)
    req.usuario    = payload;
    
    // Chama o próximo middleware ou a função da rota
    next();
  } catch (erro) {
    // Se o token for falso, tiver sido alterado ou estiver expirado, cai aqui
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

// Exporta a função para ser utilizada nas definições de rotas do Express
module.exports = autenticar;

// ============================================================
// Usuario.js — Model de Usuário (sql.js)
// ============================================================

// Importa as funções de banco de dados e a biblioteca bcryptjs para criptografia de senhas
const { ready, query, run, get } = require('../database/sqlite');
const bcrypt = require('bcryptjs');

/**
 * Função para formatar os dados do usuário.
 * IMPORTANTE: Esta função não retorna o campo 'senha' por questões de segurança,
 * evitando que o hash da senha seja enviado para o front-end acidentalmente.
 */
function formatarUsuario(row) {
  if (!row) return null;
  return {
    _id:       row.id,
    id:        row.id,
    nome:      row.nome,
    email:     row.email,
    perfil:    row.perfil, // Ex: 'Admin', 'Atendente', 'Garçom'
    ativo:     row.ativo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const Usuario = {

  // Retorna a lista de todos os usuários cadastrados, ordenados pelos mais recentes
  async findAll() {
    await ready;
    // Selecionamos campos específicos para garantir que a senha não venha na query
    const rows = query(`
      SELECT id, nome, email, perfil, ativo, created_at, updated_at
      FROM usuarios ORDER BY created_at DESC
    `);
    return rows.map(formatarUsuario);
  },

  // Busca um usuário pelo e-mail (muito usado no processo de Login)
  async findByEmail(email) {
    await ready;
    // Normaliza o e-mail para minúsculas e remove espaços para evitar erros de digitação
    return get('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
  },

  // Busca um usuário específico pelo ID
  async findById(id) {
    await ready;
    const row = get(`
      SELECT id, nome, email, perfil, ativo, created_at, updated_at
      FROM usuarios WHERE id = ?
    `, [id]);
    return formatarUsuario(row);
  },

  // Cria um novo usuário com senha criptografada
  async create({ nome, email, senha, perfil = 'Atendente' }) {
    await ready;
    // Gera um hash seguro da senha (custo 10) antes de salvar no banco
    const hash = await bcrypt.hash(senha, 10);
    
    const info = run(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)',
      [
        nome.trim(), 
        email.toLowerCase().trim(), 
        hash, // Salva o hash, nunca a senha em texto puro
        perfil
      ]
    );
    return this.findById(info.lastInsertRowid);
  },

  // Atualiza os dados de um usuário
  async update(id, { nome, email, senha, perfil, ativo }) {
    await ready;
    // Busca os dados atuais para verificar se o usuário existe
    const atual = get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!atual) return null;

    // Se uma nova senha for enviada, gera um novo hash. Caso contrário, mantém a senha atual.
    let senhaFinal = atual.senha;
    if (senha) senhaFinal = await bcrypt.hash(senha, 10);

    run(`
      UPDATE usuarios SET
        nome       = ?,
        email      = ?,
        senha      = ?,
        perfil     = ?,
        ativo      = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `, [
      nome   ?? atual.nome,
      email  ?? atual.email,
      senhaFinal,
      perfil ?? atual.perfil,
      // Se 'ativo' não for informado, mantém o status atual
      ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);

    return this.findById(id);
  },

  // Remove um usuário do banco de dados
  async delete(id) {
    await ready;
    const info = run('DELETE FROM usuarios WHERE id = ?', [id]);
    return info.changes > 0;
  },

  /**
   * Método auxiliar para validar senhas.
   * Compara a senha digitada pelo usuário com o hash que está salvo no banco.
   */
  verificarSenha(senhaDigitada, hashSalvo) {
    return bcrypt.compare(senhaDigitada, hashSalvo);
  },
};

module.exports = Usuario;

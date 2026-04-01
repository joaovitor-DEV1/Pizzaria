// ============================================================
// Cliente.js — Model de Cliente (sql.js)
// ============================================================

// Importa as funções de manipulação do banco de dados SQLite personalizadas do seu projeto
const { ready, query, run, get } = require('../database/sqlite');

/**
 * Função auxiliar para formatar os dados que vêm do banco de dados (SQLite)
 * e transformá-los em um objeto JavaScript padronizado para o restante da aplicação.
 */
function formatarCliente(row) {
  // Se não encontrar nenhuma linha (row), retorna nulo
  if (!row) return null;
  
  // Mapeia as colunas do banco para as propriedades do objeto
  return {
    _id:        row.id, // Adiciona _id por conveniência (muito usado em front-ends ou migrações do MongoDB)
    id:         row.id,
    nome:       row.nome,
    telefone:   row.telefone,
    // O endereço é salvo como texto (string) no banco, então fazemos o parse para virar um objeto JSON
    endereco:   JSON.parse(row.endereco || '{}'), 
    observacoes: row.observacoes,
    // Converte o valor numérico (1 ou 0) do banco para um valor booleano (true ou false)
    ativo:      row.ativo === 1,
    createdAt:  row.created_at,
    updatedAt:  row.updated_at,
  };
}

// Objeto Cliente que atua como o Model/DAO (Data Access Object) concentrando as operações no banco
const Cliente = {

  // Busca todos os clientes. Aceita um termo de busca opcional.
  async findAll(busca = '') {
    await ready; // Aguarda a conexão com o banco estar pronta
    let rows;

    // Se houver um termo de busca, faz uma pesquisa (LIKE) pelo nome ou telefone
    if (busca) {
      const t = `%${busca}%`; // Os % indicam que o termo pode estar em qualquer parte da string
      rows = query(
        'SELECT * FROM clientes WHERE ativo = 1 AND (nome LIKE ? OR telefone LIKE ?) ORDER BY nome',
        [t, t] // Substitui os '?' pelos valores da busca de forma segura (evita SQL Injection)
      );
    } else {
      // Se não houver busca, retorna todos os clientes ativos ordenados pelo nome
      rows = query('SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome');
    }

    // Passa todos os resultados pela função formatarCliente antes de retornar
    return rows.map(formatarCliente);
  },

  // Busca um cliente específico pelo ID
  async findById(id) {
    await ready;
    // Usa o 'get' para pegar apenas a primeira linha correspondente e formata o resultado
    return formatarCliente(get('SELECT * FROM clientes WHERE id = ?', [id]));
  },

  // Cria um novo cliente no banco de dados
  async create({ nome, telefone, endereco = {}, observacoes = '' }) {
    await ready;
    // Usa o 'run' para executar o INSERT
    const info = run(
      'INSERT INTO clientes (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)',
      [
        nome.trim(), // Remove espaços em branco do início e do fim
        telefone.trim(), 
        JSON.stringify(endereco), // Transforma o objeto de endereço em string para salvar no SQLite
        observacoes
      ]
    );
    // Retorna o cliente recém-criado usando o ID gerado na inserção (lastInsertRowid)
    return this.findById(info.lastInsertRowid);
  },

  // Atualiza os dados de um cliente existente
  async update(id, { nome, telefone, endereco, observacoes, ativo }) {
    await ready;
    
    // Primeiro, busca o cliente atual para não sobrescrever dados que não foram enviados na atualização
    const atual = get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!atual) return null; // Se o cliente não existir, retorna null

    // Mescla o endereço antigo com as novas informações de endereço (se houverem)
    const endAtual = JSON.parse(atual.endereco || '{}');
    const endFinal = endereco ? { ...endAtual, ...endereco } : endAtual;

    // Executa a atualização (UPDATE)
    run(`
      UPDATE clientes SET
        nome        = ?,
        telefone    = ?,
        endereco    = ?,
        observacoes = ?,
        ativo       = ?,
        updated_at  = datetime('now') -- Atualiza a data de modificação para a hora atual
      WHERE id = ?
    `, [
      // Usa o operador '??' para: se o novo valor for null/undefined, mantém o valor 'atual' do banco
      nome        ?? atual.nome,
      telefone    ?? atual.telefone,
      JSON.stringify(endFinal), // Salva o endereço mesclado como string
      observacoes ?? atual.observacoes,
      // Se 'ativo' foi enviado, converte para 1 (true) ou 0 (false). Se não foi, mantém o atual.
      ativo !== undefined ? (ativo ? 1 : 0) : atual.ativo,
      id
    ]);

    // Retorna o cliente atualizado
    return this.findById(id);
  },

  // Exclui um cliente permanentemente do banco de dados (Hard Delete)
  async delete(id) {
    await ready;
    const info = run('DELETE FROM clientes WHERE id = ?', [id]);
    // Retorna true se alguma linha foi afetada (excluída com sucesso), ou false se o ID não existia
    return info.changes > 0;
  },
};

// Exporta o Model para que possa ser usado nos Controllers/Rotas da aplicação
module.exports = Cliente;

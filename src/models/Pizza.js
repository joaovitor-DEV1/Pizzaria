// ============================================================
// Pizza.js — Model de Pizza (sql.js)
// ============================================================

// Importa os métodos utilitários para interagir com o banco de dados SQLite
const { ready, query, run, get } = require('../database/sqlite');

/**
 * Função auxiliar para transformar a linha bruta do banco de dados em um objeto JavaScript.
 * Trata especialmente o campo 'precos' que é armazenado como String no SQLite.
 */
function formatarPizza(row) {
  if (!row) return null;
  return {
    _id:          row.id, // Compatibilidade com padrões de ID de outros bancos
    id:           row.id,
    nome:         row.nome,
    descricao:    row.descricao,
    ingredientes: row.ingredientes,
    // Converte a string JSON do banco para um objeto JS. Define valores padrão (0) se estiver vazio.
    precos:       JSON.parse(row.precos || '{"P":0,"M":0,"G":0}'),
    // Converte o inteiro do SQLite (0 ou 1) para booleano (true ou false)
    disponivel:   row.disponivel === 1,
    categoria:    row.categoria,
    createdAt:    row.created_at,
    updated_at:   row.updated_at,
  };
}

const Pizza = {

  // Retorna todas as pizzas cadastradas, ordenadas primeiro por categoria e depois por nome
  async findAll() {
    await ready;
    return query('SELECT * FROM pizzas ORDER BY categoria, nome').map(formatarPizza);
  },

  // Busca uma pizza específica através do seu ID único
  async findById(id) {
    await ready;
    return formatarPizza(get('SELECT * FROM pizzas WHERE id = ?', [id]));
  },

  // Cria um novo registro de pizza no banco de dados
  async create({ nome, descricao = '', ingredientes, precos = {}, disponivel = true, categoria = 'tradicional' }) {
    await ready;
    const info = run(
      'INSERT INTO pizzas (nome, descricao, ingredientes, precos, disponivel, categoria) VALUES (?, ?, ?, ?, ?, ?)',
      [
        nome.trim(), 
        descricao.trim(), 
        ingredientes.trim(),
        // Serializa o objeto de preços para String JSON, garantindo que os tamanhos P, M e G existam
        JSON.stringify({ P: precos.P || 0, M: precos.M || 0, G: precos.G || 0 }),
        disponivel ? 1 : 0, // SQLite armazena booleanos como 0 ou 1
        categoria
      ]
    );
    // Retorna a pizza recém-criada buscando-a pelo ID gerado automaticamente (lastInsertRowid)
    return this.findById(info.lastInsertRowid);
  },

  // Atualiza os dados de uma pizza existente
  async update(id, { nome, descricao, ingredientes, precos, disponivel, categoria }) {
    await ready;
    // Verifica se a pizza existe antes de tentar atualizar
    const atual = get('SELECT * FROM pizzas WHERE id = ?', [id]);
    if (!atual) return null;

    // Lógica para atualizar preços: mantém os valores antigos caso apenas um tamanho seja enviado
    const precosAtuais = JSON.parse(atual.precos || '{"P":0,"M":0,"G":0}');
    const precosFinal  = precos
      ? { 
          P: precos.P ?? precosAtuais.P, 
          M: precos.M ?? precosAtuais.M, 
          G: precos.G ?? precosAtuais.G 
        }
      : precosAtuais;

    // Executa o comando de atualização
    run(`
      UPDATE pizzas SET
        nome         = ?,
        descricao    = ?,
        ingredientes = ?,
        precos       = ?,
        disponivel   = ?,
        categoria    = ?,
        updated_at   = datetime('now') -- Atualiza o carimbo de data/hora para o momento atual
      WHERE id = ?
    `, [
      nome         ?? atual.nome,        // Se 'nome' for undefined, mantém o valor atual do banco
      descricao    ?? atual.descricao,
      ingredientes ?? atual.ingredientes,
      JSON.stringify(precosFinal),
      disponivel   !== undefined ? (disponivel ? 1 : 0) : atual.disponivel,
      categoria    ?? atual.categoria,
      id
    ]);

    // Retorna o objeto da pizza já com os dados atualizados
    return this.findById(id);
  },

  // Remove permanentemente uma pizza do cardápio
  async delete(id) {
    await ready;
    const info = run('DELETE FROM pizzas WHERE id = ?', [id]);
    // Retorna true se alguma linha foi afetada (deletada), false caso o ID não existisse
    return info.changes > 0;
  },
};

module.exports = Pizza;

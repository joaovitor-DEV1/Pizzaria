// ============================================================
// Pedido.js — Model de Pedido (sql.js)
// ============================================================

// Importa as funções de manipulação do banco de dados SQLite personalizadas
const { ready, query, run, get } = require('../database/sqlite');

// Define uma constante com a consulta SQL base para buscar pedidos.
// Usa um LEFT JOIN para trazer também o nome e o telefone do cliente associado ao pedido,
// evitando a necessidade de fazer uma segunda consulta na tabela de clientes.
const SELECT_PEDIDO = `
  SELECT
    p.*,
    c.nome     AS cliente_nome,
    c.telefone AS cliente_telefone
  FROM pedidos p
  LEFT JOIN clientes c ON c.id = p.cliente_id
`;

/**
 * Função auxiliar para formatar os dados brutos do banco (SQLite) 
 * e montar um objeto aninhado mais amigável para o front-end.
 * Recebe a linha do pedido (row) e um array com os itens desse pedido (itens).
 */
function formatarPedido(row, itens = []) {
  if (!row) return null; // Se não houver pedido, retorna nulo
  return {
    _id:           row.id,
    id:            row.id,
    numeroPedido:  row.numero_pedido,
    // Agrupa as informações do cliente em um sub-objeto
    cliente: {
      _id:      row.cliente_id,
      id:       row.cliente_id,
      nome:     row.cliente_nome,
      telefone: row.cliente_telefone,
    },
    // Mapeia o array de itens associados ao pedido, formatando cada um
    itens: itens.map(it => ({
      _id:           it.id,
      pizza:         it.pizza_id,
      nomePizza:     it.nome_pizza,
      tamanho:       it.tamanho,
      quantidade:    it.quantidade,
      precoUnitario: it.preco_unitario,
      subtotal:      it.subtotal,
    })),
    // Demais campos do pedido
    subtotal:       row.subtotal,
    taxaEntrega:    row.taxa_entrega,
    total:          row.total,
    formaPagamento: row.forma_pagamento,
    troco:          row.troco,
    status:         row.status,
    observacoes:    row.observacoes,
    mesa:           row.mesa,
    origem:         row.origem,
    garcom:         row.garcom_id,
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
}

// Objeto Pedido que atua como o Model/DAO para a tabela de pedidos
const Pedido = {

  // Busca todos os pedidos. Pode receber um filtro opcional pelo ID do garçom.
  async findAll({ garcomId } = {}) {
    await ready;
    let rows;
    
    // Se o ID do garçom for passado, filtra os pedidos dele. Se não, busca todos.
    // Em ambos os casos, ordena dos mais recentes para os mais antigos (DESC).
    if (garcomId) {
      rows = query(`${SELECT_PEDIDO} WHERE p.garcom_id = ? ORDER BY p.created_at DESC`, [garcomId]);
    } else {
      rows = query(`${SELECT_PEDIDO} ORDER BY p.created_at DESC`);
    }
    
    // Para cada pedido encontrado, faz uma nova consulta para buscar os itens daquele pedido
    return rows.map(row => {
      const itens = query('SELECT * FROM itens_pedido WHERE pedido_id = ?', [row.id]);
      return formatarPedido(row, itens);
    });
  },

  // Busca um único pedido pelo seu ID
  async findById(id) {
    await ready;
    // Tenta encontrar o pedido principal
    const row = get(`${SELECT_PEDIDO} WHERE p.id = ?`, [id]);
    if (!row) return null; // Retorna null se não encontrar
    
    // Se encontrou o pedido, busca os itens vinculados a ele
    const itens = query('SELECT * FROM itens_pedido WHERE pedido_id = ?', [id]);
    return formatarPedido(row, itens);
  },

  // Cria um novo pedido (lógica mais complexa, pois envolve calcular preços e inserir em múltiplas tabelas)
  async create({ clienteId, itens, taxaEntrega = 0, formaPagamento, troco = 0, observacoes = '', mesa = null, origem = 'balcao', garcomId = null }) {
    await ready;

    // Importa o Model de Pizza aqui dentro para evitar referências circulares no topo do arquivo
    const Pizza = require('./Pizza');
    let subtotal = 0;
    const itensProcessados = [];

    // 1. PROCESSAMENTO DOS ITENS:
    // Percorre cada item enviado no pedido para calcular o valor real atualizado (evita fraudes de preço vindo do front-end)
    for (const item of itens) {
      // Busca os dados reais da pizza no banco
      const pizza = await Pizza.findById(item.pizza);
      if (!pizza) throw new Error(`Pizza ID ${item.pizza} não encontrada`);

      // Pega o preço baseado no tamanho escolhido. Se não existir, assume 0.
      const preco   = pizza.precos[item.tamanho] || 0;
      const subItem = preco * item.quantidade;
      subtotal     += subItem; // Adiciona o valor deste item ao subtotal geral do pedido

      // Guarda os dados processados para inserir no banco logo a seguir
      itensProcessados.push({
        pizzaId:       pizza.id,
        nomePizza:     pizza.nome, // Salva o nome da pizza no momento do pedido (caso ela mude de nome no futuro)
        tamanho:       item.tamanho,
        quantidade:    item.quantidade,
        precoUnitario: preco,
        subtotal:      subItem,
      });
    }

    // 2. CÁLCULOS FINAIS E GERAÇÃO DO NÚMERO DO PEDIDO:
    const total        = subtotal + (taxaEntrega || 0); // Total é subtotal + entrega
    const contagem     = get('SELECT COUNT(*) as total FROM pedidos'); // Descobre quantos pedidos já existem
    const numeroPedido = (contagem?.total || 0) + 1; // Gera o próximo número de pedido sequencial

    // 3. INSERÇÃO DO PEDIDO PRINCIPAL:
    const infoPedido = run(`
      INSERT INTO pedidos
        (numero_pedido, cliente_id, subtotal, taxa_entrega, total,
         forma_pagamento, troco, observacoes, mesa, origem, garcom_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [numeroPedido, clienteId, subtotal, taxaEntrega || 0, total,
        formaPagamento, troco || 0, observacoes, mesa, origem, garcomId]);

    // Pega o ID que o banco acabou de gerar para o pedido principal
    const pedidoId = infoPedido.lastInsertRowid;

    // 4. INSERÇÃO DOS ITENS DO PEDIDO:
    // Agora que temos o ID do pedido, inserimos cada item vinculado a ele
    for (const it of itensProcessados) {
      run(`
        INSERT INTO itens_pedido
          (pedido_id, pizza_id, nome_pizza, tamanho, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [pedidoId, it.pizzaId, it.nomePizza, it.tamanho, it.quantidade, it.precoUnitario, it.subtotal]);
    }

    // Por fim, retorna o pedido completo e formatado (buscando do banco)
    return this.findById(pedidoId);
  },

  // Atualiza especificamente o status de um pedido (ex: de 'pendente' para 'preparando' ou 'entregue')
  async updateStatus(id, status) {
    await ready;
    const info = run(
      "UPDATE pedidos SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, id]
    );
    // Se a alteração funcionou (changes > 0), retorna o pedido atualizado. Se não, retorna null.
    return info.changes > 0 ? this.findById(id) : null;
  },

  // Exclui um pedido permanentemente
  async delete(id) {
    await ready;
    // Muito importante: deleta os itens do pedido primeiro! 
    // Como o SQLite aqui não está usando "ON DELETE CASCADE", deletar o pedido principal sem deletar os itens deixaria "lixo" (dados órfãos) no banco.
    run('DELETE FROM itens_pedido WHERE pedido_id = ?', [id]);
    
    // Depois deleta o pedido principal
    const info = run('DELETE FROM pedidos WHERE id = ?', [id]);
    return info.changes > 0;
  },
};

// Exporta o Model para ser utilizado na aplicação
module.exports = Pedido;

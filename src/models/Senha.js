const { query } = require('../config/database');
const crypto = require('crypto');

class Senha {
  constructor(data) {
    this.id = data.id;
    this.sistema = data.sistema;
    this.categoria = data.categoria;
    this.localidade_id = data.localidade_id;
    this.prefeitura_id = data.prefeitura_id;
    this.fornecedor_id = data.fornecedor_id;
    this.url = data.url;
    this.usuario = data.usuario;
    this.senha_criptografada = data.senha_criptografada;
    this.observacoes = data.observacoes;
    this.data_expiracao = data.data_expiracao;
    this.notificar_expiracao = data.notificar_expiracao;
    this.dias_aviso_expiracao = data.dias_aviso_expiracao;
    this.criado_por = data.criado_por;
    this.atualizado_por = data.atualizado_por;
    this.criado_em = data.criado_em;
    this.atualizado_em = data.atualizado_em;
    
    // Campos de relacionamento
    this.nome_localidade = data.nome_localidade;
    this.nome_criador = data.nome_criador;
    this.nome_atualizador = data.nome_atualizador;
  }

  // Buscar todas as senhas com relacionamentos
  static async buscarTodas(filtros = {}) {
    let sql = `
      SELECT 
        s.id, s.sistema, s.categoria, s.localidade_id, s.prefeitura_id, s.fornecedor_id,
        s.url, s.usuario, s.observacoes, s.data_expiracao, s.notificar_expiracao,
        s.dias_aviso_expiracao, s.criado_por, s.atualizado_por, s.criado_em, s.atualizado_em,
        l.nome_localidade,
        uc.nome as nome_criador,
        ua.nome as nome_atualizador
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      LEFT JOIN usuarios uc ON s.criado_por = uc.id
      LEFT JOIN usuarios ua ON s.atualizado_por = ua.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.categoria) {
      paramCount++;
      sql += ` AND s.categoria = $${paramCount}`;
      params.push(filtros.categoria);
    }

    if (filtros.localidade_id) {
      paramCount++;
      sql += ` AND s.localidade_id = $${paramCount}`;
      params.push(filtros.localidade_id);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (s.sistema ILIKE $${paramCount} OR s.usuario ILIKE $${paramCount} OR l.nome_localidade ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    if (filtros.expirando) {
      const diasAviso = filtros.dias_aviso || 30;
      paramCount++;
      sql += ` AND s.data_expiracao IS NOT NULL AND s.data_expiracao <= CURRENT_DATE + INTERVAL '${diasAviso} days'`;
    }

    sql += ` ORDER BY s.atualizado_em DESC`;

    if (filtros.limite) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filtros.limite);
    }

    if (filtros.offset) {
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(filtros.offset);
    }

    const result = await query(sql, params);
    return result.rows.map(row => new Senha(row));
  }

  // Buscar senha por ID
  static async buscarPorId(id) {
    const sql = `
      SELECT 
        s.id, s.sistema, s.categoria, s.localidade_id, s.prefeitura_id, s.fornecedor_id,
        s.url, s.usuario, s.senha_criptografada, s.observacoes, s.data_expiracao, 
        s.notificar_expiracao, s.dias_aviso_expiracao, s.criado_por, s.atualizado_por, 
        s.criado_em, s.atualizado_em,
        l.nome_localidade,
        uc.nome as nome_criador,
        ua.nome as nome_atualizador
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      LEFT JOIN usuarios uc ON s.criado_por = uc.id
      LEFT JOIN usuarios ua ON s.atualizado_por = ua.id
      WHERE s.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? new Senha(result.rows[0]) : null;
  }

  // Criar nova senha
  static async criar(dadosSenha, usuarioId) {
    const { 
      sistema, categoria, localidade_id, prefeitura_id, fornecedor_id,
      url, usuario, senha, observacoes, data_expiracao, notificar_expiracao, dias_aviso_expiracao 
    } = dadosSenha;
    
    // Criptografar senha
    const senha_criptografada = Senha.criptografarSenha(senha);

    const sql = `
      INSERT INTO senhas (
        sistema, categoria, localidade_id, prefeitura_id, fornecedor_id,
        url, usuario, senha_criptografada, observacoes, data_expiracao, 
        notificar_expiracao, dias_aviso_expiracao, criado_por, atualizado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
      RETURNING id, sistema, categoria, localidade_id, prefeitura_id, fornecedor_id,
                url, usuario, observacoes, data_expiracao, notificar_expiracao,
                dias_aviso_expiracao, criado_por, atualizado_por, criado_em, atualizado_em
    `;
    
    const result = await query(sql, [
      sistema, categoria, localidade_id, prefeitura_id, fornecedor_id,
      url, usuario, senha_criptografada, observacoes, data_expiracao,
      notificar_expiracao, dias_aviso_expiracao, usuarioId
    ]);
    
    return new Senha(result.rows[0]);
  }

  // Atualizar senha
  static async atualizar(id, dadosSenha, usuarioId) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Campos que podem ser atualizados
    const camposPermitidos = [
      'sistema', 'categoria', 'localidade_id', 'prefeitura_id', 'fornecedor_id',
      'url', 'usuario', 'observacoes', 'data_expiracao', 'notificar_expiracao', 'dias_aviso_expiracao'
    ];
    
    for (const campo of camposPermitidos) {
      if (dadosSenha[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(dadosSenha[campo]);
      }
    }

    // Se há uma nova senha
    if (dadosSenha.senha) {
      const senha_criptografada = Senha.criptografarSenha(dadosSenha.senha);
      paramCount++;
      campos.push(`senha_criptografada = $${paramCount}`);
      valores.push(senha_criptografada);
    }

    // Adicionar usuário que atualizou
    paramCount++;
    campos.push(`atualizado_por = $${paramCount}`);
    valores.push(usuarioId);

    if (campos.length === 1) { // Apenas o atualizado_por
      throw new Error('Nenhum campo para atualizar');
    }

    paramCount++;
    valores.push(id);

    const sql = `
      UPDATE senhas 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, sistema, categoria, localidade_id, prefeitura_id, fornecedor_id,
                url, usuario, observacoes, data_expiracao, notificar_expiracao,
                dias_aviso_expiracao, criado_por, atualizado_por, criado_em, atualizado_em
    `;

    const result = await query(sql, valores);
    return result.rows.length > 0 ? new Senha(result.rows[0]) : null;
  }

  // Deletar senha
  static async deletar(id) {
    const sql = `DELETE FROM senhas WHERE id = $1 RETURNING id`;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  // Contar total de senhas
  static async contar(filtros = {}) {
    let sql = 'SELECT COUNT(*) as total FROM senhas s WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.categoria) {
      paramCount++;
      sql += ` AND s.categoria = $${paramCount}`;
      params.push(filtros.categoria);
    }

    if (filtros.localidade_id) {
      paramCount++;
      sql += ` AND s.localidade_id = $${paramCount}`;
      params.push(filtros.localidade_id);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (s.sistema ILIKE $${paramCount} OR s.usuario ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Buscar senhas que expiram em breve
  static async buscarExpirandoEmBreve(dias = 30) {
    const sql = `
      SELECT 
        s.id, s.sistema, s.categoria, s.data_expiracao,
        l.nome_localidade,
        EXTRACT(DAY FROM (s.data_expiracao - CURRENT_DATE)) as dias_restantes
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      WHERE s.data_expiracao IS NOT NULL 
        AND s.data_expiracao <= CURRENT_DATE + INTERVAL '${dias} days'
        AND s.data_expiracao >= CURRENT_DATE
        AND s.notificar_expiracao = true
      ORDER BY s.data_expiracao ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Buscar últimas senhas criadas/alteradas
  static async buscarUltimasAlteracoes(limite = 5) {
    const sql = `
      SELECT 
        s.id, s.sistema, s.categoria, s.atualizado_em,
        l.nome_localidade,
        ua.nome as nome_atualizador
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      LEFT JOIN usuarios ua ON s.atualizado_por = ua.id
      ORDER BY s.atualizado_em DESC
      LIMIT $1
    `;
    const result = await query(sql, [limite]);
    return result.rows;
  }

  // Estatísticas por categoria
  static async estatisticasPorCategoria() {
    const sql = `
      SELECT 
        categoria,
        COUNT(*) as total
      FROM senhas
      GROUP BY categoria
      ORDER BY total DESC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Criptografar senha
  static criptografarSenha(senha) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.JWT_SECRET || 'chave-padrao', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(senha, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  // Descriptografar senha
  static descriptografarSenha(senhaCriptografada) {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(process.env.JWT_SECRET || 'chave-padrao', 'salt', 32);
      
      const textParts = senhaCriptografada.split(':');
      const iv = Buffer.from(textParts.shift(), 'hex');
      const encryptedText = textParts.join(':');
      
      const decipher = crypto.createDecipher(algorithm, key);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar senha:', error);
      return null;
    }
  }

  // Método para retornar dados sem a senha descriptografada
  toJSON() {
    const { senha_criptografada, ...dadosSeguro } = this;
    return dadosSeguro;
  }

  // Método para obter a senha descriptografada (apenas para usuários autorizados)
  obterSenhaDescriptografada() {
    return Senha.descriptografarSenha(this.senha_criptografada);
  }
}

module.exports = Senha;


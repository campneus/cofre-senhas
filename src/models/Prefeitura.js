const { query } = require('../config/database');

class Prefeitura {
  constructor(data) {
    this.id = data.id;
    this.localidade_id = data.localidade_id;
    this.nome_prefeito = data.nome_prefeito;
    this.partido = data.partido;
    this.mandato_inicio = data.mandato_inicio;
    this.mandato_fim = data.mandato_fim;
    this.populacao = data.populacao;
    this.area_km2 = data.area_km2;
    this.observacoes = data.observacoes;
    this.ativo = data.ativo;
    this.criado_em = data.criado_em;
    this.atualizado_em = data.atualizado_em;
    
    // Campos de relacionamento
    this.nome_localidade = data.nome_localidade;
    this.codigo_localidade = data.codigo_localidade;
    this.cnpj_localidade = data.cnpj_localidade;
  }

  // Buscar todas as prefeituras com relacionamentos
  static async buscarTodas(filtros = {}) {
    let sql = `
      SELECT 
        p.id, p.localidade_id, p.nome_prefeito, p.partido, p.mandato_inicio, p.mandato_fim,
        p.populacao, p.area_km2, p.observacoes, p.ativo, p.criado_em, p.atualizado_em,
        l.nome_localidade, l.codigo_localidade, l.cnpj as cnpj_localidade
      FROM prefeituras p
      INNER JOIN localidades l ON p.localidade_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND p.ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (l.nome_localidade ILIKE $${paramCount} OR p.nome_prefeito ILIKE $${paramCount} OR p.partido ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    if (filtros.partido) {
      paramCount++;
      sql += ` AND p.partido = $${paramCount}`;
      params.push(filtros.partido);
    }

    sql += ` ORDER BY l.nome_localidade ASC`;

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
    return result.rows.map(row => new Prefeitura(row));
  }

  // Buscar prefeitura por ID
  static async buscarPorId(id) {
    const sql = `
      SELECT 
        p.id, p.localidade_id, p.nome_prefeito, p.partido, p.mandato_inicio, p.mandato_fim,
        p.populacao, p.area_km2, p.observacoes, p.ativo, p.criado_em, p.atualizado_em,
        l.nome_localidade, l.codigo_localidade, l.cnpj as cnpj_localidade
      FROM prefeituras p
      INNER JOIN localidades l ON p.localidade_id = l.id
      WHERE p.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? new Prefeitura(result.rows[0]) : null;
  }

  // Buscar prefeitura por localidade
  static async buscarPorLocalidade(localidadeId) {
    const sql = `
      SELECT 
        p.id, p.localidade_id, p.nome_prefeito, p.partido, p.mandato_inicio, p.mandato_fim,
        p.populacao, p.area_km2, p.observacoes, p.ativo, p.criado_em, p.atualizado_em,
        l.nome_localidade, l.codigo_localidade, l.cnpj as cnpj_localidade
      FROM prefeituras p
      INNER JOIN localidades l ON p.localidade_id = l.id
      WHERE p.localidade_id = $1 AND p.ativo = true
    `;
    const result = await query(sql, [localidadeId]);
    return result.rows.length > 0 ? new Prefeitura(result.rows[0]) : null;
  }

  // Criar nova prefeitura
  static async criar(dadosPrefeitura) {
    const { 
      localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim,
      populacao, area_km2, observacoes 
    } = dadosPrefeitura;
    
    // Verificar se já existe prefeitura para esta localidade
    const prefeituraExistente = await Prefeitura.buscarPorLocalidade(localidade_id);
    if (prefeituraExistente) {
      throw new Error('Já existe uma prefeitura cadastrada para esta localidade');
    }

    const sql = `
      INSERT INTO prefeituras (
        localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim,
        populacao, area_km2, observacoes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim,
                populacao, area_km2, observacoes, ativo, criado_em, atualizado_em
    `;
    
    const result = await query(sql, [
      localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim,
      populacao, area_km2, observacoes
    ]);
    
    return new Prefeitura(result.rows[0]);
  }

  // Atualizar prefeitura
  static async atualizar(id, dadosPrefeitura) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Campos que podem ser atualizados
    const camposPermitidos = [
      'nome_prefeito', 'partido', 'mandato_inicio', 'mandato_fim',
      'populacao', 'area_km2', 'observacoes', 'ativo'
    ];
    
    for (const campo of camposPermitidos) {
      if (dadosPrefeitura[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(dadosPrefeitura[campo]);
      }
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    paramCount++;
    valores.push(id);

    const sql = `
      UPDATE prefeituras 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, localidade_id, nome_prefeito, partido, mandato_inicio, mandato_fim,
                populacao, area_km2, observacoes, ativo, criado_em, atualizado_em
    `;

    const result = await query(sql, valores);
    return result.rows.length > 0 ? new Prefeitura(result.rows[0]) : null;
  }

  // Deletar prefeitura (soft delete)
  static async deletar(id) {
    const sql = `
      UPDATE prefeituras 
      SET ativo = false
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  // Contar total de prefeituras
  static async contar(filtros = {}) {
    let sql = 'SELECT COUNT(*) as total FROM prefeituras p WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND p.ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND EXISTS (SELECT 1 FROM localidades l WHERE l.id = p.localidade_id AND l.nome_localidade ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    if (filtros.partido) {
      paramCount++;
      sql += ` AND p.partido = $${paramCount}`;
      params.push(filtros.partido);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Buscar prefeituras para select (apenas ativas)
  static async buscarParaSelect() {
    const sql = `
      SELECT p.id, l.nome_localidade, p.nome_prefeito
      FROM prefeituras p
      INNER JOIN localidades l ON p.localidade_id = l.id
      WHERE p.ativo = true AND l.ativo = true
      ORDER BY l.nome_localidade ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Buscar partidos únicos
  static async buscarPartidos() {
    const sql = `
      SELECT DISTINCT partido
      FROM prefeituras
      WHERE partido IS NOT NULL AND partido != ''
      ORDER BY partido ASC
    `;
    const result = await query(sql);
    return result.rows.map(row => row.partido);
  }

  // Estatísticas de prefeituras
  static async obterEstatisticas() {
    const sql = `
      SELECT 
        COUNT(*) as total_prefeituras,
        COUNT(CASE WHEN ativo = true THEN 1 END) as prefeituras_ativas,
        SUM(populacao) as populacao_total,
        SUM(area_km2) as area_total,
        COUNT(DISTINCT partido) as total_partidos
      FROM prefeituras
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Validar datas de mandato
  static validarMandato(mandatoInicio, mandatoFim) {
    if (!mandatoInicio || !mandatoFim) {
      return true; // Campos opcionais
    }

    const inicio = new Date(mandatoInicio);
    const fim = new Date(mandatoFim);

    if (inicio >= fim) {
      throw new Error('Data de início do mandato deve ser anterior à data de fim');
    }

    return true;
  }
}

module.exports = Prefeitura;


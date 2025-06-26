const { query } = require('../config/database');

class Fornecedor {
  constructor(data) {
    this.id = data.id;
    this.localidade_id = data.localidade_id;
    this.razao_social = data.razao_social;
    this.nome_fantasia = data.nome_fantasia;
    this.cnpj = data.cnpj;
    this.inscricao_estadual = data.inscricao_estadual;
    this.tipo_fornecedor = data.tipo_fornecedor;
    this.ramo_atividade = data.ramo_atividade;
    this.contato_principal = data.contato_principal;
    this.telefone_contato = data.telefone_contato;
    this.email_contato = data.email_contato;
    this.observacoes = data.observacoes;
    this.ativo = data.ativo;
    this.criado_em = data.criado_em;
    this.atualizado_em = data.atualizado_em;
    
    // Campos de relacionamento
    this.nome_localidade = data.nome_localidade;
    this.codigo_localidade = data.codigo_localidade;
  }

  // Buscar todos os fornecedores com relacionamentos
  static async buscarTodos(filtros = {}) {
    let sql = `
      SELECT 
        f.id, f.localidade_id, f.razao_social, f.nome_fantasia, f.cnpj, f.inscricao_estadual,
        f.tipo_fornecedor, f.ramo_atividade, f.contato_principal, f.telefone_contato,
        f.email_contato, f.observacoes, f.ativo, f.criado_em, f.atualizado_em,
        l.nome_localidade, l.codigo_localidade
      FROM fornecedores f
      LEFT JOIN localidades l ON f.localidade_id = l.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND f.ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (f.razao_social ILIKE $${paramCount} OR f.nome_fantasia ILIKE $${paramCount} OR f.cnpj ILIKE $${paramCount} OR f.contato_principal ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    if (filtros.tipo_fornecedor) {
      paramCount++;
      sql += ` AND f.tipo_fornecedor = $${paramCount}`;
      params.push(filtros.tipo_fornecedor);
    }

    if (filtros.ramo_atividade) {
      paramCount++;
      sql += ` AND f.ramo_atividade ILIKE $${paramCount}`;
      params.push(`%${filtros.ramo_atividade}%`);
    }

    sql += ` ORDER BY f.razao_social ASC`;

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
    return result.rows.map(row => new Fornecedor(row));
  }

  // Buscar fornecedor por ID
  static async buscarPorId(id) {
    const sql = `
      SELECT 
        f.id, f.localidade_id, f.razao_social, f.nome_fantasia, f.cnpj, f.inscricao_estadual,
        f.tipo_fornecedor, f.ramo_atividade, f.contato_principal, f.telefone_contato,
        f.email_contato, f.observacoes, f.ativo, f.criado_em, f.atualizado_em,
        l.nome_localidade, l.codigo_localidade
      FROM fornecedores f
      LEFT JOIN localidades l ON f.localidade_id = l.id
      WHERE f.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? new Fornecedor(result.rows[0]) : null;
  }

  // Buscar fornecedor por CNPJ
  static async buscarPorCnpj(cnpj) {
    const sql = `
      SELECT 
        f.id, f.localidade_id, f.razao_social, f.nome_fantasia, f.cnpj, f.inscricao_estadual,
        f.tipo_fornecedor, f.ramo_atividade, f.contato_principal, f.telefone_contato,
        f.email_contato, f.observacoes, f.ativo, f.criado_em, f.atualizado_em,
        l.nome_localidade, l.codigo_localidade
      FROM fornecedores f
      LEFT JOIN localidades l ON f.localidade_id = l.id
      WHERE f.cnpj = $1
    `;
    const result = await query(sql, [cnpj]);
    return result.rows.length > 0 ? new Fornecedor(result.rows[0]) : null;
  }

  // Criar novo fornecedor
  static async criar(dadosFornecedor) {
    const { 
      localidade_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
      tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato,
      email_contato, observacoes 
    } = dadosFornecedor;
    
    // Verificar se CNPJ já existe
    const fornecedorExistente = await Fornecedor.buscarPorCnpj(cnpj);
    if (fornecedorExistente) {
      throw new Error('CNPJ já está em uso');
    }

    const sql = `
      INSERT INTO fornecedores (
        localidade_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
        tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato,
        email_contato, observacoes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, localidade_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
                tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato,
                email_contato, observacoes, ativo, criado_em, atualizado_em
    `;
    
    const result = await query(sql, [
      localidade_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
      tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato,
      email_contato, observacoes
    ]);
    
    return new Fornecedor(result.rows[0]);
  }

  // Atualizar fornecedor
  static async atualizar(id, dadosFornecedor) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Campos que podem ser atualizados
    const camposPermitidos = [
      'localidade_id', 'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
      'tipo_fornecedor', 'ramo_atividade', 'contato_principal', 'telefone_contato',
      'email_contato', 'observacoes', 'ativo'
    ];
    
    for (const campo of camposPermitidos) {
      if (dadosFornecedor[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(dadosFornecedor[campo]);
      }
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    paramCount++;
    valores.push(id);

    const sql = `
      UPDATE fornecedores 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, localidade_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
                tipo_fornecedor, ramo_atividade, contato_principal, telefone_contato,
                email_contato, observacoes, ativo, criado_em, atualizado_em
    `;

    const result = await query(sql, valores);
    return result.rows.length > 0 ? new Fornecedor(result.rows[0]) : null;
  }

  // Deletar fornecedor (soft delete)
  static async deletar(id) {
    const sql = `
      UPDATE fornecedores 
      SET ativo = false
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  // Contar total de fornecedores
  static async contar(filtros = {}) {
    let sql = 'SELECT COUNT(*) as total FROM fornecedores f WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND f.ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (f.razao_social ILIKE $${paramCount} OR f.nome_fantasia ILIKE $${paramCount} OR f.cnpj ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    if (filtros.tipo_fornecedor) {
      paramCount++;
      sql += ` AND f.tipo_fornecedor = $${paramCount}`;
      params.push(filtros.tipo_fornecedor);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Buscar fornecedores para select (apenas ativos)
  static async buscarParaSelect() {
    const sql = `
      SELECT f.id, f.razao_social, f.nome_fantasia
      FROM fornecedores f
      WHERE f.ativo = true
      ORDER BY f.razao_social ASC
    `;
    const result = await query(sql);
    return result.rows;
  }

  // Buscar tipos de fornecedor únicos
  static async buscarTiposFornecedor() {
    const sql = `
      SELECT DISTINCT tipo_fornecedor
      FROM fornecedores
      WHERE tipo_fornecedor IS NOT NULL AND tipo_fornecedor != ''
      ORDER BY tipo_fornecedor ASC
    `;
    const result = await query(sql);
    return result.rows.map(row => row.tipo_fornecedor);
  }

  // Buscar ramos de atividade únicos
  static async buscarRamosAtividade() {
    const sql = `
      SELECT DISTINCT ramo_atividade
      FROM fornecedores
      WHERE ramo_atividade IS NOT NULL AND ramo_atividade != ''
      ORDER BY ramo_atividade ASC
    `;
    const result = await query(sql);
    return result.rows.map(row => row.ramo_atividade);
  }

  // Estatísticas de fornecedores
  static async obterEstatisticas() {
    const sql = `
      SELECT 
        COUNT(*) as total_fornecedores,
        COUNT(CASE WHEN ativo = true THEN 1 END) as fornecedores_ativos,
        COUNT(DISTINCT tipo_fornecedor) as total_tipos,
        COUNT(DISTINCT ramo_atividade) as total_ramos
      FROM fornecedores
    `;
    const result = await query(sql);
    return result.rows[0];
  }

  // Validar CNPJ (formato básico)
  static validarCnpj(cnpj) {
    // Remove caracteres não numéricos
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      return false;
    }

    // Verifica se não são todos os dígitos iguais
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
      return false;
    }

    return true;
  }

  // Formatar CNPJ
  static formatarCnpj(cnpj) {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    return cnpjLimpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  // Validar email
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

module.exports = Fornecedor;


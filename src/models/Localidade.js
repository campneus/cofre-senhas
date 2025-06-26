const { query } = require('../config/database');

class Localidade {
  constructor(data) {
    this.id = data.id;
    this.codigo_localidade = data.codigo_localidade;
    this.cnpj = data.cnpj;
    this.nome_localidade = data.nome_localidade;
    this.endereco = data.endereco;
    this.telefone = data.telefone;
    this.email = data.email;
    this.observacoes = data.observacoes;
    this.ativo = data.ativo;
    this.criado_em = data.criado_em;
    this.atualizado_em = data.atualizado_em;
  }

  // Buscar todas as localidades
  static async buscarTodas(filtros = {}) {
    let sql = `
      SELECT id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
      FROM localidades 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (nome_localidade ILIKE $${paramCount} OR codigo_localidade ILIKE $${paramCount} OR cnpj ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    sql += ` ORDER BY nome_localidade ASC`;

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
    return result.rows.map(row => new Localidade(row));
  }

  // Buscar localidade por ID
  static async buscarPorId(id) {
    const sql = `
      SELECT id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
      FROM localidades 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? new Localidade(result.rows[0]) : null;
  }

  // Buscar localidade por código
  static async buscarPorCodigo(codigo) {
    const sql = `
      SELECT id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
      FROM localidades 
      WHERE codigo_localidade = $1
    `;
    const result = await query(sql, [codigo]);
    return result.rows.length > 0 ? new Localidade(result.rows[0]) : null;
  }

  // Buscar localidade por CNPJ
  static async buscarPorCnpj(cnpj) {
    const sql = `
      SELECT id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
      FROM localidades 
      WHERE cnpj = $1
    `;
    const result = await query(sql, [cnpj]);
    return result.rows.length > 0 ? new Localidade(result.rows[0]) : null;
  }

  // Criar nova localidade
  static async criar(dadosLocalidade) {
    const { codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes } = dadosLocalidade;
    
    // Verificar se código já existe
    const localidadeExistenteCodigo = await Localidade.buscarPorCodigo(codigo_localidade);
    if (localidadeExistenteCodigo) {
      throw new Error('Código de localidade já está em uso');
    }

    // Verificar se CNPJ já existe
    const localidadeExistenteCnpj = await Localidade.buscarPorCnpj(cnpj);
    if (localidadeExistenteCnpj) {
      throw new Error('CNPJ já está em uso');
    }

    const sql = `
      INSERT INTO localidades (codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
    `;
    
    const result = await query(sql, [codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes]);
    return new Localidade(result.rows[0]);
  }

  // Atualizar localidade
  static async atualizar(id, dadosLocalidade) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Campos que podem ser atualizados
    const camposPermitidos = ['codigo_localidade', 'cnpj', 'nome_localidade', 'endereco', 'telefone', 'email', 'observacoes', 'ativo'];
    
    for (const campo of camposPermitidos) {
      if (dadosLocalidade[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(dadosLocalidade[campo]);
      }
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    paramCount++;
    valores.push(id);

    const sql = `
      UPDATE localidades 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, codigo_localidade, cnpj, nome_localidade, endereco, telefone, email, observacoes, ativo, criado_em, atualizado_em
    `;

    const result = await query(sql, valores);
    return result.rows.length > 0 ? new Localidade(result.rows[0]) : null;
  }

  // Deletar localidade (soft delete)
  static async deletar(id) {
    const sql = `
      UPDATE localidades 
      SET ativo = false
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  // Contar total de localidades
  static async contar(filtros = {}) {
    let sql = 'SELECT COUNT(*) as total FROM localidades WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (nome_localidade ILIKE $${paramCount} OR codigo_localidade ILIKE $${paramCount} OR cnpj ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Buscar localidades para select (apenas ativas)
  static async buscarParaSelect() {
    const sql = `
      SELECT id, codigo_localidade, nome_localidade
      FROM localidades 
      WHERE ativo = true
      ORDER BY nome_localidade ASC
    `;
    const result = await query(sql);
    return result.rows;
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
}

module.exports = Localidade;


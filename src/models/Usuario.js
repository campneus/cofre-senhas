const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha_hash = data.senha_hash;
    this.tipo_usuario = data.tipo_usuario;
    this.ativo = data.ativo;
    this.ultimo_acesso = data.ultimo_acesso;
    this.criado_em = data.criado_em;
    this.atualizado_em = data.atualizado_em;
  }

  // Buscar todos os usuários
  static async buscarTodos(filtros = {}) {
    let sql = `
      SELECT id, nome, email, tipo_usuario, ativo, ultimo_acesso, criado_em, atualizado_em
      FROM usuarios 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.tipo_usuario) {
      paramCount++;
      sql += ` AND tipo_usuario = $${paramCount}`;
      params.push(filtros.tipo_usuario);
    }

    if (filtros.busca) {
      paramCount++;
      sql += ` AND (nome ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${filtros.busca}%`);
    }

    sql += ` ORDER BY nome ASC`;

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
    return result.rows.map(row => new Usuario(row));
  }

  // Buscar usuário por ID
  static async buscarPorId(id) {
    const sql = `
      SELECT id, nome, email, tipo_usuario, ativo, ultimo_acesso, criado_em, atualizado_em
      FROM usuarios 
      WHERE id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0 ? new Usuario(result.rows[0]) : null;
  }

  // Buscar usuário por email (incluindo senha para autenticação)
  static async buscarPorEmail(email) {
    const sql = `
      SELECT id, nome, email, senha_hash, tipo_usuario, ativo, ultimo_acesso, criado_em, atualizado_em
      FROM usuarios 
      WHERE email = $1 AND ativo = true
    `;
    const result = await query(sql, [email]);
    return result.rows.length > 0 ? new Usuario(result.rows[0]) : null;
  }

  // Criar novo usuário
  static async criar(dadosUsuario) {
    const { nome, email, senha, tipo_usuario } = dadosUsuario;
    
    // Verificar se email já existe
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      throw new Error('Email já está em uso');
    }

    // Criptografar senha
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nome, email, tipo_usuario, ativo, ultimo_acesso, criado_em, atualizado_em
    `;
    
    const result = await query(sql, [nome, email, senha_hash, tipo_usuario]);
    return new Usuario(result.rows[0]);
  }

  // Atualizar usuário
  static async atualizar(id, dadosUsuario) {
    const campos = [];
    const valores = [];
    let paramCount = 0;

    // Campos que podem ser atualizados
    const camposPermitidos = ['nome', 'email', 'tipo_usuario', 'ativo'];
    
    for (const campo of camposPermitidos) {
      if (dadosUsuario[campo] !== undefined) {
        paramCount++;
        campos.push(`${campo} = $${paramCount}`);
        valores.push(dadosUsuario[campo]);
      }
    }

    // Se há uma nova senha
    if (dadosUsuario.senha) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const senha_hash = await bcrypt.hash(dadosUsuario.senha, saltRounds);
      paramCount++;
      campos.push(`senha_hash = $${paramCount}`);
      valores.push(senha_hash);
    }

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    paramCount++;
    valores.push(id);

    const sql = `
      UPDATE usuarios 
      SET ${campos.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome, email, tipo_usuario, ativo, ultimo_acesso, criado_em, atualizado_em
    `;

    const result = await query(sql, valores);
    return result.rows.length > 0 ? new Usuario(result.rows[0]) : null;
  }

  // Deletar usuário (soft delete)
  static async deletar(id) {
    const sql = `
      UPDATE usuarios 
      SET ativo = false
      WHERE id = $1
      RETURNING id
    `;
    const result = await query(sql, [id]);
    return result.rows.length > 0;
  }

  // Atualizar último acesso
  static async atualizarUltimoAcesso(id) {
    const sql = `
      UPDATE usuarios 
      SET ultimo_acesso = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await query(sql, [id]);
  }

  // Verificar senha
  async verificarSenha(senha) {
    return await bcrypt.compare(senha, this.senha_hash);
  }

  // Contar total de usuários
  static async contar(filtros = {}) {
    let sql = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filtros.ativo !== undefined) {
      paramCount++;
      sql += ` AND ativo = $${paramCount}`;
      params.push(filtros.ativo);
    }

    if (filtros.tipo_usuario) {
      paramCount++;
      sql += ` AND tipo_usuario = $${paramCount}`;
      params.push(filtros.tipo_usuario);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Método para retornar dados seguros (sem senha)
  toJSON() {
    const { senha_hash, ...dadosSeguro } = this;
    return dadosSeguro;
  }
}

module.exports = Usuario;


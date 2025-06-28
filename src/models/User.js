const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { nome, email, senha, tipo_usuario, localidade_id } = userData;
    const hashedPassword = await bcrypt.hash(senha, 12);
    
    const query = `
      INSERT INTO usuarios (nome, email, senha, tipo_usuario, localidade_id, ativo, data_criacao)
      VALUES ($1, $2, $3, $4, $5, true, NOW())
      RETURNING id, nome, email, tipo_usuario, localidade_id, ativo, data_criacao
    `;
    
    const values = [nome, email, hashedPassword, tipo_usuario, localidade_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1 AND ativo = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, l.nome as localidade_nome 
      FROM usuarios u 
      LEFT JOIN localidades l ON u.localidade_id = l.id 
      WHERE u.id = $1 AND u.ativo = true
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT u.id, u.nome, u.email, u.tipo_usuario, u.ativo, u.data_criacao, u.ultimo_acesso,
             l.nome as localidade_nome
      FROM usuarios u 
      LEFT JOIN localidades l ON u.localidade_id = l.id 
      WHERE u.ativo = true
      ORDER BY u.data_criacao DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(id, userData) {
    const { nome, email, tipo_usuario, localidade_id, ativo } = userData;
    
    const query = `
      UPDATE usuarios 
      SET nome = $1, email = $2, tipo_usuario = $3, localidade_id = $4, ativo = $5, data_atualizacao = NOW()
      WHERE id = $6
      RETURNING id, nome, email, tipo_usuario, localidade_id, ativo
    `;
    
    const values = [nome, email, tipo_usuario, localidade_id, ativo, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updatePassword(id, novaSenha) {
    const hashedPassword = await bcrypt.hash(novaSenha, 12);
    
    const query = `
      UPDATE usuarios 
      SET senha = $1, data_atualizacao = NOW()
      WHERE id = $2
      RETURNING id
    `;
    
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }

  static async updateLastAccess(id) {
    const query = `
      UPDATE usuarios 
      SET ultimo_acesso = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  static async delete(id) {
    const query = `
      UPDATE usuarios 
      SET ativo = false, data_atualizacao = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;


const pool = require('../config/database');
const crypto = require('crypto');

class Password {
  static encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!';
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  static decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!';
    
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static async create(passwordData) {
    const { 
      sistema, 
      categoria, 
      localidade_id, 
      usuario, 
      senha, 
      url, 
      observacoes, 
      criado_por 
    } = passwordData;
    
    const encryptedPassword = this.encrypt(senha);
    
    const query = `
      INSERT INTO senhas (sistema, categoria, localidade_id, usuario, senha, url, observacoes, criado_por, data_criacao)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING id, sistema, categoria, localidade_id, usuario, url, observacoes, data_criacao
    `;
    
    const values = [sistema, categoria, localidade_id, usuario, encryptedPassword, url, observacoes, criado_por];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT s.id, s.sistema, s.categoria, s.localidade_id, s.usuario, s.url, s.observacoes, 
             s.data_criacao, s.data_atualizacao, s.ativo,
             l.nome as localidade_nome,
             u.nome as criado_por_nome
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      LEFT JOIN usuarios u ON s.criado_por = u.id
      WHERE s.ativo = true
    `;
    
    const values = [];
    let paramCount = 1;
    
    if (filters.categoria) {
      query += ` AND s.categoria = $${paramCount}`;
      values.push(filters.categoria);
      paramCount++;
    }
    
    if (filters.localidade_id) {
      query += ` AND s.localidade_id = $${paramCount}`;
      values.push(filters.localidade_id);
      paramCount++;
    }
    
    if (filters.search) {
      query += ` AND (s.sistema ILIKE $${paramCount} OR s.usuario ILIKE $${paramCount} OR s.url ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
      paramCount++;
    }
    
    query += ' ORDER BY s.data_criacao DESC';
    
    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT s.*, l.nome as localidade_nome, u.nome as criado_por_nome
      FROM senhas s
      LEFT JOIN localidades l ON s.localidade_id = l.id
      LEFT JOIN usuarios u ON s.criado_por = u.id
      WHERE s.id = $1 AND s.ativo = true
    `;
    
    const result = await pool.query(query, [id]);
    if (result.rows[0]) {
      const password = result.rows[0];
      password.senha = this.decrypt(password.senha);
      return password;
    }
    return null;
  }

  static async update(id, passwordData) {
    const { 
      sistema, 
      categoria, 
      localidade_id, 
      usuario, 
      senha, 
      url, 
      observacoes 
    } = passwordData;
    
    const encryptedPassword = senha ? this.encrypt(senha) : null;
    
    let query = `
      UPDATE senhas 
      SET sistema = $1, categoria = $2, localidade_id = $3, usuario = $4, 
          url = $6, observacoes = $7, data_atualizacao = NOW()
    `;
    
    let values = [sistema, categoria, localidade_id, usuario, id, url, observacoes];
    
    if (encryptedPassword) {
      query = query.replace('url = $6', 'senha = $5, url = $6');
      values = [sistema, categoria, localidade_id, usuario, encryptedPassword, url, observacoes, id];
    }
    
    query += ' WHERE id = $' + (encryptedPassword ? '8' : '5') + ' RETURNING id';
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      UPDATE senhas 
      SET ativo = false, data_atualizacao = NOW()
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN categoria = 'prefeituras' THEN 1 END) as prefeituras,
        COUNT(CASE WHEN categoria = 'fornecedores' THEN 1 END) as fornecedores,
        COUNT(CASE WHEN categoria = 'orgaos' THEN 1 END) as orgaos,
        COUNT(CASE WHEN categoria = 'b2fleet' THEN 1 END) as b2fleet
      FROM senhas 
      WHERE ativo = true
    `;
    
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Password;


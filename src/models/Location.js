const pool = require('../config/database');

class Location {
  static async findAll() {
    const query = `
      SELECT id, nome, ativo
      FROM localidades 
      WHERE ativo = true
      ORDER BY nome
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT id, nome, ativo
      FROM localidades 
      WHERE id = $1 AND ativo = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(locationData) {
    const { id, nome } = locationData;
    
    const query = `
      INSERT INTO localidades (id, nome, ativo)
      VALUES ($1, $2, true)
      RETURNING id, nome, ativo
    `;
    
    const values = [id, nome];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, locationData) {
    const { nome, ativo } = locationData;
    
    const query = `
      UPDATE localidades 
      SET nome = $1, ativo = $2
      WHERE id = $3
      RETURNING id, nome, ativo
    `;
    
    const values = [nome, ativo, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      UPDATE localidades 
      SET ativo = false
      WHERE id = $1
      RETURNING id
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Location;


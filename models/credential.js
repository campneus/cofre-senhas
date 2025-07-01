// models/credential.js
const { pool } = require('../config/database');

const Credential = {
  // Get all credentials
  getAll: async () => {
    try {
      const result = await pool.query(
        `SELECT c.*, cat.name as category_name, l.name as location_name 
         FROM credentials c 
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN locations l ON c.location_id = l.id
         ORDER BY l.name ASC, c.system_name`
      );
      return result.rows;
    } catch (err) {
      console.error('Error getting all credentials:', err);
      throw err;
    }
  },

  // Get credentials by category
  getByCategory: async (categoryId) => {
    try {
      const result = await pool.query(
        `SELECT c.*, cat.name as category_name, l.name as location_name 
         FROM credentials c 
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN locations l ON c.location_id = l.id
         WHERE c.category_id = $1
         ORDER BY l.name ASC, c.system_name`,
        [categoryId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error getting credentials by category:', err);
      throw err;
    }
  },

  // Search credentials
  search: async (searchTerm) => {
    const term = `%${searchTerm}%`;
    try {
      const result = await pool.query(
        `SELECT c.*, cat.name as category_name, l.name as location_name 
         FROM credentials c 
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN locations l ON c.location_id = l.id
         WHERE 
           c.system_name ILIKE $1 OR
           c.username ILIKE $1 OR
           l.name ILIKE $1 OR
           c.url ILIKE $1
         ORDER BY l.name ASC, c.system_name`,
        [term]
      );
      return result.rows;
    } catch (err) {
      console.error('Error searching credentials:', err);
      throw err;
    }
  },

  // Get a credential by ID
  getById: async (id) => {
    try {
      const result = await pool.query(
        `SELECT c.*, cat.name as category_name, l.name as location_name 
         FROM credentials c 
         LEFT JOIN categories cat ON c.category_id = cat.id
         LEFT JOIN locations l ON c.location_id = l.id
         WHERE c.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error getting credential by id:', err);
      throw err;
    }
  },

  // Create a new credential
  create: async (systemName, categoryId, locationId, username, password, url, notes) => {
    try {
      const result = await pool.query(
        `INSERT INTO credentials 
         (system_name, category_id, location_id, username, password, url, notes, last_updated) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
         RETURNING *`,
        [systemName, categoryId, locationId, username, password, url, notes]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating credential:', err);
      throw err;
    }
  },

  // Update a credential
  update: async (id, systemName, categoryId, locationId, username, password, url, notes) => {
    try {
      const result = await pool.query(
        `UPDATE credentials 
         SET system_name = $1, 
             category_id = $2, 
             location_id = $3, 
             username = $4, 
             password = $5, 
             url = $6, 
             notes = $7, 
             last_updated = NOW() 
         WHERE id = $8 
         RETURNING *`,
        [systemName, categoryId, locationId, username, password, url, notes, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating credential:', err);
      throw err;
    }
  },

  // Delete a credential
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM credentials WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error deleting credential:', err);
      throw err;
    }
  }
};

module.exports = Credential;
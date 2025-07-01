// models/category.js
const { pool } = require('../config/database');

const Category = {
  // Get all categories
  getAll: async () => {
    try {
      const result = await pool.query(
        'SELECT * FROM categories ORDER BY name'
      );
      return result.rows;
    } catch (err) {
      console.error('Error getting all categories:', err);
      throw err;
    }
  },

  // Get a category by ID
  getById: async (id) => {
    try {
      const result = await pool.query(
        'SELECT * FROM categories WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error getting category by id:', err);
      throw err;
    }
  },

  // Create a new category
  create: async (name) => {
    try {
      const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  },

  // Update a category
  update: async (id, name) => {
    try {
      const result = await pool.query(
        'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  },

  // Delete a category
  delete: async (id) => {
    try {
      // Check if category is in use
      const checkResult = await pool.query(
        'SELECT COUNT(*) FROM credentials WHERE category_id = $1',
        [id]
      );
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Esta categoria está sendo utilizada e não pode ser excluída');
      }
      
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  },
  
  // Get location model
  getLocations: async () => {
    try {
      const result = await pool.query(
        'SELECT * FROM locations ORDER BY name'
      );
      return result.rows;
    } catch (err) {
      console.error('Error getting all locations:', err);
      throw err;
    }
  },
  
  // Create a new location
  createLocation: async (name) => {
    try {
      const result = await pool.query(
        'INSERT INTO locations (name) VALUES ($1) RETURNING *',
        [name]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error creating location:', err);
      throw err;
    }
  },
  
  // Get a location by ID
  getLocationById: async (id) => {
    try {
      const result = await pool.query(
        'SELECT * FROM locations WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error getting location by id:', err);
      throw err;
    }
  },
  
  // Update a location
  updateLocation: async (id, name) => {
    try {
      const result = await pool.query(
        'UPDATE locations SET name = $1 WHERE id = $2 RETURNING *',
        [name, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating location:', err);
      throw err;
    }
  },
  
  // Delete a location
  deleteLocation: async (id) => {
    try {
      // Check if location is in use
      const checkResult = await pool.query(
        'SELECT COUNT(*) FROM credentials WHERE location_id = $1',
        [id]
      );
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        throw new Error('Esta localidade está sendo utilizada e não pode ser excluída');
      }
      
      await pool.query('DELETE FROM locations WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error deleting location:', err);
      throw err;
    }
  }
};

module.exports = Category;
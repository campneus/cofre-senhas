// models/user.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  // Find a user by email
  findByEmail: async (email) => {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  },

  // Find a user by ID
  findById: async (id) => {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  },

  // Create a new user
  create: async (name, email, password, role) => {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert the user into the database
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
        [name, email, hashedPassword, role]
      );

      return result.rows[0];
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  },

  // Update user's last login time
  updateLastLogin: async (userId) => {
    try {
      const result = await pool.query(
        'UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING last_login',
        [userId]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating last login:', err);
      throw err;
    }
  },

  // Get all users
  getAll: async () => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, created_at, last_login FROM users ORDER BY name'
      );
      return result.rows;
    } catch (err) {
      console.error('Error getting all users:', err);
      throw err;
    }
  },

  // Update a user
  update: async (id, name, email, role) => {
    try {
      const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role',
        [name, email, role, id]
      );
      return result.rows[0];
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  },

  // Update a user's password
  updatePassword: async (id, password) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      return true;
    } catch (err) {
      console.error('Error updating user password:', err);
      throw err;
    }
  },

  // Delete a user
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }
};

module.exports = User;
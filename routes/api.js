// routes/api.js
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const Credential = require('../models/credential');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Call the dashboard_stats database function
    const result = await pool.query('SELECT dashboard_stats()');
    
    if (result.rows && result.rows.length > 0) {
      res.json(result.rows[0].dashboard_stats);
    } else {
      // If function fails, fallback to manual counting
      const prefeituras = await countCredentialsByCategory(1);
      const fornecedores = await countCredentialsByCategory(2);
      const orgaos = await countCredentialsByCategory(3);
      const b2fleet = await countCredentialsByCategory(4);
      const total = prefeituras + fornecedores + orgaos + b2fleet;
      
      res.json({
        prefeituras,
        fornecedores,
        orgaos,
        b2fleet,
        total
      });
    }
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to count credentials by category
async function countCredentialsByCategory(categoryId) {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM credentials WHERE category_id = $1',
      [categoryId]
    );
    return parseInt(result.rows[0].count);
  } catch (err) {
    console.error(`Error counting credentials for category ${categoryId}:`, err);
    return 0;
  }
}

// Get categories with counts
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_credential_counts()');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting category counts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get locations with counts
router.get('/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM get_location_counts()');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting location counts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
// routes/health.js
const express = require('express');
const router = express.Router();
const { Sequelize } = require('sequelize');
const db = require('../config/database');

/**
 * @route GET /health
 * @desc Health check endpoint for monitoring
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    // Check database connection
    await db.authenticate();
    
    // Return healthy status with timestamp
    return res.status(200).json({
      status: 'healthy',
      message: 'Service is running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    // Return unhealthy status if database connection fails
    console.error('Health check failed:', error);
    return res.status(503).json({
      status: 'unhealthy',
      message: 'Service is experiencing issues',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'production' ? 'Database connection error' : error.message
    });
  }
});

module.exports = router;
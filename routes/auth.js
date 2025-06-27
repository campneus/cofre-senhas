// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/auth');

// Login route
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

// Home route (dashboard)
router.get('/', ensureAuthenticated, authController.getDashboard);

module.exports = router;
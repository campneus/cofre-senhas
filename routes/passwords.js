// routes/passwords.js
const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');
const { ensureAuthenticated } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);

// Get all passwords
router.get('/', passwordController.getAllPasswords);

// Get passwords by category
router.get('/category/:category', passwordController.getPasswordsByCategory);

// Get a single password
router.get('/:id', passwordController.getPasswordById);

// Create new password
router.post('/', passwordController.createPassword);

// Update password
router.put('/:id', passwordController.updatePassword);

// Delete password
router.delete('/:id', passwordController.deletePassword);

module.exports = router;
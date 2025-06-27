// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);
router.use(ensureAdmin); // Only admins can manage users

// Get all users
router.get('/', userController.getAllUsers);

// Get a single user
router.get('/:id', userController.getUserById);

// Create new user
router.post('/', userController.createUser);

// Update user
router.put('/:id', userController.updateUser);

// Delete user
router.delete('/:id', userController.deleteUser);

module.exports = router;
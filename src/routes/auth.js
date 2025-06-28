const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 1 })
    .withMessage('Senha é obrigatória')
];

const changePasswordValidation = [
  body('senhaAtual')
    .isLength({ min: 1 })
    .withMessage('Senha atual é obrigatória'),
  body('novaSenha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
];

// Rotas públicas
router.post('/login', loginValidation, AuthController.login);

// Rotas protegidas
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);
router.post('/change-password', authenticateToken, changePasswordValidation, AuthController.changePassword);

module.exports = router;


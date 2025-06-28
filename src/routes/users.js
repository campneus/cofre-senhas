const express = require('express');
const { body } = require('express-validator');
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validações
const createUserValidation = [
  body('nome')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('tipo_usuario')
    .isIn(['admin', 'analista'])
    .withMessage('Tipo de usuário deve ser admin ou analista'),
  body('localidade_id')
    .isInt({ min: 1 })
    .withMessage('Localidade deve ser um número válido')
];

const updateUserValidation = [
  body('nome')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  body('tipo_usuario')
    .isIn(['admin', 'analista'])
    .withMessage('Tipo de usuário deve ser admin ou analista'),
  body('localidade_id')
    .isInt({ min: 1 })
    .withMessage('Localidade deve ser um número válido'),
  body('ativo')
    .isBoolean()
    .withMessage('Ativo deve ser verdadeiro ou falso')
];

// Todas as rotas requerem autenticação e permissão de admin
router.use(authenticateToken, requireAdmin);

// Rotas CRUD
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', createUserValidation, UserController.create);
router.put('/:id', updateUserValidation, UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;


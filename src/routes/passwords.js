const express = require('express');
const { body } = require('express-validator');
const PasswordController = require('../controllers/passwordController');
const { authenticateToken, requireAdmin, requireAnalyst } = require('../middleware/auth');

const router = express.Router();

// Validações
const createPasswordValidation = [
  body('sistema')
    .isLength({ min: 2 })
    .withMessage('Sistema deve ter pelo menos 2 caracteres')
    .trim(),
  body('categoria')
    .isIn(['prefeituras', 'fornecedores', 'orgaos', 'b2fleet'])
    .withMessage('Categoria deve ser: prefeituras, fornecedores, orgaos ou b2fleet'),
  body('localidade_id')
    .isInt({ min: 1 })
    .withMessage('Localidade deve ser um número válido'),
  body('usuario')
    .isLength({ min: 1 })
    .withMessage('Usuário é obrigatório')
    .trim(),
  body('senha')
    .isLength({ min: 1 })
    .withMessage('Senha é obrigatória'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL deve ser válida'),
  body('observacoes')
    .optional()
    .trim()
];

const updatePasswordValidation = [
  body('sistema')
    .isLength({ min: 2 })
    .withMessage('Sistema deve ter pelo menos 2 caracteres')
    .trim(),
  body('categoria')
    .isIn(['prefeituras', 'fornecedores', 'orgaos', 'b2fleet'])
    .withMessage('Categoria deve ser: prefeituras, fornecedores, orgaos ou b2fleet'),
  body('localidade_id')
    .isInt({ min: 1 })
    .withMessage('Localidade deve ser um número válido'),
  body('usuario')
    .isLength({ min: 1 })
    .withMessage('Usuário é obrigatório')
    .trim(),
  body('senha')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Senha não pode estar vazia'),
  body('url')
    .optional()
    .isURL()
    .withMessage('URL deve ser válida'),
  body('observacoes')
    .optional()
    .trim()
];

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas que analistas podem acessar (apenas leitura)
router.get('/', requireAnalyst, PasswordController.getAll);
router.get('/stats', requireAnalyst, PasswordController.getStats);
router.get('/:id', requireAnalyst, PasswordController.getById);

// Rotas que apenas admins podem acessar (escrita)
router.post('/', requireAdmin, createPasswordValidation, PasswordController.create);
router.put('/:id', requireAdmin, updatePasswordValidation, PasswordController.update);
router.delete('/:id', requireAdmin, PasswordController.delete);

module.exports = router;


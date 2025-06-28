const express = require('express');
const LocationController = require('../controllers/locationController');
const { authenticateToken, requireAdmin, requireAnalyst } = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas que analistas podem acessar (apenas leitura)
router.get('/', requireAnalyst, LocationController.getAll);
router.get('/:id', requireAnalyst, LocationController.getById);

// Rotas que apenas admins podem acessar (escrita)
router.post('/', requireAdmin, LocationController.create);
router.put('/:id', requireAdmin, LocationController.update);
router.delete('/:id', requireAdmin, LocationController.delete);

module.exports = router;


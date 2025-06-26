const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Prefeitura = require('../models/Prefeitura');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/prefeituras - Listar prefeituras com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const { pagina = 1, limite = 20, busca, ativo } = req.query;
    
    const filtros = {};
    if (busca) filtros.busca = busca;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';
    
    const resultado = await Prefeitura.listar(
      parseInt(pagina),
      parseInt(limite),
      filtros
    );
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao listar prefeituras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/prefeituras/select/opcoes - Opções para select
router.get('/select/opcoes', async (req, res) => {
  try {
    const prefeituras = await Prefeitura.listarParaSelect();
    
    res.json({
      success: true,
      data: { prefeituras }
    });
  } catch (error) {
    console.error('Erro ao buscar opções de prefeituras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/prefeituras/:id - Buscar prefeitura por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prefeitura = await Prefeitura.buscarPorId(id);
    
    if (!prefeitura) {
      return res.status(404).json({
        success: false,
        message: 'Prefeitura não encontrada'
      });
    }
    
    res.json({
      success: true,
      data: { prefeitura }
    });
  } catch (error) {
    console.error('Erro ao buscar prefeitura:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/prefeituras - Criar nova prefeitura (apenas admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const dadosPrefeitura = {
      ...req.body,
      criado_por: req.user.id
    };
    
    const prefeitura = await Prefeitura.criar(dadosPrefeitura);
    
    res.status(201).json({
      success: true,
      message: 'Prefeitura criada com sucesso',
      data: { prefeitura }
    });
  } catch (error) {
    console.error('Erro ao criar prefeitura:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/prefeituras/:id - Atualizar prefeitura (apenas admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = {
      ...req.body,
      atualizado_por: req.user.id
    };
    
    const prefeitura = await Prefeitura.atualizar(id, dadosAtualizacao);
    
    if (!prefeitura) {
      return res.status(404).json({
        success: false,
        message: 'Prefeitura não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Prefeitura atualizada com sucesso',
      data: { prefeitura }
    });
  } catch (error) {
    console.error('Erro ao atualizar prefeitura:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'CNPJ já cadastrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/prefeituras/:id - Excluir prefeitura (apenas admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sucesso = await Prefeitura.excluir(id);
    
    if (!sucesso) {
      return res.status(404).json({
        success: false,
        message: 'Prefeitura não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Prefeitura excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir prefeitura:', error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir prefeitura com senhas vinculadas'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;


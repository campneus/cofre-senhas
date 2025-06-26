const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Fornecedor = require('../models/Fornecedor');

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// GET /api/fornecedores - Listar fornecedores com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const { pagina = 1, limite = 20, busca, ativo } = req.query;
    
    const filtros = {};
    if (busca) filtros.busca = busca;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';
    
    const resultado = await Fornecedor.listar(
      parseInt(pagina),
      parseInt(limite),
      filtros
    );
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/fornecedores/select/opcoes - Opções para select
router.get('/select/opcoes', async (req, res) => {
  try {
    const fornecedores = await Fornecedor.listarParaSelect();
    
    res.json({
      success: true,
      data: { fornecedores }
    });
  } catch (error) {
    console.error('Erro ao buscar opções de fornecedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/fornecedores/:id - Buscar fornecedor por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fornecedor = await Fornecedor.buscarPorId(id);
    
    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: { fornecedor }
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/fornecedores - Criar novo fornecedor (apenas admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const dadosFornecedor = {
      ...req.body,
      criado_por: req.user.id
    };
    
    const fornecedor = await Fornecedor.criar(dadosFornecedor);
    
    res.status(201).json({
      success: true,
      message: 'Fornecedor criado com sucesso',
      data: { fornecedor }
    });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    
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

// PUT /api/fornecedores/:id - Atualizar fornecedor (apenas admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = {
      ...req.body,
      atualizado_por: req.user.id
    };
    
    const fornecedor = await Fornecedor.atualizar(id, dadosAtualizacao);
    
    if (!fornecedor) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Fornecedor atualizado com sucesso',
      data: { fornecedor }
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    
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

// DELETE /api/fornecedores/:id - Excluir fornecedor (apenas admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sucesso = await Fornecedor.excluir(id);
    
    if (!sucesso) {
      return res.status(404).json({
        success: false,
        message: 'Fornecedor não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Fornecedor excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir fornecedor com senhas vinculadas'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;


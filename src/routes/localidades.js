const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Localidade = require('../models/Localidade');
const { 
  verificarAutenticacao, 
  verificarAdministrador, 
  logAcesso 
} = require('../middleware/auth');

const router = express.Router();

// Validações
const validacaoLocalidade = [
  body('codigo_localidade')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Código da localidade deve ter entre 1 e 20 caracteres'),
  body('cnpj')
    .trim()
    .custom((value) => {
      if (!Localidade.validarCnpj(value)) {
        throw new Error('CNPJ inválido');
      }
      return true;
    }),
  body('nome_localidade')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Nome da localidade deve ter entre 1 e 200 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('telefone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
];

const validacaoBusca = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100')
];

// Listar localidades
router.get('/', [
  verificarAutenticacao,
  validacaoBusca
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: errors.array()
      });
    }

    const pagina = parseInt(req.query.pagina) || 1;
    const limite = parseInt(req.query.limite) || 20;
    const offset = (pagina - 1) * limite;

    const filtros = {
      limite,
      offset,
      ativo: req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined,
      busca: req.query.busca
    };

    const [localidades, total] = await Promise.all([
      Localidade.buscarTodas(filtros),
      Localidade.contar(filtros)
    ]);

    res.json({
      success: true,
      data: {
        localidades,
        paginacao: {
          pagina_atual: pagina,
          total_paginas: Math.ceil(total / limite),
          total_registros: total,
          registros_por_pagina: limite
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar localidades:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar localidade por ID
router.get('/:id', [
  verificarAutenticacao
], async (req, res) => {
  try {
    const localidade = await Localidade.buscarPorId(req.params.id);
    
    if (!localidade) {
      return res.status(404).json({
        success: false,
        message: 'Localidade não encontrada'
      });
    }

    res.json({
      success: true,
      data: {
        localidade
      }
    });

  } catch (error) {
    console.error('Erro ao buscar localidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar nova localidade
router.post('/', [
  verificarAutenticacao,
  verificarAdministrador,
  logAcesso,
  ...validacaoLocalidade
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Formatar CNPJ
    const dadosLocalidade = {
      ...req.body,
      cnpj: Localidade.formatarCnpj(req.body.cnpj)
    };

    const novaLocalidade = await Localidade.criar(dadosLocalidade);

    res.status(201).json({
      success: true,
      message: 'Localidade criada com sucesso',
      data: {
        localidade: novaLocalidade
      }
    });

  } catch (error) {
    console.error('Erro ao criar localidade:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Atualizar localidade
router.put('/:id', [
  verificarAutenticacao,
  verificarAdministrador,
  logAcesso,
  ...validacaoLocalidade
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Formatar CNPJ se fornecido
    const dadosLocalidade = { ...req.body };
    if (dadosLocalidade.cnpj) {
      dadosLocalidade.cnpj = Localidade.formatarCnpj(dadosLocalidade.cnpj);
    }

    const localidadeAtualizada = await Localidade.atualizar(req.params.id, dadosLocalidade);
    
    if (!localidadeAtualizada) {
      return res.status(404).json({
        success: false,
        message: 'Localidade não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Localidade atualizada com sucesso',
      data: {
        localidade: localidadeAtualizada
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar localidade:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Deletar localidade (soft delete)
router.delete('/:id', [
  verificarAutenticacao,
  verificarAdministrador,
  logAcesso
], async (req, res) => {
  try {
    const sucesso = await Localidade.deletar(req.params.id);
    
    if (!sucesso) {
      return res.status(404).json({
        success: false,
        message: 'Localidade não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Localidade desativada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar localidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar localidades para select (apenas ativas)
router.get('/select/opcoes', [
  verificarAutenticacao
], async (req, res) => {
  try {
    const localidades = await Localidade.buscarParaSelect();

    res.json({
      success: true,
      data: {
        localidades
      }
    });

  } catch (error) {
    console.error('Erro ao buscar localidades para select:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Validar CNPJ
router.post('/validar/cnpj', [
  verificarAutenticacao,
  body('cnpj').trim().notEmpty().withMessage('CNPJ é obrigatório')
], async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { cnpj } = req.body;
    const cnpjValido = Localidade.validarCnpj(cnpj);
    
    if (!cnpjValido) {
      return res.json({
        success: false,
        message: 'CNPJ inválido',
        data: {
          valido: false
        }
      });
    }

    // Verificar se CNPJ já existe
    const localidadeExistente = await Localidade.buscarPorCnpj(Localidade.formatarCnpj(cnpj));
    
    res.json({
      success: true,
      data: {
        valido: true,
        ja_existe: !!localidadeExistente,
        cnpj_formatado: Localidade.formatarCnpj(cnpj)
      }
    });

  } catch (error) {
    console.error('Erro ao validar CNPJ:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;


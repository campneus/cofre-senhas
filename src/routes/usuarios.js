const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Usuario = require('../models/Usuario');
const { 
  verificarAutenticacao, 
  verificarAcessoUsuarios, 
  logAcesso 
} = require('../middleware/auth');

const router = express.Router();

// Validações
const validacaoUsuario = [
  body('nome')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nome deve ter entre 1 e 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('tipo_usuario')
    .isIn(['administrador', 'analista'])
    .withMessage('Tipo de usuário deve ser: administrador ou analista'),
  body('senha')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

const validacaoUsuarioCompleto = [
  ...validacaoUsuario,
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

const validacaoBusca = [
  query('pagina')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('tipo_usuario')
    .optional()
    .isIn(['administrador', 'analista'])
    .withMessage('Tipo de usuário inválido')
];

// Listar usuários (apenas administradores)
router.get('/', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
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
      tipo_usuario: req.query.tipo_usuario,
      busca: req.query.busca
    };

    const [usuarios, total] = await Promise.all([
      Usuario.buscarTodos(filtros),
      Usuario.contar(filtros)
    ]);

    res.json({
      success: true,
      data: {
        usuarios,
        paginacao: {
          pagina_atual: pagina,
          total_paginas: Math.ceil(total / limite),
          total_registros: total,
          registros_por_pagina: limite
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Buscar usuário por ID (apenas administradores)
router.get('/:id', [
  verificarAutenticacao,
  verificarAcessoUsuarios
], async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        usuario
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Criar novo usuário (apenas administradores)
router.post('/', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
  logAcesso,
  ...validacaoUsuarioCompleto
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

    const novoUsuario = await Usuario.criar(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        usuario: novoUsuario
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Atualizar usuário (apenas administradores)
router.put('/:id', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
  logAcesso,
  ...validacaoUsuario
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

    // Não permitir que o usuário desative a si mesmo
    if (req.params.id === req.usuario.id && req.body.ativo === false) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode desativar sua própria conta'
      });
    }

    // Não permitir que o usuário altere seu próprio tipo
    if (req.params.id === req.usuario.id && req.body.tipo_usuario && req.body.tipo_usuario !== req.usuario.tipo_usuario) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode alterar seu próprio tipo de usuário'
      });
    }

    const usuarioAtualizado = await Usuario.atualizar(req.params.id, req.body);
    
    if (!usuarioAtualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        usuario: usuarioAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
});

// Deletar usuário (soft delete - apenas administradores)
router.delete('/:id', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
  logAcesso
], async (req, res) => {
  try {
    // Não permitir que o usuário delete a si mesmo
    if (req.params.id === req.usuario.id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    const sucesso = await Usuario.deletar(req.params.id);
    
    if (!sucesso) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Verificar se email já existe
router.post('/verificar/email', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
  body('email').isEmail().normalizeEmail().withMessage('Email deve ser válido')
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

    const { email } = req.body;
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    
    res.json({
      success: true,
      data: {
        existe: !!usuarioExistente,
        usuario_id: usuarioExistente ? usuarioExistente.id : null
      }
    });

  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Resetar senha de usuário (apenas administradores)
router.post('/:id/resetar-senha', [
  verificarAutenticacao,
  verificarAcessoUsuarios,
  logAcesso,
  body('nova_senha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
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

    const { nova_senha } = req.body;
    
    const usuarioAtualizado = await Usuario.atualizar(req.params.id, { senha: nova_senha });
    
    if (!usuarioAtualizado) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Senha resetada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de usuários (apenas administradores)
router.get('/estatisticas/resumo', [
  verificarAutenticacao,
  verificarAcessoUsuarios
], async (req, res) => {
  try {
    const [totalUsuarios, usuariosAtivos, administradores, analistas] = await Promise.all([
      Usuario.contar(),
      Usuario.contar({ ativo: true }),
      Usuario.contar({ tipo_usuario: 'administrador', ativo: true }),
      Usuario.contar({ tipo_usuario: 'analista', ativo: true })
    ]);

    res.json({
      success: true,
      data: {
        estatisticas: {
          total_usuarios: totalUsuarios,
          usuarios_ativos: usuariosAtivos,
          administradores,
          analistas
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;


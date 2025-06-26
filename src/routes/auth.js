const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const { verificarAutenticacao, logAcesso } = require('../middleware/auth');

const router = express.Router();

// Validações
const validacaoLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
];

// Rota de login
router.post('/login', validacaoLogin, async (req, res) => {
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

    const { email, senha } = req.body;

    // Buscar usuário por email
    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Atualizar último acesso
    await Usuario.atualizarUltimoAcesso(usuario.id);

    // Criar sessão
    req.session.user = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };

    // Gerar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        usuario: usuario.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de logout
router.post('/logout', verificarAutenticacao, (req, res) => {
  try {
    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer logout'
        });
      }

      res.clearCookie('connect.sid'); // Nome padrão do cookie de sessão
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar se o usuário está autenticado
router.get('/me', verificarAutenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        usuario: usuario.toJSON()
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para renovar token
router.post('/refresh', verificarAutenticacao, (req, res) => {
  try {
    // Gerar novo token
    const token = jwt.sign(
      { 
        id: req.usuario.id,
        email: req.usuario.email,
        tipo_usuario: req.usuario.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token
      }
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota para alterar senha
router.put('/alterar-senha', [
  verificarAutenticacao,
  logAcesso,
  body('senhaAtual')
    .isLength({ min: 6 })
    .withMessage('Senha atual deve ter pelo menos 6 caracteres'),
  body('novaSenha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
  body('confirmarSenha')
    .custom((value, { req }) => {
      if (value !== req.body.novaSenha) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
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

    const { senhaAtual, novaSenha } = req.body;

    // Buscar usuário completo (com senha)
    const usuario = await Usuario.buscarPorEmail(req.usuario.email);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const senhaValida = await usuario.verificarSenha(senhaAtual);
    if (!senhaValida) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    await Usuario.atualizar(usuario.id, { senha: novaSenha });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;


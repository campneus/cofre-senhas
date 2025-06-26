const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar se o usuário está autenticado
const verificarAutenticacao = async (req, res, next) => {
  try {
    // Verificar se há sessão ativa
    if (req.session && req.session.user) {
      req.usuario = req.session.user;
      return next();
    }

    // Verificar token JWT no header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const usuario = await Usuario.buscarPorId(decoded.id);
      
      if (!usuario || !usuario.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não encontrado ou inativo'
        });
      }

      req.usuario = usuario;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é administrador
const verificarAdministrador = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  if (req.usuario.tipo_usuario !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.'
    });
  }

  next();
};

// Middleware para verificar se o usuário pode visualizar senhas
const verificarAcessoSenhas = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  // Tanto administrador quanto analista podem visualizar senhas
  if (req.usuario.tipo_usuario !== 'administrador' && req.usuario.tipo_usuario !== 'analista') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você não tem permissão para visualizar senhas.'
    });
  }

  next();
};

// Middleware para verificar se o usuário pode modificar senhas
const verificarModificacaoSenhas = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  // Apenas administradores podem criar, editar ou deletar senhas
  if (req.usuario.tipo_usuario !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem modificar senhas.'
    });
  }

  next();
};

// Middleware para verificar se o usuário pode acessar usuários
const verificarAcessoUsuarios = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuário não autenticado'
    });
  }

  // Apenas administradores podem visualizar e gerenciar usuários
  if (req.usuario.tipo_usuario !== 'administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar o gerenciamento de usuários.'
    });
  }

  next();
};

// Middleware para log de acesso
const logAcesso = async (req, res, next) => {
  try {
    if (req.usuario && req.method !== 'GET') {
      // Log apenas para operações que modificam dados
      const { query } = require('../config/database');
      
      await query(`
        INSERT INTO logs_acesso (usuario_id, acao, ip_address, user_agent)
        VALUES ($1, $2, $3, $4)
      `, [
        req.usuario.id,
        `${req.method} ${req.originalUrl}`,
        req.ip || req.connection.remoteAddress,
        req.get('User-Agent')
      ]);
    }
  } catch (error) {
    console.error('Erro ao registrar log de acesso:', error);
    // Não bloquear a requisição por erro de log
  }
  
  next();
};

// Middleware para verificar rate limiting por usuário
const rateLimitPorUsuario = (maxTentativas = 10, janelaTempo = 15 * 60 * 1000) => {
  const tentativas = new Map();

  return (req, res, next) => {
    if (!req.usuario) {
      return next();
    }

    const chave = req.usuario.id;
    const agora = Date.now();
    
    if (!tentativas.has(chave)) {
      tentativas.set(chave, { count: 1, resetTime: agora + janelaTempo });
      return next();
    }

    const dadosUsuario = tentativas.get(chave);
    
    if (agora > dadosUsuario.resetTime) {
      tentativas.set(chave, { count: 1, resetTime: agora + janelaTempo });
      return next();
    }

    if (dadosUsuario.count >= maxTentativas) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.'
      });
    }

    dadosUsuario.count++;
    next();
  };
};

module.exports = {
  verificarAutenticacao,
  verificarAdministrador,
  verificarAcessoSenhas,
  verificarModificacaoSenhas,
  verificarAcessoUsuarios,
  logAcesso,
  rateLimitPorUsuario
};


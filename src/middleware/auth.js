const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token de acesso requerido' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Apenas administradores podem realizar esta ação.' 
    });
  }
  next();
};

const requireAnalyst = (req, res, next) => {
  if (req.user.tipo_usuario !== 'analista' && req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Permissão insuficiente.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAnalyst
};


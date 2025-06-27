// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Ensure the user is authenticated
exports.ensureAuthenticated = async (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        req.flash('error', 'Por favor, faça login para acessar esta página');
        return res.redirect('/login');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cofre-campneus-jwt-secret');
        
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            res.clearCookie('token');
            req.flash('error', 'Usuário não encontrado');
            return res.redirect('/login');
        }
        
        if (!user.active) {
            res.clearCookie('token');
            req.flash('error', 'Conta desativada. Entre em contato com o administrador.');
            return res.redirect('/login');
        }
        
        req.user = user;
        res.locals.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.clearCookie('token');
        req.flash('error', 'Sessão inválida ou expirada. Por favor, faça login novamente.');
        res.redirect('/login');
    }
};

// Ensure the user is an administrator
exports.ensureAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    
    req.flash('error_msg', 'Acesso negado. Permissão de administrador necessária.');
    res.redirect('/');
};

// Ensure the user is at least a manager
exports.ensureManager = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        return next();
    }
    
    req.flash('error_msg', 'Acesso negado. Permissão de gerente necessária.');
    res.redirect('/');
};
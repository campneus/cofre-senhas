// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

// Login page
router.get('/login', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login | Cofre Campneus' });
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      req.flash('error_msg', 'Por favor, preencha todos os campos');
      return res.redirect('/login');
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      req.flash('error_msg', 'Email ou senha inválidos');
      return res.redirect('/login');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error_msg', 'Email ou senha inválidos');
      return res.redirect('/login');
    }

    // Update last login time
    await User.updateLastLogin(user.id);

    // Create session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    req.flash('success_msg', 'Login realizado com sucesso');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro no servidor, tente novamente');
    res.redirect('/login');
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Create a default admin user on first run (only if no users exist)
router.get('/setup', async (req, res) => {
  try {
    // Check if there are any users
    const users = await User.getAll();
    
    if (users.length === 0) {
      // Create default admin
      await User.create('Administrador', 'admin@campneus.com', 'admin123', 'admin');
      req.flash('success_msg', 'Usuário administrador criado com sucesso. Use email: admin@campneus.com e senha: admin123');
    } else {
      req.flash('error_msg', 'Setup já foi realizado anteriormente');
    }
    
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao configurar o sistema');
    res.redirect('/login');
  }
});

// Admin only middleware
function checkAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Acesso restrito a administradores');
  return res.redirect('/dashboard');
}

// User management routes (admin only)
router.get('/users', checkAdmin, async (req, res) => {
  try {
    const users = await User.getAll();
    res.render('users', { 
      title: 'Gerenciar Usuários | Cofre Campneus',
      users
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao obter usuários');
    res.redirect('/dashboard');
  }
});

router.post('/users', checkAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validation
    if (!name || !email || !password || !role) {
      req.flash('error_msg', 'Por favor, preencha todos os campos');
      return res.redirect('/users');
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'Este email já está em uso');
      return res.redirect('/users');
    }
    
    // Create user
    await User.create(name, email, password, role);
    req.flash('success_msg', 'Usuário criado com sucesso');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao criar usuário');
    res.redirect('/users');
  }
});

router.put('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;
    
    // Update user details
    await User.update(id, name, email, role);
    
    // Update password if provided
    if (password && password.trim() !== '') {
      await User.updatePassword(id, password);
    }
    
    req.flash('success_msg', 'Usuário atualizado com sucesso');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar usuário');
    res.redirect('/users');
  }
});

router.delete('/users/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (req.session.user.id.toString() === id) {
      req.flash('error_msg', 'Você não pode excluir sua própria conta');
      return res.redirect('/users');
    }
    
    await User.delete(id);
    req.flash('success_msg', 'Usuário excluído com sucesso');
    res.redirect('/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao excluir usuário');
    res.redirect('/users');
  }
});

module.exports = router;
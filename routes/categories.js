// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Middleware to check if user is admin
function checkAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Acesso restrito a administradores');
  return res.redirect('/dashboard');
}

// Middleware to check if user can edit (admin only)
function checkCanEdit(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Você não tem permissão para alterar senhas');
  return res.redirect('/credentials');
}

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.render('categories', {
      title: 'Categorias | Cofre Campneus',
      categories: categories || []
    });
  } catch (err) {
    console.error('Erro ao obter categorias:', err);
    req.flash('error_msg', 'Erro ao carregar categorias');
    res.render('categories', {
      title: 'Categorias | Cofre Campneus',
      categories: []
    });
  }
});

// Get locations page
router.get('/locations', async (req, res) => {
  try {
    const locations = await Category.getLocations();
    
    res.render('locations', {
      title: 'Localidades | Cofre Campneus',
      locations: locations || []
    });
  } catch (err) {
    console.error('Erro ao obter localidades:', err);
    req.flash('error_msg', 'Erro ao carregar localidades');
    res.render('locations', {
      title: 'Localidades | Cofre Campneus',
      locations: []
    });
  }
});

// Create new category (admin only)
router.post('/', checkAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      req.flash('error_msg', 'Nome da categoria é obrigatório');
      return res.redirect('/categories');
    }
    
    await Category.create(name.trim(), description ? description.trim() : '');
    req.flash('success_msg', 'Categoria criada com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error('Erro ao criar categoria:', err);
    req.flash('error_msg', 'Erro ao criar categoria');
    res.redirect('/categories');
  }
});

// Update category (admin only)
router.put('/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name || name.trim().length === 0) {
      req.flash('error_msg', 'Nome da categoria é obrigatório');
      return res.redirect('/categories');
    }
    
    await Category.update(id, name.trim(), description ? description.trim() : '');
    req.flash('success_msg', 'Categoria atualizada com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error('Erro ao atualizar categoria:', err);
    req.flash('error_msg', 'Erro ao atualizar categoria');
    res.redirect('/categories');
  }
});

// Delete category (admin only)
router.delete('/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await Category.delete(id);
    req.flash('success_msg', 'Categoria excluída com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error('Erro ao excluir categoria:', err);
    req.flash('error_msg', 'Erro ao excluir categoria');
    res.redirect('/categories');
  }
});

module.exports = router;


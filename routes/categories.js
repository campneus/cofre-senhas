// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.getAll();
    
    res.render('categories', { 
      title: 'Categorias | Cofre Campneus',
      categories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao obter categorias');
    res.redirect('/dashboard');
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name) {
      req.flash('error_msg', 'Por favor, informe o nome da categoria');
      return res.redirect('/categories');
    }
    
    await Category.create(name);
    req.flash('success_msg', 'Categoria criada com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao criar categoria');
    res.redirect('/categories');
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validation
    if (!name) {
      req.flash('error_msg', 'Por favor, informe o nome da categoria');
      return res.redirect('/categories');
    }
    
    await Category.update(id, name);
    req.flash('success_msg', 'Categoria atualizada com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar categoria');
    res.redirect('/categories');
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    await Category.delete(req.params.id);
    req.flash('success_msg', 'Categoria excluída com sucesso');
    res.redirect('/categories');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', err.message || 'Erro ao excluir categoria');
    res.redirect('/categories');
  }
});

// Locations routes
router.get('/locations', async (req, res) => {
  try {
    const locations = await Category.getLocations();
    
    res.render('locations', { 
      title: 'Localidades | Cofre Campneus',
      locations
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao obter localidades');
    res.redirect('/dashboard');
  }
});

// Create new location
router.post('/locations', async (req, res) => {
  try {
    const { name } = req.body;
    
    // Validation
    if (!name) {
      req.flash('error_msg', 'Por favor, informe o nome da localidade');
      return res.redirect('/categories/locations');
    }
    
    await Category.createLocation(name);
    req.flash('success_msg', 'Localidade criada com sucesso');
    res.redirect('/categories/locations');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao criar localidade');
    res.redirect('/categories/locations');
  }
});

// Update location
router.put('/locations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validation
    if (!name) {
      req.flash('error_msg', 'Por favor, informe o nome da localidade');
      return res.redirect('/categories/locations');
    }
    
    await Category.updateLocation(id, name);
    req.flash('success_msg', 'Localidade atualizada com sucesso');
    res.redirect('/categories/locations');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar localidade');
    res.redirect('/categories/locations');
  }
});

// Delete location
router.delete('/locations/:id', async (req, res) => {
  try {
    await Category.deleteLocation(req.params.id);
    req.flash('success_msg', 'Localidade excluída com sucesso');
    res.redirect('/categories/locations');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', err.message || 'Erro ao excluir localidade');
    res.redirect('/categories/locations');
  }
});

module.exports = router;
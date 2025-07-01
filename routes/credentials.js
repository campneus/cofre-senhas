// routes/credentials.js
const express = require('express');
const router = express.Router();
const Credential = require('../models/credential');
const Category = require('../models/category');

// Middleware to check if user can edit (admin only)
function checkCanEdit(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error_msg', 'Você não tem permissão para alterar senhas');
  return res.redirect('/credentials');
}

// Get all credentials
router.get('/', async (req, res) => {
  try {
    let credentials;
    const categoryId = req.query.category;
    const searchTerm = req.query.search;
    
    // Get categories and locations for the filter dropdown
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    // Filter by category if provided
    if (categoryId && categoryId !== 'all') {
      credentials = await Credential.getByCategory(categoryId);
    } 
    // Search if term provided
    else if (searchTerm) {
      credentials = await Credential.search(searchTerm);
    }
    // Otherwise get all
    else {
      credentials = await Credential.getAll();
    }
    
    // Determine the page title based on category
    let pageTitle = 'Gerenciamento de Senhas | Cofre Campneus';
    if (categoryId && categoryId !== 'all') {
      const selectedCat = categories.find(c => c.id == categoryId);
      if (selectedCat) {
        pageTitle = `${selectedCat.name} - Senhas | Cofre Campneus`;
      }
    }
    
    res.render('credentials', { 
      title: pageTitle,
      credentials,
      categories,
      locations,
      selectedCategory: categoryId,
      searchTerm
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao obter credenciais');
    res.redirect('/dashboard');
  }
});

// Get credential by ID
router.get('/:id', async (req, res) => {
  try {
    const credential = await Credential.getById(req.params.id);
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    if (!credential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    res.render('credential-detail', {
      title: 'Detalhes da Credencial | Cofre Campneus',
      credential,
      categories,
      locations
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao obter detalhes da credencial');
    res.redirect('/credentials');
  }
});

// Create new credential form
router.get('/new/create', checkCanEdit, async (req, res) => {
  try {
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    res.render('credential-form', {
      title: 'Nova Senha | Cofre Campneus',
      categories,
      locations,
      credential: {}
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao carregar formulário');
    res.redirect('/credentials');
  }
});

// Create new credential
router.post('/', checkCanEdit, async (req, res) => {
  try {
    const { system_name, category_id, location_id, username, password, url, notes } = req.body;
    
    // Validation
    if (!system_name || !category_id || !username || !password) {
      req.flash('error_msg', 'Por favor, preencha todos os campos obrigatórios');
      return res.redirect('/credentials/new/create');
    }
    
    // Create credential
    await Credential.create(
      system_name,
      category_id,
      location_id || null,
      username,
      password,
      url || '',
      notes || ''
    );
    
    req.flash('success_msg', 'Credencial criada com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao criar credencial');
    res.redirect('/credentials/new/create');
  }
});

// Edit credential form
router.get('/edit/:id', checkCanEdit, async (req, res) => {
  try {
    const credential = await Credential.getById(req.params.id);
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    if (!credential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    res.render('credential-form', {
      title: 'Editar Senha | Cofre Campneus',
      credential,
      categories,
      locations
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao carregar formulário de edição');
    res.redirect('/credentials');
  }
});

// Update credential
router.put('/:id', checkCanEdit, async (req, res) => {
  try {
    const { id } = req.params;
    const { system_name, category_id, location_id, username, password, url, notes } = req.body;
    
    // Validation
    if (!system_name || !category_id || !username || !password) {
      req.flash('error_msg', 'Por favor, preencha todos os campos obrigatórios');
      return res.redirect(`/credentials/edit/${id}`);
    }
    
    // Update credential
    await Credential.update(
      id,
      system_name,
      category_id,
      location_id || null,
      username,
      password,
      url || '',
      notes || ''
    );
    
    req.flash('success_msg', 'Credencial atualizada com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao atualizar credencial');
    res.redirect(`/credentials/edit/${req.params.id}`);
  }
});

// Delete credential
router.delete('/:id', checkCanEdit, async (req, res) => {
  try {
    await Credential.delete(req.params.id);
    req.flash('success_msg', 'Credencial excluída com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Erro ao excluir credencial');
    res.redirect('/credentials');
  }
});

module.exports = router;
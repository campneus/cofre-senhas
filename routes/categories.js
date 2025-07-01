// routes/credentials.js
const express = require('express');
const router = express.Router();
const Credential = require('../models/credential');
const Category = require('../models/category');

// Get all credentials
router.get('/', async (req, res) => {
  try {
    let credentials = [];
    const categoryId = req.query.category;
    const searchTerm = req.query.search || '';
    
    // Get categories and locations for the filter dropdown
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    // Build query based on filters
    if (searchTerm && categoryId && categoryId !== 'all') {
      // Search within specific category
      credentials = await Credential.searchByCategory(searchTerm, categoryId);
    } else if (searchTerm) {
      // Search across all credentials
      credentials = await Credential.search(searchTerm);
    } else if (categoryId && categoryId !== 'all') {
      // Filter by category only
      credentials = await Credential.getByCategory(categoryId);
    } else {
      // Get all credentials
      credentials = await Credential.getAll();
    }
    
    res.render('credentials', { 
      title: 'Gerenciamento de Senhas | Cofre Campneus',
      credentials: credentials || [],
      categories: categories || [],
      locations: locations || [],
      selectedCategory: categoryId || 'all',
      searchTerm: searchTerm
    });
  } catch (err) {
    console.error('Erro ao obter credenciais:', err);
    req.flash('error_msg', 'Erro ao carregar credenciais');
    res.render('credentials', {
      title: 'Gerenciamento de Senhas | Cofre Campneus',
      credentials: [],
      categories: [],
      locations: [],
      selectedCategory: 'all',
      searchTerm: ''
    });
  }
});

// Get credential by ID
router.get('/:id', async (req, res) => {
  try {
    const credentialId = req.params.id;
    
    // Validate ID format (assuming numeric ID)
    if (!/^\d+$/.test(credentialId)) {
      req.flash('error_msg', 'ID de credencial inválido');
      return res.redirect('/credentials');
    }
    
    const credential = await Credential.getById(credentialId);
    
    if (!credential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    res.render('credential-detail', {
      title: `${credential.system_name} | Cofre Campneus`,
      credential,
      categories: categories || [],
      locations: locations || []
    });
  } catch (err) {
    console.error('Erro ao obter detalhes da credencial:', err);
    req.flash('error_msg', 'Erro ao carregar detalhes da credencial');
    res.redirect('/credentials');
  }
});

// Create new credential form
router.get('/new/create', async (req, res) => {
  try {
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    res.render('credential-form', {
      title: 'Nova Senha | Cofre Campneus',
      categories: categories || [],
      locations: locations || [],
      credential: {},
      isEdit: false
    });
  } catch (err) {
    console.error('Erro ao carregar formulário:', err);
    req.flash('error_msg', 'Erro ao carregar formulário');
    res.redirect('/credentials');
  }
});

// Create new credential
router.post('/', async (req, res) => {
  try {
    const { system_name, category_id, location_id, username, password, url, notes } = req.body;
    
    // Enhanced validation
    const errors = [];
    
    if (!system_name || system_name.trim().length === 0) {
      errors.push('Nome do sistema é obrigatório');
    }
    if (!category_id || category_id === '') {
      errors.push('Categoria é obrigatória');
    }
    if (!username || username.trim().length === 0) {
      errors.push('Nome de usuário é obrigatório');
    }
    if (!password || password.trim().length === 0) {
      errors.push('Senha é obrigatória');
    }
    
    if (errors.length > 0) {
      req.flash('error_msg', errors.join(', '));
      return res.redirect('/credentials/new/create');
    }
    
    // Create credential
    const credentialId = await Credential.create(
      system_name.trim(),
      parseInt(category_id),
      location_id ? parseInt(location_id) : null,
      username.trim(),
      password,
      url ? url.trim() : '',
      notes ? notes.trim() : ''
    );
    
    req.flash('success_msg', 'Credencial criada com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error('Erro ao criar credencial:', err);
    req.flash('error_msg', 'Erro ao criar credencial. Tente novamente.');
    res.redirect('/credentials/new/create');
  }
});

// Edit credential form
router.get('/edit/:id', async (req, res) => {
  try {
    const credentialId = req.params.id;
    
    // Validate ID format
    if (!/^\d+$/.test(credentialId)) {
      req.flash('error_msg', 'ID de credencial inválido');
      return res.redirect('/credentials');
    }
    
    const credential = await Credential.getById(credentialId);
    
    if (!credential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    const categories = await Category.getAll();
    const locations = await Category.getLocations();
    
    res.render('credential-form', {
      title: `Editar ${credential.system_name} | Cofre Campneus`,
      credential,
      categories: categories || [],
      locations: locations || [],
      isEdit: true
    });
  } catch (err) {
    console.error('Erro ao carregar formulário de edição:', err);
    req.flash('error_msg', 'Erro ao carregar formulário de edição');
    res.redirect('/credentials');
  }
});

// Update credential
router.put('/:id', async (req, res) => {
  try {
    const credentialId = req.params.id;
    const { system_name, category_id, location_id, username, password, url, notes } = req.body;
    
    // Validate ID format
    if (!/^\d+$/.test(credentialId)) {
      req.flash('error_msg', 'ID de credencial inválido');
      return res.redirect('/credentials');
    }
    
    // Enhanced validation
    const errors = [];
    
    if (!system_name || system_name.trim().length === 0) {
      errors.push('Nome do sistema é obrigatório');
    }
    if (!category_id || category_id === '') {
      errors.push('Categoria é obrigatória');
    }
    if (!username || username.trim().length === 0) {
      errors.push('Nome de usuário é obrigatório');
    }
    if (!password || password.trim().length === 0) {
      errors.push('Senha é obrigatória');
    }
    
    if (errors.length > 0) {
      req.flash('error_msg', errors.join(', '));
      return res.redirect(`/credentials/edit/${credentialId}`);
    }
    
    // Check if credential exists
    const existingCredential = await Credential.getById(credentialId);
    if (!existingCredential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    // Update credential
    await Credential.update(
      credentialId,
      system_name.trim(),
      parseInt(category_id),
      location_id ? parseInt(location_id) : null,
      username.trim(),
      password,
      url ? url.trim() : '',
      notes ? notes.trim() : ''
    );
    
    req.flash('success_msg', 'Credencial atualizada com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error('Erro ao atualizar credencial:', err);
    req.flash('error_msg', 'Erro ao atualizar credencial. Tente novamente.');
    res.redirect(`/credentials/edit/${req.params.id}`);
  }
});

// Delete credential
router.delete('/:id', async (req, res) => {
  try {
    const credentialId = req.params.id;
    
    // Validate ID format
    if (!/^\d+$/.test(credentialId)) {
      req.flash('error_msg', 'ID de credencial inválido');
      return res.redirect('/credentials');
    }
    
    // Check if credential exists
    const existingCredential = await Credential.getById(credentialId);
    if (!existingCredential) {
      req.flash('error_msg', 'Credencial não encontrada');
      return res.redirect('/credentials');
    }
    
    await Credential.delete(credentialId);
    req.flash('success_msg', 'Credencial excluída com sucesso');
    res.redirect('/credentials');
  } catch (err) {
    console.error('Erro ao excluir credencial:', err);
    req.flash('error_msg', 'Erro ao excluir credencial. Tente novamente.');
    res.redirect('/credentials');
  }
});

// API endpoint for AJAX requests (optional)
router.get('/api/search', async (req, res) => {
  try {
    const { term, category } = req.query;
    let credentials = [];
    
    if (term && category && category !== 'all') {
      credentials = await Credential.searchByCategory(term, category);
    } else if (term) {
      credentials = await Credential.search(term);
    } else if (category && category !== 'all') {
      credentials = await Credential.getByCategory(category);
    } else {
      credentials = await Credential.getAll();
    }
    
    res.json({
      success: true,
      data: credentials || []
    });
  } catch (err) {
    console.error('Erro na busca API:', err);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

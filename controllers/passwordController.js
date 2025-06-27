// controllers/passwordController.js
const Password = require('../models/Password');
const Location = require('../models/Location');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all passwords
exports.getAllPasswords = async (req, res) => {
    try {
        const search = req.query.search || '';
        
        const passwords = await Password.findAll({
            where: {
                [Op.or]: [
                    { system_name: { [Op.iLike]: `%${search}%` } },
                    { username: { [Op.iLike]: `%${search}%` } },
                    { url: { [Op.iLike]: `%${search}%` } }
                ]
            },
            include: [
                { model: Location, as: 'location' },
                { model: User, as: 'updater', attributes: ['name'] }
            ],
            order: [['system_name', 'ASC']]
        });
        
        res.render('passwords', {
            title: 'Gerenciamento de Senhas - Cofre Campneus',
            user: req.user,
            passwords,
            search,
            category: 'all'
        });
    } catch (error) {
        console.error('Error getting passwords:', error);
        req.flash('error_msg', 'Erro ao carregar senhas');
        res.redirect('/');
    }
};

// Get passwords by category
exports.getPasswordsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const search = req.query.search || '';
        
        // Validate category
        const validCategories = ['prefeituras', 'fornecedores', 'orgaos', 'b2fleet'];
        if (!validCategories.includes(category)) {
            req.flash('error_msg', 'Categoria inválida');
            return res.redirect('/passwords');
        }
        
        const passwords = await Password.findAll({
            where: {
                category,
                [Op.or]: [
                    { system_name: { [Op.iLike]: `%${search}%` } },
                    { username: { [Op.iLike]: `%${search}%` } },
                    { url: { [Op.iLike]: `%${search}%` } }
                ]
            },
            include: [
                { model: Location, as: 'location' },
                { model: User, as: 'updater', attributes: ['name'] }
            ],
            order: [['system_name', 'ASC']]
        });
        
        const categoryMap = {
            prefeituras: 'Credenciais de Prefeituras',
            fornecedores: 'Credenciais de Fornecedores',
            orgaos: 'Credenciais de Órgãos Governamentais',
            b2fleet: 'Credenciais B2Fleet e Locadoras'
        };
        
        res.render('passwords', {
            title: `${categoryMap[category]} - Cofre Campneus`,
            user: req.user,
            passwords,
            search,
            category,
            categoryTitle: categoryMap[category]
        });
    } catch (error) {
        console.error('Error getting passwords by category:', error);
        req.flash('error_msg', 'Erro ao carregar senhas');
        res.redirect('/passwords');
    }
};

// Get a single password
exports.getPasswordById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const password = await Password.findByPk(id, {
            include: [
                { model: Location, as: 'location' },
                { model: User, as: 'creator', attributes: ['name'] },
                { model: User, as: 'updater', attributes: ['name'] }
            ]
        });
        
        if (!password) {
            req.flash('error_msg', 'Senha não encontrada');
            return res.redirect('/passwords');
        }
        
        res.json(password);
    } catch (error) {
        console.error('Error getting password by id:', error);
        res.status(500).json({ error: 'Erro ao carregar senha' });
    }
};

// Create new password
exports.createPassword = async (req, res) => {
    try {
        const { 
            system_name, url, username, password, category, 
            notes, location_id, expiry_date 
        } = req.body;
        
        // Validate required fields
        if (!system_name || !username || !password || !category || !location_id) {
            req.flash('error_msg', 'Por favor, preencha todos os campos obrigatórios');
            return res.redirect('/passwords');
        }
        
        // Create new password
        await Password.create({
            system_name,
            url,
            username,
            password,
            category,
            notes,
            location_id,
            expiry_date,
            created_by: req.user.id,
            updated_by: req.user.id
        });
        
        req.flash('success_msg', 'Credencial salva com sucesso!');
        res.redirect('/passwords');
    } catch (error) {
        console.error('Error creating password:', error);
        req.flash('error_msg', 'Erro ao salvar credencial');
        res.redirect('/passwords');
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            system_name, url, username, password, category, 
            notes, location_id, expiry_date 
        } = req.body;
        
        // Find password
        const passwordObj = await Password.findByPk(id);
        
        if (!passwordObj) {
            return res.status(404).json({ error: 'Senha não encontrada' });
        }
        
        // Update password fields
        passwordObj.system_name = system_name;
        passwordObj.url = url;
        passwordObj.username = username;
        
        // Only update password if provided
        if (password) {
            passwordObj.password = password;
        }
        
        passwordObj.category = category;
        passwordObj.notes = notes;
        passwordObj.location_id = location_id;
        passwordObj.expiry_date = expiry_date;
        passwordObj.updated_by = req.user.id;
        
        await passwordObj.save();
        
        req.flash('success_msg', 'Credencial atualizada com sucesso!');
        res.redirect('/passwords');
    } catch (error) {
        console.error('Error updating password:', error);
        req.flash('error_msg', 'Erro ao atualizar credencial');
        res.redirect('/passwords');
    }
};

// Delete password
exports.deletePassword = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and delete password
        const password = await Password.findByPk(id);
        
        if (!password) {
            return res.status(404).json({ error: 'Senha não encontrada' });
        }
        
        await password.destroy();
        
        req.flash('success_msg', 'Credencial excluída com sucesso!');
        res.redirect('/passwords');
    } catch (error) {
        console.error('Error deleting password:', error);
        req.flash('error_msg', 'Erro ao excluir credencial');
        res.redirect('/passwords');
    }
};
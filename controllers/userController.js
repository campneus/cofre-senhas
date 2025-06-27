// controllers/userController.js
const User = require('../models/User');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        
        // Build filter conditions
        const whereConditions = {};
        
        if (search) {
            whereConditions[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }
        
        if (role) {
            whereConditions.role = role;
        }
        
        if (status === 'active') {
            whereConditions.active = true;
        } else if (status === 'inactive') {
            whereConditions.active = false;
        }
        
        const users = await User.findAll({
            where: whereConditions,
            order: [['name', 'ASC']]
        });
        
        res.render('users', {
            title: 'Gerenciar Usuários - Cofre Campneus',
            users,
            search,
            role,
            status,
            currentUser: req.user
        });
    } catch (error) {
        console.error('Error getting users:', error);
        req.flash('error_msg', 'Erro ao carregar usuários');
        res.redirect('/');
    }
};

// Get a single user
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error getting user by id:', error);
        res.status(500).json({ error: 'Erro ao carregar usuário' });
    }
};

// Create new user
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role, active } = req.body;
        
        // Validation
        if (!name || !email || !password || !role) {
            req.flash('error_msg', 'Por favor preencha todos os campos obrigatórios');
            return res.redirect('/users');
        }
        
        if (password !== confirmPassword) {
            req.flash('error_msg', 'As senhas não conferem');
            return res.redirect('/users');
        }
        
        if (password.length < 8) {
            req.flash('error_msg', 'A senha deve ter pelo menos 8 caracteres');
            return res.redirect('/users');
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            req.flash('error_msg', 'Este email já está em uso');
            return res.redirect('/users');
        }
        
        // Create user
        await User.create({
            name,
            email,
            password, // Hashed via model hook
            role,
            active: active === 'true' || active === true
        });
        
        req.flash('success_msg', 'Usuário criado com sucesso');
        res.redirect('/users');
    } catch (error) {
        console.error('Error creating user:', error);
        req.flash('error_msg', 'Erro ao criar usuário');
        res.redirect('/users');
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, active, password, confirmPassword } = req.body;
        
        // Find user
        const user = await User.findByPk(id);
        
        if (!user) {
            req.flash('error_msg', 'Usuário não encontrado');
            return res.redirect('/users');
        }
        
        // Check if email is already in use by another user
        if (email !== user.email) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                req.flash('error_msg', 'Este email já está em uso');
                return res.redirect('/users');
            }
        }
        
        // Update user fields
        user.name = name;
        user.email = email;
        user.role = role;
        user.active = active === 'true' || active === true;
        
        // Update password if provided
        if (password && password.length > 0) {
            if (password !== confirmPassword) {
                req.flash('error_msg', 'As senhas não conferem');
                return res.redirect('/users');
            }
            
            if (password.length < 8) {
                req.flash('error_msg', 'A senha deve ter pelo menos 8 caracteres');
                return res.redirect('/users');
            }
            
            user.password = password; // Will be hashed by model hook
        }
        
        await user.save();
        
        req.flash('success_msg', 'Usuário atualizado com sucesso');
        res.redirect('/users');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error_msg', 'Erro ao atualizar usuário');
        res.redirect('/users');
    }
};

// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cannot delete own account
        if (id === req.user.id) {
            req.flash('error_msg', 'Você não pode excluir sua própria conta');
            return res.redirect('/users');
        }
        
        // Find user
        const user = await User.findByPk(id);
        
        if (!user) {
            req.flash('error_msg', 'Usuário não encontrado');
            return res.redirect('/users');
        }
        
        // Delete user
        await user.destroy();
        
        req.flash('success_msg', 'Usuário excluído com sucesso');
        res.redirect('/users');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error_msg', 'Erro ao excluir usuário');
        res.redirect('/users');
    }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Cannot deactivate own account
        if (id === req.user.id) {
            req.flash('error_msg', 'Você não pode desativar sua própria conta');
            return res.redirect('/users');
        }
        
        // Find user
        const user = await User.findByPk(id);
        
        if (!user) {
            req.flash('error_msg', 'Usuário não encontrado');
            return res.redirect('/users');
        }
        
        // Toggle active status
        user.active = !user.active;
        await user.save();
        
        const statusMessage = user.active ? 'ativado' : 'desativado';
        req.flash('success_msg', `Usuário ${statusMessage} com sucesso`);
        res.redirect('/users');
    } catch (error) {
        console.error('Error toggling user status:', error);
        req.flash('error_msg', 'Erro ao alterar status do usuário');
        res.redirect('/users');
    }
};

// Reset user password
exports.resetPassword = async (req, res) => {
    try {
        const { userId, password, confirmPassword } = req.body;
        
        // Validate passwords
        if (password !== confirmPassword) {
            req.flash('error_msg', 'As senhas não conferem');
            return res.redirect('/users');
        }
        
        if (password.length < 8) {
            req.flash('error_msg', 'A senha deve ter pelo menos 8 caracteres');
            return res.redirect('/users');
        }
        
        // Find user
        const user = await User.findByPk(userId);
        
        if (!user) {
            req.flash('error_msg', 'Usuário não encontrado');
            return res.redirect('/users');
        }
        
        // Update password
        user.password = password; // Will be hashed by model hook
        await user.save();
        
        req.flash('success_msg', 'Senha redefinida com sucesso');
        res.redirect('/users');
    } catch (error) {
        console.error('Error resetting password:', error);
        req.flash('error_msg', 'Erro ao redefinir senha');
        res.redirect('/users');
    }
};

// Add helper method for handlebars
exports.helpers = {
    firstLetter: (name) => {
        return name ? name.charAt(0).toUpperCase() : '';
    },
    isAdmin: (role) => {
        return role === 'admin';
    }
};
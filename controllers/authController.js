// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

exports.getLoginPage = (req, res) => {
    if (req.cookies.token) {
        return res.redirect('/');
    }
    res.render('login', {
        layout: false,
        error: req.flash('error')
    });
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            req.flash('error', 'Por favor, forneça email e senha');
            return res.redirect('/login');
        }

        // Find user by email
        const user = await User.findOne({
            where: {
                email,
                active: true
            }
        });

        // Check if user exists
        if (!user) {
            req.flash('error', 'Credenciais inválidas');
            return res.redirect('/login');
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Credenciais inválidas');
            return res.redirect('/login');
        }

        // Update last login time
        user.last_login = new Date();
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            process.env.JWT_SECRET || 'cofre-campneus-jwt-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Erro no servidor. Tente novamente mais tarde.');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
};

exports.getDashboard = async (req, res) => {
    try {
        const Password = require('../models/Password');
        const Location = require('../models/Location');
        const User = require('../models/User');
        
        // Count stats
        const totalPasswords = await Password.count();
        const prefeituraPasswords = await Password.count({ where: { category: 'prefeituras' } });
        const fornecedoresPasswords = await Password.count({ where: { category: 'fornecedores' } });
        const activeUsers = await User.count({ where: { active: true } });
        
        // Get recent access (would typically be from an access log model, simulated for this example)
        const recentAccess = [
            {
                system_name: 'Prefeitura Municipal de SP',
                accessed_by: req.user.name,
                access_time: new Date()
            },
            {
                system_name: 'B2Fleet Portal',
                accessed_by: 'Maria Santos',
                access_time: new Date(Date.now() - 1000 * 60 * 75) // 75 minutes ago
            }
        ];
        
        // Get passwords expiring soon (next 7 days)
        const expiringPasswords = await Password.findAll({
            where: {
                expiry_date: {
                    [Op.lte]: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
                }
            },
            include: [{ model: Location, as: 'location' }],
            order: [['expiry_date', 'ASC']],
            limit: 5
        });
        
        res.render('home', {
            title: 'Dashboard - Cofre Campneus',
            user: req.user,
            stats: {
                totalPasswords,
                prefeituraPasswords,
                fornecedoresPasswords,
                activeUsers
            },
            recentAccess,
            expiringPasswords
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('home', {
            title: 'Dashboard - Cofre Campneus',
            user: req.user,
            error: 'Erro ao carregar dashboard'
        });
    }
};
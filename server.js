// server.js
require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const methodOverride = require('method-override');
const { sequelize } = require('./config/database');

// Initialize app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
            fontSrc: ["'self'", "cdn.jsdelivr.net"],
        },
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'cofre-campneus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        formatDate: function(date) {
            const moment = require('moment');
            moment.locale('pt-br');
            return moment(date).format('DD/MM/YYYY HH:mm');
        },
        ifeq: function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/auth'));
app.use('/passwords', require('./routes/passwords'));
app.use('/locations', require('./routes/locations'));
app.use('/users', require('./routes/users'));
app.use('/health', require('./routes/health'));

// Database connection and server start
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
})();
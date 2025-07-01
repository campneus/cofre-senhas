// server.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');
const methodOverride = require('method-override');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const credentialsRoutes = require('./routes/credentials');
const categoriesRoutes = require('./routes/categories');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Check authentication middleware
function checkAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Por favor, faça login para acessar essa página');
  return res.redirect('/login');
}

// Routes
app.use('/', authRoutes);
app.use('/credentials', checkAuthenticated, credentialsRoutes);
app.use('/categories', checkAuthenticated, categoriesRoutes);
app.use('/api', checkAuthenticated, apiRoutes);

// Redirect root to dashboard if logged in, otherwise to login
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Dashboard route
app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard | Cofre Campneus',
    user: req.session.user
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
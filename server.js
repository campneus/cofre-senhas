const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuração do banco de dados PostgreSQL
const pool = new Pool({
  host: process.env.PGHOST || 'ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech',
  database: process.env.PGDATABASE || 'senhas_campneus',
  user: process.env.PGUSER || 'senhas_campneus_owner',
  password: process.env.PGPASSWORD || 'npg_MXP5UK4CqToH',
  ssl: { rejectUnauthorized: false },
  port: 5432
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rotas de autenticação
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para senhas
app.get('/api/passwords', authenticateToken, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, l.name as location_name 
      FROM passwords p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN locations l ON p.location_id = l.id
    `;
    const params = [];

    if (search || category) {
      query += ' WHERE ';
      const conditions = [];
      
      if (search) {
        conditions.push('p.system ILIKE $' + (params.length + 1));
        params.push(`%${search}%`);
      }
      
      if (category && category !== 'all') {
        conditions.push('c.name = $' + (params.length + 1));
        params.push(category);
      }
      
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY p.last_updated DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar senhas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/passwords', authenticateToken, async (req, res) => {
  try {
    const { system, username_credential, url, location_id, category_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO passwords (system, user_id, location_id, category_id, username_credential, url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [system, req.user.id, location_id, category_id, username_credential, url]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/passwords/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { system, username_credential, url, location_id, category_id } = req.body;
    
    const result = await pool.query(
      'UPDATE passwords SET system = $1, username_credential = $2, url = $3, location_id = $4, category_id = $5, last_updated = CURRENT_DATE WHERE id = $6 RETURNING *',
      [system, username_credential, url, location_id, category_id, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/passwords/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM passwords WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Senha não encontrada' });
    }
    
    res.json({ message: 'Senha excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir senha:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para categorias
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rotas para localidades
app.get('/api/locations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar localidades:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar saúde da aplicação
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


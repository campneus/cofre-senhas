const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'ep-crimson-meadow-a8krhs13.eastus2.azure.neon.tech',
  database: process.env.PGDATABASE || 'senhas_campneus',
  user: process.env.PGUSER || 'senhas_campneus_owner',
  password: process.env.PGPASSWORD || 'npg_MXP5UK4CqToH',
  ssl: { rejectUnauthorized: false },
  port: 5432
});

async function setupDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Primeiro, corrigir dados existentes que podem estar inválidos
    await pool.query(`UPDATE users SET role = 'user' WHERE role NOT IN ('user', 'admin')`);
    console.log('Dados existentes corrigidos');
    
    // Remover constraint antiga se existir
    try {
      await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
      console.log('Constraint antiga removida');
    } catch (error) {
      console.log('Constraint não existia');
    }
    
    // Adicionar nova constraint
    await pool.query(`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'))`);
    console.log('Nova constraint adicionada');
    
    // Criar usuário administrador padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', $1, 'admin') 
      ON CONFLICT (username) DO UPDATE SET password = $1, role = 'admin'
    `, [hashedPassword]);
    
    console.log('Usuário admin criado/atualizado com sucesso!');
    console.log('Login: admin');
    console.log('Senha: admin123');
    
    // Inserir dados de exemplo se não existirem
    const existingPasswords = await pool.query('SELECT COUNT(*) FROM passwords');
    if (existingPasswords.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO passwords (system, user_id, location_id, category_id, username_credential, url) 
        VALUES ('Portal Municipal', 1, 1, 1, 'admin.sp', 'https://portal.prefsp.gov.br')
      `);
      console.log('Dados de exemplo inseridos!');
    } else {
      console.log('Dados já existem no banco');
    }
    
    console.log('Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();


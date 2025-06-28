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

async function initDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Criar usuário administrador padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', $1, 'admin') 
      ON CONFLICT (username) DO UPDATE SET password = $1
    `, [hashedPassword]);
    
    console.log('Usuário admin criado/atualizado com sucesso!');
    console.log('Login: admin');
    console.log('Senha: admin123');
    
    // Inserir dados de exemplo
    await pool.query(`
      INSERT INTO passwords (system, user_id, location_id, category_id, username_credential, url) 
      VALUES ('Portal Municipal', 1, 1, 1, 'admin.sp', 'https://portal.prefsp.gov.br')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Dados de exemplo inseridos!');
    console.log('Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();


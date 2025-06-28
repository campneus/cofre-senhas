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

async function fixDatabase() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Remover constraint antiga se existir
    try {
      await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
      console.log('Constraint antiga removida');
    } catch (error) {
      console.log('Constraint não existia ou já foi removida');
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
    
    // Inserir dados de exemplo
    await pool.query(`
      INSERT INTO passwords (system, user_id, location_id, category_id, username_credential, url) 
      VALUES ('Portal Municipal', 1, 1, 1, 'admin.sp', 'https://portal.prefsp.gov.br')
      ON CONFLICT DO NOTHING
    `);
    
    console.log('Dados de exemplo inseridos!');
    console.log('Banco de dados corrigido e inicializado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao corrigir banco de dados:', error);
  } finally {
    await pool.end();
  }
}

fixDatabase();


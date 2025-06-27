// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PGDATABASE || 'cofre_campneus',
    process.env.PGUSER || 'postgres',
    process.env.PGPASSWORD || 'postgres',
    {
        host: process.env.PGHOST || 'localhost',
        dialect: 'postgres',
        logging: process.env.NODE_ENV !== 'production' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true
        }
    }
);

module.exports = { sequelize };
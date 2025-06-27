// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'cofre_campneus',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
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
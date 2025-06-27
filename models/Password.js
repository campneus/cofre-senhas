// models/Password.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');
const Location = require('./Location');

const Password = sequelize.define('Password', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    system_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    url: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true
        }
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('prefeituras', 'fornecedores', 'orgaos', 'b2fleet'),
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    },
    expiry_date: {
        type: DataTypes.DATE
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Relationships
Password.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Password.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });
Password.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

// Hook to update last_updated when password is modified
Password.beforeUpdate((password) => {
    password.last_updated = new Date();
});

module.exports = Password;
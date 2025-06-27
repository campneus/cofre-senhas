// models/Location.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Location = sequelize.define('Location', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Código da Localidade',
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome da Localidade',
        unique: true
    },
    cnpj: {
        type: DataTypes.STRING(18),
        allowNull: false,
        comment: 'CNPJ da Localidade',
        unique: true,
        validate: {
            is: /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/ // Format: XX.XXX.XXX/XXXX-XX
        }
    },
    state_registration: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Inscrição Estadual'
    },
    municipal_registration: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Inscrição Municipal'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Location;
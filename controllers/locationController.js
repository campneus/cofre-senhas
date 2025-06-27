// controllers/locationController.js
const Location = require('../models/Location');
const Password = require('../models/Password');

// Get all locations
exports.getAllLocations = async (req, res) => {
    try {
        const locations = await Location.findAll({
            order: [['name', 'ASC']]
        });
        
        res.render('locations', {
            title: 'Localidades - Cofre Campneus',
            user: req.user,
            locations
        });
    } catch (error) {
        console.error('Error getting locations:', error);
        req.flash('error_msg', 'Erro ao carregar localidades');
        res.redirect('/');
    }
};

// Create a new location
exports.createLocation = async (req, res) => {
    try {
        const { name, city, state } = req.body;
        
        // Validate required fields
        if (!name || !city || !state) {
            req.flash('error_msg', 'Por favor, preencha todos os campos');
            return res.redirect('/locations');
        }
        
        // Check if location already exists
        const existingLocation = await Location.findOne({
            where: { name }
        });
        
        if (existingLocation) {
            req.flash('error_msg', 'Localidade com este nome já existe');
            return res.redirect('/locations');
        }
        
        // Create new location
        await Location.create({
            name,
            city,
            state
        });
        
        req.flash('success_msg', 'Localidade criada com sucesso!');
        res.redirect('/locations');
    } catch (error) {
        console.error('Error creating location:', error);
        req.flash('error_msg', 'Erro ao criar localidade');
        res.redirect('/locations');
    }
};

// Update a location
exports.updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, city, state, active } = req.body;
        
        // Find location
        const location = await Location.findByPk(id);
        
        if (!location) {
            req.flash('error_msg', 'Localidade não encontrada');
            return res.redirect('/locations');
        }
        
        // Update location fields
        location.name = name;
        location.city = city;
        location.state = state;
        
        if (active !== undefined) {
            location.active = active === 'true' || active === true;
        }
        
        await location.save();
        
        req.flash('success_msg', 'Localidade atualizada com sucesso!');
        res.redirect('/locations');
    } catch (error) {
        console.error('Error updating location:', error);
        req.flash('error_msg', 'Erro ao atualizar localidade');
        res.redirect('/locations');
    }
};

// Delete a location
exports.deleteLocation = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if location is used in any passwords
        const passwordCount = await Password.count({
            where: { location_id: id }
        });
        
        if (passwordCount > 0) {
            req.flash('error_msg', 'Esta localidade não pode ser excluída porque está sendo usada em senhas');
            return res.redirect('/locations');
        }
        
        // Find and delete location
        const location = await Location.findByPk(id);
        
        if (!location) {
            req.flash('error_msg', 'Localidade não encontrada');
            return res.redirect('/locations');
        }
        
        await location.destroy();
        
        req.flash('success_msg', 'Localidade excluída com sucesso!');
        res.redirect('/locations');
    } catch (error) {
        console.error('Error deleting location:', error);
        req.flash('error_msg', 'Erro ao excluir localidade');
        res.redirect('/locations');
    }
};
// routes/locations.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Apply middleware to all routes
router.use(ensureAuthenticated);

// Get all locations
router.get('/', locationController.getAllLocations);

// Create a new location (admin only)
router.post('/', ensureAdmin, locationController.createLocation);

// Update location (admin only)
router.put('/:id', ensureAdmin, locationController.updateLocation);

// Delete location (admin only)
router.delete('/:id', ensureAdmin, locationController.deleteLocation);

module.exports = router;
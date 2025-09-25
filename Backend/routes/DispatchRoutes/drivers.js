const express = require('express');
const router = express.Router();
const { 
  getAllDrivers, 
  addDriver, 
  updateDriver, 
  deleteDriver, 
  getDriverById 
} = require('../controllers/driverController');

// GET all drivers
router.get('/', getAllDrivers);

// GET driver by ID
router.get('/:id', getDriverById);

// POST add driver
router.post('/', addDriver);

// PUT update driver
router.put('/:id', updateDriver);

// DELETE driver
router.delete('/:id', deleteDriver);

module.exports = router;
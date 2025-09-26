const express = require('express');
const router = express.Router();
const { 
  getAllDrivers, 
  addDriver, 
  updateDriver, 
  deleteDriver, 
  getDriverById 
} = require('../../controllers/DispatchControllers/driverController');
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");

// GET all drivers
router.get('/',protectUser, getAllDrivers);

// GET driver by ID
router.get('/:id',protectUser, getDriverById);

// POST add driver
router.post('/',protectUser, addDriver);

// PUT update driver
router.put('/:id',protectUser, updateDriver);

// DELETE driver
router.delete('/:id',protectUser, deleteDriver);

module.exports = router;
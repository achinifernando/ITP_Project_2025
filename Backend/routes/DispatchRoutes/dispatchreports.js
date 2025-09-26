// routes/reports.js
const express = require("express");
const router = express.Router();
const Delivery = require("../../models/DispatchModels/Delivery");
const Driver = require("../../models/DispatchModels/Driver");
const Vehicle = require("../../models/DispatchModels/Vehicle");
const { protectUser, dispatchManager } = require("../../middleware/authMiddleware");

// Get delivery statistics for reports
const getDeliveryStats = async (req, res) => {
  try {
    const { period, year, month } = req.query;
    
    // Get all deliveries (filtering by period would be implemented here)
    const deliveries = await Delivery.find()
      .populate("driver")
      .populate("vehicle");
    
    // Get all drivers and vehicles
    const drivers = await Driver.find();
    const vehicles = await Vehicle.find();

    // Calculate statistics
    const total = deliveries.length;
    const completed = deliveries.filter(d => d.status === "Completed").length;
    const ongoing = deliveries.filter(d => d.status === "Ongoing").length;
    const pending = deliveries.filter(d => d.status === "Pending").length;
    const assigned = deliveries.filter(d => d.status === "Assigned").length;
    
    const availableDrivers = drivers.filter(d => d.isAvailable).length;
    const availableVehicles = vehicles.filter(v => v.isAvailable).length;

    res.json({
      total,
      completed,
      ongoing,
      pending,
      assigned,
      availableDrivers,
      availableVehicles,
      deliveries
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get driver performance report
const getDriverPerformance = async (req, res) => {
  try {
    const drivers = await Driver.find();
    const deliveries = await Delivery.find().populate("driver");
    
    const driverPerformance = drivers.map(driver => {
      const driverDeliveries = deliveries.filter(d => 
        d.driver && d.driver._id.toString() === driver._id.toString()
      );
      
      const completed = driverDeliveries.filter(d => d.status === "Completed").length;
      
      return {
        driverId: driver._id,
        driverName: driver.name,
        totalAssignments: driverDeliveries.length,
        completedDeliveries: completed,
        completionRate: driverDeliveries.length > 0 
          ? Math.round((completed / driverDeliveries.length) * 100) 
          : 0
      };
    });
    
    res.json(driverPerformance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get vehicle utilization report
const getVehicleUtilization = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    const deliveries = await Delivery.find().populate("vehicle");
    
    const vehicleUtilization = vehicles.map(vehicle => {
      const vehicleDeliveries = deliveries.filter(d => 
        d.vehicle && d.vehicle._id.toString() === vehicle._id.toString()
      );
      
      const completed = vehicleDeliveries.filter(d => d.status === "Completed").length;
      
      return {
        vehicleId: vehicle._id,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        totalAssignments: vehicleDeliveries.length,
        completedDeliveries: completed,
        utilizationRate: Math.round((vehicleDeliveries.length / (vehicleDeliveries.length + 5)) * 100)
      };
    });
    
    res.json(vehicleUtilization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Routes
router.get("/stats",protectUser, getDeliveryStats);
router.get("/drivers",protectUser, getDriverPerformance);
router.get("/vehicles",protectUser, getVehicleUtilization);

module.exports = router;
const Vehicle = require("../../models/DispatchModels/Vehicle");
const Delivery = require(".../../models/DispatchModels/Delivery");

// Get all vehicles
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add new vehicle
const addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, type, capacity } = req.body;

    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return res.status(400).json({ message: "Vehicle number already exists" });
    }

    const newVehicle = new Vehicle({
      vehicleNumber,
      type,
      capacity,
      isAvailable: true,
    });

    await newVehicle.save();
    res.status(201).json({ message: "Vehicle added successfully", vehicle: newVehicle });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { vehicleNumber, type, capacity } = req.body;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { vehicleNumber, type, capacity },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json({ message: "Vehicle updated successfully", vehicle: updatedVehicle });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Delete vehicle with delivery check
const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Check if vehicle exists
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    // Check if vehicle is assigned to any active delivery
    const activeDelivery = await Delivery.findOne({ 
      vehicle: vehicleId, 
      status: { $in: ["assigned", "in transit", "picked up"] } 
    });
    
    if (activeDelivery) {
      return res.status(400).json({ 
        message: `Cannot delete vehicle: Vehicle ${vehicle.vehicleNumber} is currently assigned to an active delivery.` 
      });
    }
    
    // If no active delivery, proceed with deletion
    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);
    
    if (!deletedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};
const Driver = require("../../models/DispatchModels/Driver");

const addDriver = async (req, res) => {
  try {
    const { name, phone, licenseNumber } = req.body;

    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if license number already exists
    const existingDriver = await Driver.findOne({ licenseNumber });
    if (existingDriver) {
      return res.status(400).json({ message: "License number already exists" });
    }

    const driver = new Driver({ name, phone, licenseNumber });
    await driver.save();
    res.status(201).json({ message: "Driver added successfully", driver });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, licenseNumber } = req.body;

    if (!name || !phone || !licenseNumber) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if license number already exists for other drivers
    const existingDriver = await Driver.findOne({ 
      licenseNumber, 
      _id: { $ne: id } 
    });
    
    if (existingDriver) {
      return res.status(400).json({ message: "License number already exists" });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { name, phone, licenseNumber },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({ message: "Driver updated successfully", driver: updatedDriver });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if driver has active assignments
    const Assignment = require("../../models/DispatchModels/Assignment");
    const activeAssignments = await Assignment.findOne({ 
      driver: id, 
      status: { $in: ["assigned", "in-progress"] } 
    });
    
    if (activeAssignments) {
      return res.status(400).json({ 
        message: "Cannot delete driver with active assignments. Please complete or cancel assignments first." 
      });
    }

    // Delete related assignments
    await Assignment.deleteMany({ driver: id });

    const deletedDriver = await Driver.findByIdAndDelete(id);

    if (!deletedDriver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(id);
    
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  addDriver, 
  getAllDrivers, 
  updateDriver, 
  deleteDriver, 
  getDriverById 
};
const Delivery = require("../models/Delivery");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Notification = require("../models/Notification");
const Assignment = require("../models/Assignment");

// Get pending deliveries
const getPendingDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find({ status: "Pending" })
      .populate("driver")
      .populate("vehicle");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find()
      .populate("driver")
      .populate("vehicle");
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all assignments (NEW - to display in Delivery Assignments table)
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("delivery")
      .populate("driver")
      .populate("vehicle")
      .sort({ assignedAt: -1 }); // Show latest assignments first
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignments by status
const getAssignmentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const assignments = await Assignment.find({ status })
      .populate("delivery")
      .populate("driver")
      .populate("vehicle")
      .sort({ assignedAt: -1 });
    
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign driver + vehicle (UPDATED)
const assignDelivery = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const deliveryId = req.params.id;

    // Validate input
    if (!driverId || !vehicleId) {
      return res.status(400).json({ message: "Driver ID and Vehicle ID are required" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status !== "Pending") return res.status(400).json({ message: "Delivery already assigned" });

    const driver = await Driver.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);
    if (!driver) return res.status(400).json({ message: "Driver not found" });
    if (!vehicle) return res.status(400).json({ message: "Vehicle not found" });
    if (!driver.isAvailable) return res.status(400).json({ message: "Driver not available" });
    if (!vehicle.isAvailable) return res.status(400).json({ message: "Vehicle not available" });

    // Update delivery
    delivery.driver = driverId;
    delivery.vehicle = vehicleId;
    delivery.status = "Assigned";
    delivery.assignedAt = new Date();
    await delivery.save();

    // Update driver and vehicle availability
    driver.isAvailable = false;
    await driver.save();
    vehicle.isAvailable = false;
    await vehicle.save();

    // Create or update assignment record
    let assignment = await Assignment.findOne({ delivery: deliveryId });
    
    if (assignment) {
      // Update existing assignment
      assignment.driver = driverId;
      assignment.vehicle = vehicleId;
      assignment.status = "Assigned";
      assignment.assignedAt = new Date();
    } else {
      // Create new assignment
      assignment = new Assignment({ 
        delivery: deliveryId, 
        driver: driverId, 
        vehicle: vehicleId,
        status: "Assigned"
      });
    }
    
    await assignment.save();

    // Create detailed notification message
    const notification = new Notification({
      user: driverId,
      title: "New Delivery Assignment",
      message: `You have been assigned to deliver Order #${delivery.orderId} to ${delivery.customerName} at ${delivery.deliveryAddress}. Vehicle: ${vehicle.vehicleNumber}`,
      type: "Assignment",
      relatedDelivery: delivery._id
    });
    await notification.save();

    // Emit socket notification
    const io = req.app.get("io");
    io.to(driverId.toString()).emit("newNotification", notification);

    // Populate the assignment with full details for response
    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("delivery")
      .populate("driver")
      .populate("vehicle");

    res.json({ 
      message: "Delivery assigned successfully", 
      assignment: populatedAssignment,
      notification 
    });
  } catch (err) {
    console.error("Error in assignDelivery:", err);
    res.status(500).json({ message: err.message });
  }
};

// Start delivery (UPDATED to also update Assignment)
const startDelivery = async (req, res) => {
  try {
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status !== "Assigned") return res.status(400).json({ message: "Delivery is not in assigned status" });

    // Update delivery status
    delivery.status = "Ongoing";
    delivery.startedAt = new Date();
    await delivery.save();

    // Update assignment status
    await Assignment.findOneAndUpdate(
      { delivery: deliveryId },
      { 
        status: "Ongoing",
        startedAt: new Date()
      }
    );

    const updatedDelivery = await Delivery.findById(deliveryId)
      .populate("driver")
      .populate("vehicle");

    res.json({ message: "Delivery started", delivery: updatedDelivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update delivery status (UPDATED to also update Assignment)
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryId = req.params.id;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    // Validate status
    const validStatuses = ["Pending", "Assigned", "Ongoing", "Completed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    delivery.status = status;
    
    if (status === "Completed") {
      delivery.completedAt = new Date();
      
      // Free up the driver and vehicle
      if (delivery.driver) {
        await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: true });
      }
      if (delivery.vehicle) {
        await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: true });
      }
    }
    
    await delivery.save();

    // Update assignment status
    if (status !== "Pending") {
      await Assignment.findOneAndUpdate(
        { delivery: deliveryId },
        { 
          status: status,
          ...(status === "Completed" && { completedAt: new Date() })
        }
      );
    }

    const updatedDelivery = await Delivery.findById(deliveryId)
      .populate("driver")
      .populate("vehicle");

    res.json({ message: "Delivery status updated", delivery: updatedDelivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("delivery")
      .populate("driver")
      .populate("vehicle");
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // If delivery exists, reset its status
    await Delivery.findByIdAndUpdate(assignment.delivery, {
      status: "Pending",
      driver: null,
      vehicle: null,
      assignedAt: null
    });

    // Make driver and vehicle available again
    await Driver.findByIdAndUpdate(assignment.driver, { isAvailable: true });
    await Vehicle.findByIdAndUpdate(assignment.vehicle, { isAvailable: true });

    await Assignment.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { 
  getPendingDeliveries, 
  getAllDeliveries,
  getAllAssignments,
  getAssignmentsByStatus,
  getAssignmentById,
  assignDelivery, 
  startDelivery,
  updateDeliveryStatus,
  deleteAssignment
};
const Delivery = require("../../models/DispatchModels/Delivery");
const Driver = require("../../models/DispatchModels/Driver");
const Vehicle = require("../../models/DispatchModels/Vehicle");
const Notification = require("../../models/DispatchModels/Notification");
const Assignment = require("../../models/DispatchModels/Assignment");
const mongoose = require("mongoose");


// ✅ Get pending deliveries
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

// ✅ Get all deliveries
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

// ✅ Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("delivery")
      .populate("driver")
      .populate("vehicle")
      .sort({ assignedAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get assignments by status
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

// ✅ Assign driver + vehicle
const assignDelivery = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const { id: deliveryId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ message: "Invalid delivery ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    if (!driverId || !vehicleId) {
      return res.status(400).json({ message: "Driver ID and Vehicle ID are required" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status !== "Pending")
      return res.status(400).json({ message: "Delivery already assigned" });

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

    // Update availability
    driver.isAvailable = false;
    vehicle.isAvailable = false;
    await driver.save();
    await vehicle.save();

    // Create/Update assignment
    let assignment = await Assignment.findOne({ delivery: deliveryId });
    if (assignment) {
      assignment.driver = driverId;
      assignment.vehicle = vehicleId;
      assignment.status = "Assigned";
      assignment.assignedAt = new Date();
    } else {
      assignment = new Assignment({
        delivery: deliveryId,
        driver: driverId,
        vehicle: vehicleId,
        status: "Assigned"
      });
    }
    await assignment.save();

    // Notification
    const notification = new Notification({
      user: driverId,
      title: "New Delivery Assignment",
      message: `You have been assigned to deliver Order #${delivery.orderId} to ${delivery.customerName} at ${delivery.address}. Vehicle: ${vehicle.vehicleNumber}`,
      type: "Assignment",
      relatedDelivery: delivery._id
    });
    await notification.save();

    const io = req.app.get("io");
    io.to(driverId.toString()).emit("newNotification", notification);

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate("delivery")
      .populate("driver")
      .populate("vehicle");

    const updatedDelivery = await Delivery.findById(deliveryId)
      .populate("driver")
      .populate("vehicle");

    res.json({
      message: "Delivery assigned successfully",
      assignment: populatedAssignment,
      delivery: updatedDelivery,
      notification
    });
  } catch (err) {
    console.error("Error in assignDelivery:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Start delivery
const startDelivery = async (req, res) => {
  try {
    const { id: deliveryId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ message: "Invalid delivery ID" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });
    if (delivery.status !== "Assigned")
      return res.status(400).json({ message: "Delivery is not in assigned status" });

    delivery.status = "Ongoing";
    delivery.startedAt = new Date();
    await delivery.save();

    const assignment = await Assignment.findOneAndUpdate(
      { delivery: deliveryId },
      { status: "Ongoing", startedAt: new Date() },
      { new: true }
    ).populate("delivery driver vehicle");

    const updatedDelivery = await Delivery.findById(deliveryId)
      .populate("driver")
      .populate("vehicle");

    res.json({ message: "Delivery started", delivery: updatedDelivery, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id: deliveryId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ message: "Invalid delivery ID" });
    }

    const validStatuses = ["Pending", "Assigned", "Ongoing", "Completed", "Cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    delivery.status = status;

    if (status === "Completed") {
      delivery.completedAt = new Date();
      if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: true });
      if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: true });
    }

    await delivery.save();

    const assignment = await Assignment.findOneAndUpdate(
      { delivery: deliveryId },
      {
        status,
        ...(status === "Completed" && { completedAt: new Date() })
      },
      { new: true }
    ).populate("delivery driver vehicle");

    const updatedDelivery = await Delivery.findById(deliveryId)
      .populate("driver")
      .populate("vehicle");

    res.json({ message: "Delivery status updated", delivery: updatedDelivery, assignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update assignment (edit driver/vehicle)
const updateAssignment = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const { id: assignmentId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    if (!driverId || !vehicleId)
      return res.status(400).json({ message: "Driver ID and Vehicle ID are required" });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const driver = await Driver.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);
    if (!driver) return res.status(400).json({ message: "Driver not found" });
    if (!vehicle) return res.status(400).json({ message: "Vehicle not found" });

    if (assignment.driver.toString() !== driverId) {
      await Driver.findByIdAndUpdate(assignment.driver, { isAvailable: true });
      driver.isAvailable = false;
      await driver.save();
    }

    if (assignment.vehicle.toString() !== vehicleId) {
      await Vehicle.findByIdAndUpdate(assignment.vehicle, { isAvailable: true });
      vehicle.isAvailable = false;
      await vehicle.save();
    }

    assignment.driver = driverId;
    assignment.vehicle = vehicleId;
    await assignment.save();

    await Delivery.findByIdAndUpdate(assignment.delivery, {
      driver: driverId,
      vehicle: vehicleId
    });

    const populatedAssignment = await Assignment.findById(assignmentId)
      .populate("delivery driver vehicle");

    res.json({ message: "Assignment updated successfully", assignment: populatedAssignment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get assignment by ID
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid assignment ID" });

    const assignment = await Assignment.findById(id).populate("driver vehicle delivery");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Remove assignment (unassign but keep record deleted)
const removeAssignment = async (req, res) => {
  try {
    const { id: deliveryId } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
      return res.status(400).json({ message: "Invalid delivery ID" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) return res.status(404).json({ message: "Delivery not found" });

    if (delivery.driver) await Driver.findByIdAndUpdate(delivery.driver, { isAvailable: true });
    if (delivery.vehicle) await Vehicle.findByIdAndUpdate(delivery.vehicle, { isAvailable: true });

    delivery.driver = null;
    delivery.vehicle = null;
    delivery.status = "Pending";
    delivery.assignedAt = null;
    await delivery.save();

    await Assignment.findOneAndDelete({ delivery: deliveryId });

    res.json({ message: "Assignment removed successfully", delivery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete assignment completely
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid assignment ID" });

    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    await Delivery.findByIdAndUpdate(assignment.delivery, {
      status: "Pending",
      driver: null,
      vehicle: null,
      assignedAt: null
    });

    await Driver.findByIdAndUpdate(assignment.driver, { isAvailable: true });
    await Vehicle.findByIdAndUpdate(assignment.vehicle, { isAvailable: true });

    await Assignment.findByIdAndDelete(id);

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
  updateAssignment,
  removeAssignment,
  deleteAssignment
};
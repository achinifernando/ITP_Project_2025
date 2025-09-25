const Leave = require("../../models/AttendenceTaskModel/Leave");

// ✅ Get all leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId", "name email role");
    res.json({ leaves }); // send inside object for frontend
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaves", error });
  }
};

// ✅ Get leaves for current user
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employeeId: req.user._id });
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ message: "Error fetching your leaves", error });
  }
};

// ✅ Create new leave
const createLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const leave = new Leave({ employeeId, leaveType, startDate, endDate, reason });
    await leave.save();

    res.status(201).json({ message: "Leave request created successfully", leave });
  } catch (error) {
    res.status(500).json({ message: "Error creating leave", error });
  }
};

// ✅ Update leave status
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.json({ message: "Leave status updated", leave });
  } catch (error) {
    res.status(500).json({ message: "Error updating leave status", error });
  }
};

module.exports = { getAllLeaves, getMyLeaves, createLeave, updateLeaveStatus };

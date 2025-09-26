// =======================
// User Management Controllers
// =======================
// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, role } = req.body;
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new Employee({
      name,
      email,
      password,
      contactNumber,
      address,
      role,
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await Employee.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID
const getUsersById = async (req, res) => {
  try {
    const user = await Employee.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await Employee.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const Employee = require("../../models/AttendenceTaskModel/User");
const Attendance = require("../../models/AttendenceTaskModel/Attendance");
const Otp = require("../../models/AttendenceTaskModel/otp");
const nodemailer = require("nodemailer");

// Helper: Generate a 6-digit OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Configure mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  return await transporter.sendMail(mailOptions);
};

// Calculate status based on time-in
const calculateStatus = (timeIn) => {
  const timeInHour = timeIn.getHours();
  const timeInMinute = timeIn.getMinutes();

  // Consider late after 9:30 AM
  if (timeInHour > 9 || (timeInHour === 9 && timeInMinute > 30)) {
    return "late";
  }
  return "present";
};

// Send OTP
const sendOtp = async (req, res) => {
  const { employeeId, action } = req.body;
  if (!employeeId || !action) {
    return res.status(400).json({ message: "employeeId and action required" });
  }

  try {
    const employee = await Employee.findOne({ employeeId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (action === "time-out") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const open = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
        timeOut: null,
      });
      if (!open)
        return res
          .status(400)
          .json({ message: "No active time-in found to time-out" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await Otp.deleteMany({ employeeId });
    await Otp.create({ employeeId, otp, expiresAt, action });

    try {
      await sendEmail(
        employee.email,
        `Your Attendance OTP (${action})`,
        `Your OTP for ${action} is ${otp}. It is valid for 2 minutes.`
      );
      console.log(`OTP sent to ${employee.email}`);
      res.json({ message: "OTP sent successfully. Check your email." });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      await Otp.deleteMany({ employeeId });
      res
        .status(500)
        .json({
          message:
            "Failed to send OTP email. Please check email configuration.",
        });
    }
  } catch (err) {
    console.error("Error in sendOtp:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { employeeId, otp, action } = req.body;
  if (!employeeId || !otp || !action) {
    return res
      .status(400)
      .json({ message: "employeeId, otp and action required" });
  }

  try {
    const record = await Otp.findOne({ employeeId, otp, action });
    if (!record)
      return res.status(400).json({ message: "Invalid OTP or action" });

    // Check expiry
    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ employeeId });
      return res.status(400).json({ message: "OTP expired" });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Handle time-in
    if (action === "time-in") {
      // Check if already timed in today
      const existingAttendance = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
      });

      if (existingAttendance) {
        await Otp.deleteMany({ employeeId });
        return res.status(400).json({ message: "Already timed in for today" });
      }

      const status = calculateStatus(now);
      await Attendance.create({
        employeeId,
        timeIn: now,
        date: today,
        status,
      });

      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-In recorded successfully", status });
    }

    // Handle time-out
    if (action === "time-out") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const open = await Attendance.findOne({
        employeeId,
        date: { $gte: today },
        timeOut: null,
      });

      if (!open) {
        await Otp.deleteMany({ employeeId });
        return res
          .status(400)
          .json({ message: "No open time-in found to time-out" });
      }

      open.timeOut = now;
      await open.save();
      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-Out recorded successfully" });
    }

    return res.status(400).json({ message: "Unknown action" });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get today attendance summary
const getTodayAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await Employee.countDocuments();

    // Count present employees (those with attendance record today)
    const presentCount = await Attendance.countDocuments({
      date: { $gte: today },
    });

    const absentCount = totalEmployees - presentCount;

    // Count late employees today
    const lateCount = await Attendance.countDocuments({
      date: { $gte: today },
      status: "late",
    });

    res.json({
      total: totalEmployees,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
    });
  } catch (err) {
    console.error("Error in getTodayAttendanceSummary:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all attendance records with employee details
const getAllAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;
    const query = {};

    // Validate and parse date filter
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      parsedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(parsedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = { $gte: parsedDate, $lt: nextDay };
    }

    const records = await Attendance.find(query)
      .populate("employeeId", "name email employeeId")
      .sort({ timeIn: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Attendance.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    console.error("Error in getAllAttendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

// Get attendance for specific employee
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const employee = await findEmployeeByEmployeeId(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const records = await Attendance.find({ employeeId: employee._id }) // Use ObjectId here
      .sort({ timeIn: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Attendance.countDocuments({ employeeId: employee._id });

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    console.error("Error in getEmployeeAttendance:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getTodayAttendanceSummary,
  getAllAttendance,
  getEmployeeAttendance,
  createUser,
  getUsers,
  getUsersById,
  updateUser,
  deleteUser,
};

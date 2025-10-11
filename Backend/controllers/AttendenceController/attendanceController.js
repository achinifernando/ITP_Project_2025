const Employee = require("../../models/AttendenceTaskModel/User");
const Attendance = require("../../models/AttendenceTaskModel/Attendance");
const Otp = require("../../models/AttendenceTaskModel/otp");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, contactNumber, address, role } = req.body;
    const existingUser = await Employee.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Generate employee ID
    // Find all employees with employeeId and extract the numeric part
    const employeesWithId = await Employee.find({ 
      employeeId: { $exists: true, $ne: null, $ne: '' } 
    });
    
    let employeeId;
    if (employeesWithId.length > 0) {
      // Extract all numeric parts from existing IDs
      const existingNumbers = employeesWithId
        .map(emp => {
          const match = emp.employeeId.match(/\d+/); // Extract numbers from ID
          return match ? parseInt(match[0]) : 0;
        })
        .filter(num => !isNaN(num));
      
      // Get the highest number
      const maxNumber = Math.max(...existingNumbers, 0);
      const nextNumber = maxNumber + 1;
      
      // Get the prefix from the first existing ID (e.g., 'EMP' from 'EMP001')
      const firstId = employeesWithId[0].employeeId;
      const prefix = firstId.replace(/\d+/g, ''); // Remove all numbers to get prefix
      const digitCount = (firstId.match(/\d+/) || [''])[0].length; // Get digit count
      
      // Generate new ID with same format
      employeeId = `${prefix}${String(nextNumber).padStart(digitCount, '0')}`;
    } else {
      // Default format if no existing IDs (you can customize this)
      employeeId = 'EMP0001';
    }
    
    // Store plain password for email (before hashing)
    const plainPassword = password;
    
    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new Employee({
      employeeId,
      name,
      email,
      password: hashedPassword,
      contactNumber,
      address,
      role,
    });
    await user.save();
    console.log(`User created successfully: ${employeeId} - ${email}`);
    
    // Send welcome email with login credentials (non-blocking)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const emailSubject = "Welcome to the Company - Your Login Credentials";
        const emailText = `
Dear ${name},

Welcome to our company! Your employee account has been successfully created.

Here are your login credentials:

Employee ID: ${employeeId}
Username (Email): ${email}
Temporary Password: ${plainPassword}

Please login to the system using these credentials at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

For security reasons, we strongly recommend that you change your password after your first login.

If you have any questions or need assistance, please contact the HR department.

Best regards,
HR Department
        `;
        
        await sendEmail(email, emailSubject, emailText);
        console.log(`Welcome email sent to ${email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError.message);
        // Don't fail the user creation if email fails
      }
    } else {
      console.log("Email credentials not configured. Skipping email notification.");
    }
    
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: err.message, error: err.toString() });
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



// Helper: Generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: Send email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  return await transporter.sendMail(mailOptions);
};

// Helper: Calculate attendance status
const calculateStatus = (timeIn) => {
  const hour = timeIn.getHours();
  const minute = timeIn.getMinutes();
  return (hour > 9 || (hour === 9 && minute > 30)) ? 'late' : 'present';
};

// Send OTP
// Send OTP for attendance
const sendOtp = async (req, res) => {
  const { employeeId, action } = req.body;
  if (!employeeId || !action) {
    return res.status(400).json({ message: "employeeId and action required" });
  }
  try {
    // Find employee by employeeId string
    const employee = await Employee.findOne({ employeeId });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (action === "time-out") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Use employee._id for attendance query
      const open = await Attendance.findOne({
        employeeId: employee._id,
        date: { $gte: today },
        timeOut: null
      });
      if (!open) return res.status(400).json({ message: "No active time-in found to time-out" });
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
      res.json({ message: "OTP sent successfully. Check your email." });
    } catch (emailError) {
      await Otp.deleteMany({ employeeId });
      res.status(500).json({ message: "Failed to send OTP email. Please check email configuration." });
    }
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Verify OTP and record attendance
const verifyOtp = async (req, res) => {
  const { employeeId, otp, action } = req.body;
  if (!employeeId || !otp || !action) {
    return res.status(400).json({ message: "employeeId, otp and action required" });
  }
  try {
    const record = await Otp.findOne({ employeeId, otp, action });
    if (!record) return res.status(400).json({ message: "Invalid OTP or action" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ employeeId });
      return res.status(400).json({ message: "OTP expired" });
    }

    // Find employee by employeeId string
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      await Otp.deleteMany({ employeeId });
      return res.status(404).json({ message: "Employee not found" });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (action === "time-in") {
      const existingAttendance = await Attendance.findOne({
        employeeId: employee._id,
        date: { $gte: today }
      });
      if (existingAttendance) {
        await Otp.deleteMany({ employeeId });
        return res.status(400).json({ message: "Already timed in for today" });
      }
      const status = calculateStatus(now);
      await Attendance.create({
        employeeId: employee._id,
        timeIn: now,
        date: today,
        status
      });
      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-In recorded successfully", status });
    }

    if (action === "time-out") {
      const open = await Attendance.findOne({
        employeeId: employee._id,
        date: { $gte: today },
        timeOut: null
      });
      if (!open) {
        await Otp.deleteMany({ employeeId });
        return res.status(400).json({ message: "No open time-in found to time-out" });
      }
      open.timeOut = now;
      await open.save();
      await Otp.deleteMany({ employeeId });
      return res.json({ message: "Time-Out recorded successfully" });
    }

    return res.status(400).json({ message: "Unknown action" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's attendance summary
const getTodayAttendanceSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalEmployees = await Employee.countDocuments();
    const presentCount = await Attendance.countDocuments({ date: { $gte: today } });
    const absentCount = totalEmployees - presentCount;
    const lateCount = await Attendance.countDocuments({ date: { $gte: today }, status: 'late' });

    res.json({
      total: totalEmployees,
      present: presentCount,
      absent: absentCount,
      late: lateCount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all attendance records (with employee details)
const getAllAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, date } = req.query;
    const query = {};

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
      .populate('employeeId', 'name employeeId')
      .sort({ date: -1, timeIn: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Attendance.countDocuments(query);

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

// Get attendance for a specific employee
const getEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const records = await Attendance.find({ employeeId: employee._id })
      .sort({ timeIn: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .exec();

    const total = await Attendance.countDocuments({ employeeId: employee._id });

    res.json({
      records,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance trends for the last N days
const getAttendanceTrends = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const totalEmployees = await Employee.countDocuments();
    
    const trends = [];
    const today = new Date();
    
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const presentCount = await Attendance.countDocuments({
        date: { $gte: date, $lt: nextDay }
      });
      
      const lateCount = await Attendance.countDocuments({
        date: { $gte: date, $lt: nextDay },
        status: 'late'
      });
      
      const absentCount = totalEmployees - presentCount;
      
      trends.push({
        date: date.toISOString().split('T')[0],
        present: presentCount,
        absent: absentCount,
        late: lateCount
      });
    }
    
    res.json(trends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getTodayAttendanceSummary,
  getAllAttendance,
  getEmployeeAttendance,
  getAttendanceTrends,
  createUser,
  getUsers,
  getUsersById,
  updateUser,
  deleteUser,
};

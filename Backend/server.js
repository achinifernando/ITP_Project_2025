require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Added missing path import
const authRoutes = require("./routes/authRoute");
const UserRoute = require("./routes/UserRoute");
const taskRoute = require("./routes/taskRoute");
const reportRoutes = require("./routes/reportRoutes");
const checklistRoute = require("./routes/checklistRoute");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoute");



const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(MONGODB_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoute);
app.use('/api/tasks', taskRoute);
app.use('/api/reports', reportRoutes);
app.use("/api/templates", checklistRoute);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);

// Serve uploads folder - FIXED THIS LINE
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default route
app.get('/', (req, res) => res.send('Server is running'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
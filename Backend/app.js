//mongoDB_pwd : UhgdXG1oIShwMf3r
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const websocketServer = require("./websocket");
const morgan = require("morgan");

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser()); 
app.use(morgan('dev'));

// parse URL-encoded bodies (for forms)
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
const MONGODB_URL = "mongodb+srv://achinifernando401:05T4v8GBwkd90Unb@cluster0.iecga0o.mongodb.net/";
mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log('Database connected successfully..');
    })
    .catch(err => console.error('Error in database connecting:', err));

// Make uploads folder public
app.use("/files", express.static(path.join(__dirname, "uploads")));

// =============== AUTHENTICATION ROUTES (ADD THESE FIRST) =======================
app.use("/api/company", require("./routes/AttendenceRoutes/authRoute")); 
app.use("/client", require("./routes/ClientPortalRoutes/clientRoute"));

// =============== CLIENT PORTAL ROUTES =======================

app.use("/lorryCategories", require("./routes/ClientPortalRoutes/lorryCategoryRoute"));
app.use("/lorryType", require("./routes/ClientPortalRoutes/lorryTypesRoute"));
app.use("/lorryBrands", require("./routes/ClientPortalRoutes/lorrymodelRoute"));
app.use("/serviceRequest", require("./routes/ClientPortalRoutes/serviceRequestRoute"));
app.use("/service", require("./routes/ClientPortalRoutes/servicesRoute"));
app.use("/orders", require("./routes/ClientPortalRoutes/ordersRoute"));
app.use("/quotations", require("./routes/ClientPortalRoutes/quotationRoute"));
app.use("/quotationRequest", require("./routes/ClientPortalRoutes/quotationRequestsRoute"));
app.use("/client-payments", require("./routes/ClientPortalRoutes/paymentRoute")); // Renamed to avoid conflict
app.use("/googleAuth", require("./routes/ClientPortalRoutes/googleAuthRoute"));

// =============== DISPATCH ROUTES =======================
app.use("/deliveries", require("./routes/DispatchRoutes/deliveries"));
app.use("/drivers", require("./routes/DispatchRoutes/drivers"));
app.use("/vehicles", require("./routes/DispatchRoutes/vehicles"));
app.use("/assignments", require("./routes/DispatchRoutes/assignment"));
app.use("/notifications", require("./routes/DispatchRoutes/notifications"));
app.use("/tracking", require("./routes/DispatchRoutes/tracking"));
app.use("/dispatch-reports", require("./routes/DispatchRoutes/dispatchreports"));

// =============== ATTENDANCE MANAGEMENT & TASK MANAGEMENT ROUTES ===========
app.use("/api/auth", require("./routes/AttendenceRoutes/authRoute"));
app.use("/api/users", require("./routes/AttendenceRoutes/UserRoute"));
app.use("/api/tasks", require("./routes/TaskManagementRoutes/taskRoute"));
app.use("/api/task-reports", require("./routes/TaskManagementRoutes/reportRoutes"));
app.use("/api/templates", require("./routes/TaskManagementRoutes/checklistRoute"));
app.use("/api/attendance", require("./routes/AttendenceRoutes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/AttendenceRoutes/leaveRoute"));

// =============== INVENTORY ROUTES ===================
app.use("/api/stocks", require("./routes/InventoryRoutes/stockRouter"));
app.use("/api/requests", require("./routes/InventoryRoutes/supplierRequests"));
app.use("/api/alerts", require("./routes/InventoryRoutes/alerts"));
app.use("/api/inventory-reports", require("./routes/InventoryRoutes/reports"));

// =============== COMPANY ROUTES ===================
app.use("/admin-categories", require("./routes/CompanyManagementRoutes/Category"));
app.use("/admin-services", require("./routes/CompanyManagementRoutes/Service"));
app.use("/admin-lorry-models", require("./routes/CompanyManagementRoutes/lorryModel"));
app.use("/admin-lorry-types", require("./routes/CompanyManagementRoutes/lorryType"));
app.use("/admin-orders", require("./routes/CompanyManagementRoutes/order"));
app.use("/admin-payments", require("./routes/CompanyManagementRoutes/payment"));
app.use("/admin-repairs", require("./routes/CompanyManagementRoutes/repair"));
app.use("/admin-attendance", require("./routes/CompanyManagementRoutes/attendance"));
app.use("/admin-payrolls", require("./routes/CompanyManagementRoutes/payroll"));


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// WebSocket status endpoint
app.get("/websocket-status", (req, res) => {
  const stats = websocketServer.getActiveConnections();
  res.json({
    status: "WebSocket server is running",
    ...stats
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// 404 handler - MUST be the last route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
websocketServer.setupWebSocket(server);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  // Client joins a room for their userId
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  // Handle delivery tracking subscription
  socket.on("subscribeToDelivery", (deliveryId) => {
    socket.join(`delivery:${deliveryId}`);
    console.log(`Socket ${socket.id} subscribed to delivery: ${deliveryId}`);
  });

  // Handle delivery tracking unsubscription
  socket.on("unsubscribeFromDelivery", (deliveryId) => {
    socket.leave(`delivery:${deliveryId}`);
    console.log(`Socket ${socket.id} unsubscribed from delivery: ${deliveryId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
  });
});

// Make io accessible to controllers
app.set("io", io);



// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// Export for testing purposes
module.exports = app;
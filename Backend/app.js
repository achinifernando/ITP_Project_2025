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

//=============== CLIENT PORTAL ROUTES =======================
app.use("/client", require("./routes/clientRoute.js"));
app.use("/lorryCategories", require("./routes/lorryCategoryRoute.js"));
app.use("/lorryType", require("./routes/lorryTypesRoute.js"));
app.use("/lorryBrands", require("./routes/lorrymodelRoute.js"));
app.use("/serviceRequest", require("./routes/serviceRequestRoute.js"));
app.use("/service", require("./routes/servicesRoute.js"));
app.use("/orders", require("./routes/ordersRoute.js"));
app.use("/quotations", require("./routes/quotationRoute.js"));
app.use("/quotationRequest", require("./routes/quotationRequestsRoute.js"));
app.use("/stock", require("./routes/stockRouter.js"));
app.use("/payments", require("./routes/paymentRoute.js"));
app.use("/googleAuth", require("./routes/googleAuthRoute.js"));

//=============== DISPATCH ROUTES =======================
app.use("/deliveries", require("./routes/deliveries"));
app.use("/drivers", require("./routes/drivers"));
app.use("/vehicles", require("./routes/vehicles"));
app.use("/assignments", require("./routes/assignment"));
app.use("/notifications", require("./routes/notifications"));
app.use("/tracking", require("./routes/tracking"));
app.use("/dispatch-reports", require("./routes/reports")); // Renamed to avoid conflict

//=============== ATTENDANCE MANAGEMENT & TASK MANAGEMENT ROUTES ===========
app.use('/api/auth', require("./routes/authRoute"));
app.use('/api/users', require("./routes/UserRoute"));
app.use('/api/tasks', require("./routes/taskRoute"));
app.use('/api/task-reports', require("./routes/reportRoutes")); // Renamed to avoid conflict
app.use("/api/templates", require("./routes/checklistRoute"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/leaves", require("./routes/leaveRoute"));

//=============== INVENTORY ROUTES ===================
app.use('/api/suppliers', require("./routes/suppliers.js"));
app.use('/api/stocks', require("./routes/stocks.js"));
app.use('/api/requests', require("./routes/supplierRequests.js"));
app.use('/api/alerts', require("./routes/alerts.js"));
app.use('/api/inventory-reports', require("./routes/reports.js")); // Renamed to avoid conflict

//=============== COMPANY ROUTES ===================
app.use('/admin-categories', require("./routes/Category.js"));
app.use('/admin-services', require("./routes/Service.js"));
app.use('/admin-lorry-models', require("./routes/lorryModel.js"));
app.use('/admin-lorry-types', require("./routes/lorryType.js"));
app.use('/admin-orders', require("./routes/Order.js"));
app.use('/admin-payments', require("./routes/payment.js"));
app.use('/admin-repairs', require("./routes/repair.js"));
app.use('/admin-attendance', require("./routes/attendance.js"));
app.use('/admin-payrolls', require("./routes/payroll.js"));
app.use('/admin-employees', require("./routes/employee.js"));
app.use('/admin-clients', require("./routes/client.js"));
app.use('/admin-quotation-requests', require("./routes/QuotationRequest.js"));
app.use('/admin-quotations', require("./routes/Quotation.js"));






// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

// WebSocket setup (if needed)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Export for testing purposes
module.exports = app;
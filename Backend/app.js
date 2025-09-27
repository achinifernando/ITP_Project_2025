import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import websocketServer from "./websocket.js";
import morgan from "morgan";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 5000;

// ================= Middleware =================
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

// ================= MongoDB Connection =================
const MONGODB_URL =
  process.env.MONGODB_URL ||
  "mongodb+srv://achinifernando401:05T4v8GBwkd90Unb@cluster0.iecga0o.mongodb.net/";

mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log(" Database connected successfully..");
  })
  .catch((err) => console.error(" Error in database connecting:", err));

// ================= Static Files =================
// Serve uploads folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/files", express.static(path.join(__dirname, "uploads")));

// ================= Routes =================
// --- Authentication
import authRoute from "./routes/AttendenceRoutes/authRoute.js";
import clientRoute from "./routes/ClientPortalRoutes/clientRoute.js";

// --- Client Portal
import lorryCategoryRoute from "./routes/ClientPortalRoutes/lorryCategoryRoute.js";
import lorryTypesRoute from "./routes/ClientPortalRoutes/lorryTypesRoute.js";
import lorryModelRoute from "./routes/ClientPortalRoutes/lorrymodelRoute.js";
import serviceRequestRoute from "./routes/ClientPortalRoutes/serviceRequestRoute.js";
import servicesRoute from "./routes/ClientPortalRoutes/servicesRoute.js";
import ordersRoute from "./routes/ClientPortalRoutes/ordersRoute.js";
import quotationRoute from "./routes/ClientPortalRoutes/quotationRoute.js";
import quotationRequestsRoute from "./routes/ClientPortalRoutes/quotationRequestsRoute.js";
import paymentRoute from "./routes/ClientPortalRoutes/paymentRoute.js";
import googleAuthRoute from "./routes/ClientPortalRoutes/googleAuthRoute.js";

// --- Dispatch
import deliveriesRoute from "./routes/DispatchRoutes/deliveries.js";
import driversRoute from "./routes/DispatchRoutes/drivers.js";
import vehiclesRoute from "./routes/DispatchRoutes/vehicles.js";
import assignmentRoute from "./routes/DispatchRoutes/assignment.js";
import notificationsRoute from "./routes/DispatchRoutes/notifications.js";
import trackingRoute from "./routes/DispatchRoutes/tracking.js";
import dispatchReportsRoute from "./routes/DispatchRoutes/dispatchreports.js";

// --- Attendance & Task Management
import userRoute from "./routes/AttendenceRoutes/UserRoute.js";
import taskRoute from "./routes/TaskManagementRoutes/taskRoute.js";
import reportRoutes from "./routes/TaskManagementRoutes/reportRoutes.js";
import checklistRoute from "./routes/TaskManagementRoutes/checklistRoute.js";
import attendanceRoutes from "./routes/AttendenceRoutes/attendanceRoutes.js";
import leaveRoute from "./routes/AttendenceRoutes/leaveRoute.js";

// --- Inventory
import stockRouter from "./routes/InventoryRoutes/stockRouter.js";
import supplierRequests from "./routes/InventoryRoutes/supplierRequests.js";
import alertsRoute from "./routes/InventoryRoutes/alerts.js";
import reportsRoute from "./routes/InventoryRoutes/reports.js";
import supplierRoute from "./routes/InventoryRoutes/suppliers.js";

// --- Company Management
import categoryRoute from "./routes/CompanyManagementRoutes/Category.js";
import serviceRoute from "./routes/CompanyManagementRoutes/Service.js";
import lorryModelAdmin from "./routes/CompanyManagementRoutes/lorryModel.js";
import lorryTypeAdmin from "./routes/CompanyManagementRoutes/lorryType.js";
import orderRoute from "./routes/CompanyManagementRoutes/order.js";
import paymentAdmin from "./routes/CompanyManagementRoutes/payment.js";
import repairRoute from "./routes/CompanyManagementRoutes/repair.js";
import attendanceAdmin from "./routes/CompanyManagementRoutes/attendance.js";
import payrollRoute from "./routes/CompanyManagementRoutes/payroll.js";

// ---------------- Apply Routes ----------------
app.use("/api/company", authRoute);
app.use("/client", clientRoute);

app.use("/lorryCategories", lorryCategoryRoute);
app.use("/lorryType", lorryTypesRoute);
app.use("/lorryBrands", lorryModelRoute);
app.use("/serviceRequest", serviceRequestRoute);
app.use("/service", servicesRoute);
app.use("/orders", ordersRoute);
app.use("/quotations", quotationRoute);
app.use("/quotationRequest", quotationRequestsRoute);
app.use("/client-payments", paymentRoute);
app.use("/googleAuth", googleAuthRoute);

app.use("/deliveries", deliveriesRoute);
app.use("/drivers", driversRoute);
app.use("/vehicles", vehiclesRoute);
app.use("/assignments", assignmentRoute);
app.use("/notifications", notificationsRoute);
app.use("/tracking", trackingRoute);
app.use("/dispatch-reports", dispatchReportsRoute);

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/tasks", taskRoute);
app.use("/api/task-reports", reportRoutes);
app.use("/api/templates", checklistRoute);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoute);

app.use("/api/stocks", stockRouter);
app.use("/api/requests", supplierRequests);
app.use("/api/alerts", alertsRoute);
app.use("/api/inventory-reports", reportsRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/reports", reportsRoute);

app.use("/admin-categories", categoryRoute);
app.use("/admin-services", serviceRoute);
app.use("/admin-lorry-models", lorryModelAdmin);
app.use("/admin-lorry-types", lorryTypeAdmin);
app.use("/admin-orders", orderRoute);
app.use("/admin-payments", paymentAdmin);
app.use("/admin-repairs", repairRoute);
app.use("/admin-attendance", attendanceAdmin);
app.use("/admin-payrolls", payrollRoute);


// ================= Health Check =================
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ================= WebSocket Status =================
app.get("/websocket-status", (req, res) => {
  const stats = websocketServer.getActiveConnections();
  res.json({
    status: "WebSocket server is running",
    ...stats,
  });
});

// ================= Error Handling =================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

// 404 handler (last route)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================= HTTP & WebSocket Setup =================
const server = http.createServer(app);

// Init WebSocket server
websocketServer.setupWebSocket(server);

// Init Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket.IO client connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on("subscribeToDelivery", (deliveryId) => {
    socket.join(`delivery:${deliveryId}`);
    console.log(`Socket ${socket.id} subscribed to delivery: ${deliveryId}`);
  });

  socket.on("unsubscribeFromDelivery", (deliveryId) => {
    socket.leave(`delivery:${deliveryId}`);
    console.log(`Socket ${socket.id} unsubscribed from delivery: ${deliveryId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket.IO client disconnected:", socket.id);
  });
});

// Make io accessible in controllers
app.set("io", io);

// ================= Start Server =================
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

export default app;


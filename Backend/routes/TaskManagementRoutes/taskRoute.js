const express = require('express');
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();
const {getDashboardData, 
    getUserDashboardData, 
    getTasks, 
    getTaskById, 
    createTask, 
    updateTask, 
    deleteTask, 
    updateTaskStatus, 
    updateTaskChecklist,
    getTaskChecklist
} = require("../controllers/taskController");

//task management routes
router.get("/taskChecklist/:id", protect, getTaskChecklist); // Get checklist for a selected task
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); //get all tasks(Admin:all, user: assigned)
router.get("/:id", protect, getTaskById); //get tasks by ID
router.post("/", protect, adminOnly, createTask); //create task (Admin only)
router.put("/:id", protect, updateTask); //update task details
router.delete("/:id", protect,adminOnly, deleteTask); //delete a task (admin only)
router.put("/:id/status", protect, updateTaskStatus); //update task status
router.put("/:id/todo", protect, updateTaskChecklist); //update task checlist

module.exports = router;
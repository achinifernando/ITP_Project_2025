const express = require("express");
const { protectUser, adminOnly } = require("../../middleware/authMiddleware");
const router = express.Router();
const {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getTaskChecklist,
} = require("../../controllers/TaskControllers/taskController");

//task management routes
router.get("/taskChecklist/:id", protectUser, getTaskChecklist); // Get checklist for a selected task
router.get("/dashboard-data", protectUser, getDashboardData);
router.get("/user-dashboard-data", protectUser, getUserDashboardData);
router.get("/", protectUser, getTasks); //get all tasks(Admin:all, user: assigned)
router.get("/:id", protectUser, getTaskById); //get tasks by ID
router.post("/", protectUser, adminOnly, createTask); //create task (Admin only)
router.put("/:id", protectUser, updateTask); //update task details
router.delete("/:id", protectUser, adminOnly, deleteTask); //delete a task (admin only)
router.put("/:id/status", protectUser, updateTaskStatus); //update task status
router.put("/:id/todo", protectUser, updateTaskChecklist); //update task checlist

module.exports = router;

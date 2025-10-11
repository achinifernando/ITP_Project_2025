const express = require("express");
const { protectUser, adminOnly } = require("../../middleware/authMiddleware");
const router = express.Router();
const {
  getDashboardData,
  getUserDashboardData,
  getTeamMembersWithTasks,
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
router.get("/taskChecklist/:id", protectUser, getTaskChecklist);
router.get("/dashboard-data", protectUser, getDashboardData);
router.get("/user-dashboard-data", protectUser, getUserDashboardData);
router.get("/team-members-with-tasks", protectUser, getTeamMembersWithTasks);
router.get("/", protectUser, getTasks);
router.get("/:id", protectUser, getTaskById);
router.post("/", protectUser, adminOnly, createTask);
router.put("/:id", protectUser, updateTask); // Removed adminOnly to allow assigned users to update
router.delete("/:id", protectUser, adminOnly, deleteTask);
router.put("/:id/status", protectUser, updateTaskStatus);
router.put("/:id/todo", protectUser, updateTaskChecklist);

module.exports = router;
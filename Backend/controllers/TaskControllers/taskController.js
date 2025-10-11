// controllers/taskController.js
const Task = require("../../models/AttendenceTaskModel/Task");
const ChecklistTemplate = require("../../models/AttendenceTaskModel/ChecklistTemplate");
const User = require("../../models/AttendenceTaskModel/User");

// ================= Dashboard =================
const getDashboardData = async (req, res) => {
  try {
    // Task counts by status
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const pendingTasks = await Task.countDocuments({ status: "Pending" });
    const inProgress = await Task.countDocuments({ status: "In Progress" });

    // Priority distribution
    const lowPriority = await Task.countDocuments({ priority: "Low" });
    const mediumPriority = await Task.countDocuments({ priority: "Medium" });
    const highPriority = await Task.countDocuments({ priority: "High" });
    
    console.log("Priority counts:", { lowPriority, mediumPriority, highPriority });

    // Recent tasks (last 5 tasks, sorted by creation date)
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name email");

    // Monthly completion data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCompletion = await Task.aggregate([
      {
        $match: {
          status: "Completed",
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format monthly data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};
    monthlyCompletion.forEach(item => {
      const monthName = monthNames[item._id.month - 1];
      monthlyData[monthName] = item.count;
    });

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgress,
      taskStats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgress
      },
      priorityDistribution: {
        Low: lowPriority,
        Medium: mediumPriority,
        High: highPriority
      },
      recentTasks,
      monthlyCompletion: monthlyData
    });
  } catch (err) {
    console.error("Dashboard data error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    // assignedTo is an array, so we need to use $in operator
    const totalTasks = await Task.countDocuments({ assignedTo: { $in: [userId] } });
    const completedTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "Completed",
    });
    const pendingTasks = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "Pending",
    });
    const inProgress = await Task.countDocuments({
      assignedTo: { $in: [userId] },
      status: "In Progress",
    });

    // Priority distribution
    const lowPriority = await Task.countDocuments({ 
      assignedTo: { $in: [userId] },
      priority: "Low" 
    });
    const mediumPriority = await Task.countDocuments({ 
      assignedTo: { $in: [userId] },
      priority: "Medium" 
    });
    const highPriority = await Task.countDocuments({ 
      assignedTo: { $in: [userId] },
      priority: "High" 
    });

    // Recent tasks (last 5 tasks, sorted by creation date)
    const recentTasks = await Task.find({ assignedTo: { $in: [userId] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assignedTo", "name email");

    // Monthly completion data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyCompletion = await Task.aggregate([
      {
        $match: {
          assignedTo: { $in: [userId] },
          status: "Completed",
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format monthly data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData = {};
    monthlyCompletion.forEach(item => {
      const monthName = monthNames[item._id.month - 1];
      monthlyData[monthName] = item.count;
    });

    res.json({ 
      totalTasks, 
      completedTasks, 
      pendingTasks,
      inProgress,
      charts: {
        taskDistribution: {
          All: totalTasks,
          Pending: pendingTasks,
          InProgress: inProgress,
          Completed: completedTasks
        },
        taskPriorityLevels: {
          Low: lowPriority,
          Medium: mediumPriority,
          High: highPriority
        }
      },
      recentTasks,
      monthlyCompletion: monthlyData
    });
  } catch (err) {
    console.error("User dashboard data error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Team Members =================
const getTeamMembersWithTasks = async (req, res) => {
  try {
    // Get only users with member role
    const users = await User.find({ role: 'member' }).select('name email role _id');

    // Get all tasks with populated assignedTo
    const tasks = await Task.find({}).populate('assignedTo', 'name email _id');

    // Group tasks by assigned users
    const teamMembersWithTasks = users.map(user => {
      const userTasks = tasks.filter(task =>
        task.assignedTo && task.assignedTo.some(assigned => assigned._id.toString() === user._id.toString())
      );

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        tasks: userTasks.map(task => ({
          _id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          orderID: task.orderID,
          bodyType: task.bodyType,
          todoChecklist: task.todoChecklist
        }))
      };
    });

    res.json(teamMembersWithTasks);
  } catch (err) {
    console.error("Team members with tasks error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Tasks =================
// ================= Get Tasks =================
const getTasks = async (req, res) => {
  try {
    // Defensive check: ensure req.user exists
    if (!req.user || !req.user.role || !req.user._id) {
      console.error("❌ getTasks: Missing user context", { user: req.user });
      return res.status(401).json({ message: "Unauthorized: Missing user context" });
    }

    const isAdmin = req.user.role === "admin";
    // assignedTo is an array, so we need to use $in operator for non-admin users
    const query = isAdmin ? {} : { assignedTo: { $in: [req.user._id] } };

    console.log("📋 getTasks Query:", {
      userId: req.user._id,
      userRole: req.user.role,
      isAdmin,
      query
    });

    const tasks = await Task.find(query).populate("assignedTo", "name email");

    console.log(`✅ Found ${tasks.length} tasks for user ${req.user.email || req.user._id}`);

    res.status(200).json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({
      message: "Server error while retrieving tasks",
      error: error.message,
    });
  }
};


const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Create Task with Template =================
const createTask = async (req, res) => {
  try {
    const { templateId, ...taskData } = req.body;

    let todoChecklist = [];

    // If templateId is provided, fetch the template and create checklist
    if (templateId) {
      const template = await ChecklistTemplate.findById(templateId);
      if (template) {
        todoChecklist = template.items.map(item => ({
          title: item.text, // Note: your template uses "text" field
          completed: false
        }));
      }
    }
    
    // If no template but manual checklist items provided
    if (!templateId && taskData.todoChecklist && taskData.todoChecklist.length > 0) {
      todoChecklist = taskData.todoChecklist.map(item => ({
        title: item.title,
        completed: item.completed || false
      }));
    }

    const task = new Task({
      ...taskData,
      todoChecklist
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { templateId,...updateData } = req.body;
    
    // If templateId is provided, fetch and update checklist
    if (templateId) {
      const template = await ChecklistTemplate.findById(templateId);
      if (template) {
        updateData.todoChecklist = template.items.map(item => ({
          title: item.text,
          completed: false
        }));
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true 
      }
    ).populate("assignedTo", "name email");
    
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updatedTask);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check permissions: Admin can update any task, members can only update their assigned tasks
    const isAdmin = req.user.role === "admin";
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ 
        message: "Forbidden: You can only update tasks assigned to you" 
      });
    }

    task.status = status;
    await task.save();

    console.log(`✅ Task status updated by ${req.user.email || req.user._id}: ${task.title} → ${status}`);

    res.json({ message: "Task status updated", task });
  } catch (err) {
    console.error("❌ Error updating task status:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Checklist =================
const getTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).select("todoChecklist");
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task.todoChecklist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateTaskChecklist = async (req, res) => {
  try {
    const { todoChecklist } = req.body; // expects array of { title, completed }
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Check permissions: Admin can update any task, members can only update their assigned tasks
    const isAdmin = req.user.role === "admin";
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ 
        message: "Forbidden: You can only update tasks assigned to you" 
      });
    }

    task.todoChecklist = todoChecklist;
    await task.save();

    console.log(`✅ Checklist updated by ${req.user.email || req.user._id} for task: ${task.title}`);

    res.json({ message: "Checklist updated", checklist: task.todoChecklist });
  } catch (err) {
    console.error("❌ Error updating checklist:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Export =================
module.exports = {
  getDashboardData,
  getUserDashboardData,
  getTeamMembersWithTasks,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskChecklist,
  updateTaskChecklist,
};

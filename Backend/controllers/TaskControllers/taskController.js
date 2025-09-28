// controllers/taskController.js
const Task = require("../../models/AttendenceTaskModel/Task");
const ChecklistTemplate = require("../../models/AttendenceTaskModel/ChecklistTemplate");

// ================= Dashboard =================
const getDashboardData = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: "Completed" });
    const pendingTasks = await Task.countDocuments({ status: "Pending" });

    res.json({ totalTasks, completedTasks, pendingTasks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getUserDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalTasks = await Task.countDocuments({ assignedTo: userId });
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Completed",
    });
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "Pending",
    });

    res.json({ totalTasks, completedTasks, pendingTasks });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Tasks =================
// ================= Get Tasks =================
const getTasks = async (req, res) => {
  try {
    // Defensive check: ensure req.user exists
    if (!req.user || !req.user.role || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Missing user context" });
    }

    const isAdmin = req.user.role === "admin";
    const query = isAdmin ? {} : { assignedTo: req.user._id };

    const tasks = await Task.find(query).populate("assignedTo", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
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

    task.status = status;
    await task.save();

    res.json({ message: "Task status updated", task });
  } catch (err) {
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

    task.todoChecklist = todoChecklist;
    await task.save();

    res.json({ message: "Checklist updated", checklist: task.todoChecklist });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ================= Export =================
module.exports = {
  getDashboardData,
  getUserDashboardData,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskChecklist,
  updateTaskChecklist,
};

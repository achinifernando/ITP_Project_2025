const Task = require("../../models/AttendenceTaskModel/Task");
const User = require("../../models/AttendenceTaskModel/User");
const excelJS = require("exceljs");

// @desc Export all tasks as an Excel file
// @route GET /api/reports/export/tasks
// @access Private (admin)
const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    // Define columns
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
    ];

    // Add rows
    tasks.forEach((task) => {
      let assignedTo = "Unassigned";

      if (Array.isArray(task.assignedTo)) {
        assignedTo = task.assignedTo
          .map((user) => `${user.name} (${user.email})`)
          .join(", ");
      } else if (task.assignedTo) {
        assignedTo = `${task.assignedTo.name} (${task.assignedTo.email})`;
      }

      worksheet.addRow({
        _id: task._id.toString(),
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate
          ? task.dueDate.toISOString().split("T")[0]
          : "N/A",
        assignedTo,
      });
    });

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting tasks", error: error.message });
  }
};

// @desc Export user-task report as an Excel file
// @route GET /api/reports/export/users
// @access Private (admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email _id").lean();
    const tasks = await Task.find().populate("assignedTo", "name email _id");

    // Initialize user-task map
    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    // Count tasks per user
    tasks.forEach((task) => {
      if (Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach((assignedUser) => {
          if (userTaskMap[assignedUser._id]) {
            userTaskMap[assignedUser._id].taskCount += 1;

            if (task.status === "Pending") {
              userTaskMap[assignedUser._id].pendingTasks += 1;
            } else if (task.status === "In Progress") {
              userTaskMap[assignedUser._id].inProgressTasks += 1;
            } else if (task.status === "Completed") {
              userTaskMap[assignedUser._id].completedTasks += 1;
            }
          }
        });
      } else if (task.assignedTo && userTaskMap[task.assignedTo._id]) {
        // If it's a single user (not array)
        userTaskMap[task.assignedTo._id].taskCount += 1;

        if (task.status === "Pending") {
          userTaskMap[task.assignedTo._id].pendingTasks += 1;
        } else if (task.status === "In Progress") {
          userTaskMap[task.assignedTo._id].inProgressTasks += 1;
        } else if (task.status === "Completed") {
          userTaskMap[task.assignedTo._id].completedTasks += 1;
        }
      }
    });

    // Create Excel workbook
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    // Define columns
    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    // Add rows
    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    // Send file
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_report.xlsx"'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting users", error: error.message });
  }
};

module.exports = { exportTasksReport, exportUsersReport };

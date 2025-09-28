const Task = require("../models/Task");
const User = require("../models/User");
const Attendance = require("../models/Attendance"); // Make sure to import Attendance model
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

// @desc Export attendance report as an Excel file
// @route GET /api/reports/export/attendance
// @access Private (hr_manager or admin)
const exportAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'excel' } = req.query;

    // Build query for date range
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Fetch attendance data with employee details
    const attendanceData = await Attendance.find(dateQuery)
      .populate('employeeId', 'name email') // ✅ correct field
      .sort({ date: -1 });

    if (format === 'excel') {
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      // Define headers
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Employee Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Check-In Time', key: 'checkInTime', width: 20 },
        { header: 'Check-Out Time', key: 'checkOutTime', width: 20 },
        { header: 'Hours Worked', key: 'hoursWorked', width: 15 }
      ];

      // Add rows
      attendanceData.forEach(record => {
        worksheet.addRow({
          employeeId: employee.employeeId || 'N/A',
          name: record.employeeId?.name || 'N/A',
          email: record.employeeId?.email || 'N/A',
          date: record.date ? record.date.toISOString().split('T')[0] : 'N/A',
          status: record.status || 'N/A',
          checkInTime: record.timeIn ? record.timeIn.toLocaleTimeString() : 'N/A',
          checkOutTime: record.timeOut ? record.timeOut.toLocaleTimeString() : 'N/A',
          hoursWorked: record.hoursWorked || 0
        });
      });

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      // Send file
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=attendance-report-${timestamp}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(400).json({ message: 'Invalid format specified' });
    }
  } catch (error) {
    console.error('Export attendance error:', error);
    res.status(500).json({ message: 'Error generating attendance report', error: error.message });
  }
};


// @desc Export employee data report as an Excel file
// @route GET /api/reports/export/employees
// @access Private (hr_manager or admin)
const exportEmployeeReport = async (req, res) => {
  try {
    const { format = 'excel' } = req.query;

    // Fetch all employee data
    const employees = await User.find({})
      .select('-password') // Exclude password
      .sort({ name: 1 });

    if (format === 'excel') {
      // Generate Excel file
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet('Employees Report');
      
      // Add headers
      worksheet.columns = [
        { header: 'Employee ID', key: 'employeeId', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'Date of Joining', key: 'dateOfJoining', width: 15 },
        { header: 'Status', key: 'status', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 15 }
      ];

      // Add data
      employees.forEach(employee => {
        worksheet.addRow({
          employeeId: employee.employeeId || 'N/A',
          name: employee.name || 'N/A',
          email: employee.email || 'N/A',
          role: employee.role || 'N/A',
          phone: employee.phone || 'N/A',
          address: employee.address || 'N/A',
          dateOfJoining: employee.dateOfJoining ? 
            employee.dateOfJoining.toISOString().split('T')[0] : 'N/A',
          status: employee.status || 'Active',
          createdAt: employee.createdAt ? 
            employee.createdAt.toISOString().split('T')[0] : 'N/A'
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Set response headers
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=employees-report-${timestamp}.xlsx`
      );

      // Send the file
      await workbook.xlsx.write(res);
      res.end();
      
    } else if (format === 'pdf') {
      // PDF generation logic would go here
      res.status(501).json({ message: 'PDF export not implemented yet' });
    } else {
      res.status(400).json({ message: 'Invalid format specified' });
    }

  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({ message: 'Error generating employees report', error: error.message });
  }
};

module.exports = { 
  exportTasksReport, 
  exportUsersReport, 
  exportAttendanceReport, 
  exportEmployeeReport 
};

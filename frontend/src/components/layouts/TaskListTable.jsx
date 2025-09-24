import React from "react";
import moment from "moment";
import "../../CSS/TaskManagerCSS/TaskListTable.css";

const TaskListTable = ({ 
  tableData = [], 
  loading = false,
  maxItems = 5 
}) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Completed":
        return "badge badge-completed";
      case "Pending":
        return "badge badge-pending";
      case "In Progress":
        return "badge badge-progress";
      default:
        return "badge";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "High":
        return "badge badge-high";
      case "Medium":
        return "badge badge-medium";
      case "Low":
        return "badge badge-low";
      default:
        return "badge";
    }
  };

  // Limit the number of items for dashboard display
  const displayedData = tableData.slice(0, maxItems);

  if (loading) {
    return (
      <div className="task-table-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created On</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.length > 0 ? (
            displayedData.map((task, index) => {
              const id = task.id || task._id || index;
              const title = task.title || task.task_name || "Untitled Task";
              const status = task.status || "Pending";
              const priority = task.priority || "Low";
              const createdOn = task.createdAt || task.created_on;
              const dueDate = task.dueDate || task.due_date;

              return (
                <tr key={id}>
                  <td>{index + 1}</td>
                  <td className="task-title-cell">{title}</td>
                  <td>
                    <span className={getStatusBadgeColor(status)}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <span className={getPriorityBadgeColor(priority)}>
                      {priority}
                    </span>
                  </td>
                  <td>
                    {createdOn ? moment(createdOn).format("Do MMM YYYY") : "-"}
                  </td>
                  <td>
                    {dueDate ? moment(dueDate).format("Do MMM YYYY") : "-"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="no-tasks-cell">
                <div className="no-tasks-content">
                  <i className="fas fa-tasks"></i>
                  <p>No tasks available</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {tableData.length > maxItems && (
        <div className="task-table-more">
          <p>And {tableData.length - maxItems} more tasks...</p>
        </div>
      )}
    </div>
  );
};

export default TaskListTable;
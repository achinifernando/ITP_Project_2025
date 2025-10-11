// components/Cards/TaskCard.js
import React, { useState } from "react";
import { updateTaskStatus } from "../../utils/apiPaths";

const TaskCard = (props) => {
  const { 
    task, 
    onClick, 
    onToggleChecklist, 
    isChecklistOpen, 
    refreshTasks,
    children,
    showAssignedUsers = true
  } = props;
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true);
      await updateTaskStatus(task._id, newStatus);
      await refreshTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ff4757';
      case 'Medium': return '#ffa502';
      case 'Low': return '#2ed573';
      default: return '#57606f';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return '#2ed573';
      case 'In Progress': return '#1e90ff';
      case 'Pending': return '#ffa502';
      default: return '#57606f';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="task-card">
      {/* Task Header */}
      <div className="task-header">
        <div className="task-title-section">
          <h3 className="task-title" onClick={onClick}>
            {task.title}
          </h3>
          {task.orderID && (
            <span className="order-id">Order #: {task.orderID}</span>
          )}
        </div>
        
        <div className="task-actions">
          <select 
            value={task.status} 
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={isUpdating}
            className="status-select"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* Task Metadata */}
      <div className="task-meta">
        <div className="meta-item">
          <span className="meta-label">Priority:</span>
          <span 
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>

        <div className="meta-item">
          <span className="meta-label">Due Date:</span>
          <span className="due-date">
            {formatDate(task.dueDate)}
          </span>
        </div>

        {task.bodyType && (
          <div className="meta-item">
            <span className="meta-label">Body Type:</span>
            <span className="body-type">{task.bodyType}</span>
          </div>
        )}
      </div>

      {/* Assigned Users */}
      {showAssignedUsers && task.assignedTo && (
        <div className="assigned-users">
          <span className="meta-label">Assigned To:</span>
          <div className="users-list">
            {Array.isArray(task.assignedTo) ? (
              task.assignedTo.map((user, index) => (
                <span key={user._id || index} className="user-tag">
                  {user.name || user.email}
                </span>
              ))
            ) : (
              <span className="user-tag">
                {task.assignedTo.name || task.assignedTo.email || 'Unassigned'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Checklist Summary */}
      <div className="checklist-summary">
        <div className="checklist-header">
          <span className="meta-label">Checklist:</span>
          <button 
            onClick={onToggleChecklist}
            className="checklist-toggle-btn"
          >
            {isChecklistOpen ? 'Hide' : 'Show'} Checklist
            <span className="checklist-stats">
              ({task.todoChecklist ? task.todoChecklist.filter(item => item.completed).length : 0}
              /{task.todoChecklist ? task.todoChecklist.length : 0})
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        {task.todoChecklist && task.todoChecklist.length > 0 && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                width: `${(task.todoChecklist.filter(item => item.completed).length / task.todoChecklist.length) * 100}%`
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Created/Updated Info */}
      <div className="task-footer">
        <span className="task-id">ID: {task._id?.substring(0, 8)}...</span>
        {task.createdAt && (
          <span className="created-date">
            Created: {formatDate(task.createdAt)}
          </span>
        )}
      </div>

      {/* Expandable Checklist Area */}
      {isChecklistOpen && (
        <div className="checklist-expanded">
          {children}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
// components/Cards/UserTaskCard.jsx
import React, { useState } from "react";
import TaskCard from "./TaskCard";

const UserTaskCard = ({ userData, onTaskClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { user, tasks } = userData;

  const getStatusCounts = () => {
    const counts = { total: tasks.length, pending: 0, inProgress: 0, completed: 0 };
    tasks.forEach(task => {
      if (task.status === 'Pending') counts.pending++;
      else if (task.status === 'In Progress') counts.inProgress++;
      else if (task.status === 'Completed') counts.completed++;
    });
    return counts;
  };

  const getPriorityCounts = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    tasks.forEach(task => {
      if (task.priority === 'High') counts.high++;
      else if (task.priority === 'Medium') counts.medium++;
      else if (task.priority === 'Low') counts.low++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  return (
    <div className="user-task-card">
      {/* User Header */}
      <div className="user-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="user-info">
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3 className="user-name">{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <span className={`user-role ${user.role}`}>{user.role}</span>
          </div>
        </div>

        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-label">Tasks</span>
            <span className="stat-value">{statusCounts.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{statusCounts.pending}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress</span>
            <span className="stat-value in-progress">{statusCounts.inProgress}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completed</span>
            <span className="stat-value completed">{statusCounts.completed}</span>
          </div>
        </div>

        <div className="expand-icon">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {/* Task Summary */}
      <div className="task-summary">
        <div className="priority-summary">
          {priorityCounts.high > 0 && (
            <span className="priority-badge high">High: {priorityCounts.high}</span>
          )}
          {priorityCounts.medium > 0 && (
            <span className="priority-badge medium">Medium: {priorityCounts.medium}</span>
          )}
          {priorityCounts.low > 0 && (
            <span className="priority-badge low">Low: {priorityCounts.low}</span>
          )}
        </div>
      </div>

      {/* Expanded Tasks */}
      {isExpanded && tasks.length > 0 && (
        <div className="user-tasks">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick && onTaskClick(task)}
              showAssignedUsers={false} // Hide assigned users since we're already in user context
            />
          ))}
        </div>
      )}

      {isExpanded && tasks.length === 0 && (
        <div className="no-tasks">
          <p>No tasks assigned to this user</p>
        </div>
      )}
    </div>
  );
};

export default UserTaskCard;

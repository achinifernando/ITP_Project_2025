import React from "react";
import "../../CSS/TaskManagerCSS/TaskCard.css";

const TaskCard = ({ 
  task, 
  onClick, 
  onToggleChecklist, 
  isChecklistOpen, 
  children,
  refreshTasks 
}) => {
  const handleChecklistToggle = (e) => {
    e.stopPropagation();
    onToggleChecklist();
  };

  const handleCardClick = (e) => {
    // Only navigate if the click wasn't on the checklist toggle button or assigned members
    if (!e.target.closest('.checklist-toggle') && 
        !e.target.closest('.checklist-container') &&
        !e.target.closest('.members-list')) {
      onClick();
    }
  };

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to display assigned members
  const renderAssignedMembers = () => {
    if (!task.assignedTo || task.assignedTo.length === 0) {
      return <div className="member-count">No one assigned</div>;
    }

    // If assignedTo is an array of objects with name property
    if (typeof task.assignedTo[0] === 'object') {
      return (
        <div className="members-list">
          {task.assignedTo.slice(0, 3).map((member, index) => (
            <div key={index} className="member-item">
              <div className="member-avatar">
                {getInitials(member.name || 'U')}
              </div>
              {member.name}
            </div>
          ))}
          {task.assignedTo.length > 3 && (
            <div className="member-count">
              +{task.assignedTo.length - 3} more
            </div>
          )}
        </div>
      );
    }

    // If assignedTo is an array of strings (names)
    return (
      <div className="members-list">
        {task.assignedTo.slice(0, 3).map((name, index) => (
          <div key={index} className="member-item">
            <div className="member-avatar">
              {getInitials(name || 'U')}
            </div>
            {name}
          </div>
        ))}
        {task.assignedTo.length > 3 && (
          <div className="member-count">
            +{task.assignedTo.length - 3} more
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="task-card" onClick={handleCardClick}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`status ${task.status.toLowerCase().replace(" ", "-")}`}>
          {task.status}
        </span>
      </div>

      <p className="task-desc">{task.description}</p>

      <div className="task-info">
        <span className={`priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <span className="due-date">
          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
        </span>
      </div>

      {/* Assigned Members Section */}
      <div className="assigned-members">
        <div className="assigned-label">Assigned to</div>
        {renderAssignedMembers()}
      </div>

      {/* Progress Bar (if applicable) */}
      {(task.completedTodoCount !== undefined && task.totalChecklistCount !== undefined) && (
        <div className="progress-container">
          <div className="progress-label">
            <span>Checklist Progress</span>
            <span>{task.completedTodoCount}/{task.totalChecklistCount}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${task.totalChecklistCount > 0 
                  ? (task.completedTodoCount / task.totalChecklistCount) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      <button 
        className="checklist-toggle" 
        onClick={handleChecklistToggle}
      >
        {isChecklistOpen ? "Hide Checklist" : "View Checklist"}
      </button>

      {isChecklistOpen && children}
    </div>
  );
};

export default TaskCard;
// src/components/Cards/UserCard.jsx
import React from "react";
import "../../CSS/TaskManagerCSS/UserCard.css";

const UserCard = ({ userInfo }) => {
    const {
        name,
        email,
        profileImageUrl,
        pendingTasks = 0,
        inProgressTasks = 0,
        completedTasks = 0,
        totalTasks = 0,
        tasks = []
    } = userInfo;

    const completionPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

    const getStatusBadgeClass = (status) => {
        if (!status) return 'status-badge unknown';
        switch (status.toLowerCase()) {
            case 'pending': return 'status-badge pending';
            case 'in progress': 
            case 'in-progress': 
                return 'status-badge in-progress';
            case 'completed': return 'status-badge completed';
            default: return 'status-badge unknown';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <div className="user-card">
            <div className="user-card-header">
                <div className="user-avatar">
                    {profileImageUrl ? (
                        <img src={profileImageUrl} alt={name} className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder">
                            {name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
                <div className="user-info">
                    <h3 className="user-name">{name || 'Unknown User'}</h3>
                    <p className="user-email">{email || 'No email'}</p>
                </div>
            </div>

            <div className="tasks-section">
                <div className="tasks-header">
                    <h4>Task Overview</h4>
                    <span className="total-tasks">{totalTasks} tasks</span>
                </div>

                {totalTasks > 0 ? (
                    <>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${completionPercentage}%` }}
                            >
                                <span className="progress-text">{completionPercentage}%</span>
                            </div>
                        </div>

                        <div className="task-stats">
                            <div className="task-stat">
                                <span className="stat-indicator pending"></span>
                                <div className="stat-info">
                                    <span className="stat-count">{pendingTasks}</span>
                                    <span className="stat-label">Pending</span>
                                </div>
                            </div>
                            <div className="task-stat">
                                <span className="stat-indicator in-progress"></span>
                                <div className="stat-info">
                                    <span className="stat-count">{inProgressTasks}</span>
                                    <span className="stat-label">In Progress</span>
                                </div>
                            </div>
                            <div className="task-stat">
                                <span className="stat-indicator completed"></span>
                                <div className="stat-info">
                                    <span className="stat-count">{completedTasks}</span>
                                    <span className="stat-label">Completed</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="no-tasks">
                        <p>No tasks assigned yet</p>
                    </div>
                )}
            </div>

            {tasks && tasks.length > 0 ? (
                <div className="assigned-tasks-section">
                    <h4 className="assigned-tasks-title">Recent Tasks</h4>
                    <div className="assigned-tasks-list">
                        {tasks.slice(0, 5).map((task) => (
                            <div key={task._id || Math.random()} className="assigned-task-item">
                                <div className="task-main">
                                    <span className="task-title-text">
                                        {task.title || 'Untitled Task'}
                                    </span>
                                    <span className={getStatusBadgeClass(task.status)}>
                                        {task.status || 'No Status'}
                                    </span>
                                </div>
                                {task.dueDate && (
                                    <div className="task-due-date-text">
                                        Due: {formatDate(task.dueDate)}
                                    </div>
                                )}
                                {task.priority && (
                                    <div className="task-priority-text">
                                        Priority: {task.priority}
                                    </div>
                                )}
                            </div>
                        ))}
                        {tasks.length > 5 && (
                            <div className="more-tasks-indicator">
                                +{tasks.length - 5} more tasks
                            </div>
                        )}
                    </div>
                </div>
            ) : totalTasks > 0 ? (
                <div className="no-tasks-detailed">
                    <p>Task details not available</p>
                </div>
            ) : null}

            <div className="user-card-footer">
                <span className="user-role">{userInfo.role || 'Team Member'}</span>
                <span className="user-id">ID: {userInfo._id?.substring(0, 8)}...</span>
            </div>
        </div>
    );
};

// Make sure this export is at the end
export default UserCard;
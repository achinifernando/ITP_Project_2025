import React, { useState } from "react";
import "../../CSS/AttendanceCSS/UserCard.css";

const UserCard = ({ userInfo }) => {
    const {
        name,
        email,
        profileImageUrl,
        pendingTasks = 0,
        inProgressTasks = 0,
        completedTasks = 0,
        totalTasks = 0,
        tasks = [] // Actual task data from backend
    } = userInfo;

    const [showTaskModal, setShowTaskModal] = useState(false);

    // Calculate completion percentage
    const completionPercentage = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'status-badge pending';
            case 'in progress': return 'status-badge in-progress';
            case 'completed': return 'status-badge completed';
            default: return 'status-badge';
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
        <>
            <div className="user-card">
                <div className="user-card-header">
                    <div className="user-avatar">
                        {profileImageUrl ? (
                            <img src={profileImageUrl} alt={name} />
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
                        <h4>Assigned Tasks</h4>
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

                <div className="user-card-footer">
                    <span className="user-role">Team Member</span>
                    <button 
                        className="view-details-btn"
                        onClick={() => setShowTaskModal(true)}
                        disabled={totalTasks === 0}
                    >
                        View Details
                    </button>
                </div>
            </div>

            {/* Task Details Modal */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{name}'s Tasks</h2>
                            <button 
                                className="modal-close-btn"
                                onClick={() => setShowTaskModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="tasks-summary">
                                <div className="summary-item">
                                    <span className="summary-count">{totalTasks}</span>
                                    <span className="summary-label">Total Tasks</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-count">{pendingTasks}</span>
                                    <span className="summary-label">Pending</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-count">{inProgressTasks}</span>
                                    <span className="summary-label">In Progress</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-count">{completedTasks}</span>
                                    <span className="summary-label">Completed</span>
                                </div>
                            </div>

                            <div className="tasks-list">
                                <h3>Assigned Tasks</h3>
                                {tasks && tasks.length > 0 ? (
                                    <div className="tasks-container">
                                        {tasks.map((task) => (
                                            <div key={task._id} className="task-item">
                                                <div className="task-main">
                                                    <h4 className="task-title">{task.title || 'Untitled Task'}</h4>
                                                    <span className={getStatusBadgeClass(task.status)}>
                                                        {task.status || 'Unknown Status'}
                                                    </span>
                                                </div>
                                                {task.dueDate && (
                                                    <div className="task-due-date">
                                                        Due: {formatDate(task.dueDate)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-tasks-modal">
                                        <p>No tasks assigned to this user.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowTaskModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserCard;
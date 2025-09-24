import React, { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/SelectUsers.css";
import "../../CSS/TaskManagerCSS/SideMenu.css";

const SelectUsers = ({ selectedUsers, setSelectedUsers }) => {
    const [allUsers, setAllUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempSelectedUsers, setTempSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const getAllUsersWithTaskCount = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            getAllUsersWithTaskCount();
        }
    }, [isModalOpen, getAllUsersWithTaskCount]);

    // Filter users with less than 3 tasks this week
    const filteredUsers = useMemo(() => {
        return allUsers.filter(user => {
            const totalTasks = user.totalTasks || 0;
            return totalTasks < 3 && user.role === "member";
        });
    }, [allUsers]);

    // Filter users based on search term
    const filteredUsersBySearch = useMemo(() => {
        return filteredUsers.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [filteredUsers, searchTerm]);

    const toggleUserSelection = (userId) => {
        setTempSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = () => {
        setSelectedUsers(tempSelectedUsers);
        setIsModalOpen(false);
        setSearchTerm("");
    };

    const handleCancel = () => {
        setTempSelectedUsers(selectedUsers);
        setIsModalOpen(false);
        setSearchTerm("");
    };

    const handleOpenModal = () => {
        setTempSelectedUsers(selectedUsers);
        setIsModalOpen(true);
    };

    // Calculate average workload for selected users
    const averageWorkload = useMemo(() => {
        if (tempSelectedUsers.length === 0) return 0;
        
        const totalTasks = tempSelectedUsers.reduce((sum, userId) => {
            const user = allUsers.find(u => u._id === userId);
            return sum + (user?.totalTasks || 0);
        }, 0);
        
        return Math.round(totalTasks / tempSelectedUsers.length);
    }, [tempSelectedUsers, allUsers]);

    return (
        <div className="select-users-container">
            {/* Selected Users Display */}
            <div className="selected-users-display">
                {selectedUsers.length > 0 ? (
                    <div className="selected-users-list">
                        <span className="selected-count">
                            {selectedUsers.length} user(s) selected
                        </span>
                        <button 
                            type="button" 
                            onClick={handleOpenModal}
                            className="edit-users-btn"
                        >
                            Edit
                        </button>
                    </div>
                ) : (
                    <button 
                        type="button" 
                        onClick={handleOpenModal}
                        className="select-users-btn"
                    >
                        + Add Members
                    </button>
                )}
            </div>

            {/* Add Members Modal/Card */}
            {isModalOpen && (
                <div className="select-users-modal-overlay">
                    <div className="select-users-members-card">
                        <div className="select-users-card-header">
                            <h3>Assign Team Members</h3>
                            <span className="workload-info">
                                Showing members with less than 3 tasks this week
                            </span>
                            <button 
                                className="select-users-close-btn"
                                onClick={handleCancel}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="select-users-card-body">
                            <div className="select-users-search-section">
                                <input
                                    type="text"
                                    placeholder="Search members..."
                                    className="select-users-search-input"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="select-users-list-section">
                                <h4>Available Team Members ({filteredUsersBySearch.length})</h4>
                                
                                {isLoading ? (
                                    <div className="loading-state">
                                        <div className="loading-spinner"></div>
                                        <p>Loading available members...</p>
                                    </div>
                                ) : filteredUsersBySearch.length > 0 ? (
                                    <div className="select-users-list">
                                        {filteredUsersBySearch.map((user) => (
                                            <div key={user._id} className="select-users-user-item">
                                                <label className="select-users-user-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={tempSelectedUsers.includes(user._id)}
                                                        onChange={() => toggleUserSelection(user._id)}
                                                        disabled={user.totalTasks >= 3}
                                                    />
                                                    <div className="select-users-user-info">
                                                        <div className="user-avatar-container">
                                                            {user.profileImageUrl ? (
                                                                <img 
                                                                    src={user.profileImageUrl} 
                                                                    alt={user.name}
                                                                    className="select-users-user-avatar"
                                                                />
                                                            ) : (
                                                                <div className="avatar-placeholder">
                                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="select-users-user-details">
                                                            <span className="select-users-user-name">
                                                                {user.name}
                                                                {user.totalTasks >= 3 && (
                                                                    <span className="workload-warning"> (Fully allocated)</span>
                                                                )}
                                                            </span>
                                                            <span className="select-users-user-email">{user.email}</span>
                                                            <div className="user-workload-info">
                                                                <span className="task-count">
                                                                    {user.totalTasks || 0} task(s) this week
                                                                </span>
                                                                <div className="workload-meter">
                                                                    <div 
                                                                        className="workload-fill"
                                                                        style={{ 
                                                                            width: `${Math.min((user.totalTasks || 0) * 33, 100)}%`,
                                                                            backgroundColor: user.totalTasks >= 3 ? '#dc3545' : 
                                                                                           user.totalTasks >= 2 ? '#ffc107' : '#28a745'
                                                                        }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-users-available">
                                        <p>No team members available with low workload.</p>
                                        <p className="hint">All members have 3 or more tasks this week.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="select-users-card-footer">
                            <div className="select-users-selected-info">
                                <div className="select-users-selected-count">
                                    {tempSelectedUsers.length} user(s) selected
                                </div>
                                {tempSelectedUsers.length > 0 && (
                                    <div className="workload-summary">
                                        Average workload: {averageWorkload} tasks per user
                                    </div>
                                )}
                            </div>
                            <div className="select-users-card-actions">
                                <button onClick={handleCancel} className="select-users-cancel-btn">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    className="select-users-save-btn"
                                    disabled={tempSelectedUsers.length === 0}
                                >
                                    Assign Members
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectUsers;
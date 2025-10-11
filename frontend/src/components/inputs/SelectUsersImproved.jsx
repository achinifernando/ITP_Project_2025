import React, { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/SelectUsersImproved.css";

const SelectUsersImproved = ({ selectedUsers, setSelectedUsers }) => {
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

    // Get selected user details
    const selectedUserDetails = useMemo(() => {
        return selectedUsers.map(userId => allUsers.find(u => u._id === userId)).filter(Boolean);
    }, [selectedUsers, allUsers]);

    return (
        <div className="select-users-improved-container">
            {/* Selected Users Display */}
            <div className="selected-users-display-improved">
                {selectedUsers.length > 0 ? (
                    <div className="selected-users-chips">
                        {selectedUserDetails.map((user) => (
                            <div key={user._id} className="user-chip">
                                {user.profileImageUrl ? (
                                    <img src={user.profileImageUrl} alt={user.name} className="chip-avatar" />
                                ) : (
                                    <div className="chip-avatar-placeholder">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                                <span className="chip-name">{user.name}</span>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={handleOpenModal}
                            className="edit-users-btn-improved"
                        >
                            ✏️ Edit
                        </button>
                    </div>
                ) : (
                    <button 
                        type="button" 
                        onClick={handleOpenModal}
                        className="select-users-btn-improved"
                    >
                        <span className="btn-icon">👥</span>
                        <span>Add Team Members</span>
                    </button>
                )}
            </div>

            {/* Improved Modal */}
            {isModalOpen && (
                <div className="modal-overlay-improved" onClick={handleCancel}>
                    <div className="modal-card-improved" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="modal-header-improved">
                            <div className="header-content-improved">
                                <h3>👥 Assign Team Members</h3>
                                <p className="header-subtitle">Select members with available capacity</p>
                            </div>
                            <button 
                                className="close-btn-improved"
                                onClick={handleCancel}
                                aria-label="Close"
                                title="Close (Esc)"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Body */}
                        <div className="modal-body-improved">
                            {/* Search */}
                            <div className="search-section-improved">
                                <div className="search-wrapper-improved">
                                    <span className="search-icon-improved">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        className="search-input-improved"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button 
                                            className="clear-search-btn-improved"
                                            onClick={() => setSearchTerm("")}
                                            title="Clear"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selected Preview */}
                            {tempSelectedUsers.length > 0 && (
                                <div className="selected-preview-improved">
                                    <div className="preview-header-improved">
                                        <span className="preview-title-improved">
                                            ✓ Selected ({tempSelectedUsers.length})
                                        </span>
                                        <button 
                                            className="clear-all-btn-improved"
                                            onClick={() => setTempSelectedUsers([])}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="selected-avatars-improved">
                                        {tempSelectedUsers.map(userId => {
                                            const user = allUsers.find(u => u._id === userId);
                                            return user ? (
                                                <div key={userId} className="selected-avatar-item-improved" title={user.name}>
                                                    {user.profileImageUrl ? (
                                                        <img src={user.profileImageUrl} alt={user.name} />
                                                    ) : (
                                                        <div className="avatar-placeholder-small-improved">
                                                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <button 
                                                        className="remove-avatar-btn-improved"
                                                        onClick={() => toggleUserSelection(userId)}
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="members-list-section-improved">
                                <div className="list-header-improved">
                                    <h4>Available Members</h4>
                                    <span className="member-count-badge-improved">
                                        {filteredUsersBySearch.length} found
                                    </span>
                                </div>
                                
                                {isLoading ? (
                                    <div className="loading-state-improved">
                                        <div className="spinner-improved"></div>
                                        <p>Loading team members...</p>
                                    </div>
                                ) : filteredUsersBySearch.length > 0 ? (
                                    <div className="members-grid-improved">
                                        {filteredUsersBySearch.map((user) => {
                                            const isSelected = tempSelectedUsers.includes(user._id);
                                            const isOverloaded = user.totalTasks >= 3;
                                            const workloadPercent = Math.min((user.totalTasks || 0) * 33.33, 100);
                                            
                                            return (
                                                <div 
                                                    key={user._id} 
                                                    className={`member-card-improved ${isSelected ? 'selected' : ''} ${isOverloaded ? 'disabled' : ''}`}
                                                    onClick={() => !isOverloaded && toggleUserSelection(user._id)}
                                                >
                                                    <div className="member-card-content-improved">
                                                        <div className="avatar-section-improved">
                                                            {user.profileImageUrl ? (
                                                                <img 
                                                                    src={user.profileImageUrl} 
                                                                    alt={user.name}
                                                                    className="member-avatar-improved"
                                                                />
                                                            ) : (
                                                                <div className="avatar-placeholder-improved">
                                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </div>
                                                            )}
                                                            {isSelected && (
                                                                <div className="selected-checkmark-improved">✓</div>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="member-info-improved">
                                                            <div className="name-row-improved">
                                                                <span className="member-name-improved">{user.name}</span>
                                                                {isOverloaded && (
                                                                    <span className="overload-badge-improved">⚠️</span>
                                                                )}
                                                            </div>
                                                            <span className="member-email-improved">{user.email}</span>
                                                            
                                                            <div className="workload-section-improved">
                                                                <div className="workload-bar-improved">
                                                                    <div 
                                                                        className="workload-fill-improved"
                                                                        style={{ width: `${workloadPercent}%` }}
                                                                        data-level={
                                                                            user.totalTasks >= 3 ? 'high' : 
                                                                            user.totalTasks >= 2 ? 'medium' : 'low'
                                                                        }
                                                                    ></div>
                                                                </div>
                                                                <span className="task-count-improved">
                                                                    {user.totalTasks || 0}/3 tasks
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="empty-state-improved">
                                        <div className="empty-icon-improved">🔍</div>
                                        <p className="empty-title-improved">
                                            {searchTerm ? 'No members found' : 'No available members'}
                                        </p>
                                        <p className="empty-hint-improved">
                                            {searchTerm 
                                                ? 'Try different search terms' 
                                                : 'All members are at full capacity'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer-improved">
                            <div className="footer-info-improved">
                                <div className="info-item-improved">
                                    <span className="info-icon-improved">👤</span>
                                    <span><strong>{tempSelectedUsers.length}</strong> selected</span>
                                </div>
                                {tempSelectedUsers.length > 0 && (
                                    <div className="info-item-improved">
                                        <span className="info-icon-improved">📊</span>
                                        <span>Avg: <strong>{averageWorkload}</strong> tasks</span>
                                    </div>
                                )}
                            </div>
                            <div className="footer-actions-improved">
                                <button onClick={handleCancel} className="cancel-btn-improved">
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave} 
                                    className="save-btn-improved"
                                    disabled={tempSelectedUsers.length === 0}
                                >
                                    {tempSelectedUsers.length === 0 
                                        ? 'Select Members' 
                                        : `Assign ${tempSelectedUsers.length} Member${tempSelectedUsers.length !== 1 ? 's' : ''}`
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectUsersImproved;

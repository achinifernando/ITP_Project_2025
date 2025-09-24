import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import UserCard from "../../Cards/UserCard";
import "../../../CSS/TaskManagerCSS/ManageUsers.css";
import toast from "react-hot-toast";

const ManageUsers = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getMembersWithTasks = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            
            if (response.data?.length > 0) {
                // Filter to get only members
                const memberUsers = response.data.filter(user => user.role === "member");
                
                setMembers(memberUsers);
            } else {
                setMembers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load team members");
        } finally {
            setIsLoading(false);
        }
    };

    // Download task report for members only
    const handleDownloadReport = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'team-members-report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error downloading report:", error);
            toast.error("Failed to download team members report. Please try again.");
        }
    };

    useEffect(() => {
        getMembersWithTasks();
    }, []);

    return (
        <DashboardLayout activeMenu="Team Members">
            <div className="manage-users-container">
                <div className="manage-users-header">
                    <h2 className="manage-users-title">Team Members</h2>
                    <div className="header-actions">
                        <span className="members-count">
                            {members.length} {members.length === 1 ? 'Member' : 'Members'}
                        </span>
                        <button className="download-report-btn" onClick={handleDownloadReport}>
                            Download Report
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading team members...</p>
                    </div>
                ) : members.length > 0 ? (
                    <div className="users-grid">
                        {members.map((user) => (
                            <UserCard key={user._id} userInfo={user} />
                        ))}
                    </div>
                ) : (
                    <div className="no-members-container">
                        <div className="no-members-content">
                            <div className="no-members-icon">👥</div>
                            <h3>No Team Members Found</h3>
                            <p>There are currently no team members in the system.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ManageUsers;
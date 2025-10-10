// pages/TaskManagerPages/TeamMembers.jsx
import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import UserTaskCard from "../../components/Cards/UserTaskCard";
import "../../CSS/TaskManagerCSS/TeamMembers.css";

const TeamMembers = () => {
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

  const getTeamMembersWithTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_TEAM_MEMBERS_WITH_TASKS);

      console.log("Team members API response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setTeamMembersData(response.data);
      } else {
        setTeamMembersData([]);
      }
    } catch (error) {
      console.error("Error fetching team members with tasks:", error);
      setError("Failed to load team members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTeamMembersWithTasks();
  }, [getTeamMembersWithTasks]);

  const handleTaskClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  const filteredMembers = teamMembersData.filter(memberData => {
    const { user, tasks } = memberData;

    // Search filter
    const matchesSearch = searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    if (statusFilter === "All") {
      return matchesSearch;
    }

    const hasStatusTasks = tasks.some(task => {
      if (statusFilter === "Has Tasks") {
        return true;
      }
      return task.status === statusFilter;
    });

    return matchesSearch && hasStatusTasks;
  });

  const getTotalStats = () => {
    const totalTasks = teamMembersData.reduce((sum, member) => sum + member.tasks.length, 0);
    const pendingTasks = teamMembersData.reduce((sum, member) =>
      sum + member.tasks.filter(task => task.status === 'Pending').length, 0);
    const inProgressTasks = teamMembersData.reduce((sum, member) =>
      sum + member.tasks.filter(task => task.status === 'In Progress').length, 0);
    const completedTasks = teamMembersData.reduce((sum, member) =>
      sum + member.tasks.filter(task => task.status === 'Completed').length, 0);

    return { totalTasks, pendingTasks, inProgressTasks, completedTasks };
  };

  const stats = getTotalStats();

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="team-members-container">
        <div className="team-members-header">
          <h2 className="team-members-title">Team Members</h2>

          <div className="header-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Members</option>
                <option value="Has Tasks">Members with Tasks</option>
                <option value="Pending">Members with Pending Tasks</option>
                <option value="In Progress">Members with In Progress Tasks</option>
                <option value="Completed">Members with Completed Tasks</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="team-stats">
          <div className="stat-card">
            <span className="stat-label">Total Tasks</span>
            <span className="stat-value">{stats.totalTasks}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Pending</span>
            <span className="stat-value pending">{stats.pendingTasks}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">In Progress</span>
            <span className="stat-value in-progress">{stats.inProgressTasks}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completed</span>
            <span className="stat-value completed">{stats.completedTasks}</span>
          </div>
        </div>

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={getTeamMembersWithTasks}>Retry</button>
          </div>
        )}

        {!error && (
          <>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading team members...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="empty-state">
                <p>No team members found</p>
                {searchTerm || statusFilter !== "All" ? (
                  <p>Try adjusting your search or filter criteria.</p>
                ) : (
                  <button onClick={getTeamMembersWithTasks}>Refresh</button>
                )}
              </div>
            ) : (
              <div className="team-members-grid">
                {filteredMembers.map((memberData) => (
                  <UserTaskCard
                    key={memberData.user._id}
                    userData={memberData}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamMembers;

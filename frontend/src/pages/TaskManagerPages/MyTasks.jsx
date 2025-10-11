import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/ManageTasks.css";
import TaskCard from "../../components/Cards/TaskCard";
import SelectChecklist from "../../components/inputs/SelectCheckList";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [openChecklistTaskId, setOpenChecklistTaskId] = useState(null);
  const navigate = useNavigate();

  // ✅ Memoized fetch function
  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);

      console.log("Current user context:", {
        userId: localStorage.getItem('userId'),
        token: localStorage.getItem('token') ? 'Token exists' : 'No token',
        userRole: localStorage.getItem('userRole')
      });

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);

      console.log("My Tasks API Response:", response.data);
      console.log("Response status:", response.status);
      console.log("Response data type:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));
      console.log("Response data length:", response.data?.length);

      // Backend returns array of tasks directly
      const tasks = Array.isArray(response.data) ? response.data : [];
      console.log("Processed tasks:", tasks);
      console.log("Tasks length:", tasks.length);

      setAllTasks(tasks);

      // Calculate status counts from the tasks
      const allCount = tasks.length;
      const pendingCount = tasks.filter(t => t.status === "Pending").length;
      const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
      const completedCount = tasks.filter(t => t.status === "Completed").length;

      const statusArray = [
        { label: "All", count: allCount },
        { label: "Pending", count: pendingCount },
        { label: "In Progress", count: inProgressCount },
        { label: "Completed", count: completedCount },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClick = (taskData) => {
    navigate(`/user/task-details`, { state: { taskId: taskData._id } });
  };

  const refreshTasks = () => {
    getAllTasks();
  };

  // ✅ useEffect depends on getAllTasks (not filterStatus directly)
  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  const toggleChecklist = (taskId) => {
    setOpenChecklistTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // Filter tasks based on selected status
  const filteredTasks = filterStatus === "All" 
    ? allTasks 
    : allTasks.filter(task => task.status === filterStatus);

  return (
    <DashboardLayout activeMenu="My Tasks" hideNavbar={true}>
      <div className="manage-tasks-container">
        <div className="tasks-header">
          <h2 className="tasks-title">My Tasks</h2>

          {tabs?.[0]?.count > 0 && (
            <div className="header-controls">
              <div className="status-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    className={`status-tab ${filterStatus === tab.label ? "active" : ""}`}
                    onClick={() => setFilterStatus(tab.label)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => handleClick(task)}
                onToggleChecklist={() => toggleChecklist(task._id)}
                isChecklistOpen={openChecklistTaskId === task._id}
                refreshTasks={refreshTasks}
              >
                {openChecklistTaskId === task._id && (
                  <SelectChecklist
                    task={task}
                    refreshTasks={refreshTasks}
                  />
                )}
              </TaskCard>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Tasks Found</h3>
            <p>
              {filterStatus === "All" 
                ? "You don't have any tasks assigned yet." 
                : `You don't have any ${filterStatus.toLowerCase()} tasks.`}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

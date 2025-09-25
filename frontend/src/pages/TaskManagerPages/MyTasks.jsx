import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/TaskCard.css";
import TaskCard from "../../components/Cards/TaskCard";

const MyTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  // ✅ Memoized fetch function
  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: filterStatus === "All" ? "" : filterStatus },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgress || 0 },
        { label: "Completed", count: statusSummary.completed || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  // ✅ useEffect depends on getAllTasks (not filterStatus directly)
  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  return (
    <DashboardLayout activeMenu="My Tasks">
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

        <div className="tasks-grid">
          {allTasks?.map((item) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo?.map((assignee) => assignee.profileImageUrl)}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => handleClick(item._id)}
            />
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tasks...</p>
          </div>
        ) : allTasks.length > 0 ? (
          <ul className="tasks-list">
            {allTasks.map((task) => (
              <li
                key={task._id}
                className={`task-item task-item-${task.status.toLowerCase().replace(" ", "-")}`}
                onClick={() => handleClick(task._id)}
              >
                <div className="task-title">{task.title}</div>
                <span
                  className={`task-status status-${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>No tasks available</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;

import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS, deleteTask } from "../../utils/apiPaths";
import "../../CSS/TaskManagerCSS/ManageTasks.css";
import TaskCard from "../../components/Cards/TaskCard";
import SelectChecklist from "../../components/inputs/SelectCheckList";
import Modal from "../../components/Modal";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [openChecklistTaskId, setOpenChecklistTaskId] = useState(null);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const getAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: { status: filterStatus === "All" ? "" : filterStatus },
      });

      console.log("API Response:", response.data); // Debugging

      // Handle different response structures
      let tasks = [];
      let statusSummary = {};
      
      if (response.data && Array.isArray(response.data)) {
        // If response is directly an array of tasks
        tasks = response.data;
        statusSummary = {
          all: tasks.length,
          pendingTasks: tasks.filter(task => task.status === "Pending").length,
          inProgress: tasks.filter(task => task.status === "In Progress").length,
          completed: tasks.filter(task => task.status === "Completed").length,
        };
      } else if (response.data && response.data.tasks) {
        // If response has a tasks property
        tasks = response.data.tasks || [];
        statusSummary = response.data.statusSummary || {};
      } else if (response.data) {
        // If response.data exists but doesn't match expected structure
        tasks = response.data;
        statusSummary = {
          all: tasks.length,
          pendingTasks: tasks.filter(task => task.status === "Pending").length,
          inProgress: tasks.filter(task => task.status === "In Progress").length,
          completed: tasks.filter(task => task.status === "Completed").length,
        };
      }

      setAllTasks(tasks);

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0 },
        { label: "In Progress", count: statusSummary.inProgress || 0 },
        { label: "Completed", count: statusSummary.completed || 0 },
      ];

      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
  };

  const handleEdit = (task) => {
    navigate(`/admin/create-task`, { state: { taskId: task._id } });
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteTask(taskToDelete._id);
      setDeleteModalOpen(false);
      setTaskToDelete(null);
      await getAllTasks();
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task-details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  const refreshTasks = () => {
    getAllTasks();
  };

  useEffect(() => {
    getAllTasks();
  }, [getAllTasks]);

  const toggleChecklist = (taskId) => {
    setOpenChecklistTaskId((prev) => (prev === taskId ? null : taskId));
  };

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="manage-tasks-container">
        <div className="tasks-header">
          <h2 className="tasks-title">My Tasks</h2>

          {tabs.length > 0 && tabs[0].count > 0 && (
            <div className="header-controls">
              <div className="status-tabs-container">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    className={`status-tab ${
                      filterStatus === tab.label ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus(tab.label)}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              <button className="download-btn" onClick={handleDownloadReport}>
                Download Report
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={getAllTasks}>Retry</button>
          </div>
        )}

        {!error && (
          <>
            <div className="tasks-grid">
              {allTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onClick={() => handleClick(task)}
                  onToggleChecklist={() => toggleChecklist(task._id)}
                  isChecklistOpen={openChecklistTaskId === task._id}
                  refreshTasks={refreshTasks}
                  showActions={true}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
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

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
              </div>
            ) : allTasks.length === 0 ? (
              <div className="empty-state">
                <p>No tasks available</p>
                <button onClick={() => navigate("/admin/create-task")}>
                  Create Your First Task
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        title="Delete Task"
        onClose={handleDeleteCancel}
        onSubmit={handleDeleteConfirm}
        submitLabel={isDeleting ? "Deleting..." : "Delete"}
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this task?</p>
          {taskToDelete && (
            <div className="task-info">
              <strong>{taskToDelete.title}</strong>
              {taskToDelete.orderID && <p>Order #: {taskToDelete.orderID}</p>}
            </div>
          )}
          <p className="warning-text">This action cannot be undone.</p>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ManageTasks;
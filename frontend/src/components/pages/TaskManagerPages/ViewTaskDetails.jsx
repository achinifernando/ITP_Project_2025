import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const ViewTaskDetails = () => {
  const { taskId } = useParams();
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Memoized fetch function
  const getTaskDetailsByID = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.TASKS.GET_TASK_BY_ID}/${id}`);
      setTaskDetails(response.data.task);
    } catch (error) {
      console.error("Error fetching task details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ useEffect depends on both getTaskDetailsByID and taskId
  useEffect(() => {
    if (taskId) {
      getTaskDetailsByID(taskId);
    }
  }, [getTaskDetailsByID, taskId]);

  return (
    <DashboardLayout activeMenu="Task Details">
      <div className="task-details-container">
        {loading ? (
          <p>Loading task details...</p>
        ) : taskDetails ? (
          <>
            <h2>{taskDetails.title}</h2>
            <p>{taskDetails.description}</p>
            <p>Status: {taskDetails.status}</p>
            <p>Priority: {taskDetails.priority}</p>
          </>
        ) : (
          <p>No task details found.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

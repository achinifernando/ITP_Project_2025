import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "../../CSS/DispatchCSS/AssignmentsTable.css";

const BACKEND_URL = "http://localhost:5000";

export default function AssignmentsTable() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`${BACKEND_URL}/assignments`);
      setAssignments(data);
      setError("");
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;
    
    try {
      await axiosInstance.delete(`${BACKEND_URL}/assignments/remove/${deliveryId}`);
      // Refresh the assignments list
      fetchAssignments();
      alert("Assignment removed successfully!");
    } catch (err) {
      console.error("Error removing assignment:", err);
      alert(err.response?.data?.message || "Error removing assignment");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      await axiosInstance.delete(`${BACKEND_URL}/assignments/${assignmentId}`);
      // Refresh the assignments list
      fetchAssignments();
      alert("Assignment deleted successfully!");
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert(err.response?.data?.message || "Error deleting assignment");
    }
  };

  if (loading) return <div className="loading">Loading assignments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="assignments-table-container">
      <h2>Delivery Assignments</h2>
      
      <table className="assignments-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Assigned At</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment._id} className={`status-${assignment.status.toLowerCase()}`}>
              <td>#{assignment.delivery?.orderId}</td>
              <td>{assignment.delivery?.customerName}</td>
              <td>{assignment.delivery?.address || assignment.delivery?.deliveryAddress}</td>
              <td>{assignment.driver?.name}</td>
              <td>{assignment.vehicle?.vehicleNumber} ({assignment.vehicle?.type})</td>
              <td>{new Date(assignment.assignedAt).toLocaleString()}</td>
              <td>
                <span className={`status status-${assignment.status.toLowerCase()}`}>
                  {assignment.status}
                </span>
              </td>
              <td>
                <div className="action-buttons">
                  <button 
                    onClick={() => handleRemoveAssignment(assignment.delivery?._id)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                  <button 
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {assignments.length === 0 && (
        <div className="no-assignments">No assignments found</div>
      )}
    </div>
  );
}
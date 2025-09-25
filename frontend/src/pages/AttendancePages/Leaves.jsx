import React, { useEffect, useState, useCallback } from "react";
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import "../../CSS/AttendanceCSS/Leave.css";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    employeeId: "",
    leaveType: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // ✅ Fetch all leaves
const getAllLeaves = useCallback(async () => {
  try {
    setIsLoading(true);
    console.log("📥 Fetching leaves from API...");

    const response = await axiosInstance.get(API_PATHS.LEAVES.GET_ALL_LEAVES);
    const data = response.data;

    const leavesData =
      data?.leaves || data?.data || (Array.isArray(data) ? data : []);

    if (!leavesData.length) {
      console.warn("⚠️ Unexpected API response structure:", data);
    }

    console.log("✅ Processed leaves data:", leavesData);
    setLeaves(leavesData);
  } catch (error) {
    console.error("❌ Error fetching leaves:", error);
    console.error("🔍 Error details:", error.response?.data);
    setLeaves([]);
    setSuccessMessage("Error loading leaves. Please check console for details.");
  } finally {
    setIsLoading(false);
  }
}, []);

// ✅ Fetch all employees
const getEmployees = useCallback(async () => {
  try {
    console.log("📥 Fetching employees from API...");

    const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
    const data = response.data;

    const employeesData =
      data?.users || data?.data || (Array.isArray(data) ? data : []);

    if (!employeesData.length) {
      console.warn("⚠️ Unexpected employees API response structure:", data);
    }

    console.log("✅ Processed employees data:", employeesData);
    setEmployees(employeesData);
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    console.error("🔍 Error details:", error.response?.data);
    setEmployees([]);
  }
}, []);

useEffect(() => {
  getAllLeaves();
  getEmployees();
}, [getAllLeaves, getEmployees]);

// ✅ Get employee name by ID
const getEmployeeNameById = (employeeId) => {
  if (!employeeId) return "Unknown Employee";

  const employee = employees.find((emp) => {
    const id = typeof employeeId === "object" ? employeeId._id : employeeId;
    return emp._id === id || emp.id === id;
  });

  return employee?.name || employee?.username || "Unknown Employee";
};


  // ✅ Validate form
  const validateForm = () => {
    const errors = {};
    if (!newLeave.employeeId) errors.employeeId = "Employee is required";
    if (!newLeave.startDate) errors.startDate = "Start date is required";
    if (!newLeave.endDate) errors.endDate = "End date is required";
    if (
      newLeave.startDate &&
      newLeave.endDate &&
      new Date(newLeave.startDate) > new Date(newLeave.endDate)
    ) {
      errors.endDate = "End date must be after start date";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Add Leave
  const handleAddLeave = async () => {
    if (!validateForm()) return;
    try {
      const response = await axiosInstance.post(
        API_PATHS.LEAVES.CREATE_LEAVE,
        newLeave
      );

      if (response.data?.leave) {
        setSuccessMessage("Leave request added successfully!");
      } else {
        setSuccessMessage("Leave request submitted!");
      }

      setNewLeave({
        employeeId: "",
        leaveType: "Casual",
        startDate: "",
        endDate: "",
        reason: "",
      });
      setShowAddModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      getAllLeaves();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Error adding leave request. Please try again.";
      setSuccessMessage(errorMsg);
    }
  };

  // ✅ Approve / Reject Leave
  const handleStatusChange = async (id, status) => {
    try {
      const response = await axiosInstance.put(
        API_PATHS.LEAVES.UPDATE_LEAVE_STATUS(id),
        { status }
      );

      if (response.data?.message) {
        setSuccessMessage(response.data.message);
      } else {
        setSuccessMessage(`Leave ${status.toLowerCase()} successfully!`);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
      getAllLeaves();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Error updating leave status. Please try again.";
      setSuccessMessage(errorMsg);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate days between dates
  const calculateDays = (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end - start;
      return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    } catch (error) {
      return 0;
    }
  };

  return (
    <AttendanceDashboardLayout activeMenu="Leaves" requiredRole="hr_manager">
      <div className="leaves-container">
        <div className="page-header">
          <div className="header-title">
            <h1>Leave Management</h1>
            <p>Track and manage employee leave requests</p>
          </div>
          <div className="header-actions">
            <button
              className="add-employee-btn"
              onClick={() => setShowAddModal(true)}
            >
              <span className="btn-icon">+</span> New Leave Request
            </button>
          </div>
        </div>

        {successMessage && (
          <div
            className={`success-message ${
              successMessage.includes("Error") ? "error" : ""
            }`}
          >
            <span className="success-icon">
              {successMessage.includes("Error") ? "⚠️" : "✓"}
            </span>
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading leaves...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves && leaves.length > 0 ? (
                  leaves.map((leave) => {
                    console.log("Processing leave:", leave);
                    
                    // Extract employee ID with multiple fallbacks
                    const employeeId = leave.employeeId?._id || 
                                      leave.employeeId || 
                                      leave.employee?._id || 
                                      leave.userId ||
                                      leave.employee;

                    // Get employee name using the helper function
                    const employeeName = getEmployeeNameById(employeeId);
                    
                    const startDate = leave.startDate || leave.start;
                    const endDate = leave.endDate || leave.end;
                    const days = calculateDays(startDate, endDate);

                    return (
                      <tr key={leave._id || leave.id || Math.random()}>
                        <td>
                          <div className="employee-info">
                            <div className="avatar">
                              {employeeName.charAt(0).toUpperCase()}
                            </div>
                            <div className="name">
                              {employeeName}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`leave-type-badge leave-type-${(leave.leaveType || "unknown").toLowerCase()}`}>
                            {leave.leaveType || "N/A"}
                          </span>
                        </td>
                        <td>{formatDate(startDate)}</td>
                        <td>{formatDate(endDate)}</td>
                        <td>
                          {days} day{days !== 1 ? "s" : ""}
                        </td>
                        <td className="reason-cell">
                          {leave.reason || leave.description || "-"}
                        </td>
                        <td>
                          <span className={`status-badge status-${(leave.status || "pending").toLowerCase()}`}>
                            {leave.status || "Pending"}
                          </span>
                        </td>
                        <td>
                          {(!leave.status || leave.status === "Pending") && (
                            <div className="action-buttons">
                              <button
                                className="approve-btn"
                                onClick={() => handleStatusChange(leave._id || leave.id, "Approved")}
                              >
                                ✓ Approve
                              </button>
                              <button
                                className="reject-btn"
                                onClick={() => handleStatusChange(leave._id || leave.id, "Rejected")}
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {leave.status && leave.status !== "Pending" && (
                            <span className="no-actions">No actions available</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      <div className="no-data-content">
                        <div className="no-data-icon">📋</div>
                        <h3>No Leave Requests</h3>
                        <p>
                          {leaves === null ? "Loading..." : "No leave requests found in the database."}
                        </p>
                        <button onClick={getAllLeaves} className="retry-btn">
                          Retry Loading
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Leave Modal */}
        {showAddModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>New Leave Request</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Employee *</label>
                  <select
                    value={newLeave.employeeId}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, employeeId: e.target.value })
                    }
                    className={formErrors.employeeId ? "error" : ""}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.name || emp.username} ({emp.email || "No email"})
                      </option>
                    ))}
                  </select>
                  {formErrors.employeeId && (
                    <span className="error-text">{formErrors.employeeId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Leave Type</label>
                  <select
                    value={newLeave.leaveType}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, leaveType: e.target.value })
                    }
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Annual">Annual Leave</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>From Date *</label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, startDate: e.target.value })
                      }
                      className={formErrors.startDate ? "error" : ""}
                      min={new Date().toISOString().split("T")[0]}
                    />
                    {formErrors.startDate && (
                      <span className="error-text">{formErrors.startDate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>To Date *</label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, endDate: e.target.value })
                      }
                      className={formErrors.endDate ? "error" : ""}
                      min={
                        newLeave.startDate ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                    {formErrors.endDate && (
                      <span className="error-text">{formErrors.endDate}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason (Optional)</label>
                  <textarea
                    placeholder="Enter reason for leave"
                    value={newLeave.reason}
                    onChange={(e) =>
                      setNewLeave({ ...newLeave, reason: e.target.value })
                    }
                    rows="3"
                  />
                </div>

                {newLeave.startDate && newLeave.endDate && (
                  <div className="leave-summary">
                    <h4>Leave Summary</h4>
                    <p>
                      Duration:{" "}
                      {calculateDays(newLeave.startDate, newLeave.endDate)} day
                      {calculateDays(newLeave.startDate, newLeave.endDate) !== 1
                        ? "s"
                        : ""}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleAddLeave}>
                  Submit Leave Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AttendanceDashboardLayout>
  );
}

export default Leaves;
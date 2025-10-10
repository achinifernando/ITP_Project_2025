import React, { useEffect, useState, useCallback } from "react";
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import "../../CSS/AttendanceCSS/tables.css";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    password: "",
    role: "member",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const getAllUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch regular employees
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      setEmployees(response.data?.length ? response.data : []);
      
      // Fetch drivers
      try {
        const driversResponse = await axiosInstance.get('/drivers');
        setDrivers(driversResponse.data?.length ? driversResponse.data : []);
      } catch (driverError) {
        console.error("Error fetching drivers:", driverError);
        setDrivers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  // Function to generate a random password
  const generateRandomPassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Handle generate password button click
  const handleGeneratePassword = () => {
    const randomPassword = generateRandomPassword();
    setNewUser({ ...newUser, password: randomPassword });
    // Clear password error if it exists
    if (formErrors.password) {
      setFormErrors({ ...formErrors, password: "" });
    }
  };

  const validateForm = (userData, isEdit = false) => {
    const errors = {};
    if (!userData.name.trim()) errors.name = "Name is required";
    if (!userData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(userData.email))
      errors.email = "Email is invalid";
    
    if (!userData.contactNumber.trim()) errors.contactNumber = "Contact number is required";
    if (!userData.address.trim()) errors.address = "Address is required";
    
    // Only validate password for new users, not when editing
    if (!isEdit) {
      if (!userData.password) errors.password = "Password is required";
      else if (userData.password.length < 6)
        errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm(newUser)) return;

    try {
      await axiosInstance.post(API_PATHS.USERS.CREATE_USER, newUser);
      setNewUser({ 
        name: "", 
        email: "", 
        contactNumber: "", 
        address: "", 
        password: "", 
        role: "member" 
      });
      setShowAddModal(false);
      setSuccessMessage(`Employee added successfully! Login credentials have been sent to ${newUser.email}`);

      setTimeout(() => setSuccessMessage(""), 5000);
      getAllUsers();
    } catch (err) {
      console.error("Error adding user:", err);
      const errorMessage = err.response?.data?.message || err.message || "Error adding employee. Please try again.";
      setSuccessMessage(`Error: ${errorMessage}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  };

  const handleEditUser = async () => {
    if (!currentUser || !validateForm(currentUser, true)) return;

    try {
      await axiosInstance.put(API_PATHS.USERS.UPDATE_USER(currentUser._id), {
        name: currentUser.name,
        email: currentUser.email,
        contactNumber: currentUser.contactNumber,
        address: currentUser.address,
        role: currentUser.role
      });
      setShowEditModal(false);
      setCurrentUser(null);
      setSuccessMessage("Employee updated successfully!");

      setTimeout(() => setSuccessMessage(""), 3000);
      getAllUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      setSuccessMessage("Error updating employee. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(id));
      setSuccessMessage("Employee deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      getAllUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setSuccessMessage("Error deleting employee. Please try again.");
    }
  };

  const openEditModal = (user) => {
    setCurrentUser({ ...user });
    setShowEditModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({ 
      name: "", 
      email: "", 
      contactNumber: "", 
      address: "", 
      password: "", 
      role: "member" 
    });
    setFormErrors({});
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setCurrentUser(null);
    setFormErrors({});
  };

  return (
    <AttendanceDashboardLayout activeMenu="Employees" requiredRole="hr_manager">
      <div className="employees-container">
        <div className="page-header">
          <div className="header-title">
            <h1>Employee Management</h1>
            <p>Manage your team members and their roles</p>
          </div>
          <div className="header-actions">
            <button
              className="add-employee-btn"
              onClick={() => setShowAddModal(true)}
            >
              <span className="btn-icon">+</span> Add Employee
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Address / License</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td className="user-id">{emp.employeeId || emp._id}</td>
                    <td>
                      <div className="employee-info">
                        <div className="avatar">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="name">{emp.name}</div>
                      </div>
                    </td>
                    <td>{emp.contactNumber}</td>
                    <td className="address-cell">{emp.address}</td>
                    <td>{emp.email}</td>
                    <td>
                      <span className={`role-badge role-${emp.role}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-employee">Employee</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn"
                          onClick={() => openEditModal(emp)}
                        >
                          <span className="icon">✏️</span> Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(emp._id)}
                        >
                          <span className="icon">🗑️</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {/* Drivers Section */}
                {drivers.map((driver) => (
                  <tr key={`driver-${driver._id}`}>
                    <td className="user-id">{driver._id}</td>
                    <td>
                      <div className="employee-info">
                        <div className="avatar driver-avatar">
                          🚗
                        </div>
                        <div className="name">{driver.name}</div>
                      </div>
                    </td>
                    <td>{driver.phone}</td>
                    <td className="address-cell">
                      <span className="license-badge">📋 {driver.licenseNumber}</span>
                    </td>
                    <td>-</td>
                    <td>
                      <span className="role-badge role-driver">Driver</span>
                    </td>
                    <td>
                      <span className={`status-badge ${driver.isAvailable ? 'status-available' : 'status-unavailable'}`}>
                        {driver.isAvailable ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" title="View driver details">
                          <span className="icon">👁️</span> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeAddModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Employee</h2>
                <button className="close-btn" onClick={closeAddModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    className={formErrors.name ? "error" : ""}
                  />
                  {formErrors.name && (
                    <span className="error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && (
                    <span className="error-text">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    placeholder="Enter contact number"
                    value={newUser.contactNumber}
                    onChange={(e) =>
                      setNewUser({ ...newUser, contactNumber: e.target.value })
                    }
                    className={formErrors.contactNumber ? "error" : ""}
                  />
                  {formErrors.contactNumber && (
                    <span className="error-text">{formErrors.contactNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    placeholder="Enter full address"
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({ ...newUser, address: e.target.value })
                    }
                    className={formErrors.address ? "error" : ""}
                    rows="3"
                  />
                  {formErrors.address && (
                    <span className="error-text">{formErrors.address}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input-container">
                    <input
                      type="password"
                      placeholder="Enter password (min. 6 characters)"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className={formErrors.password ? "error" : ""}
                    />
                    <button
                      type="button"
                      className="generate-password-btn"
                      onClick={handleGeneratePassword}
                      title="Generate secure password"
                    >
                      🔄 Generate
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className="error-text">{formErrors.password}</span>
                  )}
                  {newUser.password && (
                    <span className="password-strength">
                      Password strength: {newUser.password.length >= 8 ? 'Strong' : newUser.password.length >= 6 ? 'Medium' : 'Weak'}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <div className="role-selector">
                    <select
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({ ...newUser, role: e.target.value })
                      }
                    >
                      <option value="member">Team Member</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                  <p className="role-description">
                    {newUser.role === "member" &&
                      "Can view their own attendance and request time off"}
                    {newUser.role === "hr_manager" &&
                      "Can manage all employee records and attendance data"}
                    {newUser.role === "admin" &&
                      "Full system access including user management and settings"}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeAddModal}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleAddUser}>
                  Add Employee
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {showEditModal && currentUser && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Employee</h2>
                <button className="close-btn" onClick={closeEditModal}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={currentUser.name}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, name: e.target.value })
                    }
                    className={formErrors.name ? "error" : ""}
                  />
                  {formErrors.name && (
                    <span className="error-text">{formErrors.name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={currentUser.email}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, email: e.target.value })
                    }
                    className={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && (
                    <span className="error-text">{formErrors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    placeholder="Enter contact number"
                    value={currentUser.contactNumber}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, contactNumber: e.target.value })
                    }
                    className={formErrors.contactNumber ? "error" : ""}
                  />
                  {formErrors.contactNumber && (
                    <span className="error-text">{formErrors.contactNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    placeholder="Enter full address"
                    value={currentUser.address}
                    onChange={(e) =>
                      setCurrentUser({ ...currentUser, address: e.target.value })
                    }
                    className={formErrors.address ? "error" : ""}
                    rows="3"
                  />
                  {formErrors.address && (
                    <span className="error-text">{formErrors.address}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <div className="role-selector">
                    <select
                      value={currentUser.role}
                      onChange={(e) =>
                        setCurrentUser({ ...currentUser, role: e.target.value })
                      }
                    >
                      <option value="member">Team Member</option>
                      <option value="hr_manager">HR Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <div className="select-arrow">▼</div>
                  </div>
                  <p className="role-description">
                    {currentUser.role === "member" &&
                      "Can view their own attendance and request time off"}
                    {currentUser.role === "hr_manager" &&
                      "Can manage all employee records and attendance data"}
                    {currentUser.role === "admin" &&
                      "Full system access including user management and settings"}
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={closeEditModal}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleEditUser}>
                  Update Employee
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AttendanceDashboardLayout>
  );
}

export default Employees;
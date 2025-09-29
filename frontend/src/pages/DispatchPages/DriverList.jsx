import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "../../CSS/DispatchCSS/DriverList.css";

const BACKEND_URL = "http://localhost:5000/drivers";

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); //Search state
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[A-Z][a-z]*(?:\s[A-Z][a-z]*)*$/,
      message:
        "Name should start with a capital letter and each word should be properly capitalized (2-50 characters)",
    },
    phone: {
      required: true,
      pattern: /^0\d{9}$/,
      message: "Phone number must start with 0 and contain exactly 10 digits",
    },
    licenseNumber: {
      required: true,
      minLength: 5,
      maxLength: 10,
      pattern: /^[A-Z][a-z0-9]*$/,
      message:
        "License number should start with a capital letter followed by lowercase letters and numbers (5-10 characters)",
    },
  };

  // Field validation
  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return "";
    if (rules.required && !value.trim()) return "This field is required";
    if (rules.minLength && value.length < rules.minLength)
      return `Minimum ${rules.minLength} characters required`;
    if (rules.maxLength && value.length > rules.maxLength)
      return `Maximum ${rules.maxLength} characters allowed`;
    if (rules.pattern && !rules.pattern.test(value)) return rules.message;
    return "";
  };

  // Validate entire form
  const validateForm = (formData) => {
    const newErrors = {};
    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, formData[field] || "");
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(BACKEND_URL);
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err.response?.data || err.message);
      alert("Failed to fetch drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));

    if (editingDriver) {
      setEditingDriver({ ...editingDriver, [name]: value });
      const error = validateField(name, value);
      if (error) setFormErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setNewDriver({ ...newDriver, [name]: value });
      const error = validateField(name, value);
      if (error) setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  // Add or update driver
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = editingDriver ? editingDriver : newDriver;
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      editingDriver ? setFormErrors(validationErrors) : setErrors(validationErrors);
      alert("Please fix the validation errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      let res;
      if (editingDriver) {
        res = await axiosInstance.put(`${BACKEND_URL}/${editingDriver._id}`, editingDriver, {
          headers: { "Content-Type": "application/json" },
        });
        alert(res.data.message);
        setEditingDriver(null);
        setFormErrors({});
      } else {
        res = await axiosInstance.post(BACKEND_URL, newDriver, {
          headers: { "Content-Type": "application/json" },
        });
        alert(res.data.message);
        setNewDriver({ name: "", phone: "", licenseNumber: "" });
        setErrors({});
      }
      setShowForm(false);
      fetchDrivers();
    } catch (err) {
      console.error("Error saving driver:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save driver.");
    } finally {
      setLoading(false);
    }
  };

  // Delete driver checks
  const canDeleteDriver = (driver) => {
    if (!driver) return false;
    return !(
      driver.isAvailable === false ||
      driver.assignedOrders > 0 ||
      driver.isAssigned === true
    );
  };

  const getDeletionReason = (driver) => {
    if (!driver) return "Driver not found";
    if (driver.isAvailable === false) return "Driver is unavailable.";
    if (driver.assignedOrders > 0) return "Driver has assigned orders.";
    if (driver.isAssigned === true) return "Driver is currently assigned.";
    return "";
  };

  const handleDelete = async (driver) => {
    if (!driver) return;
    if (!canDeleteDriver(driver)) {
      alert(`Cannot delete driver "${driver.name}". ${getDeletionReason(driver)}`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete driver "${driver.name}"?`))
      return;

    setLoading(true);
    try {
      const res = await axiosInstance.delete(`${BACKEND_URL}/${driver._id}`);
      alert(res.data.message);
      fetchDrivers();
    } catch (err) {
      console.error("Error deleting driver:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete driver.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver({ ...driver });
    setFormErrors({});
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingDriver(null);
    setNewDriver({ name: "", phone: "", licenseNumber: "" });
    setErrors({});
    setFormErrors({});
    setShowForm(false);
  };

  // ✅ Filter drivers according to searchTerm
  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="driver-management">
      <div className="header">
        <h2>Driver Management</h2>
        <button
          className={showForm ? "btn btn-cancel" : "btn btn-primary"}
          onClick={() => {
            setEditingDriver(null);
            setNewDriver({ name: "", phone: "", licenseNumber: "" });
            setErrors({});
            setFormErrors({});
            setShowForm(!showForm);
          }}
          disabled={loading}
        >
          {showForm ? "Cancel" : "Add Driver"}
        </button>
      </div>

      {/* Add/Edit Driver Form */}
      {showForm && (
        <div className="driver-form">
          <h3>{editingDriver ? "Edit Driver" : "Add New Driver"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                className={`form-control ${(errors.name || formErrors.name) ? "error" : ""}`}
                value={editingDriver ? editingDriver.name : newDriver.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {(errors.name || formErrors.name) && (
                <span className="error-message">{errors.name || formErrors.name}</span>
              )}
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                name="phone"
                className={`form-control ${(errors.phone || formErrors.phone) ? "error" : ""}`}
                value={editingDriver ? editingDriver.phone : newDriver.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {(errors.phone || formErrors.phone) && (
                <span className="error-message">{errors.phone || formErrors.phone}</span>
              )}
            </div>
            <div className="form-group">
              <label>License Number:</label>
              <input
                type="text"
                name="licenseNumber"
                className={`form-control ${(errors.licenseNumber || formErrors.licenseNumber) ? "error" : ""}`}
                value={editingDriver ? editingDriver.licenseNumber : newDriver.licenseNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
              {(errors.licenseNumber || formErrors.licenseNumber) && (
                <span className="error-message">
                  {errors.licenseNumber || formErrors.licenseNumber}
                </span>
              )}
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className={editingDriver ? "btn btn-update" : "btn btn-primary"}
                disabled={
                  loading ||
                  Object.keys(editingDriver ? formErrors : errors).some((k) =>
                    editingDriver ? formErrors[k] : errors[k]
                  )
                }
              >
                {loading ? "Processing..." : editingDriver ? "Update Driver" : "Add Driver"}
              </button>
              {editingDriver && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {loading && !showForm && <div className="loading">Loading drivers...</div>}

      {/* ✅ Search Box */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by driver name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Drivers Table */}
      <table className="drivers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>License</th>
            <th>Available</th>
            <th>Assigned Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((d) => (
              <tr key={d._id} className={!d.isAvailable ? "row-disabled" : ""}>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.licenseNumber}</td>
                <td className={d.isAvailable ? "status-available" : "status-unavailable"}>
                  {d.isAvailable ? "Yes" : "No"}
                </td>
                <td className="assigned-orders">{d.assignedOrders || 0}</td>
                <td>
                  <div className="action-cell">
                    <button
                      className="btn btn-edit"
                      onClick={() => handleEdit(d)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className={`btn btn-delete ${canDeleteDriver(d) ? "" : "btn-delete-disabled"}`}
                      onClick={() => handleDelete(d)}
                      disabled={loading || !canDeleteDriver(d)}
                      title={canDeleteDriver(d) ? "Delete driver" : getDeletionReason(d)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-drivers">
                {loading
                  ? "Loading drivers..."
                  : "No drivers found. Try a different search or add a driver."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

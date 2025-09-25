import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../CSS/DispatchCSS/DriverList.css";

const BACKEND_URL = "http://localhost:5000/drivers";

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch drivers from backend
  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BACKEND_URL);
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
    if (editingDriver) {
      setEditingDriver({ ...editingDriver, [e.target.name]: e.target.value });
    } else {
      setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
    }
  };

  // Submit new driver
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (editingDriver) {
        // Update existing driver
        res = await axios.put(`${BACKEND_URL}/${editingDriver._id}`, editingDriver, {
          headers: { "Content-Type": "application/json" },
        });
        alert(res.data.message);
        setEditingDriver(null);
      } else {
        // Add new driver
        res = await axios.post(BACKEND_URL, newDriver, {
          headers: { "Content-Type": "application/json" },
        });
        alert(res.data.message);
        setNewDriver({ name: "", phone: "", licenseNumber: "" });
      }

      setShowForm(false);
      fetchDrivers(); // Refresh table
    } catch (err) {
      console.error("Error saving driver:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save driver.");
    } finally {
      setLoading(false);
    }
  };

  // Delete driver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.delete(`${BACKEND_URL}/${id}`);
      alert(res.data.message);
      fetchDrivers(); // Refresh table
    } catch (err) {
      console.error("Error deleting driver:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to delete driver.");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a driver
  const handleEdit = (driver) => {
    setEditingDriver({...driver});
    setShowForm(true);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingDriver(null);
    setNewDriver({ name: "", phone: "", licenseNumber: "" });
    setShowForm(false);
  };

  return (
    <div className="driver-management">
      <div className="header">
        <h2>Driver Management</h2>
        <button
          className={showForm ? "btn btn-cancel" : "btn btn-primary"}
          onClick={() => {
            setEditingDriver(null);
            setNewDriver({ name: "", phone: "", licenseNumber: "" });
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
                className="form-control"
                value={editingDriver ? editingDriver.name : newDriver.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={editingDriver ? editingDriver.phone : newDriver.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>License Number:</label>
              <input
                type="text"
                name="licenseNumber"
                className="form-control"
                value={editingDriver ? editingDriver.licenseNumber : newDriver.licenseNumber}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className={editingDriver ? "btn btn-update" : "btn btn-primary"}
                disabled={loading}
              >
                {loading ? "Processing..." : (editingDriver ? "Update Driver" : "Add Driver")}
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

      {/* Loading Indicator */}
      {loading && !showForm && (
        <div className="loading">Loading drivers...</div>
      )}

      {/* Drivers Table */}
      <table className="drivers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>License</th>
            <th>Available</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.length > 0 ? (
            drivers.map((d) => (
              <tr key={d._id}>
                <td>{d.name}</td>
                <td>{d.phone}</td>
                <td>{d.licenseNumber}</td>
                <td className={d.isAvailable ? "status-available" : "status-unavailable"}>
                  {d.isAvailable ? "Yes" : "No"}
                </td>
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
                      className="btn btn-delete"
                      onClick={() => handleDelete(d._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-drivers">
                {loading ? "Loading drivers..." : "No drivers found. Add a driver to get started."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
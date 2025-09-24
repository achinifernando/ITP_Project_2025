import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./VehicleList.css";

const BACKEND_URL = "http://localhost:5001/vehicles";

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    type: "Truck",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);

  // Wrap fetchVehicles in useCallback to prevent unnecessary recreations
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(BACKEND_URL);
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch vehicles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleChange = (e) => {
    if (editingVehicle) {
      setEditingVehicle({ ...editingVehicle, [e.target.name]: e.target.value });
    } else {
      setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        // Update existing vehicle
        const res = await axios.put(
          `${BACKEND_URL}/${editingVehicle._id}`,
          editingVehicle,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        alert(res.data.message);
        setEditingVehicle(null);
      } else {
        // Add new vehicle
        const res = await axios.post(BACKEND_URL, newVehicle, {
          headers: { "Content-Type": "application/json" },
        });
        alert(res.data.message);
        setNewVehicle({ vehicleNumber: "", type: "Truck", capacity: "" });
      }
      setShowForm(false);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save vehicle.");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    // Use browser's native confirm dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete vehicle ${vehicle.vehicleNumber}?`
    );
    
    if (!isConfirmed) {
      return; // User clicked Cancel
    }

    try {
      const res = await axios.delete(`${BACKEND_URL}/${vehicle._id}`);
      alert(res.data.message);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Failed to delete vehicle.";
      
      if (err.response?.data?.message?.includes("in use") || 
          err.response?.data?.error?.includes("in use")) {
        alert(`Cannot delete vehicle: ${vehicle.vehicleNumber} is currently assigned to an active delivery.`);
      } else {
        alert(errorMessage);
      }
    }
  };

  const cancelEdit = () => {
    setEditingVehicle(null);
    setNewVehicle({ vehicleNumber: "", type: "Truck", capacity: "" });
    setShowForm(false);
  };

  return (
    <div className="vehicle-management-container">
      <div className="vehicle-header">
        <h2>Vehicles</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`toggle-form-btn ${showForm ? "cancel" : ""}`}
        >
          {showForm ? "Cancel" : "Add Vehicle"}
        </button>
      </div>

      {showForm && (
        <div className="vehicle-form">
          <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Vehicle Number:</label>
              <input
                type="text"
                name="vehicleNumber"
                value={editingVehicle ? editingVehicle.vehicleNumber : newVehicle.vehicleNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                name="type"
                value={editingVehicle ? editingVehicle.type : newVehicle.type}
                onChange={handleChange}
              >
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Mini Truck">Mini Truck</option>
              </select>
            </div>
            <div className="form-group">
              <label>Capacity (kg):</label>
              <input
                type="number"
                name="capacity"
                value={editingVehicle ? editingVehicle.capacity : newVehicle.capacity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
              </button>
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading vehicles...</div>
      ) : (
        <table className="vehicles-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id}>
                <td>{v.vehicleNumber}</td>
                <td>{v.type}</td>
                <td>{v.capacity} kg</td>
                <td>
                  <span className={`availability-badge ${v.isAvailable ? "available" : "not-available"}`}>
                    {v.isAvailable ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(v)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(v)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "../../CSS/DispatchCSS/VehicleList.css";

const BACKEND_URL = "http://localhost:5000/vehicles";

// Vehicle types configuration
const VEHICLE_TYPES = [
  { value: "Truck", label: "Truck" },
  { value: "Mini Truck", label: "Mini Truck" },
];

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
  const [errors, setErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  // Validation rules
  const validateForm = (vehicleData) => {
    const newErrors = {};

    // Vehicle Number validation
    if (!vehicleData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = "Vehicle number is required";
    } else if (!/^[A-Za-z0-9\s-]{3,20}$/.test(vehicleData.vehicleNumber)) {
      newErrors.vehicleNumber = "Vehicle number must be 3-20 characters (letters, numbers, spaces, hyphens)";
    }

    // Type validation
    if (!vehicleData.type) {
      newErrors.type = "Vehicle type is required";
    } else if (!VEHICLE_TYPES.some(vt => vt.value === vehicleData.type)) {
      newErrors.type = "Invalid vehicle type";
    }

    // Capacity validation
    if (!vehicleData.capacity) {
      newErrors.capacity = "Capacity is required";
    } else if (isNaN(vehicleData.capacity) || parseFloat(vehicleData.capacity) <= 0) {
      newErrors.capacity = "Capacity must be a positive number";
    } else if (parseFloat(vehicleData.capacity) > 100000) {
      newErrors.capacity = "Capacity cannot exceed 100,000 kg";
    } else if (!/^\d{1,6}(\.\d{1,2})?$/.test(vehicleData.capacity)) {
      newErrors.capacity = "Capacity must be a valid number (max 2 decimal places)";
    }

    return newErrors;
  };

  // Wrap fetchVehicles in useCallback to prevent unnecessary recreations
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(BACKEND_URL);
      setVehicles(res.data);
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
      alert("Failed to fetch vehicles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (editingVehicle) {
      setEditingVehicle({ 
        ...editingVehicle, 
        [name]: name === "capacity" ? value : value 
      });
    } else {
      setNewVehicle({ 
        ...newVehicle, 
        [name]: name === "capacity" ? value : value 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const vehicleData = editingVehicle || newVehicle;
    const validationErrors = validateForm(vehicleData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setFormLoading(true);
      
      // Prepare data with proper types
      const submitData = {
        ...vehicleData,
        capacity: parseFloat(vehicleData.capacity)
      };

      if (editingVehicle) {
        // Update existing vehicle
        const res = await axiosInstance.put(
          `${BACKEND_URL}/${editingVehicle._id}`,
          submitData
        );
        alert(res.data.message || "Vehicle updated successfully!");
        setEditingVehicle(null);
      } else {
        // Add new vehicle
        const res = await axiosInstance.post(BACKEND_URL, submitData);
        alert(res.data.message || "Vehicle added successfully!");
        setNewVehicle({ vehicleNumber: "", type: "Truck", capacity: "" });
      }
      
      setShowForm(false);
      setErrors({});
      fetchVehicles();
    } catch (err) {
      console.error("Save vehicle error:", err);
      
      if (err.response?.status === 400) {
        // Handle duplicate vehicle number
        if (err.response.data.message?.includes("already exists") || 
            err.response.data.error?.includes("duplicate")) {
          setErrors({ vehicleNumber: "Vehicle number already exists" });
        } else {
          setErrors({ submit: err.response.data.message || "Validation failed" });
        }
      } else {
        alert(err.response?.data?.message || "Failed to save vehicle. Please try again.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle({ ...vehicle });
    setNewVehicle({ vehicleNumber: "", type: "Truck", capacity: "" });
    setErrors({});
    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    // Check if vehicle is assigned to active delivery
    if (!vehicle.isAvailable) {
      alert(`Cannot delete vehicle: ${vehicle.vehicleNumber} is currently assigned to an active delivery.`);
      return;
    }

    // Use browser's native confirm dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete vehicle ${vehicle.vehicleNumber}?`
    );

    if (!isConfirmed) {
      return; // User clicked Cancel
    }

    try {
      const res = await axiosInstance.delete(`${BACKEND_URL}/${vehicle._id}`);
      alert(res.data.message || "Vehicle deleted successfully!");
      fetchVehicles();
    } catch (err) {
      console.error("Delete vehicle error:", err);
      
      if (err.response?.status === 400) {
        if (err.response.data.message?.includes("in use") ||
            err.response.data.error?.includes("in use")) {
          alert(`Cannot delete vehicle: ${vehicle.vehicleNumber} is currently assigned to an active delivery.`);
        } else {
          alert(err.response.data.message || "Cannot delete vehicle. It may be in use.");
        }
      } else {
        alert("Failed to delete vehicle. Please try again.");
      }
    }
  };

  const cancelEdit = () => {
    setEditingVehicle(null);
    setNewVehicle({ vehicleNumber: "", type: "Truck", capacity: "" });
    setErrors({});
    setShowForm(false);
  };

  // Check if vehicle can be deleted
  const canDeleteVehicle = (vehicle) => {
    return vehicle.isAvailable;
  };

  return (
    <div className="vehicle-management-container">
      <div className="vehicle-header">
        <h2>Vehicle Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`toggle-form-btn ${showForm ? "cancel" : "add"}`}
          disabled={formLoading}
        >
          {showForm ? "Cancel" : "Add Vehicle"}
        </button>
      </div>

      {showForm && (
        <div className="vehicle-form">
          <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="vehicleNumber">Vehicle Number: *</label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={
                  editingVehicle
                    ? editingVehicle.vehicleNumber
                    : newVehicle.vehicleNumber
                }
                onChange={handleChange}
                required
                maxLength="20"
                placeholder="e.g., AB1234"
                className={errors.vehicleNumber ? "error" : ""}
              />
              {errors.vehicleNumber && (
                <span className="error-message">{errors.vehicleNumber}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Vehicle Type: *</label>
              <select
                id="type"
                name="type"
                value={editingVehicle ? editingVehicle.type : newVehicle.type}
                onChange={handleChange}
                className={errors.type ? "error" : ""}
              >
                {VEHICLE_TYPES.map((vehicleType) => (
                  <option key={vehicleType.value} value={vehicleType.value}>
                    {vehicleType.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <span className="error-message">{errors.type}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="capacity">Capacity (kg): *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={
                  editingVehicle ? editingVehicle.capacity : newVehicle.capacity
                }
                onChange={handleChange}
                required
                min="0.01"
                max="100000"
                step="0.01"
                placeholder="e.g., 5000.50"
                className={errors.capacity ? "error" : ""}
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>
            
            {errors.submit && (
              <div className="error-message submit-error">{errors.submit}</div>
            )}
            
            <div className="form-buttons">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={formLoading}
              >
                {formLoading ? "Saving..." : (editingVehicle ? "Update Vehicle" : "Add Vehicle")}
              </button>
              <button 
                type="button" 
                onClick={cancelEdit} 
                className="cancel-btn"
                disabled={formLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading vehicles...</div>
      ) : (
        <div className="vehicles-table-container">
          {vehicles.length === 0 ? (
            <div className="no-vehicles">
              No vehicles found. Click "Add Vehicle" to get started.
            </div>
          ) : (
            <table className="vehicles-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Type</th>
                  <th>Capacity (kg)</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className={vehicle.isAvailable ? "" : "assigned"}>
                    <td>
                      <span className="vehicle-number">{vehicle.vehicleNumber}</span>
                    </td>
                    <td>{vehicle.type}</td>
                    <td>{parseFloat(vehicle.capacity).toLocaleString()} kg</td>
                    <td>
                      <span
                        className={`availability-badge ${
                          vehicle.isAvailable ? "available" : "not-available"
                        }`}
                      >
                        {vehicle.isAvailable ? "Available" : "On Delivery"}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEdit(vehicle)}
                          title="Edit vehicle"
                        >
                          Edit
                        </button>
                        <button
                          className={`delete-btn ${!canDeleteVehicle(vehicle) ? "disabled" : ""}`}
                          onClick={() => handleDelete(vehicle)}
                          disabled={!canDeleteVehicle(vehicle)}
                          title={
                            !canDeleteVehicle(vehicle) 
                              ? "Cannot delete - vehicle is on active delivery" 
                              : "Delete vehicle"
                          }
                        >
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
      )}
    </div>
  );
}
// src/components/AssignmentPopup.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
//import "../index.css";

const BACKEND_URL = "http://localhost:5000";

export default function AssignmentPopup({ delivery, onClose, onAssign }) {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch available drivers and vehicles
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        //Correct endpoints
        const driversRes = await axiosInstance.get(`${BACKEND_URL}/drivers`);
        const availableDrivers = driversRes.data.filter(d => d.isAvailable);
        setDrivers(availableDrivers);

        const vehiclesRes = await axiosInstance.get(`${BACKEND_URL}/vehicles`);
        const availableVehicles = vehiclesRes.data.filter(v => v.isAvailable);
        setVehicles(availableVehicles);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Failed to load drivers and vehicles");
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDriver || !selectedVehicle) {
      alert("Please select both a driver and a vehicle");
      return;
    }

    try {
      //Correct endpoint
      const response = await axiosInstance.post(
        `${BACKEND_URL}/assignments/assign/${delivery._id}`,
        {
          driverId: selectedDriver,
          vehicleId: selectedVehicle,
        }
      );

      onAssign(response.data.delivery); // update parent list
      alert("Delivery assigned successfully!");
      onClose();
    } catch (err) {
      console.error("Assignment error:", err);
      alert(err.response?.data?.message || "Error assigning delivery");
    }
  };

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Assign Delivery #{delivery.orderId}</h3>
          <p>Loading available drivers and vehicles...</p>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Assign Delivery #{delivery.orderId}</h3>
        <p>Customer: {delivery.customerName}</p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="driver">Select Driver:</label>
            <select
              id="driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              required
            >
              <option value="">Choose a driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.licenseNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="vehicle">Select Vehicle:</label>
            <select
              id="vehicle"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              required
            >
              <option value="">Choose a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>

          <div className="popup-buttons">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={!selectedDriver || !selectedVehicle}>
              Assign Delivery
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
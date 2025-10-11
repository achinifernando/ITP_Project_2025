import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
// import "../../CSS/DispatchCSS/EditAssignmentPopup.css";

const BACKEND_URL = "http://localhost:5000";

export default function EditAssignmentPopup({ assignment, onClose, onUpdate }) {
  const [selectedDriver, setSelectedDriver] = useState(
    assignment?.driver?._id || assignment?.driver || ""
  );
  const [selectedVehicle, setSelectedVehicle] = useState(
    assignment?.vehicle?._id || assignment?.vehicle || ""
  );
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        const [driversRes, vehiclesRes] = await Promise.all([
          axiosInstance.get(`${BACKEND_URL}/drivers`),
          axiosInstance.get(`${BACKEND_URL}/vehicles`),
        ]);

        const allDrivers = Array.isArray(driversRes.data)
          ? driversRes.data
          : driversRes.data.drivers || [];
        const allVehicles = Array.isArray(vehiclesRes.data)
          ? vehiclesRes.data
          : vehiclesRes.data.vehicles || [];

        setDrivers(allDrivers);
        setVehicles(allVehicles);
      } catch (err) {
        console.error("Error fetching options:", err);
        setError("Failed to load drivers and vehicles.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [assignment]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDriver || !selectedVehicle) {
      alert("Please select both a driver and a vehicle.");
      return;
    }

    try {
      let response;

      // Check if this is a real assignment or a temporary one
      if (assignment._id && assignment.delivery && assignment.delivery._id) {
        // This is a real assignment with an assignment ID
        console.log("Updating real assignment:", assignment._id);
        
        response = await axiosInstance.put(
          `${BACKEND_URL}/assignments/${assignment._id}`,
          {
            driverId: selectedDriver,
            vehicleId: selectedVehicle,
          }
        );
      } else {
        // This is a temporary assignment created from delivery - use delivery ID
        console.log("Updating via delivery:", assignment._id);
        
        response = await axiosInstance.put(
          `${BACKEND_URL}/assignments/${assignment._id}`,
          {
            driverId: selectedDriver,
            vehicleId: selectedVehicle,
          }
        );
      }

      if (response.data) {
        onUpdate(response.data.assignment || response.data);
      }
      alert("Assignment updated successfully!");
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Error updating assignment");
    }
  };

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h3>Edit Assignment for Order #{assignment?.delivery?.orderId || assignment?.orderId}</h3>
          <p>Loading drivers and vehicles...</p>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }

  const currentDriverId = assignment?.driver?._id || assignment?.driver;
  const currentVehicleId = assignment?.vehicle?._id || assignment?.vehicle;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Edit Assignment for Order #{assignment?.delivery?.orderId || assignment?.orderId}</h3>
        <p>Customer: {assignment?.delivery?.customerName || assignment?.customerName}</p>

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
                <option
                  key={driver._id}
                  value={driver._id}
                  disabled={
                    !driver.isAvailable &&
                    driver._id !== currentDriverId
                  }
                >
                  {driver.name} – {driver.licenseNumber}
                  {!driver.isAvailable &&
                  driver._id !== currentDriverId
                    ? " (Not Available)"
                    : ""}
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
                <option
                  key={vehicle._id}
                  value={vehicle._id}
                  disabled={
                    !vehicle.isAvailable &&
                    vehicle._id !== currentVehicleId
                  }
                >
                  {vehicle.vehicleNumber} – {vehicle.type}
                  {!vehicle.isAvailable &&
                  vehicle._id !== currentVehicleId
                    ? " (Not Available)"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="popup-buttons">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={!selectedDriver || !selectedVehicle}>
              Update Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
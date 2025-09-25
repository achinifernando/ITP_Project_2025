import React, { useEffect, useState } from "react";
import axios from "axios";
import AssignmentPopup from "./AssignmentPopup";
import "../../CSS/DispatchCSS/AssignedDeliveries.css";

const BACKEND_URL = "http://localhost:5000";

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const deliveriesRes = await axios.get(`${BACKEND_URL}/deliveries`);
      setDeliveries(deliveriesRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error("FETCH ERROR:", err.response || err);
      setError("Error fetching data. Please check if the backend server is running.");
      setLoading(false);
    }
  };

  const openAssignmentPopup = (delivery) => {
    setSelectedDelivery(delivery);
    setShowPopup(true);
  };

  const openEditPopup = (delivery) => {
    setEditingDelivery(delivery);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedDelivery(null);
    setEditingDelivery(null);
  };

  const handleAssignmentComplete = (updatedDelivery) => {
    setDeliveries(prev => 
      prev.map(d => d._id === updatedDelivery._id ? updatedDelivery : d)
    );
  };

  const startDelivery = async (deliveryId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/assignments/start/${deliveryId}`);
      setDeliveries(prev => 
        prev.map(d => d._id === deliveryId ? response.data.delivery : d)
      );
      alert("Delivery started!");
    } catch (err) {
      console.error("START ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error starting delivery");
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      const response = await axios.put(`${BACKEND_URL}/assignments/status/${deliveryId}`, {
        status: "Completed"
      });
      setDeliveries(prev => 
        prev.map(d => d._id === deliveryId ? response.data.delivery : d)
      );
      alert("Delivery marked as completed!");
    } catch (err) {
      console.error("COMPLETE ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error completing delivery");
    }
  };

  // FIXED: Delete delivery function
  const deleteDelivery = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) {
      return;
    }

    try {
      await axios.delete(`${BACKEND_URL}/deliveries/${deliveryId}`);
      
      // Remove from local state
      setDeliveries(prev => prev.filter(d => d._id !== deliveryId));
      
      alert("Delivery deleted successfully!");
    } catch (err) {
      console.error("DELETE DELIVERY ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error deleting delivery");
    }
  };

  // FIXED: Remove assignment function (keeps delivery but removes assignment)
  const removeAssignment = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to remove assignment from this delivery?")) {
      return;
    }

    try {
      const delivery = deliveries.find(d => d._id === deliveryId);
      
      if (delivery.driver) {
        await axios.patch(`${BACKEND_URL}/drivers/${delivery.driver._id || delivery.driver}`, {
          isAvailable: true
        });
      }
      
      if (delivery.vehicle) {
        await axios.patch(`${BACKEND_URL}/vehicles/${delivery.vehicle._id || delivery.vehicle}`, {
          isAvailable: true
        });
      }

      const response = await axios.put(`${BACKEND_URL}/deliveries/${deliveryId}`, {
        driver: null,
        vehicle: null,
        status: "Pending",
        assignedAt: null
      });

      setDeliveries(prev => 
        prev.map(d => d._id === deliveryId ? response.data : d)
      );
      
      alert("Assignment removed successfully!");
    } catch (err) {
      console.error("REMOVE ASSIGNMENT ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error removing assignment");
    }
  };

  const getAddress = (delivery) => {
    return delivery.address || delivery.deliveryAddress || "Address not available";
  };

  const getActionButton = (delivery) => {
    if (!delivery.driver && !delivery.vehicle) {
      return (
        <button 
          onClick={() => openAssignmentPopup(delivery)}
          className="btn-assign"
        >
          Assign
        </button>
      );
    } else if (delivery.status === "Assigned") {
      return (
        <button 
          onClick={() => startDelivery(delivery._id)}
          className="btn-start"
        >
          Start
        </button>
      );
    } else if (delivery.status === "Ongoing") {
      return (
        <button 
          onClick={() => completeDelivery(delivery._id)}
          className="btn-complete"
        >
          Complete
        </button>
      );
    } else if (delivery.status === "Completed") {
      return <span className="status-completed">Completed</span>;
    }
    
    return null;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="assigned-deliveries-container">
      <h2>Delivery Assignments</h2>
      
      {showPopup && (selectedDelivery || editingDelivery) && (
        <AssignmentPopup 
          delivery={selectedDelivery || editingDelivery}
          onClose={closePopup}
          onAssign={handleAssignmentComplete}
          isEdit={!!editingDelivery}
        />
      )}
      
      <table className="deliveries-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Address</th>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(delivery => (
            <tr key={delivery._id} className={!delivery.driver || !delivery.vehicle ? "unassigned-row" : ""}>
              <td>#{delivery.orderId}</td>
              <td>{delivery.customerName}</td>
              <td>{getAddress(delivery)}</td>
              <td className={!delivery.driver ? "not-assigned" : ""}>
                {delivery.driver ? (
                  typeof delivery.driver === 'object' ? delivery.driver.name : "Driver assigned"
                ) : (
                  <span className="not-assigned-text">Not assigned</span>
                )}
              </td>
              <td className={!delivery.vehicle ? "not-assigned" : ""}>
                {delivery.vehicle ? (
                  typeof delivery.vehicle === 'object' ? delivery.vehicle.vehicleNumber : "Vehicle assigned"
                ) : (
                  <span className="not-assigned-text">Not assigned</span>
                )}
              </td>
              <td>
                <span className={`status status-${delivery.status?.toLowerCase() || 'pending'}`}>
                  {delivery.status || "Pending"}
                </span>
              </td>
              <td>
                {getActionButton(delivery)}
              </td>
              <td>
                {(delivery.driver && delivery.vehicle) && (
                  <button 
                    onClick={() => openEditPopup(delivery)}
                    className="btn-edit"
                    title="Edit assignment"
                  >
                    Edit
                  </button>
                )}
              </td>
              <td>
                {/* FIXED: Separate buttons for removing assignment and deleting delivery */}
                <div className="action-buttons">
                  {(delivery.driver && delivery.vehicle) && (
                    <button 
                      onClick={() => removeAssignment(delivery._id)}
                      className="btn-remove"
                      title="Remove assignment"
                    >
                      Remove Assign
                    </button>
                  )}
                  <button 
                    onClick={() => deleteDelivery(delivery._id)}
                    className="btn-delete"
                    title="Delete delivery"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
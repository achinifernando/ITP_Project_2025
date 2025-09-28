import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import AssignmentPopup from "../DispatchPages/AssignmentPopup";
import EditAssignmentPopup from "../DispatchPages/EditAssignmentPopup";
import AssignmentsTable from "../DispatchPages/AssignmentsTable";
import "../../CSS/DispatchCSS/AssignedDeliveries.css";

const BACKEND_URL = "http://localhost:5000";

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [activeTab, setActiveTab] = useState("deliveries");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [deliveriesRes, assignmentsRes] = await Promise.all([
        axiosInstance.get(`${BACKEND_URL}/assignments/deliveries`),
        axiosInstance.get(`${BACKEND_URL}/assignments`)
      ]);
      
      setDeliveries(deliveriesRes.data.filter(Boolean).map(d => ({ ...d, _id: d._id || d.id })));
      setAssignments(assignmentsRes.data);
    } catch (err) {
      console.error("FETCH ERROR:", err.response || err);
      setError("Error fetching data. Please check if the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const openAssignmentPopup = (delivery) => {
    setSelectedDelivery(delivery);
    setShowAssignmentPopup(true);
  };

  const openEditPopup = async (delivery) => {
    try {
      // First, try to find the assignment for this delivery
      const assignment = assignments.find(a => a.delivery?._id === delivery._id);
      
      if (assignment) {
        setEditingAssignment(assignment);
        setShowEditPopup(true);
      } else {
        // If no assignment found, create a temporary one for editing
        const tempAssignment = {
          _id: delivery._id, // Use delivery ID as temporary assignment ID
          delivery: delivery,
          driver: delivery.driver,
          vehicle: delivery.vehicle,
          status: delivery.status
        };
        setEditingAssignment(tempAssignment);
        setShowEditPopup(true);
      }
    } catch (err) {
      console.error("Error opening edit popup:", err);
      alert("Error opening edit form");
    }
  };

  const closePopups = () => {
    setShowAssignmentPopup(false);
    setShowEditPopup(false);
    setSelectedDelivery(null);
    setEditingAssignment(null);
  };

  const handleAssignmentComplete = () => {
    fetchData();
    closePopups();
  };

  const handleEditComplete = () => {
    fetchData();
    closePopups();
  };

  const startDelivery = async (deliveryId) => {
    try {
      await axiosInstance.post(`${BACKEND_URL}/assignments/start/${deliveryId}`);
      fetchData();
      alert("Delivery started!");
    } catch (err) {
      console.error("START ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error starting delivery");
    }
  };

  const completeDelivery = async (deliveryId) => {
    try {
      await axiosInstance.put(`${BACKEND_URL}/assignments/status/${deliveryId}`, { status: "Completed" });
      fetchData();
      alert("Delivery marked as completed!");
    } catch (err) {
      console.error("COMPLETE ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error completing delivery");
    }
  };

  const removeAssignment = async (deliveryId) => {
    if (!window.confirm("Remove assignment from this delivery?")) return;

    try {
      await axiosInstance.delete(`${BACKEND_URL}/assignments/remove/${deliveryId}`);
      fetchData();
      alert("Assignment removed successfully!");
    } catch (err) {
      console.error("REMOVE ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error removing assignment");
    }
  };

  const deleteDelivery = async (deliveryId) => {
    if (!window.confirm("Are you sure you want to delete this delivery?")) return;
    
    try {
      await axiosInstance.delete(`${BACKEND_URL}/deliveries/${deliveryId}`);
      fetchData();
      alert("Delivery deleted successfully!");
    } catch (err) {
      console.error("DELETE ERROR:", err.response || err);
      alert(err.response?.data?.message || "Error deleting delivery");
    }
  };

  const getAddress = (delivery) =>
    delivery?.address || delivery?.deliveryAddress || "Address not available";

  const getActionButton = (delivery) => {
    if (!delivery.driver && !delivery.vehicle) {
      return (
        <button onClick={() => openAssignmentPopup(delivery)} className="btn-assign">
          Assign
        </button>
      );
    }
    if (delivery.status === "Assigned") {
      return (
        <button onClick={() => startDelivery(delivery._id)} className="btn-start">
          Start
        </button>
      );
    }
    if (delivery.status === "Ongoing") {
      return (
        <button onClick={() => completeDelivery(delivery._id)} className="btn-complete">
          Complete
        </button>
      );
    }
    if (delivery.status === "Completed") {
      return <span className="status-completed">Completed</span>;
    }
    return null;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="assigned-deliveries-container">
      <div className="tabs">
        <button 
          className={activeTab === "deliveries" ? "active" : ""} 
          onClick={() => setActiveTab("deliveries")}
        >
          All Deliveries
        </button>
        <button 
          className={activeTab === "assignments" ? "active" : ""} 
          onClick={() => setActiveTab("assignments")}
        >
          Delivery Assignments
        </button>
      </div>

      {showAssignmentPopup && selectedDelivery && (
        <AssignmentPopup
          delivery={selectedDelivery}
          onClose={closePopups}
          onAssign={handleAssignmentComplete}
        />
      )}

      {showEditPopup && editingAssignment && (
        <EditAssignmentPopup
          assignment={editingAssignment}
          onClose={closePopups}
          onUpdate={handleEditComplete}
        />
      )}

      {activeTab === "deliveries" ? (
        <>
          <h2>All Deliveries</h2>
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
              {deliveries.map((delivery) => (
                <tr key={delivery._id} className={!delivery.driver || !delivery.vehicle ? "unassigned-row" : ""}>
                  <td>#{delivery.orderId}</td>
                  <td>{delivery.customerName}</td>
                  <td>{getAddress(delivery)}</td>
                  <td className={!delivery.driver ? "not-assigned" : ""}>
                    {delivery.driver ? (typeof delivery.driver === "object" ? delivery.driver.name : "Driver assigned") : <span className="not-assigned-text">Not assigned</span>}
                  </td>
                  <td className={!delivery.vehicle ? "not-assigned" : ""}>
                    {delivery.vehicle ? (typeof delivery.vehicle === "object" ? delivery.vehicle.vehicleNumber : "Vehicle assigned") : <span className="not-assigned-text">Not assigned</span>}
                  </td>
                  <td>
                    <span className={`status status-${delivery.status?.toLowerCase() || "pending"}`}>
                      {delivery.status || "Pending"}
                    </span>
                  </td>
                  <td>{getActionButton(delivery)}</td>
                  <td>
                    {delivery.driver && delivery.vehicle && (
                      <button onClick={() => openEditPopup(delivery)} className="btn-edit">
                        Edit
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {delivery.driver && delivery.vehicle && (
                        <button onClick={() => removeAssignment(delivery._id)} className="btn-remove">
                          Remove Assign
                        </button>
                      )}
                      <button onClick={() => deleteDelivery(delivery._id)} className="btn-delete">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <AssignmentsTable assignments={assignments} onRefresh={fetchData} />
      )}
    </div>
  );
}
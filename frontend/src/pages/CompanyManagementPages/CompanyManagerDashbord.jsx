import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../../CSS/ClientPortalCSS/companyManagerDashboard.css';

function CompanyManagerDashboard() {
  const [payments, setPayments] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('pending');
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [quotationStatusFilter, setQuotationStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch all quotation requests
  useEffect(() => {
    axios
      .get("http://localhost:5000/quotationRequest/allQuotationrequests")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Error fetching requests:", err));
  }, []);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/googleAuth/all_bookings");
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdate = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/googleAuth/${id}`, { status });
      fetchBookings(); // Refresh bookings list
      setNotification({ show: true, type: "success", message: `Booking ${status}` });
    } catch (err) {
      console.error(err);
      setNotification({ show: true, type: "error", message: "Failed to update booking status" });
    }
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = "status-badge";
    switch (status?.toLowerCase()) {
      case 'pending':
        return `${baseClass} status-pending`;
      case 'confirmed':
        return `${baseClass} status-confirmed`;
      case 'completed':
        return `${baseClass} status-completed`;
      case 'rejected':
        return `${baseClass} status-rejected`;
      default:
        return baseClass;
    }
  };

  // Fetch Payments
  useEffect(() => {
    fetchPayments();
  }, [paymentStatusFilter, paymentCurrentPage]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/quotations/payments?status=${paymentStatusFilter}&page=${paymentCurrentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPayments(response.data.payments);
      setPaymentTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } 
  };

  const handleVerification = async (paymentId, status, notes = '') => {
    try {
      await axios.put(`http://localhost:5000/quotations/payments/${paymentId}/verify`, 
        { status, notes },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchPayments();
      setNotification({ show: true, type: "success", message: `Payment ${status}` });
    } catch (error) {
      console.error('Error updating payment:', error);
      setNotification({ show: true, type: "error", message: "Failed to update payment status" });
    }
  };

 

  return (
    <div className="dashboard-container">
      {/* Quotation Requests */}
      <h1>Quotation Requests</h1>
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No quotation requests found.</p>
        </div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Client ID</th>
              <th>Lorry Category</th>
              <th>Lorry Type</th>
              <th>Lorry Model</th>
              <th>Custom Features</th>
              <th>Quantity</th>
              <th>Expected Delivery Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req._id}</td>
                <td>{req.clientID}</td>
                <td>{req.lorryCategory}</td>
                <td>{req.lorryType}</td>
                <td>{req.lorryModel}</td>
                <td>{req.customFeatures || 'None'}</td>
                <td>{req.quantity}</td>
                <td>{new Date(req.expectedDeliveryDate).toLocaleDateString()}</td>
                <td>
                  <span className={getStatusBadgeClass(req.status)}>
                    {req.status}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/quotationgeneratorform/${req._id}`}
                    className="btn btn-primary"
                  >
                    Generate Quotation
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Google Calendar Button */}
      <div className="calendar-section">
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Calendar Management</h3>
        <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.875rem' }}>
          Access your Google Calendar to manage meeting schedules
        </p>
        <button
          className="calendar-btn"
          onClick={() => window.open("https://calendar.google.com/", "_blank")}
        >
           Open Google Calendar
        </button>
      </div>

      {/* Meetings */}
      <h1>Meeting Bookings</h1>
      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No meeting bookings yet.</p>
        </div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{b.clientName}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.time}</td>
                <td>
                  <span className={getStatusBadgeClass(b.status)}>
                    {b.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {b.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleUpdate(b._id, "confirmed")}
                          className="btn btn-success"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleUpdate(b._id, "rejected")}
                          className="btn btn-danger"
                        >
                           Reject
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <button
                        onClick={() => handleUpdate(b._id, "completed")}
                        className="btn btn-secondary"
                      >
                         Mark Completed
                      </button>
                    )}
                    {(b.status === "completed" || b.status === "rejected") && (
                      <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        No actions available
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

     
      {/* Notification */}
      {notification.show && (
        <div
          className={`notification ${notification.type}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="notification__body">
            <h2 className="notification__header">
              {notification.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="notification__text">{notification.message}</p>
          </div>
          <div className="notification__action">
            <button
              className="notification_button"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyManagerDashboard;
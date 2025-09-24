import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/profile.css";
import { Link } from "react-router-dom";
import profilepic from "../assets/profilepic.jpg";

function ProfilePage() {
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [acceptedQuotations, setAcceptedQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch user profile
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    if (token) {
      axios
        .get("http://localhost:5000/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, [token]);

  // Fetch orders
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setOrders(res.data))
        .catch((err) => console.error("Orders fetch error:", err));
    }
  }, [token]);

  // Fetch service requests
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/serviceRequest/my_services", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setServices(res.data))
        .catch((err) => console.error("Service fetch error:", err));
    }
  }, [token]);

  // Fetch quotations
  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5000/quotations/my_quotations", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setQuotations(res.data))
        .catch((err) => console.error("Quotation fetch error:", err));
    }
  }, [token]);

  // Fetch accepted quotations
  useEffect(() => {
    if (token) {
      axios
        .get(`http://localhost:5000/quotations/accepted`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setAcceptedQuotations(res.data))
        .catch((err) => console.error("Accepted quotations fetch error:", err));
    }
  }, [token]);

  // Fetch payment history
  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) return;

      try {
        const response = await axios.get(
          "http://localhost:5000/payments/my_payments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayments(response.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      }
    };

    fetchPayments();
  }, [token]);

  //handle quotation acception
  const handleAcceptQuotation = async (quotationId) => {
    try {
      await axios.put(
        `http://localhost:5000/quotations/${quotationId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quotation accepted successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Accept error:", error);
      alert(error.response?.data?.message || "Error accepting quotation");
    }
  };

  //handle quotation rejection
  const handleRejectQuotation = async (quotationId) => {
    try {
      await axios.put(
        `http://localhost:5000/quotations/${quotationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Quotation rejected successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Reject error:", error);
      alert(error.response?.data?.message || "Error rejecting quotation");
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-row">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-header">
              <h3>Profile Settings</h3>
            </div>
            <div className="profile-card">
              {/* Photo */}
              <div className="photo-upload-container">
                <img
                  src={
                    user.profileImageUrl
                      ? `http://localhost:5000/files/${user.profileImageUrl}`
                      : profilepic
                  }
                  alt="Profile"
                  className="photo-img"
                />
              </div>

              {/* Main Section */}
              <div className="profile-main">
                <span className="profile-name">{user.name}</span>
                <br />
                <span className="profile-email">{user.email}</span>
                <br />
                <span className="profile-email">{user.companyName}</span>
                <Link to={`/updateProfileForm/${user._id}`}>
                  <button className="btn-save">Update Profile</button>
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="tab-block">
            <ul className="tab-menu">
              {[
                "orders",
                "service-requests",
                "payments",
                "quotations",
                "accepted-quotations",
              ].map((tab) => (
                <li
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </li>
              ))}
            </ul>

            <div className="tab-content">
              {/* Orders */}
              {activeTab === "orders" && (
                <div className="tab-pane active">
                  <h3>My Orders</h3>
                  {orders.length === 0 ? (
                    <p>No orders yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Lorry Category</th>
                            <th>Lorry Type</th>
                            <th>Quantity</th>
                            <th>Payment Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id}>
                              <td>{order._id}</td>
                              <td>{order.lorryCategory?.category}</td>
                              <td>{order.lorryType?.typeName}</td>
                              <td>{order.quantity}</td>
                              <td>{order.paymentStatus}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Requests */}
              {activeTab === "service-requests" && (
                <div className="tab-pane active">
                  <h3> Service Requests</h3>
                  {services.length === 0 ? (
                    <p>No Service Requests Yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Service ID</th>
                            <th>Service Type</th>
                            <th>Lorry Number</th>
                            <th>Lorry Model</th>
                            <th>Preferred Date</th>
                            <th>Issue Description</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((service) => (
                            <tr key={service._id}>
                              <td>{service._id}</td>
                              <td>{service.serviceType}</td>
                              <td>{service.lorryNumber}</td>
                              <td>{service.lorryModel}</td>
                              <td>{service.preferredDate}</td>
                              <td>{service.issueDescription}</td>
                              <td>{service.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Payments */}
              {activeTab === "payments" && (
                <div className="tab-pane active">
                  <h3>Payment Histories</h3>
                  {payments.length === 0 ? (
                    <p>No Payments Yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Payment ID</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Uploaded</th>
                            <th>Status</th>
                            <th>Verified At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment._id}>
                              <td>{payment._id}</td>
                              <td>{payment.orderId ? "Order" : payment.serviceId ? "Service" : "N/A"}</td>
                              <td>Rs.{payment.amount}</td>
                              <td>{payment.paymentMethod}</td>
                              <td>
                                {new Date(
                                  payment.uploadedAt
                                ).toLocaleDateString()}
                              </td>
                              <td>{payment.status}</td>
                              <td>{payment.verifiedAt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Quotations */}
              {activeTab === "quotations" && (
                <div className="tab-pane active">
                  <h3>Quotations</h3>
                  {quotations.length === 0 ? (
                    <p>No Quotations Yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Quotation ID</th>
                            <th>Total Price</th>
                            <th>Valid Until</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quotations.map((quotation) => (
                            <tr key={quotation._id}>
                              <td>{quotation._id}</td>
                              <td>Rs.{quotation.totalPrice}</td>
                              <td>
                                {quotation.validUntil
                                  ? new Date(
                                      quotation.validUntil
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  {quotation.status === "Quote_Sent" && (
                                    <>
                                      <button
                                        className="btn-save"
                                        onClick={() =>
                                          handleAcceptQuotation(quotation._id)
                                        }
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="btn-save"
                                        onClick={() =>
                                          handleRejectQuotation(quotation._id)
                                        }
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Accepted Quotations */}
              {activeTab === "accepted-quotations" && (
                <div className="tab-pane active">
                  <h3>Accepted Quotations - Make Payment</h3>
                  {acceptedQuotations.length === 0 ? (
                    <p>No Accepted Quotations Yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Quotation ID</th>
                            <th>Total Amount</th>
                            <th>Valid Until</th>
                            <th>Items</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acceptedQuotations.map((acceptedQuotation) => (
                            <tr key={acceptedQuotation._id}>
                              <td>{acceptedQuotation._id}</td>
                              <td>Rs.{acceptedQuotation.totalPrice}</td>
                              <td>
                                {new Date(
                                  acceptedQuotation.validUntil
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {acceptedQuotation.items?.length > 0 && (
                                  <ul>
                                    {acceptedQuotation.items.map(
                                      (item, index) => (
                                        <li key={index}>
                                          {item.name} - {item.quantity} x $
                                          {item.price}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                              </td>

                              <td>
                                <Link to="/orderform">
                                  <button className="btn-save">
                                    Place New Order
                                  </button>
                                </Link>
                                <Link to="/services">
                                  <button className="btn-save">
                                    Request Repair/Maintenance
                                  </button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;

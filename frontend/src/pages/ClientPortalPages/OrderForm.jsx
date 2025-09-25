import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../CSS/ClientPortalCSS/form.css";
import formImg from "../../assets/formImg.jpg";

function OrderForm() {
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    address: "",
    city: "",
    lorryCategory: "",
    lorryType: "",
    quantity: "",
    additionalFeatures: "",
  });

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  const [notification, setNotification] = useState({
    show: false,
    type: "success", // success | error
    message: "",
  });

  const navigate = useNavigate();

  // Auto-hide notification after 3s
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Prefill user data from profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/client/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setFormData((prev) => ({
            ...prev,
            userId: res.data._id,
            userName: res.data.name || "",
            email: res.data.email || "",
            phoneNumber: res.data.phone || "",
            companyName: res.data.companyName || "",
          }));
        })
        .catch((err) => console.error("Error fetching user profile:", err));
    }
  }, []);

  // Fetch Lorry Categories
  useEffect(() => {
    axios
      .get("http://localhost:5000/lorryCategories/products")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch Lorry Types based on selected category
  useEffect(() => {
    if (formData.lorryCategory) {
      axios
        .get(`http://localhost:5000/lorryType/category/${formData.lorryCategory}`)
        .then((res) => setTypes(res.data))
        .catch((err) => console.error(err));
    } else {
      setTypes([]);
    }
  }, [formData.lorryCategory]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === "lorryCategory" && { lorryType: "" }), // reset type if category changes
    });
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://localhost:5000/orders/submit",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotification({
        show: true,
        type: "success",
        message: res.data.message || "Order submitted successfully!",
      });

      // Redirect to Checkout Page automatically with created order ID
      const newOrder = res.data.order;
      navigate(`/checkoutPage/order/${newOrder._id}`);

    } catch (err) {
      setNotification({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Something went wrong!",
      });
    }
  };

  return (
    <div className="Request-container">
      <div className="row">
        {/* Left Image */}
        <div className="info">
          <img src={formImg} alt="Lorry" className="form-side-image" />
        </div>

        {/* Order Form */}
        <div className="request-form">
          <h2>Place New Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                name="userName"
                placeholder="Name"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phoneNumber"
                placeholder="+94 #########"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                name="companyName"
                placeholder="ABC Company"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                name="address"
                placeholder="No.2/5B"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                name="city"
                placeholder="Colombo"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Lorry Category</label>
              <select
                name="lorryCategory"
                value={formData.lorryCategory}
                onChange={handleChange}
              >
                <option value="">Select lorry category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Lorry Type</label>
              <select
                name="lorryType"
                value={formData.lorryType}
                onChange={handleChange}
                disabled={!formData.lorryCategory}
              >
                <option value="">Select lorry type</option>
                {types.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                placeholder="50"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Additional Features</label>
              <textarea
                name="additionalFeatures"
                placeholder="Describe additional features"
                value={formData.additionalFeatures}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit">Submit & Proceed to Payment</button>
          </form>
        </div>
      </div>

      {/* Notification UI */}
      {notification.show && (
        <div
          className={`notification ${notification.type}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="notification__icon"></div>
          <div className="notification__body">
            <h2 className="notification__header">
              {notification.type === "success" ? "Success" : "Error"}
            </h2>
            <p className="notification__text">{notification.message}</p>
          </div>
          <div className="notification__action">
            <button
              className="notification_button"
              aria-label="dismiss"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderForm;

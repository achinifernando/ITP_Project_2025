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
  const [errors, setErrors] = useState({
    quantity: "",
    userName: "",
    phoneNumber: "",
    lorryCategory: "",
    lorryType: ""
  });
  const [touched, setTouched] = useState({
    quantity: false,
    userName: false,
    phoneNumber: false,
    lorryCategory: false,
    lorryType: false
  });

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

  // Validation functions
  const validateQuantity = (value) => {
    if (!value) {
      return 'Quantity is required';
    }
    
    const numValue = Number(value);
    
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      return 'Quantity must be a whole number';
    }
    
    if (numValue <= 0) {
      return 'Quantity must be greater than 0';
    }
    
    if (numValue > 1000) {
      return 'Quantity cannot exceed 1000';
    }
    
    return '';
  };

  const validateUserName = (value) => {
    if (!value?.trim()) {
      return 'Name is required';
    }
    
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    
    if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
      return 'Name can only contain letters and spaces';
    }
    
    return '';
  };

  const validatePhoneNumber = (value) => {
    if (!value?.trim()) {
      return 'Phone number is required';
    }
    
    // Sri Lankan phone number format: +94 XX XXX XXXX or 0XX XXX XXXX
    const phoneRegex = /^(\+94|0)[1-9][0-9]{8}$/;
    const cleanedPhone = value.replace(/\s+/g, '');
    
    if (!phoneRegex.test(cleanedPhone)) {
      return 'Please enter a valid Sri Lankan phone number (e.g., +94 XX XXX XXXX or 0XX XXX XXXX)';
    }
    
    return '';
  };

  const validateLorryCategory = (value) => {
    if (!value) {
      return 'Lorry category is required';
    }
    return '';
  };

  const validateLorryType = (value) => {
    if (!value) {
      return 'Lorry type is required';
    }
    return '';
  };

  // Real-time validation for specific fields
  useEffect(() => {
    if (touched.quantity) {
      const quantityError = validateQuantity(formData.quantity);
      setErrors(prev => ({ ...prev, quantity: quantityError }));
    }
    
    if (touched.userName) {
      const userNameError = validateUserName(formData.userName);
      setErrors(prev => ({ ...prev, userName: userNameError }));
    }
    
    if (touched.phoneNumber) {
      const phoneError = validatePhoneNumber(formData.phoneNumber);
      setErrors(prev => ({ ...prev, phoneNumber: phoneError }));
    }
    
    if (touched.lorryCategory) {
      const categoryError = validateLorryCategory(formData.lorryCategory);
      setErrors(prev => ({ ...prev, lorryCategory: categoryError }));
    }
    
    if (touched.lorryType) {
      const typeError = validateLorryType(formData.lorryType);
      setErrors(prev => ({ ...prev, lorryType: typeError }));
    }
  }, [formData, touched]);

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

    // Mark field as touched when user starts typing
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
  };

  // Handle blur events for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Form validation before submission
  const validateForm = () => {
    const newErrors = {
      quantity: validateQuantity(formData.quantity),
      userName: validateUserName(formData.userName),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      lorryCategory: validateLorryCategory(formData.lorryCategory),
      lorryType: validateLorryType(formData.lorryType)
    };

    setErrors(newErrors);
    setTouched({
      quantity: true,
      userName: true,
      phoneNumber: true,
      lorryCategory: true,
      lorryType: true
    });

    return !Object.values(newErrors).some(error => error !== '');
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setNotification({
        show: true,
        type: "error",
        message: "Please fix the validation errors before submitting",
      });
      return;
    }

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
              <label>Name *</label>
              <input
                name="userName"
                placeholder="Name"
                value={formData.userName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.userName ? 'error' : ''}
              />
              {errors.userName && (
                <div className="error-message">{errors.userName}</div>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                name="phoneNumber"
                placeholder="+94 XX XXX XXXX or 0XX XXX XXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && (
                <div className="error-message">{errors.phoneNumber}</div>
              )}
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
              <label>Lorry Category *</label>
              <select
                name="lorryCategory"
                value={formData.lorryCategory}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.lorryCategory ? 'error' : ''}
              >
                <option value="">Select lorry category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.category}
                  </option>
                ))}
              </select>
              {errors.lorryCategory && (
                <div className="error-message">{errors.lorryCategory}</div>
              )}
            </div>

            <div className="form-group">
              <label>Lorry Type *</label>
              <select
                name="lorryType"
                value={formData.lorryType}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!formData.lorryCategory}
                className={errors.lorryType ? 'error' : ''}
              >
                <option value="">Select lorry type</option>
                {types.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.typeName}
                  </option>
                ))}
              </select>
              {errors.lorryType && (
                <div className="error-message">{errors.lorryType}</div>
              )}
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                placeholder="50"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                max="1000"
                step="1"
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && (
                <div className="error-message">{errors.quantity}</div>
              )}
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
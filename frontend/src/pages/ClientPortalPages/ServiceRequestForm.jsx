import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../CSS/ClientPortalCSS/form.css"; 
import formImg2 from '../../assets/formImg2.jpg';

function RepairMaintenanceForm() {
  const [formData, setFormData] = useState({
    userId: "",
    userName: "",
    phoneNumber: "",
    email: "",
    companyName: "",
    address: "",
    city: "",
    lorryModel: "",
    lorryNumber: "",
    serviceType: "",
    issueDescription: "",
    preferredDate: ""
  });

  const [models, setModels] = useState([]);
  const [services, setServices] = useState([]);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({
    lorryNumber: "",
    preferredDate: ""
  });
  const [isCheckingLorry, setIsCheckingLorry] = useState(false);
  const [minDate, setMinDate] = useState("");

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: ""
  });

  const navigate = useNavigate();

  // Set minimum date to tomorrow on component mount
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formattedDate = tomorrow.toISOString().split('T')[0];
    setMinDate(formattedDate);
  }, []);

  // Auto-hide notification after 3s
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch logged-in user details
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

  // Fetch available services
  useEffect(() => {
    axios.get("http://localhost:5000/service/getServices")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch models
  useEffect(() => {
    axios
      .get(`http://localhost:5000/lorryBrands/models`)
      .then((res) => setModels(res.data))
      .catch(console.error);
  }, []);

  // Lorry Number Validation Function
  const validateLorryNumber = (value) => {
    if (!value) {
      return 'Lorry number is required';
    }
    
    // Sri Lankan lorry number format: LL-NNNN 
    const lorryNumberRegex = /^L[A-Z]-[0-9]{4}$/;
    if (!lorryNumberRegex.test(value)) {
      return 'Lorry number must be in format LL-NNNN  (e.g., LP-1234)';
    }
    
    return '';
  };

  // Date Validation Function
  const validateDate = (value) => {
    if (!value) {
      return ''; // Date is optional, no error if empty
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison

    if (selectedDate < today) {
      return 'Preferred date cannot be in the past';
    }

    // Optional: Set maximum date (e.g., 1 year from now)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    if (selectedDate > maxDate) {
      return 'Preferred date cannot be more than 1 year from now';
    }

    return '';
  };

  // Debounced validation for lorry number
  const debouncedLorryCheck = React.useCallback(
    debounce(async (lorryNumber) => {
      if (!lorryNumber) return;
      
      const frontendError = validateLorryNumber(lorryNumber);
      if (frontendError) {
        setErrors(prev => ({ ...prev, lorryNumber: frontendError }));
        return;
      }

      // Backend validation (check uniqueness or additional validation)
      setIsCheckingLorry(true);
      try {
        const response = await axios.get(`http://localhost:5000/serviceRequest/check-lorry/${lorryNumber}`);
        
        if (response.data.exists) {
          setErrors(prev => ({ ...prev, lorryNumber: 'This lorry number is already registered' }));
        } else {
          setErrors(prev => ({ ...prev, lorryNumber: '' }));
        }
      } catch (error) {
        console.error('Lorry validation error:', error);
        // Don't show error for server issues, rely on frontend validation
      } finally {
        setIsCheckingLorry(false);
      }
    }, 1000),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lorryNumber') {
      const upperValue = value.toUpperCase();
      setFormData(prev => ({ ...prev, [name]: upperValue }));
      
      // Real-time frontend validation
      const error = validateLorryNumber(upperValue);
      setErrors(prev => ({ ...prev, lorryNumber: error }));
      
      // Debounced backend validation
      if (!error) {
        debouncedLorryCheck(upperValue);
      }
    } else if (name === 'preferredDate') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Validate date in real-time
      const dateError = validateDate(value);
      setErrors(prev => ({ ...prev, preferredDate: dateError }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Simple debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Handle multiple images
  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  // Form validation before submission
  const validateForm = () => {
    const lorryError = validateLorryNumber(formData.lorryNumber);
    const dateError = validateDate(formData.preferredDate);

    if (lorryError) {
      setErrors(prev => ({ ...prev, lorryNumber: lorryError }));
      return false;
    }

    if (dateError) {
      setErrors(prev => ({ ...prev, preferredDate: dateError }));
      return false;
    }

    // Add other field validations as needed
    if (!formData.userName.trim()) {
      setNotification({
        show: true,
        type: "error",
        message: "Name is required"
      });
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      setNotification({
        show: true,
        type: "error",
        message: "Phone number is required"
      });
      return false;
    }

    if (!formData.serviceType) {
      setNotification({
        show: true,
        type: "error",
        message: "Service type is required"
      });
      return false;
    }

    return true;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const sendData = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    const token = localStorage.getItem("token");

    const data = new FormData();
    // Append text fields
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    // Append multiple images
    images.forEach(img => {
      data.append("image", img);
    });

    axios.post("http://localhost:5000/serviceRequest/submit", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        // Redirect to payment page
        const newServiceRequest = res.data.request;
        navigate(`/checkoutPage/service/${newServiceRequest._id}`);

        setNotification({
          show: true,
          type: "success",
          message: res.data.message || "Service request submitted successfully!",
        });
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Something went wrong!";
        
        setNotification({
          show: true,
          type: "error",
          message: errorMessage,
        });
      });
  };

  return (
    <>
      <div className="Request-container">
        <div className="row">
          <div className="info">
            <img src={formImg2} alt="Lorry" className="form-side-image" />
          </div>

          <div className="request-form">
            <h2>Request Repair/Maintenance</h2>
            <form onSubmit={sendData}>

              <div className="form-group">
                <label>Name</label>
                <input 
                  name="userName" 
                  placeholder="John Kris" 
                  value={formData.userName} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  name="phoneNumber" 
                  placeholder="+94 #########" 
                  value={formData.phoneNumber} 
                  onChange={handleChange} 
                  required 
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

              {/* Lorry Number with Validation */}
              <div className="form-group">
                <label>Lorry Body Number *</label>
                <input 
                  name="lorryNumber" 
                  placeholder="LP-1234 or CAB-5678" 
                  value={formData.lorryNumber} 
                  onChange={handleChange}
                  className={errors.lorryNumber ? 'error' : ''}
                  required
                />
                {isCheckingLorry && (
                  <div className="checking-message">Checking lorry number...</div>
                )}
                {errors.lorryNumber && (
                  <div className="error-message">{errors.lorryNumber}</div>
                )}
              </div>

              <div className="form-group">
                <label>Lorry Model</label>
                <select name="lorryModel" value={formData.lorryModel} onChange={handleChange}>
                  <option value="">Select lorry model</option>
                  {models.map((m) => (
                    <option key={m._id} value={m._id}>{m.model}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Service Type *</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange} required>
                  <option value="">Select Service Type</option>
                  {services.map((service) => (
                    <option key={service._id} value={service.serviceType}>
                      {service.serviceType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Issue</label>
                <textarea 
                  name="issueDescription" 
                  placeholder="Describe the issue" 
                  value={formData.issueDescription} 
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Preferred Date with Validation */}
              <div className={`form-group ${errors.preferredDate ? 'error' : ''}`}>
                <label>Preferred Date</label>
                <input 
                  type="date" 
                  name="preferredDate" 
                  value={formData.preferredDate} 
                  onChange={handleChange}
                  min={minDate}
                  className={errors.preferredDate ? 'error-input' : ''}
                />
                {errors.preferredDate && (
                  <div className="error-message">{errors.preferredDate}</div>
                )}
                {formData.preferredDate && !errors.preferredDate && (
                  <div className="date-preview">
                    Selected: <strong>{formatDate(formData.preferredDate)}</strong>
                  </div>
                )}
                <div className="input-hint">
                  Please select a date from tomorrow onwards
                </div>
              </div>

              {/* Multiple Images Upload */}
              <div className="form-group">
                <label>Upload truck body images (max 10)</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </div>

              <button 
                type="submit" 
                disabled={Object.values(errors).some(error => error !== '')}
              >
                Submit & Proceed to Payment
              </button>

            </form>
          </div>
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
    </>
  );
}

export default RepairMaintenanceForm;

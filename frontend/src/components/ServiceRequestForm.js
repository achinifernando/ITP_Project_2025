import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../CSS/form.css"; 
import formImg2 from '../assets/formImg2.jpg';

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
  const [images, setImages] = useState([]); // store multiple images

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: ""
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle multiple images
  const handleImageChange = (e) => {
    setImages([...e.target.files]); // store all selected files
  };

  const sendData = (e) => {
    e.preventDefault();
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
        setNotification({
          show: true,
          type: "error",
          message: err.response?.data?.message || "Something went wrong!",
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
                <input name="userName" placeholder="John Kris" value={formData.userName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input name="phoneNumber" placeholder="+94 #########" value={formData.phoneNumber} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input name="companyName" placeholder="ABC Company" value={formData.companyName} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input name="address" placeholder="No.2/5B" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>City</label>
                <input name="city" placeholder="Colombo" value={formData.city} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Lorry Number</label>
                <input name="lorryNumber" placeholder="WP_xxxxxxx" value={formData.lorryNumber} onChange={handleChange} />
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
                <label>Service Type</label>
                <select name="serviceType" value={formData.serviceType} onChange={handleChange}>
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
                <textarea name="issueDescription" placeholder="Describe the issue" value={formData.issueDescription} onChange={handleChange}></textarea>
              </div>

              <div className="form-group">
                <label>Preferred Date</label>
                <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} />
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

              <button type="submit">Submit & Proceed to Payment</button>

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

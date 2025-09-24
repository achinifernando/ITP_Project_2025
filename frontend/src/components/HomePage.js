import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/home.css";
import homeImg from "../assets/homeImg2.jpg";
import { Link } from "react-router-dom";

function HomePage() {
  const [formData, setFormData] = useState({
    clientId: "",
    lorryModel: "",
    lorryCategory: "",
    lorryType: "",
    quantity: "",
    customFeatures: "",
    expectedDeliveryDate: "",
  });

  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [models, setModels] = useState([]);

  const [notification, setNotification] = useState({
    show: false,
    type: "success", // success | error
    message: "",
  });

  // Auto-hide notification after 3s
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch user profile to get userId
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/client/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) =>
        setFormData((prev) => ({ ...prev, clientId: res.data._id }))
      )
      .catch((err) => console.error("Error fetching user profile:", err));
  }, []);

  // Fetch lorry categories
  useEffect(() => {
    axios
      .get("http://localhost:5000/lorryCategories/products")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch lorry types whenever a category is selected
  useEffect(() => {
    if (!formData.lorryCategory) return setTypes([]);

    axios
      .get(`http://localhost:5000/lorryType/category/${formData.lorryCategory}`)
      .then((res) => setTypes(res.data))
      .catch((err) => console.error(err));
  }, [formData.lorryCategory]);

  // Fetch models
    useEffect(() => {
      axios
        .get(`http://localhost:5000/lorryBrands/models`)
        .then((res) => setModels(res.data))
        .catch(console.error);
    }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "lorryCategory" && { lorryType: "" }), // reset type on category change
    }));
  };

 
  const sendData = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    axios
      .post("http://localhost:5000/quotationRequest/submit", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setNotification({
          show: true,
          type: "success",
          message: res.data.message || "Quotation submitted successfully!",
        });

        setFormData({
          clientId: formData.clientId,
          lorryModel: "",
    lorryCategory: "",
    lorryType: "",
    quantity: "",
    customFeatures: "",
    expectedDeliveryDate: "",
        });
        setTypes([]);
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
      {/* Hero Section */}
      <div className="home-hero-section">
        <div className="home-hero-container">
          <h1 className="home-hero-title">Nimal Engineering Works</h1>
          <p className="home-hero-subtitle">
            The foremost pioneer in Sri Lanka, specializing in the design &
            manufacturing of top-quality full and half lorry bodies with the best
            Japanese technology.
          </p>
              <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">22</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">25+</span>
                <span className="stat-label">Expert Team</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
            </div>
        </div>

      </div>

          {/* Services Grid */}
      <section className="services-grid">
        <div className="container">
          <div className="grid-4">
            <div className="service-card primary">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.25V12h2v15.25c5.16-.51 9-4.7 9-10.25V7L12 2z"/>
                </svg>
              </div>
              <h3>Body Building</h3>
              <p>Complete truck body manufacturing with precision engineering</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Premium Quality</h3>
              <p>Japanese technology ensuring top quality standards</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3>Warranty</h3>
              <p>5 years comprehensive warranty on all our products</p>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>On-Time Delivery</h3>
              <p>Reliable delivery schedules you can count on</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <div className="section-badge">About Us</div>
              <h2>Why Choose Us?</h2>
              <p>
                With over 22 years of experience in truck body manufacturing, we've established 
                ourselves as Sri Lanka's leading experts in the field. Our commitment to quality 
                and innovation sets us apart.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="check-icon">✓</span>
                  Expert Team of 25+ Professionals
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  Japanese Technology Integration
                </li>
                <li>
                  <span className="check-icon">✓</span>
                  100+ Successful Projects
                </li>
              </ul>
              <button className="cta-button">Learn More</button>
            </div>
            <div className="about-image">
              <img src={homeImg} alt="About Us" />
              <div className="experience-badge">
                <span className="badge-number">20+</span>
                <span className="badge-text">Years Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header-center">
            <h2>We Provide The Best Services</h2>
          </div>
          <div className="services-grid-3">
            <div className="service-box">
              <div className="service-number">01</div>
              <h3>Body Modifications</h3>
              <p>Customize your truck body according to your specific requirements with our expert modification services.</p>
              <a href="#" className="service-link">Learn More</a>
            </div>
            <div className="service-box featured">
              <div className="service-number">02</div>
              <h3>Complete Manufacturing</h3>
              <p>End-to-end truck body manufacturing with precision engineering and quality materials.</p>
              <a href="#" className="service-link">Learn More</a>
            </div>
            <div className="service-box">
              <div className="service-number">03</div>
              <h3>Repair Services</h3>
              <p>Professional repair and maintenance services to keep your trucks running at peak performance.</p>
              <a href="#" className="service-link">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      
      {/* Process Section */}
      <section className="process-section">
        <div className="container">
          <div className="section-header-center">
            <h2>Our Working Process</h2>
          </div>
          <div className="process-grid">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Consultation</h3>
              <p>We discuss your requirements and provide expert recommendations for your truck body needs.</p>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Design & Planning</h3>
              <p>Our team creates detailed designs and manufacturing plans tailored to your specifications.</p>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Manufacturing</h3>
              <p>Precision manufacturing using the latest Japanese technology and quality materials.</p>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Quality Check & Delivery</h3>
              <p>Thorough quality inspection followed by timely delivery and installation support.</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* Quote Form Section */}
      <section className="quote-section">
        <div className="quote-container">
          <div className="quote-grid">
            <div className="quote-content">
              <h2>Security Solutions for Your Truck</h2>
              <p>
                Get a customized quote for your truck body manufacturing needs.
                Our experts will provide you with the best solution.
              </p>

          </div>
            </div>
            <div className="quote-form-container">
              <form onSubmit={sendData} className="quote-form">

                <div className="form-raw">
                  <label>Lorry Model</label>
                  <select name="lorryModel" value={formData.lorryModel} onChange={handleChange} >
        <option value="">Select lorry model</option>
        {models.map((m) => (
          <option key={m._id} value={m._id}>{m.model}</option>
        ))}
      </select>
                </div>

                <div className="form-raw">
                  <label>Lorry Category</label>
                  <select name="lorryCategory" value={formData.lorryCategory} onChange={handleChange} >
                    <option value="">Select lorry category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-raw">
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

                <div className="form-raw">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="50"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-raw">
                  <label>Custom Features</label>
                  <textarea
                    name="customFeatures"
                    placeholder="Describe additional features"
                    value={formData.customFeatures}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-raw">
                  <label>Expected Delivery Date</label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="form-submit">
                  Get Quote Now
                </button>
              </form>
            </div>
          </div>
       
      </section>

      {/* Book Meeting Section */}
<section className="booking-section">
  <div className="booking-container">
    <div className="booking-grid">
      <div className="booking-content">
        <h2>Ready to Get Started?</h2>
        <p>
          Book a consultation with our expert team to discuss your truck body 
          manufacturing needs. We'll provide personalized recommendations and 
          detailed project planning.
        </p>
        
        <ul className="booking-features">
          <li>
            <span className="feature-icon">✓</span>
            Free Consultation & Project Assessment
          </li>
          <li>
            <span className="feature-icon">✓</span>
            Expert Technical Recommendations
          </li>
          <li>
            <span className="feature-icon">✓</span>
            Detailed Cost Estimation
          </li>
          <li>
            <span className="feature-icon">✓</span>
            Timeline & Delivery Planning
          </li>
        </ul>

        
      </div>

      <div className="booking-cta">
        <h3>Schedule Your Meeting</h3>
        <p>
          Connect with our team to discuss your requirements and get 
          professional guidance for your project.
        </p>
        
        <Link to="/schedule-meeting" className="book-meeting-btn">
          Book Meeting Now
        </Link>
        
        </div>
    </div>
  </div>
</section>



      {/* quotation generator */}
      <Link to={`/companyManagerDashbord`}>
      <button className="book-meeting-btn">CompanyManagerDashbord</button></Link>

  
      



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
    </>
  );
}

export default HomePage;

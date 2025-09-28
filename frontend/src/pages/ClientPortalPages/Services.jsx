// ServicesPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../CSS/ClientPortalCSS/services.css";
import { Link } from "react-router-dom";

export default function ServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/service/getServices") 
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="service-hero-section">
        <div className="service-hero-container">
          <h1 className="service-hero-title">Our Services</h1>
          <p className="service-hero-subtitle">Our engineering - Your solution</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="carousel">
        {services.length > 0 ? (
          services.map((service) => (
            <article key={service._id} className="service-card">
              <img
                className="card-image"
                src={`http://localhost:5000/files/${service.image}`} 
                alt={service.serviceType}
              />
              <h2>{service.serviceType}</h2>
              <div>
                <p>{service.description}</p>
                
              </div>
            </article>
          ))
        ) : (
          <p className="no-data">No services found.</p>
        )}
      </div>
      <Link to={"/requestform"}>
        <button className="service-btn">Request Repair/Maintenance</button>
      </Link>
    </>
  );
}

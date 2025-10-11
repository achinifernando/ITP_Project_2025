// src/components/ServiceDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; // ✅ keep axiosInstance


export default function ServiceDetails() {
  const { id } = useParams(); // matches Route path "services/:id"
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await axiosInstance.get(`http://localhost:5000/admin-services/${id}`);
        setService(res.data);
      } catch (err) {
        console.error("ServiceDetails fetch error:", err.response || err.message || err);
  
        // Display more detailed error info on the screen
        const errorDetails =
          JSON.stringify(err.response?.data || err.message || err, null, 2);

          setErrorMsg(`Error fetching service: ${errorDetails}`);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <p>Loading service details...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <p className="text-danger mb-3">{errorMsg}</p>
          <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <p>Service not found.</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ background: "linear-gradient(135deg, #f9fbff, #eef6ff)" }}>
      <div className="container">
        <button className="btn btn-outline-primary mb-4" onClick={() => navigate(-1)}>← Back</button>

        <div className="service-details-card shadow-lg rounded-4 p-4 bg-white mx-auto" style={{ maxWidth: 800 }}>
          {service.image && (
            <div className="mb-4 text-center">
              <img
                src={`http://localhost:5000/files/${service.image}`}
                alt={service.serviceType}
                className="img-fluid rounded-3"
                style={{ maxHeight: 360, objectFit: "cover" }}
              />
            </div>
          )}

          <h2 className="fw-bold mb-3 text-center">{service.serviceType}</h2>

          <p className="text-muted mb-4" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
            {service.description}
          </p>

          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-primary" onClick={() => navigate(`/service/update/${service._id}`)}>Edit Service</button>
          </div>
        </div>
      </div>

      <style>{`
        .service-details-card img { transition: transform 0.35s ease; }
        .service-details-card img:hover { transform: scale(1.03); }
      `}</style>
    </div>
  );
}

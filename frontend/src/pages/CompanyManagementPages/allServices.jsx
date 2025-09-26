// src/components/AllServices.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AllServices() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    axiosInstance
      .get("http://localhost:5000/admin-services/")
      .then((res) => setServices(res.data))
      .catch((err) => alert(err.message));
  };

  const deleteService = (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      axiosInstance
        .delete(`http://localhost:5000/admin-services/delete/${id}`)
        .then(() => {
          alert("Service deleted");
          fetchServices();
        })
        .catch((err) => alert(err.message));
    }
  };

  const updateService = (id) => {
    window.location.href = `/admin-services/update/${id}`;
  };

  const addService = () => {
    window.location.href = "/admin-services/add"; // 👈 navigate to AddService.js
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>All Services</h1>
        <button className="btn btn-success" onClick={addService}>
          + Add Service
        </button>
      </div>

      <div className="row">
        {services.length === 0 && <p>No services found</p>}

        {services.map((srv) => (
          <div key={srv._id} className="col-md-4 mb-3">
            <div className="card">
              {srv.image && (
                <img
                  src={`http://localhost:5000/files/${srv.image}`}
                  className="card-img-top"
                  alt={srv.serviceType}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{srv.serviceType}</h5>
                <p className="card-text">{srv.description}</p>

                <button
                  className="btn btn-primary me-2"
                  onClick={() => updateService(srv._id)}
                >
                  Update
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteService(srv._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

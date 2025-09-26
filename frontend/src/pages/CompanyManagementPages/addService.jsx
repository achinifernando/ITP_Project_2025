// src/components/AddService.js
import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AddService() {
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("serviceType", serviceType);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      await axiosInstance.post("http://localhost:5000/admin-services/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Service added successfully");
      window.location.href = "/services"; // redirect to AllServices
    } catch (err) {
      alert("Error adding service: " + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Add Service</h1>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Service Type</label>
          <input
            type="text"
            className="form-control"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Save Service
        </button>
      </form>
    </div>
  );
}

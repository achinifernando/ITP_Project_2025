import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Image } from "react-bootstrap-icons";

export default function UpdateService() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Load service details
  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5000/admin-services/${id}`)
      .then((res) => {
        setServiceType(res.data.serviceType);
        setDescription(res.data.description);
        if (res.data.image) {
          const fullUrl =
            res.data.image.startsWith("http")
              ? res.data.image
              : `http://localhost:5000/files/${res.data.image}`;
          setPreview(fullUrl);
        }
      })
      .catch((err) => alert(err.response?.data?.message || err.message));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("serviceType", serviceType);
      formData.append("description", description);
      if (image) formData.append("image", image);

      await axiosInstance.put(`http://localhost:5000/admin-services/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Service updated successfully!");
      navigate(`/service/update/${id}`); // stay on same page
      if (image) setPreview(URL.createObjectURL(image)); // update preview immediately
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "#e8e8e8", padding: "20px" }}
    >
      <div
        className="bg-white shadow-lg p-5"
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "25px",
          borderLeft: "6px solid #4facfe",
        }}
      >
        <h2 className="fw-bold text-center mb-5" style={{ color: "#2c3e50" }}>
          Update Service
        </h2>

        <form onSubmit={handleUpdate} className="row g-5">
          {/* Left Side - Inputs */}
          <div className="col-md-6">
            <div className="mb-4">
              <label className="fw-semibold mb-2">Service Type</label>
              <input
                type="text"
                className="form-control p-3 rounded-3"
                placeholder="Enter service type"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="fw-semibold mb-2">Description</label>
              <textarea
                rows="6"
                className="form-control p-3 rounded-3"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn fw-semibold text-white rounded-3 p-3"
                style={{
                  background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                  border: "none",
                }}
              >
                Update Service
              </button>
            </div>
          </div>

          {/* Right Side - Image Upload */}
          <div className="col-md-6">
            <div
              className="border rounded-4 p-4 text-center h-100 d-flex flex-column justify-content-center"
              style={{
                border: "2px dashed #ced4da",
                backgroundColor: "#fdfdfd",
                cursor: "pointer",
                minHeight: "300px",
                transition: "0.3s",
              }}
              onClick={() => document.getElementById("imageInput").click()}
              onMouseOver={(e) =>
                (e.currentTarget.style.border = "2px dashed #4facfe")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.border = "2px dashed #ced4da")
              }
            >
              {!preview ? (
                <>
                  <Image size={52} className="mb-3 text-secondary" />
                  <p className="mb-1 fw-semibold">
                    Drop your image here, or{" "}
                    <span className="text-primary">Click to browse</span>
                  </p>
                  <p className="small text-muted">
                    Supported formats: JPG, PNG. Max 5MB
                  </p>
                </>
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="img-fluid rounded-3 shadow-sm"
                  style={{ maxHeight: "220px", objectFit: "contain" }}
                />
              )}

              <input
                type="file"
                id="imageInput"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

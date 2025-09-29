import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Image } from "react-bootstrap-icons";

export default function AddCategory() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const sendData = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("image", image);

    axiosInstance
      .post("http://localhost:5000/admin-categories/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => alert("Category Added"))
      .catch((err) => alert("Error: " + err.message));
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#e8e8e8", // full window ash color
        padding: "20px",
      }}
    >
      {/* White Rounded Container */}
      <div
        className="bg-white shadow-lg p-5"
        style={{
          width: "100%",
          maxWidth: "900px",
          borderRadius: "25px", // fully rounded corners
          borderLeft: "6px solid #007bff",
        }}
      >
        {/* Title */}
        <h2
          className="fw-bold text-center mb-5"
          style={{ color: "#2c3e50", fontSize: "1.8rem" }}
        >
          Add New Lorry Category
        </h2>

        <form onSubmit={sendData} className="row g-5">
          {/* Left side - Inputs */}
          <div className="col-md-6">
            <div className="mb-4">
              <label htmlFor="category" className="fw-semibold mb-2">
                Category
              </label>
              <input
                type="text"
                id="category"
                className="form-control p-3 rounded-3"
                placeholder="Enter category"
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="fw-semibold mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows="6"
                className="form-control p-3 rounded-3"
                placeholder="Enter description"
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn fw-semibold text-white rounded-3 p-3"
                style={{
                  background: "linear-gradient(90deg, #007bff, #00c6ff)",
                  border: "none",
                  transition: "0.3s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(90deg, #0056b3, #0088cc)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background =
                    "linear-gradient(90deg, #007bff, #00c6ff)")
                }
              >
                + Add Category
              </button>
            </div>
          </div>

          {/* Right side - Image Upload */}
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
                (e.currentTarget.style.border = "2px dashed #007bff")
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

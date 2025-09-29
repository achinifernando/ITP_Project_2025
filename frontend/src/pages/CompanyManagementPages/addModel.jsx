// src/components/AddModel.js
import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AddModel() {
  const [model, setModel] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("http://localhost:5000/admin-lorry-models/add", { model });
      alert("Model added successfully");
      window.location.href = "/models"; // redirect to AllModels
    } catch (err) {
      alert("Error adding model: " + err.message);
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
          maxWidth: "600px",
          borderRadius: "25px",
          borderLeft: "6px solid #4facfe",
        }}
      >
        <h2
          className="fw-bold text-center mb-5"
          style={{ color: "#2c3e50", fontSize: "1.8rem" }}
        >
          Add New Lorry Model
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="modelName" className="fw-semibold mb-2">
              Model Name
            </label>
            <input
              type="text"
              id="modelName"
              className="form-control p-3 rounded-3"
              placeholder="Enter model name"
              value={model}
              onChange={(e) => setModel(e.target.value)}
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
                transition: "0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(90deg, #0096ff, #00d4ff)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  "linear-gradient(90deg, #4facfe, #00f2fe)")
              }
            >
              + Add Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

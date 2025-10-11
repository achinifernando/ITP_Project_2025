import React, { useState, useEffect } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function UpdateModel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modelName, setModelName] = useState("");

  // Load existing model details
  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5000/admin-lorry-models/${id}`)
      .then((res) => {
        setModelName(res.data.model);
      })
      .catch((err) => alert(err.response?.data?.message || err.message));
  }, [id]);

  // Handle model update
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`http://localhost:5000/admin-lorry-models/update/${id}`, { model: modelName });
      alert("Model updated successfully!");
      navigate("/models"); // Redirect to all models page
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
          maxWidth: "600px",
          borderRadius: "25px",
          borderLeft: "6px solid #4facfe",
        }}
      >
        <h2 className="fw-bold text-center mb-5" style={{ color: "#2c3e50" }}>
          Update Lorry Model
        </h2>

        <form onSubmit={handleUpdate}>
          <div className="mb-4">
            <label className="fw-semibold mb-2">Model Name</label>
            <input
              type="text"
              className="form-control p-3 rounded-3"
              placeholder="Enter model name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
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
              Update Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// src/components/AllModels.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function AllModels() {
  const navigate = useNavigate(); 
  const [models, setModels] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = () => {
    axiosInstance
      .get("http://localhost:5000/admin-lorry-models/")
      .then((res) => setModels(res.data))
      .catch((err) => alert(err.message));
  };

  const deleteModel = (id) => {
  if (window.confirm("Are you sure you want to delete this model?")) {
    axiosInstance
      .delete(`http://localhost:5000/admin-lorry-models/delete/${id}`)
      .then(() => {
        alert("Model deleted");
        fetchModels();
      })
      .catch((err) => alert(err.response?.data?.message || err.message));
  }
};


  const updateModel = (id) => {
    navigate(`/update-model/${id}`);
  };

  const addModel = () => {
    window.location.href = "/model/add";
  };

  // Filter models based on search term
  const filteredModels = models.filter((m) =>
    m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-vh-100 py-5"
      style={{ background: "linear-gradient(135deg, #f2f2f2, #e0e0e0)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold display-6" style={{ color: "#222" }}>
            All Lorry Models
          </h1>
          <button
            className="btn btn-primary rounded-pill px-4 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              border: "none",
            }}
            onClick={addModel}
          >
            + Add Model
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "12px",
              border: "1px solid #ccc",
              width: "100%",
              maxWidth: "400px",
            }}
          />
        </div>

        {/* Models Grid */}
        <div className="row g-4 justify-content-center">
          {filteredModels.length === 0 && <p className="text-dark">No models found</p>}

          {filteredModels.map((m) => (
            <div key={m._id} className="col-md-4 mb-4">
              <div className="model-card p-4 rounded-4 shadow-sm bg-white position-relative">
                <h5 className="fw-bold mb-2">{m.model}</h5>
                {m.description && (
                  <p className="text-muted mb-3" style={{ fontSize: "0.95rem" }}>
                    {m.description.length > 60
                      ? m.description.substring(0, 60) + "..."
                      : m.description}
                  </p>
                )}
                <div className="d-flex gap-2">
                  <button
                    className="icon-btn"
                    onClick={() => updateModel(m._id)}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-btn"
                    onClick={() => deleteModel(m._id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style>
        {`
          .model-card {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 150px;
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
          }

          .model-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
          }

          .icon-btn {
            background: #f0f0f0;
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .icon-btn:hover {
            background: linear-gradient(90deg, #4facfe, #00f2fe);
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
        `}
      </style>
    </div>
  );
}

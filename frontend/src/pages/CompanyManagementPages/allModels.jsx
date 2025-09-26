// src/components/AllModels.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AllModels() {
  const [models, setModels] = useState([]);

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
        .delete(`http://localhost:5000/admin-models/delete/${id}`)
        .then(() => {
          alert("Model deleted");
          fetchModels();
        })
        .catch((err) => alert(err.message));
    }
  };

  const updateModel = (id) => {
    window.location.href = `/update-model/${id}`;
  };

  const addModel = () => {
    window.location.href = "/model/add"; // 👈 new AddModel page
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>All Models</h1>
        <button className="btn btn-success" onClick={addModel}>
          + Add Model
        </button>
      </div>

      <div className="row">
        {models.length === 0 && <p>No models found</p>}

        {models.map((m) => (
          <div key={m._id} className="col-md-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{m.model}</h5>

                <button
                  className="btn btn-primary me-2"
                  onClick={() => updateModel(m._id)}
                >
                  Update
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteModel(m._id)}
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

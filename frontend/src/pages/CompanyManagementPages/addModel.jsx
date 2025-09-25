// src/components/AddModel.js
import React, { useState } from "react";
import axios from "axios";

export default function AddModel() {
  const [model, setModel] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/admin-lorrryModel/add", { model });
      alert("Model added successfully");
      window.location.href = "/models"; // redirect to AllModels
    } catch (err) {
      alert("Error adding model: " + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h1>Add Model</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Model Name</label>
          <input
            type="text"
            className="form-control"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-success">
          Save Model
        </button>
      </form>
    </div>
  );
}

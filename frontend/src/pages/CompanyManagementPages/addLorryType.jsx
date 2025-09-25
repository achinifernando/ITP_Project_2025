import React, { useState } from "react";
import axios from "axios";

export default function AddLorryType() {
  const [typeName, setTypeName] = useState("");
  const [frontEnd, setFrontEnd] = useState("");
  const [subFrame, setSubFrame] = useState("");
  const [rearFrame, setRearFrame] = useState("");
  const [bumper, setBumper] = useState("");
  const [door, setDoor] = useState("");
  const [roof, setRoof] = useState("");
  const [floor, setFloor] = useState("");
  const [wallConstuction, setWallConstuction] = useState("");
  const [images, setImages] = useState([]);

  const handleFileChange = (e) => {
    setImages(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("typeName", typeName);
    formData.append("frontEnd", frontEnd);
    formData.append("subFrame", subFrame);
    formData.append("rearFrame", rearFrame);
    formData.append("bumper", bumper);
    formData.append("door", door);
    formData.append("roof", roof);
    formData.append("floor", floor);
    formData.append("wallConstuction", wallConstuction);

    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }

    try {
      await axios.post("http://localhost:5000/admin-lorryType/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Lorry type added successfully");
      window.location.href = "/lorry-types";
    } catch (err) {
      alert("Error adding: " + err.message);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Add Lorry Type</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        
        <div className="mb-3">
          <label className="form-label">Type Name</label>
          <input
            type="text"
            className="form-control"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Front End</label>
          <input
            type="text"
            className="form-control"
            value={frontEnd}
            onChange={(e) => setFrontEnd(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Sub Frame</label>
          <input
            type="text"
            className="form-control"
            value={subFrame}
            onChange={(e) => setSubFrame(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Rear Frame</label>
          <input
            type="text"
            className="form-control"
            value={rearFrame}
            onChange={(e) => setRearFrame(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Bumper</label>
          <input
            type="text"
            className="form-control"
            value={bumper}
            onChange={(e) => setBumper(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Door</label>
          <input
            type="text"
            className="form-control"
            value={door}
            onChange={(e) => setDoor(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Roof</label>
          <input
            type="text"
            className="form-control"
            value={roof}
            onChange={(e) => setRoof(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Floor</label>
          <input
            type="text"
            className="form-control"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Wall Construction</label>
          <input
            type="text"
            className="form-control"
            value={wallConstuction}
            onChange={(e) => setWallConstuction(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Images</label>
          <input
            type="file"
            className="form-control"
            multiple
            onChange={handleFileChange}
          />
        </div>

        <button type="submit" className="btn btn-success">
          Save
        </button>
      </form>
    </div>
  );
}

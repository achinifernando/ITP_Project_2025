import React, { useState, useEffect } from "react";
import axios from "axios";
import { Image } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

export default function AddLorryType() {
  const [categories, setCategories] = useState([]); // array of category objects
  const [category, setCategory] = useState(""); // string storing selected _id
  const [typeName, setTypeName] = useState("");
  const [frontEnd, setFrontEnd] = useState("");
  const [subFrame, setSubFrame] = useState("");
  const [rearFrame, setRearFrame] = useState("");
  const [bumper, setBumper] = useState("");
  const [door, setDoor] = useState("");
  const [roof, setRoof] = useState("");
  const [floor, setFloor] = useState("");
  const [wallConstruction, setWallConstruction] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin-categories")
      .then((res) => {
        console.log("Categories API response:", res.data);
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else if (Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a category!");
      return;
    }

    const formData = new FormData();
    formData.append("category", category); // category _id as string
    formData.append("typeName", typeName);
    formData.append("frontEnd", frontEnd);
    formData.append("subFrame", subFrame);
    formData.append("rearFrame", rearFrame);
    formData.append("bumper", bumper);
    formData.append("door", door);
    formData.append("roof", roof);
    formData.append("floor", floor);
    formData.append("wallConstruction", wallConstruction);

    


    images.forEach((img) => formData.append("image", img));

    try {
      await axios.post("http://localhost:5000/admin-lorry-types/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Lorry type added successfully");
      navigate("/types"); // smooth redirect
    } catch (err) {
      alert("Error adding: " + (err.response?.data?.message || err.message));
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
        <h2
          className="fw-bold text-center mb-5"
          style={{ color: "#2c3e50", fontSize: "1.8rem" }}
        >
          Add Lorry Type
        </h2>

        <form onSubmit={handleSubmit} className="row g-4">
          {/* Left side - Inputs */}
          <div className="col-md-6">
            <div className="mb-3">
              <label className="fw-semibold mb-2">Category </label>
              <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  required
>
  <option value="">Select Category</option>
  {categories.map((cat) => (
    <option key={cat._id} value={cat._id}>
      {cat.category} {/* this is the string name */}
    </option>
  ))}
</select>



            </div>

            {[
              { label: "Type Name", value: typeName, setter: setTypeName, required: true },
              { label: "Front End", value: frontEnd, setter: setFrontEnd },
              { label: "Sub Frame", value: subFrame, setter: setSubFrame },
              { label: "Rear Frame", value: rearFrame, setter: setRearFrame },
              { label: "Bumper", value: bumper, setter: setBumper },
              { label: "Door", value: door, setter: setDoor },
              { label: "Roof", value: roof, setter: setRoof },
              { label: "Floor", value: floor, setter: setFloor },
              { label: "Wall Construction", value: wallConstruction, setter: setWallConstruction },
            ].map((field, idx) => (
              <div className="mb-3" key={idx}>
                <label className="fw-semibold mb-2">{field.label}</label>
                <input
                  type="text"
                  className="form-control p-3 rounded-3"
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  required={field.required || false}
                />
              </div>
            ))}

            <div className="d-grid mt-4">
              <button
                type="submit"
                className="btn fw-semibold text-white rounded-3 p-3"
                style={{
                  background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                  border: "none",
                }}
              >
                + Add Lorry Type
              </button>
            </div>
          </div>

          {/* Right side - Image Upload */}
          <div className="col-md-6">
            <div
              className="border rounded-4 p-3 text-center d-flex flex-column justify-content-center"
              style={{
                border: "2px dashed #ced4da",
                backgroundColor: "#fdfdfd",
                cursor: "pointer",
                minHeight: "180px",
              }}
              onClick={() => document.getElementById("imageInput").click()}
            >
              {!previews.length ? (
                <>
                  <Image size={42} className="mb-2 text-secondary" />
                  <p className="mb-1 fw-semibold">
                    Drop images here, or <span className="text-primary">Click to browse</span>
                  </p>
                  <p className="small text-muted">JPG, PNG. Max 5MB each</p>
                </>
              ) : (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {previews.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`preview-${idx}`}
                      className="img-fluid rounded-3 shadow-sm"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              )}
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

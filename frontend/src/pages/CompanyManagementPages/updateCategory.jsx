import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function UpdateCategory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5000/admin-categories/get/${id}`)
      .then((res) => {
        setCategory(res.data.category.category);
        setDescription(res.data.category.description);
      })
      .catch((err) => alert(err.message));
  }, [id]);

  const handleUpdate = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    if (image) formData.append("image", image);

    axiosInstance
      .put(`http://localhost:5000/admin-categories/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        alert("Category updated");
        navigate("/"); // redirect to all categories
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div className="container mt-4">
      <h1>Update Category</h1>
      <form onSubmit={handleUpdate}>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Upload New Image (optional)</label>
          <input
            type="file"
            className="form-control-file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn btn-primary mt-2">
          Update
        </button>
      </form>
    </div>
  );
}

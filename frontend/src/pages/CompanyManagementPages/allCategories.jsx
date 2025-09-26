import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function AllCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axiosInstance
      .get("http://localhost:5000/admin-categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => alert(err.message));
  };

  // Delete category
  const deleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      axiosInstance
        .delete(`http://localhost:5000/admin-categories/delete/${id}`)
        .then(() => {
          alert("Category deleted");
          fetchCategories(); // refresh list
        })
        .catch((err) => alert(err.message));
    }
  };

  // Optional: Redirect to update page
  const updateCategory = (id) => {
    window.location.href = `/update/${id}`;
  };

  // Redirect to add category page
  const addCategory = () => {
    window.location.href = "addCategory";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>All Categories</h1>
        <button className="btn btn-success" onClick={addCategory}>
          + Add Lorry Category
        </button>
      </div>

      <div className="row">
        {categories.length === 0 && <p>No categories found</p>}

        {categories.map((cat) => (
          <div key={cat._id} className="col-md-4 mb-3">
            <div className="card">
              {cat.image && (
                <img
                  src={`http://localhost:5000/files/${cat.image}`}
                  className="card-img-top"
                  alt={cat.category}
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{cat.category}</h5>
                <p className="card-text">{cat.description}</p>

                <button
                  className="btn btn-primary me-2"
                  onClick={() => updateCategory(cat._id)}
                >
                  Update
                </button>

                <button
                  className="btn btn-danger"
                  onClick={() => deleteCategory(cat._id)}
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

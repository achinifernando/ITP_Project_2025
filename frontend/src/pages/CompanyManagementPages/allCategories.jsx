import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance"; // ✅ keep original path
import { useNavigate } from "react-router-dom";

export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axiosInstance
      .get("http://localhost:5000/admin-categories/") // ✅ keep your backend path
      .then((res) => setCategories(res.data))
      .catch((err) => alert(err.message));
  };

  const deleteCategory = (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      axiosInstance
        .delete(`http://localhost:5000/admin-categories/delete/${id}`) // ✅ keep original delete route
        .then(() => {
          alert("Category deleted");
          fetchCategories();
        })
        .catch((err) => alert(err.message));
    }
  };

  const updateCategory = (id) => {
    navigate(`/update/${id}`);
  };

  const addCategory = () => {
    navigate("/addCategory");
  };

  const viewCategoryDetails = (id) => {
    navigate(`/categories/${id}`);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-vh-100 py-5"
      style={{
        background: "linear-gradient(135deg, #f2f2f2, #e0e0e0)",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold display-6" style={{ color: "#222" }}>
            All Categories
          </h1>
          <button
            className="btn btn-primary rounded-pill px-4 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              border: "none",
            }}
            onClick={addCategory}
          >
            + Add Lorry Category
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search category..."
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

        {/* Category Grid */}
        <div className="row g-4 justify-content-center">
          {filteredCategories.length === 0 && (
            <p className="text-dark">No categories found</p>
          )}

          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="col-md-4 mb-4"
              style={{ cursor: "pointer" }}
              onClick={() => viewCategoryDetails(cat._id)}
            >
              <div className="category-card">
                {/* Image */}
                {cat.image && (
                  <div className="category-img">
                    <img
                      src={`http://localhost:5000/files/${cat.image}`} // ✅ keep original file path
                      alt={cat.category}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold mb-0">{cat.category}</h5>
                    <div className="d-flex gap-2">
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCategory(cat._id);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat._id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
                    {cat.description?.length > 60
                      ? cat.description.substring(0, 60) + "..."
                      : cat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        .category-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          min-height: 260px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .category-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 8px;
          height: 100%;
          background: linear-gradient(180deg, #4facfe, #00f2fe);
          border-radius: 20px 0 0 20px;
          box-shadow: 0 0 15px rgba(79,172,254,0.5);
        }
        .category-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }
        .category-img {
          height: 140px;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
        }
        .category-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .category-card:hover .category-img img {
          transform: scale(1.08);
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
      `}</style>
    </div>
  );
}

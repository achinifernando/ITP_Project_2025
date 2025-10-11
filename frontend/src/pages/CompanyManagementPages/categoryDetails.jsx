import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; // ✅ keep axiosInstance

export default function CategoryDetails() {
  const { id } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`http://localhost:5000/admin-categories/get/${id}`)
      .then((res) => {
        setCategory(res.data.category);
      })
      .catch((err) => alert(err.message));
  }, [id]);

  if (!category) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container py-5">
      <div className="category-details-card shadow-lg">
        {/* Main Image */}
        {category.image && (
          <div className="category-main-img">
            <img
              src={`http://localhost:5000/files/${category.image}`}
              alt={category.category}
            />
          </div>
        )}

        {/* Card Body */}
        <div className="card-body px-4 py-4 text-center">
          <h2 className="card-title fw-bold mb-3">{category.category}</h2>

          {/* Description */}
          <p className="category-description mb-4">{category.description}</p>

          {/* Back Button */}
          <Link to="/categories" className="btn-gradient">
            ← Back to Categories
          </Link>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .category-details-card {
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          max-width: 800px;
          margin: auto;
        }

        .category-details-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }

        .category-main-img {
          height: 400px;
          overflow: hidden;
        }

        .category-main-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .category-details-card:hover .category-main-img img {
          transform: scale(1.05);
        }

        .card-title {
          font-size: 1.8rem;
          color: #222;
        }

        .category-description {
          font-size: 1rem;
          color: #555;
          line-height: 1.6;
        }

        .btn-gradient {
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 0.6rem 1.8rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-gradient:hover {
          background: linear-gradient(90deg, #00f2fe, #4facfe);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

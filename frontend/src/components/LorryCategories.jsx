import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import axios from "axios";
import "../CSS/categoryPage.css"

function LorryCategoryCards() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/lorryCategories/products") 
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  return (
    <>
     <section className="hero-section">
      <div className="hero-container">
        <h1 className="hero-title">Product Range</h1>
        <p className="hero-subtitle">Our endineering - Your solution</p>
        
      </div>
    </section>
    <section className="card-section">
  <div className="card-grid">
    {categories.length > 0 ? (
      categories.map((cat) => (
        <div key={cat._id} className="custom-card">
          <img
            className="card-image"
            src={`http://localhost:5000/files/${cat.image}`}
            alt={cat.name}
          />
          <div className="card-content">
            <h5 className="card-title">{cat.category}</h5>
            <p className="card-description">{cat.description}</p>
            <Link to={`/LorryTypesPage/${cat._id}`}>
              <button type="button" className="view-btn">
                View
              </button>
            </Link>
          </div>
        </div>
      ))
    ) : (
      <p className="no-data">No categories found.</p>
    )}
  </div>
</section>
</>
  );
}

export default LorryCategoryCards;

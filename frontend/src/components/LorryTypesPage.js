import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {Link} from "react-router-dom"; /* use the <Link> component to navigate between pages.*/ 




function LorryTypesPage(){
const { categoryId } = useParams(); // comes from URL
  const [lorryTypes, setLorryTypes] = useState([]);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/lorryType/category/${categoryId}`)
      .then((res) => {
        setLorryTypes(res.data);
      })
      .catch((err) => {
        console.error("Error fetching lorry types:", err);
      });
  }, [categoryId]);
  
    return(
      
<section className="card-section">
      <div className="card-grid">
        {lorryTypes.length > 0 ? (
          lorryTypes.map((type) => (
            <div key={type._id} className="custom-card">
              <img
                className="card-image"
                src={`http://localhost:5000/files/${type.images[0]}`}
                alt={type.typeName}
              />
              <div className="card-content">
                <h5 className="card-title">{type.typeName}</h5>
                <Link to={`/LorryDetails/${type._id}`}>
                    <button type="button" className="view-btn">
                      View
                    </button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No lorry types found for this category.</p>
        )}
      </div>
    </section>
  );
}

export default LorryTypesPage;
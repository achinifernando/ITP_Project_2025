import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

export default function AllLorryTypes() {
  const [types, setTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    axiosInstance
      .get("http://localhost:5000/admin-lorry-types")
      .then((res) => setTypes(res.data))
      .catch((err) => console.error(err));
  };

  const deleteType = async (id) => {
    if (window.confirm("Are you sure you want to delete this lorry type?")) {
      try {
        await axiosInstance.delete(`http://localhost:5000/admin-lorry-types/delete/${id}`);
        alert("Lorry type deleted");
        fetchTypes();
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  const updateType = (id) => {
    window.location.href = `/update-lorry-type/${id}`;
  };

  const addType = () => {
    window.location.href = "/type/add";
  };

  const filteredTypes = types.filter((type) =>
    type.typeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-vh-100 py-5"
      style={{ background: "linear-gradient(135deg, #f2f2f2, #e0e0e0)" }}
    >
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold display-6" style={{ color: "#222" }}>
            All Lorry Types
          </h1>
          <button
            className="btn btn-primary rounded-pill px-4 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              border: "none",
            }}
            onClick={addType}
          >
            + Add Lorry Type
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search lorry types..."
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

        {/* Lorry Types Grid */}
        <div className="row g-4 justify-content-center">
          {filteredTypes.length === 0 && <p className="text-dark">No types found</p>}

          {filteredTypes.map((type) => (
            <div key={type._id} className="col-md-6 col-lg-4 mb-4">
              <div className="type-card">
                {type.images?.length > 0 ? (
                  <div className="type-img">
                    <img
                      src={`http://localhost:5000/files/${type.images[0]}`}
                      alt={type.typeName}
                    />
                  </div>
                ) : (
                  <div
                    className="type-img d-flex align-items-center justify-content-center"
                    style={{ background: "#f0f0f0", height: "180px" }}
                  >
                    <span className="text-muted">No Image</span>
                  </div>
                )}

                <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold mb-0">{type.typeName}</h5>
                    <div className="d-flex gap-2">
                      <button className="icon-btn" onClick={() => updateType(type._id)}>
                        ✏️
                      </button>
                      <button className="icon-btn" onClick={() => deleteType(type._id)}>
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="text-muted mb-2">
                    {type.category?.categoryName || "No Category"}
                  </p>

                  {/* extra images */}
                  {type.images?.length > 1 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {type.images.slice(1).map((img, i) => (
                        <img
                          key={i}
                          src={`http://localhost:5000/uploads/${img}`}
                          alt="extra"
                          width="60"
                          className="border rounded"
                        />
                      ))}
                    </div>
                  )}

                  <Link to={`/types/${type._id}`} className="view-details-link mt-2">
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS */}
      <style>{`
        .type-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          min-height: 300px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .type-card::before {
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
        .type-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }
        .type-img {
          height: 180px;
          overflow: hidden;
          border-radius: 20px 20px 0 0;
        }
        .type-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .type-card:hover .type-img img {
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
        .view-details-link {
          font-size: 0.95rem;
          font-weight: 600;
          color: #4facfe;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .view-details-link:hover {
          color: #00f2fe;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

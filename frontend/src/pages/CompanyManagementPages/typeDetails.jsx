// src/components/TypeDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function TypeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchType = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await axiosInstance.get(`http://localhost:5000/admin-lorry-types/${id}`);
        setType(res.data);
      } catch (err) {
        console.error("TypeDetails fetch error:", err);
        setErrorMsg(err.response?.data?.message || err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchType();
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading lorry type details...</p>;
  if (errorMsg)
    return (
      <div className="text-center mt-5">
        <p className="text-danger mb-3">{errorMsg}</p>
        <button className="btn btn-gradient" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
    );
  if (!type) return <p className="text-center mt-5">Lorry type not found.</p>;

  return (
    <div className="container py-5">
      <div className="type-details-card shadow-lg mx-auto">
        {/* Images */}
        {type.images?.length > 0 && (
          <div className="type-images d-flex overflow-auto gap-2 p-2">
            {type.images.map((img, idx) => (
              <img
                key={idx}
                src={`http://localhost:5000/files/${img}`}
                alt={`type-${idx}`}
                className="rounded-3"
                style={{ height: "120px", objectFit: "cover" }}
              />
            ))}
          </div>
        )}

        {/* Card Body */}
        <div className="card-body px-4 py-4">
          <h2 className="fw-bold mb-3">{type.typeName}</h2>
          <p className="text-muted mb-2">
            <strong>Category:</strong> {type.category?.category || "N/A"}
          </p>
          <p className="text-muted mb-2"><strong>Front End:</strong> {type.frontEnd || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Sub Frame:</strong> {type.subFrame || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Rear Frame:</strong> {type.rearFrame || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Bumper:</strong> {type.bumper || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Door:</strong> {type.door || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Roof:</strong> {type.roof || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Floor:</strong> {type.floor || "N/A"}</p>
          <p className="text-muted mb-2"><strong>Wall Construction:</strong> {type.wallConstuction || "N/A"}</p>

          <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
            <button
              className="btn btn-gradient"
              onClick={() => navigate(`/update-lorry-type/${type._id}`)}
            >
              Edit Type
            </button>
            <Link to="/types" className="btn btn-outline-primary">
              ← Back to All Types
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .type-details-card {
          max-width: 800px;
          background: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .type-details-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
        }
        .type-images img {
          transition: transform 0.3s ease;
        }
        .type-images img:hover {
          transform: scale(1.05);
        }
        .btn-gradient {
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 0.6rem 1.8rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-gradient:hover {
          background: linear-gradient(90deg, #00f2fe, #4facfe);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .btn-outline-primary {
          border-radius: 50px;
          padding: 0.6rem 1.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

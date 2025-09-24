import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../CSS/details.css";
import { Link } from "react-router-dom";

function LorryDetails() {
  const { lorryId } = useParams();
  const [lorry, setLorry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null); // For opening lightbox

  useEffect(() => {
    axios
      .get(`http://localhost:5000/lorryType/${lorryId}`)
      .then((res) => {
        setLorry(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching lorry details:", err);
        setLoading(false);
      });
  }, [lorryId]);

  if (loading) return <div>Loading...</div>;
  if (!lorry) return <div>No details found.</div>;

  return (
    <>
      <h1 className="title">{lorry.typeName}</h1>

      {/* Thumbnails */}
      <div className="thumbs">
        {lorry.images && lorry.images.length > 0 ? (
          lorry.images.map((img, index) => (
            <img
              key={index}
              src={`http://localhost:5000/files/${img}`}
              alt={`${lorry.typeName} - image ${index + 1}`}
              onClick={() =>
                setLightboxImage(`http://localhost:5000/files/${img}`)
              }
              className="thumbnail"
            />
          ))
        ) : (
          <p>No images available.</p>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Full view" />
        </div>
      )}

      {/* Features */}
      <section>
        <h3>Features</h3>
        <details>
          <summary>Front End</summary>
          <p>{lorry.frontEnd}</p>
        </details>
        <details>
          <summary>Sub Frame</summary>
          <p>{lorry.subFrame}</p>
        </details>
        <details>
          <summary>Rear Frame</summary>
          <p>{lorry.rearFrame}</p>
        </details>
        <details>
          <summary>Door</summary>
          <p>{lorry.door}</p>
        </details>
        <details>
          <summary>Roof</summary>
          <p>{lorry.roof}</p>
        </details>
        <details>
          <summary>Bumper</summary>
          <p>{lorry.bumper}</p>
        </details>
        <details>
          <summary>Floor</summary>
          <p>{lorry.floor}</p>
        </details>
        <details>
          <summary>Wall Construction</summary>
          <p>{lorry.wallConstuction}</p>
        </details>
      </section>
      <Link to={"/orderform"}>
        <button className="service-btn">Place an Order</button>
      </Link>
      
    </>
  );
}

export default LorryDetails;

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AllLorryTypes() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    axios
      .get("http://localhost:5000/admin-lorryType")
      .then((res) => setTypes(res.data))
      .catch((err) => console.error(err));
  };

  const deleteType = async (id) => {
    if (window.confirm("Are you sure you want to delete this lorry type?")) {
      try {
        await axios.delete(`http://localhost:5000/admin-lorryType/delete/${id}`);
        alert("Lorry type deleted");
        fetchTypes(); // refresh
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

  if (!types.length) return <p>No types found</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Lorry Types</h2>
        <button className="btn btn-success" onClick={addType}>
          + Add Lorry Type
        </button>
      </div>

      <div className="row">
        {types.map((type) => (
          <div className="col-md-6 col-lg-4 mb-4" key={type._id}>
            <div className="card h-100">
              {type.images?.length > 0 && (
                <img
                  src={`http://localhost:5000/uploads/${type.images[0]}`}
                  className="card-img-top"
                  alt={type.typeName}
                  style={{ height: "180px", objectFit: "cover" }}
                />
              )}

              <div className="card-body">
                <h5 className="card-title">{type.typeName}</h5>
                <p><strong>Category:</strong> {type.category?.categoryName || "N/A"}</p>
                <p><strong>Front End:</strong> {type.frontEnd}</p>
                <p><strong>Sub Frame:</strong> {type.subFrame}</p>
                <p><strong>Rear Frame:</strong> {type.rearFrame}</p>
                <p><strong>Bumper:</strong> {type.bumper}</p>
                <p><strong>Door:</strong> {type.door}</p>
                <p><strong>Roof:</strong> {type.roof}</p>
                <p><strong>Floor:</strong> {type.floor}</p>
                <p><strong>Wall Construction:</strong> {type.wallConstuction}</p>

                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => updateType(type._id)}
                  >
                    Update
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteType(type._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {type.images?.length > 1 && (
                <div className="card-footer d-flex flex-wrap gap-2">
                  {type.images.slice(1).map((img, i) => (
                    <img
                      key={i}
                      src={`http://localhost:5000/uploads/${img}`}
                      alt="lorry"
                      width="60"
                      className="border rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

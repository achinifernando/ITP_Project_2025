// // src/components/AllServices.js
// import React, { useState, useEffect } from "react";
// import axiosInstance from "../../utils/axiosInstance"; // ✅ keep axiosInstance
// import { useNavigate } from "react-router-dom";

// export default function AllServices() {
//   const [services, setServices] = useState([]);
//   const [searchTerm, setSearchTerm] = useState(""); // <-- search state
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchServices();
//   }, []);

//   const fetchServices = () => {
//     axiosInstance
//       .get("http://localhost:5000/admin-services/")
//       .then((res) => setServices(res.data))
//       .catch((err) => {
//         console.error("fetchServices error:", err);
//         alert(err.response?.data?.message || err.message);
//       });
//   };

//   const deleteService = (id) => {
//     if (!window.confirm("Are you sure you want to delete this service?")) return;
//     axiosInstance
//       .delete(`http://localhost:5000/admin-services/delete/${id}`)
//       .then(() => {
//         alert("Service deleted");
//         fetchServices();
//       })
//       .catch((err) => {
//         console.error("deleteService error:", err);
//         alert(err.response?.data?.message || err.message);
//       });
//   };

//   const updateService = (id) => navigate(`/admin-services/update/${id}`);
//   const addService = () => navigate("/admin-services/add");
//   const viewServiceDetails = (id) => navigate(`/service/${id}`);

//   // Filter services by search term
//   const filteredServices = services.filter((srv) =>
//     srv.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="min-vh-100 py-5" style={{ background: "linear-gradient(135deg, #f2f2f2, #e0e0e0)" }}>
//       <div className="container">
//         {/* Header */}
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h1 className="fw-bold display-6" style={{ color: "#222" }}>All Services</h1>
//           <button
//             className="btn btn-primary rounded-pill px-4 shadow-lg"
//             style={{ background: "linear-gradient(90deg, #4facfe, #00f2fe)", border: "none" }}
//             onClick={addService}
//           >
//             + Add Service
//           </button>
//         </div>

//         {/* Search Bar */}
//         <div className="mb-4">
//           <input
//             type="text"
//             placeholder="Search services..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               padding: "8px 12px",
//               borderRadius: "12px",
//               border: "1px solid #ccc",
//               width: "100%",
//               maxWidth: "400px",
//             }}
//           />
//         </div>

//         {/* Service Grid */}
//         <div className="row g-4 justify-content-center">
//           {filteredServices.length === 0 && <p className="text-dark">No services found</p>}

//           {filteredServices.map((srv) => (
//             <div
//               key={srv._id}
//               className="col-md-4 mb-4"
//               onClick={() => viewServiceDetails(srv._id)}
//               style={{ cursor: "pointer" }}
//             >
//               <div className="service-card d-flex flex-column">
//                 {srv.image && (
//                   <div className="service-img">
//                     <img src={`http://localhost:5000/files/${srv.image}`} alt={srv.serviceType} />
//                   </div>
//                 )}

//                 <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h5 className="fw-bold mb-0">{srv.serviceType}</h5>
//                     <div className="d-flex gap-2">
//                       <button
//                         className="icon-btn"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           updateService(srv._id);
//                         }}
//                       >
//                         ✏️
//                       </button>
//                       <button
//                         className="icon-btn"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteService(srv._id);
//                         }}
//                       >
//                         🗑️
//                       </button>
//                     </div>
//                   </div>

//                   <p className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
//                     {(srv.description || "").length > 60
//                       ? (srv.description || "").substring(0, 60) + "..."
//                       : srv.description}
//                   </p>

//                   <span className="btn-link">View Details →</span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Existing CSS */}
//       <style>{`
//         .service-card {
//           background: rgba(255, 255, 255, 0.95);
//           border-radius: 20px;
//           min-height: 260px;
//           display: flex;
//           flex-direction: column;
//           position: relative;
//           overflow: hidden;
//           box-shadow: 0 8px 24px rgba(0,0,0,0.08);
//           transition: all 0.25s ease;
//         }
//         .service-card::before{
//           content: "";
//           position: absolute;
//           top: 0; left: 0;
//           width: 6px; height: 100%;
//           background: linear-gradient(180deg, #4facfe, #00f2fe);
//         }
//         .service-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(0,0,0,0.12); }
//         .service-img { height: 160px; overflow: hidden; border-radius: 16px 16px 0 0; }
//         .service-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
//         .service-card:hover .service-img img { transform: scale(1.06); }
//         .icon-btn { background: #fafafa; border: none; border-radius: 50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
//         .icon-btn:hover { background: linear-gradient(90deg,#4facfe,#00f2fe); color:white; }
//         .btn-link { font-size: 0.95rem; color: #4facfe; }
//       `}</style>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function AllServices() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- search state
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    axiosInstance
      .get("http://localhost:5000/admin-services/")
      .then((res) => setServices(res.data))
      .catch((err) => {
        console.error("fetchServices error:", err);
        alert(err.response?.data?.message || err.message);
      });
  };

  const deleteService = (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    axiosInstance
      .delete(`http://localhost:5000/admin-services/delete/${id}`)
      .then(() => {
        alert("Service deleted");
        fetchServices();
      })
      .catch((err) => {
        console.error("deleteService error:", err);
        alert(err.response?.data?.message || err.message);
      });
  };

  const updateService = (id) => navigate(`/service/update/${id}`);
  const addService = () => navigate("/admin-services/add");
  const viewServiceDetails = (id) => navigate(`/service/${id}`);

  // Filter services by search term
  const filteredServices = services.filter((srv) =>
    srv.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-vh-100 py-5" style={{ background: "linear-gradient(135deg, #f2f2f2, #e0e0e0)" }}>
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold display-6" style={{ color: "#222" }}>All Services</h1>
          <button
            className="btn btn-primary rounded-pill px-4 shadow-lg"
            style={{ background: "linear-gradient(90deg, #4facfe, #00f2fe)", border: "none" }}
            onClick={addService}
          >
            + Add Service
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search services..."
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

        {/* Service Grid */}
        <div className="row g-4 justify-content-center">
          {filteredServices.length === 0 && <p className="text-dark">No services found</p>}

          {filteredServices.map((srv) => (
            <div
              key={srv._id}
              className="col-md-4 mb-4"
              onClick={() => viewServiceDetails(srv._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="service-card d-flex flex-column">
                {srv.image && (
                  <div className="service-img">
                    <img src={`http://localhost:8070/uploads/${srv.image}`} alt={srv.serviceType} />
                  </div>
                )}

                <div className="p-3 flex-grow-1 d-flex flex-column justify-content-between">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold mb-0">{srv.serviceType}</h5>
                    <div className="d-flex gap-2">
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateService(srv._id);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteService(srv._id);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
                    {(srv.description || "").length > 60
                      ? (srv.description || "").substring(0, 60) + "..."
                      : srv.description}
                  </p>

                  <span className="btn-link">View Details →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Existing CSS */}
      <style>{`
        .service-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          min-height: 260px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          transition: all 0.25s ease;
        }
        .service-card::before{
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 6px; height: 100%;
          background: linear-gradient(180deg, #4facfe, #00f2fe);
        }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(0,0,0,0.12); }
        .service-img { height: 160px; overflow: hidden; border-radius: 16px 16px 0 0; }
        .service-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .service-card:hover .service-img img { transform: scale(1.06); }
        .icon-btn { background: #fafafa; border: none; border-radius: 50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .icon-btn:hover { background: linear-gradient(90deg,#4facfe,#00f2fe); color:white; }
        .btn-link { font-size: 0.95rem; color: #4facfe; }
      `}</style>
    </div>
  );
}


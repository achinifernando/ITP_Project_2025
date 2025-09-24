// // src/components/DeliveryMap.js
// import React, { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import axios from "axios";

// const BACKEND_URL = 'http://localhost:5001';

// export default function DeliveryMap() {
//   const [deliveries, setDeliveries] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`${BACKEND_URL}/deliveries`);
//         setDeliveries(res.data);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching deliveries:', err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div style={{ padding: '20px', textAlign: 'center' }}>
//         <h2>Delivery Map</h2>
//         <p>Loading delivery data...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>Delivery Map</h2>
//       {deliveries.length > 0 ? (
//         <MapContainer
//           center={[6.9271, 79.8612]}
//           zoom={8}
//           style={{ height: "500px", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution="&copy; OpenStreetMap contributors"
//           />
//           {deliveries.map(d => (
//             <Marker
//               key={d._id}
//               position={[6.9271, 79.8612]} // Default position, you can add real coordinates to your delivery model
//             >
//               <Popup>
//                 <strong>{d.customerName}</strong><br />
//                 Address: {d.address}<br />
//                 Status: {d.status}<br />
//                 {d.driver && `Driver: ${typeof d.driver === 'object' ? d.driver.name : 'Assigned'}`}<br />
//                 {d.vehicle && `Vehicle: ${typeof d.vehicle === 'object' ? d.vehicle.vehicleNumber : 'Assigned'}`}
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       ) : (
//         <p>No deliveries found to display on map</p>
//       )}
//     </div>
//   );
// }
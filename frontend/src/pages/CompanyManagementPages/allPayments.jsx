// import { useEffect, useState } from "react";

// const AdminPayments = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch("http://localhost:5000/admin-payments/")
//       .then((res) => res.json())
//       .then((data) => setPayments(Array.isArray(data) ? data : []))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   const updatePaymentStatus = async (id, status) => {
//     try {
//       const res = await fetch(`http://localhost:5000/admin-payments/${id}/status`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status }),
//       });
//       const updated = await res.json();
//       setPayments(payments.map((p) => (p._id === updated._id ? updated : p)));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <p>Loading payments...</p>;
//   if (!payments.length) return <p>No payments found.</p>;

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6">Payments</h1>
//       <table className="min-w-full border border-gray-300 shadow-lg">
//         <thead className="bg-gray-100 sticky top-0">
//           <tr>
//             <th className="p-2 border">Client Name</th>
//             <th className="p-2 border">Email</th>
//             <th className="p-2 border">Phone</th>
//             <th className="p-2 border">Amount</th>
//             <th className="p-2 border">Payment Method</th>
//             <th className="p-2 border">Receipt</th>
//             <th className="p-2 border">Status</th>
//             <th className="p-2 border">Uploaded At</th>
//             <th className="p-2 border">Verified At</th>
//             <th className="p-2 border">Request Details</th>
//             <th className="p-2 border">Quotation Details</th>
//           </tr>
//         </thead>
//         <tbody>
//           {payments.map((payment) => (
//             <tr key={payment._id} className="border text-center">
//               <td className="p-2">{payment.clientId?.name || "-"}</td>
//               <td className="p-2">{payment.clientId?.email || "-"}</td>
//               <td className="p-2">{payment.clientId?.phone || "-"}</td>
//               <td className="p-2">{payment.amount}</td>
//               <td className="p-2">{payment.paymentMethod}</td>
//               <td className="p-2">
//                 {payment.receiptFile?.filePath ? (
//                   <a
//                     href={`http://localhost:5000/${payment.receiptFile.filePath}`}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     {payment.receiptFile.originalName || "Receipt"}
//                   </a>
//                 ) : (
//                   "-"
//                 )}
//               </td>
//               <td className="p-2">
//                 <select
//                   value={payment.status}
//                   onChange={(e) =>
//                     updatePaymentStatus(payment._id, e.target.value)
//                   }
//                   className="border p-1 rounded"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="success">Success</option>
//                   <option value="unsuccess">Unsuccess</option>
//                 </select>
//               </td>
//               <td className="p-2">{new Date(payment.uploadedAt).toLocaleString()}</td>
//               <td className="p-2">
//                 {payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString() : "-"}
//               </td>
//               <td className="p-2">
//                 {payment.requestId
//                   ? `Features: ${payment.requestId.customFeatures || "-"}, Quantity: ${
//                       payment.requestId.quantity || "-"
//                     }, Delivery: ${payment.requestId.expectedDeliveryDate ? new Date(payment.requestId.expectedDeliveryDate).toLocaleDateString() : "-"}`
//                   : "-"}
//               </td>
//               <td className="p-2">
//                 {payment.quotationId
//                   ? `Total: ${payment.quotationId.totalPrice || "-"}, Remarks: ${payment.quotationId.remarks || "-"}, Status: ${payment.quotationId.status || "-"}`
//                   : "-"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AdminPayments;

import { useEffect, useState } from "react";
import "../../CSS/CompanyCSS/repair.css"; // custom CSS file

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch only service requests with payments
    fetch("http://localhost:5000/admin-payments/paid-data")
      .then((res) => res.json())
      .then((data) => setRepairs(Array.isArray(data.serviceRequests) ? data.serviceRequests : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/admin-repairs/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setRepairs(repairs.map((r) => (r._id === updated._id ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const groupedByDate = repairs.reduce((acc, repair) => {
    const dateKey = repair.createdAt ? new Date(repair.createdAt).toLocaleDateString() : "Unknown Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(repair);
    return acc;
  }, {});

  if (loading) return <div className="page-center"><p className="loading-text">Loading repair requests...</p></div>;
  if (!repairs.length) return <div className="page-center"><p className="loading-text">No paid service requests found.</p></div>;

  return (
    <div className="page-background">
      <div className="payments-container">
        <h1 className="payments-title">Paid Service Requests</h1>

        {Object.entries(groupedByDate).map(([date, dateRepairs]) => (
          <div key={date} className="date-group">
            <div className="payments-card">
              <div className="table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th className="date-header" colSpan="13">{date}</th>
                    </tr>
                    <tr>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th>City</th>
                      <th>Lorry Model</th>
                      <th>Lorry Number</th>
                      <th>Service Type</th>
                      <th>Issue Description</th>
                      <th>Preferred Date</th>
                      <th>Status</th>
                      <th>Payment Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateRepairs.map((repair) => (
                      <tr key={repair._id}>
                        <td>{repair.userName || "-"}</td>
                        <td>{repair.email || "-"}</td>
                        <td>{repair.phoneNumber || "-"}</td>
                        <td>{repair.companyName || "-"}</td>
                        <td>{repair.city || "-"}</td>
                        <td>{repair.lorryModel || "-"}</td>
                        <td>{repair.lorryNumber || "-"}</td>
                        <td>{repair.serviceType || "-"}</td>
                        <td>{repair.issueDescription || "-"}</td>
                        <td>{repair.preferredDate ? new Date(repair.preferredDate).toLocaleDateString() : "-"}</td>
                        <td>
                          <select
                            className={`status-select ${(repair.status || "pending").replace(/\s/g, "").toLowerCase()}`}
                            value={repair.status || "Pending"}
                            onChange={(e) => updateStatus(repair._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{repair.paymentStatus || "-"}</td>
                        <td>{repair.createdAt ? new Date(repair.createdAt).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Include your CSS styles here as before */}
    </div>
  );
};

export default AdminRepairs;

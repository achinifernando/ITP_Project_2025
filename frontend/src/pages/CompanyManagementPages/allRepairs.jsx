import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // For frontend error display

  // Filters
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    axiosInstance
      .get("/admin-repairs")
      .then((res) => setRepairs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err.response?.data?.error || "Failed to fetch repairs"))
      .finally(() => setLoading(false));
  }, []);

  // Fetch repairs
  useEffect(() => {
    setLoading(true);
    setError("");

    axiosInstance
      .get("/admin-repairs")
      .then((res) => setRepairs(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch repairs");
      })
      .finally(() => setLoading(false));
  }, []);

  // Update status
 const updateStatus = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/admin-repairs/${id}/status`, { status });
      setRepairs(repairs.map((r) => (r._id === res.data._id ? res.data : r)));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  // 🔹 Filter logic
  const filteredRepairs = repairs.filter((r) => {
    if (statusTab !== "All") {
      const tabStatus = statusTab === "New" ? "Pending" : statusTab;
      if (r.status !== tabStatus) return false;
    }

    const createdAt = new Date(r.createdAt);
    if (dateFrom && createdAt < new Date(dateFrom)) return false;
    if (dateTo && createdAt > new Date(dateTo)) return false;

    const searchLower = search.toLowerCase();
    if (
      r.userName?.toLowerCase().includes(searchLower) ||
      r.lorryModelInfo?.model?.toLowerCase().includes(searchLower) ||
      r.lorryNumber?.toLowerCase().includes(searchLower) ||
      r.serviceType?.toLowerCase().includes(searchLower)
    )
      return true;

    return false;
  });

  // Group by date
  const groupedByDate = filteredRepairs.reduce((acc, repair) => {
    const dateKey = repair.createdAt
      ? new Date(repair.createdAt).toLocaleDateString()
      : "Unknown Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(repair);
    return acc;
  }, {});

  if (loading)
    return (
      <div className="page-center">
        <p className="loading-text">Loading repair requests...</p>
      </div>
    );

  if (error)
    return (
      <div className="page-center">
        <p className="error-text">{error}</p>
      </div>
    );

  if (!repairs.length)
    return (
      <div className="page-center">
        <p className="loading-text">No repair requests found.</p>
      </div>
    );

  return (
    <div className="page-background">
      <div className="repairs-container">
        <h1 className="orders-title">All Repair Requests</h1>

        {/* Tabs */}
        <div className="tabs">
          {["All", "New", "In Progress", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${statusTab === tab ? "active" : ""}`}
              onClick={() => setStatusTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="User, Lorry Model, Number, Service Type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Repairs Table */}
        {Object.entries(groupedByDate).map(([date, dateRepairs]) => (
          <div key={date} className="date-group">
            <div className="orders-card">
              <div className="table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th className="date-header" colSpan="12">
                        {date}
                      </th>
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
                        <td>{repair.lorryModelInfo?.model || "-"}</td>
                        <td>{repair.lorryNumber || "-"}</td>
                        <td>{repair.serviceType || "-"}</td>
                        <td>{repair.issueDescription || "-"}</td>
                        <td>
                          {repair.preferredDate
                            ? new Date(repair.preferredDate).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          <select
                            className={`status-select ${repair.status
                              .replace(/\s/g, "")
                              .toLowerCase()}`}
                            value={repair.status || "Pending"}
                            onChange={(e) =>
                              updateStatus(repair._id, e.target.value)
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          {repair.createdAt
                            ? new Date(repair.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CSS */}
      <style>{`
        .tabs { display:flex; gap:10px; margin-bottom:15px; }
        .tab-btn { padding:8px 16px; border:none; border-radius:8px; background:#e5e5e5; cursor:pointer; font-weight:500; transition:all 0.2s; }
        .tab-btn.active { background:#2563eb; color:#fff; }
        .filters { display:flex; flex-wrap:wrap; gap:15px; margin-bottom:20px; background:#fff; padding:12px 16px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);}
        .filter-group { display:flex; flex-direction:column; font-size:14px; }
        .filter-group label { margin-bottom:4px; font-weight:500; color:#444; }
        .filter-group input { padding:6px 10px; border:1px solid #ccc; border-radius:6px; }
        .page-background { min-height:100vh; background-color:#f9fafb; display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; }
        .repairs-container { max-width:95%; width:100%; }
        .orders-title { font-size:32px; font-weight:bold; color:#222; margin-bottom:20px; text-align:left; }
        .orders-card { background:#fff; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; margin-bottom:20px; }
        .table-wrapper { overflow-x:auto; }
        .payments-table { width:100%; border-collapse:collapse; font-size:14px; }
        .payments-table thead { background:#f5f5f5; text-transform:uppercase; font-size:12px; color:#555; }
        .payments-table th, .payments-table td { padding:8px 12px; text-align:center; vertical-align:middle; border-bottom:1px solid #e5e5e5; white-space:nowrap; }
        .date-header { background:#e0e0e0; font-size:16px; font-weight:600; text-align:left; color:#333; }
        .payments-table tbody tr:hover { background:#fafafa; transition:background-color 0.2s; }
        .status-select { padding:2px 6px; border:none; border-radius:6px; font-size:13px; }
        .status-select.pending { background:#fef3c7; color:#92400e; }
        .status-select.inprogress { background:#dbeafe; color:#1e40af; }
        .status-select.completed { background:#d1fae5; color:#065f46; }
        .status-select.cancelled { background:#fee2e2; color:#991b1b; }
        .error-text { color:red; font-weight:500; font-size:16px; }
      `}</style>
    </div>
  );
};

export default AdminRepairs;

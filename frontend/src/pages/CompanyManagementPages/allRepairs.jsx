import { useEffect, useState } from "react";
import { Bell, Search } from "react-bootstrap-icons"; // for icons
import "./repair.css"; // custom CSS file

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/admin-repair/")
      .then((res) => res.json())
      .then((data) => setRepairs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/admin-repair/${id}/status`, {
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

  if (loading)
    return <p className="text-center text-muted p-4">Loading repair requests...</p>;
  if (!repairs.length)
    return <p className="text-center text-muted p-4">No repair requests found.</p>;

  return (
    <div className="p-4 bg-light min-vh-100">
      {/* 🔹 Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-dark mb-0">Repair & Maintenance Requests</h4>
        <div className="d-flex align-items-center gap-3">
          {/* Notification Icon */}
          <button className="btn btn-light position-relative">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>

          {/* Search Bar */}
          <div className="input-group">
            <span className="input-group-text bg-white">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>

      {/* 🔹 Status Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">All Orders</h6>
              <h4 className="fw-bold">{repairs.length}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">New Orders</h6>
              <h4 className="fw-bold">
                {repairs.filter((r) => r.status === "Pending").length}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">In Progress</h6>
              <h4 className="fw-bold">
                {repairs.filter((r) => r.status === "In Progress").length}
              </h4>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-center shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Completed</h6>
              <h4 className="fw-bold">
                {repairs.filter((r) => r.status === "Completed").length}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* 🔹 Table Section */}
      <div className="table-responsive shadow rounded bg-white p-3">
        <table className="table table-hover align-middle mb-0 table-sm">
          <thead className="table-light">
            <tr>
              {[
                "User Name",
                "Email",
                "Phone",
                "Company",
                "City",
                "Lorry Model",
                "Service Type",
                "Preferred Date",
                "Status",
                "Created At",
              ].map((heading, idx) => (
                <th
                  key={idx}
                  className="text-uppercase small fw-semibold text-secondary"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {repairs.map((repair) => (
              <tr key={repair._id}>
                <td className="text-nowrap">{repair.userName || repair.userId?.name}</td>
                <td>{repair.email || repair.userId?.email}</td>
                <td className="text-muted">{repair.phoneNumber}</td>
                <td>{repair.companyName}</td>
                <td className="text-muted">{repair.city}</td>
                <td>{repair.lorryModel}</td>
                <td className="text-muted">{repair.serviceType}</td>
                <td>
                  {repair.preferredDate
                    ? new Date(repair.preferredDate).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <select
                    className={`form-select form-select-sm fw-semibold status-${repair.status.replace(
                      " ",
                      ""
                    ).toLowerCase()}`}
                    value={repair.status}
                    onChange={(e) => updateStatus(repair._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="text-muted small">
                  {new Date(repair.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRepairs;

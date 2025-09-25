import { useEffect, useState } from "react";

const AdminRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/admin-repairs/")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched repairs:", data);
        setRepairs(data);
      })
      .catch((err) => console.error("Error fetching repairs:", err))
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
      console.error("Error updating status:", err);
    }
  };

  if (loading) return <p className="p-6">Loading repair requests...</p>;
  if (!repairs.length) return <p className="p-6">No repair requests found.</p>;

  return (
    <div className="p-6 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Repair & Maintenance Requests</h1>

      <table className="min-w-full border border-gray-300 shadow-lg">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="p-2 border">User Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Address</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">State</th>
            <th className="p-2 border">Lorry Model</th>
            <th className="p-2 border">Lorry Number</th>
            <th className="p-2 border">Service Type</th>
            <th className="p-2 border">Issue Description</th>
            <th className="p-2 border">Preferred Date</th>
            <th className="p-2 border">Image</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Created At</th>
          </tr>
        </thead>
        <tbody>
          {repairs.map((repair, idx) => (
            <tr
              key={repair._id}
              className={`border text-center ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
            >
              <td className="p-2">{repair.userName || repair.userId?.name}</td>
              <td className="p-2">{repair.email || repair.userId?.email}</td>
              <td className="p-2">{repair.phoneNumber}</td>
              <td className="p-2">{repair.companyName}</td>
              <td className="p-2">{repair.address}</td>
              <td className="p-2">{repair.city}</td>
              <td className="p-2">{repair.state}</td>
              <td className="p-2">{repair.lorryModel}</td>
              <td className="p-2">{repair.lorryNumber}</td>
              <td className="p-2">{repair.serviceType}</td>
              <td className="p-2">{repair.issueDescription || "-"}</td>
              <td className="p-2">{repair.preferredDate ? new Date(repair.preferredDate).toLocaleDateString() : "-"}</td>
              <td className="p-2">
                {repair.image ? (
                  <a href={repair.image} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="p-2">
                <select
                  className="border p-1 rounded"
                  value={repair.status}
                  onChange={(e) => updateStatus(repair._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td className="p-2">{new Date(repair.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRepairs;

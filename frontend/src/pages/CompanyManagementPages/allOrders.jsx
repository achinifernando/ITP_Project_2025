import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";



const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All"); 
  const [search, setSearch] = useState(""); // 🔍 search state
  const [userFilter, setUserFilter] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(filteredOrders.map(o => ({
    "Order ID": o._id,
    "User Name": o.userName || o.userId?.name,
    "Email": o.email || o.userId?.email,
    "Phone": o.phoneNumber,
    "Company": o.companyName,
    "Lorry Category": o.lorryCategory?.category || o.lorryCategory?.typeName,
    "Lorry Type": o.lorryType?.typeName || o.lorryType?.name,
    "Quantity": o.quantity,
    "Order Status": o.status,
    "Payment Status": o.payment?.status || "-",
    "Amount": o.payment?.amount || "-",
    "Payment Method": o.payment?.paymentMethod || "-"
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  XLSX.writeFile(wb, "OrderReport.xlsx");
};



const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Order Report", 14, 20);
  const tableColumn = ["Order ID","User Name","Email","Phone","Company","Lorry Category","Lorry Type","Quantity","Order Status","Payment Status","Amount","Payment Method"];
  const tableRows = [];

  filteredOrders.forEach(o => {
    const rowData = [
      o._id,
      o.userName || o.userId?.name,
      o.email || o.userId?.email,
      o.phoneNumber,
      o.companyName,
      o.lorryCategory?.category || o.lorryCategory?.typeName,
      o.lorryType?.typeName || o.lorryType?.name,
      o.quantity,
      o.status,
      o.payment?.status || "-",
      o.payment?.amount || "-",
      o.payment?.paymentMethod || "-"
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30
  });
  doc.save("OrderReport.pdf");
};







  // Fetch orders
 useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/admin-orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Update ORDER status
 const updateOrderStatus = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/admin-orders/${id}/status`, { status });
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? { ...o, status: updated.status } : o))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Update PAYMENT status
  const updatePaymentStatus = async (id, status) => {
    try {
      const res = await axiosInstance.put(`/admin-payments/${id}/status`, { status });
      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o.payment?._id === updated.payment._id ? { ...o, payment: updated.payment } : o
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  

  // ✅ Filter orders based on active tab + search (including lorry category search)
  const filteredOrders = orders.filter((o) => {
    if (activeTab !== "All" && o.status !== activeTab) return false;

     // Status filter
  if (activeTab !== "All" && o.status !== activeTab) return false;

  // User filter
  if (userFilter && !(o.userName?.toLowerCase().includes(userFilter.toLowerCase()) || 
      o.userId?.name?.toLowerCase().includes(userFilter.toLowerCase()))) return false;

  // Date range filter
  const orderDate = new Date(o.createdAt);
  if (dateFrom && orderDate < new Date(dateFrom)) return false;
  if (dateTo && orderDate > new Date(dateTo)) return false

    const searchLower = search.toLowerCase();
    return (
      o._id?.toLowerCase().includes(searchLower) ||
      o.userName?.toLowerCase().includes(searchLower) ||
      o.userId?.name?.toLowerCase().includes(searchLower) ||
      o.email?.toLowerCase().includes(searchLower) ||
      o.userId?.email?.toLowerCase().includes(searchLower) ||
      o.phoneNumber?.toLowerCase().includes(searchLower) ||
      o.companyName?.toLowerCase().includes(searchLower) ||
      // 🔍 now includes lorry category fields
      o.lorryCategory?.category?.toLowerCase().includes(searchLower) ||
      o.lorryCategory?.typeName?.toLowerCase().includes(searchLower) ||
      o.lorryType?.typeName?.toLowerCase().includes(searchLower) ||
      o.lorryType?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Group filtered orders by date
  const groupedByDate = filteredOrders.reduce((acc, order) => {
    const dateKey = new Date(order.createdAt).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);
    return acc;
  }, {});

  // Count for each category
  const counts = {
    All: orders.length,
    Ongoing: orders.filter((o) => o.status === "Ongoing").length,
    Completed: orders.filter((o) => o.status === "Completed").length,
    Cancelled: orders.filter((o) => o.status === "Cancelled").length,
  };

  if (loading)
    return (
      <div className="page-center">
        <p className="loading-text">Loading orders...</p>
      </div>
    );

  if (!orders.length)
    return (
      <div className="page-center">
        <p className="loading-text">No orders found.</p>
      </div>
    );

  return (
    <div className="page-background">
      <div className="orders-container">
        <h1 className="orders-title">All Orders</h1>

        {/* 🔍 Search bar */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Order ID, User, Email, Phone, Company, Lorry Category, or Type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 🔽 Filters (New UI) */}
<div className="filters">
  <div className="filter-group">

    <div className="filter-group">
  <label>User Name</label>
  <input
    type="text"
    placeholder="Filter by user..."
    value={userFilter}
    onChange={(e) => setUserFilter(e.target.value)}
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

    <label>Status</label>
    <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
      <option value="All">All</option>
      <option value="Pending">Pending</option>
      <option value="Ongoing">Ongoing</option>
      <option value="Completed">Completed</option>
      <option value="Cancelled">Cancelled</option>
    </select>
  </div>

  <div className="filter-group">
    <label>Lorry Category</label>
    <input
      type="text"
      placeholder="Search category..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  <div className="filter-group">
    <label>Date</label>
    <input
      type="date"
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
</div>   {/* ✅ CLOSE .filters properly here */}


        {/* Order Count Cards */}
        <div className="order-count-cards">
          {["All", "Ongoing", "Completed", "Cancelled"].map((tab) => (
            <div key={tab} className="count-card" onClick={() => setActiveTab(tab)}>
              <div className="count-number">{counts[tab]}</div>
              <div className="count-label">{tab}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {["All", "Ongoing", "Completed", "Cancelled"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
  <button onClick={exportToExcel}>Export to Excel</button>
  <button onClick={exportToPDF}>Export to PDF</button>
</div>


        {Object.entries(groupedByDate).map(([date, dateOrders]) => (
          <div key={date} className="date-group">
            <div className="orders-card">
              <div className="table-wrapper">
                <table className="payments-table">
                  <thead>
                    <tr>
                      <th className="date-header" colSpan="18">{date}</th>
                    </tr>
                    <tr>
                      <th>Order ID</th>
                      <th>User Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Company</th>
                      <th>Address</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Lorry Category</th>
                      <th>Lorry Type</th>
                      <th>Quantity</th>
                      <th>Additional Features</th>
                      <th>Order Status</th>
                      <th>Payment Status</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Receipt</th>
                      <th>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dateOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.userName || order.userId?.name}</td>
                        <td>{order.email || order.userId?.email}</td>
                        <td>{order.phoneNumber}</td>
                        <td>{order.companyName}</td>
                        <td>{order.address}</td>
                        <td>{order.city}</td>
                        <td>{order.state}</td>
                        <td>{order.lorryCategory?.typeName || order.lorryCategory?.category}</td>
                        <td>{order.lorryType?.typeName || order.lorryType?.name}</td>
                        <td>{order.quantity}</td>
                        <td>{order.additionalFeatures || "-"}</td>

                        {/* Order Status */}
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`status-select ${order.status.toLowerCase()}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Payment Status */}
                        <td>
                          <select
                            value={order.payment?.status || "pending"}
                            onChange={(e) => updatePaymentStatus(order.payment?._id, e.target.value)}
                            className={`status-select ${order.payment?.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Payment Details */}
                        <td>{order.payment?.amount || "-"}</td>
                        <td>{order.payment?.paymentMethod || "-"}</td>
                        <td>
                          {order.payment?.receiptFile?.filePath ? (
                            <a
                              href={`http://localhost:5000${order.payment.receiptFile.filePath}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {order.payment.receiptFile.originalName || "Receipt"}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .search-bar {
          margin-bottom: 20px;
        }
        .search-bar input {
          width: 100%;
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 14px;
        }
        .search-bar input:focus {
          outline: none;
          border-color: #1e40af;
          box-shadow: 0 0 0 2px rgba(30,64,175,0.2);
        }

        .page-background {
          min-height: 100vh;
          background-color: #f9fafb;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 20px;
        }
        .orders-container {
          max-width: 95%;
          width: 100%;
        }
        .orders-title {
          font-size: 32px;
          font-weight: bold;
          color: #222;
          margin-bottom: 20px;
          text-align: left;
        }

        .orders-card {
          background-color: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          overflow: hidden;
          margin-bottom: 20px;
        }
        .table-wrapper {
          overflow-x: auto;
        }
        .payments-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .payments-table thead {
          background-color: #f5f5f5;
          text-transform: uppercase;
          font-size: 12px;
          color: #555;
        }
        .payments-table th,
        .payments-table td {
          padding: 8px 12px;
          text-align: center;
          vertical-align: middle;
          border-bottom: 1px solid #e5e5e5;
          white-space: nowrap;
        }
        .date-header {
          background-color: #e0e0e0;
          font-size: 16px;
          font-weight: 600;
          text-align: left;
          color: #333;
        }
        .payments-table tbody tr:hover {
          background-color: #fafafa;
          transition: background-color 0.2s;
        }
        .amount {
          font-weight: 600;
          color: #111;
        }
        .status-select {
          padding: 2px 6px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
        }
        .status-select.pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-select.ongoing {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .status-select.completed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-select.cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .status-select.verified {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-select.rejected {
          background-color: #fee2e2;
          color: #991b1b;
        }

        /* Tabs CSS */
        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        .tab-btn {
          padding: 6px 14px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-weight: 500;
        }
        .tab-btn.active {
          background-color: #1e40af;
          color: #fff;
          border-color: #1e40af;
        }

        /* Order Count Cards CSS */
        .order-count-cards {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .count-card {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          flex: 1;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .count-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .count-number {
          font-size: 24px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 6px;
        }
        .count-label {
          font-size: 14px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filter-group {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

.filter-group label {
  margin-bottom: 4px;
  font-weight: 500;
  color: #444;
}

.filter-group input,
.filter-group select {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
}
.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30,64,175,0.2);
}

      `}</style>
    </div>
  );
};

export default AdminOrders;

import React, { useEffect, useState } from "react";
import { Truck, Gear, CarFront, Tags } from "react-bootstrap-icons";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";

export default function DashboardHome() {
  const [counts, setCounts] = useState({ categories: 0, services: 0, models: 0, types: 0 });
  const [orderCounts, setOrderCounts] = useState({ Pending: 0, Ongoing: 0, Completed: 0, Cancelled: 0 });
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const ongoingOrders = orders.filter(o => o.status === "Ongoing");


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [catRes, servRes, modelRes, typeRes, orderRes] = await Promise.all([
          axiosInstance.get("http://localhost:5000/admin-categories"),
          axiosInstance.get("http://localhost:5000/admin-services"),
          axiosInstance.get("http://localhost:5000/admin-lorry-models"),
          axiosInstance.get("http://localhost:5000/admin-lorry-types"),
          axiosInstance.get("http://localhost:5000/admin-orders"),
        ]);

        setCounts({
          categories: catRes.data.length || 0,
          services: servRes.data.length || 0,
          models: modelRes.data.length || 0,
          types: typeRes.data.length || 0,
        });

        const statusCounts = { Pending: 0, Ongoing: 0, Completed: 0, Cancelled: 0 };
        orderRes.data.forEach((o) => { if (statusCounts[o.status] !== undefined) statusCounts[o.status]++; });
        setOrderCounts(statusCounts);
        setOrders(orderRes.data);
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };
    fetchCounts();
  }, []);

  const cards = [
    { icon: <Truck size={28} className="icon-color-1" />, label: "Categories", value: counts.categories, path: "/categories" },
    { icon: <Gear size={28} className="icon-color-2" />, label: "Services", value: counts.services, path: "/services" },
    { icon: <CarFront size={28} className="icon-color-3" />, label: "Models", value: counts.models, path: "/models" },
    { icon: <Tags size={28} className="icon-color-4" />, label: "Types", value: counts.types, path: "/types" },
  ];

  const pieData = [
    { name: "Pending", value: orderCounts.Pending },
    { name: "Ongoing", value: orderCounts.Ongoing },
    { name: "Completed", value: orderCounts.Completed },
    { name: "Cancelled", value: orderCounts.Cancelled },
  ];

  const lineData = Object.values(
    orders.reduce((acc, o) => {
      const date = new Date(o.createdAt).toLocaleDateString();
      if (!acc[date]) acc[date] = { date, Pending: 0, Ongoing: 0, Completed: 0, Cancelled: 0 };
      acc[date][o.status] = (acc[date][o.status] || 0) + 1;
      return acc;
    }, {})
  );

  const barData = Object.values(
    orders.reduce((acc, o) => {
      const category = o.lorryCategory?.category || "Other";
      if (!acc[category]) acc[category] = { category, Orders: 0 };
      acc[category].Orders++;
      return acc;
    }, {})
  );

  const COLORS = ["#fcd34d", "#3b82f6", "#10b981", "#ef4444"];

  return (
    <div className="dashboard">
      {/* Top Info Cards */}
      <div className="cards-grid">
        {cards.map((c, i) => (
          <div key={i} className="card" onClick={() => navigate(c.path)}>
            <div className="card-icon">{c.icon}</div>
            <div className="card-info">
              <p className="card-value">{c.value}</p>
              <p className="card-label">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      




      

      {/* Horizontal Charts */}
      <div className="charts-row">
        {/* Pie Chart */}
        <div className="chart-card">
          <h4>Orders by Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} label>
                {pieData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="chart-card">
          <h4>Orders Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Pending" stroke="#fcd34d" />
              <Line type="monotone" dataKey="Ongoing" stroke="#3b82f6" />
              <Line type="monotone" dataKey="Completed" stroke="#10b981" />
              <Line type="monotone" dataKey="Cancelled" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h4>Orders by Lorry Category</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend verticalAlign="bottom" />
              <Bar dataKey="Orders" fill="#3b82f6" radius={[10,10,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        
      </div>

      {/* Ongoing Orders Section */}
<div className="ongoing-orders-section">
  <h3>Ongoing Orders</h3>
  {ongoingOrders.length === 0 ? (
    <p className="no-orders">No ongoing orders.</p>
  ) : (
    <div className="table-wrapper">
      <table className="payments-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            {/* <th>Lorry Category</th>
            <th>Lorry Type</th>
            <th>Quantity</th>
            <th>Created Date</th> */}
          </tr>
        </thead>
        <tbody>
          {ongoingOrders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{o.userName || o.userId?.name}</td>
              <td>{o.email || o.userId?.email}</td>
              <td>{o.phoneNumber}</td>
              <td>{o.companyName}</td>
              {/* <td>{o.lorryCategory?.category || o.lorryCategory?.typeName}</td>
              <td>{o.lorryType?.typeName || o.lorryType?.name}</td>
              <td>{o.quantity}</td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>

      {/* CSS */}
      <style>{`
        .dashboard {
          padding: 40px 20px;
          background: linear-gradient(145deg, #f0f4f8, #e2e8f0);
          min-height: 100vh;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .card {
          display: flex;
          align-items: center;
          background: linear-gradient(145deg, #ffffff, #f9fafb);
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }

        .card-icon {
          margin-right: 15px;
          font-size: 2rem;
        }

        .icon-color-1 { color: #fbbf24; }
        .icon-color-2 { color: #22c55e; }
        .icon-color-3 { color: #3b82f6; }
        .icon-color-4 { color: #f87171; }

        .card-value { font-size: 1.8rem; font-weight: 700; color: #1e3a8a; margin: 0; }
        .card-label { font-size: 0.95rem; font-weight: 500; color: #6b7280; margin: 0; }

        .charts-row {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 20px;
          padding-bottom: 10px;
        }

        .chart-card {
          flex: 0 0 350px;
          background: #fff;
          border-radius: 20px;
          padding: 20px 25px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .chart-card h4 {
          text-align: center;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1e40af;
        }

        /* Scrollbar for horizontal charts */
        .charts-row::-webkit-scrollbar {
          height: 8px;
        }
        .charts-row::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
        .charts-row::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 4px;
        }

        .ongoing-orders-section {
  margin-top: 40px;
}

.ongoing-orders-section {
  margin-top: 40px;
  background-color: #fff;
  padding: 20px 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.ongoing-orders-section h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 20px;
}

.no-orders {
  text-align: center;
  color: #6b7280;
  padding: 20px 0;
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

.table-wrapper::-webkit-scrollbar {
  height: 8px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 4px;
}
.table-wrapper::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
}



      `}</style>
    </div>
  );
}

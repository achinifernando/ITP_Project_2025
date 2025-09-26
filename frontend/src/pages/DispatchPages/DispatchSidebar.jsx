// src/components/Sidebar.js
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaPlus,
  FaUserTie,
  FaTruck,
  FaTasks,
  FaSignOutAlt,
  FaMapMarkedAlt,
  FaChartLine,
  FaMapMarkerAlt,
} from "react-icons/fa";

export default function DispatchSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { path: "/dispatchDashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/add-delivery", label: "Add Delivery", icon: <FaPlus /> },
    { path: "/drivers", label: "Drivers", icon: <FaUserTie /> },
    { path: "/vehicles", label: "Vehicles", icon: <FaTruck /> },
    { path: "/assignments", label: "Assignments", icon: <FaTasks /> },
    { path: "/map", label: "Delivery Map", icon: <FaMapMarkedAlt /> },
    { path: "/reports", label: "Reports", icon: <FaChartLine /> },
    { path: "/gps-tracking", label: "GPS Tracking", icon: <FaMapMarkerAlt /> },
  ];

  return (
    <div
      style={{
        width: collapsed ? "60px" : "200px",
        backgroundColor: "#2d3e50",
        color: "#fff",
        minHeight: "100vh",
        transition: "width 0.3s",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            padding: "10px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          {!collapsed && (
            <div style={{ fontWeight: "bold", fontSize: "18px" }}>
              DeliverTrack
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: "18px",
              marginTop: "5px",
            }}
          >
            {collapsed ? "☰" : "✕"}
          </button>
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li
              key={item.path}
              style={{
                background:
                  location.pathname === item.path ? "#1a252f" : "transparent",
              }}
            >
              <Link
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 15px",
                  color: "#fff",
                  textDecoration: "none",
                }}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        style={{
          padding: "12px 15px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {!collapsed && (
          <div style={{ marginBottom: "8px" }}>
            <strong>User Name</strong>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>user@email.com</div>
          </div>
        )}
        <button
          style={{
            width: "100%",
            background: "#1a252f",
            border: "none",
            color: "#fff",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px",
          }}
          onClick={() => alert("Logout clicked")}
        >
          <FaSignOutAlt /> {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

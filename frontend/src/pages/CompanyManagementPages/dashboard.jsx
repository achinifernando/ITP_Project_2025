import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Truck,
  Gear,
  CarFront,
  Tags,
  Person,
  Wrench,
  Bag,
  Bell,
  Search,
  House,
} from "react-bootstrap-icons";

export default function DashboardLayout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const menuItems = [
    { icon: <House size={20} />, label: "Dashboard", to: "/company-manager-dashboard" },
    { icon: <Truck size={20} />, label: "Lorry Categories", to: "/categories" },
    { icon: <Gear size={20} />, label: "Services", to: "admin-services" },
    { icon: <CarFront size={20} />, label: "Lorry Models", to: "/models" },
    { icon: <Tags size={20} />, label: "Lorry Types", to: "/types" },
    { icon: <Person size={20} />, label: "Payroll", to: "/payroll" },
    { icon: <Wrench size={20} />, label: "Repair & Maintenance", to: "/repairs" },
    { icon: <Bag size={20} />, label: "Orders", to: "/orders" },
  ];

  const currentPage =
    menuItems.find(item =>
      item.to === "/company-manager-dashboard" ? location.pathname === "/company-manager-dashboard" : location.pathname.startsWith(item.to)
    )?.label || "Dashboard";

  // Filtered items for search
  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight matched text
  const highlightMatch = (label) => {
    if (!searchQuery) return label;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return label.split(regex).map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="search-bar d-flex align-items-center px-3 py-2">
          <Search size={18} className="me-2 text-muted" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>

        <ul className={`nav flex-column w-100 mt-3 ${isFocused ? "search-focused" : ""}`}>
          {filteredItems.length ? (
            filteredItems.map((item, index) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);

              return (
                <li key={index} className="nav-item my-2">
                  <Link
                    className={`nav-link d-flex align-items-center p-2 rounded hover-bg ${
                      isActive ? "active-link" : ""
                    }`}
                    to={item.to}
                  >
                    <span className="me-2">{item.icon}</span>
                    <span>{highlightMatch(item.label)}</span>
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="nav-item text-muted px-2">No matching menu found</li>
          )}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1">
        <div className="dashboard-header d-flex align-items-center justify-content-between px-4 py-3">
          <h2 className="mb-0">{currentPage}</h2>
          <div className="header-actions d-flex align-items-center gap-3">
            <div className="notification-icon position-relative">
              <Bell size={24} />
              <span className="notification-badge"></span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Outlet />
        </div>



        {/* quotation generator */}
      <Link to={`/companyManagerDashbord`}>
      <button className="book-meeting-btn">CompanyManagerDashbord</button></Link>
      </main>

      <style>{`
  /* Sidebar fixed width */
  .sidebar {
    width: 220px; /* fixed width */
    min-height: 100vh;
    background: #fff;
    padding: 20px;
    box-shadow: 2px 0 12px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
  }

  /* Search bar */
  .search-bar {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 5px 10px;
    margin-bottom: 15px;
  }

  .search-bar input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 0.95rem;
    color: #000; /* input text color */
  }

  /* Navigation links */
  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #000; /* font color black */
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .nav-link .bi { /* icons inside nav */
    color: #000; /* icon color black */
  }

  .nav-link:hover {
    background-color: #f0f8ff;
  }

  .active-link {
    background-color: #d0f0ff;
    font-weight: 600;
    color: #000; /* keep active text black */
  }

  /* Marked search highlight */
  .nav-link mark {
    background-color: #ffe58f;
    padding: 0 2px;
    border-radius: 2px;
  }

  /* Header */
  .dashboard-header {
    border-bottom: 1px solid #e5e5e5;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }

  .notification-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    background-color: red;
    border-radius: 50%;
  }
`}</style>


    </div>
  );

  
}

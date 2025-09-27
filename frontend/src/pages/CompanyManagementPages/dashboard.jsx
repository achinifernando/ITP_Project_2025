import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <>
    <div className="d-flex">
      {/* Sidebar */}
      <aside
        className="bg-dark text-white p-3"
        style={{ width: "250px", minHeight: "100vh" }}
      >
        <h4 className="mb-4">Dashboard</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link text-white" to="/categories">
              Lorry Categories
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/admin-services">
              Services
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/models">
              Lorry Model
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/types">
              Lorry Types
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-white" to="/payments">
              Payments
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link text-white" to="/payroll">
              Payroll
            </Link>
          </li>

          <li className="nav-item">
            <Link className="nav-link text-white" to="/repairs">
              Repair & Maintenance
            </Link>
          </li>

          {/* Orders Dropdown */}
          <li className="nav-item">
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle w-100 text-start"
                type="button"
                id="ordersDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Orders
              </button>
              <ul className="dropdown-menu" aria-labelledby="ordersDropdown">
                <li>
                  <Link className="dropdown-item" to="/orders?tab=new">
                    New Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders?tab=ongoing">
                    Ongoing Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders?tab=completed">
                    Completed Orders
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/orders?tab=rejected">
                    Rejected Orders
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>

    {/* quotation generator */}
      <Link to={`/companyManagerDashbord`}>
      <button className="book-meeting-btn">CompanyManagerDashbord</button></Link>
      </>
  );
}

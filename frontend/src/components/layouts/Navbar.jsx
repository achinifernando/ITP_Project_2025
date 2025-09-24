import React, { useState } from "react";
import { FaTimes, FaBars } from "react-icons/fa";
import SideMenu from "./SideMenu";
import "../../CSS/TaskManagerCSS/Navbar.css";


const NavBar = ({ activeMenu }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  const toggleSideMenu = () => {
    setOpenSideMenu((prev) => !prev);
  };

  return (
    <div className="navbar">
      <div className="navbar-content">
        <button
          className="menu-toggle-btn"
          onClick={toggleSideMenu}
          aria-label="Toggle menu"
        >
          {openSideMenu ? (
            <FaTimes className="menu-icon" />
          ) : (
            <FaBars className="menu-icon" />
          )}
        </button>

        <h2 className="navbar-title">Task Manager</h2>
        {/* Optional: Add user profile or other nav items here */}
      </div>

      {openSideMenu && (
        <div className="side-menu-container">
          <SideMenu
            activeMenu={activeMenu}
            onClose={() => setOpenSideMenu(false)}
          />
        </div>
      )}

      {openSideMenu && (
        <div
          className="menu-overlay"
          onClick={() => setOpenSideMenu(false)}
        />
      )}
    </div>
  );
};

export default NavBar;

import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_HR_DATA } from "../../utils/data";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";

const AttendanceSideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleMenuClick = (route) => {
    if (route && route !== "/logout" && route !== "logout") {
      navigate(route);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    
    if (clearUser) clearUser();
    
    navigate("/login", { replace: true });
    setTimeout(() => window.location.reload(), 100);
  };

  useEffect(() => {
    if (user?.role === 'hr_manager') {
      const menuWithoutLogout = SIDE_MENU_HR_DATA.filter(item => 
        !["/logout", "logout"].includes(item.path)
      );
      setSideMenuData(menuWithoutLogout);
    } else {
      setSideMenuData([]);
    }
  }, [user]);

  return (
    <div className="side-menu">
      <div className="user-info">
        <div className="profile-image-container">
          <img 
            src={user?.profileImageUrl || "/default-avatar.png"} 
            alt="Profile" 
            className="profile-image" 
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        {user?.role === "admin" && <div className="admin-badge">Admin</div>}
        <h5 className="user-name">{user?.name || "User"}</h5>
        <p className="user-email">{user?.email || ""}</p>
      </div>
      
      <nav className="menu-items">
        {sideMenuData.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeMenu === item.path ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
        
        <div className="menu-footer">
          <button className="menu-item logout-button" onClick={handleLogout}>
            <span className="menu-label">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AttendanceSideMenu;
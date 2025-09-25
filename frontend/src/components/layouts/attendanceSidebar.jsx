import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../../components/context/userContext";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_HR_DATA } from "../../utils/data";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";

const AttendanceSideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  useEffect(() => {
    if (user && user.role === 'hr_manager') {
      setSideMenuData(SIDE_MENU_HR_DATA);
    } else {
      // If user is not HR manager, set empty menu data
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

        {user?.role === "admin" && (
          <div className="admin-badge">Admin</div>
        )}

        <h5 className="user-name">{user?.name || ""}</h5>
        <p className="user-email">{user?.email || ""}</p>
      </div>
      
      <nav className="menu-items">
        {sideMenuData.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeMenu === item.path ? 'active' : ''}`}
            onClick={() => handleClick(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AttendanceSideMenu;
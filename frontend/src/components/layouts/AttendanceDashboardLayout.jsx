import React, { useContext, useState } from "react";
import { UserContext } from "../../components/context/userContext";
import { Navigate } from "react-router-dom";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";
import NavBar from "../layouts/attendanceNavbar";
import AttendanceSideMenu from "../layouts/attendanceSidebar";

const AttendanceDashboardLayout = ({ children, activeMenu, requiredRole }) => {
    const { user, loading } = useContext(UserContext);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect using Navigate component
        switch(user.role) {
            case 'admin':
                return <Navigate to="/admin/dashboard" replace />;
            case 'hr_manager':
                return <Navigate to="/attendance/dashboard" replace />;
            case 'member':
                return <Navigate to="/user/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return (
        <div className="dashboard-layout">
            <NavBar 
                activeMenu={activeMenu} 
                onMenuToggle={toggleSidebar}
                user={user}
            />
            
            <div className="dashboard-content">
                <div className={`side-menu-container ${isSidebarOpen ? 'open' : ''}`}>
                    <AttendanceSideMenu 
                        activeMenu={activeMenu}
                    />
                </div>
                
                <div 
                    className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}
                    onClick={() => isSidebarOpen && setIsSidebarOpen(false)}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboardLayout;

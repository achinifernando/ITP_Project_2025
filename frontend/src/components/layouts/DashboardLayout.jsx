import React, { useContext, useState } from "react";
import { UserContext } from "../../components/context/userContext";
import { Navigate } from "react-router-dom"; // Import Navigate component
import "../../CSS/TaskManagerCSS/Dashboard.css"
import NavBar from "../layouts/Navbar";
import SideMenu from "../layouts/SideMenu";

const DashboardLayout = ({ children, activeMenu, requiredRole, hideNavbar = false }) => {
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
            {!hideNavbar && (
                <NavBar 
                    activeMenu={activeMenu} 
                    onMenuToggle={toggleSidebar}
                    user={user}
                />
            )}
            
            <div className="dashboard-content">
                <div className={`side-menu-container ${isSidebarOpen ? 'open' : ''}`}>
                    <SideMenu 
                        activeMenu={activeMenu} 
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                        userRole={user.role}
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

export default DashboardLayout;
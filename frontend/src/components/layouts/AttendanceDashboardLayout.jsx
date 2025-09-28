import React, { useContext } from "react";
import { UserContext } from "../../components/context/userContext";
import { Navigate } from "react-router-dom";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";
import AttendanceSideMenu from "../layouts/attendanceSidebar";

const AttendanceDashboardLayout = ({ children, activeMenu, requiredRole }) => {
    const { user, loading } = useContext(UserContext);

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
        switch (user.role) {
            case "admin":
                return <Navigate to="/admin/dashboard" replace />;
            case "hr_manager":
                return <Navigate to="/attendance/dashboard" replace />;
            case "member":
                return <Navigate to="/user/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return (
        <div className="dashboard-layout">
            <div className="dashboard-content">
                <div className="side-menu-container">
                    <AttendanceSideMenu activeMenu={activeMenu} />
                </div>

                <div className="main-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AttendanceDashboardLayout;

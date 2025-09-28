import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";
import axiosInstance from "../../utils/axiosInstance";

// Define API paths if not already imported
const API_PATHS = {
  TASKS: {
    GET_DASHBOARD_DATA: "/api/dashboard",
  },
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AttendanceDashboard = () => {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = [
    { name: "Present", value: stats.present },
    { name: "Absent", value: stats.absent },
    { name: "Late", value: stats.late },
  ];

  return (
    <AttendanceDashboardLayout activeMenu="Dashboard" requiredRole="hr_manager">
      <div className="attendance-dashboard-page">
        {/* Page Header */}
        <header className="dashboard-header">
          <h1>Attendance Dashboard</h1>
        </header>

      

        {/* Attendance Pie Chart */}
        <div className="chart-section">
          <h2>Attendance Summary</h2>
          {isLoading ? (
            <div className="chart-placeholder">Loading chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AttendanceDashboardLayout>
  );
};

export default AttendanceDashboard;
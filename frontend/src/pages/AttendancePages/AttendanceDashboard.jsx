import React, { useEffect, useState } from "react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from "recharts";
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import "../../CSS/AttendanceCSS/AttendanceDashboard.css";
import axiosInstance from "../../utils/axiosInstance";

// Define API paths if not already imported
const API_PATHS = {
  ATTENDANCE: {
    GET_DASHBOARD_DATA: "/api/attendance/today",
    GET_TRENDS_DATA: "/api/attendance/trends",
  },
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AttendanceDashboard = () => {
  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrendsLoading, setIsTrendsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(API_PATHS.ATTENDANCE.GET_DASHBOARD_DATA);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTrendsData = async () => {
      try {
        setIsTrendsLoading(true);
        const res = await axiosInstance.get(API_PATHS.ATTENDANCE.GET_TRENDS_DATA + "?days=7");
        setTrends(res.data);
      } catch (err) {
        console.error("Error fetching trends data:", err);
      } finally {
        setIsTrendsLoading(false);
      }
    };

    fetchDashboardData();
    fetchTrendsData();
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

      

        {/* Attendance Bar Chart */}
        <div className="chart-section">
          <h2>Attendance Summary</h2>
          {isLoading ? (
            <div className="chart-placeholder">Loading chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attendance Trends Line Chart */}
        <div className="chart-section">
          <h2>Attendance Trends (Last 7 Days)</h2>
          {isTrendsLoading ? (
            <div className="chart-placeholder">Loading trends data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString();
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="present" 
                  stroke="#00C49F" 
                  strokeWidth={2}
                  name="Present"
                />
                <Line 
                  type="monotone" 
                  dataKey="absent" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Absent"
                />
                <Line 
                  type="monotone" 
                  dataKey="late" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Late"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AttendanceDashboardLayout>
  );
};

export default AttendanceDashboard;
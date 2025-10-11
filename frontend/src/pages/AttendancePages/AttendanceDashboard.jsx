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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadAttendanceReport = async (format = 'excel') => {
    try {
      setIsDownloading(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('format', format);

      const response = await axiosInstance.get(
        `/api/reports/export/attendance?${params.toString()}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `attendance-report-${timestamp}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attendance report:', error);
      alert('Failed to download attendance report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadEmployeeReport = async (format = 'excel') => {
    try {
      setIsDownloading(true);
      const response = await axiosInstance.get(
        `/api/reports/export/employees?format=${format}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `employees-report-${timestamp}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading employee report:', error);
      alert('Failed to download employee report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
          <div className="header-content">
            <h1>Attendance Dashboard</h1>
            <div className="header-actions">
              <button 
                className="download-report-btn"
                onClick={() => handleDownloadEmployeeReport('excel')}
                disabled={isDownloading}
              >
                📊 Employee Report (Excel)
              </button>
              <button 
                className="download-report-btn secondary"
                onClick={() => handleDownloadEmployeeReport('pdf')}
                disabled={isDownloading}
              >
                📄 Employee Report (PDF)
              </button>
            </div>
          </div>
        </header>

        {/* Download Section */}
        <div className="download-section">
          <h2>Download Attendance Report</h2>
          <div className="date-filter-container">
            <div className="date-input-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-input-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="download-buttons-group">
              <button
                className="download-report-btn primary"
                onClick={() => handleDownloadAttendanceReport('excel')}
                disabled={isDownloading}
              >
                {isDownloading ? '⏳ Downloading...' : '📥 Excel'}
              </button>
              <button
                className="download-report-btn secondary"
                onClick={() => handleDownloadAttendanceReport('pdf')}
                disabled={isDownloading}
              >
                {isDownloading ? '⏳ Downloading...' : '📄 PDF'}
              </button>
            </div>
          </div>
        </div>


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
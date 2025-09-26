import React, { useState, useEffect } from "react";
import axios from "axios";
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import AttendanceForm from "../../pages/AttendancePages/AttendanceForm";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import "../../CSS/AttendanceCSS/AttendancePage.css";

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchAttendance = async (page = 1, date = '') => {
    try {
      setError(null);
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 10 });
      if (date) params.append('date', date);
      
      console.log("Fetching attendance from:", `${BASE_URL}${API_PATHS.ATTENDANCE.GET_ALL}?${params}`);
      
      const res = await axios.get(`${BASE_URL}${API_PATHS.ATTENDANCE.GET_ALL}?${params}`);
      console.log("Attendance API response:", res.data);
      
      // Handle different response structures
      const responseData = res.data;
      
      // Check if records are in different possible structures
      let attendanceRecords = [];
      let totalPagesCount = 1;
      let currentPageNum = 1;
      
      if (Array.isArray(responseData)) {
        // If response is directly an array
        attendanceRecords = responseData;
      } else if (responseData.records) {
        // If response has records property
        attendanceRecords = responseData.records;
        totalPagesCount = responseData.totalPages || responseData.pages || 1;
        currentPageNum = responseData.currentPage || responseData.page || 1;
      } else if (responseData.data) {
        // If response has data property (common pattern)
        attendanceRecords = responseData.data.records || responseData.data;
        totalPagesCount = responseData.data.totalPages || responseData.data.pages || 1;
        currentPageNum = responseData.data.currentPage || responseData.data.page || 1;
      } else {
        // If response is an object with attendance data
        attendanceRecords = responseData.attendance || [];
      }
      
      setRecords(attendanceRecords);
      setTotalPages(totalPagesCount);
      setCurrentPage(currentPageNum);
      
    } catch (err) {
      console.error("Error fetching attendance:", err);
      let errorMessage = "Failed to load attendance records";
      
      if (err.response) {
        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.request) {
        errorMessage = "Network error: Unable to connect to server";
      }
      
      setError(errorMessage);
      setRecords([]); // Ensure records is empty on error
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySummary = async () => {
    try {
      console.log("Fetching summary from:", `${BASE_URL}${API_PATHS.ATTENDANCE.GET_TODAY}`);
      const res = await axios.get(`${BASE_URL}${API_PATHS.ATTENDANCE.GET_TODAY}`);
      console.log("Summary API response:", res.data);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
      // Set default summary on error
      setSummary({ total: 0, present: 0, absent: 0, late: 0 });
    }
  };

  useEffect(() => {
    fetchAttendance(1, selectedDate);
    fetchTodaySummary();
  }, [selectedDate]);

  const handleAttendanceUpdate = () => {
    // Refresh records and summary after form submission
    fetchAttendance(currentPage, selectedDate);
    fetchTodaySummary();
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchAttendance(newPage, selectedDate);
  };

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "-";
    try {
      return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "Invalid Time";
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (loading && records.length === 0) {
    return (
      <AttendanceDashboardLayout activeMenu="Attendance" requiredRole="hr_manager">
        <div className="attendance-page">
          <h1>Attendance Management</h1>
          <div className="loading">Loading records...</div>
        </div>
      </AttendanceDashboardLayout>
    );
  }

  return (
    <AttendanceDashboardLayout activeMenu="Attendance" requiredRole="hr_manager">
      <div className="attendance-page">
        <h1>Attendance Management</h1>

        {/* Today's Summary */}
        <div className="attendance-summary">
          <h2>Today's Summary</h2>
          <div className="summary-cards">
            <div className="summary-card total">
              <h3>Total Employees</h3>
              <p>{summary.total}</p>
            </div>
            <div className="summary-card present">
              <h3>Present</h3>
              <p>{summary.present}</p>
            </div>
            <div className="summary-card absent">
              <h3>Absent</h3>
              <p>{summary.absent}</p>
            </div>
            <div className="summary-card late">
              <h3>Late</h3>
              <p>{summary.late}</p>
            </div>
          </div>
        </div>

        {/* OTP Attendance Form */}
        <AttendanceForm onAttendanceUpdate={handleAttendanceUpdate} />

        {/* Attendance Records Table */}
        <div className="attendance-records">
          <div className="records-header">
            <h2>Attendance Records</h2>
            <div className="filters">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="date-filter"
              />
              <button 
                onClick={() => handleDateFilter('')}
                className="clear-filter"
              >
                Clear Filter
              </button>
              <button 
                onClick={() => fetchAttendance(currentPage, selectedDate)}
                className="refresh-button"
              >
                Refresh
              </button>
            </div>
          </div>
          
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => fetchAttendance(currentPage, selectedDate)} className="retry-button">
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="no-records">
              <p>No attendance records found for the selected date.</p>
              <button onClick={() => fetchAttendance(1, '')} className="retry-button">
                Load All Records
              </button>
            </div>
          ) : (
            <>
              <div className="table-info">
                <p>Showing {records.length} records</p>
              </div>
              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Employee ID</th>
                      <th>Date</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Hours Worked</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={record._id || record.id || index}>
                        <td>{record.employeeId?.name || record.employeeName || record.name || 'N/A'}</td>
                        <td>{record.employeeId?.employeeId || record.employeeId || record.employeeCode || 'N/A'}</td>
                        <td>{formatDate(record.date || record.attendanceDate)}</td>
                        <td>{formatTime(record.timeIn)}</td>
                        <td>{formatTime(record.timeOut)}</td>
                        <td>{record.hoursWorked ? `${record.hoursWorked} hrs` : '0 hrs'}</td>
                        <td>
                          <span className={`status ${(record.status || 'absent').toLowerCase()}`}>
                            {record.status || 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AttendanceDashboardLayout>
  );
};

export default AttendancePage;
import React, { useState } from 'react';
import axios from 'axios';
import { API_PATHS, BASE_URL } from '../../utils/apiPaths';
import AttendanceDashboardLayout from "../../components/layouts/AttendanceDashboardLayout";
import '../../CSS/AttendanceCSS/Reports.css';

const ReportsDownloadPage = () => {
  const [exportLoading, setExportLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('attendance'); // 'attendance' or 'employees'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    format: 'excel'
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleDownload = async () => {
    try {
      setExportLoading(true);
      setMessage({ text: '', type: '' });

      if (activeReport === 'attendance' && filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
        setMessage({ text: 'Start date cannot be after end date', type: 'error' });
        return;
      }

      const params = new URLSearchParams();
      if (activeReport === 'attendance') {
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
      }
      params.append('format', filters.format);

      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ text: 'Authentication required. Please log in.', type: 'error' });
        return;
      }

      const apiEndpoint = activeReport === 'attendance' 
        ? API_PATHS.REPORTS.EXPORT_ATTENDANCE 
        : API_PATHS.REPORTS.EXPORT_EMPLOYEES;

      const res = await axios.get(
        `${BASE_URL}${apiEndpoint}?${params}`,
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!res.data || res.data.size === 0) {
        throw new Error('Empty file received from server');
      }

      const contentType = res.headers['content-type'];
      let fileExtension = 'xlsx';
      let fileName = activeReport === 'attendance' ? 'attendance-report' : 'employees-report';

      if (contentType.includes('pdf')) {
        fileExtension = 'pdf';
      } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
        fileExtension = 'xlsx';
      }

      const timestamp = new Date().toISOString().split('T')[0];
      const fullFileName = `${fileName}-${timestamp}.${fileExtension}`;

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fullFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage({ 
        text: `${activeReport === 'attendance' ? 'Attendance' : 'Employees'} report downloaded successfully as ${fullFileName}`, 
        type: 'success' 
      });

    } catch (error) {
      console.error('Download error:', error);
      let errorMessage = `Failed to download ${activeReport} report`;

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to download reports.';
            break;
          case 404:
            errorMessage = 'Report service not available. Contact administrator.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message === 'Empty file received from server') {
        errorMessage = 'No data available for the selected period.';
      }

      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setExportLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      format: 'excel'
    });
    setMessage({ text: '', type: '' });
  };

  const isFormValid = () => {
    return !exportLoading;
  };

  const getReportInfo = () => {
    if (activeReport === 'attendance') {
      return {
        title: 'Attendance Report',
        description: 'Generate and download attendance reports in Excel or PDF format',
        showDateFilters: true
      };
    } else {
      return {
        title: 'Employees Report',
        description: 'Generate and download comprehensive employee data reports',
        showDateFilters: false
      };
    }
  };

  const reportInfo = getReportInfo();

  return (
    <AttendanceDashboardLayout activeMenu="Reports" requiredRole="hr_manager">
      <div className="reports-download-page">
        <div className="report-header">
          <h2>Download Reports</h2>
          <p>Generate and download various reports in Excel or PDF format</p>
        </div>

        <div className="report-type-selector">
          <div className="selector-tabs">
            <button 
              className={`tab-button ${activeReport === 'attendance' ? 'active' : ''}`}
              onClick={() => {
                setActiveReport('attendance');
                setMessage({ text: '', type: '' });
              }}
            >
              📅 Attendance Report
            </button>
            <button 
              className={`tab-button ${activeReport === 'employees' ? 'active' : ''}`}
              onClick={() => {
                setActiveReport('employees');
                setMessage({ text: '', type: '' });
              }}
            >
              👥 Employees Report
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="report-content">
          <div className="report-description">
            <h3>{reportInfo.title}</h3>
            <p>{reportInfo.description}</p>
          </div>

          <div className="report-filters">
            {reportInfo.showDateFilters && (
              <>
                <div className="filter-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    max={filters.endDate || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="filter-group">
                  <label htmlFor="endDate">End Date</label>
                  <input
                    id="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    min={filters.startDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </>
            )}

            <div className="filter-group">
              <label htmlFor="format">Report Format</label>
              <select
                id="format"
                value={filters.format}
                onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              >
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF (.pdf)</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={!isFormValid()}
            >
              {exportLoading ? (
                <>
                  <span className="spinner"></span>
                  Generating {activeReport === 'attendance' ? 'Attendance' : 'Employees'} Report...
                </>
              ) : (
                <>
                  <span className="download-icon">📥</span>
                  Download {activeReport === 'attendance' ? 'Attendance' : 'Employees'} Report
                </>
              )}
            </button>

            <button
              className="clear-btn"
              onClick={clearFilters}
              disabled={exportLoading}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </AttendanceDashboardLayout>
  );
};

export default ReportsDownloadPage;


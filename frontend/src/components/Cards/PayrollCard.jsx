import React, { useState } from "react";
import "../../CSS/TaskManagerCSS/PayrollCard.css";

const PayrollCard = ({ payrollData }) => {
  const [showHistory, setShowHistory] = useState(false);

  // Check if there's any meaningful data
  const hasData = payrollData && (
    payrollData.salaryInfo || 
    payrollData.currentPayroll || 
    (payrollData.currentMonthStats && Object.keys(payrollData.currentMonthStats).length > 0) ||
    (payrollData.payrollHistory && payrollData.payrollHistory.length > 0)
  );

  if (!hasData) {
    return (
      <div className="payroll-card">
        <div className="payroll-header">
          <h3>💰 Salary Information</h3>
        </div>
        <div className="payroll-empty">
          <div className="empty-icon">📋</div>
          <h4>No Payroll Data Available</h4>
          <p>Please contact your administrator to set up your salary information.</p>
          <div className="empty-hint">
            <p><strong>What you need:</strong></p>
            <ul>
              <li>✓ Salary information (hourly rate or basic salary)</li>
              <li>✓ Attendance records</li>
              <li>✓ Allowances and deductions (if applicable)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const {
    salaryInfo,
    // currentPayroll, // Not currently used but available for future features
    payrollHistory,
    currentMonthStats,
    allowances,
    deductions,
  } = payrollData;

  // Format currency
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return "Rs. 0.00";
    return `Rs. ${parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Format month string (YYYY-MM to Month YYYY)
  const formatMonth = (monthString) => {
    if (!monthString) return "";
    const [year, month] = monthString.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Calculate current month estimated salary
  const calculateEstimatedSalary = () => {
    if (!salaryInfo) return 0;

    let basicSalary = 0;
    let overtimePay = 0;

    if (salaryInfo.hourlyRate) {
      basicSalary = (salaryInfo.hourlyRate || 0) * (currentMonthStats?.totalHours || 0);
      overtimePay = (salaryInfo.overtimeRate || 0) * (currentMonthStats?.overtimeHours || 0);
    } else {
      basicSalary = salaryInfo.basicSalary || 0;
      overtimePay = (salaryInfo.overtimeRate || 0) * (currentMonthStats?.overtimeHours || 0);
    }

    const totalAllowances = allowances?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
    const totalDeductions = deductions?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    return basicSalary + overtimePay + totalAllowances - totalDeductions;
  };

  const estimatedSalary = calculateEstimatedSalary();

  return (
    <div className="payroll-card">
      <div className="payroll-header">
        <h3>💰 Salary Information</h3>
        <button
          className="toggle-history-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide History" : "View History"}
        </button>
      </div>

      {/* Current Month Summary */}
      <div className="payroll-current">
        <h4>Current Month Estimated Salary</h4>
        <div className="salary-amount">{formatCurrency(estimatedSalary)}</div>

        <div className="payroll-details-grid">
          {/* Salary Info */}
          {salaryInfo && (
            <div className="detail-section">
              <h5>Rate Information</h5>
              {salaryInfo.hourlyRate ? (
                <>
                  <div className="detail-row">
                    <span>Hourly Rate:</span>
                    <span>{formatCurrency(salaryInfo.hourlyRate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Hours Worked:</span>
                    <span>{currentMonthStats?.totalHours || 0} hrs</span>
                  </div>
                </>
              ) : (
                <div className="detail-row">
                  <span>Basic Salary:</span>
                  <span>{formatCurrency(salaryInfo.basicSalary)}</span>
                </div>
              )}
              {salaryInfo.overtimeRate > 0 && (
                <>
                  <div className="detail-row">
                    <span>Overtime Rate:</span>
                    <span>{formatCurrency(salaryInfo.overtimeRate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Overtime Hours:</span>
                    <span>{currentMonthStats?.overtimeHours || 0} hrs</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Attendance Stats */}
          {currentMonthStats && (
            <div className="detail-section">
              <h5>Attendance Summary</h5>
              <div className="detail-row">
                <span>Days Present:</span>
                <span className="stat-present">{currentMonthStats.daysPresent || 0}</span>
              </div>
              <div className="detail-row">
                <span>Days Late:</span>
                <span className="stat-late">{currentMonthStats.daysLate || 0}</span>
              </div>
              <div className="detail-row">
                <span>Days Absent:</span>
                <span className="stat-absent">{currentMonthStats.daysAbsent || 0}</span>
              </div>
            </div>
          )}

          {/* Allowances */}
          {allowances && allowances.length > 0 && (
            <div className="detail-section">
              <h5>Allowances</h5>
              {allowances.map((allowance, index) => (
                <div className="detail-row" key={index}>
                  <span>{allowance.description || "Allowance"}:</span>
                  <span className="stat-positive">
                    +{formatCurrency(allowance.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Deductions */}
          {deductions && deductions.length > 0 && (
            <div className="detail-section">
              <h5>Deductions</h5>
              {deductions.map((deduction, index) => (
                <div className="detail-row" key={index}>
                  <span>{deduction.description || "Deduction"}:</span>
                  <span className="stat-negative">
                    -{formatCurrency(deduction.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payroll History */}
      {showHistory && (
        <div className="payroll-history">
          <h4>Payroll History (Last 6 Months)</h4>
          {payrollHistory && payrollHistory.length > 0 ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Basic Salary</th>
                    <th>Overtime</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollHistory.map((record, index) => (
                    <tr key={index}>
                      <td>{formatMonth(record.month)}</td>
                      <td>{formatCurrency(record.basicSalary)}</td>
                      <td>{formatCurrency(record.overtimePay)}</td>
                      <td className="stat-positive">
                        {formatCurrency(record.totalAllowances)}
                      </td>
                      <td className="stat-negative">
                        {formatCurrency(record.totalDeductions)}
                      </td>
                      <td className="net-salary">
                        {formatCurrency(record.netSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-history">No payroll history available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollCard;

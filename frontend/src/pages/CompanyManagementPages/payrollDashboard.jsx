import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

const PayrollDashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  const getMonthYear = (date) => ({
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  const generatePayroll = async () => {
    setLoading(true);
    try {
      const { month, year } = getMonthYear(selectedDate);
      const res = await axiosInstance.post("http://localhost:5000/admin-payrolls/generate", {
        month,
        year,
      });
      setPayrolls(res.data.payrolls);
      alert(res.data.message);
    } catch (err) {
      console.error("Payroll generation error:", err);

  // Show detailed backend message if available
      if (err.response && err.response.data) {
        alert(`Error generating payroll: ${err.response.data.message || JSON.stringify(err.response.data)}`);
      } else {
        alert("Error generating payroll: " + err.message);
      }
    }
    setLoading(false);
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("http://localhost:5000/admin-payrolls");
      setPayrolls(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const printPayslip = (payroll, isMember = false) => {
    const printWindow = window.open("", "_blank");
    let rows = "";
    if (isMember) {
      rows = `
        <tr><th>Days Worked</th><td>${payroll.daysPresent}</td></tr>
        <tr><th>Total Hours</th><td>${payroll.totalHours}</td></tr>
        <tr><th>Overtime Hours</th><td>${payroll.overtimeHours}</td></tr>
        <tr><th>Hourly Rate</th><td>Rs. ${(payroll.hourlyRate || 0).toFixed(2)}</td></tr>
        <tr><th>Overtime Rate</th><td>Rs. ${(payroll.overtimeRate || 0).toFixed(2)}</td></tr>
        <tr><th>Total Salary</th><td>Rs. ${(payroll.netPay || 0).toFixed(2)}</td></tr>
      `;
    } else {
      rows = `
        <tr><th>Basic Salary</th><td>Rs. ${(payroll.basicSalary || 0).toFixed(2)}</td></tr>
        <tr><th>Total Allowances</th><td>Rs. ${(payroll.totalAllowances || 0).toFixed(2)}</td></tr>
        <tr><th>Total Deductions</th><td>Rs. ${(payroll.totalDeductions || 0).toFixed(2)}</td></tr>
        <tr><th>Gross Pay</th><td>Rs. ${(payroll.grossPay || 0).toFixed(2)}</td></tr>
        <tr><th>Net Pay</th><td>Rs. ${(payroll.netPay || 0).toFixed(2)}</td></tr>
      `;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${payroll.employeeId?.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Payslip - ${new Date(selectedDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <p><strong>Employee Name:</strong> ${payroll.employeeId?.name}</p>
          <p><strong>Role:</strong> ${payroll.employeeId?.role}</p>
          <table>${rows}</table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const memberPayrolls = payrolls.filter(p => p.employeeId?.role === "member");
  const otherPayrolls = payrolls.filter(p => p.employeeId?.role !== "member");

  const renderMemberTable = (data) => (
    <div className="payments-card">
      <div className="table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Days Worked</th>
              <th>Total Hours</th>
              <th>Overtime Hours</th>
              <th>Hourly Rate</th>
              <th>Overtime Rate</th>
              <th>Total Salary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? data.map(p => (
              <tr key={p._id}>
                <td>{p.employeeId?.name}</td>
                <td>{p.daysPresent}</td>
                <td>{p.totalHours}</td>
                <td>{p.overtimeHours}</td>
                <td>Rs. {(p.hourlyRate || 0).toFixed(2)}</td>
                <td>Rs. {(p.overtimeRate || 0).toFixed(2)}</td>
                <td>Rs. {(p.netPay || 0).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-success" onClick={() => printPayslip(p, true)}>Print Payslip</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="text-center">No member payroll records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOtherTable = (data) => (
    <div className="payments-card">
      <div className="table-wrapper">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
              <th>Basic Salary</th>
              <th>Total Allowances</th>
              <th>Total Deductions</th>
              <th>Gross Pay</th>
              <th>Net Pay</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? data.map(p => (
              <tr key={p._id}>
                <td>{p.employeeId?.name}</td>
                <td>{p.employeeId?.role}</td>
                <td>Rs. {(p.basicSalary || 0).toFixed(2)}</td>
                <td>Rs. {(p.totalAllowances || 0).toFixed(2)}</td>
                <td>Rs. {(p.totalDeductions || 0).toFixed(2)}</td>
                <td>Rs. {(p.grossPay || 0).toFixed(2)}</td>
                <td>Rs. {(p.netPay || 0).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-success" onClick={() => printPayslip(p)}>Print Payslip</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="8" className="text-center">No payroll records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="page-background">
      <div className="payments-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="payments-title mb-0">Payroll Dashboard</h1>
          <button 
            className="btn btn-success rounded-pill px-4 shadow-lg"
            onClick={() => navigate("/manage-salary")}
            style={{
              background: "linear-gradient(90deg, #56ab2f, #a8e063)",
              border: "none",
              fontWeight: "600"
            }}
          >
            💰 Manage Salary Info
          </button>
        </div>

        <div className="d-flex align-items-center gap-3 mb-4">
          <label>Select Month:</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="MM/yyyy"
            showMonthYearPicker
          />
          <button className="btn btn-primary" onClick={generatePayroll} disabled={loading}>
            {loading ? "Processing..." : "Generate Payroll for All"}
          </button>
        </div>

        <div className="date-group">
          <h2>Members</h2>
          {renderMemberTable(memberPayrolls)}

          <h2>Other Roles</h2>
          {renderOtherTable(otherPayrolls)}
        </div>
      </div>

      <style>{`
        .page-background { min-height: 100vh; background-color: #f2f2f2; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; }
        .payments-container { max-width: 95%; width: 100%; }
        .payments-title { font-size: 32px; font-weight: bold; color: #222; margin-bottom: 20px; text-align: left; }
        .date-group { margin-bottom: 40px; }
        .payments-card { background-color: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 30px; }
        .table-wrapper { overflow-x: auto; }
        .payments-table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: auto; }
        .payments-table thead { background-color: #f5f5f5; text-transform: uppercase; font-size: 12px; color: #555; }
        .payments-table th, .payments-table td { padding: 8px 12px; text-align: center; vertical-align: middle; border-bottom: 1px solid #e5e5e5; white-space: nowrap; }
        .payments-table tbody tr:hover { background-color: #fafafa; transition: background-color 0.2s; }
        .btn-primary { background-color: #1d4ed8; border: none; }
        .btn-primary:hover { background-color: #2563eb; }
        .btn-outline-success { padding: 4px 10px; font-size: 12px; border: 1px solid #16a34a; color: #16a34a; border-radius: 6px; cursor: pointer; background: transparent; }
        .btn-outline-success:hover { background-color: #16a34a; color: #fff; }
      `}</style>
    </div>
  );
};

export default PayrollDashboard;

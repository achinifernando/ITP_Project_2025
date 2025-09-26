import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PayrollDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);

  // Helper to extract month/year from Date
  const getMonthYear = (date) => {
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  };

  const generatePayroll = async () => {
    setLoading(true);
    try {
      const { month, year } = getMonthYear(selectedDate);
      const res = await axiosInstance.post("http://localhost:5000/admin-payroll/generate-all", {
        month,
        year,
      });
      setPayrolls(res.data.payrolls);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Error generating payroll");
    }
    setLoading(false);
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("http://localhost:5000/admin-payroll");
      setPayrolls(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  return (
    <div className="container mt-4">
      <h2>HR Payroll Dashboard</h2>

      <div className="d-flex align-items-center gap-3 my-3">
        <label>Select Month:</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="MM/yyyy"
          showMonthYearPicker
        />
        <button className="btn btn-primary" onClick={generatePayroll} disabled={loading}>
          {loading ? "Processing..." : "Generate Payroll for All"}
        </button>
      </div>

      <table className="table table-bordered table-striped mt-3">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Role</th>
            <th>Days Present</th>
            <th>Days Absent</th>
            <th>Days Late</th>
            <th>Total Hours</th>
            <th>Overtime Hours</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.length > 0 ? (
            payrolls.map((p) => (
              <tr key={p._id}>
                <td>{p.employeeId.name}</td>
                <td>{p.employeeId.role}</td>
                <td>{p.daysPresent}</td>
                <td>{p.daysAbsent}</td>
                <td>{p.daysLate}</td>
                <td>{p.totalHours}</td>
                <td>{p.overtimeHours}</td>
                <td>{p.grossPay}</td>
                <td>{p.deductions}</td>
                <td>{p.netPay}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center">
                No payroll records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PayrollDashboard;

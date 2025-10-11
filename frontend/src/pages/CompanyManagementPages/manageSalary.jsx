import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance"; 

export default function ManageSalary() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");
  const [salaryInfoId, setSalaryInfoId] = useState(null);
  const [existingSalaries, setExistingSalaries] = useState([]);

  // Fetch all employees
  useEffect(() => {
    axiosInstance
      .get("http://localhost:5000//api/users")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch all salary info
  const fetchSalaries = () => {
    axiosInstance
      .get("http://localhost:5000/admin-salary-info/all")
      .then((res) => setExistingSalaries(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  // When employee is selected, check if salary info exists
  const handleEmployeeChange = async (empId) => {
    setSelectedEmployee(empId);
    const emp = employees.find((e) => e._id === empId);
    setEmployeeRole(emp?.role || "");

    // Reset fields
    setBasicSalary("");
    setHourlyRate("");
    setOvertimeRate("");
    setSalaryInfoId(null);

    if (empId) {
      try {
        const res = await axiosInstance.get(`http://localhost:5000/admin-salary-info/${empId}`);
        const data = res.data;
        setBasicSalary(data.basicSalary || "");
        setHourlyRate(data.hourlyRate || "");
        setOvertimeRate(data.overtimeRate || "");
        setSalaryInfoId(data._id);
      } catch (err) {
        // No salary info exists yet
        console.log("No salary info found for this employee");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      employeeId: selectedEmployee,
      basicSalary: parseFloat(basicSalary) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      overtimeRate: parseFloat(overtimeRate) || 0,
    };

    try {
      if (salaryInfoId) {
        // Update existing
        await axiosInstance.put(`http://localhost:5000/admin-salary-info/update/${salaryInfoId}`, payload);
        alert("Salary info updated successfully!");
      } else {
        // Add new
        await axiosInstance.post("http://localhost:5000/admin-salary-info/add", payload);
        alert("Salary info added successfully!");
      }
      fetchSalaries();
      // Reset form
      setSelectedEmployee("");
      setEmployeeRole("");
      setBasicSalary("");
      setHourlyRate("");
      setOvertimeRate("");
      setSalaryInfoId(null);
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  const deleteSalary = async (id) => {
    if (window.confirm("Are you sure you want to delete this salary info?")) {
      try {
        await axiosInstance.delete(`http://localhost:5000/admin-salary-info/delete/${id}`);
        alert("Salary info deleted");
        fetchSalaries();
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  return (
    <div className="page-background">
      <div className="container py-5">
        <h1 className="title">Manage Salary Information</h1>

        {/* Form */}
        <div className="form-card">
          <h3 className="mb-4">Add/Update Salary Info</h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="fw-semibold mb-2">Select Employee *</label>
                <select
                  className="form-control p-3 rounded-3"
                  value={selectedEmployee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  required
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              {employeeRole && (
                <div className="col-md-6 mb-3">
                  <label className="fw-semibold mb-2">Role</label>
                  <input
                    type="text"
                    className="form-control p-3 rounded-3"
                    value={employeeRole}
                    disabled
                  />
                </div>
              )}
            </div>

            {selectedEmployee && (
              <>
                {employeeRole !== "member" && (
                  <div className="mb-3">
                    <label className="fw-semibold mb-2">Basic Salary (Monthly) *</label>
                    <input
                      type="number"
                      className="form-control p-3 rounded-3"
                      placeholder="e.g., 30000"
                      value={basicSalary}
                      onChange={(e) => setBasicSalary(e.target.value)}
                      required={employeeRole !== "member"}
                    />
                  </div>
                )}

                {employeeRole === "member" && (
                  <div className="mb-3">
                    <label className="fw-semibold mb-2">Hourly Rate *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control p-3 rounded-3"
                      placeholder="e.g., 50.00"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      required={employeeRole === "member"}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="fw-semibold mb-2">Overtime Rate (per hour)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control p-3 rounded-3"
                    placeholder="e.g., 75.00"
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 p-3 rounded-3 fw-semibold"
                >
                  {salaryInfoId ? "Update Salary Info" : "Add Salary Info"}
                </button>
              </>
            )}
          </form>
        </div>

        {/* Existing Salary Info Table */}
        <div className="table-card mt-5">
          <h3 className="mb-4">Existing Salary Information</h3>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Role</th>
                  <th>Basic Salary</th>
                  <th>Hourly Rate</th>
                  <th>Overtime Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {existingSalaries.length ? (
                  existingSalaries.map((s) => (
                    <tr key={s._id}>
                      <td>{s.employeeId?.name || "N/A"}</td>
                      <td>{s.employeeId?.role || "N/A"}</td>
                      <td>Rs. {(s.basicSalary || 0).toFixed(2)}</td>
                      <td>Rs. {(s.hourlyRate || 0).toFixed(2)}</td>
                      <td>Rs. {(s.overtimeRate || 0).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteSalary(s._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No salary information added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .page-background {
          min-height: 100vh;
          background: linear-gradient(135deg, #f2f2f2, #e0e0e0);
        }
        .title {
          font-size: 32px;
          font-weight: bold;
          color: #222;
          margin-bottom: 30px;
        }
        .form-card, .table-card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .btn-primary {
          background: linear-gradient(90deg, #4facfe, #00f2fe);
          border: none;
        }
        .btn-primary:hover {
          background: linear-gradient(90deg, #00f2fe, #4facfe);
        }
        .table thead {
          background-color: #f5f5f5;
        }
      `}</style>
    </div>
  );
}

// src/components/Reports.js
import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts"; // Charting library
import * as XLSX from "xlsx"; // For exporting Excel reports

const BACKEND_URL = "http://localhost:5000";

const Reports = () => {
  // Filter selections
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // Time filter: week/month/quarter/year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Year filter
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Month filter (1–12)

  // UI control
  const [chartView, setChartView] = useState("bar");// Toggle between Bar or Pie chart
  const [reportType, setReportType] = useState("deliveries"); // Choose which report to show
  
  // Data fetching state
  const [error, setError] = useState(null);// Store API errors
  const [loading, setLoading] = useState(false);// Show loader during API calls

   // Report data structures
  const [reportData, setReportData] = useState({
    total: 0,
    completed: 0,
    ongoing: 0,
    pending: 0,
    assigned: 0,
    availableDrivers: 0,
    availableVehicles: 0,
  });
  const [driverPerformance, setDriverPerformance] = useState([]);
  const [vehicleUtilization, setVehicleUtilization] = useState([]);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Prepare data for charts
  const deliveryStatusData = [
    { name: "Completed", value: reportData.completed },
    { name: "Ongoing", value: reportData.ongoing },
    { name: "Pending", value: reportData.pending },
    { name: "Assigned", value: reportData.assigned },
  ];

  const resourceAvailabilityData = [
    { name: "Available Drivers", value: reportData.availableDrivers },
    { name: "Available Vehicles", value: reportData.availableVehicles },
  ];

  // Fetch report data from backend
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (reportType === "deliveries") {
        // For delivery stats, we need to fetch all data and calculate
        const [deliveriesRes, driversRes, vehiclesRes] = await Promise.all([
          axiosInstance.get(`${BACKEND_URL}/deliveries`),
          axiosInstance.get(`${BACKEND_URL}/drivers`),
          axiosInstance.get(`${BACKEND_URL}/vehicles`),
        ]);

        const deliveries = deliveriesRes.data;
        const drivers = driversRes.data;
        const vehicles = vehiclesRes.data;

        // Calculate statistics from real data
        const total = deliveries.length;
        const completed = deliveries.filter(
          (d) => d.status === "Completed" || d.status === "completed"
        ).length;
        const ongoing = deliveries.filter(
          (d) => d.status === "Ongoing" || d.status === "ongoing"
        ).length;
        const pending = deliveries.filter(
          (d) => d.status === "Pending" || d.status === "pending"
        ).length;
        const assigned = deliveries.filter(
          (d) => d.status === "Assigned" || d.status === "assigned"
        ).length;

        const availableDrivers = drivers.filter((d) => d.isAvailable).length;
        const availableVehicles = vehicles.filter((v) => v.isAvailable).length;

        // Update state
        setReportData({
          total,
          completed,
          ongoing,
          pending,
          assigned,
          availableDrivers,
          availableVehicles,
        });
      } else if (reportType === "drivers") {
        // Calculate driver performance from real data
        const [deliveriesRes, driversRes] = await Promise.all([
          axiosInstance.get(`${BACKEND_URL}/deliveries`),
          axiosInstance.get(`${BACKEND_URL}/drivers`),
        ]);

        const deliveries = deliveriesRes.data;
        const drivers = driversRes.data;

        // Calculate driver completion rate
        const performance = drivers.map((driver) => {
          const driverDeliveries = deliveries.filter(
            (d) => d.driver && d.driver._id === driver._id
          );

          const completed = driverDeliveries.filter(
            (d) => d.status === "Completed" || d.status === "completed"
          ).length;

          return {
            driverId: driver._id,
            driverName: driver.name,
            totalAssignments: driverDeliveries.length,
            completedDeliveries: completed,
            completionRate:
              driverDeliveries.length > 0
                ? Math.round((completed / driverDeliveries.length) * 100)
                : 0,
          };
        });

        setDriverPerformance(performance);
      } else if (reportType === "vehicles") {
        // Calculate vehicle utilization from real data
        const [deliveriesRes, vehiclesRes] = await Promise.all([
          axiosInstance.get(`${BACKEND_URL}/deliveries`),
          axiosInstance.get(`${BACKEND_URL}/vehicles`),
        ]);

        const deliveries = deliveriesRes.data;
        const vehicles = vehiclesRes.data;

        const utilization = vehicles.map((vehicle) => {
          const vehicleDeliveries = deliveries.filter(
            (d) => d.vehicle && d.vehicle._id === vehicle._id
          );

          const completed = vehicleDeliveries.filter(
            (d) => d.status === "Completed" || d.status === "completed"
          ).length;

          return {
            vehicleId: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            type: vehicle.type,
            totalAssignments: vehicleDeliveries.length,
            completedDeliveries: completed,
            utilizationRate:
              vehicleDeliveries.length > 0
                ? Math.round(
                    (vehicleDeliveries.length /
                      (vehicleDeliveries.length + 5)) *
                      100
                  )
                : 0,
          };
        });

        setVehicleUtilization(utilization);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again.");
      setLoading(false);
    }
  }, [reportType]); // Fixed: Removed unnecessary dependencies

  // Process data when component mounts or filters change
  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Function to download report as Excel
  const downloadReport = () => {
    let worksheetData = [];
    let fileName = "";

    if (reportType === "deliveries") {
      fileName = `Delivery_Report_${selectedPeriod}_${selectedYear}_${selectedMonth}.xlsx`;
      worksheetData = [
        ["Delivery Statistics Report"],
        [""],
        ["Period", selectedPeriod],
        ["Year", selectedYear],
        ["Month", selectedMonth],
        [""],
        ["Metric", "Value"],
        ["Total Deliveries", reportData.total],
        ["Completed Deliveries", reportData.completed],
        ["Ongoing Deliveries", reportData.ongoing],
        ["Pending Deliveries", reportData.pending],
        ["Assigned Deliveries", reportData.assigned],
        ["Available Drivers", reportData.availableDrivers],
        ["Available Vehicles", reportData.availableVehicles],
      ];
    } else if (reportType === "drivers") {
      fileName = `Driver_Performance_Report_${selectedPeriod}_${selectedYear}_${selectedMonth}.xlsx`;
      worksheetData = [
        ["Driver Performance Report"],
        [""],
        ["Period", selectedPeriod],
        ["Year", selectedYear],
        ["Month", selectedMonth],
        [""],
        [
          "Driver Name",
          "Total Assignments",
          "Completed Deliveries",
          "Completion Rate (%)",
        ],
      ];

      driverPerformance.forEach((driver) => {
        worksheetData.push([
          driver.driverName,
          driver.totalAssignments,
          driver.completedDeliveries,
          driver.completionRate,
        ]);
      });
    } else if (reportType === "vehicles") {
      fileName = `Vehicle_Utilization_Report_${selectedPeriod}_${selectedYear}_${selectedMonth}.xlsx`;
      worksheetData = [
        ["Vehicle Utilization Report"],
        [""],
        ["Period", selectedPeriod],
        ["Year", selectedYear],
        ["Month", selectedMonth],
        [""],
        [
          "Vehicle Number",
          "Type",
          "Total Assignments",
          "Completed Deliveries",
          "Utilization Rate (%)",
        ],
      ];

      vehicleUtilization.forEach((vehicle) => {
        worksheetData.push([
          vehicle.vehicleNumber,
          vehicle.type,
          vehicle.totalAssignments,
          vehicle.completedDeliveries,
          vehicle.utilizationRate,
        ]);
      });
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Report");

    // Download the Excel file
    XLSX.writeFile(wb, fileName);
  };

  // Handle filter changes
  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleChartViewChange = (view) => {
    setChartView(view);
  };

  if (loading) {
    return (
      <div
        className="reports-container"
        style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
      >
        <h2>Analytics & Reports</h2>
        <div style={{ textAlign: "center", padding: "40px" }}>
          Loading report data...
        </div>
      </div>
    );
  }

  return (
    <div
      className="reports-container"
      style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}
    >
      <h2>Analytics & Reports</h2>

      {error && (
        <div
          style={{
            color: "red",
            marginBottom: "15px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters and Download Button */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div>
            <label htmlFor="reportType">Report Type: </label>
            <select
              id="reportType"
              value={reportType}
              onChange={handleReportTypeChange}
              style={{ padding: "5px", borderRadius: "4px" }}
            >
              <option value="deliveries">Delivery Statistics</option>
              <option value="drivers">Driver Performance</option>
              <option value="vehicles">Vehicle Utilization</option>
            </select>
          </div>

          <div>
            <label htmlFor="period">Period: </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={handlePeriodChange}
              style={{ padding: "5px", borderRadius: "4px" }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label htmlFor="year">Year: </label>
            <select
              id="year"
              value={selectedYear}
              onChange={handleYearChange}
              style={{ padding: "5px", borderRadius: "4px" }}
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div>
            <label htmlFor="month">Month: </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              style={{ padding: "5px", borderRadius: "4px" }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => handleChartViewChange("bar")}
              style={{
                padding: "5px 10px",
                marginRight: "5px",
                backgroundColor: chartView === "bar" ? "#007bff" : "#f8f9fa",
                color: chartView === "bar" ? "white" : "black",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Bar Chart
            </button>
            <button
              onClick={() => handleChartViewChange("pie")}
              style={{
                padding: "5px 10px",
                backgroundColor: chartView === "pie" ? "#007bff" : "#f8f9fa",
                color: chartView === "pie" ? "white" : "black",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Pie Chart
            </button>
          </div>
        </div>

        <button
          onClick={downloadReport}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Download Report
        </button>
      </div>

      {/* Report Content */}
      {reportType === "deliveries" && (
        <div>
          <h3>Delivery Statistics</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h4>Delivery Status Distribution</h4>
              <div style={{ height: "300px" }}>
                {chartView === "bar" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deliveryStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deliveryStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deliveryStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <h4>Resource Availability</h4>
              <div style={{ height: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceAvailabilityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resourceAvailabilityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Key Metrics</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "15px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <h5>Total Deliveries</h5>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#007bff",
                  }}
                >
                  {reportData.total}
                </p>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <h5>Completed</h5>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#28a745",
                  }}
                >
                  {reportData.completed}
                </p>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <h5>Ongoing</h5>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#ffc107",
                  }}
                >
                  {reportData.ongoing}
                </p>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <h5>Pending</h5>
                <p
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#dc3545",
                  }}
                >
                  {reportData.pending}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportType === "drivers" && (
        <div>
          <h3>Driver Performance</h3>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Driver Completion Rates</h4>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={driverPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="driverName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    fill="#8884d8"
                  />
                  <Bar
                    dataKey="totalAssignments"
                    name="Total Assignments"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Driver Performance Details</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Driver Name
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Total Assignments
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Completed Deliveries
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {driverPerformance.map((driver) => (
                  <tr key={driver.driverId}>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {driver.driverName}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {driver.totalAssignments}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {driver.completedDeliveries}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {driver.completionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === "vehicles" && (
        <div>
          <h3>Vehicle Utilization</h3>
          <div
            style={{
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Vehicle Utilization Rates</h4>
            <div style={{ height: "400px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={vehicleUtilization}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="vehicleNumber"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="utilizationRate"
                    name="Utilization Rate (%)"
                    fill="#8884d8"
                  />
                  <Bar
                    dataKey="totalAssignments"
                    name="Total Assignments"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              backgroundColor: "white",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <h4>Vehicle Utilization Details</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Vehicle Number
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Total Assignments
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Completed Deliveries
                  </th>
                  <th
                    style={{
                      padding: "10px",
                      textAlign: "center",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Utilization Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicleUtilization.map((vehicle) => (
                  <tr key={vehicle.vehicleId}>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {vehicle.vehicleNumber}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {vehicle.type}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {vehicle.totalAssignments}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {vehicle.completedDeliveries}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {vehicle.utilizationRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

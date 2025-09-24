import React, { useContext, useState, useEffect, useCallback } from "react";
import { useUserAuth } from "../../../hooks/useUserAuth";
import { UserContext } from "../../../context/userContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";
import InfoCard from "../../Cards/InfoCard";
import TaskListTable from "../../layouts/TaskListTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const UserDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [chartData, setChartData] = useState({
    taskDistribution: [],
    priorityDistribution: [],
    monthlyData: []
  });

  // ✅ Utility: format numbers with thousand separators
  const addThousandSeparator = (num) => {
    if (num == null || isNaN(num)) return "";
    const [intPart, fracPart] = num.toString().split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fracPart ? `${formattedInt}.${fracPart}` : formattedInt;
  };

  // ✅ Prepare chart data safely
  const prepareChartData = useCallback((data) => {
    if (!data) return;

    const charts = data.charts || {};

    const taskDistribution = [
      { name: "Pending", value: charts?.taskDistribution?.Pending || 0 },
      { name: "In Progress", value: charts?.taskDistribution?.InProgress || 0 },
      { name: "Completed", value: charts?.taskDistribution?.Completed || 0 }
    ];

    const priorityDistribution = [
      { priority: "Low", tasks: charts?.taskPriorityLevels?.Low || 0 },
      { priority: "Medium", tasks: charts?.taskPriorityLevels?.Medium || 0 },
      { priority: "High", tasks: charts?.taskPriorityLevels?.High || 0 }
    ];

    const monthlyData = Object.entries(data?.monthlyCompletion || {}).map(
      ([month, count]) => ({ month, completed: count })
    );

    setChartData({ taskDistribution, priorityDistribution, monthlyData });

    // Debug logs
    console.log("Prepared taskDistribution:", taskDistribution);
    console.log("Prepared priorityDistribution:", priorityDistribution);
    console.log("Prepared monthlyData:", monthlyData);
  }, []);

  // ✅ Fetch dashboard data
  const getDashboardData = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_USER_DASHBOARD_DATA);

      console.log("Full API response:", response.data);

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [prepareChartData]);

  // ✅ Navigation
  const onSeeMore = () => navigate("/admin/tasks");

  // ✅ Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

  // ✅ Load data on mount
  useEffect(() => {
    if (user) {
      getDashboardData();
    }

    const date = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, [user, getDashboardData]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Welcome! {user?.name || user?.email}!</h1>
        <p className="date-display">{currentDate}</p>

        {/* ✅ Dashboard Stats */}
        <div className="dashboard-stats">
          <InfoCard
            label="Total Tasks"
            value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
          />
          <InfoCard
            label="Pending Tasks"
            value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
          />
          <InfoCard
            label="In Progress Tasks"
            value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
          />
          <InfoCard
            label="Completed Tasks"
            value={addThousandSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
          />
        </div>

        {/* ✅ Charts Section */}
        <div className="charts-section">
          {/* Pie Chart */}
          <div className="chart-container">
            <h4 className="chart-title">Task Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.taskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={130}
                  innerRadius={100}
                >
                  {chartData.taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-container">
            <h4 className="chart-title">Task Priority Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
                <Legend />
                <Bar dataKey="tasks" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Completion Trend */}
          {chartData.monthlyData.length > 0 && (
            <div className="chart-container full-width">
              <h4 className="chart-title">Monthly Completion Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} tasks`, "Completed"]} />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Recent Tasks */}
      <div className="recent-tasks-section">
        <div className="recent-tasks-header">
          <h5>Recent Tasks</h5>
          <button className="see-all-btn" onClick={onSeeMore}>
            See All
          </button>
        </div>
        <TaskListTable tableData={dashboardData?.recentTasks || []} />
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;

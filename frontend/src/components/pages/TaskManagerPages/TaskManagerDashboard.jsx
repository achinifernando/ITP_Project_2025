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

const Dashboard = () => {
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
  const [loading, setLoading] = useState(true);

  // Format numbers with thousand separators
  const addThousandSeparator = (num) => {
    if (num == null || isNaN(num)) return "0";
    const [intPart, fracPart] = num.toString().split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return fracPart ? `${formattedInt}.${fracPart}` : formattedInt;
  };

  // Prepare chart data
  const prepareChartData = useCallback((data) => {
    console.log("Preparing chart data from:", data);
    
    // Handle different possible response structures
    const taskStats = data?.taskStats || data?.charts || data;
    
    const taskDistribution = [
      { name: "Pending", value: taskStats?.pendingTasks || taskStats?.taskDistribution?.Pending || 0 },
      { name: "In Progress", value: taskStats?.inProgress || taskStats?.taskDistribution?.InProgress || 0 },
      { name: "Completed", value: taskStats?.completedTasks || taskStats?.taskDistribution?.Completed || 0 }
    ];

    const priorityDistribution = [
      { priority: "Low", tasks: taskStats?.priorityDistribution?.Low || taskStats?.taskPriorityLevels?.Low || 0 },
      { priority: "Medium", tasks: taskStats?.priorityDistribution?.Medium || taskStats?.taskPriorityLevels?.Medium || 0 },
      { priority: "High", tasks: taskStats?.priorityDistribution?.High || taskStats?.taskPriorityLevels?.High || 0 }
    ];

    const monthlyData = Object.entries(data?.monthlyCompletion || data?.monthlyData || {}).map(
      ([month, count]) => ({ month, completed: count })
    );

    setChartData({ taskDistribution, priorityDistribution, monthlyData });
  }, []);

  // Fetch dashboard data
  const getDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA);
      
      console.log("Full API response:", response.data);
      
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [prepareChartData]);

  const onSeeMore = () => navigate("/admin/tasks");

  const COLORS = ["#FF8042", "#0088FE", "#00C49F", "#FFBB28", "#8884D8", "#82CA9D"];

  useEffect(() => {
    if (user) {
      getDashboardData();
    }

    const date = new Date();
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, [user, getDashboardData]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Dashboard">
        <div className="dashboard-loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Welcome! {user?.name || user?.email}</h1>
        <p className="date-display">{currentDate}</p>

        {/* Dashboard Stats in 2 columns */}
        <div className="dashboard-stats-grid">
          <div className="stats-column">
            <InfoCard
              label="Total Tasks"
              value={addThousandSeparator(
                dashboardData?.totalTasks || 
                dashboardData?.taskStats?.totalTasks || 
                dashboardData?.charts?.taskDistribution?.All || 
                0
              )}
              icon="📋"
            />
            <InfoCard
              label="Pending Tasks"
              value={addThousandSeparator(
                dashboardData?.pendingTasks || 
                dashboardData?.taskStats?.pendingTasks || 
                dashboardData?.charts?.taskDistribution?.Pending || 
                0
              )}
              icon="⏳"
            />
          </div>
          <div className="stats-column">
            <InfoCard
              label="In Progress Tasks"
              value={addThousandSeparator(
                dashboardData?.inProgress || 
                dashboardData?.taskStats?.inProgress || 
                dashboardData?.charts?.taskDistribution?.InProgress || 
                0
              )}
              icon="🚀"
            />
            <InfoCard
              label="Completed Tasks"
              value={addThousandSeparator(
                dashboardData?.completedTasks || 
                dashboardData?.taskStats?.completedTasks || 
                dashboardData?.charts?.taskDistribution?.Completed || 
                0
              )}
              icon="✅"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="charts-section">
          {/* Pie Chart */}
          {chartData.taskDistribution.some(item => item.value > 0) && (
            <div className="chart-container">
              <h4 className="chart-title">Task Status Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.taskDistribution.filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {chartData.taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} tasks`, name]} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

           {/* Bar Chart */}
          {chartData.priorityDistribution?.length > 0 && (
            <div className="chart-container">
              <h4 className="chart-title">Task Priority Distribution</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`${v} tasks`, "Count"]} />
                  <Legend />
                  <Bar dataKey="tasks" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly Chart */}
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

        {/* Recent Tasks */}
        <div className="recent-tasks-section">
          <div className="recent-tasks-header">
            <h5>Recent Tasks</h5>
            <button className="see-all-btn" onClick={onSeeMore}>
              See All
            </button>
          </div>
          <TaskListTable 
            tableData={
              dashboardData?.recentTasks || 
              dashboardData?.recentTasksList || 
              dashboardData?.tasks || 
              []
            }
            loading={loading}
            maxItems={5}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
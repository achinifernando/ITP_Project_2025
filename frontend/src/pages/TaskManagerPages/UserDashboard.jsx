import React, { useContext, useState, useEffect, useCallback } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../components/context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import InfoCard from "../../components/Cards/InfoCard";
import TaskListTable from "../../components/layouts/TaskListTable";
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
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_USER_DASHBOARD_DATA);

      console.log("Full API response:", response.data);

      if (response.data) {
        console.log("Dashboard data received:", response.data);
        setDashboardData(response.data);
        prepareChartData(response.data);
      } else {
        console.warn("No data received from API");
        setDashboardData({});
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [prepareChartData]);

  // ✅ Navigation
  const onSeeMore = () => navigate("/user/tasks");

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
        <h1 className="dashboard-title">Welcome! {user?.name || user?.email}!</h1>
        <p className="date-display">{currentDate}</p>

        {/* ✅ Dashboard Stats in 2 columns */}
        <div className="dashboard-stats-grid">
          <div className="stats-column">
            <InfoCard
              label="Total Tasks"
              value={addThousandSeparator(dashboardData?.totalTasks || 0)}
              icon="📋"
            />
            <InfoCard
              label="Pending Tasks"
              value={addThousandSeparator(dashboardData?.pendingTasks || 0)}
              icon="⏳"
            />
          </div>
          <div className="stats-column">
            <InfoCard
              label="In Progress Tasks"
              value={addThousandSeparator(dashboardData?.inProgress || 0)}
              icon="🚀"
            />
            <InfoCard
              label="Completed Tasks"
              value={addThousandSeparator(dashboardData?.completedTasks || 0)}
              icon="✅"
            />
          </div>
        </div>

        {/* ✅ Charts Section */}
        <div className="charts-section">
          <style>{`
            .charts-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }

            .chart-container {
              background: white;
              padding: 20px;
              border-radius: 12px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              border: 1px solid #e1e5e9;
              min-height: 350px;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .chart-title {
              font-size: 16px;
              font-weight: 600;
              color: #2c3e50;
              margin: 0 0 20px 0;
              text-align: center;
            }

            .no-data-message {
              text-align: center;
              color: #7f8c8d;
              font-style: italic;
              padding: 20px;
            }

            .full-width {
              grid-column: 1 / -1;
            }

            @media (max-width: 768px) {
              .charts-grid {
                grid-template-columns: 1fr;
                gap: 20px;
              }
            }
          `}</style>
          <div className="charts-grid">
            {/* Pie Chart */}
            {chartData.taskDistribution.length > 0 && chartData.taskDistribution.some(item => item.value > 0) ? (
              <div className="chart-container">
                <h4 className="chart-title">🥧 Task Status Distribution</h4>
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
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-container">
                <div className="no-data-message">
                  <p>📊 No task status data available</p>
                  <small>Complete some tasks to see the distribution</small>
                </div>
              </div>
            )}

            {/* Bar Chart */}
            {chartData.priorityDistribution.length > 0 && chartData.priorityDistribution.some(item => item.tasks > 0) ? (
              <div className="chart-container">
                <h4 className="chart-title">📊 Task Priority Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.priorityDistribution.filter(item => item.tasks > 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="priority"
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#666' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <Tooltip
                      formatter={(v) => [`${v} tasks`, "Count"]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="tasks"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                      name="Tasks"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="chart-container">
                <div className="no-data-message">
                  <p>📊 No priority data available</p>
                  <small>Set task priorities to see the distribution</small>
                </div>
              </div>
            )}
          </div>

          {/* Monthly Completion Trend */}
          {chartData.monthlyData.length > 0 ? (
            <div className="chart-container full-width">
              <h4 className="chart-title">📈 Monthly Completion Trend</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#666' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#666' }} />
                  <Tooltip formatter={(value) => [`${value} tasks`, "Completed"]} />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-container full-width">
              <div className="no-data-message">
                <p>📈 No monthly data available</p>
                <small>Complete tasks over time to see trends</small>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Recent Tasks */}
        <div className="recent-tasks-section">
          <div className="recent-tasks-header">
            <h5>Recent Tasks</h5>
            <button className="see-all-btn" onClick={onSeeMore}>
              See All
            </button>
          </div>
          <TaskListTable 
            tableData={dashboardData?.recentTasks || []} 
            loading={loading}
            maxItems={5}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;

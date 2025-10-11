import React, { useContext, useState, useEffect, useCallback } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../components/context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import PayrollCard from "../../components/Cards/PayrollCard";
import "../../CSS/TaskManagerCSS/UserPayroll.css";

const UserPayroll = () => {
  useUserAuth();
  const { user } = useContext(UserContext);

  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch payroll data
  const getPayrollData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.PAYROLL.GET_MY_PAYROLL);

      console.log("Payroll API response:", response.data);

      if (response.data) {
        setPayrollData(response.data);
      }
    } catch (error) {
      console.error("Error fetching payroll data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (user) {
      getPayrollData();
    }
  }, [user, getPayrollData]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Payroll" hideNavbar={true}>
        <div className="payroll-loading">
          <div className="spinner"></div>
          <p>Loading payroll data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Payroll" hideNavbar={true}>
      <div className="user-payroll-container">
        <div className="payroll-page-header">
          <h1 className="payroll-page-title">💰 My Payroll</h1>
          <p className="payroll-page-subtitle">
            View your salary information, attendance stats, and payment history
          </p>
        </div>

        <PayrollCard payrollData={payrollData} />
      </div>
    </DashboardLayout>
  );
};

export default UserPayroll;

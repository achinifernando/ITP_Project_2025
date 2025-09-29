import "./App.css";
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";
import Header from "./components/Header";
import LorryTypesPage from "./pages/ClientPortalPages/LorryTypesPage";
import LorryDetails from "./pages/ClientPortalPages/LorryDetails";
import RequestForm from "./pages/ClientPortalPages/ServiceRequestForm";
import LorryCategoryCards from "./pages/ClientPortalPages/LorryCategories";
import Footer from "./components/Footer";
import Services from "./pages/ClientPortalPages/Services";
import OrderForm from "./pages/ClientPortalPages/OrderForm";
import Signup from "./pages/ClientPortalPages/Signup";
import Login from "./pages/ClientPortalPages/Login";
import ProfilePage from "./pages/ClientPortalPages/ProfilePage";
import UpdateProfileForm from "./pages/ClientPortalPages/UpdateProfileForm";
import HomePage from "./components/HomePage";
import QuotationForm from "./pages/CompanyManagementPages/QuotationGenerator";
import CompanyManagerDashbord from "./pages/CompanyManagementPages/CompanyManagerDashbord";
import ScheduleMeeting from "./pages/ClientPortalPages/ClientBookingpage";
import CheckoutPage from "./pages/ClientPortalPages/CheckoutPage";

// Task management components
import LoginNew from "./pages/TaskManagerPages/LoginNew";
import SignUp from "./pages/TaskManagerPages/SignUp";
import PrivateRoute from "./routes/PrivateRoute";
import TaskManagerDashboard from "./pages/TaskManagerPages/TaskManagerDashboard";
import ManageTasks from "./pages/TaskManagerPages/ManageTasks";
import CreateTask from "./pages/TaskManagerPages/CreateTasks";
import ManageUsers from "./pages/TaskManagerPages/ManageUsers";
import UserDashboard from "./pages/TaskManagerPages/UserDashboard";
import MyTasks from "./pages/TaskManagerPages/MyTasks";
import ViewTaskDetails from "./pages/TaskManagerPages/ViewTaskDetails";

// Attendance Components
import AttendanceDashboard from "./pages/AttendancePages/AttendanceDashboard";
import Employees from "./pages/AttendancePages/Employees";
import Leaves from "./pages/AttendancePages/Leaves";
import Salary from "./pages/AttendancePages/Salary";
import Attendance from "./pages/AttendancePages/Attendance";
import AttendanceReports from "./pages/AttendancePages/Reports";
import { UserContext } from "./components/context/userContext";

// Inventory components
import InventoryPage from "./pages/InventoryPages/InventoryPage";
import SuppliersPage from "./pages/InventoryPages/SuppliersPage";
import RequestsPage from "./pages/InventoryPages/RequestsPage";
import AlertsPage from "./pages/InventoryPages/AlertsPage";
import ReportsPage from "./pages/InventoryPages/ReportsPage";

// Dispatch management components
import DispatchSidebar from "./pages/DispatchPages/DispatchSidebar";
import DispatchHeader from "./pages/DispatchPages/DispatchHeader";
import DispatchReports from "./pages/DispatchPages/DispatchReports";
import AddDelivery from "./pages/DispatchPages/AddDelivery";
import AssignedDeliveries from "./pages/DispatchPages/AssignedDeliveries";
import DispatchDashboard from "./pages/DispatchPages/Dashboard";
import DriverList from "./pages/DispatchPages/DriverList";
import VehicleList from "./pages/DispatchPages/VehicleList";
import DeliveryMap from "./pages/DispatchPages/DeliveryMap";
import GpsTracking from "./pages/DispatchPages/gpsTracking";

// CompanyManagement components
import AddCategory from "./pages/CompanyManagementPages/addCategory";
import AllCategories from "./pages/CompanyManagementPages/allCategories";
import AllServices from "./pages/CompanyManagementPages/allServices";
import AllModels from "./pages/CompanyManagementPages/allModels";
import AllLorryTypes from "./pages/CompanyManagementPages/allLorryType";
import AdminOrders from "./pages/CompanyManagementPages/allOrders";
import AdminPayments from "./pages/CompanyManagementPages/allPayments";
import AdminRepairs from "./pages/CompanyManagementPages/allRepairs";
import PayrollDashboard from "./pages/CompanyManagementPages/payrollDashboard";
import AddService from "./pages/CompanyManagementPages/addService";
import AddModel from "./pages/CompanyManagementPages/addModel";
import AddLorryType from "./pages/CompanyManagementPages/addLorryType";
import DashboardLayout from "./pages/CompanyManagementPages/dashboard";
import UpdateCategory from "./pages/CompanyManagementPages/updateCategory";
import CategoryDetails from "./pages/CompanyManagementPages/categoryDetails";
import ServiceDetails from "./pages/CompanyManagementPages/serviceDetails";
import DashboardHome from "./pages/CompanyManagementPages/dashboardHome";


// Layout components for different sections
import { Outlet } from "react-router-dom";

// Layout Components
const DispatchLayout = () => (
  <div style={{ display: "flex" }}>
    <DispatchSidebar />
    <div style={{ flex: 1, marginLeft: "200px" }}>
      <DispatchHeader />
      <div style={{ padding: "15px", marginTop: "70px" }}>
        <Outlet />
      </div>
    </div>
  </div>
);

const InventoryLayout = () => (
  <div>
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
        {[
          ['/inventory', 'Inventory'],
          ['/inventory/suppliers', 'Suppliers'],
          ['/inventory/requests', 'Requests'],
          ['/inventory/alerts', 'Alerts'],
          ['/inventory/reports', 'Reports'],
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
    <Outlet />
  </div>
);

// Company Management Layout
const CompanyManagementLayout = () => (
  <div>
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default Home Page */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            }
          />

          {/* Authentication Routes */}
          <Route
            path="/signup"
            element={
              <>
                <Header />
                <Signup />
                <Footer />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Header />
                <Login />
                <Footer />
              </>
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profilePage"
            element={
              <>
                <Header />
                <ProfilePage />
                <Footer />
              </>
            }
          />
          <Route
            path="/updateProfileForm/:clientId"
            element={
              <>
                <Header />
                <UpdateProfileForm />
                <Footer />
              </>
            }
          />

          {/* Product Routes */}
          <Route
            path="/products"
            element={
              <>
                <Header />
                <LorryCategoryCards />
                <Footer />
              </>
            }
          />
          <Route
            path="/LorryTypesPage/:categoryId"
            element={
              <>
                <Header />
                <LorryTypesPage />
                <Footer />
              </>
            }
          />
          <Route
            path="/LorryDetails/:lorryId"
            element={
              <>
                <Header />
                <LorryDetails />
                <Footer />
              </>
            }
          />

          {/* Service Routes */}
          <Route
            path="/requestform"
            element={
              <>
                <Header />
                <RequestForm />
                <Footer />
              </>
            }
          />
          <Route
            path="/services"
            element={
              <>
                <Header />
                <Services />
                <Footer />
              </>
            }
          />
          <Route
            path="/orderform"
            element={
              <>
                <Header />
                <OrderForm />
                <Footer />
              </>
            }
          />
          <Route
            path="/quotationgeneratorform/:requestID"
            element={
              <>
                <Header />
                <QuotationForm />
                <Footer />
              </>
            }
          />
          <Route
            path="/companyManagerDashbord"
            element={
              <>
                <Header />
                <CompanyManagerDashbord />
                <Footer />
              </>
            }
          />
          <Route
            path="/schedule-meeting"
            element={
              <>
                <Header />
                <ScheduleMeeting />
                <Footer />
              </>
            }
          />
          <Route
            path="/checkoutPage/:type/:id"
            element={
              <>
                <Header />
                <CheckoutPage />
                <Footer />
              </>
            }
          />

          {/* Task Management Public Routes */}
          <Route
            path="/Companylogin"
            element={
              <>
                <Header />
                <LoginNew />
                <Footer />
              </>
            }
          />
          <Route
            path="/Companysignup"
            element={
              <>
                <Header />
                <SignUp />
                <Footer />
              </>
            }
          />

          {/* Task Management Admin Routes */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<TaskManagerDashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>

          {/* Task Management Member Routes */}
          <Route element={<PrivateRoute allowedRoles={["member"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details" element={<ViewTaskDetails />} />
          </Route>

          {/* HR Manager Routes - Attendance System */}
          <Route element={<PrivateRoute allowedRoles={["hr_manager"]} />}>
            <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
            <Route path="/attendance/employees" element={<Employees />} />
            <Route path="/attendance/leaves" element={<Leaves />} />
            <Route path="/attendance/salary" element={<Salary />} />
            <Route path="/attendance/mark" element={<Attendance />} />
            <Route path="/attendance/reports" element={<AttendanceReports />} />
          </Route>

          {/* Dispatch Management Routes with Layout */}
          <Route element={<DispatchLayout />}>
            <Route element={<PrivateRoute allowedRoles={["dispatch_manager"]} />}>
              <Route path="/dispatchDashboard" element={<DispatchDashboard />} />
              <Route path="/add-delivery" element={<AddDelivery />} />
              <Route path="/drivers" element={<DriverList />} />
              <Route path="/vehicles" element={<VehicleList />} />
              <Route path="/assignments" element={<AssignedDeliveries />} />
              <Route path="/map" element={<DeliveryMap />} />
              <Route path="/gps-tracking" element={<GpsTracking />} />
              <Route path="/reports" element={<DispatchReports />} />
            </Route>
          </Route>

          {/*Inventory Management Routes */}
          <Route element={<InventoryLayout />}>
            <Route element={<PrivateRoute allowedRoles={["inventory_manager"]} />}>
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/suppliers" element={<SuppliersPage />} />
              <Route path="/inventory/requests" element={<RequestsPage />} />
              <Route path="/inventory/alerts" element={<AlertsPage />} />
              <Route path="/inventory/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Company Management Routes */}
          {/* Company Management Routes */}
<Route element={<CompanyManagementLayout />}>
  <Route element={<PrivateRoute allowedRoles={["company_manager"]} />}>
    <Route path="/company-manager-dashboard" element={<DashboardHome />} />
    <Route path="/categories" element={<AllCategories />} />
    <Route path="/addCategory" element={<AddCategory />} />
    <Route path="/update/:id" element={<UpdateCategory />} />
    <Route path="/admin-services" element={<AllServices />} />
    <Route path="/admin-services/add" element={<AddService />} />
    <Route path="/models" element={<AllModels />} />
    <Route path="/types" element={<AllLorryTypes />} />
    <Route path="/type/add" element={<AddLorryType />} />
    <Route path="/orders" element={<AdminOrders />} />
    <Route path="/payments" element={<AdminPayments />} />
    <Route path="/repairs" element={<AdminRepairs />} />
    <Route path="/payroll" element={<PayrollDashboard />} />
    <Route path="/model/add" element={<AddModel />} />
    <Route path="/category/details/:id" element={<CategoryDetails />} />
    <Route path="/service/:id" element={<ServiceDetails />} />
  </Route>
</Route>

          {/* Root redirect based on user role */}
          <Route path="/root-redirect" element={<Root />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect based on user role
  switch (user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" />;
    case "hr_manager":
      return <Navigate to="/attendance/dashboard" />;
    case "employee":
      return <Navigate to="/user/dashboard" />;
    case "dispatch_manager":
      return <Navigate to="/dispatchDashboard" />;
    case "inventory_manager":
      return <Navigate to="/inventoryDashboard" />;
    case "company_manager":
      return <Navigate to="/company-manager-dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};
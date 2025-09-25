import './App.css';
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Header from "./components/Header";
import LorryTypesPage from "./pages/ClientPortalPages/LorryTypesPage";
import LorryDetails from "./pages/ClientPortalPages/LorryDetails";
import RequestForm from "./pages/ClientPortalPages/ServiceRequestForm";
import LorryCategoryCards from './pages/ClientPortalPages/LorryCategories';
import Footer from './components/Footer';
import Services from './pages/ClientPortalPages/Services';
import OrderForm from './pages/ClientPortalPages/OrderForm';
import Signup from './pages/ClientPortalPages/Signup';
import Login from './pages/ClientPortalPages/Login';
import ProfilePage from './pages/ClientPortalPages/ProfilePage';
import UpdateProfileForm from './pages/ClientPortalPages/UpdateProfileForm';
import HomePage from './components/HomePage';
import QuotationForm from './pages/CompanyManagementPages/QuotationGenerator';
import CompanyManagerDashbord from './pages/CompanyManagementPages/CompanyManagerDashbord';
import ScheduleMeeting from './pages/ClientPortalPages/ClientBookingpage';
import CheckoutPage from './pages/ClientPortalPages/CheckoutPage';

// Task management components
import LoginNew from './pages/TaskManagerPages/LoginNew';
import SignUp from './pages/TaskManagerPages/SignUp';
import PrivateRoute from './routes/PrivateRoute';
import TaskManagerDashboard from './pages/TaskManagerPages/TaskManagerDashboard';
import ManageTasks from './pages/TaskManagerPages/ManageTasks';
import CreateTask from './pages/TaskManagerPages/CreateTasks';
import ManageUsers from './pages/TaskManagerPages/ManageUsers';
import UserDashboard from './pages/TaskManagerPages/UserDashboard';
import MyTasks from './pages/TaskManagerPages/MyTasks';
import ViewTaskDetails from './pages/TaskManagerPages/ViewTaskDetails';

// Attendance Components
import AttendanceDashboard from './pages/AttendancePages/AttendanceDashboard';
import Employees from './pages/AttendancePages/Employees';
import Leaves from './pages/AttendancePages/Leaves';
import Salary from './pages/AttendancePages/Salary';
import Attendance from './pages/AttendancePages/Attendance';
import AttendanceReports from './pages/AttendancePages/AttendanceReports'; // Renamed
import { UserContext } from './components/context/userContext';

// Inventory components
import InventoryPage from './pages/InventoryPages/InventoryPage';
import SuppliersPage from './pages/InventoryPages/SuppliersPage';
import RequestsPage from './pages/InventoryPages/RequestsPage';
import AlertsPage from './pages/InventoryPages/AlertsPage';
import ReportsPage from './pages/InventoryPages/ReportsPage';

// Dispatch management components - RENAMED IMPORTS
import DispatchSidebar from './pages/DispatchPages/DispatchSidebar';
import DispatchHeader from './pages/DispatchPages/DispatchHeader'; // Assuming this is a different Header
import DispatchReports from './pages/DispatchPages/DispatchReports'; // Renamed
import AddDelivery from './pages/DispatchPages/AddDelivery';
import AssignedDeliveries from './pages/DispatchPages/AssignedDeliveries';
import DispatchDashboard from './pages/DispatchPages/Dashboard';
import DriverList from './pages/DispatchPages/DriverList';
import VehicleList from './pages/DispatchPages/VehicleList';
import DeliveryMap from './pages/DispatchPages/DeliveryMap';
import GpsTracking from './pages/DispatchPages/gpsTracking';

// Layout components for different sections
const DispatchLayout = ({ children }) => (
  <div style={{ display: 'flex' }}>
    <DispatchSidebar />
    <div style={{ flex: 1, marginLeft: '200px' }}>
      <DispatchHeader />
      <div style={{ padding: '20px', marginTop: '70px' }}>
        {children}
      </div>
    </div>
  </div>
);

const InventoryLayout = ({ children }) => (
  <>
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-6">
        {[
          ['/inventory', 'Inventory'],
          ['/suppliers', 'Suppliers'],
          ['/requests', 'Requests'],
          ['/alerts', 'Alerts'],
          ['/inventory-reports', 'Reports'], // Changed path to avoid conflict
        ].map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/inventory'}
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
    {children}
  </>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          {/* Default Home Page */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          {/* Authentication Routes */}
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />

          {/* Profile Routes */}
          <Route path='/profilePage' element={<ProfilePage />} />
          <Route path='/updateProfileForm/:clientId' element={<UpdateProfileForm />} />

          {/* Product Routes */}
          <Route path="/products" element={<LorryCategoryCards />} />
          <Route path="/LorryTypesPage/:categoryId" element={<LorryTypesPage />} />
          <Route path="/LorryDetails/:lorryId" element={<LorryDetails />} />

          {/* Service Routes */}
          <Route path='/requestform' element={<RequestForm />} />
          <Route path='/services' element={<Services />} />
          <Route path='/orderform' element={<OrderForm />} />
          <Route path='/quotationgeneratorform/:requestID' element={<QuotationForm />} />
          <Route path='/companyManagerDashbord' element={<CompanyManagerDashbord />} />
          <Route path='/schedule-meeting' element={<ScheduleMeeting />} />
          <Route path='/checkoutPage/:type/:id' element={<CheckoutPage />} />

          {/* Task Management Public Routes */}
          <Route path="/Companylogin" element={<LoginNew />} />
          <Route path="/Companysignup" element={<SignUp />} />

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

          {/* Dispatch Management Routes */}
          <Route path="/dispatch/*" element={
            <DispatchLayout>
              <Routes>
                <Route path="/" element={<DispatchDashboard />} />
                <Route path="/add-delivery" element={<AddDelivery />} />
                <Route path="/drivers" element={<DriverList />} />
                <Route path="/vehicles" element={<VehicleList />} />
                <Route path="/assignments" element={<AssignedDeliveries />} />
                <Route path="/map" element={<DeliveryMap />} />
                <Route path="/gps-tracking" element={<GpsTracking />} />
                <Route path="/reports" element={<DispatchReports />} />
              </Routes>
            </DispatchLayout>
          } />

          {/* Inventory Management Routes */}
          <Route path="/inventory/*" element={
            <InventoryLayout>
              <Routes>
                <Route path="/" element={<InventoryPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Routes>
            </InventoryLayout>
          } />

          {/* Root redirect based on user role */}
          <Route path="/root-redirect" element={<Root />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
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
  switch(user.role) {
    case "admin":
      return <Navigate to="/admin/dashboard" />;
    case "hr_manager":
      return <Navigate to="/attendance/dashboard" />;
    case "employee":
      return <Navigate to="/user/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};
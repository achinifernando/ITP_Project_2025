import './App.css';
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route,Navigate } from 'react-router-dom';
import Header from "./components/Header";
import LorryTypesPage from "./components/LorryTypesPage";
import LorryDetails from "./components/LorryDetails"; // Component names should start with uppercase
import RequestForm from "./components/ServiceRequestForm";
import LorryCategoryCards from './components/LorryCategories';
import Footer from './components/Footer';
import Services from './components/Services';
import OrderForm from './components/OrderForm';
import Signup from './components/Signup';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import UpdateProfileForm from './components/UpdateProfileForm';
import HomePage from './components/HomePage';
import QuotationForm from './components/dashboard/QuotationGenerator'
import CompanyManagerDashbord from'./components/dashboard/CompanyManagerDashbord';
import ScheduleMeeting from './components/ClientBookingpage';
import CheckoutPage from './components/CheckoutPage';

// Import sachini's components
import LoginNew from './components/pages/TaskManagerPages/LoginNew';
import SignUp from './components/pages/TaskManagerPages/SignUp';
import PrivateRoute from './routes/PrivateRoute';

import TaskManagerDashboard from './components/pages/TaskManagerPages/TaskManagerDashboard';
import ManageTasks from './components/pages/TaskManagerPages/ManageTasks';
import CreateTask from './components/pages/TaskManagerPages/CreateTasks';
import ManageUsers from './components/pages/TaskManagerPages/ManageUsers';
import UserDashboard from './components/pages/TaskManagerPages/UserDashboard';
import MyTasks from './components/pages/TaskManagerPages/MyTasks';
import ViewTaskDetails from './components/pages/TaskManagerPages/ViewTaskDetails';

// Import Attendance Components (ADD THESE IMPORTS)
import AttendanceDashboard from './components/pages/AttendancePages/AttendanceDashboard';
import Employees from './components/pages/AttendancePages/Employees';
import Leaves from './components/pages/AttendancePages/Leaves';
import Salary from './components/pages/AttendancePages/Salary';
import Attendance from './components/pages/AttendancePages/Attendance';
import Reports from './components/pages/AttendancePages/Reports';
import UserProvider, { UserContext } from './context/userContext';





function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
  {/* Default Home Page */}
  <Route path="/" element={<HomePage />} />

  {/* Home Page */}
  <Route path="/home" element={<HomePage />} />

  {/*Sign up form*/ }
  <Route path='/signup' element={<Signup />} />

  {/*Login form*/ }
  <Route path='/login' element={<Login />} />

  {/*Profile Page*/ }
  <Route path='/profilePage' element={<ProfilePage />} />

  {/*Profile form*/ }
  <Route path='/updateProfileForm/:clientId' element={<UpdateProfileForm />} />

  {/* product Page */}
  <Route path="/products" element={
    <>
      <LorryCategoryCards />
    </>
  } />

  {/* Lorry Types Page */}
  <Route path="/LorryTypesPage/:categoryId" element={<LorryTypesPage />} />

  {/* Lorry Details Page */}
  <Route path="/LorryDetails/:lorryId" element={<LorryDetails />} />

  {/*Request form*/ }
  <Route path='/requestform' element={<RequestForm />} />

  {/*Services page*/ }
  <Route path='/services' element={
    <>
    <Services />
    </>}/>

  {/*Order form*/ }
  <Route path='/orderform' element={<OrderForm />} />

  {/*quotation generator form*/ }
 <Route path='/quotationgeneratorform/:requestID' element={<QuotationForm />} /> 


  {/*dashboard page*/ }
  <Route path='/companyManagerDashbord' element={<CompanyManagerDashbord />} />


  {/*Client booking page*/ }
  <Route path='/schedule-meeting' element={<ScheduleMeeting />} />

  {/*Checkout page*/ }
  <Route path='/checkoutPage/:type/:id' element={<CheckoutPage />} />


  {/* Public Routes */}
<Route path="/Companylogin" element={<LoginNew />} />
<Route path="/Companysignup" element={<SignUp />} />

{/* Admin Routes */}
<Route element={<PrivateRoute allowedRoles={["admin"]} />}>
  <Route path="/admin/dashboard" element={<TaskManagerDashboard />} />
  <Route path="/admin/tasks" element={<ManageTasks />} />
  <Route path="/admin/create-task" element={<CreateTask />} />
  <Route path="/admin/users" element={<ManageUsers />} />
</Route>

{/* member Routes */}
<Route element={<PrivateRoute allowedRoles={["member"]} />}>
  <Route path="/user/dashboard" element={<UserDashboard />} />
  <Route path="/user/tasks" element={<MyTasks />} />
  <Route path="/user/task-details" element={<ViewTaskDetails />} />
</Route>

{/*  HR Manager Routes - Attendance System*/}
<Route element={<PrivateRoute allowedRoles={["hr_manager"]} />}>
  <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
  <Route path="/attendance/employees" element={<Employees />} />
  <Route path="/attendance/leaves" element={<Leaves />} />
  <Route path="/attendance/salary" element={<Salary />} />
  <Route path="/attendance/mark" element={<Attendance />} />
  <Route path="/attendance/reports" element={<Reports />} />
</Route>

{/* Default route */}
<Route path="/" element={<Root />} />

{/* Catch all route - redirect to login */}
<Route path="*" element={<Navigate to="/login" />} />

</Routes>



         <Footer/>
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


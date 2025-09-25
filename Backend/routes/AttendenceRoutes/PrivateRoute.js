import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const PrivateRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

    if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'hr_manager':
        return <Navigate to="/attendance/dashboard" />;
      case 'member':
        return <Navigate to="/user/dashboard" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  return children;
};

export default PrivateRoute;

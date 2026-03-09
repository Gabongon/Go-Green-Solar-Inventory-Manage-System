import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/loadingSpinner';

const PrivateRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // 1. If not logged in at all, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the route requires admin but the user isn't one, go to dashboard
  if (requireAdmin && !isAdmin()) { 
    return <Navigate to="/dashboard" replace />; 
  }

  // 3. Otherwise, show the page
  return children;
};

export default PrivateRoute;
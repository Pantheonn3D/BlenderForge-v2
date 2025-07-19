// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Make sure this path is correct

// This component acts as a gatekeeper for routes that require a user to be logged in.
const ProtectedRoute = ({ children }) => {
  // Get the current user and the loading state from your auth context
  const { user, loading: authLoading } = useAuth();
  
  // Get the current location object, which contains the path the user is on
  const location = useLocation();

  // While we're checking if a user is logged in, show a loading state.
  // This prevents a brief "flash" of the login page for logged-in users.
  if (authLoading) {
    return (
      <div className="loading-container">
        <p>Authenticating...</p>
      </div>
    );
  }

  // If authentication is done and there is NO user...
  if (!user) {
    // ...redirect them to the /login page.
    // CRITICAL PART: We pass the current 'location' in the 'state' prop.
    // This is how the login page will "remember" where to send the user back to.
    // The 'replace' prop is important for good browser history.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authentication is done AND there IS a user, allow them to see the page.
  return children;
};

export default ProtectedRoute;
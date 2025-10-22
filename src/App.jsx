import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import RTOLogin from "./pages/RTOLogin";
import RTODashboard from "./pages/RTO/RTODashboard";
import CollectorDashboard from "./pages/Collector/CollectorDashboard";
import DesignatedDashboard from "./pages/Designated-officer/DesignatedDashboard";
import DepartmentDashboard from "./pages/Department/DepartmentDashboard";
import EventUtilizationForm from "./pages/RTO/modules/EventUtilizationDetail";
import CommisionerDashboard from "./pages/Commisioner/CommisionerDashboard";

const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { user, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();

  const getDashboardPath = (role) => {
    
    const dashboardPaths = {
      'RTO': '/rto/dashboard',
      'Collector': '/collector/dashboard',
      'Commissioner': '/commissioner/dashboard',
    };
    return dashboardPaths[role] || '/login';
  };

  if (user) {
 
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

// Unauthorized Page
const UnauthorizedPage = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this page.
        </p>
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Logout & Login Again
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const { user, isLoading, error, login, logout, setError } = useAuth();
  const location = useLocation();

  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials);
      if (result.success) {
        // Redirect to intended location or dashboard
        const intendedPath = location.state?.from?.pathname;
        if (intendedPath && intendedPath !== '/login') {
          window.history.replaceState(null, '', intendedPath);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? <DashboardRouter /> : <RTOLogin onLogin={handleLogin} />
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<DashboardRouter />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/rto/dashboard/*"
          element={
            <ProtectedRoute requiredRole="RTO">
              <RTODashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/utilization/:eventId"
          element={
            <ProtectedRoute requiredRole="RTO">
              <EventUtilizationForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/collector/dashboard/*"
          element={
            <ProtectedRoute requiredRole="Collector">
              <CollectorDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/commissioner/dashboard/*"  
          element={
            <ProtectedRoute requiredRole="Commissioner">  
              <CommisionerDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/designated-officer/dashboard/*"
          element={
            <ProtectedRoute requiredRole="Designated-Officer">
              <DesignatedDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/department/dashboard/*"
          element={
            <ProtectedRoute requiredRole="Department">
              <DepartmentDashboard user={user} onLogout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 404 - Catch all */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <button
                  onClick={() => window.history.back()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

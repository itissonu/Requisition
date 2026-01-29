import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Login function - handles both password and OTP based auth
  const login = async (userData) => {
    try {
      setError(null);
      
    
      const authenticatedUser = {
        id: `user_${Date.now()}`,
        role: userData.role,
        name: userData.name || `${userData.role} User`,
        username: userData.username,
        mobile: userData.mobile,
        token: userData.token,
        loginTime: userData.loginTime || new Date().toISOString(),
        permissions: getRolePermissions(userData.role)
      };

      setUser(authenticatedUser);
      
   
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      localStorage.setItem("token", authenticatedUser.token);
      
      return { success: true, user: authenticatedUser };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setError(null);
    // Clear localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

     window.location.replace('/VRS/');
  };

  // Check authentication status on app load
  useEffect(() => {
    try {
      
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        
        
        if (parsedUser.token === storedToken) {
         
          parsedUser.permissions = getRolePermissions(parsedUser.role);
          setUser(parsedUser);
        } else {
      
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
      // Clear corrupted data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get role-based permissions
  const getRolePermissions = (role) => {
    const permissions = {
      'RTO': [
        'view_all_requests',
        'approve_requests', 
        'reject_requests',
        'manage_vehicles',
        'view_reports',
        'manage_users'
      ],
      'Collector': [
        'view_all_requests',
        'approve_requests',
        'reject_requests', 
        'view_reports'
      ],
      'Designated-Officer': [
        'view_assigned_requests',
        'approve_requests',
        'reject_requests',
        'update_request_status'
      ],
      'Department': [
        'create_requests',
        'view_own_requests',
        'edit_own_requests',
        'cancel_own_requests'
      ]
    };
    
    return permissions[role] || [];
  };

  // Check if user has specific permission optional
  const hasPermission = (permission) => {
    if (!user) return false;
    return user.permissions?.includes(permission) || false;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
  
      const updatedUser = {
        ...user,
        lastActivity: new Date().toISOString(),
        permissions: getRolePermissions(user.role) // Refresh permissions
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };


  const updateUser = (updatedData) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    hasPermission,
    hasRole,
    refreshUser,
    updateUser,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
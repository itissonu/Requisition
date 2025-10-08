import React, { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

export default function RTOLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Role configuration
  const roles = [
    {
      id: "RTO",
      name: "RTO Login",
      authType: "password",
      icon: "🏛️"
    },
    {
      id: "Collector",
      name: "Collector Login",
      authType: "password",
      icon: "👨‍💼"
    },
    {
      id: "Commissioner",  
      name: "Commissioner Login",
      authType: "password",
      icon: "👮‍♂️"
    }


  ];


  useEffect(() => {
    setError("");
  }, [username, password, mobile, otp]);

 
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter username");
      return;
    }
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }

    setIsLoading(true);

    try {
      
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate authentication
      const userData = {
        role: selectedRole.id,
        username,
        token: `token_${Date.now()}`,
        name: `${selectedRole.name.split(' ')[0]} User`,
        loginTime: new Date().toISOString()
      };

      onLogin(userData);
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

 

 

  // Reset form when role changes
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowLoginOptions(false);
    setUsername("");
    setPassword("");
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setError("");
  };


  const closeModal = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setError("");
  };

 
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    function handleModalClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && selectedRole) {
        closeModal();
      }
    }

    if (selectedRole) {
      document.addEventListener("mousedown", handleModalClickOutside);
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener("mousedown", handleModalClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [selectedRole]);

 
  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && selectedRole) {
        closeModal();
      }
    }

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [selectedRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-9xl mx-auto px-1 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">VRS</span>
              </div>
              <h1 className="text-xl font-bold text-gray-600">
                Vehicle Requisition System
              </h1>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowLoginOptions(!showLoginOptions)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg 
                         font-medium transition-colors duration-200 shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Login
              </button>

              {/* Role Selection Dropdown */}
              {showLoginOptions && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl 
                              border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200
                              transform origin-top-right">

                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 
                               transition-colors duration-150 group"
                    >

                      <div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-700">
                          {role.name}
                        </div>

                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal Overlay */}
      {selectedRole && (
        <div className="fixed inset-0  bg-opacity-50 z-50 flex items-center justify-center p-4
                        animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md 
                       transform animate-in zoom-in-95 duration-200 origin-center"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center justify-center space-x-3">


                <h2 className="text-xl font-bold text-gray-900 text-center">
                  {selectedRole.name}
                </h2>

                {/* <p className="text-sm text-gray-500">
                    {selectedRole.authType === 'password' 
                      ? 'Enter your credentials' 
                      : 'Login with mobile OTP'
                    }
                  </p> */}

              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200
                          focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isLoading}
              >
                <IoMdClose className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-in slide-in-from-top-1 duration-200">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Username/Password Fields */}
              {selectedRole.authType === 'password' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               
                               transition-colors duration-200"
                      placeholder="Enter your username"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               
                               transition-colors duration-200"
                      placeholder="Enter your password"
                      disabled={isLoading}
                      onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin(e)}
                    />
                  </div>
                </>
              )}

        

              {/* Submit Button */}
              {(selectedRole.authType === 'password' || otpSent) && (
                <button
                  type="button"
                  onClick={selectedRole.authType === 'password' ? handlePasswordLogin : handleOtpLogin}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                           text-white py-3 rounded-lg font-medium transition-colors duration-200
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transform active:scale-95"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                    rounded-full animate-spin mr-2"></div>
                      {selectedRole.authType === 'password' ? 'Logging in...' : 'Verifying...'}
                    </div>
                  ) : (
                    selectedRole.authType === 'password' ? 'Login' : 'Verify OTP'
                  )}
                </button>
              )}

              {/* Forgot Password Link */}
              {selectedRole.authType === 'password' && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



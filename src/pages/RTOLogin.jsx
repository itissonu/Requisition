import React, { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { authAPI } from "../apis/apiService";
import logo from '../assests/home4.png';
import odishaLogo from '../assests/logo.png'; 

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
      fullName: "Regional Transport Officer",
      authType: "password",
      icon: "🏛️",
      color: "blue",
    },
    {
      id: "Collector",
      name: "Collector Login",
      fullName: "District Collector",
      authType: "password",
      icon: "👨‍💼",
      color: "blue",
    },
    {
      id: "Commissioner",
      name: "Commissioner Login",
      fullName: "Transport Commissioner",
      authType: "password",
      icon: "👮‍♂️",
      color: "blue",
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
      const response = await authAPI.login({
        username,
        password,
      });

      console.log(response.data);
      localStorage.setItem("authToken", response.data.token);

      onLogin({
        role: selectedRole?.id,
        username,
        token: response?.data.token,
        name: response?.data.name || `${selectedRole?.name.split(" ")[0]} User`,
        loginTime: new Date().toISOString()
      });
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

      {/* Modal Overlay - Government Style Split View */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 z-50 flex items-center justify-center p-4
                        animate-in fade-in duration-200">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl border-[1px] border-white w-full max-w-5xl 
                       transform animate-in zoom-in-95 duration-200 origin-center overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              {/* Left Side - Information */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between">
                <div className="">
                  <div className="flex flex-col items-center space-x-3 mb-8">
                    <img src={odishaLogo} alt="Odisha Logo" className="w-30 h-30 bg-white rounded-lg p-2" />
                    <div>
                      <h2 className="text-2xl font-bold">Government of Odisha</h2>
                      <p className="text-blue-100 text-sm text-center">Transport Department</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center">
                      {/* <div className="text-4xl mb-3">{selectedRole.icon}</div> */}
                      <h3 className="text-3xl font-bold mb-2">{selectedRole.name}</h3>
                      <p className="text-blue-100 text-lg">{selectedRole.fullName}</p>
                    </div>

                    {/* <div className="pt-8 space-y-4 border-t border-blue-400">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 rounded-full p-2 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Secure Access</h4>
                          <p className="text-blue-100 text-sm">Government authorized personnel only</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 rounded-full p-2 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Vehicle Management</h4>
                          <p className="text-blue-100 text-sm">Streamlined requisition system</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-500 rounded-full p-2 mt-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Digital Governance</h4>
                          <p className="text-blue-100 text-sm">Efficient and transparent operations</p>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </div>

                <div className="text-sm text-blue-100 pt-8 border-t border-blue-400">
                  <p>© 2025 Government of Odisha. All rights reserved.</p>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="p-12 flex flex-col justify-center relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200
                            focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={isLoading}
                >
                  <IoMdClose className="w-5 h-5 text-gray-500" />
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                  <p className="text-gray-600 mt-1">Please enter your credentials to continue</p>
                </div>

                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-in slide-in-from-top-1 duration-200">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Username/Password Fields */}
                {selectedRole.authType === 'password' && (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Username <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                                 focus:border-blue-500 focus:outline-none transition-colors duration-200"
                        placeholder="Enter your username"
                        disabled={isLoading}
                        autoFocus
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                      
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg 
                                 focus:border-blue-500 focus:outline-none transition-colors duration-200"
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
                    onClick={selectedRole.authType === 'password' ? handlePasswordLogin : () => {}}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 
                             hover:from-blue-700 hover:to-indigo-700 
                             disabled:from-gray-400 disabled:to-gray-400
                             text-white py-3 rounded-lg font-semibold 
                             transition-all duration-200 transform active:scale-95
                             shadow-lg hover:shadow-xl
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  <div className="text-center mt-6">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline 
                               transition-colors duration-200 font-medium"
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    For technical support, contact IT Department<br />
                    Email: support@odisha.gov.in
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <img src={logo} alt="Description" className="w-full h-[100vh]" />
      </div>
    </div>
  );
}
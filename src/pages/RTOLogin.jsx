import React, { useState, useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { authAPI } from "../apis/apiService";
import logo from '../assests/logo.png';
import heroImage from '../assests/home7.png';

export default function RTOLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  const roles = [
    {
      id: "RTO",
      name: "RTO Login",
      fullName: "Regional Transport Officer",
      authType: "password",
    },
    {
      id: "Collector",
      name: "Collector Login",
      fullName: "District Collector",
      authType: "password",
    },
    {
      id: "Commissioner",
      name: "Commissioner Login",
      fullName: "Transport Commissioner",
      authType: "password",
    }
  ];

  useEffect(() => {
    setError("");
  }, [username, password]);

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
      const response = await authAPI.login({
        username,
        password,
      });

      console.log(response.data, "response");

      const userRole = response.data.role; 
      const selectedRoleId = selectedRole?.id; 

      const normalizeRole = (role) => {
        if (!role) return '';
        return role.toString().toUpperCase().trim();
      };

      const normalizedUserRole = normalizeRole(userRole);
      const normalizedSelectedRole = normalizeRole(selectedRoleId);

      console.log("User Role from Backend (normalized):", normalizedUserRole);
      console.log("Selected Role from UI (normalized):", normalizedSelectedRole);

      if (normalizedUserRole !== normalizedSelectedRole) {
        setError(
          `Access Denied: You selected ${selectedRole.name} but your account is registered as ${userRole}. ` +
          `Please select the correct login option for your role.`
        );
        setIsLoading(false);
        return;
      }


      const formatRoleForRouting = (role) => {
        const upperRole = role.toUpperCase();

        const roleMap = {
          'RTO': 'RTO',
          'COLLECTOR': 'Collector',
          'COMMISSIONER': 'Commissioner',
          'DESIGNATED_OFFICER': 'Designated-Officer',
          'DEPARTMENT': 'Department'
        };
        
        return roleMap[upperRole] || role;
      };

      const formattedRole = formatRoleForRouting(userRole);
      
      console.log("Formatted Role for Routing:", formattedRole);

      localStorage.setItem("authToken", response.data.token);
      
      onLogin({
        role: formattedRole,
        username,
        token: response?.data.token,
        name: response?.data.name || `${selectedRole?.name.split(" ")[0]} User`,
        loginTime: new Date().toISOString()
      });
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowDropdown(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  const closeModal = () => {
    setSelectedRole(null);
    setUsername("");
    setPassword("");
    setError("");
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6">
        <p className="text-center text-sm font-semibold">ଓଡ଼ିଶା ସରକାର | Government of Odisha</p>
      </div>

      <header className="bg-white/10 shadow-md border-b-1 border-gray-100">
        <div className="max-w-full mx-auto px-2 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-[4px]">
              <img src={logo} alt="Odisha Logo" className="h-14 w-16 object-contain" />
              <div className="border-l-2 border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-blue-600">ଓଡ଼ିଶା ସରକାର</h1>
                <p className="text-lg font-semibold text-gray-800">Government of Odisha</p>
                <p className="text-sm text-gray-600">Transport Department</p>
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white 
                         px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md
                         focus:outline-none focus:ring-2  hover:cursor-pointer focus:ring-orange-400 focus:ring-offset-2"
              >
                <FiUser className="w-5 h-5" />
                <span>Login</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-2xl 
                              border-2 border-orange-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full flex items-center px-6 py-4 text-left hover:bg-orange-50 
                               transition-colors duration-150 border-b border-gray-100 last:border-0"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                        <FiUser className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{role.name}</div>
                        <p className="text-sm text-gray-600">{role.fullName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {selectedRole && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl border-[1px] border-gray-50 w-full max-w-5xl 
                       transform animate-in zoom-in-95 duration-200 origin-center overflow-hidden"
          >
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between">
                <div>
                  <div className="flex flex-col items-center space-x-3 mb-8">
                    <img src={logo} alt="Odisha Logo" className="w-30 h-30 bg-white rounded-lg p-2" />
                    <div>
                      <h2 className="text-2xl font-bold">Government of Odisha</h2>
                      <p className="text-blue-100 text-sm text-center">Transport Department</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-3xl font-bold mb-2">{selectedRole.name}</h3>
                      <p className="text-blue-100 text-lg">{selectedRole.fullName}</p>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-blue-100 pt-8 border-t border-blue-400">
                  <p>© 2025 Government of Odisha. All rights reserved.</p>
                </div>
              </div>

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

                <button
                  type="button"
                  onClick={handlePasswordLogin}
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
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>

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

      <div className="">
        <img src={heroImage} alt="Hero" className="w-full h-1/3 object-cover" />
      </div>
    </div>
  );
}

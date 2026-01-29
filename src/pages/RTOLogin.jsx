import React, { useState, useRef, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { authAPI } from "../apis/apiService";
import { compareOTP, decryptOTP } from "../utils/encryptionUtils";
import logo from '../assests/logo.png';
import heroImage from '../assests/home7.png';
import './RTOLogin.css';
export default function RTOLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Forgot Password states
  const [forgotStep, setForgotStep] = useState("username");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotOTP, setForgotOTP] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [encryptedOTPStored, setEncryptedOTPStored] = useState(null);
  const [otpTimeout, setOtpTimeout] = useState(null);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [backendOTP, setBackendOTP] = useState(null);
  // Change Password states
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  const roles = [
    { id: "RTO", name: "RTO Login", fullName: "Regional Transport Officer", authType: "password" },
    { id: "Collector", name: "Collector Login", fullName: "District Collector", authType: "password" },
    { id: "Commissioner", name: "Commissioner Login", fullName: "Transport Commissioner", authType: "password" }
  ];

  useEffect(() => {
    return () => {
      if (otpTimeout) clearTimeout(otpTimeout);
    };
  }, [otpTimeout]);

  // Forgot Password - Step 1: Request OTP
  const handleForgotPasswordStep1 = async () => {
    if (!forgotUsername.trim()) {
      setError("Please enter username");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.requestOTP(forgotUsername);
      if (response.data.success) {
        // Store encrypted OTP from server


        if (response.data.encryptedOTP) {
          const otp = decryptOTP(response.data.encryptedOTP)
          setBackendOTP(otp);
        }

        setEncryptedOTPStored(response.data.encryptedOTP);
        setForgotStep("otp");
        setForgotOTP("");
        setOtpAttempts(0);
        setError("");

        // Set OTP timeout (5 minutes)
        const timeout = setTimeout(() => {
          setEncryptedOTPStored(null);
          setBackendOTP(null);
          setForgotOTP("");
          alert("OTP expired. Please request a new OTP");
          setForgotStep("username");
        }, 300000);

        setOtpTimeout(timeout);
        alert("OTP sent to your registered mobile number");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to request OTP");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify OTP (Frontend validation)
  const handleForgotPasswordStep2 = () => {
    if (!forgotOTP.trim()) {
      setError("Please enter OTP");
      return;
    }

    if (!encryptedOTPStored) {
      setError("OTP expired. Please request a new OTP");
      return;
    }

    // Compare entered OTP with encrypted OTP from server
    const isOTPValid = compareOTP(forgotOTP, encryptedOTPStored);

    if (isOTPValid) {
      setForgotStep("newpassword");
      setError("");
      setBackendOTP(null);
      if (otpTimeout) clearTimeout(otpTimeout);
      alert("OTP verified successfully!");
    } else {
      setOtpAttempts(prev => prev + 1);
      const remainingAttempts = 3 - otpAttempts;

      if (remainingAttempts <= 0) {
        setError("Maximum OTP attempts exceeded. Please request a new OTP");
        setForgotStep("username");
        setEncryptedOTPStored(null);
        setBackendOTP(null);
        setForgotOTP("");
        setOtpAttempts(0);
        if (otpTimeout) clearTimeout(otpTimeout);
      } else {
        setError(`Invalid OTP. ${remainingAttempts} attempt(s) remaining`);
      }
    }
  };

  // Forgot Password - Step 3: Reset Password
  const handleForgotPasswordStep3 = async () => {
    if (!forgotNewPassword.trim()) {
      setError("Please enter new password");
      return;
    }
    if (!forgotConfirmPassword.trim()) {
      setError("Please confirm password");
      return;
    }

    if (forgotNewPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword({
        username: forgotUsername,
        otp: forgotOTP,
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword
      });

      if (response.data.success) {
        alert(response.data.message);
        closeForgotPassword();
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to reset password");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!changePasswordData.currentPassword) {
      setError("Please enter current password");
      return;
    }
    if (!changePasswordData.newPassword) {
      setError("Please enter new password");
      return;
    }
    if (!changePasswordData.confirmPassword) {
      setError("Please confirm new password");
      return;
    }

    if (changePasswordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.changePassword({
        username: username,
        ...changePasswordData
      });

      if (response.data.success) {
        alert(response.data.message);
        setShowChangePassword(false);
        setChangePasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setError("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to change password");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep("username");
    setForgotUsername("");
    setForgotOTP("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setEncryptedOTPStored(null);
    setBackendOTP(null);
    setOtpAttempts(0);
    setError("");
    if (otpTimeout) clearTimeout(otpTimeout);
  };

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
      const response = await authAPI.login({ username, password });

      const userRole = response.data.role;
      const selectedRoleId = selectedRole?.id;

      const normalizeRole = (role) => role?.toString().toUpperCase().trim();
      const normalizedUserRole = normalizeRole(userRole);
      const normalizedSelectedRole = normalizeRole(selectedRoleId);

      if (normalizedUserRole !== normalizedSelectedRole) {
        setError(`Access Denied: Your account does not have permission to access this role.`);
        setIsLoading(false);
        return;
      }

      const formatRoleForRouting = (role) => {
        const upperRole = role.toUpperCase();
        const roleMap = {
          'RTO': 'RTO',
          'COLLECTOR': 'Collector',
          'COMMISSIONER': 'Commissioner',
        };
        return roleMap[upperRole] || role;
      };

      const formattedRole = formatRoleForRouting(userRole);

      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        ...response.data,
        role: formattedRole
      }));

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
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        if (showForgotPassword) closeForgotPassword();
        if (showChangePassword) setShowChangePassword(false);
        if (selectedRole) closeModal();
      }
    }
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [showForgotPassword, showChangePassword, selectedRole]);

  const [showPassword, setShowPassword] = React.useState(false);


  // Main Login UI
  return (
    <div className="min-h-screen flex flex-col relative ">
      {/* Background Image - Always Visible */}
      <div className="fixed inset-0 -z-10">
        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
      </div>

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6">
        <p className="text-center text-sm font-semibold">ଓଡ଼ିଶା ସରକାର | Government of Odisha</p>
      </div>

      {/* Glass Header - Always Visible */}
      <header className="bg-white/70 backdrop-blur-md shadow-lg border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-2 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Odisha Logo" className="h-14 w-16 object-contain drop-shadow-md" />
              <div className="border-l-2 border-gray-400/50 pl-4">
                <h1 className="text-xl font-bold text-blue-600 drop-shadow-sm">ଓଡ଼ିଶା ସରକାର</h1>
                <p className=" text-gray-800 drop-shadow-sm text-lg font-semibold tracking-wide">Government of Odisha</p>
                <p className="text-xs text-gray-700 drop-shadow-sm tracking-wide">Transport Department</p>
              </div>
            </div>
            <div className="mr-[100px]">
              <div>
                <p className="text-[1.3rem] font-semibold text-gray-800 drop-shadow-sm">VEHICLE REQUISITION SYSTEM</p>
                <p className="text-[10px] text-gray-700 drop-shadow-sm tracking-wide text-center">
                  Smart Platform for Official Vehicle Requisition
                </p>

              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2  bg-orange-700 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <FiUser className="w-5 h-5" />
                <span>Login</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-lg shadow-2xl border-2 border-orange-200 py-2 z-50 animate-in slide-in-from-top-2">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role)}
                      className="w-full flex items-center px-6 py-4 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0"
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

      <div className="flex-grow flex items-center justify-center ">
        <img src={heroImage} alt="Hero" className="w-full h-[100vh] object-cover " />
      </div>
      <footer className="w-full bg-[#003169] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">

          {/* Top Tabs */}
       <div className="flex flex-wrap justify-center gap-4 border-b border-white/20 pb-3">
            <a href="https://odisha.gov.in/" className="hover:underline" target="_blank">
              Odisha Government
            </a>
            <a href="https://odishatransport.gov.in/" className="hover:underline" target="_blank">
              Transport Department
            </a>
            <a href="https://www.nic.gov.in/" className="hover:underline" target="_blank">
              National Informatics Centre
            </a>
            <a href="http://www.digitalindia.gov.in/" className="hover:underline" target="_blank">
              Digital India
            </a>
            <a href="https://parivahan.gov.in/" className="hover:underline" target="_blank">
              Parivahan
            </a>
          </div>

          {/* Bottom Text */}
          <div className="mt-3 text-center text-xs text-gray-300">
            <p>
              Powered by National Informatics Centre (NIC)
            </p>
            <p>
              © 2026 Government of Odisha. All Rights Reserved.
            </p>
          </div>

        </div>
      </footer>



      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {forgotStep === "username" && "Forgot Password"}
                {forgotStep === "otp" && "Verify OTP"}
                {forgotStep === "newpassword" && "Set New Password"}
              </h2>
              <button
                onClick={closeForgotPassword}
                className="hover:bg-white/20 p-2 rounded transition-colors"
                disabled={isLoading}
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-in slide-in-from-top">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {forgotStep === "username" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your username"
                      disabled={isLoading}
                      autoFocus
                    />
                  </div>
                  <button
                    onClick={handleForgotPasswordStep1}
                    disabled={isLoading || !forgotUsername.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </div>
              )}



              {forgotStep === "otp" && (

                <div className="space-y-6">
                  {backendOTP && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                      <p className="text-xs text-yellow-800 font-semibold mb-1">
                        STAGING MODE - For Testing Only
                      </p>
                      <p className="text-sm text-yellow-900">
                        Your OTP is: <span className="font-bold text-2xl tracking-wider">{backendOTP}</span>
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        (This will be hidden in production)
                      </p>
                    </div>
                  )}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm text-blue-900">
                      OTP sent to your registered mobile numbers..
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Enter OTP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={forgotOTP}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setForgotOTP(value);
                      }}
                      maxLength="4"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-3xl tracking-widest font-mono transition-colors"
                      placeholder="0000"
                      disabled={isLoading}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-2 text-center">Enter the 4-digit code sent to your phone</p>
                  </div>
                  <button
                    onClick={handleForgotPasswordStep2}
                    disabled={isLoading || !forgotOTP || forgotOTP.length !== 4}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <button
                    onClick={() => {
                      setForgotStep("username");
                      setForgotOTP("");
                      setOtpAttempts(0);
                      setError("");
                      if (otpTimeout) clearTimeout(otpTimeout);
                    }}
                    className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm font-medium hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    Didn't receive OTP? Request again
                  </button>
                </div>
              )}

              {forgotStep === "newpassword" && (
                <div className="space-y-6">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm text-green-900">
                      OTP verified successfully
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter new password"
                      disabled={isLoading}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Confirm password"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={handleForgotPasswordStep3}
                    disabled={isLoading || !forgotNewPassword || !forgotConfirmPassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold">Change Password</h2>
              <button
                onClick={() => setShowChangePassword(false)}
                className="hover:bg-white/20 p-2 rounded transition-colors"
                disabled={isLoading}
              >
                <IoMdClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-in slide-in-from-top">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.currentPassword}
                    onChange={(e) => setChangePasswordData({
                      ...changePasswordData,
                      currentPassword: e.target.value
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter current password"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({
                      ...changePasswordData,
                      newPassword: e.target.value
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={changePasswordData.confirmPassword}
                    onChange={(e) => setChangePasswordData({
                      ...changePasswordData,
                      confirmPassword: e.target.value
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl border border-gray-50 w-full max-w-5xl transform animate-in zoom-in-95 overflow-hidden grid md:grid-cols-2"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-white flex flex-col justify-between">
              <div>
                <div className="flex flex-col items-center mb-8">
                  <img src={logo} alt="Odisha Logo" className="w-24 h-24 bg-white rounded-lg p-2 mb-4" />
                  <h2 className="text-2xl font-bold text-center">Government of Odisha</h2>
                  <p className="text-blue-100 text-sm text-center mt-1">Transport Department</p>
                </div>

                <div className="space-y-6 text-center">
                  <div>
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
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isLoading}
              >
                <IoMdClose className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-1">Please enter your credentials to continue</p>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-in slide-in-from-top-1">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your username"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors pr-12"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                    </button>
                  </div>
                </div>


                <div className="flex items-center justify-center">
                  {/* <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Remember me</span>
                  </label> */}
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      setShowForgotPassword(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 rounded-lg font-semibold transition-all shadow-md"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>

                {/* <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Need to change your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        if (username) {
                          closeModal();
                          setShowChangePassword(true);
                        } else {
                          setError("Please enter your username first");
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Change Password
                    </button>
                  </p>
                </div> */}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
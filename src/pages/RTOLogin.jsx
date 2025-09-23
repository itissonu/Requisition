import React, { useState, useEffect, useRef } from "react";

export default function RTOLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const dropdownRef = useRef(null); // for outside click

  // Submit for Username/Password roles
  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin({ role: selectedRole, username, password });
    } else {
      alert("Enter Username and Password");
    }
  };

  // OTP send simulation
  const handleSendOtp = () => {
    if (mobile.length === 10) {
      setOtpSent(true);
      alert("OTP sent to " + mobile);
    } else {
      alert("Enter a valid 10-digit mobile number");
    }
  };

  // OTP verify simulation
  const handleOtpLogin = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      onLogin({ role: selectedRole, mobile, otp });
    } else {
      alert("Enter valid 6-digit OTP");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLoginOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-700">
          Vehicle Requisition System
        </h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLoginOptions(!showLoginOptions)}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Login
          </button>

          {/* Login Options Card */}
          {showLoginOptions && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg p-2 z-50 border border-gray-200">
              {[
                "RTO Login",
                "Collector Login",
                "Designated Officer Login",
                "Department Login",
              ].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setShowLoginOptions(false);
                    // reset form states
                    setUsername("");
                    setPassword("");
                    setMobile("");
                    setOtp("");
                    setOtpSent(false);
                  }}
                  className="block w-full text-left px-4 py-2 rounded 
                             hover:bg-gray-100 hover:text-gray-700 transition"
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Login Form */}
      {selectedRole && (
        <div className="flex items-center justify-center mt-10">
          <form
            onSubmit={
              selectedRole === "RTO Login" || selectedRole === "Collector Login"
                ? handlePasswordLogin
                : handleOtpLogin
            }
            className="relative bg-white p-8 rounded-lg shadow-lg w-96 border border-gray-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              {selectedRole}
            </h2>

            {/* Username + Password for RTO / Collector */}
            {(selectedRole === "RTO Login" ||
              selectedRole === "Collector Login") && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

            {/* Mobile + OTP for Designated Officer / Department */}
            {(selectedRole === "Designated Officer Login" ||
              selectedRole === "Department Login") && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="mt-1 w-full p-2 border rounded"
                      maxLength="10"
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-4"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <div className="mb-4">
                      <label className="block text-sm font-medium">OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                        maxLength="6"
                      />
                    </div>
                  )}
                </>
              )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {selectedRole === "RTO Login" || selectedRole === "Collector Login"
                ? "Login"
                : "Verify OTP"}
            </button>
            <div>
              <a href="#">Forgot Password?</a>
            </div>
          </form>

        </div>
      )}
    </div>
  );
}

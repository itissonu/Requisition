import React, { useState } from "react";
import RTOLogin from "./pages/RTOLogin";
import RTODashboard from "./pages/RTODashboard";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        <RTODashboard onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <RTOLogin onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
}

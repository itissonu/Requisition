import React from "react";

export default function Header({ onLogout }) {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="text-lg font-semibold text-blue-700">
        Vehicle Requisition System — RTO
      </div>
      <button
        onClick={onLogout}
        className="px-3 py-1 bg-red-600 text-white rounded"
      >
        Logout
      </button>
    </header>
  );
}

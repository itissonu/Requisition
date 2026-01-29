import React from "react";
import { Bell, User, LogOut } from "lucide-react";

export default function Header({ user, onLogout }) {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="text-lg font-semibold text-blue-700">
        Vehicles Requisition System — {user?.role} Portal
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-100" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            {/* <p className="text-xs text-gray-500">{user?.role}</p> */}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex text-sm font-semibold items-center tracking-wide px-3 py-1 hover:cursor-pointer bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}

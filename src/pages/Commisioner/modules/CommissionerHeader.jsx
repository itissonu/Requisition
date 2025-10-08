import React from "react";
import { Bell, User, LogOut } from "lucide-react";

export default function CommissionerHeader({ user, onLogout }) {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center">
        <div className="text-lg font-semibold text-blue-700">
          Vehicle Requisition System — Commissioner Portal
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-500 hover:text-gray-700 cursor-pointer" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            2
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name || 'Commissioner'}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
}

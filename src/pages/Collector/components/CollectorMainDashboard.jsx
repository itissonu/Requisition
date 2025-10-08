import React, { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Car, 
  Users, 
  AlertCircle,
  TrendingUp
} from "lucide-react";

// Demo data based on your models
const dashboardStats = {
  pendingApprovals: 5,
  totalRequests: 23,
  approvedToday: 3,
  rejectedToday: 1,
  totalEvents: 45,
  completedEvents: 32,
  totalVehiclesRequested: 87,
  departmentsServed: 8
};

const recentRequests = [
  {
    id: 1,
    name: "Health Department Vehicle Inspection",
    requestingDepartmentName: "Health Department",
    status: "CREATED",
    createdAt: "2025-10-06T09:30:00",
    priority: "HIGH"
  },
  {
    id: 2,
    name: "Education Department Survey",
    requestingDepartmentName: "Education Department", 
    status: "CREATED",
    createdAt: "2025-10-06T08:15:00",
    priority: "MEDIUM"
  },
  {
    id: 3,
    name: "Road Safety Campaign",
    requestingDepartmentName: "Transport Department",
    status: "APPROVED",
    createdAt: "2025-10-05T14:20:00",
    priority: "HIGH"
  }
];

export default function CollectorMainDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "text-red-600";
      case "MEDIUM": return "text-yellow-600";
      case "LOW": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collector Dashboard</h1>
            {/* <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p> */}
          </div>
          {/* <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-gray-600">
              {currentTime.toLocaleDateString()}
            </div>
          </div> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.pendingApprovals}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalRequests}</p>
            </div>
            <FileText className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalEvents}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        {/* <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Departments Served</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.departmentsServed}</p>
            </div>
            <Users className="w-12 h-12 text-purple-500" />
          </div>
        </div> */}
      </div>

      {/* Today's Activity & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Activity */}
        {/* <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Approved</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{dashboardStats.approvedToday}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Rejected</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{dashboardStats.rejectedToday}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Vehicles Requested</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{dashboardStats.totalVehiclesRequested}</span>
            </div>
          </div>
        </div> */}

        {/* Recent Requests */}
        {/* <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{request.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>{request.requestingDepartmentName}</span>
                  <span className={`font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(request.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </div>

      {/* Quick Actions */}
      {/* <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Clock className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-600">Review Pending Approvals</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors">
            <FileText className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-600">View All Requests</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors">
            <TrendingUp className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
            <p className="text-sm font-medium text-gray-600">View All Events</p>
          </button>
        </div>
      </div> */}
    </div>
  );
}

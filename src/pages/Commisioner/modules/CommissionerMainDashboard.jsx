import React from "react";
import { Clock, CheckCircle, FileText, AlertCircle } from "lucide-react";

export default function CommissionerMainDashboard() {
  const stats = [
    {
      title: "Pending Approvals",
      value: "2",
      icon: Clock,
      color: "yellow",
      description: "Utilizations awaiting approval"
    },
    {
      title: "Approved This Month",
      value: "8",
      icon: CheckCircle,
      color: "green",
      description: "Successfully approved"
    },
    {
      title: "Total Amount Approved",
      value: "₹2,45,000",
      icon: FileText,
      color: "blue",
      description: "This fiscal year"
    },
    {
      title: "Rejected",
      value: "1",
      icon: AlertCircle,
      color: "red",
      description: "Rejected utilizations"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
      green: "bg-green-50 border-green-200 text-green-800",
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      red: "bg-red-50 border-red-200 text-red-800"
    };
    return colors[color];
  };

  const getIconColor = (color) => {
    const colors = {
      yellow: "text-yellow-600",
      green: "text-green-600",
      blue: "text-blue-600",
      red: "text-red-600"
    };
    return colors[color];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commissioner Dashboard</h1>
        <p className="text-gray-600">Overview of event utilization approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${getColorClasses(stat.color)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${getIconColor(stat.color)}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <h3 className="font-semibold mb-1">{stat.title}</h3>
              <p className="text-sm opacity-75">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <Clock className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <p className="font-medium">New utilization request</p>
              <p className="text-sm text-gray-600">Road Safety Campaign - ₹15,000</p>
            </div>
            <span className="ml-auto text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="font-medium">Approved utilization</p>
              <p className="text-sm text-gray-600">Forest Conservation Drive - ₹18,200</p>
            </div>
            <span className="ml-auto text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { utilizationAPI, eventAPI, billSanctionAPI } from "../../../apis/apiService";

export default function CollectorMainDashboard() {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalRequests: 0,
    totalEvents: 0,
    totalVehiclesRequested: 0,
    totalBills: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);
  useEffect(() => {
    async function fetchDashboardData() {
      try {

        // const utilRes = await utilizationAPI.getByStatus("UTILIZATION_SUBMITTED");
        const utilRes = await utilizationAPI.getByStatus("UTILIZATION_SUBMITTED");
        const response = await eventAPI.list();
        const evRes = response

  
        const billRes = []
        let totalVehiclesRequested = 0;

        response.data.forEach(u => {
          u.subEvents?.forEach(subEvent => {
           
            subEvent.vehicles?.forEach(v => {
            
              totalVehiclesRequested += v.quantity || 0;
            });
          });
        });

        setStats({
          pendingApprovals: utilRes.data.length,
          totalRequests: utilRes?.data?.length + utilRes?.data?.length,
          totalEvents: evRes?.data?.length,
          totalVehiclesRequested:totalVehiclesRequested,
          totalBills: billRes?.data?.length
        });


        const recent = utilRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(u => ({
            id: u.id,
            name: u.eventName,
            requestingDepartmentName: u.requestingDepartment,
            status: u.status,
            createdAt: u.createdAt,
            priority: "MEDIUM"
          }));
        setRecentRequests(recent);
      } catch (err) {
        console.error(err);
        alert("Failed to load dashboard data");
      }
    }
    fetchDashboardData();
    //fetchData();
  }, []);






  const getStatusColor = status => {
    switch (status) {
      case "CREATED":
      case "PENDING_COLLECTOR_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Collector Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview & Reports</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Approvals</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingApprovals}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalEvents}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Vehicles Requested
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalVehiclesRequested}
              </p>
            </div>
            <Car className="w-12 h-12 text-green-500" />
          </div>
        </div>


      </div>

      {/* Recent Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Requests
        </h3>
        <div className="space-y-3">
          {recentRequests.map(request => (
            <div
              key={request?.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900 text-sm">
                  Event Name:-{' '}{request?.name}
                </h4>
                {/* <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request?.status.replace(
                    "PENDING_COLLECTOR_APPROVAL",
                    "PENDING"
                  )}
                </span> */}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="font-semibold">Department Name:-{request?.requestingDepartmentName}</span>
                <span className={`font-medium ${getPriorityColor(request?.priority)} `}>
                  {request.priority}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(request.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

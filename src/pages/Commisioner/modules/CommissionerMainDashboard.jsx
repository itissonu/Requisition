import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, FileText, AlertCircle, DollarSign, TrendingUp, IndianRupee } from "lucide-react";
import { utilizationAPI, billSanctionAPI, advancePaymentAPI } from "../../../apis/apiService";

export default function CommissionerMainDashboard() {
  const [stats, setStats] = useState({
    pendingUtilizations: 0,
    approvedThisMonth: 0,
    totalAmountSanctioned: 0,
    totalAmountNeedToSanction: 0,
    rejectedUtilizations: 0,
    pendingBills: 0,
    advancePaymentsRequested: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all utilizations and bills
      const [utilizationsResponse, billsResponse, advancePaymentsResponse] = await Promise.all([
        utilizationAPI.list(),
        billSanctionAPI.list(),
        advancePaymentAPI.list(),

      ]);

      const utilizations = utilizationsResponse.data || [];
      const bills = billsResponse.data || [];
      const advancePayments = advancePaymentsResponse.data || [];

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const pendingUtilizations = utilizations.filter(u =>
        u.utilizationStatus === 'COLLECTOR_APPROVED'
      ).length;

      const approvedThisMonth = utilizations.filter(u => {
        const approvalDate = new Date(u.updatedAt);
        return (u.utilizationStatus === 'COMMISSIONER_APPROVED' || u.utilizationStatus === 'COMPLETED') &&
          approvalDate.getMonth() === currentMonth &&
          approvalDate.getFullYear() === currentYear;
      }).length;

      // Total amount sanctioned (from bills)
      const totalAmountSanctioned = bills
        .reduce((sum, b) => sum + (b.amount || 0), 0);

      // Total amount that needs to be sanctioned (approved utilizations - bills created)
      const approvedUtilizations = utilizations.filter(u =>
        u.utilizationStatus === 'COMMISSIONER_APPROVED' || u.utilizationStatus === 'COMPLETED'
      );

      const totalUtilizationAmount = approvedUtilizations.reduce((sum, u) =>
        sum + (u.totalCost || 0), 0
      );

      const totalAmountNeedToSanction = totalUtilizationAmount - totalAmountSanctioned;

      const rejectedUtilizations = utilizations.filter(u =>
        u.utilizationStatus === 'REJECTED'
      ).length;

      const pendingBills = bills.filter(b =>
        b.status === 'CREATED' || b.status === 'COLLECTOR_APPROVED' || b.status === 'COMPLETED'
      ).length;

      const advancePaymentsRequested = advancePayments.filter(ap =>
        ap.status === 'APPROVED'
      ).length;

      setStats({
        pendingUtilizations,
        approvedThisMonth,
        totalAmountSanctioned,
        totalAmountNeedToSanction,
        rejectedUtilizations,
        pendingBills,
        advancePaymentsRequested
      });

      // Prepare recent activity
      const activities = [
        ...utilizations.slice(0, 3).map(u => ({
          type: u.utilizationStatus === 'COLLECTOR_APPROVED' ? 'pending' : 'approved',
          title: u.utilizationStatus === 'COLLECTOR_APPROVED'
            ? 'New utilization request'
            : 'Approved utilization',
          description: `${u.eventName} - ₹${u.totalCost?.toLocaleString('en-IN')}`,
          time: u.createdAt,
          icon: u.utilizationStatus === 'COLLECTOR_APPROVED' ? Clock : CheckCircle,
          color: u.utilizationStatus === 'COLLECTOR_APPROVED' ? 'yellow' : 'green'
        })),
        ...bills.slice(0, 2).map(b => ({
          type: 'bill',
          title: 'Bill sanction',
          description: `${b.eventName} - ₹${b.amount?.toLocaleString('en-IN')} (${b.type})`,
          time: b.createdAt,
          icon: FileText,
          color: 'blue'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(activities);

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
      green: "bg-green-50 border-green-200 text-green-800",
      blue: "bg-blue-50 border-blue-200 text-blue-800",
      red: "bg-red-50 border-red-200 text-red-800",
      purple: "bg-purple-50 border-purple-200 text-purple-800"
    };
    return colors[color];
  };

  const getIconColor = (color) => {
    const colors = {
      yellow: "text-yellow-600",
      green: "text-green-600",
      blue: "text-blue-600",
      red: "text-red-600",
      purple: "text-purple-600"
    };
    return colors[color];
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const dashboardStats = [
    // {
    //   title: "Pending Approvals",
    //   value: stats.pendingUtilizations,
    //   icon: Clock,
    //   color: "yellow",
    //   description: "Utilizations awaiting approval"
    // },
    {
      title: "Utilization Approved This Month",
      value: stats.approvedThisMonth,
      icon: CheckCircle,
      color: "green",
      description: "Successfully approved"
    },
    {
      title: "Total Amount Sanctioned",
      value: `₹${stats.totalAmountSanctioned.toLocaleString('en-IN')}`,
      icon: CheckCircle,
      color: "green",
      description: "Bills sanctioned amount"
    },
    // {
    //   title: "Amount to Sanction",
    //   value: `₹${stats.totalAmountNeedToSanction.toLocaleString('en-IN')}`,
    //   icon: IndianRupee,
    //   color: "blue",
    //   description: "Pending bill sanctions"
    // },
    {
      title: " Bills Created",
      value: stats.pendingBills,
      icon: FileText,
      color: "purple",
      description: "No Of Bills Sanctioned"
    },
    {
      title: "Advance Payments",
      value: stats.advancePaymentsRequested,
      icon: TrendingUp,
      color: "blue",
      description: "Approved advance requests"
    },
    // {
    //   title: "Rejected",
    //   value: stats.rejectedUtilizations,
    //   icon: AlertCircle,
    //   color: "red",
    //   description: "Rejected utilizations"
    // }
  ];

  if (loading) {
    return (
       <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-16 bg-orange-500 animate-pulse"></div>
            <div className="w-3 h-16 bg-white animate-pulse mx-1"></div>
            <div className="w-3 h-16 bg-green-600 animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-700 font-semibold">Loading Commissioner Dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commissioner Dashboard</h1>
        <p className="text-gray-600">Overview of event utilization approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${getColorClasses(stat.color)} transition-transform hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${getIconColor(stat.color)}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <h3 className="font-semibold mb-1">{stat.title}</h3>
              <p className="text-sm opacity-75">{stat.description}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg ${activity.color === 'yellow' ? 'bg-yellow-50' :
                    activity.color === 'green' ? 'bg-green-50' :
                      activity.color === 'blue' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${getIconColor(activity.color)}`} />
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

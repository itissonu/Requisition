import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, FileText, DollarSign, IndianRupee } from "lucide-react";
import logo from '../../../assests/logo.png';

const CollectorAdvancePayments = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Demo data based on schema
  const demoData = {
    pending: [
      {
        id: 1,
        eventId: 101,
        eventName: "Health Department Vehicle Inspection",
        requestingDepartment: "Health Department",
        requestedAmount: 150000.00,
        status: "CREATED",
        createdAt: "2025-10-14T09:30:00",
        rtoName: "Bhubaneswar RTO",
        remarks: "Urgent requirement for vehicle inspection drive"
      },
      {
        id: 2,
        eventId: 102,
        eventName: "Education Department Survey",
        requestingDepartment: "Education Department",
        requestedAmount: 250000.00,
        status: "CREATED",
        createdAt: "2025-10-13T14:20:00",
        rtoName: "Cuttack RTO",
        remarks: "State-wide educational survey requirements"
      },
      {
        id: 3,
        eventId: 103,
        eventName: "Road Safety Campaign",
        requestingDepartment: "Transport Department",
        requestedAmount: 180000.00,
        status: "CREATED",
        createdAt: "2025-10-12T11:15:00",
        rtoName: "Berhampur RTO",
        remarks: "Road safety awareness campaign in rural areas"
      }
    ],
    approved: [
      {
        id: 4,
        eventId: 104,
        eventName: "Agricultural Extension Program",
        requestingDepartment: "Agriculture Department",
        requestedAmount: 300000.00,
        status: "APPROVED",
        createdAt: "2025-10-10T08:45:00",
        approvedAt: "2025-10-11T16:30:00",
        rtoName: "Sambalpur RTO",
        remarks: "Approved for immediate disbursement",
        billsCount: 2,
        paidAmount: 150000.00
      },
      {
        id: 5,
        eventId: 105,
        eventName: "Forest Department Patrol",
        requestingDepartment: "Forest Department",
        requestedAmount: 200000.00,
        status: "APPROVED",
        createdAt: "2025-10-08T12:00:00",
        approvedAt: "2025-10-09T10:15:00",
        rtoName: "Balasore RTO",
        remarks: "Forest patrol vehicle requirements approved",
        billsCount: 1,
        paidAmount: 100000.00
      }
    ]
  };

  useEffect(() => {
    setPendingRequests(demoData.pending);
    setApprovedRequests(demoData.approved);
  }, []);

  const handleApprove = (id) => {
    console.log("Approving request:", id);
    // API call would go here
  };

  const handleReject = (id) => {
    console.log("Rejecting request:", id);
    // API call would go here
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "CREATED": { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      "APPROVED": { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      "REJECTED": { bg: "bg-red-100", text: "text-red-800", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig["CREATED"];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  const renderPendingTable = () => (
    <div className="overflow-x-auto">

      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Request Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              RTO Office
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pendingRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{request.eventName}</div>
                  <div className="text-sm text-gray-500">{request.requestingDepartment}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Created: {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <IndianRupee className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-gray-900">
                    ₹{request.requestedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {request.rtoName}
              </td>
              <td className="px-4 py-4">
                {getStatusBadge(request.status)}
              </td>
              <td className="px-4 py-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderApprovedTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white" >
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Request Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Amount Details
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Bills Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium  uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {approvedRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{request.eventName}</div>
                  <div className="text-sm text-gray-500">{request.requestingDepartment}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Approved: {new Date(request.approvedAt).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Requested: ₹{request.requestedAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-green-600">
                    Paid: ₹{request.paidAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-gray-500">
                    Remaining: ₹{(request.requestedAmount - request.paidAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-900">{request.billsCount} Bills</span>
                </div>
              </td>
              <td className="px-4 py-4">
                {getStatusBadge(request.status)}
              </td>
              <td className="px-4 py-4">
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                  <Eye className="w-3 h-3 mr-1" />
                  View Bills
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">COLLECTOR - ADVANCE PAYMENT DETAILS</h3>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Pending Approval ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === "approved"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Approved Requests ({approvedRequests.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "pending" ? renderPendingTable() : renderApprovedTable()}
        </div>
      </div>
    </div>
  );
};

export default CollectorAdvancePayments;

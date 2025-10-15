import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, DollarSign, FileText, Plus } from "lucide-react";

const CommissionerAdvancePayments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);

  // Demo data with different statuses
  const demoRequests = [
    {
      id: 1,
      eventId: 101,
      eventName: "Health Department Vehicle Inspection",
      requestingDepartment: "Health Department",
      requestedAmount: 150000.00,
      status: "CREATED",
      createdAt: "2025-10-14T09:30:00",
      rtoName: "Bhubaneswar RTO",
      district: "Khurda",
      remarks: "Urgent requirement for vehicle inspection drive",
      bills: []
    },
    {
      id: 2,
      eventId: 102,
      eventName: "Education Department Survey",
      requestingDepartment: "Education Department", 
      requestedAmount: 250000.00,
      status: "APPROVED",
      createdAt: "2025-10-13T14:20:00",
      approvedAt: "2025-10-14T10:30:00",
      rtoName: "Cuttack RTO",
      district: "Cuttack",
      remarks: "Approved for educational survey activities",
      bills: [
        {
          id: 1,
          type: "ADVANCE",
          amount: 100000.00,
          status: "COMMISSIONER_APPROVED",
          createdAt: "2025-10-14T11:00:00"
        },
        {
          id: 2,
          type: "ADVANCE",
          amount: 75000.00,
          status: "CREATED",
          createdAt: "2025-10-14T15:30:00"
        }
      ]
    },
    {
      id: 3,
      eventId: 103,
      eventName: "Road Safety Campaign",
      requestingDepartment: "Transport Department",
      requestedAmount: 180000.00,
      status: "APPROVED", 
      createdAt: "2025-10-12T11:15:00",
      approvedAt: "2025-10-13T09:20:00",
      rtoName: "Berhampur RTO",
      district: "Ganjam",
      remarks: "Road safety campaign approved",
      bills: [
        {
          id: 3,
          type: "ADVANCE",
          amount: 180000.00,
          status: "COMMISSIONER_APPROVED",
          createdAt: "2025-10-13T14:45:00"
        }
      ]
    }
  ];

  useEffect(() => {
    setRequests(demoRequests);
  }, []);

  const handleApprove = (id) => {
    console.log("Approving request:", id);
    // API call would go here
  };

  const handleReject = (id) => {
    console.log("Rejecting request:", id);
    // API call would go here
  };

  const handleCreateBill = (requestId) => {
    setSelectedRequest(requests.find(r => r.id === requestId));
    setShowBillModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "CREATED": { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock },
      "APPROVED": { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      "REJECTED": { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      "PAID": { bg: "bg-blue-100", text: "text-blue-800", icon: DollarSign }
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

  const getBillStatusBadge = (status) => {
    const statusConfig = {
      "CREATED": { bg: "bg-yellow-100", text: "text-yellow-800" },
      "COLLECTOR_APPROVED": { bg: "bg-blue-100", text: "text-blue-800" },
      "COMMISSIONER_APPROVED": { bg: "bg-green-100", text: "text-green-800" },
      "PAID": { bg: "bg-purple-100", text: "text-purple-800" }
    };
    
    const config = statusConfig[status] || statusConfig["CREATED"];
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const getTotalBillAmount = (bills) => {
    return bills.reduce((sum, bill) => sum + bill.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Advance Payment Requests Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage advance payment requests from RTOs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount & Bills
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RTO & District
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.eventName}</div>
                      <div className="text-sm text-gray-500">{request.requestingDepartment}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {new Date(request.createdAt).toLocaleDateString()}
                        {request.approvedAt && (
                          <div>Approved: {new Date(request.approvedAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          ₹{request.requestedAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {request.bills.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            Bills: {request.bills.length} | 
                            Sanctioned: ₹{getTotalBillAmount(request.bills).toLocaleString('en-IN')}
                          </div>
                          {request.bills.map((bill, index) => (
                            <div key={bill.id} className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Bill #{index + 1}: ₹{bill.amount.toLocaleString('en-IN')}
                              </span>
                              {getBillStatusBadge(bill.status)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.rtoName}</div>
                      <div className="text-sm text-gray-500">{request.district} District</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      {request.status === "CREATED" && (
                        <>
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
                        </>
                      )}
                      
                      {request.status === "APPROVED" && (
                        <button
                          onClick={() => handleCreateBill(request.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Create Bill
                        </button>
                      )}

                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Creation Modal */}
      {showBillModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Bill for {selectedRequest.eventName}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill Type</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option value="ADVANCE">Advance Payment</option>
                    <option value="FINAL">Final Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input 
                    type="number" 
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Remarks</label>
                  <textarea 
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    rows="3"
                    placeholder="Enter remarks"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Create Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionerAdvancePayments;

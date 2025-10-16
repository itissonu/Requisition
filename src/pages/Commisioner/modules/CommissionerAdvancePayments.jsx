import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, DollarSign, FileText, Plus, X, Calendar, MapPin, Car, IndianRupee, Receipt } from "lucide-react";
import { advancePaymentAPI, billSanctionAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

const CommissionerAdvancePayments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [billRemarks, setBillRemarks] = useState('');
  const [activeTab, setActiveTab] = useState('bills');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, billsRes] = await Promise.all([
        advancePaymentAPI.list(),
        billSanctionAPI.list()
      ]);
      // console.log("requestsRes:", requestsRes.data, "billsRes:", billsRes.data);
      const requestsData = requestsRes.data;
      const billsData = billsRes.data;

      // Process requests with bills data
      const processedRequests = requestsData.map(request => {
        const requestBills = billsData.filter(bill => bill.advancePaymentRequestId === request.id);

        //  console.log(requestBills, 'requestedbills');
        const totalSanctioned = requestBills.reduce((sum, bill) => sum + bill.amount, 0);

        return {
          ...request,
          bills: requestBills,
          totalSanctioned,
          remaining: request?.requestedAmount - totalSanctioned
        };
      });
      // console.log(processedRequests, "processdataarequests")
      setRequests(processedRequests);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to load advance payment requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const remarks = prompt("Enter approval remarks (optional):");
    try {
      await advancePaymentAPI.approve(id, remarks || "Approved by Commissioner");
      alert("Request approved successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    const remarks = prompt("Enter rejection reason:");
    if (!remarks) return;

    try {
      await advancePaymentAPI.reject(id, remarks);
      alert("Request rejected successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to reject request:", error);
      alert("Failed to reject request");
    }
  };

  const handleCreateBill = (request) => {
    setSelectedRequest(request);
    setBillAmount('');
    setBillRemarks('');
    setShowBillModal(true);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setActiveTab('bills');
    setShowDetailsModal(true);
  };

  console.log(selectedRequest, "selectedrequestststss")



  function getBillTypeLabel(type) {
    switch (type) {
      case 'ADVANCE':
        return 'Advance Payment';
      case 'FINAL':
        return 'Final Payment';
      case 'PARTIAL_PAID':
        return 'Partial Paid';
      case 'PARTIAL_PAYMENT_ADVANCE':
        return 'Partial  Advance Payment Partially Paid';
      default:
        return type;
    }
  }

  const submitBill = async () => {
    if (!billAmount || parseFloat(billAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(billAmount) > selectedRequest.remaining) {
      alert("Bill amount cannot exceed remaining amount");
      return;
    }
    let type;
    if (parseFloat(billAmount) !== selectedRequest.requestedAmount) {
      type = "PARTIAL_PAYMENT_ADVANCE";
    }
    // console.log(selectedRequest, "selectedRequesttttttttttttt")
    try {
      await billSanctionAPI.create({
        advancePaymentRequestId: selectedRequest?.id,
        eventId: selectedRequest?.eventId,
        type: type,
        amount: parseFloat(billAmount),
        remarks: billRemarks
      });

      alert("Bill created successfully!");
      setShowBillModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create bill:", error);
      alert("Failed to create bill");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "CREATED": { bg: "bg-yellow-100", text: "text-yellow-800", icon: Clock, label: "Pending" },
      "APPROVED": { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle, label: "Verified From Collector" },
      "REJECTED": { bg: "bg-red-100", text: "text-red-800", icon: XCircle, label: "Rejected" },
      "PAID": { bg: "bg-blue-100", text: "text-blue-800", icon: DollarSign, label: "Paid" }
    };

    const config = statusConfig[status] || statusConfig["CREATED"];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getBillStatusBadge = (status) => {
    const statusConfig = {
      "CREATED": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Created" },
      "COLLECTOR_APPROVED": { bg: "bg-blue-100", text: "text-blue-800", label: "Collector Approved" },
      "COMMISSIONER_APPROVED": { bg: "bg-green-100", text: "text-green-800", label: "Commissioner Approved" },
      "PAID": { bg: "bg-purple-100", text: "text-purple-800", label: "Paid" }
    };

    const config = statusConfig[status] || statusConfig["CREATED"];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advance payment requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
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
              <h3 className="text-lg font-semibold tracking-wide">COMMISSIONER - ADVANCE PAYMENT MANAGEMENT</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {requests.filter(r => r.status === 'CREATED').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{requests.length}</p>
              </div>
              <FileText className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Requested</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ₹{requests.reduce((sum, r) => sum + r.requestedAmount, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <IndianRupee className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Sanctioned</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ₹{requests.reduce((sum, r) => sum + r.totalSanctioned, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-100 border-b border-blue-200 p-4">
            <h3 className="text-xl font-bold text-blue-900">
              Advance Payment Requests Management
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Review and manage advance payment requests from RTOs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Request Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Amount & Bills
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                    Event Info
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">REQUEST ID:  {request.id}</div>
                        {/* <div className="text-sm text-gray-500">{request.requestingDepartment}</div> */}
                        <div className="text-xs text-gray-400 mt-1">
                          <div>From: {request.rtoOfficeName}</div>
                          {/* <div>Created: {new Date(request.requestDate).toLocaleDateString('en-IN')}</div>
                          {request.advancePaymentDate && (
                            <div>Paid: {new Date(request.advancePaymentDate).toLocaleDateString('en-IN')}</div>
                          )} */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <IndianRupee className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-bold text-gray-900">
                            ₹{request?.requestedAmount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {request.bills.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              Bills: {request?.bills.length} |
                              Sanctioned: ₹{request.totalSanctioned.toLocaleString('en-IN')}
                            </div>
                            <div className="text-xs text-blue-600 font-medium">
                              Remaining: ₹{request.remaining.toLocaleString('en-IN')}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.eventName}</div>
                        <div className="text-xs text-gray-500">Event ID: {request.eventId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        {request.status === "CREATED" && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {request.status === "APPROVED" && request.remaining > 0 && (
                          <button
                            onClick={() => handleCreateBill(request)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Create Bill
                          </button>
                        )}

                        <button
                          onClick={() => handleViewDetails(request)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
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
      </div>

      {/* Bill Creation Modal - Simplified */}
      {showBillModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">Create Advance/Partial Payment Bill</h3>
                  <p className="text-sm text-blue-100 mt-1">Request #{selectedRequest.id} - {selectedRequest.eventName}</p>
                </div>
                <button
                  onClick={() => setShowBillModal(false)}
                  className="hover:bg-blue-800 rounded-full p-1 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Request Summary Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Payment Request Summary
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Total Requested</p>
                    <p className="text-lg font-bold text-gray-900">₹{selectedRequest?.requestedAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-center border-l border-r border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Already Sanctioned</p>
                    <p className="text-lg font-bold text-green-600">₹{selectedRequest?.totalSanctioned?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500">{selectedRequest?.bills?.length} bill(s)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Remaining</p>
                    <p className="text-lg font-bold text-blue-600">₹{selectedRequest.remaining.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Payment Type Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Payment Type: Advance/Partial Payment</h3>
                    <p className="text-xs text-yellow-700 mt-1">
                      You can create multiple partial payment bills until the full amount is sanctioned
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bill Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold text-lg">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-10 pr-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter bill amount"
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-600">
                    Maximum allowed: <span className="font-semibold text-blue-600">₹{selectedRequest.remaining.toLocaleString('en-IN')}</span>
                  </p>
                  {billAmount && parseFloat(billAmount) > 0 && (
                    <p className="text-xs font-medium text-green-600">
                      After this bill: ₹{(selectedRequest.remaining - parseFloat(billAmount)).toLocaleString('en-IN')} remaining
                    </p>
                  )}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks / Notes
                </label>
                <textarea
                  value={billRemarks}
                  onChange={(e) => setBillRemarks(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  rows="3"
                  placeholder="Enter any additional notes or remarks for this bill..."
                />
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={() => setShowBillModal(false)}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitBill}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Create Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal with Tabs */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">Request Details</h3>
                  <p className="text-sm text-blue-100 mt-1">Event Name - {selectedRequest.eventName}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-xs">RTO: {selectedRequest.cretedByRto}</span>
                    <span className="text-xs">Department: {selectedRequest.requestingDepartment}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="hover:bg-blue-800 rounded-full p-1 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('bills')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'bills'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Bills & Payments
                </button>
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'event'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Event Details
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'bills' && (
                <div className="space-y-6">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Total Requested</p>
                      <p className="text-2xl font-bold text-blue-600">₹{selectedRequest.requestedAmount?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-1">Initial request amount</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Total Sanctioned</p>
                      <p className="text-2xl font-bold text-green-600">₹{selectedRequest.totalSanctioned?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedRequest.bills.length} bill(s) created</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Remaining Amount</p>
                      <p className="text-2xl font-bold text-purple-600">₹{selectedRequest.remaining?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedRequest.remaining > 0 ? 'Available for billing' : 'Fully sanctioned'}
                      </p>
                    </div>
                  </div>

                  {/* Bills List */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      Payment Bills ({selectedRequest.bills.length})
                    </h4>

                    {selectedRequest.bills.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequest.bills.map((bill, index) => (
                          <div key={bill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
                                    Bill #{index + 1}
                                  </span>
                                  {getBillStatusBadge(bill.status)}
                                </div>

                                <p className="text-xs mt-2 font-bold text-gray-800">
                                  Type: {getBillTypeLabel(bill.type)}
                                </p>
                                <p className="text-xs text-gray-500 mt-0">
                                  Created: {new Date(bill.requestDate).toLocaleString('en-IN')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">₹{bill?.amount?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>

                            {bill.remarks && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-600"><strong>Remarks:</strong> {bill.remarks}</p>
                              </div>
                            )}

                            {bill.collectorApprovedByName && (
                              <div className="mt-2 text-xs text-gray-600">
                                <strong>Collector Approved By:</strong> {bill.collectorApprovedByName}
                                {bill.collectorApprovalDate && ` on ${new Date(bill.collectorApprovalDate)?.toLocaleDateString('en-IN')}`}
                              </div>
                            )}

                            {bill.commissionerApprovedByName && (
                              <div className="text-xs text-gray-600">
                                <strong>Commissioner Approved By:</strong> {bill.commissionerApprovedByName}
                                {bill.commissionerApprovalDate && ` on ${new Date(bill.commissionerApprovalDate)?.toLocaleDateString('en-IN')}`}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No bills created yet</p>
                        <p className="text-sm text-gray-500 mt-1">Bills will appear here once created</p>
                      </div>
                    )}
                  </div>

                  {/* Request Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Request Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
                      </div>
                      {/* <div>
                        <p className="text-gray-600">Request Date</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(selectedRequest.requestDate).toLocaleDateString('en-IN')}
                        </p>
                      </div> */}
                      <div>
                        <p className="text-gray-600">Created By</p>
                        <p className="font-medium text-gray-900 mt-1">{selectedRequest?.rtoName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">RTO Office</p>
                        <p className="font-medium text-gray-900 mt-1">{selectedRequest?.rtoOfficeName}</p>
                      </div>
                      {selectedRequest.collectorApprovedByName && (
                        <>
                          <div>
                            <p className="text-gray-600">Collector Approved By</p>
                            <p className="font-medium text-gray-900 mt-1">{selectedRequest.collectorApprovedByName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Collector Approval Date</p>
                            <p className="font-medium text-gray-900 mt-1">
                              {selectedRequest.collectorApprovalDate && new Date(selectedRequest.collectorApprovalDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedRequest.commissionerApprovedByName && (
                        <>
                          <div>
                            <p className="text-gray-600">Commissioner Approved By</p>
                            <p className="font-medium text-gray-900 mt-1">{selectedRequest.commissionerApprovedByName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Commissioner Approval Date</p>
                            <p className="font-medium text-gray-900 mt-1">
                              {selectedRequest.commissionerApprovalDate && new Date(selectedRequest.commissionerApprovalDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </>
                      )}
                      {selectedRequest.advancePaymentDate && (
                        <div>
                          <p className="text-gray-600">Payment Date</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {new Date(selectedRequest.advancePaymentDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedRequest.remarks && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-gray-600 text-sm mb-1">Remarks</p>
                        <p className="text-gray-800 text-sm">{selectedRequest.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'event' && (
                <div className="space-y-6">
                  {/* Event Basic Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      Event Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Event Name</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.eventName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Event ID</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.eventId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Department</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.requestingDepartment}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Request Type</p>
                        <p className="font-semibold text-gray-900">{selectedRequest.typeLabel || selectedRequest.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Events Details */}
                  {selectedRequest.subEvents?.length > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-5 border border-green-200">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Receipt className="w-5 h-5 mr-2 text-green-600" />
                        Sub-Events
                      </h4>
                      <div className="space-y-4">
                        {selectedRequest.subEvents.map((se, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                              <div>
                                <p className="text-xs text-gray-600">Place</p>
                                <p className="font-semibold text-gray-900">{se.place}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Reporting Date</p>
                                <p className="font-semibold text-gray-900">{new Date(se.reportingDate).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div>
                                {se.vehicles?.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-600 mb-1">Vehicles</p>
                                <ul className="list-disc list-inside text-sm text-gray-800">
                                  {se.vehicles.map((v, vIdx) => (
                                    <li key={vIdx} className="text-gray-900">
                                      Vehicle I({v.vehicleName}) : {v.quantity} unit{v.quantity > 1 ? 's' : ''}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                              </div>
                            </div>
                           
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionerAdvancePayments;
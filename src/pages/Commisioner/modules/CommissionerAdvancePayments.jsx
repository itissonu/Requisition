import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, DollarSign, FileText, Plus, X, Calendar, MapPin, Car, IndianRupee, Receipt, ChevronLeft, ChevronRight, Search, Filter, Info } from "lucide-react";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

      const requestsData = requestsRes.data;
      const billsData = billsRes.data;

      const processedRequests = requestsData.map(request => {
        const requestBills = billsData.filter(bill => bill.advancePaymentRequestId === request.id);
        const totalSanctioned = requestBills.reduce((sum, bill) => sum + bill.amount, 0);
        const remaining = request?.requestedAmount - totalSanctioned;
        const isFullyPaid = remaining === 0;
        const isPartiallyPaid = totalSanctioned > 0 && remaining > 0;

        return {
          ...request,
          bills: requestBills,
          totalSanctioned,
          remaining,
          isFullyPaid,
          isPartiallyPaid,
          paymentStatus: isFullyPaid ? 'complete' : (isPartiallyPaid ? 'partial' : 'pending')
        };
      });

      setRequests(processedRequests);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to load advance payment requests");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toString().includes(searchTerm) ||
        req.eventId?.toString().includes(searchTerm) ||
        req.rtoOfficeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requestingDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (paymentStatusFilter !== "all") {
      if (paymentStatusFilter === "pending") {
        filtered = filtered.filter(req => req.totalSanctioned === 0);
      } else if (paymentStatusFilter === "complete") {
        filtered = filtered.filter(req => req.isFullyPaid);
      }
    }

    return filtered;
  };

  const filteredRequests = getFilteredRequests();

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentStatusFilter]);

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

  function getBillTypeLabel(type) {
    switch (type) {
      case 'ADVANCE':
        return 'Advance Payment';
      case 'FINAL':
        return 'Final Payment';
      case 'PARTIAL_PAID':
        return 'Partial Paid';
      case 'PARTIAL_PAYMENT_ADVANCE':
        return 'Partial Advance Payment';
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

    let type = 'ADVANCE';
    if (parseFloat(billAmount) !== selectedRequest.requestedAmount) {
      type = "PARTIAL_PAYMENT_ADVANCE";
    }

    try {
      await billSanctionAPI.create({
        advancePaymentRequestId: selectedRequest?.id,
        eventId: selectedRequest?.eventId,
        type: type,
        amount: parseFloat(billAmount),
        remarks: billRemarks
      });
      setBillAmount("");
      setBillRemarks("");
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

  const getPaymentStatusBadge = (request) => {
    if (request.isFullyPaid) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          FULLY PAID
        </span>
      );
    } else if (request.isPartiallyPaid) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          PARTIALLY PAID
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          PENDING PAYMENT
        </span>
      );
    }
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
                <h2 className="text-lg opacity-90">Commerce & Transport   Department</h2>
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

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by event name, ID, RTO, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="md:w-56">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full pl-10 hover:cursor-pointer pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Payment</option>
                  <option value="complete">Complete Payment</option>
                </select>
              </div>
            </div>
          </div>
          {(searchTerm || paymentStatusFilter !== "all") && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
          )}
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
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {searchTerm || paymentStatusFilter !== "all"
                          ? "No requests match your search criteria"
                          : "No requests found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((request, index) => (
                    <tr key={request.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">REQUEST ID: {request.id}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            <div>From: {request.rtoOfficeName}</div>
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
                      <td className="px-6 py-4 text-center">
                        {getPaymentStatusBadge(request)}
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
                              className="inline-flex hover:cursor-pointer items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-3 h-3 mr-1 hover:cursor-pointer" />
                              Create Bill
                            </button>
                          )}

                          <button
                            onClick={() => handleViewDetails(request)}
                            className="inline-flex  hover:cursor-pointer items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRequests.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-4 py-2 rounded-lg font-semibold ${pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : pageNum === '...'
                          ? 'bg-transparent text-gray-400 cursor-default'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Creation Modal */}
      {showBillModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Create Bill</h3>
                  <p className="text-sm text-blue-100 mt-1">{selectedRequest.eventName}</p>
                </div>
                <button onClick={() => setShowBillModal(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 font-medium">Requested Amount:</span>
                    <p className="text-gray-900 font-bold text-lg">₹{selectedRequest.requestedAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Already Sanctioned:</span>
                    <p className="text-green-600 font-bold text-lg">₹{selectedRequest.totalSanctioned.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">Remaining:</span>
                    <p className="text-blue-600 font-bold text-lg">₹{selectedRequest.remaining.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bill Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                  <input
                    type="number"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    max={selectedRequest.remaining}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                    placeholder="Enter amount"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum: ₹{selectedRequest.remaining.toLocaleString('en-IN')}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Remarks</label>
                <textarea
                  value={billRemarks}
                  onChange={(e) => setBillRemarks(e.target.value)}
                  rows="4"
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter remarks..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitBill}
                  disabled={!billAmount || parseFloat(billAmount) <= 0}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedRequest.eventName}</h3>
                  <p className="text-sm text-blue-100 mt-1">{selectedRequest.requestingDepartment}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white/20 rounded-full p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('bills')}
                  className={`px-6 py-3 font-semibold ${activeTab === 'bills'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Bills ({selectedRequest.bills.length})
                </button>
                <button
                  onClick={() => setActiveTab('event')}
                  className={`px-6 py-3 font-semibold ${activeTab === 'event'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  Event Details
                </button>
              </div>

              {activeTab === 'bills' ? (
                <div>
                  {/* Financial Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg mb-6 border-l-4 border-blue-500">
                    <h4 className="font-bold text-gray-800 mb-3">Financial Summary</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Requested:</span>
                        <p className="text-lg font-bold text-gray-900">₹{selectedRequest.requestedAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Sanctioned:</span>
                        <p className="text-lg font-bold text-green-600">₹{selectedRequest.totalSanctioned.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Remaining:</span>
                        <p className="text-lg font-bold text-blue-600">₹{selectedRequest.remaining.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Bills:</span>
                        <p className="text-lg font-bold text-purple-600">{selectedRequest.bills.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bills List */}
                  {selectedRequest.bills.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No bills created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedRequest.bills.map((bill, index) => (
                        <div key={bill.id} className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-gray-900 flex items-center gap-2">
                                Bill #{index + 1}
                                {getBillStatusBadge(bill.status)}
                              </h5>
                              <p className="text-xs text-gray-600  font-semibold mt-1">{getBillTypeLabel(bill.type)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">₹{bill.amount.toLocaleString('en-IN')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600 text-xs">Created:</span>
                              <p className="text-gray-900">{new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Created  For:</span>
                              <p className="text-gray-900">{selectedRequest?.rtoOfficeName}</p>
                            </div>
                          </div>

                          {bill.remarks && (
                            <div className="mt-1 pt-3 border-t border-gray-200">
                              <span className="text-sm font-medium text-gray-600">Remarks:</span>
                              <p className="text-sm text-gray-800 mt-1">{bill.remarks}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Request Info */}
                  <div className="bg-gray-50 p-5 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-3">Request Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Request ID:</span>
                        <p className="text-gray-900 font-medium">{selectedRequest.id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Event ID:</span>
                        <p className="text-gray-900 font-medium">{selectedRequest.eventId}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">RTO Office:</span>
                        <p className="text-gray-900 font-medium">{selectedRequest.rtoOfficeName}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <p className="text-gray-900 font-medium">{new Date(selectedRequest.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Events */}
                  {selectedRequest.subEvents && selectedRequest.subEvents.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-3">Sub-Events</h4>
                      <div className="space-y-4">
                        {selectedRequest.subEvents.map((subEvent, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-2">
                                {idx + 1}
                              </div>
                              <h5 className="font-bold text-gray-800">Sub-Event #{idx + 1}</h5>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center text-sm">
                                <MapPin className="w-4 h-4 text-blue-600 mr-2" />
                                <div>
                                  <span className="text-gray-600">Place:</span>
                                  <p className="text-gray-900">{subEvent.place}</p>
                                </div>
                              </div>
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                                <div>
                                  <span className="text-gray-600">Date:</span>
                                  <p className="text-gray-900">{new Date(subEvent.reportingDate).toLocaleDateString('en-IN')}</p>
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                              <h6 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                <Car className="w-3 h-3 mr-1" />
                                VEHICLES
                              </h6>
                              <div className="space-y-1">
                                {subEvent.vehicles.map((vehicle, vIdx) => (
                                  <div key={vIdx} className="flex justify-between items-center bg-green-50 px-3 py-2 rounded text-sm border border-green-200">
                                    <span className="font-medium text-gray-800">{vehicle.vehicleName}</span>
                                    <span className="font-bold text-green-700 bg-white px-2 py-1 rounded border border-green-300">
                                      ×{vehicle.quantity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  {selectedRequest.remarks && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Info className="w-5 h-5 text-blue-600 mr-2" />
                        <h5 className="font-bold text-gray-800">Request Remarks</h5>
                      </div>
                      <p className="text-sm text-gray-700">{selectedRequest.remarks}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
       <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
       <p className="mb-2"> Vehicles Requisition System</p>
        <p>© Government of Odisha – Commerce & Transport Department </p>
        {/* <p className="text-xs opacity-75 mt-1">For assistance, contact: commissioner@odisha.gov.in</p> */}
      </div>
    </div>
  );
};

export default CommissionerAdvancePayments;

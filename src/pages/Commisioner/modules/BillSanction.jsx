import React, { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, IndianRupee, FileText, Calendar, Plus, Wallet, CreditCard, Building2, Receipt, DollarSign, AlertCircle, CloudCog, ChevronLeft, ChevronRight, File } from "lucide-react";
import { billSanctionAPI, utilizationAPI, advancePaymentAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

const SanctionModal = ({ isOpen, onClose, utilization, onSanction, userRole }) => {
  const [sanctionAmount, setSanctionAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (utilization) {
      setSanctionAmount(0);
      setRemarks("");
    }
  }, [utilization]);

  const handleSubmit = async () => {
    if (sanctionAmount <= 0) {
      alert("Please enter a valid sanction amount");
      return;
    }

    if (sanctionAmount > utilization.remainingAmount) {
      alert("Bill amount cannot exceed remaining amount");
      return;
    }

    setLoading(true);
    try {
      const billType = sanctionAmount >= utilization.remainingAmount ? 'FINAL' : 'PARTIAL_PAID';

      const billData = {
        eventId: utilization.eventId,
        type: billType,
        amount: parseFloat(sanctionAmount),
        remarks: remarks
      };

      await onSanction(billData);
      onClose();
    } catch (error) {
      console.error("Bill creation failed:", error);
      alert(error?.response?.data?.message || "Failed to create bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !utilization) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Sanction a Bill
                </h2>
                <p className="text-emerald-100 text-sm mt-1">Generate bill for approved utilization</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-3">
          {/* Utilization Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl mb-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800 text-lg">Utilization Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Event Name</span>
                </div>
                <p className="text-gray-900 font-medium">{utilization.eventName}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Department</span>
                </div>
                <p className="text-gray-900 font-medium">{utilization.requestingDepartment}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-lg shadow-md md:col-span-2">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs font-semibold text-emerald-100 uppercase">Total Cost</p>
                    <p className="text-white text-lg font-bold">₹{utilization.totalCost?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-100 uppercase">Advance Requested</p>
                    <p className="text-white text-lg font-bold">₹{utilization.totalAdvanceRequested?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-100 uppercase">Available to Sanction</p>
                    <p className="text-white text-lg font-bold">₹{utilization.remainingAmount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warning if advance not fully sanctioned */}
          {utilization.totalAdvanceRequested > 0 && !utilization.canSanctionFinal && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                <div>
                  <p className="text-yellow-800 font-medium">Advance Payment Pending</p>
                  <p className="text-yellow-700 text-sm">
                    All advance payments must be fully sanctioned before creating final bills.
                    Requested: ₹{utilization.totalAdvanceRequested?.toLocaleString('en-IN')},
                    Sanctioned: ₹{utilization.totalAdvanceSanctioned?.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3  items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              Bill Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="text"
                inputMode="numeric"
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setSanctionAmount(value);
                }}
                max={utilization.remainingAmount}
                value={sanctionAmount}
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold transition-all"
                placeholder="Enter bill amount"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Maximum available: ₹{utilization.remainingAmount?.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3  items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows="4"
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="Enter any additional remarks or notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || sanctionAmount <= 0}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all"
            >
              {loading ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Bill
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillSanction = () => {
  const [utilizations, setUtilizations] = useState([]);
  const [bills, setBills] = useState([]);
  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [userRole, setUserRole] = useState('COMMISSIONER');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
    getUserRole();
  }, []);

  useEffect(() => {
    filterData();
  }, [utilizations, bills, advanceRequests, searchTerm, statusFilter]);

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'COMMISSIONER');
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [utilizationsResponse, billsResponse, advanceRequestsResponse] = await Promise.all([
        utilizationAPI.getCommissionerApproved(),
        billSanctionAPI.list(),
        advancePaymentAPI.list()
      ]);

      setUtilizations(utilizationsResponse.data);
      setBills(billsResponse.data);
      setAdvanceRequests(advanceRequestsResponse.data);
      console.log(billsResponse.data, "bills sanctionsss")
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const billsByEvent = bills.reduce((acc, bill) => {
      const key = bill.eventId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(bill);
      return acc;
    }, {});

    const advanceRequestsByEvent = advanceRequests.reduce((acc, request) => {
      const key = request.eventId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(request);
      return acc;
    }, {});

    let combinedData = utilizations.map(util => {
      const eventAdvanceRequests = advanceRequestsByEvent[util.eventId] || [];
      const totalAdvanceRequested = eventAdvanceRequests
        .filter(ar => ar.status === 'APPROVED')
        .reduce((sum, ar) => sum + ar.requestedAmount, 0);

      const advanceBills = bills.filter(b =>
        eventAdvanceRequests.some(ar => ar.id === b.advancePaymentRequestId) &&
        (b.type === 'PARTIAL_PAYMENT_ADVANCE' || b.type === 'ADVANCE' || b.type === 'FINAL')
      );
      const totalAdvanceSanctioned = advanceBills.reduce((sum, b) => sum + b.amount, 0);

      const eventBills = billsByEvent[util.eventId] || [];
      const utilizationBills = eventBills.filter(b => !b.advancePaymentRequestId);
      const totalUtilizationBilled = utilizationBills.reduce((sum, b) => sum + b.amount, 0);

      const remainingAmount = util.totalCost - totalAdvanceRequested - totalUtilizationBilled;

      const canSanctionFinal = totalAdvanceRequested === 0 || totalAdvanceRequested === totalAdvanceSanctioned;

      return {
        ...util,
        bills: [...advanceBills, ...utilizationBills],
        advanceRequests: eventAdvanceRequests,
        totalAdvanceRequested,
        totalAdvanceSanctioned,
        totalBilled: totalAdvanceSanctioned + totalUtilizationBilled,
        totalUtilizationBilled,
        remainingAmount: Math.max(0, remainingAmount),
        canSanctionFinal
      };
    });

    // Enhanced search filter - search by event name, RTO name, RTO office name, and ID
    if (searchTerm) {
      combinedData = combinedData.filter(
        (item) =>
          item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requestingDepartment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.rtoName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.rtoOfficeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.id?.toString().includes(searchTerm) ||
          item.eventId?.toString().includes(searchTerm)
      );
    }


    if (statusFilter !== "all") {
      combinedData = combinedData.filter((item) => {
        if (statusFilter === "pending") return item.totalBilled === 0;
        if (statusFilter === "partial") return item.totalBilled > 0 && item.totalBilled < (item.totalCost);
        if (statusFilter === "full") return item.remainingAmount <= 0;
        return true;
      });
    }

    setFilteredData(combinedData);
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Pagination handlers
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

  // Generate page numbers for pagination
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

  const handleCreateBill = async (billData) => {
    try {
      await billSanctionAPI.create(billData);
      alert("Bill created successfully!");
      fetchData();
    } catch (error) {
      throw error;
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      const remarks = prompt("Enter payment remarks (optional):");
      await billSanctionAPI.markAsPaid(billId, remarks);
      alert("Bill marked as paid successfully!");
      fetchData();
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      alert("Failed to mark bill as paid. Please try again.");
    }
  };

  const openBillModal = (utilization) => {
    setSelectedUtilization(utilization);
    setIsModalOpen(true);
  };

  const closeBillModal = () => {
    setIsModalOpen(false);
    setSelectedUtilization(null);
  };

  const openBillsViewer = (utilization) => {
    setSelectedUtilization(utilization);
    setSelectedBills(utilization.bills);
    setIsBillsModalOpen(true);
  };

  const closeBillsViewer = () => {
    setIsBillsModalOpen(false);
    setSelectedUtilization(null);
    setSelectedBills([]);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'CREATED': 'bg-yellow-100 text-yellow-800',
      'COLLECTOR_APPROVED': 'bg-blue-100 text-blue-800',
      'COMMISSIONER_APPROVED': 'bg-green-100 text-green-800',
      'PAID': 'bg-purple-100 text-purple-800'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  const getBillTypeLabel = (type) => {
    switch (type) {
      case 'ADVANCE':
        return 'Advance Payment';
      case 'FINAL':
        return 'Final Payment';
      case 'PARTIAL_PAID':
        return 'Commissioner Paid partially to the final amount';
      case 'PARTIAL_PAYMENT_ADVANCE':
        return 'Advance Payment Partially paid';
      default:
        return type;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
              <h2 className="text-base opacity-90">Commerce & Transport   Department</h2>
            </div>
          </div>
          <div className="text-center border-t border-blue-700 pt-3">
            <h3 className="text-lg font-semibold tracking-wide">COMMISSIONER - BILL SANCTION</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-3">
        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by event name, RTO name, ID, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full hover:cursor-pointer p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">No Bills Created</option>
                <option value="partial">Partially Billed</option>
                <option value="full">Fully Billed</option>
              </select>
            </div>
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              Found {filteredData.length} utilization{filteredData.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
              Commissioner Approved Utilizations
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="flex py-8 h-80 p-4 ">
              {/* <div className="flex flex-col ">
              <File className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500  font-bold text-sm">
                {searchTerm || statusFilter !== "all"
                  ? "No utilizations match your search criteria"
                  : "No utilizations found"}
              </p>
              </div> */}
              <div className="bg-white  w-full h-full   rounded-xl p-12 text-center ">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600 text-lg">No pending Events present to Sanction Bills at this time.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new submissions.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">Event Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">RTO</th>
                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider">Financial Summary</th>
                    <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">Bills</th>

                  <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">Remark</th>
                       <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1 capitalize">{item.eventName}</div>

                          <div className="text-xs text-gray-400 mt-1">ID: {item.eventId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <div>
                            <span className="font-semibold text-sm  text-gray-900 block">{item.rtoOfficeName}</span>
                            {/* <span className="text-xs text-gray-500">{item.rtoName}</span> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Cost:</span>
                            <span className="font-bold text-gray-900">₹{item?.totalCost?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs">Total Amount Sanctioned:</span>
                            <span className="font-bold text-green-600">₹{item?.totalBilled?.toLocaleString('en-IN')}</span>
                          </div>
                          {item.totalAdvanceRequested > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-xs">Advance Req:</span>
                              <span className="font-bold text-blue-600">₹{item?.totalAdvanceRequested?.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs font-semibold">Advance Amount Sanctioned:</span>
                            <span className="font-bold text-emerald-600">₹{item?.totalAdvanceSanctioned?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                          <Receipt className="w-3 h-3" />
                          {item.bills.length}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center  border-gray-200">
                        {item?.totalCost === item?.totalBilled ? (
                          <span className="inline-flex  items-center bg-green-100 text-green-800 px-1 py-1 rounded text-xs font-bold border border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            FULLY SANCTIONED
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-1 py-1 rounded text-[10px] font-bold border border-yellow-300">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            PARTIALLY SANCTIONED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openBillsViewer(item)}
                            className="p-3 hover:cursor-pointer text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="View Bills"
                          >
                            <Eye className="w-5 h-5  hover:cursor-pointer" />
                          </button>
                          {item?.remainingAmount > 0 && item?.canSanctionFinal && (
                            <button
                              onClick={() => openBillModal(item)}
                              className="p-3 text-emerald-600  bg-blue-600 gap-1 flex items-center justify-center hover:bg-emerald-800 hover:cursor-pointer rounded-xl transition-all shadow-sm hover:shadow-md"
                              title="Create Final Bill"
                            ><IndianRupee className="h-4 w-4 text-white" /><span className="text-xs text-gray-50 font-bold">Sanction Amount</span>
                            </button>
                          )}
                          {item?.remainingAmount > 0 && !item?.canSanctionFinal && (
                            <div className="p-3 text-emerald-600 bg-blue-600 gap-1 flex items-center justify-center hover:bg-emerald-800  rounded-xl transition-all shadow-sm hover:shadow-md cursor-not-allowed" title="Complete advance payments first">
                              <IndianRupee className="h-4 w-4 text-gray-300" /> <span className="text-xs text-gray-300">Sanction Amount</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Section */}
          {filteredData.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} utilizations
                </div>

                {/* Pagination Controls */}
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

      <SanctionModal
        isOpen={isModalOpen}
        onClose={closeBillModal}
        utilization={selectedUtilization}
        onSanction={handleCreateBill}
        userRole={userRole}
      />

      {/* Bills Viewer Modal */}
      {isBillsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-blue-600" />
                  Bills for {selectedUtilization?.eventName}
                </h2>
                <button
                  onClick={closeBillsViewer}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Financial Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-3">Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Total Cost:</span>
                    <p className="text-gray-800 font-bold">₹{selectedUtilization?.totalCost?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Advance Requested:</span>
                    <p className="text-blue-600 font-bold">₹{selectedUtilization?.totalAdvanceRequested?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Sanctioned:</span>
                    <p className="text-green-600 font-bold">₹{selectedUtilization?.totalBilled?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Sanctioned(For Advance):</span>
                    <p className="text-green-600 font-bold">₹{selectedUtilization?.totalAdvanceSanctioned?.toLocaleString('en-IN')}</p>
                  </div>
                  {/* <div>
                    <span className="font-medium text-gray-600">Remaining:</span>
                    <p className="text-purple-600 font-bold">₹{selectedUtilization?.remainingAmount?.toLocaleString('en-IN')}</p>
                  </div> */}
                </div>
              </div>

              {/* Bills List */}
              {selectedBills.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No bills created for this utilization yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedBills.map((bill, index) => (
                    <div
                      key={bill.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            Bill #{index + 1}
                            <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(bill?.status)}`}>
                              {bill?.status}
                            </span>
                          </h4>
                          <p className="text-xs text-gray-800 font-bold mt-1">Type: {getBillTypeLabel(bill?.type)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ₹{bill?.amount?.toLocaleString('en-IN')}
                          </p>
                          {bill.advancePaymentRequestId && (
                            <p className="text-xs text-blue-600 capitalize border-[1px] border-blue-600 rounded-4xl bg-blue-50 p-1">
                              Payment Regarding advance payment
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Created For:</span>
                          <p className="text-gray-800">{bill?.cretedByRto}</p>
                        </div>

                        {bill?.collectorApprovedByName && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Collector Approved By:</span>
                              <p className="text-gray-800">{bill?.collectorApprovedByName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Collector Approval Date:</span>
                              <p className="text-gray-800">
                                {new Date(bill?.collectorApprovalDate).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </>
                        )}

                        {bill?.commissionerApprovedByName && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Commissioner Approved By:</span>
                              <p className="text-gray-800">{bill?.commissionerApprovedByName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Commissioner Approval Date:</span>
                              <p className="text-gray-800">
                                {new Date(bill?.commissionerApprovalDate).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </>
                        )}

                        {bill.advancePaymentDate && (
                          <div>
                            <span className="font-medium text-gray-600">Payment Date:</span>
                            <p className="text-gray-800">
                              {new Date(bill?.advancePaymentDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        )}
                      </div>

                      {bill.remarks && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-600 text-sm">Remarks:</span>
                          <p className="text-gray-800 text-sm mt-1">{bill?.remarks}</p>
                        </div>
                      )}

                      {bill.status === 'COMMISSIONER_APPROVED' && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                          <button
                            onClick={() => handleMarkAsPaid(bill?.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeBillsViewer}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
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

export default BillSanction;

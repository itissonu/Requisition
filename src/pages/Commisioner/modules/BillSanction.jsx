import React, { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, IndianRupee, FileText, Calendar, Plus, Wallet, CreditCard, Building2, Receipt, DollarSign } from "lucide-react";
import { billSanctionAPI, utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

const SanctionModal = ({ isOpen, onClose, utilization, onSanction, userRole }) => {
  const [sanctionAmount, setSanctionAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (utilization) {
      setSanctionAmount(0);
      setRemarks("");
      setBillNumber("");
    }
  }, [utilization]);

  const handleSubmit = async () => {
    if (sanctionAmount <= 0) {
      alert("Please enter a valid sanction amount");
      return;
    }

    setLoading(true);
    try {
      const billData = {
        eventUtilizationId: utilization.id,
        type: 'FINAL',
        amount: sanctionAmount,
        billNumber: billNumber,
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

        <div className="p-6">
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
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-white" />
                      <span className="text-xs font-semibold text-emerald-100 uppercase">Total Amount</span>
                    </div>
                    <p className="text-white text-2xl font-bold">₹{utilization.totalCost?.toLocaleString('en-IN')}</p>
                  </div>
                  <IndianRupee className="w-12 h-12 text-white/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3  items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
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
                max={utilization.totalCost}
                value={sanctionAmount}
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold transition-all"
                placeholder="Enter bill amount"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className=" text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
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
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);
  const [selectedBills, setSelectedBills] = useState([]);
  const [userRole, setUserRole] = useState('COMMISSIONER');

  useEffect(() => {
    fetchData();
    getUserRole();
  }, []);

  useEffect(() => {
    filterData();
  }, [utilizations, bills, searchTerm, statusFilter]);

  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'COMMISSIONER');
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [utilizationsResponse, billsResponse] = await Promise.all([
        utilizationAPI.getCommissionerApproved(),
        billSanctionAPI.list()
      ]);

      console.log("Bills:", billsResponse.data);
      setUtilizations(utilizationsResponse.data);
      setBills(billsResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    const billsByUtilization = bills.reduce((acc, bill) => {
      if (!acc[bill.eventUtilizationId]) {
        acc[bill.eventUtilizationId] = [];
      }
      acc[bill.eventUtilizationId].push(bill);
      return acc;
    }, {});

    let combinedData = utilizations.map(util => {
      const utilizationBills = billsByUtilization[util.id] || [];
      const totalBilled = utilizationBills.reduce((sum, bill) => sum + bill.amount, 0);
      const remainingAmount = util.totalCost - totalBilled;

      return {
        ...util,
        bills: utilizationBills,
        totalBilled,
        remainingAmount
      };
    });

    if (searchTerm) {
      combinedData = combinedData.filter(
        (item) =>
          item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.requestingDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      combinedData = combinedData.filter((item) => {
        if (statusFilter === "pending") return item.totalBilled === 0;
        if (statusFilter === "partial") return item.totalBilled > 0 && item.totalBilled < item.totalCost;
        if (statusFilter === "full") return item.totalBilled >= item.totalCost;
        return true;
      });
    }

    setFilteredData(combinedData);
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

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
              <h2 className="text-base opacity-90">Commerce & Transport (Transport) Department</h2>
            </div>
          </div>
          <div className="text-center border-t border-blue-700 pt-3">
            <h3 className="text-lg font-semibold tracking-wide">BILL SANCTION MANAGEMENT</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by event name or department..."
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">No Bills Created</option>
                <option value="partial">Partially Billed</option>
                <option value="full">Fully Billed</option>
              </select>
            </div>
          </div>
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
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No utilizations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Event Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">Total Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">Sanctioned</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">Remaining</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Bills</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredData.map((item, index) => (
                    <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-bold text-gray-900 mb-1">{item.eventName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{item.requestingDepartment}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-gray-900 text-lg">
                        ₹{item.totalCost?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-emerald-600 text-lg">
                        ₹{item.totalBilled.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-blue-600 text-lg">
                        ₹{item.remainingAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-md">
                          <Receipt className="w-3 h-3" />
                          {item.bills.length}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openBillsViewer(item)}
                            className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="View Bills"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {item.remainingAmount > 0 && (
                            <button
                              onClick={() => openBillModal(item)}
                              className="p-3 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all shadow-sm hover:shadow-md"
                              title="Create Bill"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              {/* Utilization Summary */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-3">Utilization Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Department:</span>
                    <p className="text-gray-800">{selectedUtilization?.requestingDepartment}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Amount:</span>
                    <p className="text-gray-800 font-bold">₹{selectedUtilization?.totalCost?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total Billed:</span>
                    <p className="text-green-600 font-bold">₹{selectedUtilization?.totalBilled?.toLocaleString('en-IN')}</p>
                  </div>
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
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ₹{bill.amount?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Created By:</span>
                          <p className="text-gray-800">{bill.cretedByRto}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Created Date:</span>
                          <p className="text-gray-800">
                            {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>

                        {bill.collectorApprovedByName && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Collector Approved By:</span>
                              <p className="text-gray-800">{bill.collectorApprovedByName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Collector Approval Date:</span>
                              <p className="text-gray-800">
                                {new Date(bill.collectorApprovalDate).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </>
                        )}

                        {bill.commissionerApprovedByName && (
                          <>
                            <div>
                              <span className="font-medium text-gray-600">Commissioner Approved By:</span>
                              <p className="text-gray-800">{bill.commissionerApprovedByName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Commissioner Approval Date:</span>
                              <p className="text-gray-800">
                                {new Date(bill.commissionerApprovalDate).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          </>
                        )}

                        {bill.advancePaymentDate && (
                          <div>
                            <span className="font-medium text-gray-600">Payment Date:</span>
                            <p className="text-gray-800">
                              {new Date(bill.advancePaymentDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        )}
                      </div>

                      {bill.remarks && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="font-medium text-gray-600 text-sm">Remarks:</span>
                          <p className="text-gray-800 text-sm mt-1">{bill.remarks}</p>
                        </div>
                      )}

                      {bill.status === 'COMMISSIONER_APPROVED' && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end">
                          <button
                            onClick={() => handleMarkAsPaid(bill.id)}
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
    </div>
  );
};

export default BillSanction;
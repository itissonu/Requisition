import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, IndianRupee, Calendar, MapPin, Car, Info, Search, FileText, DollarSign } from "lucide-react";
import { advancePaymentAPI, billSanctionAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

// Main Component
const CollectorAdvancePayments = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBillSanctionsModalOpen, setIsBillSanctionsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, billsRes] = await Promise.all([
        advancePaymentAPI.list(),
        billSanctionAPI.list(),
      ]);

      const requests = requestsRes.data;
      const bills = billsRes.data;
      const processedRequests = requests.map(request => {
        const requestBills = bills.filter(bill => bill?.advancePaymentRequestId === request?.id);
        const paidAmount = requestBills.reduce((sum, bill) => sum + bill.amount, 0);
        return {
          ...request,
          bills: requestBills,
          paidAmount,
        };
      });

      setPendingRequests(processedRequests.filter(req => req.status === "PENDING"));
      setApprovedRequests(processedRequests.filter(req => req.status === "APPROVED"));

    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Failed to load advance payment requests");
    } finally {
      setLoading(false);
    }
  };

  // Filter requests based on search term
  const filterRequests = (requests) => {
    if (!searchTerm) return requests;
    
    return requests.filter(request =>
      request.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toString().includes(searchTerm) ||
      request.eventId.toString().includes(searchTerm)
    );
  };

  const filteredPendingRequests = filterRequests(pendingRequests);
  const filteredApprovedRequests = filterRequests(approvedRequests);

  // --- Modal Handlers ---
  const openActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setRemarks("");
    setIsActionModalOpen(true);
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const openBillSanctionsModal = (request) => {
    setSelectedRequest(request);
    setIsBillSanctionsModalOpen(true);
  };

  const closeModal = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
    setIsBillSanctionsModalOpen(false);
    setSelectedRequest(null);
    setActionLoading(false);
  };

  const handleConfirmAction = async () => {
    if (!remarks.trim() && actionType === 'reject') {
      alert("Rejection reason is mandatory.");
      return;
    }

    setActionLoading(true);
    try {
      if (actionType === 'approve') {
        await advancePaymentAPI.approve(selectedRequest.id, remarks || "Approved by Collector");
        alert("Request approved and forwarded to commissioner for review!");
      } else {
        await advancePaymentAPI.reject(selectedRequest.id, remarks);
        alert("Request rejected successfully!");
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error(`Failed to ${actionType} request:`, error);
      alert(`Failed to ${actionType} request.`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- Table Renderers ---
  const renderPendingTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">REQUEST ID</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Request Details</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Request Date</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredPendingRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-xs text-gray-900 mt-1">{request.id}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{request.eventName}</div>
                <div className="text-sm text-gray-500">{request.rtoOfficeName}</div>
                <div className="text-xs text-gray-400">Event ID: {request.eventId}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-lg font-bold text-green-600">
                  ₹{request.requestedAmount.toLocaleString('en-IN')}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {new Date(request.createdAt).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center space-x-2">
                  <button onClick={() => openDetailModal(request)} className="p-2 hover:cursor-pointer text-blue-500 hover:text-blue-600" title="View Details"><Eye className="w-5 h-5" /></button>
                  <button onClick={() => openActionModal(request, 'approve')} className="p-2 hover:cursor-pointer text-green-500 hover:text-green-600" title="Approve"><CheckCircle className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredPendingRequests.length === 0 && !loading && (
        <EmptyState 
          Icon={Clock} 
          message={searchTerm ? "No pending requests match your search" : "No pending requests found"} 
        />
      )}
    </div>
  );

  const renderApprovedTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Request Details</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount Details</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredApprovedRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{request.eventName}</div>
                <div className="text-sm text-gray-500">{request.requestingDepartment}</div>
                <div className="text-xs text-gray-400">Event ID: {request.eventId}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-800">
                  Req: ₹{request.requestedAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-green-600">
                  Sanctioned: ₹{request.paidAmount.toLocaleString('en-IN')}
                </div>
                {request.billSanctions && request.billSanctions.length > 0 && (
                  <button
                    onClick={() => openBillSanctionsModal(request)}
                    className="mt-1 text-xs text-blue-600 hover:cursor-pointer hover:text-blue-800 flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    View {request.billSanctions.length} Bill{request.billSanctions.length > 1 ? 's' : ''}
                  </button>
                )}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <button
                  onClick={() => openDetailModal(request)}
                  className="inline-flex items-center gap-2 hover:cursor-pointer px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredApprovedRequests.length === 0 && !loading && (
        <EmptyState 
          Icon={CheckCircle} 
          message={searchTerm ? "No approved requests match your search" : "No approved requests found"} 
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Advance Payments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-700 w-full max-w-lg">
              <h3 className="text-lg font-semibold tracking-wider">COLLECTOR - ADVANCE PAYMENT MANAGEMENT</h3>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6 px-6 ">
                <TabButton
                  label="Pending Approval"
                  count={pendingRequests.length}
                  isActive={activeTab === 'pending'}
                  onClick={() => setActiveTab('pending')}
                  Icon={Clock}
                />
                <TabButton
                  label="Approved Requests"
                  count={approvedRequests.length}
                  isActive={activeTab === 'approved'}
                  onClick={() => setActiveTab('approved')}
                  Icon={CheckCircle}
                />
              </nav>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by event ID or event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-600 mt-2">
                  Found {activeTab === 'pending' ? filteredPendingRequests.length : filteredApprovedRequests.length} request{(activeTab === 'pending' ? filteredPendingRequests.length : filteredApprovedRequests.length) !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {activeTab === "pending" ? renderPendingTable() : renderApprovedTable()}
          </div>
        </div>
      </div>

      {isActionModalOpen && <ActionModal request={selectedRequest} actionType={actionType} remarks={remarks} setRemarks={setRemarks} onClose={closeModal} onConfirm={handleConfirmAction} loading={actionLoading} />}
      {isDetailModalOpen && <DetailModal request={selectedRequest} onClose={closeModal} />}
      {isBillSanctionsModalOpen && <BillSanctionsModal request={selectedRequest} onClose={closeModal} />}
    </>
  );
};

// --- Sub-Components ---

const TabButton = ({ label, count, isActive, onClick, Icon }) => (
  <button
    onClick={onClick}
    className={`flex  hover:cursor-pointer items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${isActive
      ? "border-blue-600 text-blue-600"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
      {count}
    </span>
  </button>
);

const BillSanctionsModal = ({ request, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
      <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 border-b border-gray-200 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-7 h-7" />
              Bill Sanctions
            </h3>
            <p className="text-sm text-gray-100 mt-1">{request.eventName} - {request.billSanctions?.length || 0} Sanction{request.billSanctions?.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="text-white hover:cursor-pointer hover:text-gray-200">
            <XCircle className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="p-6 overflow-y-auto">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600">Total Requested</p>
            <p className="text-2xl font-bold text-blue-600">₹{request.requestedAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600">Total Sanctioned</p>
            <p className="text-2xl font-bold text-green-600">₹{request.paidAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600">Sanctions Count</p>
            <p className="text-2xl font-bold text-purple-600">{request.billSanctions?.length || 0}</p>
          </div>
        </div>

        {request.billSanctions && request.billSanctions.length > 0 ? (
          <div className="space-y-4">
            {request.billSanctions.map((bill, index) => (
              <div key={bill.id} className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Bill Sanction #{bill.id}</h4>
                      <p className="text-sm text-gray-600">{bill.type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">₹{bill.amount.toLocaleString('en-IN')}</p>
                    <StatusBadge status={bill.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Request Date</p>
                    <p className="text-sm text-gray-900">{new Date(bill.requestDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Created By</p>
                    <p className="text-sm text-gray-900">{bill.createdByName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Created At</p>
                    <p className="text-sm text-gray-900">{new Date(bill.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {bill.remarks && (
                  <div className="bg-white border border-gray-200 rounded p-3 mt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-1">Remarks</p>
                    <p className="text-sm text-gray-700">{bill.remarks}</p>
                  </div>
                )}

                {(bill.collectorApprovedByName || bill.commissionerApprovedByName) && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-500 font-semibold mb-2">Approval Details</p>
                    <div className="grid grid-cols-2 gap-3">
                      {bill.collectorApprovedByName && (
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Collector</p>
                          <p className="text-sm font-medium text-gray-900">{bill.collectorApprovedByName}</p>
                          {bill.collectorApprovalDate && (
                            <p className="text-xs text-gray-500">{new Date(bill.collectorApprovalDate).toLocaleDateString('en-IN')}</p>
                          )}
                        </div>
                      )}
                      {bill.commissionerApprovedByName && (
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Commissioner</p>
                          <p className="text-sm font-medium text-gray-900">{bill.commissionerApprovedByName}</p>
                          {bill.commissionerApprovalDate && (
                            <p className="text-xs text-gray-500">{new Date(bill.commissionerApprovalDate).toLocaleDateString('en-IN')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bill sanctions found for this request</p>
          </div>
        )}
      </div>

      <div className="p-4 hover:cursor-pointer bg-gray-50 border-t border-gray-200 text-right rounded-b-xl">
        <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          Close
        </button>
      </div>
    </div>
  </div>
);

const ActionModal = ({ request, actionType, remarks, setRemarks, onClose, onConfirm, loading }) => {
  const isApprove = actionType === 'approve';
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden transform transition-all">
        <div className={`p-6 ${isApprove ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-red-600 to-red-700"}`}>
          <div className="flex items-center gap-3">
            {isApprove ? <CheckCircle className="w-8 h-8 text-white" /> : <XCircle className="w-8 h-8 text-white" />}
            <h4 className="text-2xl font-bold text-white">{isApprove ? "Approve Request" : "Reject Request"}</h4>
          </div>
          <p className="text-white text-sm mt-2 opacity-90">{request.eventName} </p>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks {isApprove ? '(Optional)' : '*'}</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={isApprove ? "Enter optional comments..." : "Enter mandatory rejection reason..."} className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500" rows={4} />
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} disabled={loading} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={loading || (!remarks.trim() && !isApprove)} className={`flex-1 ${isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white py-3 rounded-lg font-semibold hover:cursor-pointer disabled:opacity-50 shadow-md`}>
              {loading ? "Processing..." : (isApprove ? "Confirm Approval" : "Confirm Rejection")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailModal = ({ request, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
      <div className="p-6 bg-blue-600 border-b border-gray-200 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-white">{request.eventName}</h3>
            <p className="text-sm text-gray-50">{request.requestingDepartment}</p>
          </div>
          <button onClick={onClose} className="text-white hover:cursor-pointer hover:text-gray-200"><XCircle className="w-7 h-7" /></button>
        </div>
      </div>
      <div className="p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-sm text-gray-500">Amount Requested</p><p className="font-bold text-xl text-green-600">₹{request.requestedAmount.toLocaleString('en-IN')}</p></div>
          <div><p className="text-sm text-gray-500">Request Date</p><p className="font-bold text-lg text-gray-700">{new Date(request.createdAt).toLocaleDateString('en-IN')}</p></div>
          <div><p className="text-sm text-gray-500">Status</p><StatusBadge status={request.status} /></div>
        </div>
        {request.remarks && (<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg"><h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Info className="w-5 h-5 text-blue-500" /> Request Remarks</h4><p className="text-sm text-gray-600">{request.remarks}</p></div>)}
        <div>
          <h4 className="font-semibold text-gray-800 text-lg mb-3">Sub-Event Details</h4>
          <div className="space-y-4">
            {request.subEvents?.length > 0 ? (
              request.subEvents.map((sub, index) => (
                <div key={index} className="border border-gray-200 rounded-lg bg-white shadow p-6">
                  <div className="flex items-center mb-4">
                    <p className="text-lg font-bold text-gray-800">Sub-Event {index + 1}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-semibold">Place</p>
                        <p>{sub.place}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-semibold">Date</p>
                        <p>{new Date(sub.reportingDate).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-600 mb-2 flex items-center">
                      <Car className="w-5 h-5 text-gray-500 mr-2" />
                      Vehicles
                    </h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-700 border-[1px] border-gray-100 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 font-medium">Vehicle Name</th>
                            <th className="px-4 py-2 font-medium text-right">Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.vehicles.map((v) => (
                            <tr key={v.vehicleId}>
                              <td className="px-4 py-2">{v.vehicleName}</td>
                              <td className="px-4 py-2 text-right">{v.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))
            ) : (<p className="text-sm text-gray-500">No sub-event details provided.</p>)}
          </div>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-right rounded-b-xl"><button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Close</button></div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
    APPROVED: { bg: "bg-green-100", text: "text-green-800" },
    REJECTED: { bg: "bg-red-100", text: "text-red-800" },
    PAID: { bg: "bg-blue-100", text: "text-blue-800" },
    CREATED: { bg: "bg-gray-100", text: "text-gray-800" }
  }[status] || { bg: "bg-gray-100", text: "text-gray-800" };
  return (<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>{status}</span>);
};

const EmptyState = ({ Icon, message }) => (
  <div className="text-center py-16 px-6">
    <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500 text-lg">{message}</p>
  </div>
);

export default CollectorAdvancePayments;
 
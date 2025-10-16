import React, { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, IndianRupee, Calendar, MapPin, Car, Info } from "lucide-react";
import { advancePaymentAPI, billSanctionAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

// Main Component
const CollectorAdvancePayments = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
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

      console.log("Fetched Requests:", requests);
      console.log("Fetched Bills:", bills);

      const processedRequests = requests.map(request => {
        const requestBills = bills.filter(bill => bill?.advancePaymentRequestId === request?.id);
        const paidAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
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

  const closeModal = () => {
    setIsActionModalOpen(false);
    setIsDetailModalOpen(false);
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
        alert("Request approved successfully!");
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
          {pendingRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">

                <div className="text-xs text-gray-900 mt-1">{request.id}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{request.eventName}</div>
                <div className="text-sm text-gray-500">{request.rtoOfficeName}</div>
                
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
                  <button onClick={() => openDetailModal(request)} className="p-2 text-blue-500 hover:text-blue-600" title="View Details"><Eye className="w-5 h-5" /></button>
                  {/* <button onClick={() => openActionModal(request, 'reject')} className="p-2 text-gray-500 hover:text-red-600" title="Reject"><XCircle className="w-5 h-5" /></button> */}
                  <button onClick={() => openActionModal(request, 'approve')} className="p-2 text-green-500 hover:text-green-600" title="Approve"><CheckCircle className="w-5 h-5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {pendingRequests.length === 0 && !loading && <EmptyState Icon={Clock} message="No pending requests found" />}
    </div>
  );

  const renderApprovedTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-blue-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Request Details</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Amount Details</th>
            {/* <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Approval Date</th> */}
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {approvedRequests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="font-semibold text-gray-900">{request.eventName}</div>
                <div className="text-sm text-gray-500">{request.requestingDepartment}</div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-gray-800">
                  Req: ₹{request.requestedAmount.toLocaleString('en-IN')}
                </div>
                <div className="text-sm text-green-600">
                  Paid: ₹{request.paidAmount.toLocaleString('en-IN')}
                </div>
              </td>
              {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                {request.approvedAt ? new Date(request.approvedAt).toLocaleDateString('en-IN') : 'N/A'}
              </td> */}
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-center">
                <button
                  onClick={() => openDetailModal(request)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
      {approvedRequests.length === 0 && !loading && <EmptyState Icon={CheckCircle} message="No approved requests found" />}
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
              <nav className="-mb-px flex space-x-6 px-6">
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
            {activeTab === "pending" ? renderPendingTable() : renderApprovedTable()}
          </div>
        </div>
      </div>

      {isActionModalOpen && <ActionModal request={selectedRequest} actionType={actionType} remarks={remarks} setRemarks={setRemarks} onClose={closeModal} onConfirm={handleConfirmAction} loading={actionLoading} />}
      {isDetailModalOpen && <DetailModal request={selectedRequest} onClose={closeModal} />}
    </>
  );
};

// --- Sub-Components (Unchanged) ---

const TabButton = ({ label, count, isActive, onClick, Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${isActive
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
            <button onClick={onConfirm} disabled={loading || (!remarks.trim() && !isApprove)} className={`flex-1 ${isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white py-3 rounded-lg font-semibold disabled:opacity-50 shadow-md`}>
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="w-7 h-7" /></button>
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
                    {/* <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <div>
                        <p className="font-semibold">Start Time</p>
                        <p>{sub.startTime}</p>
                      </div>
                    </div> */}
                    {sub.endTime && (
                      <div className="flex items-center text-sm text-gray-700">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-semibold">End Time</p>
                          <p>{sub.endTime}</p>
                        </div>
                      </div>
                    )}
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
                            <tr key={v.vehicleId} className=" ">
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
    PAID: { bg: "bg-blue-100", text: "text-blue-800" }
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
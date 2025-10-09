import React, { useState, useEffect } from "react";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Car, 
  Calendar,
  User,
  MessageSquare,
  Download
} from "lucide-react";
import { eventAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function ApproveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await eventAPI.list();
       
        const pendingRequests = response.data.filter(event => event.status === "CREATED");
        setRequests(pendingRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        alert('Failed to load requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleViewPdf = async (request) => {
    try {
      const pdfUrl = `http://localhost:8091/Requisition/api/events/${request.id}/pdf/view`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open document. Please try again.');
    }
  };

  const handleDownloadPdf = async (request) => {
    try {
      const response = await eventAPI.downloadPdf(request.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${request.name.replace(/[^a-z0-9]/gi, '_')}_Request.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleApprovalAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (selectedRequest && approvalComments.trim()) {
      setActionLoading(true);
      try {
        const newStatus = actionType === "approve" ? "COLLECTOR_APPROVED" : "REJECTED";
        const updateData = {
          status: newStatus,
          approvalComments: approvalComments.trim()
        };
        await eventAPI.update(selectedRequest.id, updateData);
        setRequests(requests.filter(req => req.id !== selectedRequest.id));
        
        alert(`Request ${actionType}d successfully! ${actionType === "approve" ? "It is now available for RTO utilization." : ""}`);
        setShowModal(false);
        setApprovalComments("");
        setSelectedRequest(null);
      } catch (error) {
        console.error(`Error ${actionType}ing request:`, error);
        alert(`Failed to ${actionType} request. Please try again.`);
      } finally {
        setActionLoading(false);
      }
    } else {
      alert("Please enter comments before proceeding.");
    }
  };

  const getPriorityColor = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 2) return "bg-red-100 text-red-800"; 
    if (daysDiff > 1) return "bg-orange-100 text-orange-800"; 
    return "bg-yellow-100 text-yellow-800"; 
  };

  const getPriorityLabel = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 2) return "URGENT";
    if (daysDiff > 1) return "HIGH"; 
    return "MEDIUM";
  };

  const filteredRequests = requests.filter(req => req.status === "CREATED");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                <img
                                 src={logo}
                                 alt="Odisha Logo"
                                 className="w-14 h-14 object-contain"
                               />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">COLLECTOR APPROVAL SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Table View */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center shadow-lg">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 text-lg">No pending requests to approve at this time.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new submissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Event ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Event Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Duration</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Priority</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Vehicles</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Document</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request, index) => {
                    const totalVehicles = request.vehicles?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;
                    
                    return (
                      <tr 
                        key={request.id} 
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-blue-600">EV{String(request.id).padStart(3, '0')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900">{request.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{request.requestingDepartmentName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-xs text-gray-600">
                            <div>{request.dateOfReporting}</div>
                            <div className="text-gray-400">to</div>
                            <div>{request.dateOfRelease}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(request.createdAt)}`}>
                            {getPriorityLabel(request.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Car className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">{totalVehicles}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewPdf(request)}
                              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              title="View PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPdf(request)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(request, "reject")}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Reject"
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(request, "approve")}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Approve"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer */}
            <div className="bg-gray-100 px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold text-gray-900">{filteredRequests.length}</span> request{filteredRequests.length !== 1 ? 's' : ''} pending approval
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Request Details</h3>
                  <p className="text-blue-100 mt-1">EV{String(selectedRequest.id).padStart(3, '0')} - {selectedRequest.name}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2">Event Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Event Name</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.requestingDepartment}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.dateOfReporting}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.dateOfRelease}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Requirements */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-green-600 pb-2">Vehicle Requirements</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-gray-300">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="p-3 border text-left">S.No</th>
                        <th className="p-3 border text-left">Vehicle Type</th>
                        <th className="p-3 border text-center">Quantity Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRequest.vehicles?.map((vehicle, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 border font-medium">{index + 1}</td>
                          <td className="p-3 border">{vehicle.vehicleName}</td>
                          <td className="p-3 border text-center font-semibold text-blue-600">{vehicle.quantity}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-100 border-t-4 border-blue-600">
                        <td colSpan="2" className="p-4 text-right font-bold text-lg">TOTAL VEHICLES:</td>
                        <td className="p-4 text-center font-bold text-xl text-blue-600">
                          {selectedRequest.vehicles?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-b-xl flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className={`p-6 ${actionType === "approve" ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-red-600 to-red-700"}`}>
              <div className="flex items-center gap-3">
                {actionType === "approve" ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <XCircle className="w-8 h-8 text-white" />
                )}
                <h4 className="text-2xl font-bold text-white">
                  {actionType === "approve" ? "Approve" : "Reject"} Request
                </h4>
              </div>
              <p className="text-white text-sm mt-2 opacity-90">
                {selectedRequest.name} - EV{String(selectedRequest.id).padStart(3, '0')}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comments / Remarks *
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                placeholder="Enter your comments or reasons here..."
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {actionType === "approve" 
                  ? "Provide approval comments for record keeping" 
                  : "Explain the reason for rejection"}
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); setApprovalComments(""); }}
                  disabled={actionLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  disabled={actionLoading || !approvalComments.trim()}
                  className={`flex-1 ${actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                >
                  {actionLoading ? "Processing..." : (actionType === "approve" ? "✓ Approve" : "✗ Reject")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Collector Approval System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: collector@odisha.gov.in</p>
      </div>
    </div>
  );
}
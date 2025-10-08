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
        setRequests(requests.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: newStatus, 
                approvalComments: approvalComments.trim(), 
                approvedAt: new Date().toISOString() 
              }
            : req
        ));
        
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
    
    if (daysDiff > 2) return "bg-red-100 text-red-800 border-red-200"; 
    if (daysDiff > 1) return "bg-orange-100 text-orange-800 border-orange-200"; 
    return "bg-yellow-100 text-yellow-800 border-yellow-200"; 
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
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Government Header */}
      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-center">GOVERNMENT OF ODISHA</h1>
          <h2 className="text-lg text-center opacity-90">Commerce & Transport (Transport) Department</h2>
          <h3 className="text-md text-center font-semibold mt-2 border-t border-blue-700 pt-3">
            COLLECTOR APPROVAL SYSTEM
          </h3>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-blue-100 border-b border-blue-200 p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-blue-900">Pending Approval Requests</h2>
                <p className="text-sm text-blue-700 mt-1">Review and approve vehicle requisition requests</p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-300">
                {filteredRequests.length} Pending
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending requests to approve at this time.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-blue-300">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{request.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(request.createdAt)}`}>
                            {getPriorityLabel(request.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {request.requestingDepartment}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {request.dateOfReporting} to {request.dateOfRelease}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(request.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Event ID</div>
                        <div className="font-mono text-lg font-bold text-blue-900">
                          EV{String(request.id).padStart(3, '0')}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Requirements Preview */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Vehicle Requirements:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {request.vehicles && request.vehicles.slice(0, 3).map((vehicle, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {vehicle.vehicleName}: {vehicle.quantity}
                          </div>
                        ))}
                        {request.vehicles && request.vehicles.length > 3 && (
                          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            +{request.vehicles.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Request Document */}
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewPdf(request)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          View Requisition Letter
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(request)}
                          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 hover:underline"
                        >
                          <Download className="w-4 h-4" />
                          Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Full Details
                      </button>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprovalAction(request, "reject")}
                          className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
                          disabled={actionLoading}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprovalAction(request, "approve")}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                          disabled={actionLoading}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Request Details - EV{String(selectedRequest.id).padStart(3, '0')}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:text-gray-300 p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Event Name:</label>
                    <p className="text-gray-900">{selectedRequest.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Requesting Department:</label>
                    <p className="text-gray-900">{selectedRequest.requestingDepartment}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Duration:</label>
                    <div className="text-gray-900">
                      <div>From: {selectedRequest.dateOfReporting}</div>
                      <div>To: {selectedRequest.dateOfRelease}</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Request Created:</label>
                    <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <label className="font-semibold text-gray-700 block mb-3">Vehicle Requirements:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRequest.vehicles && selectedRequest.vehicles.map((vehicle, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                      <span className="font-medium text-gray-800">{vehicle.vehicleName}</span>
                      <span className="font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded">
                        {vehicle.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              Are you sure you want to {actionType} the request "{selectedRequest?.name}"?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                placeholder={`Enter reason for ${actionType}al...`}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setApprovalComments("");
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading || !approvalComments.trim()}
                className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 ${
                  actionType === "approve" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {actionLoading 
                  ? "Processing..." 
                  : `Confirm ${actionType === "approve" ? "Approval" : "Rejection"}`
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-blue-900 text-white p-4 text-center text-sm mt-8">
        © Government of Odisha - Commerce & Transport Department | Vehicle Requisition System
      </div>
    </div>
  );
}

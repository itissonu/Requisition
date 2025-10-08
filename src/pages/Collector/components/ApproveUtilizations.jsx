import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  User,
  Truck,
  DollarSign,
  MessageSquare,
  Clock
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";

export default function ApproveUtilizations() {
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [actionType, setActionType] = useState(""); // "approve" or "reject"
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUtilizations = async () => {
      try {
     
        const response = await utilizationAPI.getByStatus("UTILIZATION_SUBMITTED");
        setUtilizations(response.data);
      } catch (error) {
        console.error('Error fetching utilizations:', error);
        alert('Failed to load utilizations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUtilizations();
  }, []);

  const handleApprovalAction = (utilization, action) => {
    setSelectedUtilization(utilization);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (selectedUtilization && approvalComments.trim()) {
      setActionLoading(true);
      try {
        if (actionType === "approve") {
       
          const currentUserId = 13; // Replace with actual user ID from auth
          await utilizationAPI.approve(selectedUtilization.id, currentUserId);
        } else {
          await utilizationAPI.reject(selectedUtilization.id, approvalComments.trim());
        }
        
       
        setUtilizations(utilizations.filter(u => u.id !== selectedUtilization.id));
        
        alert(`Utilization ${actionType}d successfully!`);
        setShowModal(false);
        setApprovalComments("");
        setSelectedUtilization(null);
      } catch (error) {
        console.error(`Error ${actionType}ing utilization:`, error);
        alert(`Failed to ${actionType} utilization. Please try again.`);
      } finally {
        setActionLoading(false);
      }
    } else {
      alert("Please enter comments before proceeding.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UTILIZATION_SUBMITTED": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading utilizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-center">GOVERNMENT OF ODISHA</h1>
          <h2 className="text-lg text-center opacity-90">Commerce & Transport (Transport) Department</h2>
          <h3 className="text-md text-center font-semibold mt-2 border-t border-blue-700 pt-3">
            UTILIZATION APPROVAL SYSTEM - COLLECTOR
          </h3>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-orange-100 border-b border-orange-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-orange-900">Pending Utilization Approvals</h2>
                <p className="text-sm text-orange-700 mt-1">Review and approve vehicle utilization submissions</p>
              </div>
              <div className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                {utilizations.length} Pending
              </div>
            </div>
          </div>

          <div className="p-6">
            {utilizations.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending utilizations to approve at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {utilizations.map((utilization) => (
                  <div key={utilization.id} className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-orange-300 bg-gray-50">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{utilization.eventName}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(utilization.utilizationStatus)}`}>
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">ID</div>
                        <div className="font-mono text-sm font-bold text-blue-900">
                          UT{String(utilization.id).padStart(3,'0')}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="w-3 h-3" />
                        <span className="truncate">{utilization.requestingDepartment}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{utilization.dateOfReporting} to {utilization.dateOfRelease}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                       
                        <span className="font-semibold text-green-700">₹{utilization.totalCost?.toLocaleString('en-IN') || '0'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Truck className="w-3 h-3" />
                        <span>{utilization.vehicleUtilizations?.length || 0} Vehicle(s)</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovalAction(utilization, "reject")}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        disabled={actionLoading}
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprovalAction(utilization, "approve")}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        disabled={actionLoading}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 text-center">
              {actionType === "approve" ? "Approve Utilization" : "Reject Utilization"}
            </h3>
            <p className="text-gray-600 mb-4 text-center text-sm">
              Are you sure you want to {actionType} utilization for "{selectedUtilization?.eventName}"?
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
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
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading || !approvalComments.trim()}
                className={`flex-1 py-2 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 ${
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
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        © Government of Odisha - Commerce & Transport Department | Vehicle Utilization System
      </div>
    </div>
  );
}

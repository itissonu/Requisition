import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Truck,
  IndianRupee,
  Eye
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function ApproveUtilizations() {
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  const [actionType, setActionType] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUtilizations = async () => {
      try {
        const response = await utilizationAPI.getByStatus("UTILIZATION_SUBMITTED");
        setUtilizations(response.data);
        console.log('Fetched utilizations:', response.data);
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
      case "UTILIZATION_SUBMITTED": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading utilizations...</p>
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
              <h3 className="text-lg font-semibold tracking-wide">COLLECTOR - UTILIZATION APPROVAL</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="bg-orange-100 border-b border-orange-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-orange-900">Pending Utilization Approvals</h2>
                <p className="text-sm text-orange-700 mt-1">Review and approve vehicle utilization submissions</p>
              </div>
              <div className="bg-orange-600 text-white px-4 py-2 rounded-full font-semibold">
                {utilizations.length} Pending
              </div>
            </div>
          </div>

          <div className="p-6">
            {utilizations.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600 text-lg">No pending utilizations to approve at this time.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new submissions.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Duration</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Vehicles</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Total Cost</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizations.map((utilization, index) => (
                      <tr
                        key={utilization.id}
                        className={`border-b border-gray-200 hover:bg-orange-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-blue-600">UT{String(utilization.id).padStart(3, '0')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{utilization.eventName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{utilization.requestingDepartment}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-xs text-gray-600">
                            <div>{utilization.dateOfReporting}</div>
                            <div className="text-gray-400">to</div>
                            <div>{utilization.dateOfRelease}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(utilization.utilizationStatus)}`}>
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Truck className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">{utilization.vehicleUtilizations?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="w-4 h-4 text-green-600" />
                            <span className="font-bold text-green-700">{utilization.totalCost?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprovalAction(utilization, "reject")}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Reject"
                              disabled={actionLoading}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(utilization, "approve")}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Approve"
                              disabled={actionLoading}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {utilizations.length > 0 && (
              <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 mt-4 rounded-b">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{utilizations.length}</span> utilization{utilizations.length !== 1 ? 's' : ''} pending approval
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selectedUtilization && (
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
                  {actionType === "approve" ? "Approve" : "Reject"} Utilization
                </h4>
              </div>
              <p className="text-white text-sm mt-2 opacity-90">
                {selectedUtilization.eventName} - UT{String(selectedUtilization.id).padStart(3, '0')}
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
        <p>© Government of Odisha – Commerce & Transport Department | Vehicle Utilization System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: collector@odisha.gov.in</p>
      </div>
    </div>
  );
}
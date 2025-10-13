import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Truck,
  AlertCircle,
  X,
  IndianRupee,
  FileText,
  MapPin,
  Clock
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function CommissionerApproveUtilizations() {
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comments, setComments] = useState("");
  const [actionType, setActionType] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await utilizationAPI.getByStatus("PENDING_COMMISSIONER_APPROVAL");
        console.log(res.data);
        setUtilizations(res.data);
      } catch {
        alert("Failed to load utilizations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirmAction = async () => {
    if (!selected || !comments.trim()) return alert("Enter comments.");
    setBusy(true);
    
    try {
      if (actionType === "approve") {
        await utilizationAPI.commissionerApprove(selected?.id, 16, comments.trim());
      } else {
        await utilizationAPI.commissionerReject(selected.id, comments.trim());
      }
      setUtilizations(u => u.filter(x => x.id !== selected.id));
      setShowModal(false);
      setComments("");
      setSelected(null);
      alert(`Utilization ${actionType === "approve" ? "approved" : "rejected"} successfully!`);
    } catch {
      alert("Operation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleViewDetails = (util) => {
    setSelected(util);
    setShowDetailsModal(true);
  };

  // Calculate total vehicles across all sub-events
  const getTotalVehicles = (utilization) => {
    if (!utilization.subEventUtilizations) return 0;
    return utilization.subEventUtilizations.reduce((total, subEvent) => {
      return total + (subEvent.vehicleUtilizations?.reduce((sum, v) => sum + (v.actualQuantity || 0), 0) || 0);
    }, 0);
  };

  // Get total sub-events
  const getTotalSubEvents = (utilization) => {
    return utilization.subEventUtilizations?.length || 0;
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
              <h3 className="text-lg font-semibold tracking-wide">COMMISSIONER - UTILIZATION APPROVAL</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Utilizations Table */}
        {utilizations.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-12 text-center shadow-lg">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600 text-lg">No pending utilizations to approve at this time.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new submissions.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Event Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Collector</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Sub-Events</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Vehicles</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total Cost</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizations.map((u, index) => {
                    const totalVehicles = getTotalVehicles(u);
                    const totalSubEvents = getTotalSubEvents(u);

                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-semibold text-blue-600">UT{String(u.id).padStart(4, '0')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="font-medium text-gray-900">{u.eventName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{u.requestingDepartment}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-sm">
                            <div className="font-semibold text-blue-700">{u.collectorApprovedByName}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                            {totalSubEvents}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Truck className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">{totalVehicles}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IndianRupee className="w-4 h-4 text-orange-600" />
                            <span className="font-bold text-gray-900">{u.totalCost?.toLocaleString('en-IN') || '0'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(u)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelected(u); setActionType("reject"); setShowModal(true); }}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelected(u); setActionType("approve"); setShowModal(true); }}
                              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Approve"
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
                Total: <span className="font-semibold text-gray-900">{utilizations.length}</span> utilization{utilizations.length !== 1 ? 's' : ''} pending approval
              </p>
            </div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {showModal && selected && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-70 flex items-center justify-center p-4 z-50">
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
                  {selected.eventName} - UT{String(selected.id).padStart(4, '0')}
                </p>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments / Remarks *
                </label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
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
                    onClick={() => { setShowModal(false); setComments(""); }}
                    disabled={busy}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={busy || !comments.trim()}
                    className={`flex-1 ${actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
                  >
                    {busy ? "Processing..." : (actionType === "approve" ? "✓ Approve" : "✗ Reject")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-8">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold">Utilization Details</h3>
                    <p className="text-blue-100 mt-1">UT{String(selected.id).padStart(4, '0')} - {selected.eventName}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2">Event Information</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-blue-700 mb-1 font-semibold">Event Name</p>
                      <p className="font-bold text-gray-900">{selected.eventName}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm text-green-700 mb-1 font-semibold">Department</p>
                      <p className="font-bold text-gray-900">{selected.requestingDepartment}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm text-purple-700 mb-1 font-semibold">Approved By</p>
                      <p className="font-bold text-gray-900">{selected.collectorApprovedByName}</p>
                    </div>
                  </div>
                </div>

                {/* Sub-Events Details */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-600 pb-2">
                    Sub-Events Utilization ({selected.subEventUtilizations?.length || 0})
                  </h4>
                  
                  {selected.subEventUtilizations && selected.subEventUtilizations.map((subEvent, subIdx) => {
                    const subTotal = subEvent.vehicleUtilizations?.reduce((sum, v) => sum + (v.totalCost || 0), 0) || 0;
                    
                    return (
                      <div key={subEvent.id} className="mb-6 bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-200 overflow-hidden">
                        {/* Sub-Event Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-white text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                                  SUB-EVENT {subIdx + 1}
                                </span>
                                <span className="font-bold text-lg">ID: SUB{String(subEvent.subEventId).padStart(3, '0')}</span>
                              </div>
                              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{subEvent.subEventPlace}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{subEvent.subEventReportingDate}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{subEvent.subEventStartTime} {subEvent.subEventEndTime && `- ${subEvent.subEventEndTime}`}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold text-lg">
                              ₹{subTotal.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Table */}
                        <div className="p-4">
                          <table className="w-full border-collapse border-2 border-gray-300">
                            <thead>
                              <tr className="bg-blue-900 text-white">
                                <th className="p-3 border text-left text-xs">S.No</th>
                                <th className="p-3 border text-left text-xs">Vehicle Type</th>
                                <th className="p-3 border text-center text-xs">Quantity</th>
                                <th className="p-3 border text-center text-xs">KM Run</th>
                                <th className="p-3 border text-center text-xs">Fuel (L)</th>
                                <th className="p-3 border text-left text-xs">Driver</th>
                                <th className="p-3 border text-right text-xs">Cost (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subEvent.vehicleUtilizations?.map((vehicle, vIdx) => (
                                <tr key={vehicle.id} className={vIdx % 2 === 0 ? 'bg-white' : 'bg-purple-50'}>
                                  <td className="p-3 border font-medium">{vIdx + 1}</td>
                                  <td className="p-3 border font-semibold">{vehicle.vehicleName || 'N/A'}</td>
                                  <td className="p-3 border text-center font-semibold text-blue-700">{vehicle.actualQuantity || 0}</td>
                                  <td className="p-3 border text-center">{vehicle.kilometersRun || 0} km</td>
                                  <td className="p-3 border text-center">{vehicle.fuelConsumed || 0} L</td>
                                  <td className="p-3 border">{vehicle.driverDetails || '-'}</td>
                                  <td className="p-3 border text-right font-semibold text-green-600">
                                    ₹{(vehicle.totalCost || 0).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-purple-100 border-t-2 border-purple-600">
                                <td colSpan="6" className="p-3 text-right font-bold">SUB-EVENT TOTAL:</td>
                                <td className="p-3 text-right font-bold text-lg text-purple-700">
                                  ₹{subTotal.toLocaleString('en-IN')}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Grand Total */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-2xl font-bold">GRAND TOTAL</h4>
                      <p className="text-green-100 text-sm">Total utilization cost across all sub-events</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold">
                        ₹{(selected.totalCost || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-b-xl flex justify-end sticky bottom-0">
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
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Commissioner Approval System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: commissioner@odisha.gov.in</p>
      </div>
    </div>
  );
}
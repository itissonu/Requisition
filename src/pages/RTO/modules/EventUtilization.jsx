import React, { useState, useEffect } from "react";
import { FileText, Plus, Eye, Calendar, MapPin, User, Car } from "lucide-react";
import { eventAPI, utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function EventUtilizationDashboard() {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await eventAPI.list();
        const approvedEvts = eventsResponse.data.filter(e =>
          e.status === "COLLECTOR_APPROVED"
        );
        setApprovedEvents(approvedEvts);
        const utilizationsResponse = await utilizationAPI.list();
        setUtilizations(utilizationsResponse.data);

        console.log(utilizationsResponse.data, 'utilizationsResponse.data');
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewEventPdf = async (eventId) => {
    try {
      const pdfUrl = `http://localhost:8091/Requisition/api/events/${eventId}/pdf/view`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open document.');
    }
  };

  const handleCreateUtilization = (eventId) => {
    window.location.href = `/utilization/${eventId}`;
  };

  function formatDateTime(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);
  if (isNaN(date)) return "Invalid date";

  return date.toLocaleString("en-IN", {
    weekday: "long",   // e.g. Wednesday
    year: "numeric",   // 2025
    month: "long",     // October
    day: "numeric",    // 8
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

  const getUtilizationStatusColor = (status) => {
    switch (status) {
      case "CREATED": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "SUBMITTED": return "bg-blue-100 text-blue-800 border-blue-300";
      case "APPROVED": return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-300";
      case "COMPLETED": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "UTILIZATION_SUBMITTED": return "Awaiting Approval from Collector";
      case "SUBMITTED": return "Awaiting Approval";
      case "APPROVED": return "Approved";
      case "REJECTED": return "Rejected";
      case "PENDING_COMMISSIONER_APPROVAL": return "Awaiting Approval from Commissioner";
      case "COMMISSIONER_APPROVED": return "Approved by Commissioner";
      case "COMPLETED": return "Completed";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading utilization data...</p>
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
              <h3 className="text-lg font-semibold tracking-wide">VEHICLE UTILIZATION MANAGEMENT SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Section 1: Approved Events Ready for Utilization - TABLE VIEW */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="bg-green-100 border-b border-green-200 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-green-900">
                  APPROVED EVENTS - READY FOR UTILIZATION
                </h3>
                <p className="text-sm text-green-700 mt-1">Events approved by collector and available for vehicle utilization</p>
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                {approvedEvents.length} Available
              </div>
            </div>
          </div>

          <div className="p-6">
            {approvedEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-900 to-green-800 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Duration</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Vehicles</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedEvents.map((event, index) => {
                      const totalVehicles = event.vehicles?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0;

                      return (
                        <tr
                          key={event.id}
                          className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                          <td className="px-4 py-3">
                            <span className="font-mono font-bold text-blue-600">EV{String(event.id).padStart(3, '0')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-gray-900">{event.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">{event.requestingDepartmentName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="text-[10px] text-gray-600">
                              <div className="font-serif">{event.dateOfReporting}</div>
                              <div className="text-gray-400">to</div>
                              <div>{event.dateOfRelease}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
                              APPROVED
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Car className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">{totalVehicles}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewEventPdf(event.id)}
                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="View Requisition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCreateUtilization(event.id)}
                                className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors font-semibold text-sm"
                                title="Create Utilization"
                              >
                                <Plus className="w-4 h-4" />
                                Create
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Events Ready for Utilization</h4>
                <p className="text-gray-500">Events will appear here once they are approved by the collector</p>
              </div>
            )}

            {approvedEvents.length > 0 && (
              <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 mt-4 rounded-b">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{approvedEvents.length}</span> event{approvedEvents.length !== 1 ? 's' : ''} ready for utilization
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Existing Event Utilizations */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="bg-blue-100 border-b border-blue-200 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-900">
                  EVENT UTILIZATIONS - IN PROCESS
                </h3>
                <p className="text-sm text-blue-700 mt-1">Track the status of created utilizations</p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
                {utilizations.length} Active
              </div>
            </div>
          </div>

          <div className="p-6">
            {utilizations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Utilization ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Duration</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold">Total Cost (₹)</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizations.map((util, idx) => (
                      <tr key={util.id} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-blue-600">UT{String(util.id).padStart(3, '0')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">{util.eventName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{util.requestingDepartment}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="text-xs text-gray-600">
                            <div>{util.dateOfReporting}</div>
                            <div className="text-gray-400">to</div>
                            <div>{util.dateOfRelease}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getUtilizationStatusColor(util.status)}`}>
                            {getStatusMessage(util?.utilizationStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-green-700">₹{util.totalCost?.toLocaleString('en-IN') || '0'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-gray-600">{formatDateTime(util.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Utilizations Created Yet</h4>
                <p className="text-gray-500">Utilizations will appear here once created from approved events</p>
              </div>
            )}

            {utilizations.length > 0 && (
              <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 mt-4 rounded-b">
                <p className="text-sm text-gray-600">
                  Total: <span className="font-semibold text-gray-900">{utilizations.length}</span> utilization{utilizations.length !== 1 ? 's' : ''} in process
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Vehicle Utilization Management System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}
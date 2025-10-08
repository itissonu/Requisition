import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Plus, Eye, Calendar, MapPin, User } from "lucide-react";
import { eventAPI, utilizationAPI } from "../../../apis/apiService";

export default function EventUtilizationDashboard() {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        console.log(utilizationsResponse.data,'utilizationsResponse.data');
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
      const pdfUrl = `http://localhost:8091/Requisition/api/events/${eventId}/pdf`;
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open document.');
    }
  };

  const handleCreateUtilization = (eventId) => {
    navigate(`/utilization/${eventId}`);
  };

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
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading utilization data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
            <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">VEHICLE UTILIZATION MANAGEMENT SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Section 1: Approved Events Ready for Utilization */}
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
              <div className="space-y-4">
                {approvedEvents.map((event) => (
                  <div key={event.id} className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-all hover:border-green-300 bg-gray-50">
                    {/* Event Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-gray-900">{event.name}</h4>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-300">
                            COLLECTOR APPROVED
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {event.requestingDepartment}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {event.dateOfReporting} to {event.dateOfRelease}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Event ID</div>
                        <div className="font-mono text-xl font-bold text-blue-900">
                          EV{String(event.id).padStart(3,'0')}
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Requirements Preview */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">Vehicle Requirements:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {event.vehicles && event.vehicles.slice(0, 4).map((vehicle, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {vehicle.vehicleName}: {vehicle.quantity}
                          </div>
                        ))}
                        {event.vehicles && event.vehicles.length > 4 && (
                          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                            +{event.vehicles.length - 4} more vehicles
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                      <button
                        onClick={() => handleViewEventPdf(event.id)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Original Requisition
                      </button>
                      
                      <button
                        onClick={() => handleCreateUtilization(event.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-bold shadow-lg transform transition-all hover:scale-105"
                      >
                        <Plus className="w-5 h-5" />
                        CREATE UTILIZATION
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Events Ready for Utilization</h4>
                <p className="text-gray-500">Events will appear here once they are approved by the collector</p>
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
                <table className="w-full border-collapse border-2 border-gray-300">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="border border-gray-400 p-3 text-left font-bold">Utilization ID</th>
                      <th className="border border-gray-400 p-3 text-left font-bold">Event Name</th>
                      <th className="border border-gray-400 p-3 text-left font-bold">Department</th>
                      <th className="border border-gray-400 p-3 text-center font-bold">Duration</th>
                      <th className="border border-gray-400 p-3 text-center font-bold">Status</th>
                      <th className="border border-gray-400 p-3 text-right font-bold">Total Cost (₹)</th>
                      <th className="border border-gray-400 p-3 text-center font-bold">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilizations.map((util, idx) => (
                      <tr key={util.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 p-3 text-center font-bold text-blue-900">
                          UT{String(util.id).padStart(3,'0')}
                        </td>
                        <td className="border border-gray-300 p-3 font-medium">{util.eventName}</td>
                        <td className="border border-gray-300 p-3">{util.requestingDepartment}</td>
                        <td className="border border-gray-300 p-3 text-center text-xs">
                          <div className="font-medium">{util.dateOfReporting}</div>to
                          <div className="font-medium"> {util.dateOfRelease}</div>
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getUtilizationStatusColor(util.status)}`}>
                            {getStatusMessage(util?.utilizationStatus
)}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-3 text-right font-bold text-green-800">
                          ₹{util.totalCost?.toLocaleString('en-IN') || '0'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center text-sm">
                          {util.createdAt}
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
          </div>
        </div>

        {/* Summary Cards */}
        {/* <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">UTILIZATION SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-green-600 font-bold text-sm mb-2">READY FOR UTILIZATION</div>
              <div className="text-4xl font-bold text-green-900 mb-1">{approvedEvents.length}</div>
              <div className="text-green-700 text-sm">Approved Events</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-blue-600 font-bold text-sm mb-2">UNDER REVIEW</div>
              <div className="text-4xl font-bold text-blue-900 mb-1">
                {utilizations.filter(u => u.status === "SUBMITTED").length}
              </div>
              <div className="text-blue-700 text-sm">Pending Approval</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-purple-600 font-bold text-sm mb-2">APPROVED</div>
              <div className="text-4xl font-bold text-purple-900 mb-1">
                {utilizations.filter(u => u.status === "APPROVED").length}
              </div>
              <div className="text-purple-700 text-sm">Utilizations</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 p-6 rounded-lg text-center shadow-md">
              <div className="text-gray-600 font-bold text-sm mb-2">COMPLETED</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {utilizations.filter(u => u.status === "COMPLETED").length}
              </div>
              <div className="text-gray-700 text-sm">Utilizations</div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Vehicle Utilization Management System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}

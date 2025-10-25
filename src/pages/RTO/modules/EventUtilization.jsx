import React, { useState, useEffect } from "react";
import { FileText, Plus, Eye, Calendar, MapPin, User, Car } from "lucide-react";
import { eventAPI, utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function EventUtilizationDashboard() {
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtil, setSelectedUtil] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [utilizationActive, setUtilizationActive] = useState(0);
  const closeModal = () => {
    setShowModal(false);
    setSelectedUtil(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const eventsResponse = await eventAPI.list();

      const approvedEvts = eventsResponse.data.filter(e =>
        e.status === "CREATED"
      );
      setApprovedEvents(approvedEvts);

      const utilizationsResponse = await utilizationAPI.list();
      setUtilizations(utilizationsResponse.data);
      const utilizationInActive = utilizationsResponse?.data?.filter(u => u?.utilizationStatus !== "COMPLETED")
      setUtilizationActive(utilizationInActive?.length)

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
      // second: "2-digit",
    });
  }

  const getUtilizationStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "SUBMITTED": return "bg-blue-100 text-blue-800 border-blue-300";
      case "APPROVED": return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-300";
      case "COMPLETED": return "bg-green-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  }; const handleViewDetails = (util) => {
    setSelectedUtil(util);
    setShowModal(true);
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "PENDING": return "Awaiting Collector Approval";
      case "SUBMITTED": return "Awaiting Approval";
      case "APPROVED": return "Approved by Collector";
      case "REJECTED": return "Rejected";
      case "PENDING_COMMISSIONER_APPROVAL": return "Awaiting Commissioner";
      case "COMMISSIONER_APPROVED": return "Commissioner Approved";
      case "COMPLETED": return "Completed";
      default: return status;
    }
  };

  // Calculate total sub-events for an event
  const getTotalSubEvents = (event) => {
    return event.subEvents?.length || 0;
  };

  // Calculate total vehicles across all sub-events
  const getTotalVehicles = (event) => {
    if (!event.subEvents) return 0;
    return event.subEvents.reduce((total, subEvent) => {
      return total + (subEvent.vehicles?.reduce((sum, v) => sum + (v.quantity || 0), 0) || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">Loading utilization data...</p>
          </div>

          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
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
                <h2 className="text-lg opacity-90">Commerce & Transport   Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">EVENT VEHICLE UTILIZATION </h3>
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
                      {/* <th className="px-4 py-3 text-left text-sm font-semibold">Event Purpose</th> */}
                      <th className="px-4 py-3 text-left text-sm font-semibold">Request Event</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                      {/* <th className="px-4 py-3 text-center text-sm font-semibold">Collector</th> */}
                      <th className="px-4 py-3 text-center text-sm font-semibold">Sub-Events</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Vehicles</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedEvents.map((event, index) => {
                      const totalVehicles = getTotalVehicles(event);
                      const totalSubEvents = getTotalSubEvents(event);

                      return (
                        <tr
                          key={event.id}
                          className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                          <td className="px-4 py-3">
                             <span className="font-mono font-bold text-blue-600">{event?.id}</span>
                            {/* <span className="font-mono font-bold text-blue-600">EV{String(event.id).padStart(3, '0')}</span> */}
                          </td>
                          {/* <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="font-medium text-gray-900">{event.name}</span>
                            </div>
                          </td> */}
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-semibold capitalize text-gray-700">{event.requestEventName}</div>
                              <div className="text-xs text-gray-500">{event.requestEventLetterNo}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">{event.requestingDepartment}</span>
                            </div>
                          </td>
                          {/* <td className="px-4 py-3 text-center">
                            <div className="text-sm">
                              <div className="font-semibold text-blue-700">{event.collectorName}</div>
                              <div className="text-xs text-gray-500">{event.collectorDistrict}</div>
                            </div>
                          </td> */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-gray-700 rounded-full font-bold">
                              {totalSubEvents}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Car className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold text-gray-900">{totalVehicles}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-300">
                              APPROVED FOR UTILIZATION
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {/* <button
                                onClick={() => handleViewEventPdf(event.id)}
                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                title="View Requisition"
                              >
                                <Eye className="w-4 h-4" />
                              </button> */}
                              <button
                                onClick={() => handleCreateUtilization(event.id)}
                                className="flex items-center hover:cursor-pointer gap-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors font-semibold text-sm"
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
                {utilizationActive} Active
              </div>
            </div>
          </div>

          <div className="p-6">
            {utilizations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
                      <th className="px-4 py-3 text-left text-sm font-semibold">Util. ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Event Purpose</th>
                      {/* <th className="px-4 py-3 text-left text-sm font-semibold">Request Event</th> */}
                      <th className="px-4 py-3 text-left text-sm font-semibold">Department</th>
                      {/* <th className="px-4 py-3 text-center text-sm font-semibold">Collector</th> */}
                      <th className="px-4 py-3 text-center text-sm font-semibold">Sub-Events</th>
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
                        {/* <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-semibold text-purple-700">{util.requestEventName}</div>
                            <div className="text-xs text-gray-500">{util.requestEventLetterNo}</div>
                          </div>
                        </td> */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{util.requestingDepartment}</span>
                        </td>
                        {/* <td className="px-4 py-3 text-center">
                          <div className="text-sm">
                            <div className="font-semibold text-blue-700">{util.collectorName}</div>
                            <div className="text-xs text-gray-500">{util.collectorDistrict}</div>
                          </div>
                        </td> */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                            {util.subEventUtilizations?.length || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getUtilizationStatusColor(util.utilizationStatus)}`}>
                            {getStatusMessage(util.utilizationStatus)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-green-700">₹{util.totalCost?.toLocaleString('en-IN') || '0'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(util)}
                              className="p-2 bg-blue-600 hover:cursor-pointer text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors shadow"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-600">
                              {formatDateTime(util.createdAt)}
                            </span>
                          </div>
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
      {showModal && selectedUtil && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-300">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Utilization  Details</h3>
                  {/* <p className="text-blue-200 mt-1">Certificate No: UC-{String(selectedUtil.id).padStart(4, '0')}</p> */}
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:cursor-pointer hover:bg-blue-800 p-4 rounded-full transition-colors"
                >
                  <span> x</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              {/* <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-blue-600">Event Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Event Name</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.eventName}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Department</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.department}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Approved By</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.approvedBy}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-300 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Approval Date</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.approvedDate}</p>
                  </div>
                </div>
                {selectedUtil.remarks && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-300 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1 font-semibold">Remarks</p>
                    <p className="text-gray-900">{selectedUtil.remarks}</p>
                  </div>
                )}
              </div> */}

              {/* Sub-Event Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-green-600">Sub-Event & Vehicle Utilization</h4>
                {selectedUtil.subEventUtilizations.map((subEvent, idx) => (
                  <div key={subEvent.id} className="mb-6 border-2 border-gray-300 rounded overflow-hidden">
                    <div className="bg-gray-100 p-4 border-b-2 border-gray-300">
                      <h5 className="font-bold text-lg text-gray-900">Sub-Event {idx + 1}</h5>
                      <div className="flex items-center gap-6 mt-2 text-sm text-gray-700">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Place:</span> {subEvent.subEventPlace}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">Date:</span> {new Date(subEvent.subEventReportingDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                      {/* {subEvent.subEventStartTime && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Time:</span> {subEvent.subEventStartTime} {subEvent.subEventEndTime && `- ${subEvent.subEventEndTime}`}
                        </div>
                      )} */}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-blue-900 text-white">
                          <tr>
                            <th className="p-3 border-r border-blue-800 text-left">Vehicle Type</th>
                            <th className="p-3 border-r border-blue-800 text-center">Quantity</th>
                            <th className="p-3 text-right">Total Cost (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subEvent.vehicleUtilizations.map((vehicle, vIdx) => (
                            <tr key={vehicle.id} className={`${vIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                              <td className="p-3 font-semibold text-gray-800 border-r border-gray-200">{vehicle.vehicleName || 'N/A'}</td>
                              <td className="p-3 text-center font-bold text-gray-900 border-r border-gray-200">{vehicle.actualQuantity || 0}</td>
                              <td className="p-3 text-right font-bold text-green-700">₹{(vehicle.totalCost || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                <div className="  rounded p-4">
                  <div className="flex justify-between items-center">
                    {/* <span className="text-lg font-bold text-gray-900">TOTAL AMOUNT:</span>
                    <span className="text-2xl font-bold text-green-700">₹{selectedUtil.totalAmount.toLocaleString('en-IN')}</span> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t-2 border-gray-300 p-4 rounded-b-lg flex justify-end gap-3">
              {/* <button
                onClick={() => downloadPDF(selectedUtil)}
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition-colors flex items-center gap-2 font-bold shadow-md"
              >
                <Download className="w-5 h-5" />
                Download Certificate
              </button> */}
              <button
                onClick={closeModal}
                className="bg-gray-600 hover:cursor-pointer text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors font-bold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 gap-3 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p className="mb-2">Vehicles Requisition System</p>
        <p>© Government of Odisha – Commerce & Transport Department </p>
        {/* <p className="text-xs opacity-75 mt-1">For assistance, contact: collector@odisha.gov.in</p> */}
      </div>
    </div>
  );
}
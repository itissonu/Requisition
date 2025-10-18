import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Car,
  FileText,
  X,
  Building2,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { eventAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function ShowAllEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [currentEventForPdf, setCurrentEventForPdf] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.list();
        setEvents(response?.data);
        setFilteredEvents(response?.data);
        console.log(response?.data, "fetched events");
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = events;

    // Search filter - by event ID or event name
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.requestEventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.id.toString().includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, events]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "COLLECTOR_APPROVED": return "bg-blue-100 text-blue-800 border-blue-300";
      case "COMMISSIONER_APPROVED": return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-300";
      case "COMPLETED": return "bg-purple-100 text-purple-800 border-purple-300";
      case "UTILIZATION_SUBMITTED": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CREATED": return <Clock className="w-4 h-4" />;
      case "COLLECTOR_APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "COMMISSIONER_APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      case "UTILIZATION_SUBMITTED": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "COLLECTOR_APPROVED": return "Collector Approved";
      case "COMMISSIONER_APPROVED": return "Commissioner Approved";
      case "UTILIZATION_SUBMITTED": return "Utilization Submitted";
      default: return status.replace(/_/g, ' ');
    }
  };

  const getTotalVehicles = (subEvents) => {
    if (!subEvents || subEvents.length === 0) return 0;
    return subEvents.reduce((total, subEvent) => {
      return total + (subEvent.vehicles?.length || 0);
    }, 0);
  };

  const getTotalQuantity = (subEvents) => {
    if (!subEvents || subEvents.length === 0) return 0;
    return subEvents.reduce((total, subEvent) => {
      return total + (subEvent.vehicles?.reduce((sum, v) => sum + v.quantity, 0) || 0);
    }, 0);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleViewPdf = async (event) => {
    try {
      setCurrentEventForPdf(event);
      const pdfViewUrl = `http://localhost:8091/Requisition/api/events/${event.requestEventId}/pdf/view`;
      setPdfUrl(pdfViewUrl);
      setPdfModalOpen(true);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Failed to open document. Please try again.');
    }
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setPdfUrl(null);
    setCurrentEventForPdf(null);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">ALL EVENTS MANAGEMENT SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="bg-blue-100 border-b border-blue-200 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-900">All Vehicle Requisition Events</h2>
                <p className="text-sm text-blue-700 mt-1">Complete overview of all events in the system</p>
              </div>
              <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold">
                {filteredEvents.length} Events
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by event ID or event name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="md:w-56">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="CREATED">Created</option>
                    <option value="COLLECTOR_APPROVED">Collector Approved</option>
                    <option value="COMMISSIONER_APPROVED">Commissioner Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="UTILIZATION_SUBMITTED">Utilization Submitted</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
            </div>
            {(searchTerm || statusFilter !== "ALL") && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Events Table */}
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="p-4 border border-gray-400 text-left font-bold">Event ID</th>
                    <th className="p-4 border border-gray-400 text-left font-bold">Event Details</th>
                    <th className="p-4 border border-gray-400 text-left font-bold">Department</th>
                    <th className="p-4 border border-gray-400 text-center font-bold">Status</th>
                    <th className="p-4 border border-gray-400 text-center font-bold">Sub Events</th>
                    <th className="p-4 border border-gray-400 text-left font-bold">Vehicles</th>
                    <th className="p-4 border border-gray-400 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentEvents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-12 text-center">
                        <div className="text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-medium mb-2">No events found</h3>
                          <p>No events match your search criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentEvents.map((event, index) => (
                      <tr key={event.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="p-4 border border-gray-300">
                          <div className="font-bold text-blue-900">{event.id}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="p-4 border border-gray-300">
                          <div className="font-semibold text-gray-900">{event.requestEventName}</div>
                          <div className="text-sm text-gray-600">Letter: {event.requestEventLetterNo}</div>
                        </td>
                        <td className="p-4 border border-gray-300 font-medium text-gray-700">
                          {event.requestingDepartment}
                        </td>
                        <td className="p-4 border border-gray-300 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(event.status)}`}>
                            {getStatusIcon(event.status)}
                            {getStatusDisplayName(event.status)}
                          </span>
                        </td>
                        <td className="p-4 border border-gray-300 text-center">
                          <span className="bg-purple-100 text-purple-800 px-1 py-1 rounded-full text-[10px] font-bold border border-purple-300">
                            {event.subEvents?.length || 0} Events
                          </span>
                        </td>
                        <td className="p-4 border border-gray-300">
                          <div className="text-sm space-y-1">
                            {event.subEvents && event.subEvents[0]?.vehicles?.slice(0, 2).map((v, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center px-2 py-1 rounded"
                              >
                                <span
                                  className="truncate text-xs max-w-[100px] block"
                                  title={v.vehicleName}
                                >
                                  {v.vehicleName}
                                </span>
                                <span className="font-semibold text-xs">×{v.quantity}</span>
                              </div>
                            ))}
                            {event.subEvents && event.subEvents[0]?.vehicles?.length > 2 && (
                              <div className="text-xs text-blue-600 font-medium">
                                +{event.subEvents[0].vehicles.length - 2} more
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border border-gray-300">
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              onClick={() => handleViewDetails(event)}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {/* <button
                              onClick={() => handleViewPdf(event)}
                              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                              title="View PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Section */}
          {filteredEvents.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : pageNum === '...'
                          ? 'bg-transparent text-gray-400 cursor-default'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Summary */}
                <div className="flex gap-3 text-sm">
                  <span className="text-yellow-700">
                    Created: {events.filter(e => e.status === 'CREATED').length}
                  </span>
                  <span className="text-purple-700">
                    Completed: {events.filter(e => e.status === 'COMPLETED').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Event Details - #{selectedEvent.id}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-white hover:text-gray-300 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-bold text-gray-700 block mb-1">Event Name:</label>
                    <p className="text-gray-900">{selectedEvent.requestEventName}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-bold text-gray-700 block mb-1">Letter Number:</label>
                    <p className="text-gray-900">{selectedEvent.requestEventLetterNo}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-bold text-gray-700 block mb-1">Department:</label>
                    <p className="text-gray-900">{selectedEvent.requestingDepartment}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-bold text-gray-700 block mb-1">Status:</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusIcon(selectedEvent.status)}
                      {getStatusDisplayName(selectedEvent.status)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-bold text-gray-700 block mb-1">Created:</label>
                    <p className="text-gray-900">{new Date(selectedEvent.createdAt).toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-600 mt-1">By: {selectedEvent.createdByName}</p>
                  </div>
                </div>
              </div>

              {/* Sub Events */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <label className="font-semibold text-gray-700 block mb-3">Sub Events ({selectedEvent.subEvents?.length || 0}):</label>
                <div className="space-y-4">
                  {selectedEvent.subEvents && selectedEvent.subEvents.map((subEvent, index) => (
                    <div key={subEvent.id} className="bg-white p-4 rounded border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">Place: {subEvent.place}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Date: {subEvent.reportingDate}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="font-bold text-gray-700 mb-2">Vehicles Required:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {subEvent.vehicles && subEvent.vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                              <span className="font-medium text-gray-800 text-sm">{vehicle.vehicleName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Qty:</span>
                                <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
                                  {vehicle.quantity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end gap-3">
              {/* <button
                onClick={() => handleViewPdf(selectedEvent)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                View PDF
              </button> */}
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* PDF Modal Header */}
            <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {currentEventForPdf?.requestEventName} - Event Document
                </h3>
                <p className="text-sm opacity-75">
                  Event ID: #{currentEventForPdf?.id}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Open in New Tab
                </button>

                <button
                  onClick={closePdfModal}
                  className="text-white hover:text-gray-300 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* PDF Content - Native iframe */}
            <div className="h-[calc(95vh-120px)] bg-gray-100">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title={`${currentEventForPdf?.requestEventName} - PDF Document`}
                  onError={() => {
                    alert('Failed to load PDF. The document may not exist or there may be a server error.');
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Loading PDF...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        © Government of Odisha - Commerce & Transport Department | Vehicle Requisition System
      </div>
    </div>
  );
}

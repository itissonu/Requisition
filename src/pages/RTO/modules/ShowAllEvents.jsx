import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Search, Filter, Eye, Edit, FileText, CheckCircle, XCircle, Clock, Download, X, ChevronDown, ChevronRight, MapPin, Calendar, Car, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { eventAPI } from "../../../apis/apiService";
import EventUtilizationPDFViewer from "./EventUtilizationPDFViewer";
import logo from '../../../assests/logo.png';

export default function ShowAllEvents() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);

  // PDF Modal states
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentEventForPdf, setCurrentEventForPdf] = useState(null);

  const { register, watch } = useForm();

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventAPI.list();
        setEvents(response.data);
        setFilteredEvents(response.data);
        console.log(response.data, 'fetched events');
      } catch (error) {
        console.error('Error fetching events:', error);
        alert('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search and status
  useEffect(() => {
    let filtered = events;

   
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.requestEventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.id.toString().includes(searchTerm) ||
        event.requestingDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.collectorName && event.collectorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.requestEventLetterNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
    setCurrentPage(1); 
  }, [searchTerm, statusFilter, events]);


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

 
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
      case "APPROVED": return "bg-green-100 text-green-800 border-green-300";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-300";
      case "COMPLETED": return "bg-blue-100 text-blue-800 border-blue-300";
      case "SET_FOR_RTO_APPROVAL": return "bg-purple-100 text-purple-800 border-purple-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CREATED": return <Clock className="w-4 h-4" />;
      case "APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      case "SET_FOR_RTO_APPROVAL": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const toggleEventExpansion = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleViewPdf = (eventId) => {
    setCurrentEventForPdf(eventId);
    setPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setCurrentEventForPdf(null);
  };

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "SET_FOR_RTO_APPROVAL": return "Pending RTO Approval";
      case "UTILIZATION_SUBMITTED": return "Utilization Submitted";
      default: return status.replace(/_/g, ' ');
    }
  };

  const getTotalVehicles = (event) => {
    return event.subEvents?.reduce((total, subEvent) => {
      return total + subEvent.vehicles.reduce((sum, v) => sum + v.quantity, 0);
    }, 0) || 0;
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
    <div className="bg-white min-h-screen">
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
                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">EVENT MANAGEMENT SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-blue-100 border-b border-blue-200 p-4">
            <h2 className="text-xl font-semibold text-blue-900">All Vehicle Requisition Events</h2>
            <p className="text-sm text-blue-700 mt-1">Manage and track vehicle requisition requests</p>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by event ID, name, letter no, department, or collector..."
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
                    <option value="SET_FOR_RTO_APPROVAL">Pending RTO Approval</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="UTILIZATION_SUBMITTED">Utilization Completed</option>
                  </select>
                </div>
              </div>
              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Events Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-4 text-center font-semibold border-r border-blue-700 w-12"></th>
                  <th className="p-4 text-left font-semibold border-r border-blue-700">Event ID</th>
                  <th className="p-4 text-left font-semibold border-r border-blue-700">Event Details</th>
                  <th className="p-4 text-left font-semibold border-r border-blue-700">Department</th>
                  <th className="p-4 text-center font-semibold border-r border-blue-700">Status</th>
                  <th className="p-4 text-center font-semibold border-r border-blue-700">Sub-Events</th>
                  <th className="p-4 text-left font-semibold border-r border-blue-700">Total Vehicles</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.map((event, index) => (
                  <React.Fragment key={event.id}>
                    {/* Main Event Row */}
                    <tr className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors border-b border-gray-200`}>
                      <td className="p-4 border-r border-gray-200 text-center">
                        <button
                          onClick={() => toggleEventExpansion(event.id)}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                        >
                          {expandedEventId === event.id ? (
                            <ChevronDown className="w-5 h-5 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="text-lg text-gray-900 font-semibold">
                          {event.id}
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="font-semibold text-gray-900">{event.requestEventName}</div>
                        <div className="text-xs text-gray-500">Letter No: {event.requestEventLetterNo}</div>
                      </td>
                      <td className="p-4 border-r border-gray-200 font-medium text-gray-700">
                        {event?.requestingDepartment}
                      </td>
                      <td className="p-4 border-r border-gray-200 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(event?.status)}`}>
                          {getStatusIcon(event?.status)}
                          {getStatusDisplayName(event?.status)}
                        </span>
                      </td>
                      <td className="p-4 border-r border-gray-200 text-center">
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                          <Calendar className="w-4 h-4" />
                          {event.subEvents?.length || 0}
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">
                          <Car className="w-4 h-4" />
                          {getTotalVehicles(event)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleViewDetails(event)}
                            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleViewPdf(event.id)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="View PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Sub-Events Row */}
                    {expandedEventId === event.id && (
                      <tr>
                        <td colSpan="8" className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                              <Calendar className="w-5 h-5 mr-2" />
                              Sub-Events Details ({event.subEvents?.length || 0})
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {event.subEvents?.map((subEvent, subIndex) => (
                                <div key={subEvent.id} className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-2">
                                        {subIndex + 1}
                                      </div>
                                      <h5 className="font-bold text-gray-800">Sub-Event #{subIndex + 1}</h5>
                                    </div>
                                  </div>

                                  <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm">
                                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                      <span className="font-semibold text-gray-700 mr-2">Place:</span>
                                      <span className="text-gray-900">{subEvent.place}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                      <span className="font-semibold text-gray-700 mr-2">Date:</span>
                                      <span className="text-gray-900">{new Date(subEvent.reportingDate).toLocaleDateString('en-GB')}</span>
                                    </div>
                                  </div>

                                  <div className="border-t border-gray-200 pt-3">
                                    <h6 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                                      <Car className="w-3 h-3 mr-1" />
                                      VEHICLES REQUIRED
                                    </h6>
                                    <div className="space-y-1">
                                      {subEvent.vehicles?.map((vehicle, vIndex) => (
                                        <div key={vIndex} className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 px-3 py-2 rounded text-sm border border-green-200">
                                          <span className="font-medium text-gray-800">{vehicle.vehicleName}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-600">Qty:</span>
                                            <span className="font-bold text-green-700 bg-white px-2 py-1 rounded border border-green-300">
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            {currentEvents.length === 0 && (
              <div className="text-center py-12 bg-gray-50">
                <div className="text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p>No events match your current search criteria.</p>
                </div>
              </div>
            )}
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
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Status Summary */}
                <div className="flex gap-4 text-sm">
                  <span className="text-yellow-700">
                    Created: {events.filter(e => e.status === 'CREATED').length}
                  </span>
                  <span className="text-green-700">
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
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Event Details - ID #{selectedEvent.id}</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
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
                    <p className="text-gray-900">{selectedEvent.requestEventName}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Letter No:</label>
                    <p className="text-gray-900">{selectedEvent.requestEventLetterNo}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Department:</label>
                    <p className="text-gray-900">{selectedEvent.requestingDepartment}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Collector:</label>
                    <p className="text-gray-900">{selectedEvent.collectorName || 'Not Assigned'}</p>
                    <p className="text-sm text-gray-600">{selectedEvent.collectorDistrict}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Status:</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusIcon(selectedEvent.status)}
                      {getStatusDisplayName(selectedEvent.status)}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Created By:</label>
                    <p className="text-gray-900">{selectedEvent?.createdByName}</p>
                    <p className="text-sm text-gray-600">{selectedEvent?.createdByRole}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Created At:</label>
                    <p className="text-gray-900">{new Date(selectedEvent.createdAt).toLocaleString('en-IN')}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Total Sub-Events:</label>
                    <p className="text-gray-900 font-bold text-xl">{selectedEvent.subEvents?.length || 0}</p>
                  </div>
                </div>
              </div>

              {/* Sub-Events Section */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <label className="font-semibold text-gray-700 block mb-3">Sub-Events & Vehicle Requirements:</label>
                <div className="space-y-4">
                  {selectedEvent.subEvents?.map((subEvent, index) => (
                    <div key={subEvent.id} className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-2">
                          {index + 1}
                        </div>
                        <h5 className="font-bold text-gray-800">Sub-Event #{index + 1}</h5>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="font-semibold mr-1">Place:</span>
                          <span>{subEvent.place}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                          <span className="font-semibold mr-1">Date:</span>
                          <span>{new Date(subEvent.reportingDate).toLocaleDateString('en-GB')}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <h6 className="text-xs font-semibold text-gray-600 mb-2 flex items-center">
                          <Car className="w-3 h-3 mr-1" />
                          VEHICLES
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {subEvent.vehicles?.map((vehicle, vIndex) => (
                            <div key={vIndex} className="flex justify-between items-center bg-green-50 p-2 rounded border border-green-200">
                              <span className="font-medium text-sm">{vehicle.vehicleName}</span>
                              <span className="font-bold text-green-700 bg-white px-2 py-1 rounded text-sm">
                                ×{vehicle.quantity}
                              </span>
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
            <div className="bg-gray-100 p-4 rounded-b-lg">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <EventUtilizationPDFViewer
        eventId={currentEventForPdf}
        isOpen={pdfModalOpen}
        onClose={closePdfModal}
      />

      {/* Footer */}
      <div className="bg-blue-900 text-white p-4 text-center text-sm mt-8">
        © Government of Odisha - Commerce & Transport Department | Vehicle Requisition System
      </div>
    </div>
  );
}

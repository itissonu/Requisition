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
  Car
} from "lucide-react";

// Demo events data (same as RTO but filtered for collector's scope if needed)
const allEvents = [
  {
    id: 1,
    name: "Health Department Vehicle Inspection", 
    requestingDepartmentName: "Health Department",
    status: "APPROVED",
    dateOfReporting: "2025-10-15",
    dateOfRelease: "2025-10-18",
    approverName: "Current Collector", // Indicates this collector approved it
    createdAt: "2025-10-04T16:30:00",
    vehicles: [
      { vehicleName: "Car", quantity: 2 },
      { vehicleName: "Bus", quantity: 1 }
    ],
    requestEventLetterName: "Health Inspection Letter"
  },
  {
    id: 2,
    name: "Education Department Survey",
    requestingDepartmentName: "Education Department",
    status: "CREATED",
    dateOfReporting: "2025-10-20", 
    dateOfRelease: "2025-10-25",
    approverName: "Current Collector",
    createdAt: "2025-10-03T14:20:00",
    vehicles: [
      { vehicleName: "Van", quantity: 3 }
    ],
    requestEventLetterName: "Education Survey Letter"
  },
  {
    id: 3,
    name: "Road Safety Campaign",
    requestingDepartmentName: "Transport Department",
    status: "REJECTED",
    dateOfReporting: "2025-10-12",
    dateOfRelease: "2025-10-14",
    approverName: "Current Collector",
    createdAt: "2025-10-02T09:15:00",
    vehicles: [
      { vehicleName: "Car", quantity: 1 },
      { vehicleName: "Motorcycle", quantity: 2 }
    ],
    requestEventLetterName: "Road Safety Letter"
  },
  {
    id: 4,
    name: "Agricultural Survey Project",
    requestingDepartmentName: "Agriculture Department", 
    status: "COMPLETED",
    dateOfReporting: "2025-09-28",
    dateOfRelease: "2025-09-30",
    approverName: "Current Collector",
    createdAt: "2025-09-25T11:45:00",
    vehicles: [
      { vehicleName: "Truck", quantity: 1 },
      { vehicleName: "Car", quantity: 2 }
    ],
    requestEventLetterName: "Agriculture Survey Letter"
  }
];

export default function ShowAllEvents() {
  const [events, setEvents] = useState(allEvents);
  const [filteredEvents, setFilteredEvents] = useState(allEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Filter events based on search and status
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.requestingDepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "COMPLETED": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CREATED": return <Clock className="w-4 h-4" />;
      case "APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">All Events</h2>
          <p className="text-gray-600 mt-1">Complete list of vehicle requisition events in your jurisdiction</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {filteredEvents.length} Total
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="CREATED">Created</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 border border-gray-200 text-left font-semibold">Event ID</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Event Name</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Department</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Status</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Duration</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Vehicles</th>
              <th className="p-4 border border-gray-200 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-50">
                <td className="p-4 border border-gray-200 font-medium">EV{String(event.id).padStart(3, '0')}</td>
                <td className="p-4 border border-gray-200">
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-gray-500">Created: {new Date(event.createdAt).toLocaleDateString()}</div>
                  </div>
                </td>
                <td className="p-4 border border-gray-200">{event.requestingDepartmentName}</td>
                <td className="p-4 border border-gray-200">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                    {event.status}
                  </span>
                </td>
                <td className="p-4 border border-gray-200">
                  <div>
                    <div className="text-sm">From: {event.dateOfReporting}</div>
                    <div className="text-sm">To: {event.dateOfRelease}</div>
                  </div>
                </td>
                <td className="p-4 border border-gray-200">
                  <div className="text-sm">
                    {event.vehicles.map((v, index) => (
                      <div key={index}>{v.vehicleName}: {v.quantity}</div>
                    ))}
                  </div>
                </td>
                <td className="p-4 border border-gray-200">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleViewDetails(event)}
                      className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No events found matching your criteria.
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Event Details</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Event ID:</label>
                    <p>EV{String(selectedEvent.id).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status:</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusIcon(selectedEvent.status)}
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Event Name:</label>
                  <p>{selectedEvent.name}</p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Requesting Department:</label>
                  <p>{selectedEvent.requestingDepartmentName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Reporting Date:</label>
                    <p>{selectedEvent.dateOfReporting}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Release Date:</label>
                    <p>{selectedEvent.dateOfRelease}</p>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Vehicle Requirements:</label>
                  <div className="mt-1">
                    {selectedEvent.vehicles.map((vehicle, index) => (
                      <div key={index} className="flex justify-between bg-gray-50 p-2 rounded mb-1">
                        <span>{vehicle.vehicleName}</span>
                        <span className="font-medium">Qty: {vehicle.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Request Letter:</label>
                  <p className="text-blue-600 cursor-pointer hover:underline">
                    {selectedEvent.requestEventLetterName}
                  </p>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Approver:</label>
                  <p>{selectedEvent.approverName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

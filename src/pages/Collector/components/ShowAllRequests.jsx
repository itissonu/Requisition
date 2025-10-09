import React, { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Calendar,
  User
} from "lucide-react";


const allRequests = [
  {
    id: 1,
    name: "Health Department Vehicle Inspection",
    requestingDepartmentName: "Health Department",
    status: "APPROVED",
    dateOfReporting: "2025-10-15",
    dateOfRelease: "2025-10-18",
    createdAt: "2025-10-04T09:30:00",
    approvedAt: "2025-10-06T10:15:00",
    vehicles: [
      { vehicleName: "Car", quantity: 2 },
      { vehicleName: "Bus", quantity: 1 }
    ],
    requestEventLetterName: "Health Inspection Request Letter",
    priority: "HIGH"
  },
  {
    id: 2,
    name: "Education Department Survey", 
    requestingDepartmentName: "Education Department",
    status: "CREATED",
    dateOfReporting: "2025-10-20",
    dateOfRelease: "2025-10-25", 
    createdAt: "2025-10-06T08:15:00",
    vehicles: [
      { vehicleName: "Van", quantity: 3 }
    ],
    requestEventLetterName: "Education Survey Request Letter",
    priority: "MEDIUM"
  },
  {
    id: 3,
    name: "Road Safety Campaign",
    requestingDepartmentName: "Transport Department", 
    status: "REJECTED",
    dateOfReporting: "2025-10-12",
    dateOfRelease: "2025-10-14",
    createdAt: "2025-10-02T14:30:00",
    approvedAt: "2025-10-05T16:20:00",
    vehicles: [
      { vehicleName: "Car", quantity: 1 },
      { vehicleName: "Motorcycle", quantity: 2 }
    ],
    requestEventLetterName: "Road Safety Request Letter",
    priority: "MEDIUM",
    rejectionReason: "Insufficient justification provided"
  },
  {
    id: 4,
    name: "Agricultural Survey Project",
    requestingDepartmentName: "Agriculture Department",
    status: "COMPLETED",
    dateOfReporting: "2025-09-28", 
    dateOfRelease: "2025-09-30",
    createdAt: "2025-09-25T11:45:00",
    approvedAt: "2025-09-26T09:30:00",
    vehicles: [
      { vehicleName: "Truck", quantity: 1 },
      { vehicleName: "Car", quantity: 2 }
    ],
    requestEventLetterName: "Agriculture Survey Request Letter",
    priority: "LOW"
  },
  {
    id: 5,
    name: "Emergency Medical Response",
    requestingDepartmentName: "Health Department",
    status: "APPROVED",
    dateOfReporting: "2025-10-10",
    dateOfRelease: "2025-10-12",
    createdAt: "2025-10-05T16:45:00", 
    approvedAt: "2025-10-06T08:30:00",
    vehicles: [
      { vehicleName: "Ambulance", quantity: 2 }
    ],
    requestEventLetterName: "Emergency Response Request",
    priority: "URGENT"
  }
];

export default function ShowAllRequests() {
  const [requests, setRequests] = useState(allRequests);
  const [filteredRequests, setFilteredRequests] = useState(allRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filter requests based on search and filters
  useEffect(() => {
    let filtered = requests;

    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestingDepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (priorityFilter !== "ALL") {
      filtered = filtered.filter(request => request.priority === priorityFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, priorityFilter, requests]);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "URGENT": return "bg-red-100 text-red-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">All Requests</h2>
          <p className="text-gray-600 mt-1">Complete list of vehicle requisition requests</p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {filteredRequests.length} Total
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by request name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="md:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="CREATED">Created</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="md:w-48">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 border border-gray-200 text-left font-semibold">Request ID</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Request Name</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Department</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Status</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Priority</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Created Date</th>
              <th className="p-4 border border-gray-200 text-left font-semibold">Duration</th>
              <th className="p-4 border border-gray-200 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="p-4 border border-gray-200 font-mono text-sm">
                  REQ{String(request.id).padStart(3, '0')}
                </td>
                <td className="p-4 border border-gray-200">
                  <div className="font-medium">{request.name}</div>
                  <div className="text-sm text-gray-500">
                    {request.vehicles.map(v => `${v.vehicleName}(${v.quantity})`).join(", ")}
                  </div>
                </td>
                <td className="p-4 border border-gray-200">{request.requestingDepartmentName}</td>
                <td className="p-4 border border-gray-200">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                </td>
                <td className="p-4 border border-gray-200">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </td>
                <td className="p-4 border border-gray-200 text-sm">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 border border-gray-200 text-sm">
                  <div>{request.dateOfReporting}</div>
                  <div className="text-gray-500">to {request.dateOfRelease}</div>
                </td>
                <td className="p-4 border border-gray-200">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleViewDetails(request)}
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

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No requests found matching your criteria.
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Request ID:</label>
                    <p>REQ{String(selectedRequest.id).padStart(3, '0')}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Status:</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Request Name:</label>
                  <p>{selectedRequest.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Department:</label>
                    <p>{selectedRequest.requestingDepartmentName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Priority:</label>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Reporting Date:</label>
                    <p>{selectedRequest.dateOfReporting}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Release Date:</label>
                    <p>{selectedRequest.dateOfRelease}</p>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700">Vehicle Requirements:</label>
                  <div className="mt-1">
                    {selectedRequest.vehicles.map((vehicle, index) => (
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
                    {selectedRequest.requestEventLetterName}
                  </p>
                </div>

                {selectedRequest.rejectionReason && (
                  <div>
                    <label className="font-medium text-gray-700">Rejection Reason:</label>
                    <p className="text-red-600">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

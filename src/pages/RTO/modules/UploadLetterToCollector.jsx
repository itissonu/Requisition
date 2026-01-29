
import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Hash, User, CheckCircle, Clock, XCircle, Filter, Tag, Building, House, Landmark } from "lucide-react";
import { requestEventAPI } from "../../../apis/apiService";

export default function ViewCollectorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("CREATED");
  const [viewingPdf, setViewingPdf] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestEventAPI.list();
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      alert("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const [pdfLoading, setPdfLoading] = useState(false);
  const handleViewPdf = async (id, letterName) => {
    try {
      setPdfLoading(true);

      const response = await requestEventAPI.viewPdf(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      setViewingPdf({ url, name: letterName });
    } catch (error) {
      console.error("Failed to view PDF:", error);
      alert("Failed to view PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };


  const handleDownloadPdf = async (id, letterName) => {
    try {
      setPdfLoading(true);
      const response = await requestEventAPI.downloadPdf(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${letterName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
    finally {
      setPdfLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("No more event can not be created further, Are you sure you want to complete this event ")) return;

    try {
      await requestEventAPI.approve(id, {
        status: "APPROVED",
        approvedAt: new Date().toISOString()
      });
      alert("Request approved successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Failed to approve request:", error);
      alert("Failed to approve request. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      CREATED: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock, label: "Under Process" },
      APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: "Event Created" },
      REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.CREATED;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const filteredRequests = filterStatus === "ALL"
    ? requests
    : requests.filter(req => req.status === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}


        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Collector Requests
                </h1>
                <p className="text-gray-600 text-sm">
                  {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 hover:cursor-pointer border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="ALL">All Status</option>
                <option value="CREATED">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {filterStatus === "ALL"
                ? "No requests have been submitted yet."
                : `No ${filterStatus.toLowerCase()} requests found.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 line-clamp-2">
                        {request.letterName}
                      </h3>
                      {/* <p className="text-blue-100 text-sm">
                        {formatDate(request.createdAt)}
                      </p> */}
                    </div>
                    {(getStatusBadge(request.status))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center text-sm">
                    <Tag className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">Letter No:</span>
                    <span className="font-semibold text-gray-900">{request.letterNo}</span>
                  </div>

                  {/* <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">RTO:</span>
                    <span className="font-semibold text-gray-900 truncate">
                      {request.rtoUserName || "N/A"}
                    </span>
                  </div> */}

                  <div className="flex items-center text-sm">
                    <Landmark className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">Department:</span>
                    <span className="font-semibold text-gray-900 truncate">
                      {request.requestingDepartment || "N/A"}
                    </span>
                  </div>
                  {/* 
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">Date of Need:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(request.dateOfNeed)}
                    </span>
                  </div> */}

                  {request.approvedAt && (
                    <div className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600 mr-2">Event Created At:</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(request.approvedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewPdf(request.id, request.letterName)}
                      disabled={pdfLoading}
                      className="flex-1 flex hover:cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      <Eye className="w-4 h-4 " />
                      View
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(request.id, request.letterName)}
                      disabled={pdfLoading}
                      className="flex-1 hover:cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download Requested Letter
                    </button>
                  </div>

                  {request.status === "CREATED" && (
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="w-full hover:cursor-pointer mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark this event completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {viewingPdf && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 truncate flex-1 mr-4">
                {viewingPdf.name}
              </h3>
              <button
                onClick={() => setViewingPdf(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 hover:cursor-pointer text-gray-500" />
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={viewingPdf.url}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}

      {pdfLoading && (
      <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-xl">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium">Processing PDF...</p>
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
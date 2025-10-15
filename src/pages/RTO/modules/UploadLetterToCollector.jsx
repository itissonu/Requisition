// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Upload, FileText, CheckCircle } from "lucide-react";

// // Demo collectors data
// const demoCollectors = [
//   { value: 1, label: "John Collector - Delhi District" },
//   { value: 2, label: "Priya Collector - Mumbai District" },
//   { value: 3, label: "Raj Collector - Bangalore District" },
//   { value: 4, label: "Amit Collector - Chennai District" },
// ];

// // Simplified validation schema
// const letterSchema = z.object({
//   letterName: z.string().min(1, "Letter name is required").max(100, "Letter name must be less than 100 characters"),
//   collectorId: z.number().min(1, "Please select a collector"),
//   letterFile: z.any().refine((files) => files?.length === 1, "PDF file is required")
//     .refine((files) => files?.[0]?.type === "application/pdf", "Only PDF files are allowed")
//     .refine((files) => files?.[0]?.size <= 5000000, "File size must be less than 5MB"),
// });

// export default function UploadLetterToCollector() {
//   const [loading, setLoading] = useState(false);
//   const [uploadSuccess, setUploadSuccess] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     watch
//   } = useForm({
//     resolver: zodResolver(letterSchema)
//   });

//   const selectedFile = watch("letterFile");

//   const onSubmit = async (data) => {
//     setLoading(true);
//     console.log("Letter Upload Data:", data);

//     // Simulate API call
//     setTimeout(() => {
//       setUploadSuccess(true);
//       setLoading(false);
//       reset();

//       // Hide success message after 3 seconds
//       setTimeout(() => setUploadSuccess(false), 3000);
//     }, 2000);
//   };

//   return (
//     <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
//       <h2 className="text-2xl font-semibold mb-6">Upload Letter to Collector</h2>

//       {/* Success Message */}
//       {uploadSuccess && (
//         <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center gap-2">
//           <CheckCircle className="w-5 h-5" />
//           Letter uploaded successfully and sent to collector!
//         </div>
//       )}

//       {/* Upload Form */}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Letter Name */}
//         <div>
//           <label className="block text-sm font-medium mb-2">Letter Name *</label>
//           <input
//             {...register("letterName")}
//             className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter letter name"
//           />
//           {errors.letterName && <p className="text-red-500 text-sm mt-1">{errors.letterName.message}</p>}
//         </div>

//         {/* Collector Selection */}
//         <div>
//           <label className="block text-sm font-medium mb-2">Select Collector *</label>
//           <select
//             {...register("collectorId", { valueAsNumber: true })}
//             className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a collector</option>
//             {demoCollectors.map((collector) => (
//               <option key={collector.value} value={collector.value}>
//                 {collector.label}
//               </option>
//             ))}
//           </select>
//           {errors.collectorId && <p className="text-red-500 text-sm mt-1">{errors.collectorId.message}</p>}
//         </div>

//         {/* File Upload */}
//         <div>
//           <label className="block text-sm font-medium mb-2">Upload PDF Letter *</label>
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//             <div className="text-center">
//               <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <div className="flex text-sm text-gray-600">
//                 <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
//                   <span>Upload a file</span>
//                   <input
//                     id="file-upload"
//                     type="file"
//                     accept=".pdf"
//                     {...register("letterFile")}
//                     className="sr-only"
//                   />
//                 </label>
//                 <p className="pl-1">or drag and drop</p>
//               </div>
//               <p className="text-xs text-gray-500">PDF up to 5MB</p>

//               {selectedFile && selectedFile[0] && (
//                 <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
//                   <FileText className="w-4 h-4" />
//                   {selectedFile[0].name}
//                 </div>
//               )}
//             </div>
//           </div>
//           {errors.letterFile && <p className="text-red-500 text-sm mt-1">{errors.letterFile.message}</p>}
//         </div>

//         {/* Submit Button */}
//         <div className="flex gap-4">
//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                 Uploading...
//               </>
//             ) : (
//               <>
//                 <Upload className="w-4 h-4" />
//                 Upload Letter
//               </>
//             )}
//           </button>

//           <button
//             type="button"
//             onClick={() => reset()}
//             className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
//           >
//             Reset
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
// import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// function UploadLetterToCollector() {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [status, setStatus] = useState(null);

//   const handleAddSignature = async () => {
//     setIsProcessing(true);
//     setStatus(null);

//     try {
//       // 1. Load your existing PDF
//       const pdfUrl = "/vehicle.pdf"; 
//       const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

//       // 2. Load signature image
//       const signatureUrl = "/signature.png";
//       const signatureBytes = await fetch(signatureUrl).then(res => res.arrayBuffer());

//       // 3. Create PDF document
//       const pdfDoc = await PDFDocument.load(existingPdfBytes);
//       const pngImage = await pdfDoc.embedPng(signatureBytes);
//       const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//       const pages = pdfDoc.getPages();
//       const lastPage = pages[pages.length - 1]; // Sign on last page
//       const { width, height } = lastPage.getSize();

//       // 4. Add signature image
//       const signatureWidth = 150;
//       const signatureHeight = 60;
//       const xPos = width - 200;
//       const yPos = 120;

//       lastPage.drawImage(pngImage, {
//         x: xPos,
//         y: yPos,
//         width: signatureWidth,
//         height: signatureHeight,
//       });

//       // 5. Add signatory details below signature
//       let textY = yPos - 10;

//       // Add horizontal line
//       lastPage.drawLine({
//         start: { x: xPos, y: textY },
//         end: { x: xPos + signatureWidth, y: textY },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       textY -= 15;

//       // Add name
//       lastPage.drawText("Collector", {
//         x: xPos,
//         y: textY,
//         size: 11,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       textY -= 14;

//       // Add designation
//       lastPage.drawText("Regional Transport Officer", {
//         x: xPos,
//         y: textY,
//         size: 9,
//         font: font,
//         color: rgb(0.2, 0.2, 0.2),
//       });

//       textY -= 12;

//       // Add date
//       const currentDate = new Date().toLocaleDateString('en-IN', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//       });
//       lastPage.drawText(`Date: ${currentDate}`, {
//         x: xPos,
//         y: textY,
//         size: 9,
//         font: font,
//         color: rgb(0.2, 0.2, 0.2),
//       });

//       // 6. Save and download
//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = "signed_document.pdf";
//       link.click();

//       setStatus({ type: "success", message: "PDF signed and downloaded successfully!" });

//     } catch (error) {
//       console.error("Error processing PDF:", error);
//       setStatus({ type: "error", message: "Failed to process PDF. Please try again." });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
//       <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
//         <div className="text-center mb-8">
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">
//             Sign Document
//           </h2>
//           <p className="text-gray-600">
//             Add digital signature to your PDF document
//           </p>
//         </div>

//         {/* Status Message */}
//         {status && (
//           <div className={`rounded-lg p-4 mb-6 flex items-center space-x-3 ${
//             status.type === "success" 
//               ? "bg-green-50 border border-green-200" 
//               : "bg-red-50 border border-red-200"
//           }`}>
//             {status.type === "success" ? (
//               <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//             ) : (
//               <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
//             )}
//             <p className={`text-sm font-medium ${
//               status.type === "success" ? "text-green-800" : "text-red-800"
//             }`}>
//               {status.message}
//             </p>
//           </div>
//         )}

//         {/* Document Info */}
//         {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
//           <div className="space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span className="text-gray-600">Document:</span>
//               <span className="font-medium text-gray-900">vehicle.pdf</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Signatory:</span>
//               <span className="font-medium text-gray-900">John Doe</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Designation:</span>
//               <span className="font-medium text-gray-900">Regional Transport Officer</span>
//             </div>
//             <div className="flex justify-between">
//               <span className="text-gray-600">Date:</span>
//               <span className="font-medium text-gray-900">
//                 {new Date().toLocaleDateString('en-IN')}
//               </span>
//             </div>
//           </div>
//         </div> */}

//         {/* Download Button */}
//         <button
//           onClick={handleAddSignature}
//           disabled={isProcessing}
//           className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
//                    hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500
//                    text-white py-4 rounded-xl font-semibold text-lg shadow-lg 
//                    hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] 
//                    active:scale-95 disabled:cursor-not-allowed disabled:transform-none
//                    flex items-center justify-center space-x-2"
//         >
//           {isProcessing ? (
//             <>
//               <Loader2 className="w-5 h-5 animate-spin" />
//               <span>Processing...</span>
//             </>
//           ) : (
//             <>
//               <Download className="w-5 h-5" />
//               <span>Sign & Download PDF</span>
//             </>
//           )}
//         </button>

//         <p className="text-center text-xs text-gray-500 mt-4">
//           The signature will be added to the last page of the document
//         </p>
//       </div>
//     </div>
//   );
// }

// export default UploadLetterToCollector;

import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, Hash, User, CheckCircle, Clock, XCircle, Filter } from "lucide-react";
import { requestEventAPI } from "../../../apis/apiService";

export default function ViewCollectorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
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

  const handleViewPdf = async (id, letterName) => {
    try {
      const response = await requestEventAPI.viewPdf(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setViewingPdf({ url, name: letterName });
    } catch (error) {
      console.error("Failed to view PDF:", error);
      alert("Failed to view PDF. Please try again.");
    }
  };

  const handleDownloadPdf = async (id, letterName) => {
    try {
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
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this request?")) return;

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
      CREATED: { bg: "bg-blue-100", text: "text-blue-700", icon: Clock, label: "Pending" },
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

  console.log("Filtered Requests:", filteredRequests);

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
                className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
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
                      <p className="text-blue-100 text-sm">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {(getStatusBadge(request.status))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center text-sm">
                    <Hash className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">Letter No:</span>
                    <span className="font-semibold text-gray-900">{request.letterNo}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 mr-2">RTO:</span>
                    <span className="font-semibold text-gray-900 truncate">
                      {request.rtoUserName || "N/A"}
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(request.id, request.letterName)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download Requested Letter
                    </button>
                  </div>

                  {request.status === "CREATED" && (
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
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
                <XCircle className="w-6 h-6 text-gray-500" />
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
    </div>
  );
}
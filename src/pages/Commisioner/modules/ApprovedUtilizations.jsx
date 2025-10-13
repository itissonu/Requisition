import React, { useEffect, useState } from "react";
import {
  Calendar,
  User,
  Truck,
  Download,
  CheckCircle,
  Eye,
  X,
  IndianRupee,
  Shield,
  MapPin
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function ApprovedUtilizations() {
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUtil, setSelectedUtil] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [approvedRes, completedRes] = await Promise.all([
          utilizationAPI.getByStatus("COMMISSIONER_APPROVED"),
          utilizationAPI.getByStatus("COMPLETED")
        ]);

        const utilizations = [
          ...approvedRes.data.map(u => ({ ...u, status: "COMMISSIONER_APPROVED" })),
          ...completedRes.data.map(u => ({ ...u, status: "COMPLETED" }))
        ];
        console.log("Fetched utilizations:", utilizations);

        const list = utilizations.map(u => {
          const vehicles = u.subEventUtilizations?.reduce((sum, se) => 
            sum + (se.vehicleUtilizations?.reduce((vSum, v) => vSum + (v.actualQuantity || 0), 0) || 0), 0) || 0;
          const totalCost = u.totalCost || 0;
          
          return {
            id: u.id,
            eventName: u.eventName,
            department: u.requestingDepartment,
            approvedDate: new Date(u.updatedAt).toLocaleDateString('en-IN'),
            totalAmount: totalCost,
            vehiclesUsed: vehicles,
            status: u.status,
            subEventUtilizations: u.subEventUtilizations || [],
            approvedBy: u.collectorApprovedByName || "Commissioner",
            remarks: u.remarks || "",
            dto: u
          };
        });

        setUtilizations(list);
      } catch (err) {
        console.error(err);
        alert("Failed to load utilizations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const downloadPDF = (util) => {
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e40af; padding-bottom: 20px; }
          .header h1 { margin: 5px 0; font-size: 22px; color: #1e40af; }
          .header h2 { margin: 5px 0; font-size: 16px; font-weight: normal; color: #475569; }
          .stamp { position: absolute; top: 80px; right: 50px; border: 4px solid #059669; color: #059669; padding: 10px 20px; font-size: 24px; font-weight: bold; transform: rotate(-15deg); border-radius: 8px; }
          .info-section { margin: 30px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 12px; border: 2px solid #e2e8f0; }
          .info-table td:first-child { font-weight: bold; width: 35%; background: #f1f5f9; }
          .section-title { font-weight: bold; font-size: 16px; margin-top: 30px; margin-bottom: 15px; color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
          .vehicle-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .vehicle-table th { background: #1e40af; color: white; padding: 12px; text-align: left; }
          .vehicle-table td { padding: 10px; border: 1px solid #cbd5e1; }
          .vehicle-table tr:nth-child(even) { background: #f8fafc; }
          .total-row { font-weight: bold; background: #dcfce7 !important; font-size: 18px; }
          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #64748b; border-top: 2px solid #cbd5e1; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="stamp">APPROVED</div>
        <div class="header">
          <h1>GOVERNMENT OF ODISHA</h1>
          <h2>Commerce & Transport (Transport) Department</h2>
          <h1 style="margin-top: 20px; color: #059669;">UTILIZATION CERTIFICATE</h1>
        </div>
        
        <div class="info-section">
          <table class="info-table">
            <tr><td>Certificate No:</td><td>UC-${String(util.id).padStart(4, '0')}</td></tr>
            <tr><td>Event Name:</td><td>${util.eventName}</td></tr>
            <tr><td>Department:</td><td>${util.department}</td></tr>
            <tr><td>Vehicles Used:</td><td>${util.vehiclesUsed}</td></tr>
            <tr><td>Approved By:</td><td>${util.approvedBy}</td></tr>
            <tr><td>Approval Date:</td><td>${util.approvedDate}</td></tr>
            <tr><td>Status:</td><td><strong style="color: #059669;">${util.status === "COMPLETED" ? "COMPLETED" : "APPROVED"}</strong></td></tr>
          </table>
        </div>
        
        <div class="section-title">VEHICLE UTILIZATION BREAKDOWN:</div>
        ${util.subEventUtilizations.map((subEvent, idx) => `
          <div style="margin-bottom: 30px;">
            <h3 style="background: #f1f5f9; padding: 10px; margin: 10px 0;">Sub-Event ${idx + 1}: ${subEvent.subEventPlace} (${new Date(subEvent.subEventReportingDate).toLocaleDateString('en-GB')})</h3>
            <table class="vehicle-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Vehicle Type</th>
                  <th>Quantity</th>
                  <th>Total Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${subEvent.vehicleUtilizations.map((vehicle, vIdx) => `
                  <tr>
                    <td>${vIdx + 1}</td>
                    <td>${vehicle.vehicleName || 'N/A'}</td>
                    <td>${vehicle.actualQuantity || 0}</td>
                    <td>₹${(vehicle.totalCost || 0).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        <table class="vehicle-table">
          <tr class="total-row">
            <td colspan="3" style="text-align: right; padding: 15px;">TOTAL AMOUNT:</td>
            <td style="padding: 15px;">₹${util.totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </table>
        
        <div class="footer">
          <p><strong>This is a computer-generated certificate and does not require a physical signature.</strong></p>
          <p>Government of Odisha - Commerce & Transport Department</p>
          <p>For queries, contact: transport@odisha.gov.in | Phone: 0674-XXXXXXX</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleViewDetails = (util) => {
    setSelectedUtil(util);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUtil(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-16 bg-orange-500 animate-pulse"></div>
            <div className="w-3 h-16 bg-white animate-pulse mx-1"></div>
            <div className="w-3 h-16 bg-green-600 animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-700 font-semibold">Loading approved utilizations...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
      
      <div className="bg-blue-900 text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Government of Odisha</h1>
                <p className="text-sm text-blue-200">Commerce & Transport (Transport) Department</p>
              </div>
            </div>
            <Shield className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-blue-800 text-white py-3 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-center tracking-wide">APPROVED UTILIZATIONS DASHBOARD</h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border-l-4 border-green-600 p-6 rounded shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm mb-1 uppercase">Total Approved</p>
                <p className="text-4xl font-bold text-gray-900">{utilizations.length}</p>
                <p className="text-gray-600 text-sm mt-1">Utilizations</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-blue-600 p-6 rounded shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm mb-1 uppercase">Total Vehicles</p>
                <p className="text-4xl font-bold text-gray-900">
                  {utilizations.reduce((sum, u) => sum + u.vehiclesUsed, 0)}
                </p>
                <p className="text-gray-600 text-sm mt-1">Used</p>
              </div>
              <Truck className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-purple-600 p-6 rounded shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 font-semibold text-sm mb-1 uppercase">Total Amount</p>
                <p className="text-4xl font-bold text-gray-900">
                  ₹{utilizations.reduce((sum, u) => sum + u.totalAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-gray-600 text-sm mt-1">Approved</p>
              </div>
              <IndianRupee className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Utilizations Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-300 p-5">
            <h3 className="text-xl font-bold text-gray-900">All Approved Utilizations</h3>
            <p className="text-sm text-gray-600 mt-1">Complete list of commissioner-approved vehicle utilizations</p>
          </div>

          {utilizations.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <CheckCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Utilizations</h3>
              <p className="text-gray-600">No utilizations have been approved yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-800">Certificate ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-800">Event Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold border-r border-blue-800">Department</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-blue-800">Vehicles</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border-r border-blue-800">Amount (₹)</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border-r border-blue-800">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {utilizations.map((util, index) => (
                    <tr key={util.id} className={`border-b border-gray-200 hover:bg-green-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-4 border-r border-gray-200">
                        <div className="font-mono font-bold text-blue-700">
                          UC-{String(util.id).padStart(4, '0')}
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200">
                        <div className="font-semibold text-gray-900">{util.eventName}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Approved: {util.approvedDate}
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200">
                        <div className="text-gray-900 font-medium">{util.department}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <User className="w-3 h-3 mr-1" />
                          {util.approvedBy}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-200">
                        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-bold">
                          <Truck className="w-4 h-4 mr-1" />
                          {util.vehiclesUsed}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right border-r border-gray-200">
                        <div className="flex items-center justify-end gap-1">
                          <IndianRupee className="w-4 h-4 text-green-600" />
                          <span className="font-bold text-green-700 text-lg">{util.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-200">
                        {util.status === "COMPLETED" ? (
                          <span className="inline-flex items-center bg-gray-200 text-gray-800 px-3 py-1 rounded text-xs font-bold">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold border border-green-300">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            APPROVED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(util)}
                            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* <button
                            onClick={() => downloadPDF(util)}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedUtil && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-300">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Utilization Certificate Details</h3>
                  <p className="text-blue-200 mt-1">Certificate No: UC-{String(selectedUtil.id).padStart(4, '0')}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-blue-800 p-2 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
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
              </div>

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
                      {subEvent.subEventStartTime && (
                        <div className="mt-2 text-sm text-gray-700">
                          <span className="font-semibold">Time:</span> {subEvent.subEventStartTime} {subEvent.subEventEndTime && `- ${subEvent.subEventEndTime}`}
                        </div>
                      )}
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
                <div className="bg-green-100 border-2 border-green-600 rounded p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">TOTAL AMOUNT:</span>
                    <span className="text-2xl font-bold text-green-700">₹{selectedUtil.totalAmount.toLocaleString('en-IN')}</span>
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
                className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition-colors font-bold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-blue-900 text-white p-4 text-center text-sm mt-8">
        <p className="font-semibold">© 2025 Government of Odisha – Commerce & Transport Department</p>
        <p className="text-xs opacity-75 mt-1">Approved Utilizations System | For assistance: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}
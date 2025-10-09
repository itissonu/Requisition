import React, { useEffect, useState } from "react";
import {
  Calendar,
  User,
  Truck,
  Download,
  CheckCircle,
  Eye,
  X,
  IndianRupee
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

        const list = utilizations.map(u => {
          const start = new Date(u.dateOfReporting);
          const end = new Date(u.dateOfRelease);
          const days = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
          const vehicles = u.vehicleUtilizations?.length || 0;
          const totalCost = u.totalCost || 0;
          return {
            id: u.id,
            eventName: u.eventName,
            department: u.requestingDepartment,
            approvedDate: new Date(u.updatedAt).toLocaleDateString('en-IN'),
            totalAmount: totalCost,
            vehiclesUsed: vehicles,
            duration: `${days} days`,
            dateOfReporting: u.dateOfReporting,
            dateOfRelease: u.dateOfRelease,
            days,
            status: u.status,
            vehicleUtilizations: u.vehicleUtilizations || [],
            approvedBy: u.collectorApprovedByName || "Commissioner",
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
            <tr><td>Certificate No:</td><td>UC${String(util.id).padStart(4, '0')}</td></tr>
            <tr><td>Event Name:</td><td>${util.eventName}</td></tr>
            <tr><td>Department:</td><td>${util.department}</td></tr>
            <tr><td>Event Duration:</td><td>${util.dateOfReporting} to ${util.dateOfRelease}</td></tr>
            <tr><td>Total Days:</td><td>${util.days}</td></tr>
            <tr><td>Vehicles Used:</td><td>${util.vehiclesUsed}</td></tr>
            <tr><td>Approved By:</td><td>${util.approvedBy}</td></tr>
            <tr><td>Approval Date:</td><td>${util.approvedDate}</td></tr>
            <tr><td>Status:</td><td><strong style="color: #059669;">${util.status === "COMPLETED" ? "COMPLETED" : "APPROVED"}</strong></td></tr>
          </table>
        </div>
        
        <div class="section-title">VEHICLE UTILIZATION BREAKDOWN:</div>
        <table class="vehicle-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Vehicle Type</th>
              <th>Quantity</th>
              <th>Cost per Unit (₹)</th>
              <th>Total Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${util.vehicleUtilizations.map((vehicle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${vehicle.vehicleName || 'N/A'}</td>
                <td>${vehicle.actualQuantity || 0}</td>
                <td>₹${((vehicle.totalCost || 0) / (vehicle.actualQuantity || 1)).toLocaleString('en-IN')}</td>
                <td>₹${(vehicle.totalCost || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right;">TOTAL AMOUNT:</td>
              <td>₹${util.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading approved utilizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
              <h3 className="text-lg font-semibold tracking-wide">APPROVED UTILIZATIONS</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-semibold text-sm mb-1">TOTAL APPROVED</p>
                <p className="text-4xl font-bold text-green-900">{utilizations.length}</p>
                <p className="text-green-700 text-sm mt-1">Utilizations</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold text-sm mb-1">TOTAL VEHICLES</p>
                <p className="text-4xl font-bold text-blue-900">
                  {utilizations.reduce((sum, u) => sum + u.vehiclesUsed, 0)}
                </p>
                <p className="text-blue-700 text-sm mt-1">Used</p>
              </div>
              <Truck className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-semibold text-sm mb-1">TOTAL AMOUNT</p>
                <p className="text-4xl font-bold text-purple-900">
                  ₹{utilizations.reduce((sum, u) => sum + u.totalAmount, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-purple-700 text-sm mt-1">Approved</p>
              </div>
              <IndianRupee className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Utilizations Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <h3 className="text-xl font-bold text-white">All Approved Utilizations</h3>
          </div>

          {utilizations.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-20 h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Utilizations</h3>
              <p className="text-gray-600">No utilizations have been approved yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Event Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Duration</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Vehicles</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {utilizations.map((util, index) => (
                    <tr key={util.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-blue-900">
                          UC{String(util.id).padStart(4, '0')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{util.eventName}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          Approved: {util.approvedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">{util.department}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <User className="w-3 h-3 mr-1" />
                          {util.approvedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <Calendar className="w-4 h-4 mr-1" />
                          {util.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          <Truck className="w-4 h-4 mr-1" />
                          {util.vehiclesUsed}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-lg font-bold text-green-600">
                          ₹{util.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {util.status === "COMPLETED" ? (
                          <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            APPROVED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(util)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => downloadPDF(util)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
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
        <div className="fixed inset-0 bg-gray-200 bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Utilization Details</h3>
                  <p className="text-blue-100 mt-1">Certificate No: UC{String(selectedUtil.id).padStart(4, '0')}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-blue-800 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-2">Event Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Event Name</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.eventName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.department}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Event Duration</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.dateOfReporting} to {selectedUtil.dateOfRelease}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Days</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.days} days</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Approved By</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.approvedBy}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Approval Date</p>
                    <p className="font-semibold text-gray-900">{selectedUtil.approvedDate}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-green-600 pb-2">Vehicle Utilization</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-gray-300">
                    <thead>
                      <tr className="bg-blue-900 text-white">
                        <th className="p-3 border text-left">S.No</th>
                        <th className="p-3 border text-left">Vehicle Type</th>
                        <th className="p-3 border text-center">Quantity</th>
                        <th className="p-3 border text-right">Total Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUtil.vehicleUtilizations.map((vehicle, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-3 border font-medium">{index + 1}</td>
                          <td className="p-3 border">{vehicle.vehicleName || 'N/A'}</td>
                          <td className="p-3 border text-center font-semibold">{vehicle.actualQuantity || 0}</td>
                          <td className="p-3 border text-right font-semibold text-green-600">
                            ₹{(vehicle.totalCost || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-green-100 border-t-4 border-green-600">
                        <td colSpan="3" className="p-4 text-right font-bold text-lg">TOTAL AMOUNT:</td>
                        <td className="p-4 text-right font-bold text-xl text-green-600">
                          ₹{selectedUtil.totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 p-4 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => downloadPDF(selectedUtil)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Approved Utilizations System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}
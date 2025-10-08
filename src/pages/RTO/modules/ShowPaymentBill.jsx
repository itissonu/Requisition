import React, { useEffect, useState } from "react";
import { 
  Eye, 
  FileText, 
  Download, 
  CheckCircle, 
  Calendar,
  User,
  DollarSign,
  Truck,
  Clock,
  X
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";

// Mock API for demonstration
;

export default function ShowPaymentBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApprovedBills = async () => {
      try {
        const response = await utilizationAPI.getByStatus("COMMISSIONER_APPROVED");
        const utilizations = response.data;

        const constructedBills = utilizations.map(utilization => {
          const startDate = new Date(utilization.dateOfReporting);
          const endDate = new Date(utilization.dateOfRelease);
          const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          const vehiclesUsed = utilization.vehicleUtilizations?.length || 0;
          
          const vehicleCost = utilization.totalCost || 0;
          const fuelConsumed = utilization.vehicleUtilizations?.reduce((sum, v) => 
            sum + (v.fuelConsumed || 0), 0) || 0;
          const fuelCost = 0; 
          const driverAllowance = 0; 
          const miscExpenses = 0;
          const totalAmount = vehicleCost 
          
          return {
            id: utilization.id,
            eventName: utilization.eventName,
            department: utilization.requestingDepartment,
            approvedBy: utilization.collectorApprovedByName || 'Commissioner',
            approvedAt: utilization.updatedAt,
            dateOfReporting: utilization.dateOfReporting,
            dateOfRelease: utilization.dateOfRelease,
            days,
            vehiclesUsed,
            fuelConsumed,
            details: {
              vehicleCost,
              fuelCost,
              driverAllowance,
              miscExpenses,
              days,
              vehiclesUsed,
              fuelConsumed
            },
            totalAmount,
            vehicleUtilizations: utilization.vehicleUtilizations || [],
            utilization
          };
        });

        setBills(constructedBills);
      } catch (error) {
        console.error('Error fetching bills:', error);
        alert('Failed to load payment bills. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedBills();
  }, []);

  const generatePDF = (bill) => {
  
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 5px 0; font-size: 18px; }
          .header h2 { margin: 5px 0; font-size: 14px; font-weight: normal; }
          .bill-info { margin: 20px 0; }
          .bill-info table { width: 100%; border-collapse: collapse; }
          .bill-info td { padding: 8px; border: 1px solid #ddd; }
          .bill-info td:first-child { font-weight: bold; width: 40%; background: #f5f5f5; }
          .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; font-size: 14px; }
          .vehicle-table, .cost-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .vehicle-table th, .cost-table th { background: #2980b9; color: white; padding: 10px; text-align: left; }
          .vehicle-table td, .cost-table td { padding: 8px; border: 1px solid #ddd; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>GOVERNMENT OF ODISHA</h1>
          <h2>Commerce & Transport (Transport) Department</h2>
          <h1 style="margin-top: 15px;">PAYMENT BILL</h1>
        </div>
        
        <div class="bill-info">
          <table>
            <tr><td>Bill No:</td><td>PB${String(bill.id).padStart(3, '0')}</td></tr>
            <tr><td>Date:</td><td>${new Date().toLocaleDateString('en-IN')}</td></tr>
            <tr><td>Event Name:</td><td>${bill.eventName}</td></tr>
            <tr><td>Department:</td><td>${bill.department}</td></tr>
            <tr><td>Event Duration:</td><td>${bill.dateOfReporting} to ${bill.dateOfRelease}</td></tr>
            <tr><td>Total Days:</td><td>${bill.days}</td></tr>
            <tr><td>Approved By:</td><td>${bill.approvedBy}</td></tr>
          </table>
        </div>
        
        <div class="section-title">VEHICLE UTILIZATION DETAILS:</div>
        <table class="vehicle-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Vehicle Type</th>
              <th>Quantity</th>
              <th>Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.vehicleUtilizations.map((vehicle, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${vehicle.vehicleName || 'Unknown Vehicle'}</td>
                <td>${vehicle.actualQuantity || 0}</td>
                <td>₹${(vehicle.totalCost || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="section-title">COST BREAKDOWN:</div>
        <table class="cost-table">
          <tr><td>Vehicle Cost:</td><td>₹${bill.details.vehicleCost.toLocaleString('en-IN')}</td></tr>
          <tr><td>Fuel Cost (POL):</td><td>₹${bill.details.fuelCost.toLocaleString('en-IN')}</td></tr>
          <tr><td>Driver Allowance:</td><td>₹${bill.details.driverAllowance.toLocaleString('en-IN')}</td></tr>
          <tr><td>Miscellaneous Expenses:</td><td>₹${bill.details.miscExpenses.toLocaleString('en-IN')}</td></tr>
          <tr class="total-row"><td>TOTAL AMOUNT:</td><td>₹${bill.totalAmount.toLocaleString('en-IN')}</td></tr>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated bill and does not require a signature.</p>
          <p>Government of Odisha - Commerce & Transport Department</p>
        </div>
      </body>
      </html>
    `;
    
    // Create a new window and print
    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleMarkCompleted = async (bill) => {
    if (window.confirm(`Mark payment as completed for "${bill.eventName}"?`)) {
      setActionLoading(true);
      try {
        await utilizationAPI.completePayment(bill.id, "Payment processed and completed");
        setBills(bills.filter(b => b.id !== bill.id));
        alert('Payment marked as completed successfully!');
      } catch (error) {
        console.error('Error completing payment:', error);
        alert('Failed to complete payment. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleViewBill = (bill) => {
    setSelected(bill);
    setShowModal(true);
  };

  const closeBillModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-green-50 min-h-screen">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
            <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">PAYMENT BILLS MANAGEMENT SYSTEM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="bg-green-100 border-b border-green-200 p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-green-900">APPROVED PAYMENT BILLS</h3>
                <p className="text-sm text-green-700 mt-1">Commissioner approved utilizations ready for payment processing</p>
              </div>
              <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold">
                {bills.length} Bills Ready
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {bills.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Bills</h3>
                <p className="text-gray-600">No approved utilizations pending for payment at this time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="p-3 text-left border">Bill ID</th>
                      <th className="p-3 text-left border">Event Name</th>
                      <th className="p-3 text-left border">Department</th>
                      <th className="p-3 text-left border">Duration</th>
                      <th className="p-3 text-center border">Days</th>
                      <th className="p-3 text-center border">Vehicles</th>
                      <th className="p-3 text-right border">Total Amount</th>
                      <th className="p-3 text-center border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill, index) => (
                      <tr key={bill.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border font-mono font-bold text-blue-900">
                          PB{String(bill.id).padStart(3,'0')}
                        </td>
                        <td className="p-3 border">
                          <div className="font-semibold text-gray-900">{bill.eventName}</div>
                          <div className="text-xs text-gray-500">Approved by: {bill.approvedBy}</div>
                        </td>
                        <td className="p-3 border text-gray-700">{bill.department}</td>
                        <td className="p-3 border text-sm">
                          <div>{bill.dateOfReporting}</div>
                          <div className="text-gray-500">to</div>
                          <div>{bill.dateOfRelease}</div>
                        </td>
                        <td className="p-3 border text-center font-semibold">{bill.days}</td>
                        <td className="p-3 border text-center font-semibold">{bill.vehiclesUsed}</td>
                        <td className="p-3 border text-right">
                          <div className="text-xl font-bold text-green-600">
                            ₹{bill.totalAmount.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="p-3 border">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleViewBill(bill)}
                              className="flex items-center justify-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => generatePDF(bill)}
                              className="flex items-center justify-center gap-1 text-green-600 hover:bg-green-50 px-2 py-1 rounded text-sm"
                            >
                              <Download className="w-4 h-4" />
                              Print
                            </button>
                            <button
                              onClick={() => handleMarkCompleted(bill)}
                              disabled={actionLoading}
                              className="flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
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

        {/* Summary Card */}
        {/* <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">PAYMENT SUMMARY</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-green-600 font-bold text-sm mb-2">TOTAL BILLS</div>
              <div className="text-4xl font-bold text-green-900 mb-1">{bills.length}</div>
              <div className="text-green-700 text-sm">Ready for Payment</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-blue-600 font-bold text-sm mb-2">TOTAL AMOUNT</div>
              <div className="text-4xl font-bold text-blue-900 mb-1">
                ₹{bills.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString('en-IN')}
              </div>
              <div className="text-blue-700 text-sm">Pending Payment</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 p-6 rounded-lg text-center shadow-md">
              <div className="text-purple-600 font-bold text-sm mb-2">AVG AMOUNT</div>
              <div className="text-4xl font-bold text-purple-900 mb-1">
                ₹{bills.length > 0 ? Math.round(bills.reduce((sum, bill) => sum + bill.totalAmount, 0) / bills.length).toLocaleString('en-IN') : '0'}
              </div>
              <div className="text-purple-700 text-sm">Per Bill</div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Bill Details Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Payment Bill Details - PB{String(selected.id).padStart(3,'0')}</h3>
                <button
                  onClick={closeBillModal}
                  className="text-white hover:text-gray-300 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info Table */}
              <div>
                <h4 className="font-bold text-lg mb-3">Bill Information</h4>
                <table className="w-full border-collapse border">
                  <tbody>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold w-1/3">Event Name:</td>
                      <td className="p-3 border">{selected.eventName}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Department:</td>
                      <td className="p-3 border">{selected.department}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Duration:</td>
                      <td className="p-3 border">{selected.dateOfReporting} to {selected.dateOfRelease}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Total Days:</td>
                      <td className="p-3 border">{selected.days} days</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Vehicles Used:</td>
                      <td className="p-3 border">{selected.vehiclesUsed}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Approved By:</td>
                      <td className="p-3 border">{selected.approvedBy}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Vehicle Utilization Table */}
              <div>
                <h4 className="font-bold text-lg mb-3">Vehicle Utilization Details</h4>
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="p-3 border text-left">S.No</th>
                      <th className="p-3 border text-left">Vehicle Type</th>
                      <th className="p-3 border text-center">Quantity</th>
                      <th className="p-3 border text-center">Fuel (L)</th>
                      <th className="p-3 border text-right">Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.vehicleUtilizations.map((vehicle, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border">{index + 1}</td>
                        <td className="p-3 border font-medium">{vehicle.vehicleName}</td>
                        <td className="p-3 border text-center">{vehicle.actualQuantity}</td>
                        <td className="p-3 border text-center">{vehicle.fuelConsumed || 0}</td>
                        <td className="p-3 border text-right font-semibold">₹{(vehicle.totalCost || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Cost Breakdown Table */}
              <div>
                <h4 className="font-bold text-lg mb-3">Cost Breakdown</h4>
                <table className="w-full border-collapse border">
                  <tbody>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Vehicle Cost:</td>
                      <td className="p-3 border text-right font-semibold">₹{selected.details.vehicleCost.toLocaleString('en-IN')}</td>
                    </tr>
                    {/* <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Fuel Cost ({selected.details.fuelConsumed}L @ ₹85/L):</td>
                      <td className="p-3 border text-right font-semibold">₹{selected.details.fuelCost.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Driver Allowance ({selected.vehiclesUsed} × {selected.days} × ₹200):</td>
                      <td className="p-3 border text-right font-semibold">₹{selected.details.driverAllowance.toLocaleString('en-IN')}</td>
                    </tr> */}
                    {/* <tr>
                      <td className="p-3 border bg-gray-100 font-semibold">Miscellaneous Expenses:</td>
                      <td className="p-3 border text-right font-semibold">₹{selected.details.miscExpenses.toLocaleString('en-IN')}</td>
                    </tr> */}
                    <tr className="bg-green-100">
                      <td className="p-3 border font-bold text-lg">TOTAL AMOUNT:</td>
                      <td className="p-3 border text-right font-bold text-lg text-green-600">₹{selected.totalAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={() => generatePDF(selected)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Print Bill
              </button>
              <button
                onClick={closeBillModal}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Payment Bills Management System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: finance@odisha.gov.in</p>
      </div>
    </div>
  );
}
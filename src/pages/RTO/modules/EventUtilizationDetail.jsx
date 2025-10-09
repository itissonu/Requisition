import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Calculator, Save, X } from "lucide-react";
import { eventAPI, utilizationAPI, vehicleAPI } from "../../../apis/apiService";

export default function EventUtilizationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [utilizationData, setUtilizationData] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventResponse = await eventAPI.details(eventId);
        const eventData = eventResponse.data;
        setEvent(eventData);

        const vehicleResponse = await vehicleAPI.list();
        setVehicles(vehicleResponse.data);

        // Initialize utilization data
        const initData = {};
        if (eventData.vehicles) {
          eventData.vehicles.forEach(eventVehicle => {
            const vehicleInfo = vehicleResponse.data.find(v => v.id === eventVehicle.vehicleId);
            const ratePerKm = vehicleInfo?.ratePerKm || 0;
            const quantity = eventVehicle.quantity || 0;
            
            initData[eventVehicle.vehicleId] = {
              actualQuantity: quantity,
              ratePerKm: ratePerKm,
              totalCost: quantity * ratePerKm,
              requestedQuantity: quantity
            };
          });
        }

        setUtilizationData(initData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load event data. Please try again.');
        navigate('/rto/event-utilization');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, navigate]);

  // Calculate total cost whenever utilization data changes
  useEffect(() => {
    const total = Object.values(utilizationData).reduce(
      (sum, item) => sum + (parseFloat(item.totalCost) || 0), 
      0
    );
    setTotalCost(total);
  }, [utilizationData]);

  const getVehicleInfo = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId) || { name: 'Unknown Vehicle', ratePerKm: 0 };
  };

  const handleQuantityChange = (vehicleId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    const currentData = utilizationData[vehicleId] || {};
    const ratePerKm = currentData.ratePerKm || 0;
    const newTotalCost = quantity * ratePerKm;

    setUtilizationData({
      ...utilizationData,
      [vehicleId]: {
        ...currentData,
        actualQuantity: quantity,
        totalCost: newTotalCost
      }
    });
  };

  const handleTotalCostChange = (vehicleId, newCost) => {
    const cost = parseFloat(newCost) || 0;
    const currentData = utilizationData[vehicleId] || {};

    setUtilizationData({
      ...utilizationData,
      [vehicleId]: {
        ...currentData,
        totalCost: cost
      }
    });
  };

  const handleViewEventPdf = () => {
    const pdfUrl = `http://localhost:8091/Requisition/api/events/${eventId}/pdf/view`;
    window.open(pdfUrl, '_blank');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        eventId: parseInt(eventId),
        totalCost: totalCost,
        remarks: "",
        vehicleUtilizations: event.vehicles.map(eventVehicle => {
          const data = utilizationData[eventVehicle.vehicleId] || {};
          return {
            vehicleId: eventVehicle.vehicleId,
            actualQuantity: data.actualQuantity || 0,
            totalCost: data.totalCost || 0
          };
        })
      };

      console.log("Submit Utilization:", payload);
      await utilizationAPI.create(payload);

      alert("Utilization created successfully!");
      navigate("/rto/event-utilization");

    } catch (error) {
      console.error('Error submitting utilization:', error);
      alert('Failed to create utilization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <p className="text-red-600">Event not found or failed to load.</p>
          <button
            onClick={() => navigate('/rto/event-utilization')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
            <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">VEHICLE UTILIZATION FORM</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="bg-blue-100 border-b border-blue-200 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-blue-900">
                  CREATE UTILIZATION - EV{String(event.id).padStart(3, '0')}
                </h3>
                <h4 className="text-lg font-semibold text-blue-800 mt-1">{event.name}</h4>
              </div>
              <button
                onClick={handleViewEventPdf}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
                title="View Original Event PDF"
              >
                <FileText className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <label className="font-semibold text-gray-700 block mb-1">Requesting Department:</label>
                <p className="text-gray-900 font-medium">{event.requestingDepartmentName}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                <label className="font-semibold text-gray-700 block mb-1">Start Date:</label>
                <p className="text-gray-900 font-medium">{event.dateOfReporting}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500">
                <label className="font-semibold text-gray-700 block mb-1">End Date:</label>
                <p className="text-gray-900 font-medium">{event.dateOfRelease}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Utilization Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="bg-green-100 border-b border-green-200 p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <Calculator className="w-6 h-6 text-green-800" />
              <h3 className="text-xl font-bold text-green-900">VEHICLE UTILIZATION DETAILS</h3>
            </div>
            <p className="text-sm text-green-700 mt-1">Enter actual quantities and costs for vehicle utilization</p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border-2 border-gray-300">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="border border-gray-400 p-3 text-center font-bold">Sl.No</th>
                    <th className="border border-gray-400 p-3 text-left font-bold">Vehicle Type</th>
                    <th className="border border-gray-400 p-3 text-center font-bold">Rate/Km (₹)</th>
                    <th className="border border-gray-400 p-3 text-center font-bold">Requested Qty</th>
                    <th className="border border-gray-400 p-3 text-center font-bold">Actual Qty</th>
                    <th className="border border-gray-400 p-3 text-center font-bold">Auto Calculated (₹)</th>
                    <th className="border border-gray-400 p-3 text-right font-bold">Total Cost (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {event.vehicles && event.vehicles.map((eventVehicle, idx) => {
                    const vehicleInfo = getVehicleInfo(eventVehicle.vehicleId);
                    const data = utilizationData[eventVehicle.vehicleId] || {};
                    const actualQty = data.actualQuantity || 0;
                    const ratePerKm = data.ratePerKm || 0;
                    const autoCalculated = actualQty * ratePerKm;
                    const totalCost = data.totalCost || 0;

                    return (
                      <tr key={eventVehicle.vehicleId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 p-3 text-center font-bold text-blue-900">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 p-3 font-medium">
                          {vehicleInfo.name}
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-medium text-green-800">
                          ₹{ratePerKm.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-medium text-blue-700">
                          {eventVehicle.quantity}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={actualQty}
                            onChange={(e) => handleQuantityChange(eventVehicle.vehicleId, e.target.value)}
                            className="w-24 border-2 border-gray-300 rounded-lg text-center p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold"
                          />
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-medium bg-yellow-50">
                          <span className="text-orange-700 font-bold">
                            ₹{autoCalculated.toLocaleString('en-IN')}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            ({actualQty} × ₹{ratePerKm})
                          </div>
                        </td>
                        <td className="border border-gray-300 p-3 text-right">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={totalCost}
                            onChange={(e) => handleTotalCostChange(eventVehicle.vehicleId, e.target.value)}
                            className="w-36 border-2 border-green-400 rounded-lg text-right p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 font-bold text-green-700"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
                    <td colSpan="6" className="border border-gray-400 p-4 text-right font-bold text-lg">
                      TOTAL UTILIZATION COST:
                    </td>
                    <td className="border border-gray-400 p-4 text-right">
                      <div className="text-2xl font-bold text-yellow-300">
                        ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <strong>💡 How it works:</strong> Enter the actual quantity used. The "Auto Calculated" column shows (Quantity × Rate/Km). 
                You can edit the "Total Cost" field if the actual cost differs (e.g., due to additional charges or discounts).
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'SUBMITTING...' : 'SUBMIT UTILIZATION'}
            </button>

            <button
              onClick={() => navigate("/rto/event-utilization")}
              disabled={submitting}
              className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-lg hover:from-gray-700 hover:to-gray-800 font-bold text-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              CANCEL
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Please verify all vehicle quantities and costs before submitting.
              Once submitted, the utilization will be sent for approval.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Vehicle Utilization Management System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}
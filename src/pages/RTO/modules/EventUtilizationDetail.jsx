import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Calculator, Save, X, ChevronLeft, MapPin, Calendar, Clock } from "lucide-react";
import { eventAPI, utilizationAPI, vehicleAPI } from "../../../apis/apiService";

export default function EventUtilizationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [subEventUtilizations, setSubEventUtilizations] = useState({});
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

        // Initialize utilization data for each sub-event
        const initData = {};
        if (eventData.subEvents) {
          eventData.subEvents.forEach(subEvent => {
            const vehicleUtilData = {};
            
            if (subEvent.vehicles) {
              subEvent.vehicles.forEach(subEventVehicle => {
                const ratePerKm = subEventVehicle.ratePerKm || 0;
                const quantity = subEventVehicle.quantity || 0;
                
                vehicleUtilData[subEventVehicle.vehicleId] = {
                  actualQuantity: quantity,
                  ratePerKm: ratePerKm,
                  totalCost: quantity * ratePerKm,
                  requestedQuantity: quantity,
                  utilizationNotes: '',
                  fuelConsumed: 0,
                  kilometersRun: 0,
                  driverDetails: ''
                };
              });
            }

            initData[subEvent.id] = {
              subEventId: subEvent.id,
              remarks: '',
              vehicles: vehicleUtilData,
              subTotalCost: 0
            };
          });
        }

        setSubEventUtilizations(initData);
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

  // Calculate totals whenever utilization data changes
  useEffect(() => {
    let grandTotal = 0;
    const updatedUtilizations = { ...subEventUtilizations };
    
    Object.keys(updatedUtilizations).forEach(subEventId => {
      const subEventData = updatedUtilizations[subEventId];
      const subTotal = Object.values(subEventData.vehicles).reduce(
        (sum, vehicle) => sum + (parseFloat(vehicle.totalCost) || 0), 
        0
      );
      
      subEventData.subTotalCost = subTotal;
      grandTotal += subTotal;
    });

    setTotalCost(grandTotal);
  }, [subEventUtilizations]);

  const handleQuantityChange = (subEventId, vehicleId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 0;
    const subEventData = subEventUtilizations[subEventId];
    const vehicleData = subEventData.vehicles[vehicleId];
    const ratePerKm = vehicleData.ratePerKm || 0;
    const newTotalCost = quantity * ratePerKm;

    setSubEventUtilizations({
      ...subEventUtilizations,
      [subEventId]: {
        ...subEventData,
        vehicles: {
          ...subEventData.vehicles,
          [vehicleId]: {
            ...vehicleData,
            actualQuantity: quantity,
            totalCost: newTotalCost
          }
        }
      }
    });
  };

  const handleTotalCostChange = (subEventId, vehicleId, newCost) => {
    const cost = parseFloat(newCost) || 0;
    const subEventData = subEventUtilizations[subEventId];
    const vehicleData = subEventData.vehicles[vehicleId];

    setSubEventUtilizations({
      ...subEventUtilizations,
      [subEventId]: {
        ...subEventData,
        vehicles: {
          ...subEventData.vehicles,
          [vehicleId]: {
            ...vehicleData,
            totalCost: cost
          }
        }
      }
    });
  };

  // const handleFieldChange = (subEventId, vehicleId, field, value) => {
  //   const subEventData = subEventUtilizations[subEventId];
  //   const vehicleData = subEventData.vehicles[vehicleId];

  //   setSubEventUtilizations({
  //     ...subEventUtilizations,
  //     [subEventId]: {
  //       ...subEventData,
  //       vehicles: {
  //         ...subEventData.vehicles,
  //         [vehicleId]: {
  //           ...vehicleData,
  //           [field]: value
  //         }
  //       }
  //     }
  //   });
  // };

  // const handleSubEventRemarksChange = (subEventId, remarks) => {
  //   setSubEventUtilizations({
  //     ...subEventUtilizations,
  //     [subEventId]: {
  //       ...subEventUtilizations[subEventId],
  //       remarks: remarks
  //     }
  //   });
  // };

  const handleViewEventPdf = () => {
    const pdfUrl = `http://localhost:8091/Requisition/api/events/${eventId}/pdf/view`;
    window.open(pdfUrl, '_blank');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        eventId: parseInt(eventId),
        remarks: "",
        totalCost: totalCost,
        subEventUtilizations: event.subEvents.map(subEvent => {
          const subEventData = subEventUtilizations[subEvent.id];
          return {
            subEventId: subEvent.id,
            remarks: subEventData.remarks || "",
            
            vehicleUtilizations: subEvent.vehicles.map(subEventVehicle => {
              const vehicleData = subEventData.vehicles[subEventVehicle.vehicleId] || {};
              return {
                vehicleId: subEventVehicle.vehicleId,
                actualQuantity: vehicleData.actualQuantity || 0,
                totalCost: vehicleData.totalCost || 0,
                utilizationNotes: vehicleData.utilizationNotes || "",
                fuelConsumed: vehicleData.fuelConsumed || 0,
                kilometersRun: vehicleData.kilometersRun || 0,
                driverDetails: vehicleData.driverDetails || ""
              };
            })
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
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate('/rto/event-utilization')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Create Utilization - EV{String(event.id).padStart(3, '0')}</span>
        </div>

        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  EVENT DETAILS - EV{String(event.id).padStart(3, '0')}
                </h3>
                <h4 className="text-lg font-semibold text-blue-100 mt-1">{event.name}</h4>
              </div>
              <button
                onClick={handleViewEventPdf}
                className="bg-white text-blue-700 p-3 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
                title="View Original Event PDF"
              >
                <FileText className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-l-4 border-purple-500">
                <label className="font-semibold text-purple-900 block mb-1 text-sm">Request Event:</label>
                <p className="text-purple-800 font-bold">{event.requestEventName}</p>
                <p className="text-purple-600 text-xs mt-1">{event.requestEventLetterNo}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                <label className="font-semibold text-green-900 block mb-1 text-sm">Department:</label>
                <p className="text-green-800 font-bold">{event.requestingDepartment}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <label className="font-semibold text-blue-900 block mb-1 text-sm">Collector:</label>
                <p className="text-blue-800 font-bold">{event.collectorName}</p>
                <p className="text-blue-600 text-xs mt-1">{event.collectorDistrict}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
                <label className="font-semibold text-orange-900 block mb-1 text-sm">Sub-Events:</label>
                <p className="text-orange-800 font-bold text-2xl">{event.subEvents?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Events with Utilization */}
        {event.subEvents && event.subEvents.map((subEvent, subIdx) => {
          const subEventData = subEventUtilizations[subEvent.id] || { vehicles: {}, subTotalCost: 0 };
          
          return (
            <div key={subEvent.id} className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
              {/* Sub-Event Header -- COLOR CHANGED HERE */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 border-b border-gray-900 p-4 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-white text-gray-800 font-bold px-3 py-1 rounded-full text-sm">
                        SUB-EVENT {subIdx + 1}
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        ID: SUB{String(subEvent.id).padStart(3, '0')}
                      </h3>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-gray-200">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm"><span className="font-semibold">Place:</span> {subEvent.place}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-200">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm"><span className="font-semibold">Date:</span> {subEvent.reportingDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-200">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm"><span className="font-semibold">Time:</span> {subEvent.startTime} {subEvent.endTime && `- ${subEvent.endTime}`}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                    ₹{subEventData.subTotalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div> */}
                </div>
              </div>

              {/* Vehicle Utilization Table */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-gray-300">
                    <thead>
                      {/* TABLE HEADER -- COLOR CHANGED HERE */}
                      <tr className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800">
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Sl.No</th>
                        <th className="border border-gray-400 p-2 text-left text-xs font-semibold uppercase">Vehicle Type</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Price</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Requested</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Updated Qty</th>
                        {/* <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Auto Calc</th> */}
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subEvent.vehicles && subEvent.vehicles.map((subEventVehicle, vIdx) => {
                        const vehicleData = subEventData.vehicles[subEventVehicle.vehicleId] || {};
                        const actualQty = vehicleData.actualQuantity || 0;
                        const ratePerKm = vehicleData.ratePerKm || 0;
                        const autoCalculated = actualQty * ratePerKm;
                        const totalCost = vehicleData.totalCost || 0;

                        return (
                          // ROW COLOR -- CHANGED HERE
                          <tr key={subEventVehicle.vehicleId} className={vIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 p-2 text-center font-bold text-gray-700">
                              {vIdx + 1}
                            </td>
                            <td className="border border-gray-300 p-2 font-medium text-sm">
                              {subEventVehicle.vehicleName}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-medium text-green-700 text-sm">
                              ₹{ratePerKm.toLocaleString('en-IN')}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-medium text-blue-700">
                              {subEventVehicle.quantity}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="number"
                                min="0"
                                value={actualQty}
                                onChange={(e) => handleQuantityChange(subEvent.id, subEventVehicle.vehicleId, e.target.value)}
                                // FOCUS COLOR -- CHANGED HERE
                                className="w-20 border-2 border-gray-300 rounded text-center p-1 outline-none font-semibold text-sm"
                              />
                            </td>
                            {/* <td className="border border-gray-300 p-2 text-center bg-yellow-50">
                              <span className="text-orange-700 font-bold text-sm">
                                ₹{autoCalculated.toLocaleString('en-IN')}
                              </span>
                            </td> */}
                            <td className="border  p-2 text-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={totalCost}
                                onChange={(e) => handleTotalCostChange(subEvent.id, subEventVehicle.vehicleId, e.target.value)}
                                className="w-28  border-green-400 rounded text-center p-1 focus:ring-2 focus:ring-green-500 font-bold text-green-700 text-sm"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      {/* FOOTER COLOR -- CHANGED HERE */}
                      {/* <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                        <td colSpan="6" className="border border-gray-400 p-3 text-right font-bold">
                          SUB-EVENT TOTAL:
                        </td>
                        <td colSpan="4" className="border border-gray-400 p-3 text-center">
                          <div className="text-xl font-bold text-yellow-300">
                            ₹{subEventData.subTotalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                      </tr> */}
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {/* Grand Total Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-xl border-1 border-green-800 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-2xl font-bold">GRAND TOTAL UTILIZATION COST</h3>
              <p className="text-green-100 text-sm mt-1">Total cost across all sub-events</p>
            </div>
            <div className="bg-white text-green-700 px-8 py-4 rounded-lg shadow-lg">
              <div className="text-4xl font-bold">
                ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
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
              <strong>Note:</strong> Please verify all vehicle quantities, costs, and additional details for each sub-event before submitting.
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
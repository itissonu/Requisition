import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText, Calculator, Save, X, ChevronLeft, MapPin, Calendar, Clock,
  AlertCircle, DollarSign, Eye, Trash2, CheckCircle, XCircle
} from "lucide-react";
import { eventAPI, utilizationAPI, vehicleAPI, advancePaymentAPI } from "../../../apis/apiService";

// Advance Payment Summary Modal Component
const AdvancePaymentModal = ({ isOpen, onClose, advancePayments, eventName }) => {
  if (!isOpen) return null;

  const totalRequested = advancePayments.reduce((sum, ap) => sum + ap.requestedAmount, 0);
  const totalSanctioned = advancePayments.reduce((sum, ap) => {
    return sum + (ap.billSanctions?.reduce((billSum, bill) => billSum + bill.amount, 0) || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Advance Payment Details</h2>
              <p className="text-blue-100 text-sm mt-1">{eventName}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-blue-700 p-2 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-900 mb-2">Total Requested</h3>
              <p className="text-2xl font-bold text-blue-700">
                ₹{totalRequested.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-900 mb-2">Total Sanctioned</h3>
              <p className="text-2xl font-bold text-green-700">
                ₹{totalSanctioned.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Advance Payments List */}
          <div className="space-y-4">
            {advancePayments.map((ap, index) => {
              const sanctioned = ap.billSanctions?.reduce((sum, bill) => sum + bill.amount, 0) || 0;
              return (
                <div key={ap.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        Advance Request #{index + 1}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Status: <span className={`font-medium ${ap.status === 'APPROVED' ? 'text-green-600' :
                            ap.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                          }`}>{ap.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{ap.requestedAmount.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-green-600">
                        Sanctioned: ₹{sanctioned.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {ap.billSanctions && ap.billSanctions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <h5 className="font-medium text-gray-700 mb-2">Bills:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {ap.billSanctions.map((bill, bIndex) => (
                          <div key={bill.id} className="text-sm bg-white p-2 rounded border">
                            <div className="flex justify-between">
                              <span>Bill #{bIndex + 1}</span>
                              <span className="font-bold">₹{bill.amount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {bill.status} | Type: {bill.type}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {ap.remarks && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-sm text-gray-600">
                        <strong>Remarks:</strong> {ap.remarks}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Zero Amount Warning Modal
const ZeroAmountModal = ({ isOpen, onClose, onConfirm, onDeleteEvent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-yellow-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Zero Amount Detected</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            You are submitting a utilization with ₹0 total cost. This means no vehicles were actually used for this event.
          </p>

          <div className="space-y-3">
            {/* <button
              onClick={onConfirm}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit with Zero Amount
            </button> */}

            <button
              onClick={onDeleteEvent}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Event & Delete
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Go Back to Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, eventName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-red-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <Trash2 className="w-6 h-6" />
            <h2 className="text-lg font-bold">Confirm Event Deletion</h2>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete the event "<strong>{eventName}</strong>"? This action cannot be undone.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Yes, Delete Event
            </button>

            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EventUtilizationForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [advancePayments, setAdvancePayments] = useState([]);
  const [subEventUtilizations, setSubEventUtilizations] = useState({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal states
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showZeroAmountModal, setShowZeroAmountModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, vehicleResponse, advanceResponse] = await Promise.all([
          eventAPI.details(eventId),
          vehicleAPI.list(),
          advancePaymentAPI.getByEvent(eventId)
        ]);

        const eventData = eventResponse.data;
        setEvent(eventData);
        setVehicles(vehicleResponse.data);
        setAdvancePayments(advanceResponse.data || []);

        // Initialize utilization data with zero costs
        const initData = {};
        if (eventData.subEvents) {
          eventData.subEvents.forEach(subEvent => {
            const vehicleUtilData = {};

            if (subEvent.vehicles) {
              subEvent.vehicles.forEach(subEventVehicle => {
                vehicleUtilData[subEventVehicle.vehicleId] = {
                  actualQuantity: subEventVehicle.quantity, // Start with 0
                  ratePerKm: 0,
                  totalCost: 0, // Start with 0
                  requestedQuantity: subEventVehicle.quantity,
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
        navigate('/rto/dashboard');
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

    setSubEventUtilizations({
      ...subEventUtilizations,
      [subEventId]: {
        ...subEventData,
        vehicles: {
          ...subEventData.vehicles,
          [vehicleId]: {
            ...vehicleData,
            actualQuantity: quantity
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

  // Check advance payment conditions
  const checkAdvancePaymentConditions = () => {
    if (advancePayments.length === 0) return true;

    const hasSanctionedBills = advancePayments.some(ap =>
      ap.billSanctions && ap.billSanctions.length > 0
    );

    return hasSanctionedBills;
  };

  const handleSubmit = async () => {
    // Check advance payment conditions first
    if (!checkAdvancePaymentConditions()) {
      alert('Please contact authorities to approve at least some advance payment bills before creating utilization.');
      return;
    }

    // Check for zero amount
    if (totalCost === 0) {
      setShowZeroAmountModal(true);
      return;
    }

    await submitUtilization();
  };

  const submitUtilization = async () => {
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
      navigate("/rto/dashboard");

    } catch (error) {
      console.error('Error submitting utilization:', error);
      alert('Failed to create utilization. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    setShowZeroAmountModal(false);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    try {
      await eventAPI.delete(eventId);
      alert('Event deleted successfully!');
      navigate('/rto/dashboard');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const getTotalAdvanceRequested = () => {
    return advancePayments.reduce((sum, ap) => sum + ap.requestedAmount, 0);
  };

  const getTotalAdvanceSanctioned = () => {
    return advancePayments.reduce((sum, ap) => {
      return sum + (ap.billSanctions?.reduce((billSum, bill) => billSum + bill.amount, 0) || 0);
    }, 0);
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
            onClick={() => navigate('/rto/dashboard')}
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
            onClick={() => navigate('/rto/dashboard')}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Create Utilization - EV{String(event.id).padStart(3, '0')}</span>
        </div>

        {/* Advance Payment Warning */}
        {advancePayments.length > 0 && !checkAdvancePaymentConditions() && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <div>
                <p className="text-red-800 font-medium">Advance Payment Required</p>
                <p className="text-red-700 text-sm">
                  This event has advance payment requests but no bills have been sanctioned yet.
                  Please contact authorities to approve at least partial advance payments before creating utilization.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">EVENT DETAILS</h3>
                <h4 className="text-lg font-semibold text-blue-100 mt-1">{event.name}</h4>
              </div>
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

        {/* Advance Payment Summary */}
        {advancePayments.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 mb-8">
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 border-b border-yellow-700 p-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">ADVANCE PAYMENT SUMMARY</h3>
                  <p className="text-yellow-100 text-sm mt-1">Payment requests for this event</p>
                </div>
                <button
                  onClick={() => setShowAdvanceModal(true)}
                  className="bg-white text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Total Requested</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    ₹{getTotalAdvanceRequested().toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-900">Total Sanctioned</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{getTotalAdvanceSanctioned().toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-500">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">Requests Count</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">{advancePayments.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Events with Utilization */}
        {event.subEvents && event.subEvents.map((subEvent, subIdx) => {
          const subEventData = subEventUtilizations[subEvent.id] || { vehicles: {}, subTotalCost: 0 };

          return (
            <div key={subEvent.id} className="bg-white rounded-lg shadow-lg border border-gray-200 mb-6">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Utilization Table */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-gray-300">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800">
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Sl.No</th>
                        <th className="border border-gray-400 p-2 text-left text-xs font-semibold uppercase">Vehicle Type</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Requested</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Used Qty</th>
                        <th className="border border-gray-400 p-2 text-center text-xs font-semibold uppercase">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subEvent.vehicles && subEvent.vehicles.map((subEventVehicle, vIdx) => {
                        const vehicleData = subEventData.vehicles[subEventVehicle.vehicleId] || {};
                        const actualQty = vehicleData.actualQuantity || 0;
                        const totalCost = vehicleData.totalCost || 0;

                        return (
                          <tr key={subEventVehicle.vehicleId} className={vIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="border border-gray-300 p-2 text-center font-bold text-gray-700">
                              {vIdx + 1}
                            </td>
                            <td className="border border-gray-300 p-2 font-medium text-sm">
                              {subEventVehicle.vehicleName}
                            </td>
                            <td className="border border-gray-300 p-2 text-center font-medium text-blue-700">
                              {subEventVehicle.quantity}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={actualQty}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  handleQuantityChange(subEvent.id, subEventVehicle.vehicleId, value);
                                }}
                                className="w-20 border-2 border-gray-300 rounded text-center p-1 outline-none font-semibold text-sm focus:border-blue-500"
                              />
                            </td>
                            <td className="border p-2 text-center">
                              <input
                                type="text"
                                inputMode="numeric"
                                value={totalCost}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9.]/g, '');
                                  handleTotalCostChange(subEvent.id, subEventVehicle.vehicleId, value);
                                }}
                                className="w-28 border-2 border-green-400 rounded text-center p-1 focus:ring-2 focus:ring-green-500 font-bold text-green-700 text-sm"
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {/* Grand Total Card */}
        {/* <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-xl border-1 border-green-800 p-6 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-2xl font-bold">GRAND TOTAL UTILIZATION COST</h3>
              <p className="text-green-100 text-sm mt-1">Total cost across all sub-events</p>
            </div>
            <div className="bg-white text-green-700 px-8 py-4 rounded-lg shadow-lg">
              <div className="text-4xl font-bold">
                ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {totalCost === 0 && (
                <div className="text-xs text-red-600 mt-1 text-center">
                  Zero Amount
                </div>
              )}
            </div>
          </div>
        </div> */}
        {/* Grand Total Card with Financial Summary */}
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              FINANCIAL SUMMARY
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
             
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900 uppercase">Advance Requested</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ₹{getTotalAdvanceRequested().toLocaleString('en-IN')}
                </p>
              </div>

            
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-900 uppercase">Advance Sanctioned</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  ₹{getTotalAdvanceSanctioned().toLocaleString('en-IN')}
                </p>
              </div>

            

              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border-l-4 border-orange-500">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-5 h-5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-900 uppercase">Utilization Cost</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  ₹{totalCost.toLocaleString('en-IN')}
                </p>
                {totalCost === 0 && (
                  <span className="text-xs text-red-600 mt-1 block">Zero Amount</span>
                )}
              </div>
            </div>

            
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-center">
              <p className="text-green-100 text-sm font-semibold uppercase mb-2">Grand Total Utilization Cost</p>
              <p className="text-5xl font-bold text-white">
                ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

          
            {advancePayments.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-blue-900">
                    Balance after Advance:
                  </span>
                  <span className="font-bold text-blue-700">
                    ₹{(totalCost - getTotalAdvanceSanctioned()).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-center gap-6">
            <button
              onClick={handleSubmit}
              disabled={submitting || (advancePayments.length > 0 && !checkAdvancePaymentConditions())}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-green-800 font-bold text-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'SUBMITTING...' : 'SUBMIT UTILIZATION'}
            </button>

            <button
             onClick={() => navigate("/rto/dashboard")}
              disabled={submitting}
              className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-lg hover:from-gray-700 hover:to-gray-800 font-bold text-lg shadow-lg transform transition-all hover:scale-105 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
              CANCEL
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Enter the actual quantities used and costs incurred for each vehicle type.
              You can enter zero if vehicles were not used. Once submitted, the utilization will be sent for approval.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdvancePaymentModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        advancePayments={advancePayments}
        eventName={event.name}
      />

      <ZeroAmountModal
        isOpen={showZeroAmountModal}
        onClose={() => setShowZeroAmountModal(false)}
        onConfirm={() => {
          setShowZeroAmountModal(false);
          submitUtilization();
        }}
        onDeleteEvent={handleDeleteEvent}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteEvent}
        eventName={event.name}
      />

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>© Government of Odisha – Commerce & Transport Department | Vehicle Utilization Management System</p>
        <p className="text-xs opacity-75 mt-1">For assistance, contact: transport@odisha.gov.in</p>
      </div>
    </div>
  );
}

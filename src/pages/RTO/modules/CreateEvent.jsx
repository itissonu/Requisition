import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, File, Plus, Trash2, MapPin, Calendar, Clock, ChevronDown, Building, Edit2, X, CloudCog } from "lucide-react";

import logo from '../../../assests/logo.png';
import { eventAPI, requestEventAPI, vehicleAPI } from "../../../apis/apiService";
import EventUtilizationPDFViewer from "./EventUtilizationPDFViewer";

const subEventSchema = z.object({
  place: z.string().min(2, "Place is required"),
  reportingDate: z.string().min(1, "Reporting date is required"),
  startTime: z.string().min(1, "Start time is required"),
  vehicles: z.array(z.object({
    vehicleId: z.number(),
    quantity: z.number().min(0, "Quantity must be 0 or more")
  }))
});

const eventSchema = z.object({
  requestEventId: z.string().min(1, "Please select a requesting event"),
  reportingDepartment: z.string().min(1, "Reporting department is required"),
});

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [subEvents, setSubEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentSubEvent, setCurrentSubEvent] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [createdEvent, setCreatedEvent] = useState(null);


  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(eventSchema),
  });

  const {
    register: registerSubEvent,
    handleSubmit: handleSubmitSubEvent,
    control: controlSubEvent,
    formState: { errors: errorsSubEvent },
    reset: resetSubEvent,
    setValue: setValueSubEvent,
    watch: watchSubEvent
  } = useForm({
    resolver: zodResolver(subEventSchema),
  });

  useEffect(() => {
    fetchRequests();
    fetchVehicles();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await requestEventAPI.list();
      const filtereddata = response.data.filter(request => request.status !== "APPROVED");
      setRequests(filtereddata);

      console.log("Fetched requests:", filtereddata);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      alert("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const vehiclesResponse = await vehicleAPI.list();
      const vehiclesData = vehiclesResponse.data;
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      alert('Failed to load vehicles. Please try again.');
    }
  };

  const openModal = (index = null) => {
    if (index !== null) {

      setEditingIndex(index);
      const subEvent = subEvents[index];
      setValueSubEvent('place', subEvent.place);
      setValueSubEvent('reportingDate', subEvent.reportingDate);
      setValueSubEvent('startTime', subEvent.startTime);
      // setValueSubEvent('vehicles', subEvent.vehicles);
      const mappedVehicles = vehicles.map(vehicle => {
        const existingVehicle = subEvent.vehicles.find(v => v.vehicleId === vehicle.id);
        return {
          vehicleId: vehicle.id,
          quantity: existingVehicle ? existingVehicle.quantity : 0
        };
      });
      console.log("Mapped Vehicles for Modal:", mappedVehicles);
      setValueSubEvent('vehicles', mappedVehicles);


      setCurrentSubEvent(subEvent);
    } else {
      // Creating new sub-event
      setEditingIndex(null);
      resetSubEvent({
        place: "",
        reportingDate: "",
        startTime: "",
        vehicles: vehicles.map(vehicle => ({
          vehicleId: vehicle.id,
          quantity: 0
        }))
      });
      setCurrentSubEvent(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIndex(null);
    setCurrentSubEvent(null);
    resetSubEvent();
  };

  const onSubmitSubEvent = (data) => {
    if (editingIndex !== null) {
      // Update existing sub-event
      const updatedSubEvents = [...subEvents];
      updatedSubEvents[editingIndex] = data;
      setSubEvents(updatedSubEvents);
    } else {
      // Add new sub-event
      setSubEvents([...subEvents, data]);
    }
    closeModal();
  };

  const deleteSubEvent = (index) => {
    if (window.confirm('Are you sure you want to delete this sub-event?')) {
      const updatedSubEvents = subEvents.filter((_, i) => i !== index);
      setSubEvents(updatedSubEvents);
    }
  };

  const updateVehicleQuantity = (vehicleId, quantity) => {
    const currentVehicles = watchSubEvent('vehicles') || [];
    const updatedVehicles = currentVehicles.map(v =>
      v.vehicleId === vehicleId ? { ...v, quantity: parseInt(quantity) || 0 } : v
    );
    setValueSubEvent('vehicles', updatedVehicles);
  };

  const onSubmit = async (data) => {
    console.log("Form submitted! Raw data:", data);

    if (subEvents.length === 0) {
      alert('Please add at least one sub-event.');
      return;
    }

    setLoading(true);

    try {
      const filteredSubEvents = subEvents.map(subEvent => ({
        ...subEvent,
        vehicles: subEvent.vehicles.filter(v => v.quantity > 0)
      })).filter(subEvent => subEvent.vehicles.length > 0);

      console.log("Filtered sub-events:", filteredSubEvents);

      if (filteredSubEvents.length === 0) {
        alert('Please select at least one vehicle for at least one sub-event.');
        setLoading(false);
        return;
      }

      const eventData = {
        requestEventId: parseInt(data.requestEventId),
        requestingDepartment: data.reportingDepartment,
        subEvents: filteredSubEvents
      };

      console.log("Event data to be sent:", eventData);

      const response = await eventAPI.create(eventData);

      console.log('Event created successfully:', response.data);
      alert('Event created successfully!');
      resetForm();

      console.log(response.data, "response.data");
      setCreatedEvent(response.data);
      setPdfOpen(true);


    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to create event. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    reset();
    setSubEvents([]);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header section */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
              <h2 className="text-base opacity-90">Commerce & Transport (Transport) Department</h2>
            </div>
          </div>
          <div className="text-center border-t border-blue-700 pt-3">
            <h3 className="text-lg font-semibold tracking-wide">VEHICLE REQUISITION APPLICATION</h3>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          {/* Event Details */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-700">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <File className="text-blue-700 font-bold text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ChevronDown className="inline w-4 h-4 mr-1" />
                  Select Requesting Event <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="requestEventId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-3  focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="">Select a requesting event</option>
                      {requests.map(request => (
                        <option key={request.id} value={request.id}>
                          {request.letterName}  (letterNo - {request.letterNo})
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.requestEventId && (
                  <p className="text-red-500 text-sm mt-1">{errors.requestEventId.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-1" />
                  Reporting Department <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("reportingDepartment")}
                  type="text"
                  placeholder="Enter reporting department"
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.reportingDepartment && (
                  <p className="text-red-500 text-sm mt-1">{errors.reportingDepartment.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Events Cards Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="text-green-700 font-bold text-lg" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Sub-Events & Vehicle Requirements</h3>
              </div>
              <button
                type="button"
                onClick={() => openModal()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Sub-Event
              </button>
            </div>

            {/* Sub-Events Cards */}
            {subEvents.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No sub-events added yet. Click "Add Sub-Event" to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subEvents.map((subEvent, index) => {
                  const totalVehicles = subEvent.vehicles.reduce((sum, v) => sum + v.quantity, 0);
                  return (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-2">
                            {index + 1}
                          </div>
                          <h4 className="font-bold text-gray-800">Sub-Event #{index + 1}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openModal(index)}
                            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSubEvent(index)}
                            className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Place:</span>
                          <span className="ml-2">{subEvent.place}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Date:</span>
                          <span className="ml-2">{subEvent.reportingDate}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Clock className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Time:</span>
                          <span className="ml-2">{subEvent.startTime}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Car className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-semibold">Total Vehicles:</span>
                          <span className="ml-2 font-bold text-green-600">{totalVehicles}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-10 py-4 rounded-lg hover:from-blue-800 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                {loading ? " SUBMITTING..." : "SUBMIT REQUISITION"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-10 py-4 rounded-lg hover:from-gray-700 hover:to-gray-800 font-bold text-base shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                ↺ RESET FORM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-3" />
                <h3 className="text-xl font-bold">
                  {editingIndex !== null ? `Edit Sub-Event #${editingIndex + 1}` : 'Add New Sub-Event'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 hover:bg-green-800 rounded-lg transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-6">
                {/* Sub-event Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Place <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...registerSubEvent('place')}
                      placeholder="Enter place/location"
                      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    {errorsSubEvent.place && (
                      <p className="text-red-500 text-sm mt-1">{errorsSubEvent.place.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...registerSubEvent('reportingDate')}
                      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    {errorsSubEvent.reportingDate && (
                      <p className="text-red-500 text-sm mt-1">{errorsSubEvent.reportingDate.message}</p>
                    )}
                  </div>

                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Event Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      {...registerSubEvent('startTime')}
                      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                    {errorsSubEvent.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errorsSubEvent.startTime.message}</p>
                    )}
                  </div> */}
                </div>

                {/* Vehicle Requirements - Excel Style */}
                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
                    <h5 className="font-bold flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Vehicle Requirements
                    </h5>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="p-3 text-center font-bold text-gray-700 border-r border-gray-300 w-20">Sl. No.</th>
                          <th className="p-3 text-left font-bold text-gray-700 border-r border-gray-300">Vehicle Type</th>
                          <th className="p-3 text-center font-bold text-gray-700 w-40">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((vehicle, vehicleIndex) => (
                          <tr key={vehicle.id} className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                            <td className="p-2 text-center font-semibold text-gray-700 border-r border-gray-200 bg-gray-50">
                              {vehicleIndex + 1}
                            </td>
                            <td className="p-2 text-gray-800 border-r border-gray-200">
                              <div className="font-medium">{vehicle.name}</div>
                            </td>
                            <td className="p-2 text-center">
                              {/* <Controller
                                name={`vehicles.${vehicleIndex}.quantity`}
                                control={controlSubEvent}
                                render={({ field }) => (
                                 
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    {...field}
                                    value={vehicle?.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      updateVehicleQuantity(vehicle.id, value);
                                    }}
                                    className="w-24 text-center border-2 border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold transition-all"
                                  />
                                )}
                              /> */}

                              <Controller
                                name={`vehicles.${vehicleIndex}.quantity`}
                                control={controlSubEvent}
                                render={({ field }) => (
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    value={field.value || ''}  
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/[^0-9]/g, '');
                                      const numValue = value === '' ? '' : parseInt(value, 10);
                                      field.onChange(numValue);  
                                      updateVehicleQuantity(vehicle.id, numValue);
                                    }}
                                    className="w-24 text-center border-2 border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-semibold transition-all"
                                  />
                                )}
                              />

                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 rounded-b-xl flex justify-end gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSubEvent(onSubmitSubEvent)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold transition-all"
              >
                {editingIndex !== null ? 'Update Sub-Event' : 'Add Sub-Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      <EventUtilizationPDFViewer
        eventData={createdEvent}
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
      />


      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 mt-12 shadow-lg">
        <p className="text-center text-sm">
          © Government of Odisha - Commerce & Transport Department | Vehicle Requisition System
        </p>
        <p className="text-center text-xs opacity-75 mt-1">
          For assistance, contact: transport@odisha.gov.in
        </p>
      </div>
    </div>
  );
}
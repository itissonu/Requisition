import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, File, Upload, User } from "lucide-react";

import logo from '../../../assests/logo.png';
import { eventAPI, userAPI, vehicleAPI } from "../../../apis/apiService";

const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(100, "Event name must be less than 100 characters"),
  requestingDepartment: z.string().min(1, "Requesting department is required"),
  collectorId: z.string().min(1, "Please select a collector"),
  dateOfReporting: z.string().min(1, "Date of reporting is required"),
  dateOfRelease: z.string().min(1, "Date of release is required"),
  vehicles: z.array(z.object({
    vehicleId: z.number(),
    quantity: z.number().min(0, "Quantity must be 0 or more")
  })), 
  letterFile: z.any().optional()
});

export default function CreateEvent() {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [vehicleQuantities, setVehicleQuantities] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      vehicles: []
    }
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
      
        const vehiclesResponse = await vehicleAPI.list();
        const vehiclesData = vehiclesResponse.data;
        setVehicles(vehiclesData);
        console.log(vehiclesData,"vehiclesData");
        
      
        const initialQuantities = vehiclesData.reduce((acc, vehicle) => ({ 
          ...acc, 
          [vehicle.id]: 0 
        }), {});
        setVehicleQuantities(initialQuantities);
        
     
        setValue("vehicles", vehiclesData.map(vehicle => ({ 
          vehicleId: vehicle.id, 
          quantity: 0 
        })));

      
        const collectorsResponse = await userAPI.getUsersByRole('COLLECTOR');
        setCollectors(collectorsResponse.data);
        console.log(collectorsResponse.data,'collectors');

      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load required data. Please try again.');
      }
    };

    fetchData();
  }, [setValue]);

  const updateVehicleQuantity = (vehicleId, quantity) => {
    const newQuantities = { ...vehicleQuantities, [vehicleId]: quantity };
    setVehicleQuantities(newQuantities);
    
    const vehiclesArray = vehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      quantity: newQuantities[vehicle.id] || 0
    }));
    setValue("vehicles", vehiclesArray);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
     
      const selectedVehicles = data.vehicles.filter(v => v.quantity > 0);
      
      if (selectedVehicles.length === 0) {
        alert('Please select at least one vehicle.');
        setLoading(false);
        return;
      }

   
      const eventData = {
        name: data.name,
        requestingDepartment: data.requestingDepartment,
        collectorId: parseInt(data.collectorId),
        dateOfReporting: data.dateOfReporting,
        dateOfRelease: data.dateOfRelease,
        vehicles: selectedVehicles
      };

      //  FormData for multipart request
      const formData = new FormData();
      formData.append('eventData', JSON.stringify(eventData));
      
      if (selectedFile) {
        formData.append('letterPdf', selectedFile);
      } else {
        alert('Please select a supporting letter PDF.');
        setLoading(false);
        return;
      }

     
      const response = await eventAPI.create(formData);

      console.log('Event created successfully:', response.data);
      alert('Event created successfully!');
      
      // Reset form
      resetForm();
      
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data || 'Failed to create event. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size should be less than 10MB.');
        e.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(onSubmit)(e);
  };

  const resetForm = () => {
    reset();
    setSelectedFile(null);
    setVehicleQuantities(vehicles.reduce((acc, vehicle) => ({ 
      ...acc, 
      [vehicle.id]: 0 
    }), {}));
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4">
              <img
                src={logo}
                alt="Odisha Logo"
                className="w-14 h-14 object-contain"
              />
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
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-700">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <File className="text-blue-700 font-bold text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Event Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter event name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"> </span>{errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Requesting Department <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("requestingDepartment")}
                  type="text"
                  placeholder="Enter requesting department"
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {errors.requestingDepartment && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"> </span>{errors.requestingDepartment.message}
                  </p>
                )}
              </div>
            </div>

            {/* Collector Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline mr-1" />
                Select Collector <span className="text-red-500">*</span>
              </label>
              <Controller
                name="collectorId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full border-2 border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select a collector</option>
                    {collectors.map(collector => (
                      <option key={collector?.id} value={collector?.id}>
                        {collector.fullName} - {collector?.district}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.collectorId && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1"> </span>{errors.collectorId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Reporting <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dateOfReporting")}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {errors.dateOfReporting && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"> </span>{errors.dateOfReporting.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Release <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dateOfRelease")}
                  className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {errors.dateOfRelease && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <span className="mr-1"> </span>{errors.dateOfRelease.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Upload className="inline mr-1" /> Upload Supporting Letter (PDF) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              />
              {selectedFile && (
                <p className="text-green-600 text-sm mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="text-sm text-gray-600 mt-2 italic">
                Upload supporting documentation for this requisition (Max: 10MB)
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-600">
            <div className="flex items-center mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Car className="text-green-700 font-bold text-lg" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Vehicle Requirements</h3>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-400">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Instructions:</span> Enter the quantity required for each vehicle type. Leave as 0 for vehicles not needed.
              </p>
            </div>

            {vehicles.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border-2 border-gray-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <th className="p-4 text-left font-semibold border-r border-blue-500">Sl. No.</th>
                      <th className="p-4 text-left font-semibold border-r border-blue-500">Vehicle Type</th>
                      <th className="p-4 text-right font-semibold border-r border-blue-500">Rate/Day (₹)</th>
                      <th className="p-4 text-center font-semibold">Quantity Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle, index) => (
                      <tr key={vehicle.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}>
                        <td className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200">
                          {index + 1}
                        </td>
                        <td className="p-4 text-gray-800 border-r border-gray-200">
                          <div className="font-medium">{vehicle.name}</div>
                        </td>
                        <td className="p-4 text-right text-gray-700 border-r border-gray-200">
                          ₹{vehicle.ratePerDay?.toLocaleString('en-IN') || 'N/A'}
                        </td>
                        <td className="p-4 text-center border-gray-200">
                          <input
                            type="number"
                            min="0"
                            value={vehicleQuantities[vehicle.id] || 0}
                            onChange={(e) => updateVehicleQuantity(vehicle.id, parseInt(e.target.value) || 0)}
                            className="w-24 text-center border-2 border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading vehicles...</p>
              </div>
            )}
            {errors.vehicles && <p className="text-red-500 text-sm mt-2">{errors.vehicles.message}</p>}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleFormSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-10 py-4 rounded-lg hover:from-blue-800 hover:to-blue-900 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base shadow-lg transform transition-all hover:scale-105 active:scale-95"
              >
                {loading ? "⏳ SUBMITTING..." : "✓ SUBMIT REQUISITION"}
              </button>

              <button
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

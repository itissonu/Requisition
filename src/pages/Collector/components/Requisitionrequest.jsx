import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, CheckCircle, User, Hash, Send, AlertCircle, Shield, House, HousePlug, Landmark, Tag } from "lucide-react";
import { userAPI, requestEventAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';
const letterSchema = z.object({
  letterName: z
    .string()
    .min(1, "Event name is required")
    .max(100, "Must be less than 100 characters"),
  requestedOffice: z
    .string()
    .min(1, "Requested Office Name is required")
    .max(100, "Must be less than 100 characters"),
  letterNo: z.string().min(1, "Letter number is required"),
  rtoUserId: z.string().min(1, "RTO selection is required"),
  letterFile: z
    .any()
    .refine(files => files?.length === 1, "PDF file is required")
    .refine(files => files[0]?.type === "application/pdf", "Only PDF files are allowed")
    .refine(files => files[0]?.size <= 5_000_000, "File size must be less than 5MB"),
});

export default function UploadLetterToRTO() {
  const [rtos, setRtos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fetchingRtos, setFetchingRtos] = useState(true);
  const [autoSelectedRto, setAutoSelectedRto] = useState(null);
  const [showRtoDropdown, setShowRtoDropdown] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(letterSchema),
    defaultValues: {
      letterName: "",
      requestedOffice: "",
      letterNo: "",
      rtoUserId: "",
      letterFile: null,
    }
  });

  const file = watch("letterFile");


  
  useEffect(() => {
    const fetchRtos = async () => {
      try {
        setFetchingRtos(true);
        const response = await userAPI.getRtosInMyDistrict();
        const districtRtos = response.data;
        setRtos(districtRtos);

        if (districtRtos.length === 1) {
          const singleRto = districtRtos[0];
          setAutoSelectedRto(singleRto);
          setValue("rtoUserId", singleRto.id.toString());
          setShowRtoDropdown(false);
        } else if (districtRtos.length > 1) {
          setShowRtoDropdown(true);
          setAutoSelectedRto(null);
        } else {
          setShowRtoDropdown(false);
          setAutoSelectedRto(null);
        }
      } catch (error) {
        console.error("Failed to fetch RTOs:", error);
        alert("Failed to load RTOs for your district. Please try again.");
      } finally {
        setFetchingRtos(false);
      }
    };

    fetchRtos();
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("letterName", data.letterName);
    formData.append("requestedOffice", data.requestedOffice);
    formData.append("letterNo", data.letterNo);
    formData.append("rtoUserId", data.rtoUserId);
    formData.append("letterPdf", data.letterFile[0]);
    formData.append("status", "CREATED");



    try {
   
     await requestEventAPI.create(formData);
      setSuccess(true);
      reset({
        letterName: "",
        requestedOffice: "",
        letterNo: "",
        rtoUserId: autoSelectedRto ? autoSelectedRto.id.toString() : "",
        letterFile: null,
      });
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingRtos) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-3 h-16 bg-orange-500 animate-pulse"></div>
            <div className="w-3 h-16 bg-white animate-pulse mx-1"></div>
            <div className="w-3 h-16 bg-green-600 animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-700 font-semibold">Loading RTO information...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (rtos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-l-4 border-red-600 shadow-md p-8">
            <div className="flex items-start">
              <AlertCircle className="w-12 h-12 text-red-600 mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No RTO Found</h2>
                <p className="text-gray-600">
                  No RTO officers are available in your district. Please contact the administrator for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50">
      {/* Government Header */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>

      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                <h2 className="text-lg opacity-90">Commerce & Transport   Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide uppercase">create event for rto</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="bg-white border-l-4 border-blue-900 shadow-sm mb-6 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Event Request Submission Form
          </h2>
          <p className="text-gray-600">Submit vehicle requisition request to Regional Transport Officer</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-600 p-4 shadow-sm">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Request Submitted Successfully</p>
                <p className="text-sm text-green-700 mt-1">
                  Your event request has been forwarded to the RTO for processing. You will be notified of the status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
            <h3 className="font-semibold text-gray-900">Request Details</h3>
          </div>

          <div className="p-6 space-y-6">
            {/* RTO Selection */}
            {autoSelectedRto && !showRtoDropdown ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2 text-blue-900" />
                  Assigned Regional Transport Officer
                </label>
                <div className="bg-green-50 border border-green-300 p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-700 mr-3" />
                    <div>
                      {/* <p className="font-semibold text-gray-900">{autoSelectedRto.fullName}</p> */}
                      <p className="text-sm text-gray-600">{autoSelectedRto.district} RTO</p>
                    </div>
                  </div>
                </div>
                <input type="hidden" {...register("rtoUserId")} />
              </div>
            ) : showRtoDropdown ? (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2 text-blue-900" />
                  Select RTO
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <select
                  {...register("rtoUserId")}
                  className="w-full px-4 hover:cursor-pointer py-2.5 border border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 outline-none"
                >
                  <option value="">-- Please Select --</option>
                  {rtos.map((rto) => (
                    <option key={rto.id} value={rto.id}>
                     {rto?.rtoofficeName || "N/A"}
                    </option>
                  ))}
                </select>
                {errors.rtoUserId && (
                  <p className="text-red-600 text-sm mt-1.5">
                     {errors.rtoUserId.message}
                  </p>
                )}
              </div>
            ) : null}

            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2 text-blue-900" />
                Event Purpose
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                {...register("letterName")}
                placeholder="Enter the event purpose (e.g., Annual Cultural Festival Vehicle Requisition)"
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              {errors.letterName && (
                <p className="text-red-600 text-sm mt-1.5">
                   {errors.letterName.message}
                </p>
              )}
            </div>

            {/* Requested Office Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Landmark className="w-4 h-4 inline mr-2 text-blue-900" />
                Requested Office Name
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                {...register("requestedOffice")}
                placeholder="Enter the name of the requesting office (e.g., Police Department, Bhubaneswar)"
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              {errors.requestedOffice && (
                <p className="text-red-600 text-sm mt-1.5">
                   {errors.requestedOffice.message}
                </p>
              )}
            </div>

            {/* Letter Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2 text-blue-900" />
                Letter/Reference Number
                <span className="text-red-600 ml-1">*</span>
              </label>
              <input
                type="text"
                {...register("letterNo")}
                placeholder="Enter letter reference number "
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-200 outline-none"
              />
              {errors.letterNo && (
                <p className="text-red-600 text-sm mt-1.5">
                   {errors.letterNo.message}
                </p>
              )}
            </div>

            {/* PDF Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Upload className="w-4 h-4 inline mr-2 text-blue-900" />
                Upload Requesting Letter (PDF)
                <span className="text-red-600 ml-1">*</span>
              </label>
              <div className={`border-2 border-dashed p-8 text-center transition-colors ${file?.[0]
                ? "border-green-400 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-900 hover:bg-blue-50"
                }`}>
                <input
                  type="file"
                  accept="application/pdf"
                  {...register("letterFile")}
                  className="hidden"
                  id="letterFile"
                />
                <label htmlFor="letterFile" className="cursor-pointer block">
                  {file?.[0] ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle className="w-16 h-16 text-green-600 mb-3" />
                      <p className="font-semibold text-gray-900 text-lg">{file[0].name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Size: {(file[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-green-700 mt-2">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-blue-900 font-semibold text-lg">Click to Select PDF File</p>
                      <p className="text-gray-600 text-sm mt-2">
                        Accepted format: PDF only | Maximum size: 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              {errors.letterFile && (
                <p className="text-red-600 text-sm mt-1.5">
                  ⚠ {errors.letterFile.message}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className="flex-1 bg-blue-900 hover:cursor-pointer hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 px-6 
                         font-semibold shadow-md hover:shadow-lg transition-all duration-200 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => reset({
                  letterName: "",
                  letterNo: "",
                  rtoUserId: autoSelectedRto ? autoSelectedRto.id.toString() : "",
                  letterFile: null,
                })}
                disabled={loading}
                className="px-8 py-3 hover:cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 shadow-sm">
          <p className="text-sm text-gray-800">
            <strong className="text-yellow-800">Important:</strong> Please verify all information before submission.
            The request will be sent to  the selected RTO for  processing.
            Ensure that the uploaded PDF contains all required data.
          </p>
        </div>



      </div>
      {/* Footer */}
        <div className="bg-blue-900 text-white p-4 text-center text-sm mt-8">
        <p className="mb-2">Vehicles Requisition System</p>
        <p className="font-semibold">© 2025 Government of Odisha – Commerce & Transport Department</p>
        {/* <p className="text-xs opacity-75 mt-1">Approved Utilizations System | For assistance: transport@odisha.gov.in</p> */}
      </div>
    </div>
  );
}
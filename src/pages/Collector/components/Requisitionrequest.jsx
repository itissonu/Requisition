import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, CheckCircle, User, Calendar, Hash, Send } from "lucide-react";
import { userAPI,requestEventAPI } from "../../../apis/apiService";

const letterSchema = z.object({
  letterName: z
    .string()
    .min(1, "Letter name is required")
    .max(100, "Must be less than 100 characters"),
  letterNo: z.string().min(1, "Letter number is required"),
  dateOfNeed: z.string().refine(str => !isNaN(Date.parse(str)), "Valid date required"),
  rtoUserId: z.string().min(1, "Please select an RTO"),
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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(letterSchema),
       defaultValues: {
      letterName: "",
      letterNo: "",
      dateOfNeed: "",
      rtoUserId: "",
      letterFile: null,
    }
  });
  
  const file = watch("letterFile");

  useEffect(() => {
    const fetchRtos = async () => {
      try {
        setFetchingRtos(true);
        const response = await userAPI.getUsersByRole('RTO');
        setRtos(response.data);
      } catch (error) {
        console.error("Failed to fetch RTOs:", error);
        alert("Failed to load RTOs. Please try again.");
      } finally {
        setFetchingRtos(false);
      }
    };
    
    fetchRtos();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append("letterName", data.letterName);
    formData.append("letterNo", data.letterNo);
    formData.append("dateOfNeed", data.dateOfNeed);
    formData.append("rtoUserId", data.rtoUserId);
    formData.append("letterPdf", data.letterFile[0]);
    formData.append("status", "CREATED");

    try {
      await requestEventAPI.create(formData);
      setSuccess(true);
     reset({
        letterName: "",
        letterNo: "",
        dateOfNeed: "",
        rtoUserId: "",
        letterFile: null, // Resetting the file input
      });
      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Letter to RTO
              </h2>
              <p className="text-gray-600 text-sm">Submit your requisition request</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-center">
            <CheckCircle className="mr-3 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Letter uploaded successfully!</p>
              <p className="text-sm">Your request has been submitted to the RTO.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                Select RTO
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select 
                {...register("rtoUserId")}
                disabled={fetchingRtos}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all disabled:bg-gray-100"
              >
                <option value="">
                  {fetchingRtos ? "Loading RTOs..." : "-- Select RTO --"}
                </option>
                {rtos.map((rto) => (
                  <option key={rto.id} value={rto.id}>
                    {rto.fullName} - {rto.district || "N/A"}
                  </option>
                ))}
              </select>
              {errors.rtoUserId && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.rtoUserId.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                Letter Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                {...register("letterName")}
                placeholder="e.g., Vehicle Requisition for Annual Event"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
              {errors.letterName && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.letterName.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4 mr-2 text-blue-600" />
                Letter Number
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                {...register("letterNo")}
                placeholder="e.g., RTO/2025/001"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
              {errors.letterNo && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.letterNo.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                Date of Need
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input 
                type="date" 
                {...register("dateOfNeed")}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
              {errors.dateOfNeed && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.dateOfNeed.message}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Upload className="w-4 h-4 mr-2 text-blue-600" />
                Upload Letter PDF
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                file?.[0] 
                  ? "border-green-400 bg-green-50" 
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
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
                    <div className="flex flex-col items-center text-green-700">
                      <CheckCircle className="w-12 h-12 mb-2" />
                      <p className="font-semibold">{file[0].name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {(file[0].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-blue-600 font-medium">Click to upload PDF</p>
                      <p className="text-gray-500 text-sm mt-1">Maximum file size: 5MB</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.letterFile && (
                <p className="text-red-600 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠</span> {errors.letterFile.message}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || fetchingRtos}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                         disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-xl font-semibold 
                         shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] 
                         active:scale-95 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Letter
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => reset()}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Make sure all information is correct before submitting. 
            The letter will be sent to the selected RTO for approval.
          </p>
        </div>
      </div>
    </div>
  );
}
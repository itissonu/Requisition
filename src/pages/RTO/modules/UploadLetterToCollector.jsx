import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, CheckCircle } from "lucide-react";

// Demo collectors data
const demoCollectors = [
  { value: 1, label: "John Collector - Delhi District" },
  { value: 2, label: "Priya Collector - Mumbai District" },
  { value: 3, label: "Raj Collector - Bangalore District" },
  { value: 4, label: "Amit Collector - Chennai District" },
];

// Simplified validation schema
const letterSchema = z.object({
  letterName: z.string().min(1, "Letter name is required").max(100, "Letter name must be less than 100 characters"),
  collectorId: z.number().min(1, "Please select a collector"),
  letterFile: z.any().refine((files) => files?.length === 1, "PDF file is required")
    .refine((files) => files?.[0]?.type === "application/pdf", "Only PDF files are allowed")
    .refine((files) => files?.[0]?.size <= 5000000, "File size must be less than 5MB"),
});

export default function UploadLetterToCollector() {
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(letterSchema)
  });

  const selectedFile = watch("letterFile");

  const onSubmit = async (data) => {
    setLoading(true);
    console.log("Letter Upload Data:", data);
    
    // Simulate API call
    setTimeout(() => {
      setUploadSuccess(true);
      setLoading(false);
      reset();
      
      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Upload Letter to Collector</h2>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Letter uploaded successfully and sent to collector!
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Letter Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Letter Name *</label>
          <input
            {...register("letterName")}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter letter name"
          />
          {errors.letterName && <p className="text-red-500 text-sm mt-1">{errors.letterName.message}</p>}
        </div>

        {/* Collector Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Collector *</label>
          <select
            {...register("collectorId", { valueAsNumber: true })}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a collector</option>
            {demoCollectors.map((collector) => (
              <option key={collector.value} value={collector.value}>
                {collector.label}
              </option>
            ))}
          </select>
          {errors.collectorId && <p className="text-red-500 text-sm mt-1">{errors.collectorId.message}</p>}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Upload PDF Letter *</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    {...register("letterFile")}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PDF up to 5MB</p>
              
              {selectedFile && selectedFile[0] && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                  <FileText className="w-4 h-4" />
                  {selectedFile[0].name}
                </div>
              )}
            </div>
          </div>
          {errors.letterFile && <p className="text-red-500 text-sm mt-1">{errors.letterFile.message}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Letter
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => reset()}
            className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

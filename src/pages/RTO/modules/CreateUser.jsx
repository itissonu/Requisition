import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Lock, MapPin, Building, FileText, Mail, Phone, Shield } from "lucide-react";
import { userAPI } from "../../../apis/apiService";

// Define the schema with all possible fields as optional strings or null,
// then use superRefine for conditional requirements.
const userSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["RTO", "COLLECTOR", "COMMISSIONER"], {
    required_error: "Please select a role"
  }),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeId: z.string().optional().or(z.literal("")),
  designation: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")), // Made optional at base
  state: z.string().min(1, "State is required"), // Always required
  rtoCode: z.string().optional().or(z.literal("")),
  rtoOfficeName: z.string().optional().or(z.literal("")),
  officeAddress: z.string().optional().or(z.literal("")),
  districtCode: z.string().optional().or(z.literal("")),
  jurisdiction: z.string().optional().or(z.literal("")),
  collectorateAddress: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  // Conditional requirements based on role
  if (data.role === "RTO" || data.role === "COLLECTOR") {
    if (!data.district || data.district.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "District is required for RTO and Collector roles",
        path: ["district"],
      });
    }
    // Add other conditional requirements here if needed for RTO/Collector specific fields
    // e.g., if (data.role === "RTO" && (!data.rtoCode || data.rtoCode.trim() === "")) { ... }
  }
  // Commissioner role does NOT require district or any of the specific details
});


export default function CreateUser() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    clearErrors,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      state: "Odisha",
      role: "", // Initialize role to empty
      // Explicitly set other optional fields to empty string to avoid undefined
      fullName: "", mobile: "", email: "", username: "", password: "",
      employeeId: "", designation: "", district: "",
      rtoCode: "", rtoOfficeName: "", officeAddress: "",
      districtCode: "", jurisdiction: "", collectorateAddress: "",
    }
  });

  const selectedRole = watch("role");

  // Effect to manage step navigation and clear role-specific fields
  useEffect(() => {
    // When role changes, navigate to appropriate step and clear irrelevant fields
    if (selectedRole) {
      setCurrentStep(2); // Move to Basic Info once role is selected
    } else {
      setCurrentStep(1); // Back to Role selection if role is cleared
    }

    // Clear role-specific fields based on the selected role
    // This helps prevent sending irrelevant data and stale validation errors
    if (selectedRole === "COMMISSIONER") {
      setValue("district", ""); clearErrors("district");
      setValue("designation", ""); // Commissioner doesn't need designation per new requirement
      setValue("rtoCode", ""); setValue("rtoOfficeName", ""); setValue("officeAddress", "");
      setValue("districtCode", ""); setValue("jurisdiction", ""); setValue("collectorateAddress", "");
    } else if (selectedRole === "RTO") {
      setValue("districtCode", ""); setValue("jurisdiction", ""); setValue("collectorateAddress", "");
      // Keep RTO specific fields, but clear Collector specific ones
    } else if (selectedRole === "COLLECTOR") {
      setValue("rtoCode", ""); setValue("rtoOfficeName", ""); setValue("officeAddress", "");
      // Keep Collector specific fields, but clear RTO specific ones
    }
    // No role selected
    if (!selectedRole) {
        // Clear all role-specific fields if no role is selected
        setValue("district", ""); clearErrors("district");
        setValue("designation", "");
        setValue("rtoCode", ""); setValue("rtoOfficeName", ""); setValue("officeAddress", "");
        setValue("districtCode", ""); setValue("jurisdiction", ""); setValue("collectorateAddress", "");
    }

  }, [selectedRole, setValue, clearErrors]);


  const onSubmit = async (data) => {
    setLoading(true);

    try {
      // Filter out fields that are empty strings and are not conditionally required
      // Convert remaining empty strings to null for API if needed.
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // Keep if value is not an empty string or null
          // OR if it's a required field by the schema regardless of role (like fullName, mobile)
          // OR if it's conditionally required for the current role (handled by superRefine and errors)
          if (value === "" || value === null) {
              // Check if this field is required for the *current* role by Zod's internal state.
              // A simpler way: if the field has an error, it means it was required and empty.
              // Otherwise, if it's an empty optional field, we can filter it out.
              const isRequiredAndEmpty = errors[key] && (value === "" || value === null);
              if (!isRequiredAndEmpty) {
                  // Filter out optional empty fields
                  // Also, for Commissioner, 'district' and 'designation' should be filtered if empty
                  if (selectedRole === "COMMISSIONER" && (key === "district" || key === "designation")) {
                      return false;
                  }
                  if (selectedRole === "RTO" && (key.startsWith("districtCode") || key.startsWith("jurisdiction") || key.startsWith("collectorateAddress"))) {
                      return false;
                  }
                  if (selectedRole === "COLLECTOR" && (key.startsWith("rtoCode") || key.startsWith("rtoOfficeName") || key.startsWith("officeAddress"))) {
                      return false;
                  }
              }
          }
          return true;
        }).map(([key, value]) => [key, value === "" ? null : value]) 
      );
      
      

      let result;

      if (cleanedData.role === "RTO") { 
        result = await userAPI.registerRto(cleanedData);
      } else if (cleanedData.role === "COLLECTOR") {
        result = await userAPI.registerCollector(cleanedData);
      } else if (cleanedData.role === "COMMISSIONER") {
        result = await userAPI.registerCommissioner(cleanedData);
      } else {
        throw new Error("Invalid role selected");
      }

      
      alert(`${cleanedData.role} user created successfully!\n\nUser: ${result.data.fullName}\nMobile: ${result.data.mobile}`);
      reset({ state: "Odisha", role: "" }); 
      setCurrentStep(1);
      
    } catch (err) {
      console.error("Error creating user:", err);
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Failed to create user";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Role", icon: <Shield size={18} /> },
    { num: 2, title: "Basic Info", icon: <User size={18} /> },
    { num: 3, title: "Credentials", icon: <Lock size={18} /> },
    // Only show Location and Details steps if not Commissioner
    ...(selectedRole !== "COMMISSIONER" ? [{ num: 4, title: "Location", icon: <MapPin size={18} /> }] : []),
    ...(selectedRole === "RTO" || selectedRole === "COLLECTOR" ? [{ num: 5, title: "Details", icon: <Building size={18} /> }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-10 p-3 rounded-xl">
              <Building className="text-white" size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
              <p className="text-blue-200 text-sm">Commerce & Transport Department</p>
              <p className="text-blue-300 text-xs mt-1 font-semibold">USER REGISTRATION PORTAL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep >= step.num 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-2 font-medium hidden md:block ${
                    currentStep >= step.num ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
            <h2 className="text-3xl font-bold">Create New User Account</h2>
            <p className="text-blue-100 mt-2">Fill in the details below to register a new user</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Step 1: Select User Role */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-blue-900">Select User Role</h3>
              </div>
              <select
                {...register("role")}
                onChange={(e) => {
                    setValue("role", e.target.value); // Manually set value for watch to pick up immediately
                    clearErrors("role"); // Clear role error if selected
                }}
                className="w-full border-2 border-blue-300 p-4 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 font-medium text-lg"
              >
                <option value="">-- Select Role --</option>
                <option value="RTO">RTO (Regional Transport Officer)</option>
                <option value="COLLECTOR">Collector</option>
                <option value="COMMISSIONER">Commissioner</option>
              </select>
              {errors.role && <p className="text-red-600 text-sm mt-2 font-semibold">{errors.role.message}</p>}
            </div>

            {/* Step 2: Basic Information (Always visible if a role is selected) */}
            {selectedRole && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <User className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name *</label>
                    <input
                      {...register("fullName")}
                      onFocus={() => setCurrentStep(2)}
                      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="Enter full name"
                    />
                    {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Mobile No *</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        {...register("mobile")}
                        className="w-full border-2 border-gray-300 p-3 pl-10 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="email"
                        {...register("email")}
                        className="w-full border-2 border-gray-300 p-3 pl-10 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Employee ID</label>
                    <input
                      {...register("employeeId")}
                      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="Employee ID"
                    />
                     {errors.employeeId && <p className="text-red-600 text-sm mt-1">{errors.employeeId.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Login Credentials (Always visible if a role is selected) */}
            {selectedRole && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-600 p-2 rounded-lg">
                    <Lock className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Login Credentials</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Username *</label>
                    <input
                      {...register("username")}
                      onFocus={() => setCurrentStep(3)}
                      className="w-full border-2 border-amber-300 p-3 rounded-lg focus:ring-4 focus:ring-amber-200 focus:border-amber-500"
                      placeholder="Create username"
                    />
                    {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Password *</label>
                    <input
                      type="password"
                      {...register("password")}
                      className="w-full border-2 border-amber-300 p-3 rounded-lg focus:ring-4 focus:ring-amber-200 focus:border-amber-500"
                      placeholder="Minimum 6 characters"
                    />
                    {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location Details (Visible for RTO and Collector) */}
            {(selectedRole === "RTO" || selectedRole === "COLLECTOR") && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-600 p-2 rounded-lg">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Location Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">District *</label>
                    <input
                      {...register("district")}
                      onFocus={() => setCurrentStep(4)}
                      className="w-full border-2 border-emerald-300 p-3 rounded-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="Enter district"
                    />
                    {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">State *</label>
                    <input
                      {...register("state")}
                      className="w-full border-2 border-emerald-300 p-3 rounded-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="Enter state"
                    />
                    {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Designation</label>
                    <input
                      {...register("designation")}
                      className="w-full border-2 border-emerald-300 p-3 rounded-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500"
                      placeholder="Official designation"
                    />
                    {errors.designation && <p className="text-red-600 text-sm mt-1">{errors.designation.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: RTO Specific Details (Visible only for RTO) */}
            {selectedRole === "RTO" && (
              <div className="bg-gradient-to-br from-green-50 to-lime-50 p-6 rounded-xl border-2 border-green-300 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Building className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">RTO Specific Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">RTO Code</label>
                    <input
                      {...register("rtoCode")}
                      onFocus={() => setCurrentStep(5)}
                      className="w-full border-2 border-green-300 p-3 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500"
                      placeholder="RTO office code"
                    />
                    {errors.rtoCode && <p className="text-red-600 text-sm mt-1">{errors.rtoCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">RTO Office Name</label>
                    <input
                      {...register("rtoOfficeName")}
                      className="w-full border-2 border-green-300 p-3 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500"
                      placeholder="RTO office name"
                    />
                    {errors.rtoOfficeName && <p className="text-red-600 text-sm mt-1">{errors.rtoOfficeName.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Office Address</label>
                    <textarea
                      {...register("officeAddress")}
                      className="w-full border-2 border-green-300 p-3 rounded-lg focus:ring-4 focus:ring-green-200 focus:border-green-500"
                      placeholder="Complete office address"
                      rows={2}
                    />
                    {errors.officeAddress && <p className="text-red-600 text-sm mt-1">{errors.officeAddress.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Collector Specific Details (Visible only for Collector) */}
            {selectedRole === "COLLECTOR" && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-300 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Collector Specific Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">District Code</label>
                    <input
                      {...register("districtCode")}
                      onFocus={() => setCurrentStep(5)}
                      className="w-full border-2 border-purple-300 p-3 rounded-lg focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="District code"
                    />
                    {errors.districtCode && <p className="text-red-600 text-sm mt-1">{errors.districtCode.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Jurisdiction</label>
                    <input
                      {...register("jurisdiction")}
                      className="w-full border-2 border-purple-300 p-3 rounded-lg focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Jurisdiction area"
                    />
                    {errors.jurisdiction && <p className="text-red-600 text-sm mt-1">{errors.jurisdiction.message}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Collectorate Address</label>
                    <textarea
                      {...register("collectorateAddress")}
                      className="w-full border-2 border-purple-300 p-3 rounded-lg focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                      placeholder="Complete collectorate address"
                      rows={2}
                    />
                    {errors.collectorateAddress && <p className="text-red-600 text-sm mt-1">{errors.collectorateAddress.message}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || !selectedRole}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg"
              >
                {loading ? "Creating..." : "Create User"}
              </button>

              <button
                type="button"
                onClick={() => {
                  reset({ state: "Odisha", role: "" });
                  setCurrentStep(1);
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 font-bold text-lg shadow-lg"
              >
                Reset Form
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-4 mt-12">
        <p className="text-center text-sm">
          Government of Odisha - Commerce & Transport Department | User Registration System
        </p>
      </div>
    </div>
  );
}
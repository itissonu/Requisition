import React, { useState, useEffect } from "react";
import { Upload, Trash2, Edit2, Eye, X, Save } from "lucide-react";
import { districtStampAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function RTOStampSignatureProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingCollector, setEditingCollector] = useState(false);
  const [collectorFormData, setCollectorFormData] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [collectorInfo, setCollectorInfo] = useState({
    name: '',
    phoneNumber: '',
    stamp: null,
    signature: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
     
      const response = await districtStampAPI.getCurrent();
      console.log("Profile data:", response.data);
      setProfile(response.data);
      
   
      setCollectorInfo({
        name: response.data.collectorName || 'Not Assigned',
        phoneNumber: response.data.collectorPhoneNumber || 'N/A',
        stamp: response.data.collectorStamp ? `data:image/png;base64,${response.data.collectorStamp}` : null,
        signature: response.data.collectorSignature ? `data:image/png;base64,${response.data.collectorSignature}` : null
      });

      setCollectorFormData({
        fullName: response.data.collectorName || '',
        phoneNumber: response.data.collectorPhoneNumber || ''
      });
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectorStampUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    try {
      setSaving(true);
      const response = await districtStampAPI.uploadCollectorStamp(profile.districtName, file);
      setCollectorInfo({
        ...collectorInfo,
        stamp: `data:image/png;base64,${response.data.collectorStamp}`
      });
      alert("Collector stamp uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload stamp:", error);
      alert("Failed to upload stamp");
    } finally {
      setSaving(false);
    }
  };

  const handleCollectorSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    try {
      setSaving(true);
      const response = await districtStampAPI.uploadCollectorSignature(profile.districtName, file);
      setCollectorInfo({
        ...collectorInfo,
        signature: `data:image/png;base64,${response.data.collectorSignature}`
      });
      alert("Collector signature uploaded successfully!");
    } catch (error) {
      console.error("Failed to upload signature:", error);
      alert("Failed to upload signature");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollectorStamp = async () => {
    if (!window.confirm("Are you sure you want to delete collector's stamp?")) return;

    try {
      setSaving(true);
      await districtStampAPI.deleteCollectorStamp(profile.districtName);
      setCollectorInfo({
        ...collectorInfo,
        stamp: null
      });
      alert("Collector stamp deleted successfully!");
    } catch (error) {
      console.error("Failed to delete stamp:", error);
      alert("Failed to delete stamp");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCollectorSignature = async () => {
    if (!window.confirm("Are you sure you want to delete collector's signature?")) return;

    try {
      setSaving(true);
      await districtStampAPI.deleteCollectorSignature(profile.districtName);
      setCollectorInfo({
        ...collectorInfo,
        signature: null
      });
      alert("Collector signature deleted successfully!");
    } catch (error) {
      console.error("Failed to delete signature:", error);
      alert("Failed to delete signature");
    } finally {
      setSaving(false);
    }
  };

 

  const handleUpdateCollectorInfo = async () => {
  if (!profile?.districtName) {
    alert("District information not available");
    return;
  }

  try {
    setSaving(true);
    await districtStampAPI.updateCollectorInfo(profile.districtName, {
      fullName: collectorFormData.fullName,
      phoneNumber: collectorFormData.phoneNumber
    });
 
    setCollectorInfo({
      ...collectorInfo,
      name: collectorFormData.fullName,
      phoneNumber: collectorFormData.phoneNumber
    });
    
    alert("Collector information updated successfully!");
    setEditingCollector(false);
  } catch (error) {
    console.error("Failed to update collector info:", error);
    alert("Failed to update collector information");
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
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
            <h3 className="text-lg font-semibold tracking-wide">STAMP & SIGNATURE MANAGEMENT</h3>
            <p className="text-sm text-blue-200 mt-1">{profile?.districtName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Collector Information - Editable */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Collector Information & Credentials
            </h2>
            {!editingCollector && (
              <button
                onClick={() => setEditingCollector(true)}
                className="bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          <div className="p-6">
       
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  {editingCollector ? (
                    <input
                      type="text"
                      value={collectorFormData.fullName}
                      onChange={(e) => setCollectorFormData({ ...collectorFormData, fullName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-900">
                      {collectorInfo.name || 'Not set'}
                    </div>
                  )}
                </div>

              
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  {editingCollector ? (
                    <input
                      type="tel"
                      value={collectorFormData.phoneNumber}
                      onChange={(e) => setCollectorFormData({ ...collectorFormData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-lg font-medium text-gray-900">
                      {collectorInfo.phoneNumber || 'Not set'}
                    </div>
                  )}
                </div>
              </div>
            </div>

          
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collector Stamp & Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
               
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">Official Stamp</h4>
                  
                  {collectorInfo.stamp ? (
                    <div className="space-y-4">
                      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                        <img
                          src={collectorInfo.stamp}
                          alt="Collector Stamp"
                          className="max-h-40 object-contain"
                        />
                      </div>
                      {editingCollector && (
                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCollectorStampUpload}
                              className="hidden"
                              disabled={saving}
                            />
                            <div className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium">
                              Change
                            </div>
                          </label>
                          <button
                            onClick={handleDeleteCollectorStamp}
                            disabled={saving}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {editingCollector ? (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCollectorStampUpload}
                            className="hidden"
                            disabled={saving}
                          />
                          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium">Upload Stamp</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                          </div>
                        </label>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-sm">No stamp uploaded</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 text-center">Digital Signature</h4>
                  
                  {collectorInfo.signature ? (
                    <div className="space-y-4">
                      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                        <img
                          src={collectorInfo.signature}
                          alt="Collector Signature"
                          className="max-h-40 object-contain"
                        />
                      </div>
                      {editingCollector && (
                        <div className="flex gap-2">
                          <label className="flex-1 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCollectorSignatureUpload}
                              className="hidden"
                              disabled={saving}
                            />
                            <div className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium">
                              Change
                            </div>
                          </label>
                          <button
                            onClick={handleDeleteCollectorSignature}
                            disabled={saving}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {editingCollector ? (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCollectorSignatureUpload}
                            className="hidden"
                            disabled={saving}
                          />
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                            <Upload className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium">Upload Signature</p>
                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                          </div>
                        </label>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <p className="text-sm">No signature uploaded</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

          
            {editingCollector && (
              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={handleUpdateCollectorInfo}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setEditingCollector(false)}
                  disabled={saving}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Search, Eye, CheckCircle, XCircle, IndianRupee, FileText, Calendar, MapPin, Car } from "lucide-react";
import logo from '../../../assests/logo.png';

// Demo data
const DEMO_UTILIZATIONS = [
  {
    id: 1,
    eventId: "EVT001",
    eventName: "State Transport Conference 2025",
    requestingDepartment: "Transport Department",
    totalAmount: 250000,
    sanctionedAmount: 0,
    status: "COMMISSIONER_APPROVED",
    completedDate: "2025-03-15"
  },
  {
    id: 2,
    eventId: "EVT002",
    eventName: "Road Safety Awareness Campaign",
    requestingDepartment: "Public Works Department",
    totalAmount: 180000,
    sanctionedAmount: 90000,
    status: "COMPLETED",
    completedDate: "2025-03-10"
  },
  {
    id: 3,
    eventId: "EVT003",
    eventName: "Vehicle Registration Drive",
    requestingDepartment: "RTO Office",
    totalAmount: 120000,
    sanctionedAmount: 120000,
    status: "COMPLETED",
    completedDate: "2025-03-08"
  },
  {
    id: 4,
    eventId: "EVT004",
    eventName: "Driver Training Workshop",
    requestingDepartment: "Transport Training Institute",
    totalAmount: 350000,
    sanctionedAmount: 0,
    status: "COMMISSIONER_APPROVED",
    completedDate: "2025-03-20"
  },
  {
    id: 5,
    eventId: "EVT005",
    eventName: "Public Transport Review Meeting",
    requestingDepartment: "Urban Transport Division",
    totalAmount: 95000,
    sanctionedAmount: 50000,
    status: "COMPLETED",
    completedDate: "2025-03-12"
  },
  {
    id: 6,
    eventId: "EVT006",
    eventName: "Highway Maintenance Planning",
    requestingDepartment: "Highway Department",
    totalAmount: 450000,
    sanctionedAmount: 0,
    status: "COMMISSIONER_APPROVED",
    completedDate: "2025-03-18"
  },
  {
    id: 7,
    eventId: "EVT007",
    eventName: "Freight Transport Summit",
    requestingDepartment: "Commerce Department",
    totalAmount: 280000,
    sanctionedAmount: 280000,
    status: "COMPLETED",
    completedDate: "2025-03-05"
  },
  {
    id: 8,
    eventId: "EVT008",
    eventName: "Traffic Management Seminar",
    requestingDepartment: "Traffic Police Department",
    totalAmount: 165000,
    sanctionedAmount: 100000,
    status: "COMPLETED",
    completedDate: "2025-03-14"
  }
];

const SanctionModal = ({ isOpen, onClose, utilization, onSanction }) => {
  const [sanctionAmount, setSanctionAmount] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [sanctionType, setSanctionType] = useState("full");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (utilization) {
      setSanctionAmount(utilization.totalAmount);
      setSanctionType("full");
      setRemarks("");
    }
  }, [utilization]);

  const handleSanctionTypeChange = (type) => {
    setSanctionType(type);
    if (type === "full") {
      setSanctionAmount(utilization?.totalAmount || 0);
    } else {
      setSanctionAmount(0);
    }
  };

  const handleSubmit = async () => {
    if (sanctionAmount <= 0) {
      alert("Please enter a valid sanction amount");
      return;
    }
    if (sanctionAmount > utilization.totalAmount) {
      alert("Sanction amount cannot exceed total amount");
      return;
    }

    setLoading(true);
    try {
      await onSanction({
        utilizationId: utilization.id,
        sanctionAmount: sanctionAmount,
        sanctionType: sanctionType,
        remarks: remarks
      });
      onClose();
    } catch (error) {
      console.error("Sanction failed:", error);
      alert("Failed to sanction bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !utilization) return null;

  const remainingAmount = utilization.totalAmount - (utilization.sanctionedAmount || 0);

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <IndianRupee className="w-6 h-6 mr-2 text-green-600" />
              Bill Sanction - Event #{utilization.eventId}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-800 mb-3">Utilization Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Event Name:</span>
                <p className="text-gray-800">{utilization.eventName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Department:</span>
                <p className="text-gray-800">{utilization.requestingDepartment}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Amount:</span>
                <p className="text-gray-800 font-bold">₹{utilization.totalAmount?.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Already Sanctioned:</span>
                <p className="text-gray-800">₹{(utilization.sanctionedAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Remaining Amount:</span>
                <p className="text-green-600 font-bold">₹{remainingAmount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  utilization.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {utilization.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sanction Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input type="radio" name="sanctionType" value="full" checked={sanctionType === "full"}
                  onChange={(e) => handleSanctionTypeChange(e.target.value)} className="mr-2" />
                <span className="text-sm font-medium">Full Sanction</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="sanctionType" value="partial" checked={sanctionType === "partial"}
                  onChange={(e) => handleSanctionTypeChange(e.target.value)} className="mr-2" />
                <span className="text-sm font-medium">Partial Sanction</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <IndianRupee className="inline w-4 h-4 mr-1" />
              Sanction Amount <span className="text-red-500">*</span>
            </label>
            <input type="number" step="0.01" min="0" max={remainingAmount} value={sanctionAmount}
              onChange={(e) => setSanctionAmount(parseFloat(e.target.value) || 0)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter sanction amount" disabled={sanctionType === "full"} />
            <p className="text-sm text-gray-600 mt-1">
              Maximum available for sanction: ₹{remainingAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Remarks
            </label>
            <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows="3"
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter remarks for sanction (optional)" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading || sanctionAmount <= 0}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
              {loading ? <>⏳ Processing...</> : <><CheckCircle className="w-4 h-4" />Sanction Bill</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BillSanction = () => {
  const [utilizations, setUtilizations] = useState([]);
  const [filteredUtilizations, setFilteredUtilizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUtilization, setSelectedUtilization] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUtilizations();
  }, []);

  useEffect(() => {
    filterUtilizations();
  }, [utilizations, searchTerm, statusFilter]);

  const fetchUtilizations = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setUtilizations(DEMO_UTILIZATIONS);
    } catch (error) {
      console.error("Failed to fetch utilizations:", error);
      alert("Failed to load utilizations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterUtilizations = () => {
    let filtered = utilizations;

    if (searchTerm) {
      filtered = filtered.filter(
        (util) =>
          util.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          util.requestingDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((util) => {
        if (statusFilter === "pending") return util.sanctionedAmount === 0;
        if (statusFilter === "partial") return util.sanctionedAmount > 0 && util.sanctionedAmount < util.totalAmount;
        if (statusFilter === "full") return util.sanctionedAmount >= util.totalAmount;
        return true;
      });
    }

    setFilteredUtilizations(filtered);
  };

  const handleSanction = async (sanctionData) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUtilizations(prev => prev.map(util => 
        util.id === sanctionData.utilizationId 
          ? { ...util, sanctionedAmount: (util.sanctionedAmount || 0) + sanctionData.sanctionAmount }
          : util
      ));
      alert("Bill sanctioned successfully!");
      fetchUtilizations();
    } catch (error) {
      throw error;
    }
  };

  const openSanctionModal = (utilization) => {
    setSelectedUtilization(utilization);
    setIsModalOpen(true);
  };

  const closeSanctionModal = () => {
    setIsModalOpen(false);
    setSelectedUtilization(null);
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
            <h3 className="text-lg font-semibold tracking-wide">BILL SANCTION MANAGEMENT</h3>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="Search by event name or department..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="md:w-48">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="all">All Status</option>
                <option value="pending">Pending Sanction</option>
                <option value="partial">Partially Sanctioned</option>
                <option value="full">Fully Sanctioned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
              Completed Utilizations for Bill Sanction
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading utilizations...</p>
            </div>
          ) : filteredUtilizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No utilizations found for sanction</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Event Details</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Department</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Total Amount</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Sanctioned</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Remaining</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUtilizations.map((utilization, index) => {
                    const remainingAmount = utilization.totalAmount - (utilization.sanctionedAmount || 0);
                    
                    return (
                      <tr key={utilization.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">Event #{utilization.eventId}</div>
                            <div className="text-sm text-gray-600">{utilization.eventName}</div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {utilization.completedDate}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{utilization.requestingDepartment}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ₹{utilization.totalAmount?.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-green-600">
                          ₹{(utilization.sanctionedAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-blue-600">
                          ₹{remainingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => alert('View details functionality')}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                              title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => openSanctionModal(utilization)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all"
                              title="Sanction Bill">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <SanctionModal isOpen={isModalOpen} onClose={closeSanctionModal}
        utilization={selectedUtilization} onSanction={handleSanction} />
    </div>
  );
};

export default BillSanction;
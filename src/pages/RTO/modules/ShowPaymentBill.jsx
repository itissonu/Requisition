import React, { useEffect, useState } from "react";
import { Eye, Plus, X, Wallet, FileText, CheckCircle, Clock, IndianRupee } from "lucide-react";
import { billSanctionAPI, utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

// Main Component
export default function ShowPaymentBills() {
    const [utilizations, setUtilizations] = useState([]);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUtilization, setSelectedUtilization] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [utilsRes, billsRes] = await Promise.all([
                utilizationAPI.getCommissionerApproved(),
                billSanctionAPI.list()
            ]);
            setUtilizations(utilsRes.data);
            setBills(billsRes.data);
        } catch (error) {
            console.error("Failed to load data:", error);
            alert("Failed to load data. Please check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    const openViewModal = (util) => {
        setSelectedUtilization(util);
        setIsViewModalOpen(true);
    };

    const openAdvanceModal = (util) => {
        setSelectedUtilization(util);
        setIsAdvanceModalOpen(true);
    };

    const closeModal = () => {
        setSelectedUtilization(null);
        setIsViewModalOpen(false);
        setIsAdvanceModalOpen(false);
    };

    const processedData = utilizations.map(util => {
        const utilBills = bills.filter(b => b.eventUtilizationId === util.id);
        const totalBilled = utilBills.reduce((sum, b) => sum + b.amount, 0);
        return {
            ...util,
            bills: utilBills,
            totalBilled,
            remaining: util.totalCost - totalBilled,
            progress: util.totalCost > 0 ? (totalBilled / util.totalCost) * 100 : 0,
        };
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Loading Payment Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
                                <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-700">
                            <h3 className="text-lg font-semibold tracking-wide uppercase">Sanctioned Bills Dashboard</h3>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold">Total Events</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{processedData.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold">Total Billed</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">
                                    ₹{processedData.reduce((sum, d) => sum + d.totalBilled, 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-semibold">Total Remaining</p>
                                <p className="text-3xl font-bold text-orange-600 mt-1">
                                    ₹{processedData.reduce((sum, d) => sum + d.remaining, 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-full">
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                    <div className="bg-blue-100 border-b border-blue-200 p-4">
                        <h2 className="text-xl font-bold text-blue-900">Payment Bills Overview</h2>
                        <p className="text-sm text-blue-700 mt-1">Track and manage sanctioned bills for all events</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-900 text-white">
                                    <th className="p-4 text-left font-bold border border-gray-400">Event Details</th>
                                    <th className="p-4 text-left font-bold border border-gray-400">Department</th>
                                    <th className="p-4 text-right font-bold border border-gray-400">Total Amount</th>
                                    <th className="p-4 text-right font-bold border border-gray-400">Amount Sanctioned</th>
                                    <th className="p-4 text-right font-bold border border-gray-400">Remaining</th>
                                    <th className="p-4 text-center font-bold border border-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedData.map((row, index) => (
                                    <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                        <td className="p-4 border border-gray-300">
                                            <div className="font-semibold text-gray-900">{row.eventName}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Created: {new Date(row.createdAt).toLocaleDateString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="p-4 border border-gray-300">
                                            <span className="font-medium text-gray-700">{row.requestingDepartment}</span>
                                        </td>
                                        <td className="p-4 border border-gray-300 text-right">
                                            <span className="font-bold text-gray-900 text-lg">
                                                ₹{row.totalCost.toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="p-4 border border-gray-300 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="font-bold text-green-600 text-lg">
                                                    ₹{row.totalBilled.toLocaleString('en-IN')}
                                                </span>
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                                                    <div
                                                        className="bg-green-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${row.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1">{row.progress.toFixed(1)}% completed</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border border-gray-300 text-right">
                                            <span className="font-bold text-blue-600 text-lg">
                                                ₹{row.remaining.toLocaleString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="p-4 border border-gray-300 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => openViewModal(row)}
                                                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                                                    title="View Submitted Bills"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {row.remaining > 0 && (
                                                    <button
                                                        onClick={() => openAdvanceModal(row)}
                                                        className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"
                                                        title="Add Advance Payment"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isViewModalOpen && selectedUtilization && (
                <ViewBillsModal utilization={selectedUtilization} onClose={closeModal} />
            )}

            {isAdvanceModalOpen && selectedUtilization && (
                <AdvanceModal utilization={selectedUtilization} onClose={closeModal} onRefresh={fetchData} />
            )}
        </div>
    );
}


function ViewBillsModal({ utilization, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="bg-blue-900 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Bill History</h2>
                            <p className="text-sm text-blue-200 mt-1">{utilization.eventName}</p>
                        </div>
                        <button onClick={onClose} className="text-white hover:text-gray-300 p-1">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-800 mb-3">Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600">Total Amount:</span>
                                <p className="text-gray-900 font-bold text-lg">₹{utilization.totalCost?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Total Sanctioned:</span>
                                <p className="text-green-600 font-bold text-lg">₹{utilization.totalBilled?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Remaining:</span>
                                <p className="text-blue-600 font-bold text-lg">₹{utilization.remaining?.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bills List */}
                    {utilization.bills.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">No bills have been submitted for this event yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {utilization.bills.map((b, index) => (
                                <div key={b.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="p-3 bg-blue-100 rounded-lg">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Bill #{index + 1}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Submitted on: {new Date(b.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {b.type === 'ADVANCE' ? 'Advance payment by RTO' : 'Sanctioned by Commissioner'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-xl text-green-600">
                                                ₹{b.amount.toLocaleString('en-IN')}
                                            </p>
                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                b.type === 'ADVANCE' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                { b.type === 'ADVANCE' ? 'Advance Payment' : 'Sanctioned Payment' }
                                            </span>
                                        </div>
                                    </div>
                                    {b.remarks && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <span className="font-medium text-gray-600 text-sm">Remarks:</span>
                                            <p className="text-gray-800 text-sm mt-1">{b.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal for Creating an Advance Payment
function AdvanceModal({ utilization, onClose, onRefresh }) {
    const [sanctionAmount, setSanctionAmount] = useState('');
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdvance = async (e) => {
        e.preventDefault();
        const amount = parseFloat(sanctionAmount);
        if (!amount || amount <= 0 || amount > utilization.remaining) {
            alert("Please enter a valid amount within the remaining balance.");
            return;
        }
        setLoading(true);
        try {
            await billSanctionAPI.create({
                eventUtilizationId: utilization.id,
                type: "ADVANCE",
                amount: amount,
                billNumber: `ADV-${Date.now()}`,
                remarks,
            });
            alert("Advance payment created successfully!");
            onRefresh();
            onClose();
        } catch (err) {
            alert("Failed to create advance payment.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleAdvance} className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="bg-orange-600 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Request Advance Payment</h2>
                            <p className="text-sm text-orange-100 mt-1">{utilization.eventName}</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-white hover:text-gray-200 p-1">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-5">
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-600">Total Amount:</span>
                                <p className="text-gray-900 font-bold">₹{utilization.totalCost.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-600">Remained Balance:</span>
                                <p className="text-orange-600 font-bold">₹{utilization.remaining.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="sanctionAmount" className="block text-sm font-semibold text-gray-700 mb-2">
                            Advance Amount (INR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                            <input
                                type="text"
                                id="sanctionAmount"
                                inputMode="numeric"
                                value={sanctionAmount}
                                onChange={e => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    setSanctionAmount(value);
                                }}
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter advance amount"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-semibold text-gray-700 mb-2">
                            Remarks / Justification <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Provide a reason for this advance payment..."
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows="4"
                            required
                        />
                    </div>
                </div>

                <div className="bg-gray-100 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </form>
        </div>
    );
}
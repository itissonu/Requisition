import React, { useEffect, useState } from "react";
import { Eye, Plus, X, Landmark, FileText, Wallet, Calendar, Info } from "lucide-react";
import { billSanctionAPI, utilizationAPI } from "../../../apis/apiService"; // Fictional API service
import logo from '../../../assests/logo.png'; // Adjust the path to your logo

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
                    <p className="text-lg font-semibold text-gray-700">Loading Payment Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

           <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
                <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
                  <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
                          <img
                            src={logo}
                            alt="Odisha Logo"
                            className="w-14 h-14 object-contain"
                          />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
                          <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-700">
                        <h3 className="text-lg font-semibold tracking-wide uppercase"> Sanctioned Bills Dashboard</h3>
                      </div>
                    </div>
                  </div>
                </div>
           

            <main className="max-w-screen-xl mx-auto py-8 px-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase">
                                <tr className="bg-blue-900 text-white">
                                    <th className="p-4 text-center font-semibold border-r border-blue-700 w-12">Event Details</th>
                                    <th className="p-4 text-left font-semibold border-r border-blue-700">Department</th>
                                    <th className="p-4 text-right font-semibold border-r border-blue-700">Total Sanctioned</th>
                                    <th className="p-4 text-left font-semibold border-r border-blue-700">Amount Billed</th>
                                    <th className="p-4 text-right font-semibold border-r border-blue-700">Remaining</th>
                                    <th className="p-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {processedData.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 border-gray-200 text-center  border-r align-top">
                                            <div className="font-semibold text-gray-800">{row.eventName}</div>
                                            {/* <div className="text-xs text-gray-500 flex items-center mt-1">
                                                <Calendar size={14} className="mr-1.5" />
                                                {row.dateOfReporting} to {row.dateOfRelease}
                                            </div> */}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 align-top border-r border-gray-200 text-center">{row.requestingDepartment}</td>
                                        <td className="px-6 py-4  font-medium border-r border-gray-200 text-center text-gray-800 align-top">
                                            ₹{row.totalCost.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 align-top border-r border-gray-200 text-center ">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-green-600">₹{row.totalBilled.toLocaleString('en-IN')}</span>
                                                {/* <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                                    <div
                                                        className="bg-green-500 h-1.5 rounded-full"
                                                        style={{ width: `${row.progress}%` }}
                                                    ></div>
                                                </div> */}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4  font-medium border-r border-gray-200 text-center text-blue-600 align-top">
                                            ₹{row.remaining.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4  space-x-2 align-top  border-r border-gray-200 text-center ">
                                            <button
                                                onClick={() => openViewModal(row)}
                                               className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"  
                                                title="View Submitted Bills"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {row.remaining > 0 && (
                                                <button
                                                    onClick={() => openAdvanceModal(row)}
                                                     className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                                                    title="Add Advance Payment"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            )}
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

// Modal for Viewing Bills
function ViewBillsModal({ utilization, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl animate-fade-in-up">
                <header className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Bill History</h2>
                        <p className="text-sm text-gray-500">{utilization.eventName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-600" />
                    </button>
                </header>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {utilization.bills.length === 0 ? (
                        <div className="text-center py-8">
                            <Info size={40} className="mx-auto text-gray-400" />
                            <p className="mt-3 text-gray-600">No bills have been submitted for this event yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {utilization.bills.map(b => (
                                <li key={b.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <FileText className="w-6 h-6 text-blue-500 mr-4 flex-shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Bill</p>
                                        <p className="text-sm text-gray-500">
                                            Submitted on: {new Date(b.createdAt).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-green-600">₹{b.amount.toLocaleString('en-IN')}</p>
                                        <p className="text-xs text-gray-500">{b.type==='ADVANCE' ?'Advance payment by RTO':'Sanctioned by Commissioner'} </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}


// Modal for Creating an Advance Payment
function AdvanceModal({ utilization, onClose, onRefresh }) {
    const [sanctionAmount, setSanctionAmount] = useState(utilization.remaining);
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdvance = async (e) => {
        e.preventDefault();
        if (sanctionAmount <= 0 || sanctionAmount > utilization.remaining) {
            alert("Please enter a valid amount within the remaining balance.");
            return;
        }
        setLoading(true);
        try {
            await billSanctionAPI.create({
                eventUtilizationId: utilization.id,
                type: "ADVANCE",
                amount: sanctionAmount,
                billNumber: `ADV-${Date.now()}`,
                remarks,
            });
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
            <form onSubmit={handleAdvance} className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up">
                <header className="p-5 border-b border-gray-200 flex justify-between items-center">
                     <div>
                        <h2 className="text-lg font-semibold text-gray-800">Request Advance Payment</h2>
                        <p className="text-sm text-gray-500">{utilization.eventName}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <X size={20} className="text-gray-600" />
                    </button>
                </header>

                <div className="p-6 space-y-5">
                    <div>
                        <label htmlFor="sanctionAmount" className="block text-sm font-medium text-gray-700 mb-1">
                            Advance Amount (INR)
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Wallet className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                id="sanctionAmount"
                                value={sanctionAmount}
                                min="1"
                                max={utilization.remaining}
                                onChange={e => setSanctionAmount(parseFloat(e.target.value) || 0)}
                                className="w-full pl-10 p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                            Max available: ₹{utilization.remaining.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                            Remarks / Justification
                        </label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={e => setRemarks(e.target.value)}
                            placeholder="Provide a reason for this advance payment..."
                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows="4"
                            required
                        />
                    </div>
                </div>

                <footer className="bg-gray-50 px-6 py-4 flex justify-end items-center rounded-b-lg space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
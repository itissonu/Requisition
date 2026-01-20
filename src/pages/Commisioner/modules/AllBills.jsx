import React, { useEffect, useState } from "react";
import logo from "../../../assests/logo.png";
import { billSanctionAPI } from "../../../apis/apiService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const getBillTypeLabel = (type) => {
    switch (type) {
        case "ADVANCE":
            return "Advance Payment Fully Paid";
        case "FINAL":
            return "Full Payment Paid At Once";
        case "PARTIAL_PAID":
            return "Partially Paid";
        case "PARTIAL_PAYMENT_ADVANCE":
            return "Partially Advance Payment Paid";
        default:
            return type;
    }
};


const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
};

const AllBills = () => {
    const [bills, setBills] = useState([]);
    const [filteredBills, setFilteredBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBills = async () => {
            try {
                setLoading(true);
                const response = await billSanctionAPI.list();
                setBills(response.data);
                setFilteredBills(response.data);
            } catch (err) {
                console.error("Error fetching bills:", err);
                setError("Failed to load bills.");
            } finally {
                setLoading(false);
            }
        };

        fetchBills();
    }, []);


    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = bills.filter((bill) => {
            const idMatch = bill.id?.toString().includes(term);
            const eventMatch = bill.eventName?.toLowerCase().includes(term);
            return idMatch || eventMatch;
        });
        setFilteredBills(filtered);
    };

    // Export to Excel
    const exportToExcel = () => {
        const exportData = filteredBills.map((item) => ({
            "Bill ID": item.id,
            "Event": item.eventName || "—",
            "Created Date": formatDate(item.createdAt),
            "Type": getBillTypeLabel(item.type),
            "RTO": item.cretedByRto || "—",
            "Amount": `₹${item.amount?.toLocaleString() || "0"}`
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bills");
        XLSX.writeFile(wb, "All_Bills.xlsx");
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("All Payment Bills", 14, 10);
        const tableColumn = ["Bill ID", "Event", "Created Date", "Type", "RTO", "Amount"];
        const tableRows = [];

        filteredBills.forEach((item) => {
            const billData = [
                item.id,
                item.eventName || "—",
                formatDate(item.createdAt),
                getBillTypeLabel(item.type),
                item.cretedByRto || "—",
                item.amount || 0,
            ];
            tableRows.push(billData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
            didParseCell: function (data) {
                if (data.row.section === 'body' && data.column.index === 5) {
                    const raw = (data.cell.raw ?? '').toString().replace(/,/g, '').trim();
                    const amount = parseFloat(raw);
                    if (!isNaN(amount)) {
                        data.cell.text = [amount.toLocaleString('en-IN')];
                    } else {
                        data.cell.text = [raw];
                    }
                }
            },
            styles: { halign: "center" },
            headStyles: { fillColor: [0, 72, 144], textColor: 255, halign: "center" },
        });

        doc.save("All_Bills.pdf");
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
            {/* Header */}
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
                                <h2 className="text-lg opacity-90">Commerce & Transport  Department</h2>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-700">
                            <h3 className="text-lg font-semibold tracking-wide">TRANSPORT COMMISSIONER - ALL COMPLETED PAYMENTS</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search + Export Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 shadow-md rounded-md max-w-7xl mx-auto mt-4">
                <input
                    type="text"
                    placeholder=" Search by Bill Id, Event"
                    value={searchTerm}
                    onChange={handleSearch}
                    className="border border-gray-300 rounded-md p-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 mt-3 sm:mt-0">
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
                    >
                        Export To Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
                    >
                        Export To PDF
                    </button>
                </div>
            </div>

            {/* Table Header */}
            <div className="max-w-7xl w-full mx-auto bg-blue-100 border-b border-blue-200 p-3 mt-4 rounded-md shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900">All Completed Payment</h3>
                <p className="text-sm text-blue-700 mt-1">Review all payment</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-w-7xl mx-auto bg-white shadow-sm rounded-md">
                <table className="min-w-full">
                    <thead className="bg-blue-900 text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Bill ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Event
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Created Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                RTO
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredBills.length > 0 ? (
                            filteredBills.map((item, index) => {
                                let typeColor = "bg-gray-100 text-gray-800";
                                if (item.type === "ADVANCE") typeColor = "bg-blue-100 text-blue-800";
                                else if (item.type === "FINAL") typeColor = "bg-green-100 text-green-800";
                                else if (item.type === "PARTIAL_PAID") typeColor = "bg-yellow-100 text-yellow-800";
                                else if (item.type === "PARTIAL_PAYMENT_ADVANCE")
                                    typeColor = "bg-purple-100 text-purple-800";
                                return (
                                    <tr key={index} className="hover:bg-blue-50">
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.id}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.eventName || "—"}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatDate(item.createdAt)}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${typeColor}`}>
                                                {getBillTypeLabel(item.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">
                                            {item.cretedByRto || "—"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center font-bold text-green-600">
                                            ₹{item.amount?.toLocaleString() || "0"}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-lg">
                                    No bills found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="bg-blue-900 text-white p-4 text-center text-sm mt-8">
                <p className="font-medium">Vehicles Requisition System</p>
                <p className="opacity-90">© Government of Odisha – Commerce & Transport Department</p>
            </div>
        </div>
    );
};

export default AllBills;

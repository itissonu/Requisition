import React, { useState, useEffect } from "react";
import { Search, Filter, Calendar, Download, FileText, Eye, IndianRupee, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, FileImage } from "lucide-react";
import { billSanctionAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';


export default function RTOAllBills() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);


  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
 

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [selectedBill, setSelectedBill] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBills();
  }, [bills, searchTerm, statusFilter, typeFilter, startDate, endDate]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await billSanctionAPI.list();
      setBills(response.data);
      setFilteredBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      alert('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBills = () => {
    let filtered = [...bills];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bill =>
        bill.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.id?.toString().includes(searchTerm) ||
        bill.eventId?.toString().includes(searchTerm) ||
        bill.createdByName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.cretedByRto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }
    if (typeFilter !== "ALL") {
      filtered = filtered.filter(bill => bill.type === typeFilter);
    }

    if (startDate) {
      filtered = filtered.filter(bill =>
        new Date(bill.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(bill =>
        new Date(bill.createdAt) <= new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000)
      );
    }

    setFilteredBills(filtered);
    setCurrentPage(1);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "COLLECTOR_APPROVED":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "COMMISSIONER_APPROVED":
        return "bg-green-100 text-green-800 border border-green-300";
      case "PAID":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CREATED":
        return <Clock className="w-4 h-4" />;
      case "COLLECTOR_APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "COMMISSIONER_APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "PAID":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getBillTypeLabel = (type) => {
    switch (type) {
      case 'ADVANCE':
        return 'Advance Payment Fully Paid';
      case 'FINAL':
        return 'Full Payment Paid At Once';
      case 'PARTIAL_PAID':
        return 'Partially Paid';
      case 'PARTIAL_PAYMENT_ADVANCE':
        return 'Partially Advance Payment Paid';
      default:
        return type;
    }
  };

  const handleViewDetails = (bill) => {
    setSelectedBill(bill);
    setIsDetailsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const handleDownloadReport = () => {
    const csvData = filteredBills.map(bill => ({
      'Bill ID': bill.id,
      'Event ID': bill.eventId,
      'Event Name': bill.eventName,
      'Type': getBillTypeLabel(bill.type),
      'Amount': bill.amount,
      'Status': bill.status,
      // 'Created By': bill.createdByName,
      'RTO Office': bill.cretedByRto,
      'Created Date': new Date(bill.createdAt).toLocaleDateString('en-IN'),
      // 'Collector Approved By': bill.collectorApprovedByName || 'N/A',
      // // 'Commissioner Approved By': bill.commissionerApprovedByName || 'N/A',
      // 'Remarks': bill.remarks || 'N/A'
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RTO_Bills_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); 
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

   
    doc.setFillColor(25, 55, 109); 
    doc.rect(0, 0, pageWidth, 25, 'F');

 
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF ODISHA', pageWidth / 2, 10, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Commerce & Transport Department', pageWidth / 2, 16, { align: 'center' });
    doc.setFontSize(14);
    doc.text('RTO BILLS REPORT', pageWidth / 2, 22, { align: 'center' });

   
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-IN');
    doc.text(`Generated on: ${currentDate}`, 15, 35);
    doc.text(`Total Bills: ${filteredBills.length}`, pageWidth - 15, 35, { align: 'right' });

    // Filter Information
    let filterInfo = [];
    if (searchTerm) filterInfo.push(`Search: "${searchTerm}"`);
    if (statusFilter !== "ALL") filterInfo.push(`Status: ${statusFilter}`);
    if (typeFilter !== "ALL") filterInfo.push(`Type: ${typeFilter}`);
    if (startDate) filterInfo.push(`From: ${new Date(startDate).toLocaleDateString('en-IN')}`);
    if (endDate) filterInfo.push(`To: ${new Date(endDate).toLocaleDateString('en-IN')}`);

    if (filterInfo.length > 0) {
      doc.text(`Filters Applied: ${filterInfo.join(', ')}`, 15, 42);
    }


    const totalAmount = filteredBills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
 

    doc.setFontSize(9);
    doc.text(`Total Amount: ${totalAmount.toLocaleString('en-IN')}`, 15, 50);
   

    // Table Data
    const tableData = filteredBills.map(bill => [
      bill.id?.toString() || '',
      bill.eventId?.toString() || '',
      bill.eventName || '',
      getBillTypeLabel(bill.type),
      `${(bill.amount || 0).toLocaleString('en-IN')}`,
      bill.status?.replace(/_/g, ' ') || '',
      bill.cretedByRto || '',
      new Date(bill.createdAt).toLocaleDateString('en-IN'),
      bill.collectorApprovedByName || 'N/A',
      bill.commissionerApprovedByName || 'N/A'
    ]);


    const tableHeaders = [
      'Bill ID',
      'Event ID',
      'Event Name',
      'Type',
      'Amount',
      'Status',
      'RTO Office',
      'Created Date',
     
    ];


    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 60,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [25, 55, 109],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Bill ID
        1: { cellWidth: 25 }, // Event ID
        2: { cellWidth: 35 }, // Event Name
        3: { cellWidth: 55 }, // Type
        4: { cellWidth: 35 }, // Amount
        5: { cellWidth: 25 }, // Status
        6: { cellWidth: 30 }, // RTO Office
        7: { cellWidth: 20 } // Created Date
      
      },
      margin: { left: 15, right: 15 },
      didDrawPage: function (data) {

        const pageCount = doc.internal.getNumberOfPages();
        const currentPageNum = doc.internal.getCurrentPageInfo().pageNumber;

        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${currentPageNum} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );

        doc.text(
          '© Government of Odisha - Commerce & Transport Department',
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }
    });


    const fileName = `RTO_Bills_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };


  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Government Header */}
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
                <h2 className="text-lg opacity-90">Commerce & Transport Department</h2>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-700">
              <h3 className="text-lg font-semibold tracking-wide">RTO - ALL BILLS MANAGEMENT</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Bills</p>
                <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Approved Bills</p>
                <p className="text-2xl font-bold text-green-600">
                  {bills.filter(b => b.status === 'COMMISSIONER_APPROVED').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div> */}

          {/* <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Pending Bills</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {bills.filter(b => b.status === 'CREATED').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div> */}

          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Amount</p>
                <p className="text-xl font-bold">
                  ₹{bills.reduce((sum, bill) => sum + (bill.amount || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
              <IndianRupee className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-blue-100 border-b border-blue-200 p-4">
            <h2 className="text-xl font-semibold text-blue-900">All Bill Sanctions</h2>
            <p className="text-sm text-blue-700 mt-1">View and manage all bill sanctions</p>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by event name, bill ID, event ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>


            

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 w-max bg-green-600 hover:cursor-pointer text-sm text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                 Export to Excel
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-2 bg-red-600 hover:cursor-pointer text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  title="Download PDF"
                >
                  <FileImage className="w-4 h-4" />
                 Export to PDF
                </button>
                {(searchTerm || statusFilter !== "ALL" || typeFilter !== "ALL" || startDate || endDate) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-900 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date:</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date:</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>


            {filteredBills.length !== bills.length && (
              <p className="text-sm text-gray-600 mt-3">
                Showing {filteredBills.length} of {bills.length} bills
              </p>
            )}
          </div>

          {/*  Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-4 text-left font-semibold     border-blue-700">Bill ID</th>
                  <th className="p-4 text-left font-semibold     border-blue-700">Event Details</th>
                  <th className="p-4 text-left font-semibold     border-blue-700">Type</th>
                  <th className="p-4 text-center font-semibold     border-blue-700">Amount</th>
                  {/* <th className="p-4 text-center font-semibold     border-blue-700">Status</th> */}
                  {/* <th className="p-4 text-left font-semibold     border-blue-700">RTO Office</th> */}
                  <th className="p-4 text-left font-semibold     border-blue-700">Created Date</th>
                  <th className="p-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentBills.map((bill, index) => (
                  <tr key={bill.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors border-b border-gray-200`}>
                    <td className="p-2     border-gray-200">
                      <div className="font-semibold text-blue-600">#{bill.id}</div>
                    </td>
                    <td className="p-2     border-gray-200">
                      <div className="font-medium text-gray-900">{bill.eventName}</div>
                      <div className="text-xs text-gray-500">Event ID: {bill.eventId}</div>
                    </td>
                    <td className="p-2     border-gray-200">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {getBillTypeLabel(bill.type)}
                      </span>
                    </td>
                    <td className="p-2     border-gray-200 text-center">
                      <div className="font-bold text-base text-green-600">
                        ₹{bill.amount?.toLocaleString('en-IN')}
                      </div>
                    </td>
                
                    {/* <td className="p-4     border-gray-200 text-sm">
                      <div className="font-medium">{bill.cretedByRto}</div>
                      <div className="text-gray-500">{bill.createdByName}</div>
                    </td> */}
                    <td className="p-2     border-gray-200 text-xs font-semibold">
                      {new Date(bill.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleViewDetails(bill)}
                        className="bg-blue-600 text-white hover:cursor-pointer p-2 rounded-lg hover:bg-blue-700 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentBills.length === 0 && (
              <div className="text-center py-12 bg-gray-50">
                <div className="text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No bills found</h3>
                  <p>No bills match your current search criteria.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredBills.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBills.length)} of {filteredBills.length} bills
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {getPageNumbers().map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() => pageNum !== '...' && handlePageChange(pageNum)}
                      disabled={pageNum === '...'}
                      className={`px-4 py-2 rounded-lg font-semibold ${pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : pageNum === '...'
                            ? 'bg-transparent text-gray-400 cursor-default'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:cursor-pointer hover:bg-blue-700'
                      }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bill Details Modal */}
      {isDetailsModalOpen && selectedBill && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-blue-900 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Bill Details - #{selectedBill.id}</h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-white hover:cursor-pointer hover:text-gray-300 p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Event Name:</label>
                    <p className="text-gray-900">{selectedBill.eventName}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="font-semibold text-gray-700 block mb-1">Bill Type:</label>
                    <p className="text-gray-900">{getBillTypeLabel(selectedBill.type)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
                    <label className="font-semibold text-gray-700 block mb-1">Amount:</label>
                    <p className="text-2xl font-bold text-green-600">₹{selectedBill.amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <label className="font-semibold text-gray-700 block mb-1">Status:</label>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(selectedBill.status)}`}>
                      {getStatusIcon(selectedBill.status)}
                      {selectedBill.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <label className="font-semibold text-gray-700 block mb-1">Created By:</label>
                    <p className="text-gray-900">{selectedBill.createdByName}</p>
                    <p className="text-sm text-gray-600">{selectedBill.cretedByRto}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <label className="font-semibold text-gray-700 block mb-1">Created Date:</label>
                    <p className="text-gray-900">{new Date(selectedBill.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Approval Details */}
              {(selectedBill.collectorApprovedByName || selectedBill.commissionerApprovedByName) && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Approval History</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBill.collectorApprovedByName && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium text-blue-800">Collector Approval</h5>
                        <p className="text-sm text-gray-700">By: {selectedBill.collectorApprovedByName}</p>
                        {selectedBill.collectorApprovalDate && (
                          <p className="text-sm text-gray-700">
                            Date: {new Date(selectedBill.collectorApprovalDate).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedBill.commissionerApprovedByName && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h5 className="font-medium text-green-800">Commissioner Approval</h5>
                        <p className="text-sm text-gray-700">By: {selectedBill.commissionerApprovedByName}</p>
                        {selectedBill.commissionerApprovalDate && (
                          <p className="text-sm text-gray-700">
                            Date: {new Date(selectedBill.commissionerApprovalDate).toLocaleString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedBill.remarks && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Remarks</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedBill.remarks}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-100 p-4 rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="bg-gray-600 hover:cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
        <p>Vehicles Requisition System </p>
        <p>© Government of Odisha – Commerce & Transport Department</p>
      </div>
    </div>
  );
}

// import React, { useEffect, useState } from "react";
// import {
//   Eye, FileText, CheckCircle, Clock, IndianRupee, TrendingUp, DollarSign, Calendar, Plus
// } from "lucide-react";
// import { advancePaymentAPI, billSanctionAPI, eventAPI, utilizationAPI } from "../../../apis/apiService";
// import logo from '../../../assests/logo.png';

// export default function ShowPaymentBill() {
//   const [events, setEvents] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [bills, setBills] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//   const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
//   const [selectedEventForRequest, setSelectedEventForRequest] = useState(null);
//   const [utilizations, setUtilizations] = useState([]);

//   console.log(selectedEvent, "selected event")


//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [eventsRes, requestsRes, billsRes, utilizationsRes] = await Promise.all([
//         eventAPI.list(),
//         advancePaymentAPI.list(),
//         billSanctionAPI.list(),
//         utilizationAPI.list()
//       ]);

//       setEvents(eventsRes.data);
//       setRequests(requestsRes.data);
//       console.log(requestsRes.data, 'requestsResData');
//       setBills(billsRes.data);
//       setUtilizations(utilizationsRes.data);
//     } catch (error) {
//       console.error("Failed to load data:", error);
//       alert("Failed to load data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openDetailModal = (event) => {
//     setSelectedEvent(event);
//     setIsDetailModalOpen(true);
//   };

//   const openRequestModal = (event) => {
//     setSelectedEventForRequest(event);
//     setIsRequestModalOpen(true);
//   };

//   const closeModal = () => {
//     setSelectedEvent(null);
//     setIsDetailModalOpen(false);
//     setIsRequestModalOpen(false);
//     setSelectedEventForRequest(null);
//   };

//   // Process events with financial data
//   const processedEvents = events.map(event => {
//     const eventRequests = requests.filter(r => r.eventId === event.id);

//     const totalAdvanceRequested = eventRequests.reduce((sum, r) => sum + r.requestedAmount, 0);

//     const approvedRequests = eventRequests.filter(r =>
//       r.status === 'APPROVED' || r.status === 'PAID' || r.status === 'PARTIAL_PAID'
//     );


//     const totalAdvanceApproved = approvedRequests
//       .flatMap(r => r.billSanctions || [])
//       .reduce((sum, bill) => sum + (bill.amount || 0), 0);

//     const paidRequests = eventRequests.filter(r => r.status === 'PAID');
//     const totalPaid = paidRequests.reduce((sum, r) => sum + r.requestedAmount, 0);

//     const pendingRequests = eventRequests.filter(r => r.status === 'PENDING');

//     const eventUtilization = utilizations.find(u => u.eventId === event.id);
//     const totalAmountWillGet = eventUtilization ? eventUtilization.totalCost : 0;


//     const eventBills = bills.filter(b => b.eventId === event.id);
//     const totalBillsSanctioned = eventBills.reduce((sum, b) => sum + b.amount, 0);

//     //console.log(totalAdvanceApproved,"totalAdvanceRequested.............")
//     return {
//       ...event,
//       advanceRequests: eventRequests,
//       sanctionedBills: eventBills,
//       totalAdvanceRequested,
//       totalAdvanceApproved,
//        totalAmountWillGet,
//       totalPaid,
//       totalBillsSanctioned,
//       pendingRequestsCount: pendingRequests.length,
//       approvedRequestsCount: approvedRequests.length,
//       hasRequests: eventRequests.length > 0
//     };
//   });

//   console.log(processedEvents, 'proceedevents')

//   // Calculate overall statistics
//   const stats = {
//     totalEvents: processedEvents.length,
//     eventsWithRequests: processedEvents.filter(e => e.hasRequests).length,
//     totalAdvanceRequested: processedEvents.reduce((s, e) => s + e.totalAdvanceRequested, 0),
//     totalAdvanceApproved: processedEvents.reduce((s, e) => s + e.totalAdvanceApproved, 0),
//     totalPaid: processedEvents.reduce((s, e) => s + e.totalPaid, 0),
//     totalBillsSanctioned: processedEvents.reduce((s, e) => s + e.totalBillsSanctioned, 0)
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-lg font-semibold text-gray-700">Loading Financial Data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       <div className="bg-gradient-to-r from-orange-500 via-white to-green-600 h-2"></div>
//       <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-6 shadow-xl">
//         <div className="max-w-7xl mx-auto">
//           <div className="text-center">
//             <div className="flex items-center justify-center mb-3">
//               <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mr-4">
//                 <img src={logo} alt="Odisha Logo" className="w-14 h-14 object-contain" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
//                 <h2 className="text-lg opacity-90">Commerce & Transport (Transport) Department</h2>
//               </div>
//             </div>
//             <div className="mt-3 pt-3 border-t border-blue-700">
//               <h3 className="text-lg font-semibold tracking-wide uppercase">Advance Payment Management System</h3>
//               <p className="text-sm text-blue-200 mt-1">Track and manage advance payment requests for events</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <main className="max-w-7xl mx-auto py-8 px-6">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-semibold">Total Events</p>
//                 <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
//                 <p className="text-xs text-blue-600 mt-1">{stats.eventsWithRequests} with requests</p>
//               </div>
//               <div className="p-3 bg-blue-100 rounded-full">
//                 <FileText className="w-8 h-8 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-semibold"> Advance Amount Sanctioned</p>
//                 <p className="text-2xl font-bold text-yellow-600 mt-1">
//                   ₹{stats.totalAdvanceApproved?.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Advance payments</p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <IndianRupee className="w-8 h-8 text-purple-600" />
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-semibold"> Advance Amount Requested</p>
//                 <p className="text-2xl font-bold text-purple-600 mt-1">
//                   ₹{stats.totalAdvanceRequested.toLocaleString('en-IN')}
//                 </p>
//                 {/* <p className="text-xs text-gray-500 mt-1">Advance payments</p> */}
//               </div>
//               <div className="p-3 bg-purple-100 rounded-full">
//                 <IndianRupee className="w-8 h-8 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           {/* <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-semibold">Commissioner Approved</p>
//                 <p className="text-2xl font-bold text-green-600 mt-1">
//                   ₹{stats.totalAdvanceApproved.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {stats.totalAdvanceRequested > 0 ? 
//                     `${((stats.totalAdvanceApproved / stats.totalAdvanceRequested) * 100).toFixed(1)}% approval rate` : 
//                     'No requests yet'}
//                 </p>
//               </div>
//               <div className="p-3 bg-green-100 rounded-full">
//                 <CheckCircle className="w-8 h-8 text-green-600" />
//               </div>
//             </div>
//           </div> */}

//           <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600 font-semibold">Bills Sanctioned</p>
//                 <p className="text-2xl font-bold text-orange-600 mt-1">
//                   ₹{stats.totalBillsSanctioned.toLocaleString('en-IN')}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Against approved requests</p>
//               </div>
//               <div className="p-3 bg-orange-100 rounded-full">
//                 <TrendingUp className="w-8 h-8 text-orange-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Table */}
//         <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
//           <div className="bg-blue-100 border-b border-blue-200 p-4">
//             <h2 className="text-xl font-bold text-blue-900">Events Advance Payment Overview</h2>
//             <p className="text-sm text-blue-700 mt-1">Request and track advance payments for events</p>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-blue-900 text-white">
//                   <th className="p-4 text-left font-bold border border-gray-400">Event Details</th>
//                   {/* <th className="p-4 text-left font-bold border border-gray-400">Status</th> */}
//                   <th className="p-4 text-right font-bold border border-gray-400">Advance Requested</th>
//                   <th className="p-4 text-right font-bold border border-gray-400">Total Amounts Sanctioned</th>
//                   <th className="p-4 text-right font-bold border border-gray-400">Total Amount Billed</th>
//                   <th className="p-4 text-center font-bold border border-gray-400">Requests</th>
//                   <th className="p-4 text-center font-bold border border-gray-400">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {processedEvents.map((event, index) => (
//                   <tr key={event.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
//                     <td className="p-4 border border-gray-300">
//                       <div className="font-semibold text-gray-900">{event?.requestEventName}</div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         Event ID: {event.id}
//                       </div>
//                       {/* <div className="text-xs text-gray-500">
//                         {event.requestingDepartment}
//                       </div> */}
//                     </td>
//                     {/* <td className="p-4 border border-gray-300">
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
//                           event.status === 'UTILIZATION_SUBMITTED' ? 'bg-yellow-100 text-yellow-800' :
//                             event.status === 'COLLECTOR_APPROVED' ? 'bg-purple-100 text-purple-800' :
//                               event.status === 'COMMISSIONER_APPROVED' ? 'bg-green-100 text-green-800' :
//                                 event.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
//                                   'bg-gray-100 text-gray-800'
//                         }`}>
//                         {event.status}
//                       </span>
//                     </td> */}
//                     <td className="p-4 border border-gray-300">
//                       <div className="text-right">
//                         <div className="font-bold text-purple-600 text-lg">
//                           ₹{event.totalAdvanceRequested.toLocaleString('en-IN')}
//                         </div>
//                         <div className="text-xs text-gray-500 mt-1">
//                           {event.advanceRequests.length} request(s)
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-4 border border-gray-300">
//                       <div className="text-right">
//                         <div className="font-bold text-green-600 text-lg">
//                           ₹{event?.totalBillsSanctioned
//                             .toLocaleString('en-IN')}
//                         </div>
                       
//                       </div>
//                     </td>
//                     <td className="p-4 border border-gray-300">
//                       <div className="text-right">
//                         <div className="font-bold text-yellow-600 text-lg">
//                           {event?.totalAmountWillGet === 0 ? 'Utilization Not Created Yet' : `₹${event.totalAmountWillGet.toLocaleString('en-IN')}`}
//                         </div>
//                         {/* <div className="text-xs text-gray-500 mt-1">
//                           {event.approvedRequestsCount} approved
//                         </div> */}
//                       </div>
//                     </td>
//                     <td className="p-4 border border-gray-300 text-center">
//                       {event.hasRequests ? (
//                         <div className="space-y-1">
//                           {event.pendingRequestsCount > 0 && (
//                             <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
//                               {event.pendingRequestsCount} Pending
//                             </div>
//                           )}
//                           {event.approvedRequestsCount > 0 && (
//                             <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-1">
//                               {event.approvedRequestsCount} Approved
//                             </div>
//                           )}
//                           {event.sanctionedBills.length > 0 && (
//                             <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">
//                               {event.sanctionedBills.length} Bills
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-sm">No requests</span>
//                       )}
//                     </td>
//                     <td className="p-4 border border-gray-300 text-center">
//                       <div className="flex gap-2 justify-center">
//                         <button
//                           onClick={() => openDetailModal(event)}
//                           className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
//                           title="View Details"
//                         >
//                           <Eye className="w-4 h-4" />
//                           <span className="text-sm font-medium">View</span>
//                         </button>
//                         {
//                           event.status === 'CREATED' && (
//                             <button
//                               onClick={() => openRequestModal(event)}
//                               className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
//                               title="Request Advance Payment"
//                             >
//                               <Plus className="w-4 h-4" />
//                               <span className="text-sm font-medium">Request</span>
//                             </button>
//                           )
//                         }

//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>

//       {/* Detail Modal */}
//       {isDetailModalOpen && selectedEvent && (
//         <EventDetailModal event={selectedEvent} onClose={closeModal} />
//       )}

//       {/* Advance Payment Request Modal */}
//       {isRequestModalOpen && selectedEventForRequest && (
//         <AdvanceRequestModal event={selectedEventForRequest} onClose={closeModal} onSuccess={fetchData} />
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import {
  Eye, FileText, CheckCircle, Clock, IndianRupee, TrendingUp, DollarSign, Calendar, Plus, ChevronLeft, ChevronRight, Search
} from "lucide-react";
import { advancePaymentAPI, billSanctionAPI, eventAPI, utilizationAPI } from "../../../apis/apiService";
import logo from '../../../assests/logo.png';

export default function ShowPaymentBill() {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEventForRequest, setSelectedEventForRequest] = useState(null);
  const [utilizations, setUtilizations] = useState([]);
  
  // Search and Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  console.log(selectedEvent, "selected event");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, requestsRes, billsRes, utilizationsRes] = await Promise.all([
        eventAPI.list(),
        advancePaymentAPI.list(),
        billSanctionAPI.list(),
        utilizationAPI.list()
      ]);

      setEvents(eventsRes.data);
      setRequests(requestsRes.data);
      console.log(requestsRes.data, 'requestsResData');
      setBills(billsRes.data);
      setUtilizations(utilizationsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (event) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const openRequestModal = (event) => {
    setSelectedEventForRequest(event);
    setIsRequestModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsDetailModalOpen(false);
    setIsRequestModalOpen(false);
    setSelectedEventForRequest(null);
  };

  // Process events with financial data
  const processedEvents = events.map(event => {
    const eventRequests = requests.filter(r => r.eventId === event.id);

    const totalAdvanceRequested = eventRequests.reduce((sum, r) => sum + r.requestedAmount, 0);

    const approvedRequests = eventRequests.filter(r =>
      r.status === 'APPROVED' || r.status === 'PAID' || r.status === 'PARTIAL_PAID'
    );

    const totalAdvanceApproved = approvedRequests
      .flatMap(r => r.billSanctions || [])
      .reduce((sum, bill) => sum + (bill.amount || 0), 0);

    const paidRequests = eventRequests.filter(r => r.status === 'PAID');
    const totalPaid = paidRequests.reduce((sum, r) => sum + r.requestedAmount, 0);

    const pendingRequests = eventRequests.filter(r => r.status === 'PENDING');

    const eventUtilization = utilizations.find(u => u.eventId === event.id);
    const totalAmountWillGet = eventUtilization ? eventUtilization.totalCost : 0;

    const eventBills = bills.filter(b => b.eventId === event.id);
    const totalBillsSanctioned = eventBills.reduce((sum, b) => sum + b.amount, 0);

    return {
      ...event,
      advanceRequests: eventRequests,
      sanctionedBills: eventBills,
      totalAdvanceRequested,
      totalAdvanceApproved,
      totalAmountWillGet,
      totalPaid,
      totalBillsSanctioned,
      pendingRequestsCount: pendingRequests.length,
      approvedRequestsCount: approvedRequests.length,
      hasRequests: eventRequests.length > 0
    };
  });

  console.log(processedEvents, 'proceedevents');

  // Search and Filter Logic
  const filteredEvents = processedEvents.filter(event =>
    event.requestEventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.id.toString().includes(searchTerm)
  );

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Pagination handlers
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


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  
  const stats = {
    totalEvents: filteredEvents.length,
    eventsWithRequests: filteredEvents.filter(e => e.hasRequests).length,
    totalAdvanceRequested: filteredEvents.reduce((s, e) => s + e.totalAdvanceRequested, 0),
    totalAdvanceApproved: filteredEvents.reduce((s, e) => s + e.totalAdvanceApproved, 0),
    totalPaid: filteredEvents.reduce((s, e) => s + e.totalPaid, 0),
    totalBillsSanctioned: filteredEvents.reduce((s, e) => s + e.totalBillsSanctioned, 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Financial Data...</p>
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
              <h3 className="text-lg font-semibold tracking-wide uppercase">Advance Payment Management System</h3>
              <p className="text-sm text-blue-200 mt-1">Track and manage advance payment requests for events</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-8 px-6">
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalEvents}</p>
                <p className="text-xs text-blue-600 mt-1">{stats.eventsWithRequests} with requests</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Advance Amount Sanctioned</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  ₹{stats.totalAdvanceApproved?.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Advance payments</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <IndianRupee className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Advance Amount Requested</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ₹{stats.totalAdvanceRequested.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <IndianRupee className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Bills Sanctioned</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  ₹{stats.totalBillsSanctioned.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Against approved requests</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-blue-100 border-b border-blue-200 p-4">
            <h2 className="text-xl font-bold text-blue-900">Events Advance Payment Overview</h2>
            <p className="text-sm text-blue-700 mt-1">Request and track advance payments for events</p>
          </div>

          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by event ID or event name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-4 text-left font-bold border border-gray-400">Event Details</th>
                  <th className="p-4 text-right font-bold border border-gray-400">Advance Requested</th>
                  <th className="p-4 text-right font-bold border border-gray-400">Total Amounts Sanctioned</th>
                  <th className="p-4 text-right font-bold border border-gray-400">Total Amount Billed</th>
                  <th className="p-4 text-center font-bold border border-gray-400">Requests</th>
                  <th className="p-4 text-center font-bold border border-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No events found</h3>
                        <p>No events match your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEvents.map((event, index) => (
                    <tr key={event.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                      <td className="p-4 border border-gray-300">
                        <div className="font-semibold text-gray-900">{event?.requestEventName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Event ID: {event.id}
                        </div>
                      </td>
                      <td className="p-4 border border-gray-300">
                        <div className="text-right">
                          <div className="font-bold text-purple-600 text-lg">
                            ₹{event.totalAdvanceRequested.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {event.advanceRequests.length} request(s)
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-gray-300">
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-lg">
                            ₹{event?.totalBillsSanctioned.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-gray-300">
                        <div className="text-right">
                          <div className="font-bold text-yellow-600 text-lg">
                            {event?.totalAmountWillGet === 0 ? 'Utilization Not Created Yet' : `₹${event.totalAmountWillGet.toLocaleString('en-IN')}`}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 border border-gray-300 text-center">
                        {event.hasRequests ? (
                          <div className="space-y-1">
                            {event.pendingRequestsCount > 0 && (
                              <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                {event.pendingRequestsCount} Pending
                              </div>
                            )}
                            {event.approvedRequestsCount > 0 && (
                              <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-1">
                                {event.approvedRequestsCount} Approved
                              </div>
                            )}
                            {event.sanctionedBills.length > 0 && (
                              <div className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded ml-1">
                                {event.sanctionedBills.length} Bills
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No requests</span>
                        )}
                      </td>
                      <td className="p-4 border border-gray-300 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => openDetailModal(event)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">View</span>
                          </button>
                          {event.status === 'CREATED' && (
                            <button
                              onClick={() => openRequestModal(event)}
                              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                              title="Request Advance Payment"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-medium">Request</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {filteredEvents.length > 0 && (
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
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
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        pageNum === currentPage
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
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={closeModal} />
      )}

      {/* Advance Payment Request Modal */}
      {isRequestModalOpen && selectedEventForRequest && (
        <AdvanceRequestModal event={selectedEventForRequest} onClose={closeModal} onSuccess={fetchData} />
      )}
    </div>
  );
}

// Advance Request Modal Component
function AdvanceRequestModal({ event, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  console.log(event, "event in advance request modal");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await advancePaymentAPI.create({
        eventId: event.id,
        requestedAmount: parseFloat(amount),
        remarks: remarks
      });

      alert('Advance payment request submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit advance payment request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">Request Advance Payment</h2>
          <p className="text-sm text-green-100 mt-1">Submit advance payment request for event</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <div className="text-sm text-gray-700">
              <p><span className="font-medium">Name:</span> {event?.requestEventName}</p>
              <p><span className="font-medium">Department:</span> {event?.requestingDepartment}</p>
              <p><span className="font-medium">Event ID:</span> {event?.id}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Requested Advance  Amount (₹) <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter amount in rupees"
              required


            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Remarks / Justification
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter any remarks or justification for this advance payment request"
              rows="4"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Event Detail Modal Component
function EventDetailModal({ event, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto my-8">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-lg sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold capitalize">EVENT - {event?.requestEventName}</h2>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <span className="text-blue-200">Event ID:</span> {event.id}
                </div>
                <div>
                  <span className="text-blue-200">Requesting Department:</span> {event.requestingDepartment}
                </div>
                <div>
                  <span className="text-blue-200">Status:</span> {event.status}
                </div>
                <div>
                  <span className="text-blue-200">Created:</span> {new Date(event.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300 ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium ${activeTab === 'overview'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-medium ${activeTab === 'requests'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Advance Requests ({event.advanceRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`px-6 py-3 font-medium ${activeTab === 'bills'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sanctioned Bills ({event.sanctionedBills.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Advance Amount Requested</h4>
                  <p className="text-2xl font-bold text-purple-600">₹{event.totalAdvanceRequested.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.advanceRequests.length} request(s)</p>
                </div>
                 <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Advance Payment Approved </h4>
                  <p className="text-2xl font-bold text-green-600">₹{event?.totalAdvanceApproved?.toLocaleString('en-IN')}</p>
                  {/* <p className="text-xs text-gray-600 mt-1">{event.approvedRequestsCount} approved</p> */}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-600">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Amount Will Get </h4>
                  <p className="text-2xl font-bold text-green-600">₹{event?.totalAmountWillGet?.toLocaleString('en-IN')}</p>
                  {/* <p className="text-xs text-gray-600 mt-1">{event.approvedRequestsCount} approved</p> */}
                </div>
                 {/* <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Commissioner Approved Amount</h4>
                  <p className="text-2xl font-bold text-green-600">₹{event.totalAdvanceApproved.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.approvedRequestsCount} approved</p>
                </div> */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Bills Sanctioned</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{event.totalBillsSanctioned.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 mt-1">{event.sanctionedBills.length} bill(s)</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{event.advanceRequests.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Advance Amount Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-600">{event.pendingRequestsCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{event.approvedRequestsCount}</p>
                    <p className="text-sm text-gray-600 mt-1">Approved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{event.sanctionedBills.length}</p>
                    <p className="text-sm text-gray-600 mt-1">Bills Sanctioned</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {event.advanceRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No advance payment requests for this event</p>
                </div>
              ) : (
                event.advanceRequests.map((request, index) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Request #{index + 1}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Request ID: {request.id}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        request.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'PARTIAL_PAID' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Requested Amount</p>
                        <p className="text-2xl font-bold text-purple-600">₹{request.requestedAmount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-semibold text-gray-900">{new Date(request.createdAt).toLocaleDateString('en-IN')}</p>
                        {request.paidAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Paid: {new Date(request.paidAt).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    </div>
                    {request.remarks && (
                      <div className="bg-gray-50 rounded p-3 mt-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Remarks:</p>
                        <p className="text-sm text-gray-600">{request.remarks}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="space-y-4">
              {event.sanctionedBills.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <IndianRupee className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No bills sanctioned yet for this event</p>
                  <p className="text-sm text-gray-400 mt-2">Bills are sanctioned after advance payment approval</p>
                </div>
              ) : (
                event.sanctionedBills.map((bill, index) => (
                  <div key={bill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {bill.type === 'ADVANCE' ? 'Advance Bill' : 'Final Settlement Bill'} #{index + 1}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">Bill ID: {bill.id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === 'COMMISSIONER_APPROVED' ? 'bg-green-100 text-green-800' :
                        bill.status === 'COLLECTOR_APPROVED' ? 'bg-blue-100 text-blue-800' :
                          bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            bill.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                        }`}>
                        {bill.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Bill Amount</p>
                        <p className="text-xl font-bold text-blue-600">₹{bill.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(bill.requestDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      {bill.advancePaymentDate && (
                        <div>
                          <p className="text-sm text-gray-600">Payment Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(bill.advancePaymentDate).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Approval Timeline */}
                  

                    {bill.remarks && (
                      <div className="bg-blue-50 rounded p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Remarks:</p>
                        <p className="text-sm text-gray-600">{bill.remarks}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-b-lg flex justify-end sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
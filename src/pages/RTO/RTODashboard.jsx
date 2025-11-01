// import React, { useState } from "react";
// import Sidebar from "../../components/Sidebar";
// import Header from "../../components/Header";

// import CreateUser from "./modules/CreateUser";
// import CreateEvent from "./modules/CreateEvent";
// import EventUtilization from "./modules/EventUtilization";
// import ShowAllEvents from "./modules/ShowAllEvents";
// import ShowPaymentBill from "./modules/ShowPaymentBill";
// import UploadLetterToCollector from "./modules/UploadLetterToCollector";
// import EventActivity from "./modules/EventActivity";
// import RTOMainDashboard from "./modules/RTOMainDashboard";

// export default function RTODashboard({ user, onLogout }) {
//   const [activePage, setActivePage] = useState("DashBoard");
//   const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

//   const handleNavigateToPayment = (eventData) => {
//     setSelectedEventForPayment(eventData);
//     setActivePage("ShowPaymentBill");
//   };

//   const renderPage = () => {
//     switch (activePage) {
//       case "DashBoard": 
//         return <RTOMainDashboard />;
//       case "CreateUser": 
//         return <CreateUser />;
//       case "CreateEvent": 
//         return <CreateEvent onNavigateToPayment={handleNavigateToPayment} />;
//       case "EventUtilization": 
//         return <EventUtilization />;
//       case "ShowAllEvents": 
//         return <ShowAllEvents />;
//       case "ShowPaymentBill": 
//         return <ShowPaymentBill selectedEvent={selectedEventForPayment} />;
//       case "UploadLetterToCollector": 
//         return <UploadLetterToCollector />;
//       case "EventActivity": 
//         return <EventActivity />;
//       default: 
//         return <CreateUser />;
//     }
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar activePage={activePage} setActivePage={setActivePage} />
//       <div className="flex-1 flex flex-col">
//         <Header user={user} onLogout={onLogout} />
//         <main className="p-6">{renderPage()}</main>
//       </div>
//     </div>
//   );
// }




// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import Header from "../../components/Header";

// import CreateUser from "./modules/CreateUser";
// import CreateEvent from "./modules/CreateEvent";
// import EventUtilization from "./modules/EventUtilization";
// import ShowAllEvents from "./modules/ShowAllEvents";
// import ShowPaymentBill from "./modules/ShowPaymentBill";
// import UploadLetterToCollector from "./modules/UploadLetterToCollector";
// import EventActivity from "./modules/EventActivity";
// import RTOMainDashboard from "./modules/RTOMainDashboard";

// export default function RTODashboard({ user, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

//   // Get current page from URL path
//   const getCurrentPage = () => {
//     const path = location.pathname;
//     if (path === '/rto/dashboard' || path === '/rto/dashboard/') {
//       return 'DashBoard';
//     }

//     const segments = path.split('/');
//     const lastSegment = segments[segments.length - 1];

//     // Map URL segments to page keys
//     const pathToPageMap = {
//       'create-event': 'CreateEvent',
//       'event-utilization': 'EventUtilization',
//       'all-events': 'ShowAllEvents',
//       'payment-bills': 'ShowPaymentBill',
//       'pending-requisition': 'UploadLetterToCollector',
//       'event-activity': 'EventActivity',
//       'create-user': 'CreateUser'
//     };

//     return pathToPageMap[lastSegment] || 'DashBoard';
//   };

//   const [activePage, setActivePage] = useState(getCurrentPage());

//   // Update active page when URL changes
//   useEffect(() => {
//     setActivePage(getCurrentPage());
//   }, [location.pathname]);

//   const handlePageChange = (pageKey) => {
//     setActivePage(pageKey);

//     // Map page keys to URL paths
//     const pageToPathMap = {
//       'DashBoard': '/rto/dashboard',
//       'CreateUser': '/rto/dashboard/create-user',
//       'CreateEvent': '/rto/dashboard/create-event',
//       'EventUtilization': '/rto/dashboard/event-utilization',
//       'ShowAllEvents': '/rto/dashboard/all-events',
//       'ShowPaymentBill': '/rto/dashboard/payment-bills',
//       'UploadLetterToCollector': '/rto/dashboard/pending-requisition',
//       'EventActivity': '/rto/dashboard/event-activity'
//     };

//     const path = pageToPathMap[pageKey] || '/rto/dashboard';
//     navigate(path);
//   };

//   const handleNavigateToPayment = (eventData) => {
//     setSelectedEventForPayment(eventData);
//     handlePageChange("ShowPaymentBill");
//   };

//   return (
//     <div className="flex min-h-screen">
//       <Sidebar 
//         activePage={activePage} 
//         setActivePage={handlePageChange} 
//       />
//       <div className="flex-1 flex flex-col">
//         <Header user={user} onLogout={onLogout} />
//         <main className="p-6">
//           <Routes>
//             <Route index element={<RTOMainDashboard />} />
//             <Route path="create-user" element={<CreateUser />} />
//             <Route path="create-event" element={<CreateEvent onNavigateToPayment={handleNavigateToPayment} />} />
//             <Route path="event-utilization" element={<EventUtilization />} />
//             <Route path="all-events" element={<ShowAllEvents />} />
//             <Route path="payment-bills" element={<ShowPaymentBill selectedEvent={selectedEventForPayment} />} />
//             <Route path="pending-requisition" element={<UploadLetterToCollector />} />
//             <Route path="event-activity" element={<EventActivity />} />
//           </Routes>
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import CreateUser from "./modules/CreateUser";
import CreateEvent from "./modules/CreateEvent";
import EventUtilization from "./modules/EventUtilization";
import ShowAllEvents from "./modules/ShowAllEvents";
import ShowPaymentBill from "./modules/ShowPaymentBill";
import UploadLetterToCollector from "./modules/UploadLetterToCollector";
import EventActivity from "./modules/EventActivity";
import RTOMainDashboard from "./modules/RTOMainDashboard";
import RTOAllBills from "./modules/AllBillsReport";
import RTOStampSignatureProfile from "./modules/RTOStampSignatureProfile";

export default function RTODashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

 
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/rto/dashboard' || path === '/rto/dashboard/') {
      return 'DashBoard';
    }

    const segments = path.split('/');
    const lastSegment = segments[segments.length - 1];

    // Map URL segments to page keys
    const pathToPageMap = {
      'create-event': 'CreateEvent',
      'event-utilization': 'EventUtilization',
      'all-events': 'ShowAllEvents',
      'payment-bills': 'ShowPaymentBill',
      'pending-requisition': 'UploadLetterToCollector',
      'event-activity': 'EventActivity',
      'create-user': 'CreateUser',
      'all-bills': 'ShowAllBills',
      'stamp-signature-profile': 'UpdateStampSignatureProfile'
    };

    return pathToPageMap[lastSegment] || 'DashBoard';
  };

  const [activePage, setActivePage] = useState(getCurrentPage());

  useEffect(() => {
    setActivePage(getCurrentPage());
  }, [location.pathname]);

  const handlePageChange = (pageKey) => {
    setActivePage(pageKey);

    // Map page keys to URL paths
    const pageToPathMap = {
      'DashBoard': '/rto/dashboard',
      'CreateUser': '/rto/dashboard/create-user',
      'CreateEvent': '/rto/dashboard/create-event',
      'EventUtilization': '/rto/dashboard/event-utilization',
      'ShowAllEvents': '/rto/dashboard/all-events',
      'ShowPaymentBill': '/rto/dashboard/payment-bills',
      'UploadLetterToCollector': '/rto/dashboard/pending-requisition',
      'EventActivity': '/rto/dashboard/event-activity',
      'ShowAllBills': '/rto/dashboard/all-bills',
      'UpdateStampSignatureProfile': '/rto/dashboard/stamp-signature-profile'

    };

    const path = pageToPathMap[pageKey] || '/rto/dashboard';
    navigate(path);
  };

  const handleNavigateToPayment = (eventData) => {
    setSelectedEventForPayment(eventData);
    handlePageChange("ShowPaymentBill");
  };

  return (
    <div className="flex h-screen overflow-hidden">

      <div className="fixed left-0 top-0 h-full z-30 overflow-y-auto">
        <Sidebar
          activePage={activePage}
          setActivePage={handlePageChange}
        />
      </div>

      <div className="flex-1 flex flex-col ml-72">
        <div className="fixed top-0 right-0 left-72 z-20 bg-white shadow-sm">
          <Header user={user} onLogout={onLogout} />
        </div>

        <main className="flex-1 overflow-y-auto pt-24 p-6">
          <Routes>
            <Route index element={<RTOMainDashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="create-event" element={<CreateEvent onNavigateToPayment={handleNavigateToPayment} />} />
            <Route path="event-utilization" element={<EventUtilization />} />
            <Route path="all-events" element={<ShowAllEvents />} />
            <Route path="payment-bills" element={<ShowPaymentBill selectedEvent={selectedEventForPayment} />} />
            <Route path="pending-requisition" element={<UploadLetterToCollector />} />
            <Route path="event-activity" element={<EventActivity />} />
            <Route path="all-bills" element={<RTOAllBills />} />
             <Route path="stamp-signature-profile" element={<RTOStampSignatureProfile />} />

          </Routes>
        </main>
        {/* <div className="bg-gradient-to-r from-blue-200 via-blue-800 to-blue-900 text-white p-4 text-center text-sm mt-8">
          <p className="mb-2">Vehicles Requisition System</p>
          <p>© Government of Odisha – Commerce & Transport Department </p>

        </div> */}
      </div>
    </div>
  );
}


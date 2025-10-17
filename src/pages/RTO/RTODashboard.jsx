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

export default function RTODashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedEventForPayment, setSelectedEventForPayment] = useState(null);

  // Get current page from URL path
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
      'create-user': 'CreateUser'
    };
    
    return pathToPageMap[lastSegment] || 'DashBoard';
  };

  const [activePage, setActivePage] = useState(getCurrentPage());

  // Update active page when URL changes
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
      'EventActivity': '/rto/dashboard/event-activity'
    };
    
    const path = pageToPathMap[pageKey] || '/rto/dashboard';
    navigate(path);
  };

  const handleNavigateToPayment = (eventData) => {
    setSelectedEventForPayment(eventData);
    handlePageChange("ShowPaymentBill");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar 
        activePage={activePage} 
        setActivePage={handlePageChange} 
      />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="p-6">
          <Routes>
            <Route index element={<RTOMainDashboard />} />
            <Route path="create-user" element={<CreateUser />} />
            <Route path="create-event" element={<CreateEvent onNavigateToPayment={handleNavigateToPayment} />} />
            <Route path="event-utilization" element={<EventUtilization />} />
            <Route path="all-events" element={<ShowAllEvents />} />
            <Route path="payment-bills" element={<ShowPaymentBill selectedEvent={selectedEventForPayment} />} />
            <Route path="pending-requisition" element={<UploadLetterToCollector />} />
            <Route path="event-activity" element={<EventActivity />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

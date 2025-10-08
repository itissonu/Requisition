import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import CollectorMainDashboard from "./components/CollectorMainDashboard.jsx"; 
import ApproveRequests from "./components/ApproveRequests.jsx";              
import ShowAllRequests from "./components/ShowAllRequests.jsx";             
import ShowAllEvents from "./components/ShowAllEvents";
import CollectorSidebar from "./components/CollectorSidebar.jsx";
import ApproveUtilizations from "./components/ApproveUtilizations.jsx";
             

export default function CollectorDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard": return <CollectorMainDashboard />;
      case "ApproveRequests": return <ApproveRequests />;
      case "ApproveUtilizations": return <ApproveUtilizations/>;
      case "ShowAllEvents": return <ShowAllEvents />;
      default: return <CollectorMainDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <CollectorSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Header onLogout={onLogout} />
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

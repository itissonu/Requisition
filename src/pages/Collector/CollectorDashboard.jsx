import React, { useState } from "react";
import Header from "../../components/Header";
import CollectorMainDashboard from "./components/CollectorMainDashboard.jsx";
import ShowAllEvents from "./components/ShowAllEvents";
import CollectorSidebar from "./components/CollectorSidebar.jsx";
import ApproveUtilizations from "./components/ApproveUtilizations.jsx";
import UploadLetterToRTO from "./components/Requisitionrequest.jsx";
import VehicleRequisitionForm from "./components/VehicleRequisitionForm.jsx";
import CollectorAdvancePayments from "./components/CollectorAdvancePayments.jsx";

export default function CollectorDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard": return <CollectorMainDashboard />;
      case "ApproveUtilizations": return <ApproveUtilizations />;
      case "ShowAllEvents": return <ShowAllEvents />;
      case "LetterToRTO": return <UploadLetterToRTO />;
      case "RequisitionForm": return <VehicleRequisitionForm />;
      case "AdvancePaymentRequest": return <CollectorAdvancePayments />;
      default: return <CollectorMainDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="fixed left-0 top-0 h-full z-30">
        <CollectorSidebar activePage={activePage} setActivePage={setActivePage} />
      </div>
       
      <div className="flex-1 flex flex-col ml-72"> 
        <div className="fixed top-0 right-0 left-72 z-20 bg-white shadow-sm"> 
          <Header user={user} onLogout={onLogout} />
        </div>
        <main className="flex-1 overflow-y-auto pt-20 p-4"> 
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

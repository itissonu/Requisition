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
    <div className="flex min-h-screen">
      <CollectorSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Header user={user} onLogout={onLogout} />
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

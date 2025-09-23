import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import CreateUser from "./modules/CreateUser";
import CreateEvent from "./modules/CreateEvent";
import DisposeEvent from "./modules/DisposeEvent";
import ShowAllEvents from "./modules/ShowAllEvents";
import ShowPaymentBill from "./modules/ShowPaymentBill";
import UploadLetterToCollector from "./modules/UploadLetterToCollector";
import EventActivity from "./modules/EventActivity";
import RTOMainDashboard from "./modules/RTOMainDashboard";

export default function RTODashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("DashBoard");

  const renderPage = () => {
    switch (activePage) {
      case "DashBoard": return <RTOMainDashboard/>;
      case "CreateUser": return <CreateUser />;
      case "CreateEvent": return <CreateEvent />;
      case "DisposeEvent": return <DisposeEvent />;
      case "ShowAllEvents": return <ShowAllEvents />;
      case "ShowPaymentBill": return <ShowPaymentBill />;
      case "UploadLetterToCollector": return <UploadLetterToCollector />;
      case "EventActivity": return <EventActivity />;
      default: return <CreateUser />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <Header onLogout={onLogout} />
        <main className="p-6">{renderPage()}</main>
      </div>
    </div>
  );
}

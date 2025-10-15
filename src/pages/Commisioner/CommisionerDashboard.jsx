import React, { useState } from "react";
import CommissionerSidebar from "./modules/CommissionerSidebar";
import CommissionerHeader from "./modules/CommissionerHeader";

// Import modules
import CommissionerMainDashboard from "./modules/CommissionerMainDashboard";
import PendingApprovals from "./modules/PendingApprovals";
import ApprovedUtilizations from "./modules/ApprovedUtilizations";
import CommissionerApproveUtilizations from "./modules/PendingApprovals";
import BillSanction from "./modules/BillSanction";
import CommissionerAdvancePayments from "./modules/CommissionerAdvancePayments";

export default function CommissionerDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <CommissionerMainDashboard />;
      case "PendingApprovals":
        return <CommissionerApproveUtilizations />;
      case "ApprovedUtilizations":
        return <ApprovedUtilizations />;
      case "BillSanction":
        return <BillSanction />;
      case "AdvancePayment":
        return <CommissionerAdvancePayments />;
      default:
        return <CommissionerMainDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <CommissionerSidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col">
        <CommissionerHeader user={user} onLogout={onLogout} />
        <main className="p-6 bg-gray-50">{renderPage()}</main>
      </div>
    </div>
  );
}

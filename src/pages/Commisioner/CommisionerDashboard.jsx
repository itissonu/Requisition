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
import AllBillsPage from "./modules/AllBills";

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
      case "AllBills":
        return <AllBillsPage />
      default:
        return <CommissionerMainDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-30">
        <CommissionerSidebar activePage={activePage} setActivePage={setActivePage} />
      </div>


      <div className="flex-1 flex flex-col ml-64">

        <div className="fixed top-0 right-0 left-64 z-20 bg-white shadow-sm"> {/* Adjust left-64 based on sidebar width */}
          <CommissionerHeader user={user} onLogout={onLogout} />
        </div>
        <main className="flex-1 overflow-y-auto pt-20 p-6 bg-gray-50"> {/* pt-16 creates space for fixed header */}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

import React from "react";
import { Home, Clock, CheckCircle, FileText, IndianRupee, ScrollText } from "lucide-react";

const menuItems = [
  {
    key: "Dashboard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & Statistics"
  },
  {
    key: "PendingApprovals",
    label: "Pending Approvals",
    icon: Clock,
    description: "Review Utilizations",
    // badge: true
  },
  {
    key: "ApprovedUtilizations",
    label: "Approved",
    icon: CheckCircle,
    description: "Completed Approvals"
  },
  {
    key: "BillSanction",
    label: "Bill Sanction",
    icon: FileText,
    description: "Review Bill Sanctions"
  },
  {
    key: "AllBills",
    label: "All Bills",
    icon: ScrollText,
    description: "Complete Bill Sanctions"
  },
   {
    key: "AdvancePayment",
    label: "Advance Payment",
    icon: IndianRupee,
    description: "Review Advance Payment Requests"
  }
];

export default function CommissionerSidebar({ activePage, setActivePage }) {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-900 font-bold text-sm">CM</span>
          </div>
          <h1 className="text-xl font-bold">Commissioner</h1>
        </div>

        <nav className="space-y-2">
          <div className="mb-4">
            <h2 className="text-gray-300 text-xs uppercase tracking-wide font-semibold">
              Event Utilizations
            </h2>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`w-full flex items-center hover:cursor-pointer px-4 py-3 text-left rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-800 border-r-4 border-white' 
                    : 'hover:bg-blue-800'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-300">{item.description}</div>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    2
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 w-64 p-6 flex items-center justify-center"> 
        <div className="text-xs text-gray-400 flex flex-col items-center justify-center">
          <p>Government of Odisha</p>
          <p>Commerce & Transport Department</p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Truck, 
  Calendar, 
  User, 
  FileText
} from "lucide-react";

const collectorItems = [
  { 
    key: "Dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    description: "Overview & Reports" 
  },
  { 
    key: "ApproveRequests", 
    label: "Approve Requests", 
    icon: CheckSquare, 
    description: "Review Pending Requests",
    //badge: 3 
  },
  { 
    key: "ApproveUtilizations", 
    label: "Approve Utilizations", 
    icon: Truck, 
    description: "Vehicle Usage Approvals"
  },
  { 
    key: "ShowAllEvents", 
    label: "All Events", 
    icon: Calendar, 
    description: "View Event Details" 
  },
  { 
    key: "LetterToRTO", 
    label: "Upload Letter to RTO", 
    icon: FileText, 
    description: "Upload Letter to RTO" 
  },
  //   { 
  //   key: "RequisitionForm", 
  //   label: "Vehicle Requisition Form", 
  //   icon: FileText, 
  //   description: "Create a new vehicle requisition" 
  // }
];

export default function CollectorSidebar({ activePage, setActivePage }) {
  return (
    <div className="w-72 bg-blue-900 text-white min-h-screen flex flex-col justify-between">
      {/* Header Section */}
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <User className="w-5 h-5 text-blue-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Collector</h1>
            <p className="text-xs text-gray-300">Vehicle Requisition System</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          <div className="mb-4">
            <h2 className="text-gray-300 text-xs uppercase tracking-wide font-semibold">
              Dashboard Menu
            </h2>
          </div>

          {collectorItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-800 border-r-4 border-white shadow-md"
                    : "hover:bg-blue-800"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-300">{item.description}</div>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-6 text-xs text-gray-400">
        <p>Government of Odisha</p>
        <p>Transport Department</p>
      </div>
    </div>
  );
}

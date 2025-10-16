import React from "react";
import { 
  Home,        // For Dashboard
  UserPlus,    // For CreateUser
  CalendarPlus, // For CreateEvent
  ClipboardList, // For EventUtilization
  LayoutList,  // For ShowAllEvents
  Receipt,     // For ShowPaymentBill
  Mail,        // For UploadLetterToCollector
  Activity    // For EventActivity
} from "lucide-react";

// Map your original string items to richer menu objects
const menuItems = [
  {
    key: "DashBoard",
    label: "Dashboard",
    icon: Home,
    description: "Overview & Statistics"
  },
  // {
  //   key: "CreateUser",
  //   label: "Create User",
  //   icon: UserPlus,
  //   description: "Register New Accounts"
  // }, 
  {
    key: "CreateEvent",
    label: "Requisition Schedule",
    icon: CalendarPlus,
    description: "Plan New Activities"
  },
  {
    key: "EventUtilization",
    label: "Event Utilization",
    icon: ClipboardList,
    description: "Monitor Event Resources"
  },
  {
    key: "ShowAllEvents",
    label: "All Events",
    icon: LayoutList,
    description: "View Scheduled Events"
  },
  {
    key: "ShowPaymentBill",
    label: "Payment Bills",
    icon: Receipt,
    description: "Manage Financials"
  },
  {
    key: "UploadLetterToCollector",
    label: "Pending Requisition",
    icon: Mail,
    description: "View Collector Request"
  },
 
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <div className="w-74 bg-blue-900 text-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-blue-900 font-bold text-sm">RTO</span> {/* Changed to RTO */}
          </div>
          <h1 className="text-xl font-bold">RTO Dashboard</h1> {/* Changed title */}
        </div>

        <nav className="space-y-2">
          <div className="mb-4">
            <h2 className="text-gray-300 text-xs uppercase tracking-wide font-semibold">
              Menu
            </h2>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            
            return (
              <button
                key={item.key}
                onClick={() => setActivePage(item.key)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
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
                {/* You can add badges here if needed for any specific item */}
                {/* {item.badge && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge} 
                  </span>
                )} */}
              </button>
            );
          })}
        </nav>
      </div>

     <div className="absolute bottom-0 w-64 p-6"> 
        <div className="text-xs text-gray-400">
          <p>Government of Odisha</p>
          <p>Commerce & Transport Department</p>
        </div>
      </div>
    </div>
  );
}
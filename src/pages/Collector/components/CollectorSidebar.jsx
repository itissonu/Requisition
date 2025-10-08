import React from "react";
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Calendar, 
  User,
  Truck
} from "lucide-react";

const collectorItems = [
  { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "ApproveRequests", label: "Approve Requests", icon: CheckSquare },
  { key: "ApproveUtilizations", label: "Approve Utilizations", icon: Truck },
  // { key: "ShowAllRequests", label: "All Requests", icon: FileText },
  { key: "ShowAllEvents", label: "All Events", icon: Calendar }
];

export default function CollectorSidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-72 bg-white border-r min-h-screen p-4">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-bold text-lg text-gray-900">Collector Dashboard</h3>
            <p className="text-sm text-gray-600">Vehicle Requisition System</p>
          </div>
        </div>
      </div>
      
      <nav className="space-y-2">
        {collectorItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activePage === item.key 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activePage === item.key && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

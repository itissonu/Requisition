import React from "react";

const items = [
  "DashBoard",
  "CreateUser",
  "CreateEvent",
  "DisposeEvent",
  "ShowAllEvents",
  "ShowPaymentBill",
  "UploadLetterToCollector",
  "EventActivity"
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="w-72 bg-white border-r min-h-screen p-4">
      <h3 className="font-bold text-lg mb-4">RTO Dashboard</h3>
      <nav className="space-y-2">
        {items.map((it) => (
          <button
            key={it}
            onClick={() => setActivePage(it)}
            className={`block w-full text-left px-3 py-2 rounded-md ${
              activePage === it ? "bg-blue-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            {it.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </nav>
    </aside>
  );
}

import React from "react";

const mockApprovedUtilizations = [
  {
    id: 2003,
    eventName: "Forest Conservation Drive",
    department: "Forest Department",
    approvedDate: "2025-09-25",
    totalAmount: 18200,
    vehiclesUsed: 6,
    duration: "4 days"
  },
  {
    id: 2004,
    eventName: "Rural Health Camp",
    department: "Health Department",
    approvedDate: "2025-09-20",
    totalAmount: 22500,
    vehiclesUsed: 8,
    duration: "5 days"
  }
];

export default function ApprovedUtilizations() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approved Utilizations</h1>
        <p className="text-gray-600">Previously approved utilization requests</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Approved Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockApprovedUtilizations.map((util) => (
                <tr key={util.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{util.eventName}</div>
                      <div className="text-sm text-gray-500">ID: UT{String(util.id).padStart(3,'0')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{util.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{util.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{util.vehiclesUsed}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{util.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{util.approvedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

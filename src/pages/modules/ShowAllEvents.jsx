import React from "react";

export default function ShowAllEvents() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Show All Events</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Event ID</th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border">EV001</td>
            <td className="p-2 border">Sample Event</td>
            <td className="p-2 border">Pending</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

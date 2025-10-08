import React from "react";

export default function EventActivity() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Event Activity</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Event Created by User A</li>
        <li>Letter Uploaded to Collector</li>
        <li>Payment Bill Generated</li>
      </ul>
    </div>
  );
}

import React from "react";

export default function CreateEvent() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Event</h2>
      <form className="space-y-3">
        <div>
          <label>Event Name</label>
          <input className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Upload Letter</label>
          <input type="file" className="w-full border p-2 rounded" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  );
}

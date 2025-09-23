import React from "react";

export default function UploadLetterToCollector() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload Letter To Collector</h2>
      <input type="file" className="w-full border p-2 rounded" />
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Upload
      </button>
    </div>
  );
}

import React from "react";

export default function CreateUser() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create User</h2>
      <form className="space-y-3">
        <div>
          <label>Name of User</label>
          <input className="w-full border p-2 rounded" />
        </div>
        <div>
          <label>Mobile No</label>
          <input className="w-full border p-2 rounded" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>
      </form>
    </div>
  );
}

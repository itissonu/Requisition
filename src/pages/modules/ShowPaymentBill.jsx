import React from "react";

export default function ShowPaymentBill() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Show Payment Bill</h2>
      <div>No. of Days: 3</div>
      <div>Total km Run: 120</div>
      <div>POL Consumed: 50</div>
      <div>POL Issued: 60</div>
      <div>POL Balance: 10</div>
      <div>POL Cost: ₹5000</div>
      <div>Total Amount: ₹15000</div>
    </div>
  );
}

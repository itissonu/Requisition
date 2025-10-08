import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  User,
  Truck,
  DollarSign
} from "lucide-react";
import { utilizationAPI } from "../../../apis/apiService";
import { useNavigate } from "react-router-dom";

export default function CommissionerApproveUtilizations() {
  const navigate=useNavigate();
  const [utilizations, setUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState("");
  const [actionType, setActionType] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await utilizationAPI.getByStatus("PENDING_COMMISSIONER_APPROVAL");
        setUtilizations(res.data);
      } catch {
        alert("Failed to load utilizations.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const confirmAction = async () => {
    if (!selected || !comments.trim()) return alert("Enter comments.");
    setBusy(true);
    try {
      if (actionType === "approve") {
       await utilizationAPI.commissionerApprove(selected.id, 16, comments.trim());
      } else {
        await utilizationAPI.commissionerReject(selected.id, comments.trim());
      }
      setUtilizations(u => u.filter(x => x.id !== selected.id));
      setShowModal(false);
      setComments("");
      setSelected(null);
      alert(`Utilization ${actionType}d.`);
      navigate("/commisioner/dashboard");
    
    } catch {
      alert("Operation failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12"><div className="animate-spin h-8 w-8 border-2 border-blue-600 rounded-full mx-auto"></div></div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Government Header */}
      <div className="bg-blue-900 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold">GOVERNMENT OF ODISHA</h1>
          <p className="text-sm opacity-80">Commerce & Transport (Transport) Department</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-4">
        {utilizations.length === 0 && (
          <div className="text-center py-12 text-gray-600">No pending utilizations.</div>
        )}
        {utilizations.map(u => (
          <div key={u.id} className="bg-white border border-gray-300 rounded-lg flex p-4 shadow hover:shadow-md">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{u.eventName}</h3>
                <span className="text-sm text-gray-500">UT{String(u.id).padStart(3,'0')}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  {u.dateOfReporting}–{u.dateOfRelease}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-blue-600" />
                  {u.requestingDepartment}
                </div>
                <div className="flex items-center gap-1">
                 
                  ₹{u.totalCost.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-gray-600" />
                  {u.vehicleUtilizations?.length || 0} vehicles
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 ml-4">
              {/* <button
                onClick={() => window.open(`http://localhost:8091/Requisition/api/utilizations/${u.id}`, "_blank")}
                className="p-2 text-blue-600 hover:text-blue-800"
                title="View"
              >
                <Eye className="w-5 h-5" />
              </button> */}
              <button
                onClick={() => { setSelected(u); setActionType("reject"); setShowModal(true); }}
                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                title="Reject"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setSelected(u); setActionType("approve"); setShowModal(true); }}
                className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                title="Approve"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {showModal && selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-center">
                {actionType === "approve" ? "Approve" : "Reject"} Utilization
              </h4>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Comments"
                className="w-full border rounded p-2 mb-4"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={busy}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                >Cancel</button>
                <button
                  onClick={confirmAction}
                  disabled={busy || !comments.trim()}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {actionType === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

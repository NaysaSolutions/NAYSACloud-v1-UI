import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const CancelTranModal = ({ isOpen, onClose, customParam }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Document cancelled successfully!");
      onClose(); // close modal after success
    }, 1500);
  };

  if (!isOpen) return null; // don't render when closed

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal Content */}
      <div className="w-[350px] p-6 border rounded-2xl shadow-lg bg-white space-y-4">
        <h2 className="text-lg font-semibold">Cancel Document</h2>

        <div>
          <label className="text-sm font-medium">Reason</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for cancellation"
            className="mt-1 w-full border rounded-md p-2 text-sm"
          />
        </div>

        <p className="text-xs text-red-600 font-medium">
          ⚠️ Warning! NO un-posting of cancelled transaction.
        </p>

        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mt-1 w-full border rounded-md p-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose} // close on cancel
            className="px-4 py-1 border rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                Please wait...
              </>
            ) : (
              "OK"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelTranModal;

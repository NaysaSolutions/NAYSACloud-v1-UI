import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPen, faSave, faUndo, faPrint } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useReset } from "./ResetContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerReset } = useReset();

  // State for handling save and reset logic
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    console.log("Save button clicked");
    setTimeout(() => setLoading(false), 2000); 
  };

  const handleReset = () => {
    console.log("Reset clicked");
    triggerReset();
  };

  return (
    <div className="p-4 h-16 bg-blue-100 font-roboto shadow-md px-6">
  <div className="flex items-center justify-between">
    {/* Header Tabs */}
    <div className="flex items-center space-x-8">
      <button
        className={`flex items-center pb-1 ${
          location.pathname === "/"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600 hover:text-blue-600"
        }`}
        onClick={() => navigate("/")}
      >
        <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
        <span className="font-semibold">Transaction Details</span>
      </button>

      <button
        className={`flex items-center pb-1 ${
          location.pathname === "/history"
            ? "text-blue-600 border-b-4 border-blue-600"
            : "text-gray-600 hover:text-blue-600"
        }`}
        onClick={() => navigate("/history")}
      >
        <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
        <span className="font-semibold">Transaction History</span>
      </button>
    </div>

    {/* Save, Reset, and Print Buttons */}
    <div className="flex items-center">
      <button
        onClick={handleSave}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === "s" && !loading) {
            e.preventDefault();
            handleSave();
          }
        }}
        className="bg-green-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-blue-300 ml-3"
        aria-label="Save transaction"
      >
        <FontAwesomeIcon icon={faSave} className="mr-2" />
        {loading ? "Saving..." : "Save"}
      </button>

      <button
        onClick={handleReset}
        className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 ml-3"
      >
        <FontAwesomeIcon icon={faUndo} className="mr-2" />
        Reset
      </button>

      <button
        className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 ml-3"
      >
        <FontAwesomeIcon icon={faPrint} className="mr-2" />
        Print
      </button>

      <button
        className="bg-blue-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-blue-700 ml-3"
      >
        <FontAwesomeIcon icon={faPrint} className="mr-2" />
        BIR Form
      </button>

      <button
        className="bg-red-500 text-white px-3 py-2 text-sm rounded-lg hover:bg-red-600 ml-6" 
      >
        <FontAwesomeIcon icon={faPrint} className="mr-2" />
        Cancel
      </button>

    </div>
  </div>
</div>

  );
};

export default Header;

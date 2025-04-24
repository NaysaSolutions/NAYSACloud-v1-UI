import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPen, faSave, faUndo, faPrint, faCancel, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useReset } from "./ResetContext";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerReset } = useReset();
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
    <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md font-sans sm:fixed top-0 left-0 w-full z-30">
      {/* <div className="fixed top-20 left-0 w-full h-[80px] z-30 bg-white font-sans p-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4  shadow-md"> */}
      <div className="flex flex-col bg-white gap-4 shadow-md fixed top-20 left-0 border w-full px-2 py-2
                      sm:top-20 sm:px-2 sm:py-2
                      md:top-20 md:px-2 md:py-2
                      lg:top-20 lg:px-4 lg:py-2
                      lg:flex-row lg:items-center lg:justify-between">
        
        {/* Header Tabs */}
        <div className="flex sm:flex-row lg:flex-wrap gap-6 w-full mr-28 ml-6 lg:mr-28">

          <button
            className={`flex items-center pb-1 ${
              location.pathname === "/"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => navigate("/")}
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
            <span className="font-sans font-medium text-sm sm:text-base tracking-wide">Transaction Details</span>
          </button>

          <button
            className={`flex items-center pb-1 ${
              location.pathname === "/history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => navigate("/history")}
          >
            <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
            <span className="font-sans font-medium tracking-wide text-sm sm:text-base">Transaction History</span>
          </button>
        </div>

        {/* Action Buttons */}
        {/* <div className="flex flex-row w-full gap-2">

<button
  onClick={handleSave}
  disabled={loading}
  onKeyDown={(e) => {
    if (e.ctrlKey && e.key === "s" && !loading) {
      e.preventDefault();
      handleSave();
    }
  }}
  className="w-1/3 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
  aria-label="Save transaction"
>
  <FontAwesomeIcon icon={faSave} className="mr-1 sm:mr-2" />
  {loading ? "Saving..." : "Save"}
</button>

<button
  onClick={handleReset}
  className="w-1/3 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
>
  <FontAwesomeIcon icon={faUndo} className="mr-1 sm:mr-2" />
  Reset
</button>

<button
  onClick={handleReset}
  className="w-1/3 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-yellow-400 text-gray-800 hover:bg-yellow-600 hover:text-white"
>
  <FontAwesomeIcon icon={faCopy} className="mr-1 sm:mr-2" />
  Copy
</button>

</div> */}

        
       <div className="flex sm:flex-row lg:flex-wrap gap-2 w-full justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "s" && !loading) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Save transaction"
          >
            <FontAwesomeIcon icon={faSave} className="mr-1 lg:mr-2" />
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleReset}
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faUndo} className="mr-1 lg:mr-2" />
            Reset
          </button>

          <button
            onClick={handleReset}
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faCopy} className="mr-1 lg:mr-2" />
          Copy
          </button>

          <button
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-1 lg:mr-2" />
            Print
          </button>

          {/* <button
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-1 lg:mr-2" />
            BIR Form
          </button> */}

          <button
            className="w-1/3 sm:w-auto text-[9px] sm:text-xs px-4 py-2 sm:px-2 sm:py-2 lg:px-4 lg:text-sm sm:py-2 rounded-lg bg-red-500 text-white  hover:bg-red-600 "
          >
            <FontAwesomeIcon icon={faCancel} className="mr-1 lg:mr-2" />
            Cancel
          </button>
        </div> 
      </div>
    </div>
  );
};

export default Header;

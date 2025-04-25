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
    <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md">
      {/* <div className="fixed top-20 left-0 w-full h-[80px] z-30 bg-white font-sans p-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4  shadow-md"> */}
      <div className="flex flex-col bg-white gap-4 shadow-md fixed top-20 left-0 border w-full px-2 py-2
                      sm:top-20 sm:px-2 sm:py-2
                      md:top-20 md:px-2 md:py-2 md:flex-row
                      lg:top-20 lg:px-4 lg:py-2
                      lg:flex-row lg:items-center lg:justify-between">
        
        {/* Header Tabs */}
        <div className="flex flex-wrap sm:flex-row justify-center md:justify-start gap-4 w-full">

          <button
            className={`flex items-center ${
              location.pathname === "/"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => navigate("/")}
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
              <span className="font-bold text-xs sm:text-sm md:text-sm lg:text-base tracking-wide">
              Transaction Details
              </span>
          </button>

          <button
            className={`flex items-center ${
              location.pathname === "/history"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => navigate("/history")}
          >
            <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
              <span className="font-bold text-xs md:text-sm sm:text-sm lg:text-base tracking-wide">
                Transaction History
              </span>
          </button>

        </div>

        {/* Action Buttons */}
      
       <div className="flex justify-center flex-row gap-2 w-full lg:justify-end">
       {/* <div className="flex sm:flex-row md:flex-wrap lg:flex-wrap justify-end gap-2 w-full overflow-x-auto"> */}
          <button
            onClick={handleSave}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "s" && !loading) {
                e.preventDefault();
                handleSave();
              }
            }}
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-1 py-1 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-1 lg:py-1 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            aria-label="Save transaction"
          >
            <FontAwesomeIcon icon={faSave} className="mr-1" />
            {loading ? "Saving..." : "Save"}
          </button>

          <button
            onClick={handleReset}
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faUndo} className="mr-1" />
            Reset
          </button>

          <button
            onClick={handleReset}
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faCopy} className="mr-1" />
          Copy
          </button>

          <button
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-1" />
            Print
          </button>

          <button
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faPrint} className="mr-1 " />
            BIR Form
          </button>

          <button
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-red-500 text-white  hover:bg-red-600 "
          >
            <FontAwesomeIcon icon={faCancel} className="mr-1" />
            Cancel
          </button>
        </div> 
      </div>
    </div>
  );
};

export default Header;

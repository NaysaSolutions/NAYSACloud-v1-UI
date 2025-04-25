import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPen, faSave, faUndo, faPrint, faCancel, faCopy, faInfoCircle, faVideo, faFilePdf, faSpinner  } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useReset } from "./ResetContext";


const Header = ({ docType, pdfLink, videoLink }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerReset } = useReset();
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    setLoading(true);
    console.log("Save button clicked");
    setTimeout(() => setLoading(false), 2000);
  };

  const handleReset = () => {
    console.log("Reset clicked");
    triggerReset();
  };

  const handleCancel = () => {
    setCancelLoading(true);
    console.log("Cancel button clicked");
    setTimeout(() => setCancelLoading(false), 2000);
  };

  const handlePDFGuide = () => {
    window.open(pdfLink, '_blank');
    setIsOpen(false);
  };

  const handleVideoGuide = () => {
    window.open(videoLink, '_blank');
    setIsOpen(false);
  };

  // const handlePDFGuide = () => {
  //   window.open('/public/NAYSA AP Check Voucher.pdf', '_blank');
  //   setIsOpen(false);
  // };

  // const handleVideoGuide = () => {
  //   window.open('https://youtu.be/x8CsG1pHSM8?si=zqipBKREBOeCxuYi', '_blank'); // YouTube or any other platform
  //   setIsOpen(false);
  // };

     // 🔁 Close on outside click
  // const dropdownRef = useRef(null);
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setIsOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md">
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
            {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
              ) : (
                <FontAwesomeIcon icon={faSave} className="mr-1" />
              )}
              Save
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
            onClick={() => setIsOpen(!isOpen)}
            className="w-1/6 w-[30px] mr-8 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
            {/* Guide */}
          </button>
          {isOpen && (
        <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={handlePDFGuide}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
              PDF Guide
            </button>
            <button
              onClick={handleVideoGuide}
              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-500" />
              Video Guide
            </button>
                </div>
                </div>
            )}


          {/* <button
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-red-500 text-white  hover:bg-red-600 "
          >
            <FontAwesomeIcon icon={faCancel} className="mr-1" />
            Cancel
          </button> */}


          <button
            onClick={handleCancel}
            disabled={cancelLoading}
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === "s" && !cancelLoading) {
                e.preventDefault();
                handleCancel();
              }
            }}
            className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-1 py-1 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-1 lg:py-1 lg:text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
            aria-label="Cancel transaction"
          >
            {cancelLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
              ) : (
                <FontAwesomeIcon icon={faCancel} className="mr-1" />
              )}
              Cancel
          </button>
        </div> 
      </div>
    </div>
  );
};

export default Header;

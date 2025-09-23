// import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faList, faPen, faSave, faUndo, faPrint, faCancel, faCopy, faInfoCircle, faVideo, faFilePdf, faSpinner  } from "@fortawesome/free-solid-svg-icons";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useReset } from "./ResetContext";


// const Header = ({ docType, pdfLink, videoLink, onPrint, printData, onReset, onSave, onPost}) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { triggerReset } = useReset();
//   const [loading, setLoading] = useState(false);
//   const [cancelLoading, setCancelLoading] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   const handleSave = () => {
//     setLoading(true);
//     console.log("Save button clicked");
//     if (onSave) {
//       onSave(); // Call the save handler from parent
//     }
//     setTimeout(() => setLoading(false), 2000);
//   };

//   const handlePost = () => {
//     setLoading(true);
//     console.log("Post button clicked");
//     if (onPost) {
//       onPost(); // Call the post handler from parent
//     }
//     setTimeout(() => setLoading(false), 2000);
//   };

//   const handleReset = () => {
//     console.log("Reset button clicked");
//     if (onReset) {
//       onReset(); // Call the reset handler from parent
//     }
//     // triggerReset(); // Keep the existing context reset if needed
//   };

  


//   const handleCancel = () => {
//     setCancelLoading(true);
//     console.log("Cancel button clicked");
//     setTimeout(() => setCancelLoading(false), 2000);
//   };

//   const handlePDFGuide = () => {
//     window.open(pdfLink, '_blank');
//     setIsOpen(false);
//   };

//   const handleVideoGuide = () => {
//     window.open(videoLink, '_blank');
//     setIsOpen(false);
//   };

//   const handlePrint = () => {
//     console.log("Print button clicked with data:", printData);
//     if (onPrint) {
//       onPrint(printData);
//     }
//   };

//   // const handlePDFGuide = () => {
//   //   window.open('/public/NAYSA AP Check Voucher.pdf', '_blank');
//   //   setIsOpen(false);
//   // };

//   // const handleVideoGuide = () => {
//   //   window.open('https://youtu.be/x8CsG1pHSM8?si=zqipBKREBOeCxuYi', '_blank'); // YouTube or any other platform
//   //   setIsOpen(false);
//   // };

//      // 🔁 Close on outside click
//   // const dropdownRef = useRef(null);
//   // useEffect(() => {
//   //   const handleClickOutside = (event) => {
//   //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//   //       setIsOpen(false);
//   //     }
//   //   };

//   //   document.addEventListener("mousedown", handleClickOutside);
//   //   return () => {
//   //     document.removeEventListener("mousedown", handleClickOutside);
//   //   };
//   // }, []);

//   return (
//     <div className="fixed top-0 left-0 w-full z-30 bg-white shadow-md dark:bg-black">
//       <div className="flex flex-col bg-white gap-4 shadow-md fixed top-20 left-0 border w-full px-2 py-2
//                       sm:top-20 sm:px-2 sm:py-2
//                       md:top-20 md:px-2 md:py-2 md:flex-row
//                       lg:top-20 lg:px-4 lg:py-2
//                       lg:flex-row lg:items-center lg:justify-between
//                       dark:bg-black dark:border-gray-600">
        
//         {/* Header Tabs */}
//         <div className="flex flex-wrap sm:flex-row justify-center md:justify-start gap-4 w-full">

//           <button
//             className={`flex items-center ${
//               location.pathname === "/"
//                 ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-300 dark:hover:text-blue-500"
//                 : "text-gray-600 hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-500"
//             }`}
//             onClick={() => navigate("/")}
//           >
//             <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
//               <span className="font-bold text-xs sm:text-sm md:text-sm lg:text-base tracking-wide">
//               Transaction Details
//               </span>
//           </button>

//           <button
//             className={`flex items-center ${
//               location.pathname === "/history"
//                 ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-600"
//                 : "text-gray-600 hover:text-blue-600 dark:text-gray-400 border-blue-800"
//             }`}
//             onClick={() => navigate("/history")}
//           >
//             <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
//               <span className="font-bold text-xs md:text-sm sm:text-sm lg:text-base tracking-wide">
//                 Transaction History
//               </span>
//           </button>

//         </div>

//         {/* Action Buttons */}
      
//        <div className="flex justify-center flex-row gap-2 w-full lg:justify-end">
//         <button
//             onClick={handleSave}
//             disabled={loading}
//             onKeyDown={(e) => {
//               if (e.ctrlKey && e.key === "s" && !loading) {
//                 e.preventDefault();
//                 handleSave();
//               }
//             }}
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-1 py-1 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-1 lg:py-1 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//             aria-label="Save transaction"
//           >
//             {loading ? (
//                 <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
//               ) : (
//                 <FontAwesomeIcon icon={faSave} className="mr-1" />
//               )}
//               Save
//           </button>

//           <button
//             onClick={handleReset}
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//           >
//             <FontAwesomeIcon icon={faUndo} className="mr-1" />
//             Reset
//           </button>

//           <button
//             onClick={handleReset}
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//           >
//             <FontAwesomeIcon icon={faCopy} className="mr-1" />
//           Copy
//           </button>

//           <button
//             onClick={handlePrint}
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//           >
//             <FontAwesomeIcon icon={faPrint} className="mr-1" />
//             Print
           
//           </button>

//           <button
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//           >
//             <FontAwesomeIcon icon={faPrint} className="mr-1 " />
//             BIR Form
//           </button>

//           <button
//     onClick={handlePost}
//     className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 dark:bg-green-800 dark:hover:bg-green-700"
//   >
//     <FontAwesomeIcon icon={faSave} className="mr-1" />
//     Post
//   </button>

//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="w-1/6 mr-8 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800"
//           >
//             <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
//             {/* Guide */}
//           </button>
//           {isOpen && (
//         <div className="absolute z-10 mt-1 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
//           <div className="py-1">
//             <button
//               onClick={handlePDFGuide}
//               className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//             >
//               <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
//               PDF Guide
//             </button>
//             <button
//               onClick={handleVideoGuide}
//               className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
//             >
//               <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-500" />
//               Video Guide
//             </button>
//                 </div>
//                 </div>
//             )}


//           {/* <button
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-2 py-2 sm:px-2 sm:py-2 md:px-1 md:py-1 lg:px-2 lg:py-2 lg:text-sm rounded-lg bg-red-500 text-white  hover:bg-red-600 "
//           >
//             <FontAwesomeIcon icon={faCancel} className="mr-1" />
//             Cancel
//           </button> */}


//           <button
//             onClick={handleCancel}
//             disabled={cancelLoading}
//             onKeyDown={(e) => {
//               if (e.ctrlKey && e.key === "s" && !cancelLoading) {
//                 e.preventDefault();
//                 handleCancel();
//               }
//             }}
//             className="w-1/6 text-[9px] whitespace-nowrap sm:text-xs px-1 py-1 sm:px-2 sm:py-1 md:px-1 md:py-1 lg:px-1 lg:py-1 lg:text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
//             aria-label="Cancel transaction"
//           >
//             {cancelLoading ? (
//                 <FontAwesomeIcon icon={faSpinner} spin className="mr-1" />
//               ) : (
//                 <FontAwesomeIcon icon={faCancel} className="mr-1" />
//               )}
//               Cancel
//           </button>
//         </div> 
//       </div>
//     </div>
//   );
// };

// export default Header;

import React, { useState, useRef, useEffect } from "react"; // Added useRef and useEffect for dropdown
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPen, faSave, faUndo, faPrint, faTimesCircle, faCopy, faInfoCircle, faVideo, faFilePdf, faSpinner, faPaperclip, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"; // Changed faCancel to faTimesCircle for better icon representation
import { useLocation, useNavigate } from "react-router-dom";
import { useReset } from "./ResetContext"; // Assuming ResetContext is correctly implemented and used


const Header = ({ docType, pdfLink, videoLink, onPrint, printData, onReset, onSave, onPost, onCancel, onCopy, onAttach }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { triggerReset } = useReset(); // Destructure triggerReset from useReset
    const [loading, setLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false); // Renamed isOpen to isGuideOpen for clarity

    const guideDropdownRef = useRef(null); // Ref for the guide dropdown

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (guideDropdownRef.current && !guideDropdownRef.current.contains(event.target)) {
                setIsGuideOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []); 

    const handleSave = () => {
        console.log("Save button clicked");
        if (onSave) {
            onSave(); // Call the save handler from parent
        }
    };

    const handlePost = () => {
        console.log("Post button clicked");
        if (onPost) {
            onPost(); // Call the post handler from parent
        }
    };

    const handleAttach = () => {
        if (onAttach) {
            onAttach(); // Call the post handler from parent
        }
    };

    const handleReset = () => {
        console.log("Reset button clicked");
        if (onReset) {
            onReset(); // Call the reset handler from parent
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };


    const handleCopy = () => {
        if (onCopy) {
            onCopy();
        }
    };

    const handlePDFGuide = () => {
        if (pdfLink) {
            window.open(pdfLink, '_blank');
        }
        setIsGuideOpen(false);
    };

    const handleVideoGuide = () => {
        if (videoLink) {
            window.open(videoLink, '_blank');
        }
        setIsGuideOpen(false);
    };

    const handlePrint = () => {
        console.log("Print button clicked with data:", printData);
        if (onPrint) {
            onPrint(printData);
        }
    };

    return (
        <div className="fixed top-[55px] left-0 w-full z-30 bg-white shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between px-4 py-2 gap-2 border-b border-gray-200 dark:border-gray-700">
                {/* Header Tabs */}
                <div className="flex flex-wrap justify-center md:justify-start gap-1 lg:gap-2 w-full md:w-auto">
                    <button
                        className={`flex items-center px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-colors duration-200 group
                            ${location.pathname === "/" 
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                                : "text-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300"
                            }`}
                        onClick={() => navigate("")}
                    >
                        <FontAwesomeIcon icon={faPen} className="w-4 h-3 mr-2" />
                        <span className="group-hover:block">Transaction Details</span>
                    </button>

                    <button
                        className={`flex items-center px-3 py-2 rounded-md text-xs md:text-sm font-bold transition-colors duration-200 group
                            ${location.pathname === "/CVhistory"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                : "text-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-blue-300"
                            }`}
                        onClick={() => navigate("/")}
                    >
                        <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
                        <span className="group-hover:block">Transaction History</span>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-center md:justify-end gap-1 lg:gap-2 w-full md:w-auto">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        onKeyDown={(e) => {
                            if (e.ctrlKey && e.key === "s" && !loading) {
                                e.preventDefault();
                                handleSave();
                            }
                        }}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-800 dark:hover:bg-blue-700 group"
                        aria-label="Save transaction"
                    >
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="" />
                        ) : (
                            <FontAwesomeIcon icon={faSave} className="" />
                        )}
                        <span className="hidden lg:block group-hover:block ml-2">Save</span>
                    </button>

                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-20 dark:bg-blue-800 dark:hover:bg-blue-700 group"
                    >
                        <FontAwesomeIcon icon={faUndo} className="" />
                        <span className="hidden lg:block group-hover:block ml-2">Reset</span>
                    </button>

                    <button
                        onClick={handleCopy}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-700 group"
                    >
                        <FontAwesomeIcon icon={faCopy} className="" />
                        <span className="hidden lg:block group-hover:block ml-2">Copy</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-700 group"
                    >
                        <FontAwesomeIcon icon={faPrint} className="" />
                        <span className="hidden lg:block group-hover:block ml-2">Print</span>
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-700 group"
                    >
                        <FontAwesomeIcon icon={faPrint} className="" />
                        <span className="hidden lg:block group-hover:block ml-2">BIR Form</span>
                    </button>

                    <button
                        onClick={handleAttach}
                        disabled={loading}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-800 dark:hover:bg-blue-700 group"
                    >
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="" />
                        ) : (
                            <FontAwesomeIcon icon={faPaperclip} className="" />
                        )}
                        <span className="hidden lg:block group-hover:block ml-2">Attach</span>
                    </button>

                    <div className="relative" ref={guideDropdownRef}>
                        <button
                            onClick={() => setIsGuideOpen(!isGuideOpen)}
                            className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-blue-800 dark:hover:bg-blue-700 group"
                            aria-haspopup="true"
                            aria-expanded={isGuideOpen ? "true" : "false"}
                        >
                            <FontAwesomeIcon icon={faInfoCircle} className="" />
                            <span className="hidden lg:block group-hover:block ml-2">Guide</span>
                        </button>
                        {isGuideOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700 dark:ring-gray-600 animate-fade-in-down">
                                <div className="py-1">
                                    <button
                                        onClick={handlePDFGuide}
                                        className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} className="mr-2 lg:mr-2 text-red-600" />
                                        PDF Guide
                                    </button>
                                    <button
                                        onClick={handleVideoGuide}
                                        className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <FontAwesomeIcon icon={faVideo} className="mr-2 lg:mr-2 text-blue-500" />
                                        Video Guide
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePost}
                        disabled={loading}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-600 group"
                    >
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="" />
                        ) : (
                            <FontAwesomeIcon icon={faExclamationTriangle} className="" />
                        )}
                        <span className="hidden lg:block group-hover:block ml-2">Post</span>
                    </button>

                    <button
                        onClick={handleCancel}
                        disabled={cancelLoading}
                        className="flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-700 dark:hover:bg-red-600 group"
                        aria-label="Cancel transaction"
                    >
                        {cancelLoading ? (
                            <FontAwesomeIcon icon={faSpinner} spin className="" />
                        ) : (
                            <FontAwesomeIcon icon={faTimesCircle} className="" />
                        )}
                        <span className="hidden lg:block group-hover:block ml-2">Cancel</span>
                    </button>
                </div>
            </div>

            {/* Tailwind CSS Animations */}
            <style jsx="true">{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Header;

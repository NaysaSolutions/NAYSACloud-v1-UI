import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrashAlt, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import BranchLookupModal from "C:/NSIApps/phpProgramming/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchBranchRef.jsx";
// import OpenBalanceModal from "./openBalanceQueryModal";

const APV = () => {
  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
  // const [showOpenBalanceModal, setShowOpenBalanceModal] = useState(false);
  const [selectionContext, setSelectionContext] = useState('');

  const [header, setHeader] = useState({
    apv_date: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setHeader((prev) => ({ ...prev, apv_date: today }));
  }, []);

 const handleBranchClick = (e) => {
  const parentDiv = e.currentTarget.closest('div[id]');
  const contextId = parentDiv?.id || 'unknown';
  setModalContext(contextId);
  setShowModal(true); // Open modal (branchModal will now handle the fetch)
};


  const handleSelectBranch = (selectedBranch) => {
    console.log("Selected branch for context:", selectionContext);
    console.log("Selected branch:", selectedBranch);

    if (selectedBranch) {
      if (selectionContext === 'apv_hd') {
        setBranchName(selectedBranch.branchName || "");
      }
        }

    setShowModal(false);
    setSelectionContext(''); // Reset context
  };

  const handleDeleteRow = (index) => {
    const updatedData = detailData.filter((_, i) => i !== index);
    setDetailData(updatedData);
  };

  // const handleOpenBalanceClick = () => {
  //   setShowOpenBalanceModal(true);
  // };

  // const handleCloseOpenBalanceModal = () => {
  //   setShowOpenBalanceModal(false);
  // };

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-roboto">

      {/* Form Layout */}
      <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 bg-white shadow-md p-9 rounded-lg relative">
        {/* Column 1 */}
        <div className="space-y-5">
          <div className="relative w-[250px]">
            <input
              type="text"
              id="branchName"
              placeholder=" "
              value={branchName}
              readOnly
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="branchName"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Branch
            </label>
            <button
            type="button"
            onClick={handleBranchClick} // Just pass the event directly now
            className="absolute inset-y-0 right-0 w-[40px] h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center justify-center focus:outline-none"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          </div>


          <div className="relative w-[250px]">
            <input
              type="text"
              id="APVNo"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="APVNo"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              APV No.
            </label>
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          <div className="relative w-[250px]">
            <input
              type="date"
              id="APVDate"
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
              value={header.apv_date}
            />
            <label
              htmlFor="APVDate"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              APV Date
            </label>
          </div>


          <div className="relative w-[250px]">
            <input
              type="text"
              id="payeeCode"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="payeeCode"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Payee Code
            </label>
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          <div className="relative w-[250px]">
            <input
              type="text"
              id="payeeName"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="payeeName"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Payee Name
            </label>
          </div>
        </div>

        {/* Column 2 */}
        <div className="space-y-5">
          <div className="relative w-[250px]">
            <input
              type="text"
              id="APVNo"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="APVNo"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Account Code
            </label>
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          <div className="relative w-[250px]">
            <input
              type="text"
              id="currCode"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="currCode"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Currency Code
            </label>
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          <div className="relative w-[250px]">
            <input
              type="text"
              id="currName"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
              disabled
            />
            <label
              htmlFor="currName"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Currency Name
            </label>
          </div>
        </div>

        {/* Open Balance Query Button
        <button
          onClick={handleOpenBalanceClick}
          className="absolute top-4 right-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline z-10"
        >
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
          Open Balance
        </button> */}

        {/* Remarks Section (adjust top position) */}
        <div className="relative w-[690px] col-span" style={{ marginTop: '5px' }}> {/* Adjust marginTop */}
          <textarea
            id="remarks"
            placeholder=""
            rows={13} // Adjust rows as needed
            className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pt-4 pb-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0 resize-none"
          />
          <label
            htmlFor="remarks"
            className="absolute left-2.5 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600"
          >
            Remarks
          </label>
        </div>

      </div>
      <br />
      
      {/* APV Detail Section */}
      <div id="apv_dtl">
      {/* Invoice Details Button */}
      <div className="flex items-center space-x-8 border-b-2 pb-2 mb-4">
        <button className="flex items-center text-gray-900 border-b-4 border-blue-600 pb-1">
          <span className="font-semibold">Invoice Details</span>
        </button>
      </div>

      {/* Invoice Details Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
        <table className="min-w-full table-auto border-collapse">
        <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">LN</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Type</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">RR No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Category</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Classification</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">PO/JO No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Invoice No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Invoice Date</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Orig Amount</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Currency</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Invoice Amount</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">DR Account</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">RC Code</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">RC Description</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">SL Code</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">VAT Code</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">VAT Description</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">VAT Amount</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">EWT Code</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">EWT Description</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">EWT Amount</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Terms</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Due Date</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900">Action</th>
            </tr>
          </thead>
        </table>
      </div>
      </div>
      <BranchLookupModal
  isOpen={showModal}
  branches={branches}
  onClose={(selected) => {
    if (selected) {
      console.log(`Branch selected in: ${modalContext}`);
      console.log('Selected branch:', selected);
      
      if (modalContext === 'apv_hd') {
        setBranchName(selected.branchName || "");
      } else if (modalContext === 'apv_dtl') {
      }
    }
    setShowModal(false);
    setModalContext(''); // Reset the context
  }}
/>

{/* <OpenBalanceModal
  isOpen={showOpenBalanceModal}
  onClose={handleCloseOpenBalanceModal}
/> */}

    </div>
  );
};

export default APV;
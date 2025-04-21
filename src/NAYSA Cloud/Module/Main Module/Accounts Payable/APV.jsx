// Importing React and its hooks (useState, useEffect) for managing component state and lifecycle
import React, { useState, useEffect } from "react";

// Importing FontAwesomeIcon component to use icons in the UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Importing specific solid icons from FontAwesome used in the component (e.g., search, add, delete, open folder)
import { faMagnifyingGlass, faPlus, faTrashAlt, faFolderOpen } from "@fortawesome/free-solid-svg-icons";

// Importing the Branch Lookup Modal component for selecting or searching branch references
import BranchLookupModal from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchBranchRef.jsx";

// Importing a custom hook or context for resetting forms or states across components
import { useReset } from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Components/ResetContext.jsx";

// Importing the Currency Lookup Modal component for selecting or searching currency references
import CurrLookupModal from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchCurrRef.jsx";

// Importing (currently commented out) the Open Balance Query Modal component, likely for future use
// import OpenBalanceModal from "./openBalanceQueryModal";


const APV = () => {
  // Accessing the reset flag from custom ResetContext (likely used to trigger form resets)
  const { resetFlag } = useReset();

  // State to hold table rows for the detail section (e.g., invoice line items)
  const [detailRows, setDetailRows] = useState([]);

  // State to hold the actual detail data associated with each row (e.g., backend or form data)
  const [detailData, setDetailData] = useState([]);

  // State to enable or disable fetching data (can be used to prevent duplicate API calls)
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);

  // State to control visibility of the branch lookup modal
  const [showModal, setShowModal] = useState(false);

  // State to store the list of fetched branches from the backend
  const [branches, setBranches] = useState([]);

  // State to hold the name of the selected branch
  const [branchName, setBranchName] = useState("");

  // State to identify the source or purpose of the modal trigger (e.g., which input field opened the modal)
  const [modalContext, setModalContext] = useState('');

  // Uncommented: State to control visibility of the Open Balance modal (currently not in use)
  // const [showOpenBalanceModal, setShowOpenBalanceModal] = useState(false);

  // State to identify which context or component made a selection (useful when reusing modals)
  const [selectionContext, setSelectionContext] = useState('');

  // State to control visibility of the currency lookup modal
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  // State to hold the selected currency code (defaulting to PHP)
  const [currencyCode, setCurrencyCode] = useState("");

  // State to hold the name of the selected currency (defaulting to Philippine Peso)
  const [currencyName, setCurrencyName] = useState("");



 // State for the APV header fields, starting with the APV date (can be expanded later)
const [header, setHeader] = useState({
  apv_date: "",
});

// useEffect to listen for resetFlag changes and clear specific fields when triggered
useEffect(() => {
  if (resetFlag) {
    setCurrencyCode("");
    setCurrencyName("");
    setBranchName("");
    console.log("Fields in APV reset!");
  }
}, [resetFlag]);

// Function to add a new row to the detail section with default empty values
const handleAddRow = () => {
  setDetailRows([
    ...detailRows,
    {
      type: "",
      rrNo: "",
      category: "",
      classification: "",
      poNo: "",
      invoiceNo: "",
      invoiceDate: "",
      origAmount: "",
      currency: "",
      invoiceAmount: "",
      drAccount: "",
      rcCode: "",
      rcDescription: "",
      slCode: "",
      vatCode: "",
      vatDescription: "",
      vatAmount: "",
      ewtCode: "",
      ewtDescription: "",
      ewtAmount: "",
      terms: "",
      dueDate: "",
    }
  ]);
};

// Opens the currency lookup modal
const openCurrencyModal = () => {
  setCurrencyModalOpen(true);
};

// Handles selection of a currency from the modal
const handleCurrencySelect = (selectedCurrency) => {
  if (selectedCurrency) {
    setCurrencyCode(selectedCurrency.currCode);
    setCurrencyName(selectedCurrency.currName);
  }
  setCurrencyModalOpen(false); // Close the modal after selection
};

// Set the default APV date to today when component is first mounted
useEffect(() => {
  const today = new Date().toISOString().split("T")[0];
  setHeader((prev) => ({ ...prev, apv_date: today }));
}, []);

// When the branch lookup button is clicked, determine the source context and show the modal
const handleBranchClick = (e) => {
  const parentDiv = e.currentTarget.closest('div[id]');
  const contextId = parentDiv?.id || 'unknown';
  setModalContext(contextId);
  setShowModal(true); // Open the branch modal (which will fetch data on its own)
};

// Handles selection of a branch from the modal
const handleSelectBranch = (selectedBranch) => {
  console.log("Selected branch for context:", selectionContext);
  console.log("Selected branch:", selectedBranch);

  if (selectedBranch) {
    // If the selection context is the header section, set the branch name
    if (selectionContext === 'apv_hd') {
      setBranchName(selectedBranch.branchName || "");
    }
  }

  setShowModal(false);        // Close the branch modal
  setSelectionContext('');    // Clear the context for future use
};

  // const handleDeleteRow = (index) => {
  //   const updatedData = detailData.filter((_, i) => i !== index);
  //   setDetailData(updatedData);
  // };

  // const handleOpenBalanceClick = () => {
  //   setShowOpenBalanceModal(true);
  // };

  // const handleCloseOpenBalanceModal = () => {
  //   setShowOpenBalanceModal(false);
  // };

  return (
     // Main container for the APV form with padding, background color, and custom font
  <div className="p-4 bg-gray-100 min-h-screen ">
{/* Page title and subheading */}
<div className="text-center justify-center m-0 h-16">
      <h1 className=" font-black text-2xl mt-[-15px]  text-blue-600">ACCOUNTS PAYABLE VOUCHER</h1>
      <span className=" font-black text-lg mb-[-20px] text-red-600">Posted Transaction</span>
    </div>

       {/* APV Header Form Section */}
    <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 bg-white shadow-lg p-5 rounded-lg relative" >

{/* Column 1 */}
<div className="space-y-5">
        
          {/* Branch Name Input with lookup button */}
          <div className="relative w-[270px] mx-auto">
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

            {/* Button to open branch lookup modal */}
            <button
            type="button"
            onClick={handleBranchClick} // Just pass the event directly now
            className="absolute inset-y-0 right-0 w-[40px] h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center justify-center focus:outline-none"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          </div>

        {/* APV Number Field */}
          <div className="relative w-[270px] mx-auto">
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

            {/* APV Number Lookup button */}
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          {/* APV Date Picker */}
          <div className="relative w-[270px] mx-auto">
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
        </div>

        {/* Column 2 */}
        <div className="space-y-5">
        {/* Payee Code Input with optional lookup */}
        <div className="relative w-[270px] mx-auto">
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
          
          {/* Payee Name Display */}
          <div className="relative w-[270px] mx-auto">
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

          {/* AP Account Code Input */}
          <div className="relative w-[270px] mx-auto">
            <input
              type="text"
              id="APVNo"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="acctCode"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              AP Account
            </label>
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>
        </div>
                  
        {/* Column 3 */}
        <div className="space-y-5">
          
        <div className="relative w-[270px] mx-auto">
            <input
              type="text"
              id="currCode"
              placeholder=" "
              value={currencyCode}
              readOnly
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="currCode"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Currency
            </label>
            <button
                    onClick={openCurrencyModal}
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

          <div className="relative w-[270px] mx-auto">
          <input
  type="text"
  id="currName"
  value={currencyName}
  readOnly
  placeholder=" "
  className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
/>
            <label
              htmlFor="currName"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Currency Rate
            </label>
          </div>

          <div className="relative w-[270px] mx-auto">
  <select
    id="apType"
    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 pr-8 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
    defaultValue="purchases"
  >
    <option value="purchases">Purchases</option>
    <option value="non-purchases">Non-Purchases</option>
    <option value="advances">Advances</option>
    <option value="replenishment">Replenishment</option>
    <option value="reimbursement">Reimbursement</option>
    <option value="liquidation">Liquidation</option>
  </select>
  <label
    htmlFor="apType"
    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
  >
    AP Type
  </label>

  {/* Dropdown Icon */}
  <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
    <svg
      className="h-4 w-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>



          </div>  

          {/* Column 4 */}
        <div className="space-y-5">        

          <div className="relative w-[270px] mx-auto">
            <input
              type="text"
              id="refDocNo1"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="refDocNo1"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Ref Doc No. 1
            </label>
          </div>

          <div className="relative w-[270px] mx-auto">
            <input
              type="text"
              id="refDocNo2"
              placeholder=" "
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
            />
            <label
              htmlFor="refDocNo2"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              Ref Doc No. 2
            </label>
          </div>
          </div>  

        {/* Open Balance Query Button */}
        {/* <button
          onClick={handleOpenBalanceClick}
          className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline z-10"
        >
          <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
          Open Balance
        </button> */}

        {/* Remarks Section */}
        <div className="relative w-full col-span-full mt-[-62px]">
    <textarea
      id="remarks"
      placeholder=""
      rows={5}
      className="peer block w-[99%] mx-auto appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pt-4 pb-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0 resize-none"
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
    <button className="flex items-center text-blue-600 border-b-2 border-blue-600 pb-1">
      <span className="font-semibold">Invoice Details</span>
    </button>
    <button className="flex items-center text-gray-900 border-b-4  pb-1">
      <span className="font-semibold">General Ledger</span>
    </button>
  </div>

  {/* Table */}
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
  <div className="max-h-[430px] overflow-y-auto relative"> 
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-gray-200 z-10">
        <tr>
          <th className="px-3 py-4 text-center text-xs font-bold text-gray-900">LN</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Type</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">RR No.</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">PO/JO No.</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Invoice No.</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Invoice Date</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Original Amount</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Currency</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Invoice Amount</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">DR Account</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">RC Code</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">RC Name</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">SL Code</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">VAT Code</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">VAT Name</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">VAT Amount</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">ATC</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">ATC Name</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">ATC Amount</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Payment Terms</th>
          <th className="px-1 py-1 border text-center text-xs font-bold text-gray-900">Due Date</th>
        </tr>
      </thead>
      <tbody className="relative">
        {detailRows.map((row, index) => (
          <tr key={index} className="hover:bg-gray-50 bg-white">
            <td className="border px-1 py-1 text-xs text-center">{index + 1}</td>
            <td className="border px-1 py-1">
              <select
                className="w-[50px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.type || ""}
                // onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
              >
                <option value="FG">FG</option>
                <option value="MS">MS</option>
                <option value="RM">RM</option>
              </select>
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-6 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.rrNo || ""}
                onChange={(e) => handleDetailChange(index, 'rrNo', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.poNo || ""}
                onChange={(e) => handleDetailChange(index, 'poNo', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.invoiceNo || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceNo', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="date"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.invoiceDate || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.origAmount || ""}
                onChange={(e) => handleDetailChange(index, 'origAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[80px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.currency || ""}
                onChange={(e) => handleDetailChange(index, 'currency', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.invoiceAmount || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.drAccount || ""}
                onChange={(e) => handleDetailChange(index, 'drAccount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.rcCode || ""}
                onChange={(e) => handleDetailChange(index, 'rcCode', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.rcDescription || ""}
                onChange={(e) => handleDetailChange(index, 'rcDescription', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.slCode || ""}
                onChange={(e) => handleDetailChange(index, 'slCode', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.vatCode || ""}
                onChange={(e) => handleDetailChange(index, 'vatCode', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.vatDescription || ""}
                onChange={(e) => handleDetailChange(index, 'vatDescription', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.vatAmount || ""}
                onChange={(e) => handleDetailChange(index, 'vatAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.ewtCode || ""}
                onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.ewtDescription || ""}
                onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.ewtAmount || ""}
                onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.terms || ""}
                onChange={(e) => handleDetailChange(index, 'terms', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="date"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.dueDate || ""}
                onChange={(e) => handleDetailChange(index, 'dueDate', e.target.value)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>

  {/* Add Button */}
  <button
    onClick={handleAddRow}
    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 text-sm rounded-lg flex items-center justify-center focus:outline-none"
  >
    <FontAwesomeIcon icon={faPlus} className="mr-2" />
    Add
  </button>
</div>      <BranchLookupModal
  isOpen={showModal}
  branches={branches}
  // params={
  //   //add params here
  // }
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

{currencyModalOpen && (
        <CurrLookupModal 
          isOpen={currencyModalOpen}
          onClose={handleCurrencySelect}
        />
      )}

{/* <OpenBalanceModal
  isOpen={showOpenBalanceModal}
  onClose={handleCloseOpenBalanceModal}
/> */}

    </div>
  );
};

export default APV;
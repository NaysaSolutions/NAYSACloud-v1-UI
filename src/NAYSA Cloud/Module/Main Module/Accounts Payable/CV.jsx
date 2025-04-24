import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

// Lookup/Modal
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef.jsx";
import CurrLookupModal from "@/NAYSA Cloud/Lookup/SearchCurrRef.jsx";

// Global
import { useReset } from "@/NAYSA Cloud/Components/ResetContext.jsx";
import { docTypeNames } from '@/NAYSA Cloud/Global/doctype';

const CV = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpecs, setCurrentSpecs] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [GLactiveTab, setGLActiveTab] = useState("invoice");


  //Document Global Setup
  const docType = 'CV'; 
  const documentTitle = docTypeNames[docType] || 'Transaction';

  //Status Global Setup
  const displayStatus = status || 'OPEN';
  let statusColor = 'global-tran-stat-text-open-ui';
  if (displayStatus === 'FINALIZED') {
    statusColor = 'global-tran-stat-text-finalized-ui';
  } else if (['CANCELLED', 'CLOSED'].includes(displayStatus)) {
    statusColor = 'global-tran-stat-text-closed-ui';
  }


  const { resetFlag } = useReset();

  const [detailRows, setDetailRows] = useState([]);
  const [detailRowsGL, setDetailRowsGL] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');

  // Uncommented: State to control visibility of the Open Balance modal (currently not in use)
  // const [showOpenBalanceModal, setShowOpenBalanceModal] = useState(false);

  // State to identify which context or component made a selection (useful when reusing modals)
  const [selectionContext, setSelectionContext] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("PHP");
  const [currencyName, setCurrencyName] = useState("");

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
      apType: "",
      rrNo: "",
      poNo: "",
      invoiceNo: "",
      invoiceDate: "",
      origAmount: "0.00",
      currency: "PHP",
      invoiceAmount: "0.00",
      appliedAmount: "0.00",
      unappliedAmount: "",
      drAccount: "",
      rcCode: "",
      rcDescription: "",
      slCode: "",
      vatCode: "",
      vatDescription: "",
      vatAmount: "0.00",
      ewtCode: "",
      ewtDescription: "",
      ewtAmount: "0.00",
    }
  ]);
};

const handleDeleteRow = (index) => {
  const updatedRows = [...detailRows];
  updatedRows.splice(index, 1);
  setDetailRows(updatedRows); // assuming you're using useState
};

// Function to add a new row to the detail section with default empty values
const handleAddRowGL = () => {
  setDetailRowsGL([
    ...detailRowsGL,
    {
      acctCode: "",
      rcCode: "",
      slCode: "",
      particulars: "",
      vatCode: "",
      vatDescription: "",
      ewtCode: "",
      ewtDescription: "",
      debit: "0.00",
      credit: "0.00",
      slRefNo: "",
      remarks: "",
    }
  ]);
};

const handleDeleteRowGL = (index) => {
  const updatedRows = [...detailRowsGL];
  updatedRows.splice(index, 1);
  setDetailRowsGL(updatedRows); // assuming you're using useState
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




  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-12">


      {/* Header Section */}
      <div className="global-tran-header-ui mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">

        <div className="text-center sm:text-left">
          <h1 className="global-tran-headertext-ui">{documentTitle}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center sm:items-start text-center sm:text-left">
          <div>
            <p className="global-tran-headerstat-text-ui">Transaction Status</p>
              <h1 className={`global-tran-stat-text-ui ${statusColor}`}>
              {displayStatus}
            </h1>
          </div>
        </div>

    </div> 
        
 
      {/* Form Layout with Tabs */}
    <div className="bg-white shadow-md rounded-lg p-3">
        {/* Tab Navigation */}
        <div className="flex border-b text-sm sm:text-base lg:text-base">
          <button
            className={`py-2 px-4 ${activeTab === 'basic' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 font-medium'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'check' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 font-medium'}`}
            onClick={() => setActiveTab('check')}
          >
            Check Information
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-2">
          {activeTab === 'basic' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-3"> {/* Added gap-y-4 for vertical spacing */}
              {/* Column 1 */}
              <div className="space-y-4 p-4">
                <div className="relative">
                  <input
                    type="text"
                    id="BranchCode"
                    placeholder=" "
                    className="peer global-tran-textbox-ui focus:border-blue-600 focus:outline-none focus:ring-0"
                    disabled
                  />
                  <label
                    htmlFor="BranchCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Branch
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    CV No.
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="date"
                    id="APVDate"
                    className="peer global-tran-textbox-ui"
                    value={header.apv_date}
                  />
                  <label
                    htmlFor="APVDate"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    CV Date
                  </label>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4 p-4">
                <div className="relative">
                  <input
                    type="text"
                    id="payeeCode"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
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

                <div className="relative">
                  <input
                    type="text"
                    id="payeeName"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="payeeName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payee Name
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="refAPV"
                    className="peer global-tran-textbox-ui"
                    defaultValue=""
                  >
                    <option value="Y" disabled hidden></option>
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                  <label
                    htmlFor="refAPV"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    With Ref APV
                  </label>
                </div>

              </div>

              {/* Column 3 */}
              <div className="space-y-4 p-4">
                
              <div className="relative">
                  <select
                    id="apType"
                    className="peer global-tran-textbox-ui"
                    defaultValue=""
                  >
                    <option value="APV001" disabled hidden></option>
                    <option value="APV001">Purchases</option>
                    <option value="APV002">Non-Purchases</option>
                  </select>
                  <label
                    htmlFor="apType"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    AP Type
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="refDocNo"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="refDocNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Ref Doc No.
                  </label>
                </div>
              </div>

              {/* Column 4 - Remarks */}
              <div className="col-span-full"> 
                <div className="relative w-full p-3">
                  <textarea
                    id="remarks"
                    placeholder=""
                    rows={5} 
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="remarks"
                    className="absolute left-6 top-4 z-10 origin-[0] scale-75 transform bg-white px-1 text-sm text-gray-600 transition-all 
                      peer-placeholder-shown:top-6 peer-placeholder-shown:scale-100 
                      peer-focus:top-1 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Remarks
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* Column 3 */}
              <div className="space-y-4 p-4">
              <div className="relative">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Bank Name
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="currName"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Bank Account No.
                  </label>
                </div>

                <div className="relative">
                  <select
                    id="currName"
                    className="peer global-tran-textbox-ui"
                    defaultValue=""
                  >
                    <option value="CV001" disabled hidden></option>
                    <option value="CV002">Check</option>
                    <option value="CV003">Cash</option>
                    <option value="CV003">Wired</option>
                    <option value="CV003">Authority to Debit</option>
                    <option value="CV003">Bank Transfer</option>
                    <option value="CV003">Gcash/Paymaya</option>
                  </select>
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payment Type
                  </label>
                </div>

              </div>

              {/* Column 4 */}
              <div className="space-y-4 p-4">

              <div className="relative">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check No.
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Date
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="currName"
                    placeholder=" "
                    defaultValue="0.00"
                    className="peer global-tran-textbox-ui text-right"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Amount (Original)
                  </label>
                </div>
              </div>

              {/* Column 5 */}
              <div className="space-y-4 p-4">

              <div className="relative">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Currency
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="currCode"
                    placeholder=" "
                    className="peer global-tran-textbox-ui text-right"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Currency Rate
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="currName"
                    placeholder=" "
                    defaultValue="0.00"
                    className="peer global-tran-textbox-ui text-right"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Amount (Php)
                  </label>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
      <br />

      {/* Invoice Details Button */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      
      {/* <div className="flex items-center space-x-8 border-b-2 pb-2 mb-4">
    <button className="flex items-center text-blue-600 border-b-2 border-blue-600 pb-1">
      <span className="font-semibold">Invoice Details</span>
    </button>
    <button className="flex items-center text-gray-900 border-b-4  pb-1">
      <span className="font-semibold">General Ledger</span>
    </button>
  </div> */}

  {/* Tab Navigation */}
  <div className="flex border-b mb-4 text-sm sm:text-base lg:text-base">
          <button
            className={`py-2 px-4 ${GLactiveTab === 'invoice' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 font-medium'}`}
            onClick={() => setGLActiveTab('invoice')}
          >
            Invoice Details
          </button>
          {/* <button
            className={`py-2 px-4 ${GLactiveTab === 'gl' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 font-medium'}`}
            onClick={() => setGLActiveTab('gl')}
          >
            General Ledger
          </button> */}
        </div>

      {/* Invoice Details Table */}
      {/* Table */}
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg h-[360px]">
  <div className="max-h-[360px] overflow-y-auto relative"> 
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-blue-300 z-10">
        <tr>
          <th className="global-tran-th-ln-ui">LN</th>
          <th className="global-tran-th-ui">AP Type</th>
          <th className="global-tran-th-ui">RR No.</th>
          <th className="global-tran-th-ui">PO/JO No.</th>
          <th className="global-tran-th-ui">Invoice No.</th>
          <th className="global-tran-th-ui">Invoice Date</th>
          <th className="global-tran-th-ui">Original Amount</th>
          <th className="global-tran-th-ui">Currency</th>
          <th className="global-tran-th-ui">Invoice Amount</th>
          <th className="global-tran-th-ui">Applied Amount</th>
          <th className="global-tran-th-ui">Unapplied Amount</th>
          <th className="global-tran-th-ui">DR Account</th>
          <th className="global-tran-th-ui">RC Code</th>
          <th className="global-tran-th-ui">RC Name</th>
          <th className="global-tran-th-ui">SL Code</th>
          <th className="global-tran-th-ui">VAT Code</th>
          <th className="global-tran-th-ui">VAT Name</th>
          <th className="global-tran-th-ui">VAT Amount</th>
          <th className="global-tran-th-ui">ATC</th>
          <th className="global-tran-th-ui">ATC Name</th>
          <th className="global-tran-th-ui">ATC Amount</th>
          <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 z-30">Add</th>
          <th className="global-tran-th-ui sticky right-0 bg-blue-300 z-30">Delete</th>
        </tr>
      </thead>
      <tbody className="relative">
        {detailRows.map((row, index) => (
          <tr key={index} className="hover:bg-blue-100 border">

            <td className="w-[50px] global-tran-td-ui text-center">{index + 1}</td>
            <td className="global-tran-td-ui">
              <select
                className="w-[120px] global-tran-td-inputclass-ui"
                value={row.aptype || ""}
                onChange={(e) => handleDetailChange(index, 'apType', e.target.value)}
              >
                <option value="APV001">Purchases</option>
                <option value="APV004">Liquidation</option>
                <option value="APV005">Replenishment</option>
                <option value="APV006">Reimbursement</option>
              </select>
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.rrNo || ""}
                onChange={(e) => handleDetailChange(index, 'rrNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.poNo || ""}
                onChange={(e) => handleDetailChange(index, 'poNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.invoiceNo || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="date"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.invoiceDate || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.origAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'origAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[80px] global-tran-td-inputclass-ui text-center"
                value={row.currency || "PHP"}
                onChange={(e) => handleDetailChange(index, 'currency', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.invoiceAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'invoiceAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.appliedAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'appliedAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.unappliedAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'unappliedAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.drAccount || ""}
                onChange={(e) => handleDetailChange(index, 'drAccount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.rcCode || ""}
                onChange={(e) => handleDetailChange(index, 'rcCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.rcDescription || ""}
                onChange={(e) => handleDetailChange(index, 'rcDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.slCode || ""}
                onChange={(e) => handleDetailChange(index, 'slCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.vatCode || ""}
                onChange={(e) => handleDetailChange(index, 'vatCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.vatDescription || ""}
                onChange={(e) => handleDetailChange(index, 'vatDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] global-tran-td-inputclass-ui text-right"
                value={row.vatAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'vatAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.ewtCode || ""}
                onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.ewtDescription || ""}
                onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] global-tran-td-inputclass-ui text-right"
                value={row.ewtAmount || "0.00"}
                onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui text-center sticky right-10">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition w-[35px]"
                onClick={() => handleAddRow(index)}
                >
                  {/* Add */}
                   <FontAwesomeIcon icon={faPlus} />
                </button>
            </td>
            <td className="global-tran-td-ui text-center sticky right-0">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition w-[35px]"
                onClick={() => handleDeleteRow(index)}
                >
                  {/* Delete                  */}
                  <FontAwesomeIcon icon={faMinus} />
                </button>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>


  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 gap-4 sm:gap-0">
  {/* Add Button */}
  <div className="flex justify-center sm:justify-start">
    <button
      onClick={handleAddRow}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 text-sm rounded-lg flex items-center justify-center focus:outline-none w-full sm:w-auto"
    >
      Add
    </button>
  </div>

  {/* Totals Section */}
  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 sm:gap-x-8 p-2">
    <div className="flex justify-between sm:items-center sm:gap-2">
      <label htmlFor="TotalInvoice" className="global-tran-total-header-ui">
        Total Invoice:
      </label>
      <label className="global-tran-total-value-ui">0.00</label>
    </div>
    <div className="flex justify-between sm:items-center sm:gap-2">
      <label htmlFor="TotalVAT" className="global-tran-total-header-ui">
        Total VAT:
      </label>
      <label className="global-tran-total-value-ui">0.00</label>
    </div>
    <div className="flex justify-between sm:items-center sm:gap-2">
      <label htmlFor="TotalATC" className="global-tran-total-header-ui">
        Total ATC:
      </label>
      <label className="global-tran-total-value-ui">0.00</label>
    </div>
    <div className="flex justify-between sm:items-center sm:gap-2">
      <label htmlFor="TotalPayable" className="global-tran-total-header-ui">
        Total Payable:
      </label>
      <label className="global-tran-total-value-ui">0.00</label>
    </div>
  </div>
</div>



      </div>



      
      {/* General Ledger Button */}
      <div className="bg-white shadow-md rounded-lg p-4">
      
      {/* <div className="flex items-center space-x-8 border-b-2 pb-2 mb-4">
    <button className="flex items-center text-blue-600 border-b-2 border-blue-600 pb-1">
      <span className="font-semibold">Invoice Details</span>
    </button>
    <button className="flex items-center text-gray-900 border-b-4  pb-1">
      <span className="font-semibold">General Ledger</span>
    </button>
  </div> */}

  {/* Tab Navigation */}
  <div className="flex border-b mb-4 text-sm sm:text-base lg:text-base">
    
          {/* <button
            className={`py-2 px-4 ${GLactiveTab === 'invoice' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 font-medium'}`}
            onClick={() => setGLActiveTab('invoice')}
          >
            Invoice Details
          </button> */}
          <button
            className={`py-2 px-4 ${GLactiveTab === 'invoice' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 font-medium'}`}
            onClick={() => setGLActiveTab('invoice')}
          >
            General Ledger
          </button>
          
        </div>


      {/* GL Details Table */}
      {/* Table */}
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg h-[360px]">
  <div className="max-h-[360px] overflow-y-auto relative"> 
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-blue-300 z-10">
        <tr>
          <th className="global-tran-th-ln-ui">LN</th>
          <th className="global-tran-th-ui">Account Code</th>
          <th className="global-tran-th-ui">RC Code</th>
          <th className="global-tran-th-ui">SL Code</th>
          <th className="global-tran-th-ui">Particulars</th>
          <th className="global-tran-th-ui">VAT Code</th>
          <th className="global-tran-th-ui">VAT Name</th>
          <th className="global-tran-th-ui">ATC</th>
          <th className="global-tran-th-ui">ATC Name</th>
          <th className="global-tran-th-ui">Debit</th>
          <th className="global-tran-th-ui">Credit</th>
          <th className="global-tran-th-ui">SL Ref No</th>
          <th className="global-tran-th-ui">Remarks</th>
          <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 z-30">Add</th>
          <th className="global-tran-th-ui sticky right-0 bg-blue-300 z-30">Delete</th>
        </tr>
      </thead>
      <tbody className="relative">
        {detailRowsGL.map((row, index) => (
          <tr key={index} className="hover:bg-blue-100 border">
            
            <td className="global-tran-td-ui text-xs text-center">{index + 1}</td>
            <td className="global-tran-td-ui">
            <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.acctCode || ""}
                onChange={(e) => handleDetailChange(index, 'acctCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.rcCode || ""}
                onChange={(e) => handleDetailChange(index, 'rcCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.slCode || ""}
                onChange={(e) => handleDetailChange(index, 'slCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[150px] global-tran-td-inputclass-ui"
                value={row.particulars || ""}
                onChange={(e) => handleDetailChange(index, 'particulars', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.vatCode || ""}
                onChange={(e) => handleDetailChange(index, 'vatCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.vatDescription || ""}
                onChange={(e) => handleDetailChange(index, 'vatDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.ewtCode || ""}
                onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[80px] global-tran-td-inputclass-ui"
                value={row.ewtDescription || ""}
                onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui text-right">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.debit || "0.00"}
                onChange={(e) => handleDetailChange(index, 'debit', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui text-right">
              <input
                type="number"
                className="w-[120px] global-tran-td-inputclass-ui text-right"
                value={row.credit || "0.00"}
                onChange={(e) => handleDetailChange(index, 'credit', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.slRefNo || ""}
                onChange={(e) => handleDetailChange(index, 'slRefNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.remarks || ""}
                onChange={(e) => handleDetailChange(index, 'remarks', e.target.value)}
              />
            </td>
            
            <td className="global-tran-td-ui text-center sticky right-10">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition w-[35px]"
                onClick={() => handleAddRowGL(index)}
                >
                  {/* Add */}
                   <FontAwesomeIcon icon={faPlus} />
                </button>
            </td>
            <td className="global-tran-td-ui text-center sticky right-0">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition w-[35px]"
                onClick={() => handleDeleteRowGL(index)}
                >
                  {/* Delete                  */}
                  <FontAwesomeIcon icon={faMinus} />
                </button>
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>




  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 gap-4 sm:gap-0">
  {/* Add Button */}
  <div className="flex justify-center sm:justify-start">
    <button
      onClick={handleAddRowGL}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 text-sm rounded-lg flex items-center justify-center focus:outline-none w-full sm:w-auto"
    >
      Add
    </button>
  </div>

  {/* Totals Section */}
  <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-10 gap-y-2">
    <label htmlFor="TotalDebit" className="global-tran-total-header-ui">
      Total Debit:
    </label>
    <label htmlFor="TotalCredit" className="global-tran-total-value-ui">
      0.00
    </label>
    <label htmlFor="TotalCredit" className="global-tran-total-header-ui">
      Total Credit:
    </label>
    <label htmlFor="TotalCredit" className="global-tran-total-value-ui">
      0.00
    </label>
  </div>
</div>



      </div>



    </div>
  );
};

export default CV;
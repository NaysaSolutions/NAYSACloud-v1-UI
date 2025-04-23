import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import BranchLookupModal from "@/NAYSA Cloud/Lookup/SearchBranchRef.jsx";
import { useReset } from "@/NAYSA Cloud/Components/ResetContext.jsx";
import CurrLookupModal from "@/NAYSA Cloud/Lookup/SearchCurrRef.jsx";
import Swal from 'sweetalert2';
// import './index.css';

const CV = () => {

  // const [detailData, setDetailData] = useState([]);
  // const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpecs, setCurrentSpecs] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeTab, setActiveTab] = useState("basic"); // State for active tab
  const [GLactiveTab, setGLActiveTab] = useState("invoice"); // State for active tab


const { resetFlag } = useReset();

  // State to hold table rows for the detail section (e.g., invoice line items)
  const [detailRows, setDetailRows] = useState([]);

  // State to hold table rows for the detail section (e.g., invoice line items)
  const [detailRowsGL, setDetailRowsGL] = useState([]);

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

// Function to add a new row to the detail section with default empty values
const handleAddRowGL = () => {
  setDetailRowsGL([
    ...detailRowsGL,
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen mt-14">

{/* <div className="text-center justify-center mb-4">
<h1 className=" font-black text-4xl mb-4 text-blue-600">CHECK VOUCHER</h1>
 <span className=" font-black text-2xl text-red-600">Posted Transaction</span>
 </div> */}

{/* <div className="text-center justify-center mb-4">
 <span className=" font-black text-2xl text-red-600">Posted Transaction</span>
 </div> */}
  {/* Header Section */}
  <div className="global-div-header-ui mb-6 flex justify-between items-center">
  {/* <h1 className="global-div-headertext-ui">CHECK VOUCHER TRANSACTION</h1> */}
  {/* <h1 className="global-div-headertext-ui text-red-700">Posted Transaction</h1> */}
  <h1 className="global-div-headertext-ui">Check Voucher Transaction</h1>
  <h1 className="global-div-post-text-ui text-red-600 drop-shadow-[0_0_2px_#f87171]">
  POSTED
</h1>

</div>

        
 
      {/* Form Layout with Tabs */}
      <div className="bg-white shadow-md rounded-lg p-4">
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
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
                    className="peer transaction-textbox-ui focus:border-blue-600 focus:outline-none focus:ring-0"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
                  />
                  <label
                    htmlFor="payeeName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payee Name
                  </label>
                </div>

                {/* <div className="relative">
                  <input
                    type="text"
                    id="refAPV"
                    placeholder=" "
                    className="peer transaction-textbox-ui"
                  />
                  <label
                    htmlFor="refAPV"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    with Ref APV
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div> */}

                <div className="relative">
                  <select
                    id="refAPV"
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
                    defaultValue=""
                  >
                    <option value="CV001" disabled hidden></option>
                    <option value="CV002">Check</option>
                    <option value="CV003">Cash</option>
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
                    className="peer transaction-textbox-ui"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check No.
                  </label>
                  {/* <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button> */}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer transaction-textbox-ui"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Date
                  </label>
                  {/* <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button> */}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="currName"
                    placeholder=" "
                    defaultValue="0.00"
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
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
                    className="peer transaction-textbox-ui"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Currency Rate
                  </label>
                  {/* <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button> */}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="currName"
                    placeholder=" "
                    defaultValue="0.00"
                    className="peer transaction-textbox-ui"
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
  <div className="flex border-b mb-4">
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
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
  <div className="max-h-[430px] overflow-y-auto relative"> 
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-blue-300 z-10">
        <tr>
          <th className="px-3 py-4 text-center text-xs font-bold text-gray-900">LN</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Type</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">RR No.</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">PO/JO No.</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Invoice No.</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Invoice Date</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Original Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Currency</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Invoice Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">DR Account</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">RC Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">RC Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">SL Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Payment Terms</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Due Date</th>
        </tr>
      </thead>
      <tbody className="relative">
        {detailRows.map((row, index) => (
          <tr key={index} className="hover:bg-blue-100 border">
            <td className="border px-1 py-1 text-xs text-center">{index + 1}</td>
            <td className="border px-1 py-1">
              <select
                className="w-[50px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.type || ""}
                onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
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
    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 text-sm rounded-lg flex items-center justify-center focus:outline-none"
  >
    {/* <FontAwesomeIcon icon={faPlus} className="mr-2" /> */}
    Add
  </button>


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
  <div className="flex border-b mb-4">
    
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


      {/* Invoice Details Table */}
      {/* Table */}
  <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
  <div className="max-h-[430px] overflow-y-auto relative"> 
    <table className="min-w-full border-collapse">
      <thead className="sticky top-0 bg-blue-300 z-10">
        <tr>
          <th className="px-3 py-4 text-center text-xs font-bold text-gray-900">LN</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Account Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">RC Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">SL Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Debit</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Credit</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">SL Ref No</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Remarks</th>
          {/* <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">SL Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Code</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">VAT Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC Name</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">ATC Amount</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Payment Terms</th>
          <th className="px-1 py-1 text-center text-xs font-bold text-gray-900">Due Date</th> */}
        </tr>
      </thead>
      <tbody className="relative">
        {detailRowsGL.map((row, index) => (
          <tr key={index} className="hover:bg-blue-100 border">
            <td className="border px-1 py-1 text-xs text-center">{index + 1}</td>
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
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.invoiceDate || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
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
                type="number"
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
            
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  </div>

 {/* Add Button */}
  <button
    onClick={handleAddRowGL}
    className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 text-sm rounded-lg flex items-center justify-center focus:outline-none"
  >
    {/* <FontAwesomeIcon icon={faPlus} className="mr-2" /> */}
    Add
  </button>


      </div>



    </div>
  );
};

export default CV;
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faTrashAlt, faFolderOpen  } from "@fortawesome/free-solid-svg-icons";
import BranchLookupModal from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchBranchRef.jsx";
import { useReset } from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Components/ResetContext.jsx";
import CurrLookupModal from "C:/Users/mendo/OneDrive/Desktop/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchCurrRef.jsx";
// import OpenBalanceModal from "./openBalanceQueryModal";

const APV = () => {
  const { resetFlag } = useReset();

  const [detailRows, setDetailRows] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
  // const [showOpenBalanceModal, setShowOpenBalanceModal] = useState(false);
  const [selectionContext, setSelectionContext] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("PHP");
const [currencyName, setCurrencyName] = useState("Philippine Peso");


  const [header, setHeader] = useState({
    apv_date: "",
  });

  useEffect(() => {
    if (resetFlag) {
      setCurrencyCode("");
      setCurrencyName("");
      setBranchName("");
      console.log("Fields in APV reset!");
    }
  }, [resetFlag]);

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

  const openCurrencyModal = () => {
    setCurrencyModalOpen(true);
  };
  
  const handleCurrencySelect = (selectedCurrency) => {
    if (selectedCurrency) {
      setCurrencyCode(selectedCurrency.currCode);
      setCurrencyName(selectedCurrency.currName);
    }
    setCurrencyModalOpen(false); // always close modal
  };
  
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

<div className="text-center justify-center mb-4">
<h1 className=" font-black text-4xl mb-4 mt-[-30px] font-robotoMono text-blue-600">ACCOUNTS PAYABLE VOUCHER</h1>
 <span className=" font-black text-2xl font-robotoMono text-red-600">Posted Transaction</span>
 </div>
      {/* Form Layout */}
      <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 bg-white shadow-md p-9 rounded-lg relative" >
        {/* Column 1 */}
        <div className="space-y-5">
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
            <button
            type="button"
            onClick={handleBranchClick} // Just pass the event directly now
            className="absolute inset-y-0 right-0 w-[40px] h-[48px] bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg flex items-center justify-center focus:outline-none"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          </div>


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
            <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
          </div>

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
              AP Account Code
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
              Currency Code
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
              Currency Name
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
        <div className="relative w-full col-span-full mt-[-40px]">
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
        <button className="flex items-center text-gray-900 border-b-4 border-blue-600 pb-1">
          <span className="font-semibold">Invoice Details</span>
        </button>
      </div>

      {/* Invoice Details Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
        <thead>
  <tr className="bg-gray-100">
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">LN</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Type</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">RR No.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">PO/JO No.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Invoice No.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Invoice Date</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Original Amount</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Currency</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Invoice Amount</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">DR Account</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">RC Code</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">RC Desc.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">SL Code</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">VAT Code</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">VAT Desc.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">VAT Amount</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">ATC</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">ATC Desc.</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">ATC Amount</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Payment Terms</th>
    <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Due Date</th>
    {/* <th className="px-4 py-2 border-b text-left text-sm font-bold text-gray-900 nowrap-header">Action</th> */}
  </tr>
</thead>
<tbody>
    {detailRows.map((row, index) => (
      <tr key={index}>
        <td className="border px-2 py-1">{index + 1}</td>
        <td className="border px-2 py-1">
  <select
    className="w-[120px] h-8 border border-gray-300 rounded px-3 text-sm"
    value={row.type || ""}
    onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
    defaultValue="FG"
  >
    <option value="" disabled hidden></option>
    <option value="purchases">FG</option>
    <option value="non-purchases">MS</option>
    <option value="advances">RM</option>
  </select>
</td>

        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.rrNo || ""}
            onChange={(e) => handleDetailChange(index, 'rrNo', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.poNo || ""}
            onChange={(e) => handleDetailChange(index, 'poNo', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            onChange={(e) => handleDetailChange(index, 'invoiceNo', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="date"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.invoiceDate || ""}
            onChange={(el) => handleDetailChange(index, 'invoiceDate', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="number"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm text-right"
            onChange={(e) => handleDetailChange(index, 'origAmount', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.currency || ""}
            onChange={(e) => handleDetailChange(index, 'currency', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="number"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm text-right"
            value={row.invoiceAmount || ""}
            onChange={(e) => handleDetailChange(index, 'invoiceAmount', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.drAccount || ""}
            onChange={(e) => handleDetailChange(index, 'drAccount', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.rcCode || ""}
            onChange={(e) => handleDetailChange(index, 'rcCode', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.rcDescription || ""}
            onChange={(e) => handleDetailChange(index, 'rcDescription', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.slCode || ""}
            onChange={(e) => handleDetailChange(index, 'slCode', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.vatCode || ""}
            onChange={(e) => handleDetailChange(index, 'vatCode', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.vatDescription || ""}
            onChange={(e) => handleDetailChange(index, 'vatDescription', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="number"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm text-right"
            value={row.vatAmount || ""}
            onChange={(e) => handleDetailChange(index, 'vatAmount', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.ewtCode || ""}
            onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.ewtDescription || ""}
            onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="number"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm text-right"
            value={row.ewtAmount || ""}
            onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="text"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.terms || ""}
            onChange={(e) => handleDetailChange(index, 'terms', e.target.value)}
          />
        </td>
        <td className="border px-2 py-1">
          <input
            type="date"
            className="w-[120px] h-8 border border-gray-300 rounded px-1 text-sm"
            value={row.dueDate || ""}
            onChange={(e) => handleDetailChange(index, 'dueDate', e.target.value)}
          />
        </td>
        {/* <td className="border px-2 py-1">
          <button
    onClick={() => handleDeleteRow(index)}
    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm focus:outline-none flex items-center justify-center"
  >
    <FontAwesomeIcon icon={faTrashAlt} /> Delete
  </button>
        </td> */}
      </tr>
    ))}

    {/* Add Button at the bottom */}
    <button
  onClick={handleAddRow}
  className="mt-[200px] bottom-4 ml-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center focus:outline-none self-start"
>
  <FontAwesomeIcon icon={faPlus} className="mr-2" />
  Add
</button>
  </tbody>
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
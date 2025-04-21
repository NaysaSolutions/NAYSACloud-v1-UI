import React, { useState, useEffect } from "react";
// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faTrashAlt, faFolderOpen  } from "@fortawesome/free-solid-svg-icons";
//modal
import BranchLookupModal from "C:/Users/Admin/Documents/GitHub/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchBranchRef.jsx";
import CurrLookupModal from "C:/Users/Admin/Documents/GitHub/NAYSACloud-v1-UI/src/NAYSA Cloud/Lookup/SearchCurrRef.jsx";
//button function 
import { useReset } from "C:/Users/Admin/Documents/GitHub/NAYSACloud-v1-UI/src/NAYSA Cloud/Components/ResetContext.jsx";


const PCV = () => {
  const { resetFlag } = useReset(); //fields will be cleared or reset automatically.

  //modal
  const [detailRows, setDetailRows] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
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

  //add row
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

  //currency modal
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
  
  //sets today’s date 
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setHeader((prev) => ({ ...prev, apv_date: today }));
  }, []);

  //branch selection
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
//delete row
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
        <h1 className=" font-black text-4xl mb-4 mt-[-30px] font-robotoMono text-blue-600">Petty Cash Voucher</h1>
        <span className=" font-black text-2xl font-robotoMono text-red-600">POSTED TRANSACTION</span>
    </div>

    <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 bg-white shadow-md p-9 rounded-lg relative" >
        {/* column 1 start*/}
        <div className="space-y-5">
            {/* branch */}
            <div className="relative w-full max-w-md mx-auto">

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

            {/* PCV No */}
            <div className="relative w-full max-w-md mx-auto">

                        <input
                          type="text"
                          id="PCVNo"
                          placeholder=" "
                          className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                        />
                        <label
                          htmlFor="PCVNo"
                          className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                        >
                          PCV No.
                        </label>
                        <button
                                className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                                  isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                                } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                              >
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
             </div>
             {/* PCV Date */}
             <div className="relative w-full max-w-md mx-auto">

            <input
              type="date"
              id="PCVDate"
              className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
              value={header.apv_date}
            />
            <label
              htmlFor="PCVDate"
              className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
            >
              PCV Date
            </label>
          </div>

        </div>
        {/* column 1 ends */}

        {/* Column 2 start*/}
        <div className="space-y-5">
            {/* Payee Code */}
            <div className="relative w-full max-w-md mx-auto">

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
            {/* Payee Name */}
            <div className="relative w-full max-w-md mx-auto">

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
          {/* Employee Name */}
          <div className="relative w-full max-w-md mx-auto">

                <input
                type="text"
                id="employeeName"
                placeholder=" "
                className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                />
                <label
                htmlFor="employeeName"
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                >
                Employee Name
                </label>
          </div>

        </div>
        {/* column 2 ends */}

        {/* Column 3 start*/}
        <div className="space-y-5">
            {/* currency code */}
            <div className="relative w-full max-w-md mx-auto">

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

            {/* currency name */}
            <div className="relative w-full max-w-md mx-auto">

                <input
                        type="text"
                        id="currName"
                        // value={currencyName}
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

           {/* Ref Doc */}
           <div className="relative w-full max-w-md mx-auto">

                <input
                type="text"
                id="RefDoc"
                placeholder=" "
                className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                />
                <label
                htmlFor="RefDoc"
                className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                >
                Ref. Document No.
                </label>
          </div>

        </div>
        {/* Column 3 ends*/}

         {/* Remarks Section */}
         <div className="relative w-full col-span-full mt-[-40px]">
                <textarea
                id="remarks"
                placeholder=""
                rows={5}
                className="peer block w-[100%] mx-auto appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pt-4 pb-1.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0 resize-none"
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

     {/* dtl starts here */}
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
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
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
          </tr>
        ))}
      </tbody>
    </table>
    {/* Add Button */}
    <button
      onClick={handleAddRow}
      className="mt-4 ml-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center focus:outline-none"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" />
      Add
    </button>
  </div>
</div>

     {/* dtl ends here */}
    

    
        












    
    </div>
  );
}; //const PCV

export default PCV;
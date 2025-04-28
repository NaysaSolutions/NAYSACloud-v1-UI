import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faSpinner, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import BranchLookupModal from "../../../Lookup/SearchBranchRef";
import { useReset } from "../../../Components/ResetContext";
import CurrLookupModal from "../../../Lookup/SearchCurrRef.jsx";
import PayeeMastLookupModal from "../../../Lookup/SearchVendMast";
import {fetchData , postRequest} from '../../../Configuration/BaseURL.jsx'
import axios from 'axios';

const APV = () => {
  const { resetFlag } = useReset();
  const [documentName, setdocumentName] = useState("")
  const [documentSeries, setdocumentSeries] = useState("Auto")
  const [documentDocLen, setdocumentDocLen] = useState(8)
  const [documentDetail1, setdocumentDetail1] = useState([]);
  const [documentDetail2, setdocumentDetail2] = useState([]);
  const [documentID, setdocumentID] = useState(null)
  const [documentNo, setdocumentNo] = useState("")


  const [detailRows, setDetailRows] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false); 
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [payeeModalOpen, setpayeeModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vendName, setvendName] = useState(null);
  const [vendCode, setvendCode] = useState(null);  
  const [branches, setbranches] = useState([]);
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
  const [selectionContext, setSelectionContext] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("Philippine Peso");
  const [currencyRate, setCurrencyRate] = useState("1.000000");
  const [apAccountName, setApAccountName] = useState("");
  const [apAccountCode, setApAccountCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [header, setHeader] = useState({
    apv_date: "",
  });

  useEffect(() => {

    if (resetFlag) {
      setCurrencyCode("");
      setCurrencyName("");
      setBranchName("");
      
      const today = new Date().toISOString().split("T")[0];
      setHeader((prev) => ({ ...prev, apv_date: today }));
      console.log("Fields in APV reset!");
    }

     getDocumentControl();
     
  
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    }
  
    return () => clearTimeout(timer);
  }, [resetFlag, isLoading]);

  useEffect(() => {
    if (vendName?.currCode && detailRows.length > 0) {
      const updatedRows = detailRows.map(row => ({
        ...row,
        currency: vendName.currCode
      }));
      setDetailRows(updatedRows);
    }
  }, [vendName?.currCode]);

  const LoadingSpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500 mb-2" />
        <p>Please wait...</p>
      </div>
    </div>
  );



  const getDocumentControl = async () => {
    try {
      const response = await fetchData("getHSDoc", { DOC_ID: "APV" });
      if (response.success)  {
        const result = JSON.parse(response.data[0].result);

          setdocumentName(result[0]?.docName);
          setdocumentSeries(result[0]?.docName);
          setdocumentDocLen(result[0]?.docName);
     
      }
    } catch (err) {
      console.error("Document Control API error:", err);
    }
  }



  // const getDocumentSavedData = async () => {
  //   try {
  //     const docPayload = {
  //       json_data: {
  //         "apvNo": documentNo,
  //         "branchCode": branchCode
  //       }};  
  //     const response = await postRequest("getAPV", JSON.stringify(docPayload)); 
  //     if (response.success) {

  //       console.log(response)

  //       const result = JSON.parse(response.data[0].result);    
        
  //       setdocumentDetail1(result.dt1);
  //       setdocumentDetail2(result.dt2);
        
  //     }
  //   } catch (err) {
  //     console.error("Document Retrieval API error:", err);
  //   }
  // }


  const handleAddRow = async () => {
    try {
      const items = await handleFetchDetail(vendCode);
      console.log("Fetched items:", items); // check this in devtools
  
      // Fix: if it's not an array, wrap it in one
      const itemList = Array.isArray(items) ? items : [items];

  
      const newRows = itemList.map(item => ({
        lnNo: "",
        invType: "FG",
        rrNo: "",
        poNo: "",
        siNo: "",
        siDate: new Date().toISOString().split('T')[0],
        amount: item.origAmount || "0.00",
        currency: vendName?.currCode || "", 
        siAmount: "0.00",
        debitAcct: "",
        rcCode: "",
        rcName: "",
        slCode: "",
        vatCode: item.vatCode || "",
        vatName:  item.vatName,
        vatAmount: "0.00",
        atcCode: item.atcCode || "",
        atcName: item.atcName,
        atcAmount: "0.00",
        paytermCode: item.paytermCode,
        dueDate: new Date().toISOString().split('T')[0],
      }));
  
      setDetailRows(prev => [...prev, ...newRows]);
  
      setTimeout(() => {
        const tableContainer = document.querySelector('.max-h-[430px]');
        if (tableContainer) {
          tableContainer.scrollTop = tableContainer.scrollHeight;
        }
      }, 100);
  
    } catch (error) {
      console.error("Error adding new row:", error);
      alert("Failed to add new row. Please select a Payee first.");
    }
  };
  

  
  const openCurrencyModal = () => {
    setCurrencyModalOpen(true);
  };

  const handleSelectCurrency = async (currencyCode) => {
    if (!currencyCode) return;
  
    try {
      // Use fetchData for GET
      const currResponse = await fetchData("getCurr", { CURR_CODE: currencyCode });
  
      if (currResponse.success) {
        const currData = JSON.parse(currResponse.data[0].result);
        let rate = '1.000000';
  
        if (currencyCode.toUpperCase() !== 'PHP') {
          const forexPayload = {
            json_data: {
              docDate: header.apv_date,
              currCode: currencyCode,
            },
          };
  
          try {
            // Use postRequest for POST
            const forexResponse = await postRequest("getDForex", JSON.stringify(forexPayload));
  
            if (forexResponse.success) {
              const rawResult = forexResponse.data[0].result;
              if (rawResult) {
                const forexData = JSON.parse(rawResult);
                rate = forexData.currRate ? parseFloat(forexData.currRate).toFixed(6) : '1.000000';
              }
            }
          } catch (forexError) {
            console.error("Forex API error:", forexError);
          }
        }
  
        setCurrencyCode(currencyCode);
        setCurrencyName(currData[0]?.currName);
        setCurrencyRate(rate);
      }
    } catch (currError) {
      console.error("Currency API error:", currError);
    }
  };

  const handleFetchDetail = async (vendCode) => {
    console.log("vendCode:", vendCode);
    if (!vendCode) return [];
  
    try {
      const vendPayload = {
        json_data: {
          vendCode: vendCode,
        },
      };
  
      const vendResponse = await postRequest("addAPVDetail", JSON.stringify(vendPayload));
      const rawResult = vendResponse.data[0]?.result;
  
      // Parse the string result into an actual JS object
      const parsed = JSON.parse(rawResult);
      return parsed;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };
  



  

  const handleSelectAPAccount = async (accountCode) => {
    if (accountCode) {
      try {
        const coaResponse = await axios.get("http://127.0.0.1:8000/api/getCOA", { 
          params: { ACCT_CODE: accountCode }
        });

        if (coaResponse.data.success) {
          const coaData = JSON.parse(coaResponse.data.data[0].result);
          setApAccountName(coaData[0]?.acctName || coaData[0]?.ACCT_NAME || "");
          setApAccountCode(coaData[0]?.acctCode || coaData[0]?.ACCT_CODE || "");
        }
      } catch (error) {
        console.error("COA API error:", error);
      }
    }
  };

  const handleClosePayeeModal = async (selectedData) => {
    if (!selectedData) {
      setpayeeModalOpen(false);
      return;
    }
  
    setpayeeModalOpen(false);
    setIsLoading(true);
  
    try {
      // Set basic payee info first
      const payeeDetails = {
        vendCode: selectedData.vendCode,
        vendName: selectedData.vendName,
        currCode: selectedData.currCode, 
        acctCode: selectedData.acctCode   
      };
      setvendName(payeeDetails);

      setvendCode(selectedData.vendCode)
  
      if (!selectedData.currCode) {
        const vendPayload = { VEND_CODE: selectedData.vendCode };
        const vendResponse = await axios.post("http://127.0.0.1:8000/api/getVendMast", vendPayload);
  
        if (vendResponse.data.success) {
          const vendData = JSON.parse(vendResponse.data.data[0].result);
          payeeDetails.currCode = vendData[0]?.currCode;
          payeeDetails.acctCode = vendData[0]?.acctCode;
          setvendName(payeeDetails);
        }
      }
  
      // Update currency and account
      await Promise.all([
        handleSelectCurrency(payeeDetails.currCode),
        handleSelectAPAccount(payeeDetails.acctCode)
      ]);
  
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };



  


  const handleCloseBranchModal = (selectedBranch) => {
    if (selectedBranch) {
      setBranchCode(selectedBranch.branchCode);
      setBranchName(selectedBranch.branchName);
    }
    setBranchModalOpen(false);
  };



  const handleCloseCurrencyModal = (selectedCurrency) => {
    if (selectedCurrency) {
      handleSelectCurrency(selectedCurrency.currCode)
    }
    setCurrencyModalOpen(false);
  };





  return (
    <div className="p-4 bg-white min-h-screen">
      {/* Loading spinner overlay */}
      {showSpinner && <LoadingSpinner />}
{/* Page title and subheading */} 

<div className="text-center justify-center m-0 h-16 mt-10">
<h1 className="font-sans font-medium text-2xl mt-[-40px] text-blue-500 tracking-wide">
  Accounts Payable Voucher
</h1>


      <span className=" font-sans font-medium text-md mb-[-20px] text-red-600 tracking-wide">POSTED TRANSACTION</span>
    </div>

       {/* APV Header Form Section */}
    <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20  p-5 rounded-lg relative" >

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
            onClick={() => setBranchModalOpen(true)}
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
              value={documentNo}
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
              onChange={(e) =>
                setHeader((prev) => ({ ...prev, apv_date: e.target.value }))
              }
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
    value={vendName?.vendCode || ''}
    readOnly
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
    type="button"
    onClick={() => setpayeeModalOpen(true)}
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
              value={vendName?.vendName || ''}
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

 
  {/* AP Account Code Input */}
 <input
  type="hidden"
  id="apAccountCode"
  placeholder=""
  readOnly
  value={apAccountCode || ""}
/>


<input
      type="text"
      id="apAccountName"  // Changed from APVNo to match the field
      value={apAccountName || ""}
      placeholder=""
      readOnly
      className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
/>
<label
  htmlFor="apAccountName"  // Changed to match input id
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
              value={currencyName}
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
  value={currencyRate}
  onChange={(e) => setCurrencyRate(e.target.value)}                  
  placeholder=" "
  className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0 text-right"
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
      
      {/* APV Detail Section */}
      <div id="apv_dtl">
  {/* Invoice Details Button */}
  <div className="flex items-center space-x-8 border-b-2 pb-2 mb-4">
    <button className="flex items-center text-blue-600 border-b-2 border-blue-600 pb-1">
      <span className="font-sans font-medium">Invoice Details</span>
    </button>
    <button className="flex items-center text-gray-900 border-b-4  pb-1">
      <span className="font-sans font-medium text-gray">General Ledger</span>
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
                value={row.invType || ""}
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
                value={row.siNo || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceNo', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="date"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.siDate || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.amount || ""}
                onChange={(e) => handleDetailChange(index, 'origAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[80px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={vendName?.currCode ? `${vendName.currCode}` : "PHP"}
                readOnly
                // onChange={(e) => handleDetailChange(index, 'currency', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.siAmount || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.debitAcct || ""}
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
                value={row.rcName || ""}
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
                value={row.vatName || ""}
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
                value={row.atcCode || ""}
                onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.atcName || ""}
                onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.atcAmount || ""}
                onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
              />
            </td>
            <td className="border px-1 py-1">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent focus:outline-none focus:ring-0"
                value={row.paytermCode || ""}
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
</div>


{/* 
<BranchLookupModal
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
/> */}


{branchModalOpen && (
        <BranchLookupModal 
          isOpen={branchModalOpen}
          onClose={handleCloseBranchModal}
        />
      )}


{currencyModalOpen && (
        <CurrLookupModal 
          isOpen={currencyModalOpen}
          onClose={handleCloseCurrencyModal}
        />
      )}

{payeeModalOpen && (
  <PayeeMastLookupModal
    isOpen={payeeModalOpen}
    onClose={handleClosePayeeModal}
    customParam="apv_hd"
  />
)}

{showSpinner && <LoadingSpinner />}





{/* <OpenBalanceModal
  isOpen={showOpenBalanceModal}
  onClose={handleCloseOpenBalanceModal}
/> */}

    </div>
  );
};

export default APV;
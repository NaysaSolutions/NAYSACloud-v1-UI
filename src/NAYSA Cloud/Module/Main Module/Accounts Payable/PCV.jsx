import React, { useState, useEffect } from "react";
import axios from 'axios';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faMinus, faTrashAlt, faFolderOpen, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Lookup/Modal
import BranchLookupModal from "../../../Lookup/SearchBranchRef";
import CurrLookupModal from "../../../Lookup/SearchCurrRef.jsx";
import PayeeMastLookupModal from "../../../Lookup/SearchVendMast";

// Global
import { useReset } from "../../../Components/ResetContext";
import { docTypeNames } from '@/NAYSA Cloud/Global/doctype';
import { docTypeVideoGuide } from '@/NAYSA Cloud/Global/doctype';
import { docTypePDFGuide } from '@/NAYSA Cloud/Global/doctype';

// Configuration
import {fetchData , postRequest} from '../../../Configuration/BaseURL.jsx'

// Header
import Header from '@/NAYSA Cloud/Components/Header';
import { faAdd } from "@fortawesome/free-solid-svg-icons/faAdd";

const PCV = () => {
  const { resetFlag } = useReset();
  const [documentName, setdocumentName] = useState("")
  const [documentSeries, setdocumentSeries] = useState("Auto")
  const [documentDocLen, setdocumentDocLen] = useState(8)
  const [documentDetail1, setdocumentDetail1] = useState([]);
  const [documentDetail2, setdocumentDetail2] = useState([]);
  const [documentID, setdocumentID] = useState(null)
  const [documentNo, setdocumentNo] = useState("")
  
  const [activeTab, setActiveTab] = useState("basic");
  const [GLactiveTab, setGLActiveTab] = useState("invoice");

  //Document Global Setup
  const docType = 'PCV'; 
  const pdfLink = docTypePDFGuide[docType];
  const videoLink = docTypeVideoGuide[docType];
  const documentTitle = docTypeNames[docType] || 'Transaction';

  //Status Global Setup
  const displayStatus = status || 'FINALIZED';
  let statusColor = 'global-tran-stat-text-open-ui';
  if (displayStatus === 'FINALIZED') {
    statusColor = 'global-tran-stat-text-finalized-ui';
  } else if (['CANCELLED', 'CLOSED'].includes(displayStatus)) {
    statusColor = 'global-tran-stat-text-closed-ui';
  }

  const [detailRows, setDetailRows] = useState([]);
  const [detailRowsGL, setDetailRowsGL] = useState([]);
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
      const response = await fetchData("getHSDoc", { DOC_ID: "PCV" });
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

    <div className="global-tran-main-div-ui">
      {/* Loading spinner overlay */}
      {showSpinner && <LoadingSpinner />}
      {/* Page title and subheading */} 

      <div className="global-tran-headerToolbar-ui"><Header docType = {docType} pdfLink={pdfLink} videoLink={videoLink}/></div>

      {/* Header Section */}
      <div className="global-tran-header-ui">

        <div className="global-tran-headertext-div-ui">
          <h1 className="global-tran-headertext-ui">{documentTitle}</h1>
        </div>

        <div className="global-tran-headerstat-div-ui">
          <div>
            <p className="global-tran-headerstat-text-ui">Transaction Status</p>
            <h1 className={`global-tran-stat-text-ui ${statusColor}`}>{displayStatus}</h1>
          </div>
        </div>

      </div>


    {/* Form Layout with Tabs */}
    <div className="global-tran-header-div-ui">

    {/* Tab Navigation */}
    <div className="global-tran-header-tab-div-ui">
          <button
            className={`global-tran-tab-padding-ui ${
                        activeTab === 'basic' 
                        ? 'global-tran-tab-text_active-ui' 
                        : 'global-tran-tab-text_inactive-ui'
                      }`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          {/* Provision for Other Tabs */}
          {/* <button
            className={`global-tran-tab-padding-ui ${activeTab === 'apv_oth' ? 'global-tran-tab-text_active-ui' : 'global-tran-tab-text_inactive-ui'}`}
            onClick={() => setActiveTab('apv_oth')}
          >
            Other Information
          </button> */}
        </div>


      
       {/* APV Header Form Section */}
      <div id="apv_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg relative" >

      {/* Column 1 */}
      <div className="global-tran-textbox-group-div-ui">
        
          {/* Branch Name Input with lookup button */}
          <div className="relative">
            <input
              type="text"
              id="branchName"
              placeholder=" "
              value={branchName}
              readOnly
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="branchName"
              className="global-tran-floating-label"
            >
              Branch
            </label>

            {/* Button to open branch lookup modal */}
            <button
            type="button"
            onClick={() => setBranchModalOpen(true)}
            className={`global-tran-textbox-button-search-padding-ui ${
              isFetchDisabled 
              ? "global-tran-textbox-button-search-disabled-ui" 
              : "global-tran-textbox-button-search-enabled-ui"
            } global-tran-textbox-button-search-ui`}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>

        {/* APV Number Field */}
          <div className="relative">
            <input
              type="text"
              id="PCVNo"
              value={documentNo}
              placeholder=" "
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="PCVNo"
              className="global-tran-floating-label"
            >
              PCV No.
            </label>

            {/* APV Number Lookup button */}
            <button
            className={`global-tran-textbox-button-search-padding-ui ${
              isFetchDisabled 
              ? "global-tran-textbox-button-search-disabled-ui" 
              : "global-tran-textbox-button-search-enabled-ui"
            } global-tran-textbox-button-search-ui`}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>

          {/* APV Date Picker */}
          <div className="relative">
            <input
              type="date"
              id="PCVDate"
              className="peer global-tran-textbox-ui"
              value={header.apv_date}
              onChange={(e) =>
                setHeader((prev) => ({ ...prev, apv_date: e.target.value }))
              }
            />
            <label
              htmlFor="PCVDate"
              className="global-tran-floating-label"
            >
              PCV Date
            </label>
          </div>
        </div>

        {/* Column 2 */}
        <div className="global-tran-textbox-group-div-ui">
        {/* Payee Code Input with optional lookup */}
        <div className="relative">
  <input
    type="text"
    id="payeeCode"
    value={vendName?.vendCode || ''}
    readOnly
    placeholder=" "
    className="peer global-tran-textbox-ui"
  />
  <label
    htmlFor="payeeCode"
    className="global-tran-floating-label"
  >
    <span className="global-tran-asterisk-ui"> * </span>
    Payee Code 
  </label>
  <button
    type="button"
    onClick={() => setpayeeModalOpen(true)}
    className={`global-tran-textbox-button-search-padding-ui ${
      isFetchDisabled 
      ? "global-tran-textbox-button-search-disabled-ui" 
      : "global-tran-textbox-button-search-enabled-ui"
    } global-tran-textbox-button-search-ui`}
    >
      <FontAwesomeIcon icon={faMagnifyingGlass} />
    </button>
</div>

          
          {/* Payee Name Display */}
          <div className="relative">
            <input
              type="text"
              id="payeeName"
              placeholder=" "
              value={vendName?.vendName || ''}
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="payeeName"
              className="global-tran-floating-label"
            >
              <span className="global-tran-asterisk-ui"> * </span>
              Payee Name
            </label>
          </div>
 
          <div className="relative">
            <input
              type="text"
              id="EmployeeName"
              placeholder=" "
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="EmployeeName"
              className="global-tran-floating-label"
            >
              Employee Name
            </label>
          </div>

        </div>
                  
        {/* Column 3 */}
        <div className="global-tran-textbox-group-div-ui">
          
        <div className="relative">
            <input
              type="text"
              id="currCode"
              placeholder=" "
              value={currencyName}
              readOnly
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="currCode"
              className="global-tran-floating-label"
            >
              Currency
            </label>
            <button
                    onClick={openCurrencyModal}
                    className={`global-tran-textbox-button-search-padding-ui ${
                      isFetchDisabled 
                      ? "global-tran-textbox-button-search-disabled-ui" 
                      : "global-tran-textbox-button-search-enabled-ui"
                    } global-tran-textbox-button-search-ui`}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
          </div>

          <div className="relative">
          <input
  type="text"
  id="currName"
  value={currencyRate}
  onChange={(e) => setCurrencyRate(e.target.value)}                  
  placeholder=" "
  className="peer global-tran-textbox-ui"
/>
            <label
              htmlFor="currName"
              className="global-tran-floating-label"
            >
              Currency Rate
            </label>
          </div>

          <div className="relative">
  <select
    id="pcvType"
    className="peer global-tran-textbox-ui"
    defaultValue="pcv"
  >
    <option value="pcv">Petty Cash Voucher</option>
    <option value="rr">Receiving Report</option>
  </select>
  <label
    htmlFor="pcvType"
    className="global-tran-floating-label"
  >
    PCV Type
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
        <div className="global-tran-textbox-group-div-ui">        

          <div className="relative">
            <input
              type="text"
              id="refDocNo1"
              placeholder=" "
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="refDocNo1"
              className="global-tran-floating-label"
            >
              Ref Doc No. 1
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
        {/* Column 4 - Remarks */}
        <div className="col-span-full"> 
                <div className="relative w-full p-2">
                  <textarea
                    id="remarks"
                    placeholder=""
                    rows={5} 
                    className="peer global-tran-textbox-remarks-ui"
                  />
                  <label
                    htmlFor="remarks"
                    className="global-tran-floating-label-remarks"
                  >
                    Remarks
                  </label>
                </div>
              </div>

      </div>
      </div>
      <br />
      
      {/* APV Detail Section */}
      <div id="apv_dtl" className="global-tran-tab-div-ui">

      {/* Tab Navigation */}
      <div className="global-tran-tab-nav-ui">

      {/* Tabs */}
      <div className="flex flex-row sm:flex-row">
        <button
          className={`global-tran-tab-padding-ui ${
            GLactiveTab === 'invoice'
              ? 'global-tran-tab-text_active-ui'
              : 'global-tran-tab-text_inactive-ui'
          }`}
          onClick={() => setGLActiveTab('invoice')}
        >
          Invoice Details
        </button>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          // onClick={handleAddRow}
          className="global-tran-button-lookup"
        >
          Enable Copy Function
        </button>
        
      </div>
    </div>

  {/* Invoice Details Button */}
  <div className="global-tran-table-main-div-ui">
  <div className="global-tran-table-main-sub-div-ui"> 
  <div className="relative max-h-[400px] overflow-y-auto">
    <table className="min-w-full table-fixed border-collapse">
      <thead className="global-tran-thead-div-ui sticky top-0 z-20">
        <tr>
          <th className="global-tran-th-ui">LN</th>
          <th className="global-tran-th-ui">Payee Name</th>
          <th className="global-tran-th-ui">Payee Code</th>
          <th className="global-tran-th-ui">OR/SI No.</th>
          <th className="global-tran-th-ui">OR/SI Date</th>
          <th className="global-tran-th-ui">OR/SI Amount</th>
          <th className="global-tran-th-ui">DR Account</th>
          <th className="global-tran-th-ui">RC Code</th>
          <th className="global-tran-th-ui">VAT Code</th>
          <th className="global-tran-th-ui">VAT Name</th>
          <th className="global-tran-th-ui">VAT Amount</th>
          <th className="global-tran-th-ui">ATC Code</th>
          <th className="global-tran-th-ui">ATC Name</th>
          <th className="global-tran-th-ui">ATC Amount</th>
          <th className="global-tran-th-ui">VAT Name</th>
          <th className="global-tran-th-ui">VAT Amount</th>
          <th className="global-tran-th-ui">ATC</th>
          <th className="global-tran-th-ui">ATC Name</th>
          <th className="global-tran-th-ui">ATC Amount</th>
          <th className="global-tran-th-ui">Net Amount</th>
          <th className="global-tran-th-ui">Address</th>
          <th className="global-tran-th-ui">TIN</th>
          <th className="global-tran-th-ui">Remarks</th>
          <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 dark:bg-blue-900 z-30">Add</th>
          <th className="global-tran-th-ui sticky right-0 bg-blue-300 dark:bg-blue-900 z-30">Delete</th>
        </tr>
      </thead>
      <tbody className="relative">{detailRows.map((row, index) => (
        <tr key={index} className="global-tran-tr-ui">
          <td className="global-tran-td-ui text-center">{index + 1}</td>
          <td className="global-tran-td-ui">
              {/* <select
                className="w-[50px] global-tran-td-inputclass-ui"
                value={row.invType || ""}
                // onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
              >
                <option value="FG">FG</option>
                <option value="MS">MS</option>
                <option value="RM">RM</option>
              </select> */}
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
                value={row.siNo || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="date"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.siDate || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceDate', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.amount || ""}
                onChange={(e) => handleDetailChange(index, 'origAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[80px] global-tran-td-inputclass-ui text-center"
                value={vendName?.currCode ? `${vendName.currCode}` : "PHP"}
                readOnly
                // onChange={(e) => handleDetailChange(index, 'currency', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.siAmount || ""}
                onChange={(e) => handleDetailChange(index, 'invoiceAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.debitAcct || ""}
                onChange={(e) => handleDetailChange(index, 'drAccount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.rcCode || ""}
                onChange={(e) => handleDetailChange(index, 'rcCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[250px] global-tran-td-inputclass-ui"
                value={row.rcName || ""}
                onChange={(e) => handleDetailChange(index, 'rcDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.slCode || ""}
                onChange={(e) => handleDetailChange(index, 'slCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.vatCode || ""}
                onChange={(e) => handleDetailChange(index, 'vatCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[200px] global-tran-td-inputclass-ui"
                value={row.vatName || ""}
                onChange={(e) => handleDetailChange(index, 'vatDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.vatAmount || ""}
                onChange={(e) => handleDetailChange(index, 'vatAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.atcCode || ""}
                onChange={(e) => handleDetailChange(index, 'ewtCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[200px] global-tran-td-inputclass-ui"
                value={row.atcName || ""}
                onChange={(e) => handleDetailChange(index, 'ewtDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="number"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.atcAmount || ""}
                onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.paytermCode || ""}
                onChange={(e) => handleDetailChange(index, 'terms', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="date"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.dueDate || ""}
                onChange={(e) => handleDetailChange(index, 'dueDate', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui text-center sticky right-12">
                          <button
                            className="global-tran-td-button-add-ui"
                            onClick={() => handleAddRow(index)}
                            >
                              {/* Add */}
                               <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </td>
                        <td className="global-tran-td-ui text-center sticky right-0">
                          <button
                            className="global-tran-td-button-delete-ui"
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
  </div>

 {/* Invoice Details Footer */}
 <div className="global-tran-tab-footer-main-div-ui">

{/* Add Button */}
<div className="global-tran-tab-footer-button-div-ui">
  <button
    onClick={handleAddRow}
    className="global-tran-tab-footer-button-add-ui"
  >
    <FontAwesomeIcon icon={faPlus} className="mr-2" />Add
  </button>
</div>

{/* Totals Section */}
<div className="global-tran-tab-footer-total-main-div-ui">
  <div className="global-tran-tab-footer-total-div-ui">
    <label htmlFor="TotalInvoice" className="global-tran-tab-footer-total-label-ui">
      Total Invoice Amount:
    </label>
    <label className="global-tran-tab-footer-total-value-ui">0.00</label>
  </div>
  <div className="global-tran-tab-footer-total-div-ui">
    <label htmlFor="TotalVAT" className="global-tran-tab-footer-total-label-ui">
      Total VAT Amount:
    </label>
    <label className="global-tran-tab-footer-total-value-ui">0.00</label>
  </div>
  <div className="global-tran-tab-footer-total-div-ui">
    <label htmlFor="TotalATC" className="global-tran-tab-footer-total-label-ui">
      Total ATC Amount:
    </label>
    <label className="global-tran-tab-footer-total-value-ui">0.00</label>
  </div>
  <div className="global-tran-tab-footer-total-div-ui">
    <label htmlFor="TotalPayable" className="global-tran-tab-footer-total-label-ui">
      Total Net Amount:
    </label>
    <label className="global-tran-tab-footer-total-value-ui">0.00</label>
  </div>
</div>
</div>

</div>


 
    {/* General Ledger Button */}
    <div className="global-tran-tab-div-ui">

      {/* Tab Navigation */}
      <div className="global-tran-tab-nav-ui">

      {/* Tabs */}
      <div className="flex flex-row sm:flex-row">
        <button
          className={`global-tran-tab-padding-ui ${
            GLactiveTab === 'invoice'
              ? 'global-tran-tab-text_active-ui'
              : 'global-tran-tab-text_inactive-ui'
          }`}
          onClick={() => setGLActiveTab('invoice')}
        >
          General Ledger
        </button>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          // onClick={handleAddRow}
          className="global-tran-button-generateGL"
        >
          Generate GL Entries
        </button>
        
      </div>
    </div>

    {/* GL Details Table */}
    <div className="global-tran-table-main-div-ui">
    <div className="global-tran-table-main-sub-div-ui"> 
      <table className="min-w-full border-collapse">

        <thead className="global-tran-thead-div-ui">
          <tr>
            <th className="global-tran-th-ui">LN</th>
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
            <th className="global-tran-th-ui">SL Ref. No.</th>
            <th className="global-tran-th-ui">Remarks</th>
            <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 dark:bg-blue-900 z-30">Add</th>
            <th className="global-tran-th-ui sticky right-0 bg-blue-300 dark:bg-blue-900 z-30">Delete</th>
          </tr>
        </thead>
        <tbody className="relative">
          {detailRowsGL.map((row, index) => (
            <tr key={index} className="global-tran-tr-ui">
              
              <td className="global-tran-td-ui text-center">{index + 1}</td>
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
                  className="global-tran-td-button-add-ui"
                  onClick={() => handleAddRowGL(index)}
                  >
                    {/* Add */}
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
              </td>
              <td className="global-tran-td-ui text-center sticky right-0">
                <button
                  className="global-tran-td-button-delete-ui"
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




    <div className="global-tran-tab-footer-main-div-ui">

      {/* Add Button */}
      <div className="global-tran-tab-footer-button-div-ui">
        <button
          onClick={handleAddRowGL}
          className="global-tran-tab-footer-button-add-ui"
        >
    <FontAwesomeIcon icon={faPlus} className="mr-2" />Add
        </button>
      </div>

      

      {/* Totals Section */}
      <div className="global-tran-tab-footer-total-main-div-ui">

      {/* Total Debit */}
      <div className="global-tran-tab-footer-total-div-ui">
        <label htmlFor="TotalDebit" className="global-tran-tab-footer-total-label-ui">
          Total Debit:
        </label>
        <label htmlFor="TotalDebit" className="global-tran-tab-footer-total-value-ui">
          0.00
        </label>
      </div>

      {/* Total Credit */}
      <div className="global-tran-tab-footer-total-div-ui">
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-label-ui">
          Total Credit:
        </label>
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-value-ui">
          0.00
        </label>
      </div>
    </div>

    </div>



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

export default PCV;
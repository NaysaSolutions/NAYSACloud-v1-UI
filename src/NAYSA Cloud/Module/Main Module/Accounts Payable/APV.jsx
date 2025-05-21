import React, { useState, useEffect } from "react";
import axios from 'axios';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faMinus, faTrashAlt, faFolderOpen, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Lookup/Modal
import BranchLookupModal from "../../../Lookup/SearchBranchRef";
import CurrLookupModal from "../../../Lookup/SearchCurrRef.jsx";
import PayeeMastLookupModal from "../../../Lookup/SearchVendMast";
import COAMastLookupModal from "../../../Lookup/SearchCOAMast.jsx";
import RCLookupModal from "../../../Lookup/SearchRCMast.jsx";
import VATLookupModal from "../../../Lookup/SearchVATRef.jsx";
import ATCLookupModal from "../../../Lookup/SearchATCRef.jsx";
import SLMastLookupModal from "../../../Lookup/SearchSLMast.jsx";
import PaytermLookupModal from "../../../Lookup/SearchPayTermRef.jsx";

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

const APV = () => {
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
  const docType = 'APV'; 
  const pdfLink = docTypePDFGuide[docType];
  const videoLink = docTypeVideoGuide[docType];
  const documentTitle = docTypeNames[docType] || 'Transaction';

  //Status Global Setup
  const displayStatus = status || 'OPEN';
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
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("Philippine Peso");
  const [currencyRate, setCurrencyRate] = useState("1.000000");
  const [apAccountName, setApAccountName] = useState("");
  const [apAccountCode, setApAccountCode] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showRcModal, setShowRcModal] = useState(false);
  const [showVatModal, setShowVatModal] = useState(false);
  const [showAtcModal, setShowAtcModal] = useState(false);
  const [showSlModal, setShowSlModal] = useState(false);
  const [showPaytermModal, setShowPaytermModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [isDocNoDisabled, setIsDocNoDisabled] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(false);
  const [header, setHeader] = useState({
    apv_date: "",
  });
  const updateTotalsDisplay = (invoice, vat, atc, payable) => {
  document.getElementById('totalInvoiceAmount').textContent = invoice.toFixed(2);
  document.getElementById('totalVATAmount').textContent = vat.toFixed(2);
  document.getElementById('totalATCAmount').textContent = atc.toFixed(2);
  document.getElementById('totalPayableAmount').textContent = payable.toFixed(2);
};

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
    <div className="global-tran-spinner-main-div-ui">
      <div className="global-tran-spinner-sub-div-ui">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500 mb-2" />
        <p>Please wait...</p>
      </div>
    </div>
  );

 const handleGenerateGLEntries = async () => {
  setIsLoading(true);
  try {
    // Prepare the data payload for the GL generation API
    const glData = {
      branchcode: branchCode,
      apvNo: documentNo,
      apvId: "APV",
      apvDate: header.apv_date,
      tranType: "",
      tranMode: "",
      apAcct: apAccountCode,
      vendCode: vendCode,
      vendName: vendName?.vendName || "",
      refapvNo: "",
      acctCode: "",
      VEND_TYPE: "REG", 
      currCode: currencyCode,
      currRate: parseFloat(currencyRate), 
      remarks: header.remarks || "",
      userCode: "NSI", 
      dateStamp: new Date().toLocaleDateString('en-US'), // Format as MM/DD/YYYY
      timeStamp: "", 
      cutOff: "",   
      result: "",   
      tranDocId: "APV",
      tranDocExist: 1,
      dt1: detailRows.map((row, index) => ({
        line_no: String(index + 1).padStart(3, '0'),
        inv_type: row.invType || "FG",
        po_no: row.poNo || "",
        rr_no: row.rrNo || "",
        jo_no: "",
        svo_no: "",
        si_no: row.siNo || "",
        si_date: row.siDate || "",
        amount: parseFloat(row.amount || 0),
        si_amount: parseFloat(row.siAmount || 0),
        debit_acct: row.debitAcct || "",
        vat_acct: row.vatCode || "",
        adv_acct: "",
        sltype_code: "",
        sl_code: row.slCode || "",
        sl_name: row.slName || "",
        address1: "", 
        address2: "", 
        address3: "", 
        tin: "",     
        rc_code: row.rcCode || "",
        vat_code: row.vatCode || "",
        vat_amount: parseFloat(row.vatAmount || 0),
        atc_code: row.atcCode || "",
        atc_amount: parseFloat(row.atcAmount || 0),
        payterm_code: row.paytermCode || "",
        due_date: row.dueDate || "",
        ctr_date: "",
        advpo_no: "",
        advpo_amount: 0,
        advpo_atc_amount: 0,
        remarks: "",
        line_id: "" 
      })),
      dt2: []
    };
    
    const payload = {
  json_data: JSON.stringify(glData)
};

    console.log("Payload for GL generation:", JSON.stringify(payload, null, 2));

    // Call the generate GL API
    const response = await postRequest("generateGLAPV", JSON.stringify(payload));

    if (response.success) {
      console.log("GL Entries generated successfully:", response);
      // Optionally show success message or refresh GL entries
    } else {
      console.error("Failed to generate GL entries:", response);
      // Optionally show an error message to the user
    }
  } catch (error) {
    console.error("Error generating GL entries:", error);
    // Optionally show an error message to the user
  } finally {
    setIsLoading(false);
  }
};

  const handleSave = () => {
    // Basic validation
    if (!branchCode) {
      alert("Please select a branch");
      return;
    }
  
    if (!vendCode) {
      alert("Please select a payee");
      return;
    }
  
    if (detailRows.length === 0) {
      alert("Please add at least one invoice detail");
      return;
    }
  
    // Generate document number if empty
    let docNoToUse = documentNo;
    let isAutoGenerated = false;
    
    if (!docNoToUse || docNoToUse.trim() === "") {
      const lastNumber = localStorage.getItem('lastAPVNumber') || 0;
      const nextNumber = parseInt(lastNumber) + 1;
      docNoToUse = String(nextNumber).padStart(8, '0');
      localStorage.setItem('lastAPVNumber', nextNumber);
      setdocumentNo(docNoToUse);
      isAutoGenerated = true;
    }

    // Disable controls
    setIsDocNoDisabled(true);
    setIsSaveDisabled(true);
    setIsResetDisabled(true);
  
    // Format the data according to the requested structure
    const formData = { 
    "APV": {
      "branchcode": branchCode,
      "apvNo": documentNo,
      "apvId": "APV",
      "apvDate": header.apv_date,
      "tranType": apType, 
      "tranMode": "",
      "apAcct": apAccountCode,
      "vendCode": vendCode,
      "vendName": vendName?.vendName || "",
      "refapvNo": "",
      "acctCode": "",
      "VEND_TYPE": "REG",
      "currCode": currencyCode,
      "currRate": currencyRate,
      "remarks": header.remarks || "",
      "userCode": "NSI", // Default user, can be dynamic
      "dateStamp": new Date().toISOString(),
      "timeStamp": "",
      "result": "",
      "tranDocId": "APV",
      "tranDocExist": 1,
      "dt1": detailRows.map((row, index) => ({
        "line_no": String(index + 1).padStart(3, '0'),
        "inv_type": row.invType || "FG",
        "po_no": row.poNo || "",
        "rr_no": row.rrNo || "",
        "jo_no": "",
        "svo_no": "",
        "si_no": row.siNo || "",
        "si_date": row.siDate || "",
        "amount": parseFloat(row.amount || 0),
        "si_amount": parseFloat(row.siAmount || 0),
        "debit_acct": row.debitAcct || "",
        "vat_acct": "PZ", 
        "adv_acct": "",
        "sltype_code": "",
        "sl_code": row.slCode || "",
        "sl_name": "",
        "address1": "",
        "address2": "",
        "address3": "",
        "tin": "",
        "rc_code": row.rcCode || "",
        "vat_code": row.vatCode || "",
        "vat_amount": parseFloat(row.vatAmount || 0),
        "atc_code": row.atcCode || "",
        "atc_amount": parseFloat(row.atcAmount || 0),
        "payterm_code": row.paytermCode || "",
        "due_date": row.dueDate || "",
        "ctr_date": "",
        "advpo_no": "",
        "advpo_amount": 0,
        "advpo_atc_amount": 0,
        "remarks": "",
        "line_id": ""
      })),
      "GeneralLedger": detailRowsGL.map((row, index) => ({}))
    }
  };
  
    console.log("APV Data to be saved:", JSON.stringify(formData, null, 2));
    
    // Disable documentNo input if it was auto-generated
    if (isAutoGenerated) {
      const docNoInput = document.getElementById('currName');
      if (docNoInput) {
        docNoInput.disabled = true;
      }
    }
  
    return formData;
  };

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



  const getDocumentSavedData = async () => {
    try {
      const docPayload = {
        json_data: {
          "apvNo": documentNo,
          "branchCode": branchCode
        }};  
      const response = await postRequest("getAPV", JSON.stringify(docPayload)); 
      if (response.success) {

        console.log(response)

        const result = JSON.parse(response.data[0].result);    
        
        setdocumentDetail1(result.dt1);
        setdocumentDetail2(result.dt2);
        
      }
    } catch (err) {
      console.error("Document Retrieval API error:", err);
    }
  }


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
        // Fix the selector by escaping the square brackets
        const tableContainer = document.querySelector('.max-h-\\[430px\\]');
        if (tableContainer) {
          tableContainer.scrollTop = tableContainer.scrollHeight;
        }
      }, 100);
  
    } catch (error) {
      console.error("Error adding new row:", error);
      alert("Failed to add new row. Please select a Payee first.");
    }
  };

  const handleReset = () => {
    console.log("Resetting APV form");
    
    // Reset all form fields to their initial state
    setHeader({
      apv_date: new Date().toISOString().split("T")[0] // Reset to today's date
    });
    setBranchCode("");
    setBranchName("");
    setCurrencyCode("");
    setCurrencyName("Philippine Peso");
    setCurrencyRate("1.000000");
    setApAccountName("");
    setApAccountCode("");
    setvendName(null);
    setvendCode(null);
    setdocumentNo("");
    setDetailRows([]);
    setDetailRowsGL([]);
    
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

  const handlePrint = async () => {
    try {
      // Validate inputs
      if (!documentNo || !branchCode) {
        alert("Please enter Document Number and select Branch before printing");
        return;
      }
  
      // Get printing ID - ensure this endpoint works first
      const idResponse = await fetchData("getPrintingID");
      if (!idResponse?.success) {
        throw new Error("Failed to get printing ID");
      }
      const tranID = idResponse.data[0]?.generatedID;
  
      if (!tranID) {
        throw new Error("No printing ID generated");
      }
  
      // Prepare payload
      const payload = {
        json_data: {
          generatedID: tranID,
          docCode: docType,
          branchCode: branchCode,
          docNo: documentNo,
          Instance: "NAYSA-GERARD",
          Catalog: "NAYSAFinancials",
          checkedBy: "xxxx",
          notedBy: "xxxxx",
          approvedBy: "xxxxx"
        }
      };
  
      // Use full API URL with your server's base URL
      const apiUrl = 'http://127.0.0.1:8000/api/printForm'; // Adjust if using different port
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
  
      // Improved error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Full error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }
  
      // Handle response
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/pdf')) {
        // PDF handling
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `APV_${documentNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
      } else {
        // JSON handling
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || "Printing failed");
        }
        console.log("Print result:", result);
      }
    } catch (error) {
      console.error("Printing Error:", error);
      alert(`Printing failed: ${error.message}`);
    }
  };

  const downloadPDFDirectly = async () => {
    const response = await fetch('/api/printForm/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docType,
        branchCode,
        documentNo
      })
    });
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `APV_${documentNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const printData = {
    apv_no: documentNo,
    branch: branchCode,
    doc_id: docType
  };

  const handleSelectAPAccount = async (accountCode) => {
    if (accountCode) {
      try {
        const coaResponse = await axios.post("http://127.0.0.1:8000/api/getCOA", { 
          ACCT_CODE: accountCode 
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

  // SL Code Lookup Handler
const handleSlLookup = async (slCode) => {
  if (slCode) {
    try {
      const slResponse = await axios.post("http://127.0.0.1:8000/api/getSLMast", {
        SL_CODE: slCode 
      });
      
      if (slResponse.data.success) {
        const slData = JSON.parse(slResponse.data.data[0].result);
        return {
          slCode: slData[0]?.slCode || slData[0]?.SL_CODE || "",
          slName: slData[0]?.slName || slData[0]?.SL_NAME || ""
        };
      }
    } catch (error) {
      console.error("SL API error:", error);
      return null;
    }
  }
  return null;
};

// Payment Terms Lookup Handler
const handlePaytermLookup = async (paytermCode) => {
  if (paytermCode) {
    try {
      const paytermResponse = await axios.post("http://127.0.0.1:8000/api/getPayTerm", {
        PAYTERM_CODE: paytermCode 
      });
      
      if (paytermResponse.data.success) {
        const paytermData = JSON.parse(paytermResponse.data.data[0].result);
        return {
          paytermCode: paytermData[0]?.paytermCode || paytermData[0]?.PAYTERM_CODE || "",
          paytermName: paytermData[0]?.paytermName || paytermData[0]?.PAYTERM_NAME || "",
          daysDue: paytermData[0]?.daysDue || paytermData[0]?.DAYS_DUE || 0
        };
      }
    } catch (error) {
      console.error("Payterm API error:", error);
      return null;
    }
  }
  return null;
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
        vendCode: selectedData?.vendCode || '',
        vendName: selectedData?.vendName || '',
        currCode: selectedData?.currCode || '', 
        acctCode: selectedData?.acctCode || ''   
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

  const updateTotals = (rows) => {
  let totalInvoice = 0;
  let totalVAT = 0;
  let totalATC = 0;
  let totalPayable = 0;

  rows.forEach(row => {
    const siAmount = parseFloat(row.siAmount) || 0;
    const vatAmount = parseFloat(row.vatAmount) || 0;
    const atcAmount = parseFloat(row.atcAmount) || 0;
    
    totalInvoice += siAmount; // Already includes VAT
    totalVAT += vatAmount;   // Just for display (not added again)
    totalATC += atcAmount;   // Will be deducted
  });

  // Total Payable = Invoice (includes VAT) - ATC
  totalPayable = totalInvoice - totalATC;

  // Update the totals display
  updateTotalsDisplay(totalInvoice, totalVAT, totalATC, totalPayable);
};

  const handleDetailChange = (index, field, value) => {
  const updatedRows = [...detailRows];
  
  // Update the changed field
  updatedRows[index] = {
    ...updatedRows[index],
    [field]: value
  };

  // If amount changes, recalculate VAT & ATC
  if (field === 'amount') {
    const amount = parseFloat(value) || 0;
    
    // VAT is already included, so siAmount = amount
    updatedRows[index].siAmount = amount.toFixed(2);
    
    // Calculate VAT (12% of amount, but already included)
    updatedRows[index].vatAmount = (amount * 0.12).toFixed(2);
    
    // Calculate ATC (2% of amount, to be deducted later)
    updatedRows[index].atcAmount = (amount * 0.02).toFixed(2);
  }

  setDetailRows(updatedRows);
  updateTotals(updatedRows); // Update all totals
};

const getVatRate = (vatCode) => {
  // Default VAT rate is 12% unless specified otherwise
  return 0.12; // 12%
};

const getAtcRate = (atcCode) => {
  // Default ATC rate is 2% unless specified otherwise
  return 0.02; // 2%
};

// SL Code Lookup
const handleSlDoubleClick = (index) => {
  setSelectedRowIndex(index);
  setShowSlModal(true);
};

// For SL Code Modal
const handleCloseSlModal = async (selectedSl) => {
  if (selectedSl && selectedRowIndex !== null) {
    // If you need additional data from the API
    const fullSlData = await handleSlLookup(selectedSl.slCode);
    
    const updatedRows = [...detailRows];
    updatedRows[selectedRowIndex] = {
      ...updatedRows[selectedRowIndex],
      slCode: fullSlData?.slCode || selectedSl.slCode,
      slName: fullSlData?.slName || selectedSl.slName
    };
    setDetailRows(updatedRows);
  }
  setShowSlModal(false);
  setSelectedRowIndex(null);
};

// For Payment Terms Modal
// For Payment Terms Modal
const handleClosePaytermModal = (selectedPayterm) => {
  if (selectedPayterm && selectedRowIndex !== null) {
    const updatedRows = [...detailRows];
    const daysDue = parseInt(selectedPayterm.daysDue || selectedPayterm.rate || 0); // Use rate if daysDue doesn't exist
    
    // Calculate due date: invoice date + daysDue
    const dueDate = calculateDueDate(header.apv_date, daysDue);

    updatedRows[selectedRowIndex] = {
      ...updatedRows[selectedRowIndex],
      paytermCode: selectedPayterm.paytermCode,
      paytermName: selectedPayterm.paytermName,
      daysDue: daysDue,
      dueDate: dueDate // Auto-set based on calculation
    };

    setDetailRows(updatedRows);
    console.log("Updated dueDate:", dueDate); // Debug log
  }
  setShowPaytermModal(false);
  setSelectedRowIndex(null); // Make sure to reset this
};

// Helper function to calculate due date
const calculateDueDate = (invoiceDate, daysDue) => {
  if (!invoiceDate || isNaN(daysDue)) return "";
  
  try {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + daysDue);
    return date.toISOString().split("T")[0]; // Returns YYYY-MM-DD
  } catch (error) {
    console.error("Error calculating due date:", error);
    return "";
  }
};
  

  const handleAccountDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.debitAcct;

  if (currentValue) {
    const updatedRows = [...detailRows];
    updatedRows[index] = {
      ...updatedRows[index],
      debitAcct: ""
    };
    setDetailRows(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowAccountModal(true);
  }
};

  
  const handleRcDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.rcCode;

  if (currentValue) {
    const updatedRows = [...detailRows];
    updatedRows[index] = {
      ...updatedRows[index],
      rcCode: "",
      rcName: ""
    };
    setDetailRows(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowRcModal(true);
  }
};

  
  const handleVatDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.vatCode;

  if (currentValue) {
    const updatedRows = [...detailRows];
    updatedRows[index] = {
      ...updatedRows[index],
      vatCode: "",
      vatName: "",
      vatAmount: "0.00"
    };
    setDetailRows(updatedRows);
    updateTotals(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowVatModal(true);
  }
};

  
  const handleAtcDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.atcCode;

  if (currentValue) {
    const updatedRows = [...detailRows];
    updatedRows[index] = {
      ...updatedRows[index],
      atcCode: "",
      atcName: "",
      atcAmount: "0.00"
    };
    setDetailRows(updatedRows);
    updateTotals(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowAtcModal(true);
  }
};

  
  const handleCloseAccountModal = (selectedAccount) => {
    if (selectedAccount && selectedRowIndex !== null) {
      const updatedRows = [...detailRows];
      updatedRows[selectedRowIndex] = {
        ...updatedRows[selectedRowIndex],
        debitAcct: selectedAccount.acctCode,
      };
      setDetailRows(updatedRows);
    }
    setShowAccountModal(false);
    setSelectedRowIndex(null);
  };
  
  const handleCloseRcModal = async (selectedRc) => {
    if (selectedRc && selectedRowIndex !== null) {
      try {
        // Fetch RC Name from /getRCMast API
        const rcResponse = await fetchData("getRCMast", { RC_CODE: selectedRc.rcCode });
        if (rcResponse.success) {
          const rcData = JSON.parse(rcResponse.data[0].result);
          const rcName = rcData[0]?.rcName || '';
          
          const updatedRows = [...detailRows];
          updatedRows[selectedRowIndex] = {
            ...updatedRows[selectedRowIndex],
            rcCode: selectedRc.rcCode,
            rcName: rcName,
          };
          setDetailRows(updatedRows);
        }
      } catch (error) {
        console.error("Error fetching RC data:", error);
      }
    }
    setShowRcModal(false);
    setSelectedRowIndex(null);
  };
  
  const handleCloseVatModal = async (selectedVat) => {
  if (selectedVat && selectedRowIndex !== null) {
    try {
      const vatResponse = await fetchData("getVat", { VAT_CODE: selectedVat.vatCode });
      if (vatResponse.success) {
        const vatData = JSON.parse(vatResponse.data[0].result);
        const vatName = vatData[0]?.vatName || '';
        
        const updatedRows = [...detailRows];
        updatedRows[selectedRowIndex] = {
          ...updatedRows[selectedRowIndex],
          vatCode: selectedVat.vatCode,
          vatName: vatName,
          // Recalculate VAT amount when VAT code changes
          vatAmount: (parseFloat(updatedRows[selectedRowIndex].amount || 0) * 
                     getVatRate(selectedVat.vatCode).toFixed(2)
        )};
        setDetailRows(updatedRows);
        updateTotals(updatedRows);
      }
    } catch (error) {
      console.error("Error fetching VAT data:", error);
    }
  }
  setShowVatModal(false);
  setSelectedRowIndex(null);
};
  
  const handleCloseAtcModal = async (selectedAtc) => {
  if (selectedAtc && selectedRowIndex !== null) {
    try {
      const atcResponse = await fetchData("getATC", { ATC_CODE: selectedAtc.atcCode });
      if (atcResponse.success) {
        const atcData = JSON.parse(atcResponse.data[0].result);
        const atcName = atcData[0]?.atcName || '';
        
        const updatedRows = [...detailRows];
        updatedRows[selectedRowIndex] = {
          ...updatedRows[selectedRowIndex],
          atcCode: selectedAtc.atcCode,
          atcName: atcName,
          atcAmount: (parseFloat(updatedRows[selectedRowIndex].amount || 0) * 
                     getAtcRate(selectedAtc.atcCode).toFixed(2))
        };
        setDetailRows(updatedRows);
        updateTotals(updatedRows);
      }
    } catch (error) {
      console.error("Error fetching ATC data:", error);
    }
  }
  setShowAtcModal(false);
  setSelectedRowIndex(null);
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

      <div className="global-tran-headerToolbar-ui">
      <Header 
  docType={docType} 
  pdfLink={pdfLink} 
  videoLink={videoLink}
  onPrint={handlePrint}
  printData={printData} 
  onReset={handleReset}
  onSave={handleSave}
  isSaveDisabled={isSaveDisabled} // Pass disabled state
  isResetDisabled={isResetDisabled} // Pass disabled state
/>
      </div>

      {/* Page title and subheading */} 

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
          id="currName"
          value={documentNo}
          onChange={(e) => setdocumentNo(e.target.value)}                  
          placeholder=" "
          className={`peer global-tran-textbox-ui ${isDocNoDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          disabled={isDocNoDisabled}
        />
        <label htmlFor="APVNo" className="global-tran-floating-label">
          APV No.
        </label>
        <button
          className={`global-tran-textbox-button-search-padding-ui ${
            isFetchDisabled || isDocNoDisabled
            ? "global-tran-textbox-button-search-disabled-ui" 
            : "global-tran-textbox-button-search-enabled-ui"
          } global-tran-textbox-button-search-ui`}
          disabled={isDocNoDisabled}
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>

          {/* APV Date Picker */}
          <div className="relative">
            <input
              type="date"
              id="APVDate"
              className="peer global-tran-textbox-ui"
              value={header.apv_date}
              onChange={(e) =>
                setHeader((prev) => ({ ...prev, apv_date: e.target.value }))
              }
            />
            <label
              htmlFor="APVDate"
              className="global-tran-floating-label"
            >
              APV Date
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

          {/* AP Account Code Input */}
          <div className="relative">

 
  {/* AP Account Code Input */}
<div className="relative">
  <input
    type="hidden"
    id="apAccountCode"
    placeholder=""
    readOnly
    value={apAccountCode || ""}
  />
  <input
    type="text"
    id="apAccountName"
    value={apAccountName || ""}
    placeholder=""
    readOnly
    className="peer global-tran-textbox-ui"
  />
  <label
    htmlFor="apAccountName"
    className="global-tran-floating-label"
  >
    AP Account
  </label>
  <button
    type="button"
    onClick={() => setCoaModalOpen(true)}
    className={`global-tran-textbox-button-search-padding-ui ${
      isFetchDisabled 
      ? "global-tran-textbox-button-search-disabled-ui" 
      : "global-tran-textbox-button-search-enabled-ui"
    } global-tran-textbox-button-search-ui`}
  >
    <FontAwesomeIcon icon={faMagnifyingGlass} />
  </button>
</div>
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
    id="apType"
    className="peer global-tran-textbox-ui"
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
    className="global-tran-floating-label"
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

          <div className="relative">
            <input
              type="text"
              id="refDocNo2"
              placeholder=" "
              className="peer global-tran-textbox-ui"
            />
            <label
              htmlFor="refDocNo2"
              className="global-tran-floating-label"
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
          Get Reference RR
        </button>
        
      </div>
    </div>

  {/* Invoice Details Button */}
  <div className="global-tran-table-main-div-ui">
  <div className="global-tran-table-main-sub-div-ui"> 
    <table className="min-w-full border-collapse">
      <thead className="global-tran-thead-div-ui">
        <tr>
          <th className="global-tran-th-ui">LN</th>
          <th className="global-tran-th-ui">Type</th>
          <th className="global-tran-th-ui">RR No.</th>
          <th className="global-tran-th-ui">PO/JO No.</th>
          <th className="global-tran-th-ui">Invoice No.</th>
          <th className="global-tran-th-ui">Invoice Date</th>
          <th className="global-tran-th-ui">Original Amount</th>
          <th className="global-tran-th-ui">Currency</th>
          <th className="global-tran-th-ui">Invoice Amount</th>
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
          <th className="global-tran-th-ui">Payment Terms</th>
          <th className="global-tran-th-ui">Due Date</th>
          <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 dark:bg-blue-900 z-30">Add</th>
          <th className="global-tran-th-ui sticky right-0 bg-blue-300 dark:bg-blue-900 z-30">Delete</th>
        </tr>
      </thead>
      <tbody className="relative">{detailRows.map((row, index) => (
        <tr key={index} className="global-tran-tr-ui">
          <td className="global-tran-td-ui text-center">{index + 1}</td>
          <td className="global-tran-td-ui">
              <select
                className="w-[50px] global-tran-td-inputclass-ui"
                value={row.invType || ""}
                // onChange={(e) => handleDetailChange(index, 'type', e.target.value)}
              >
                <option value="FG">FG</option>
                <option value="MS">MS</option>
                <option value="RM">RM</option>
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
                value={row.siNo || ""}
                onChange={(e) => handleDetailChange(index, 'siNo', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
              <input
                type="date"
                className="w-[100px] global-tran-td-inputclass-ui text-center"
                value={row.siDate || ""}
                onChange={(e) => handleDetailChange(index, 'siDate', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui">
  <input
    type="number"
    className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
    value={row.amount !== undefined && row.amount !== null ? parseFloat(row.amount).toFixed(2) : ""}
    onChange={(e) => handleDetailChange(index, 'amount', e.target.value)}
    onBlur={(e) => {
      const formatted = parseFloat(e.target.value).toFixed(2);
      handleDetailChange(index, 'amount', formatted);
    }}
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
    onChange={(e) => handleDetailChange(index, 'siAmount', e.target.value)}
    readOnly={true} // Make it read-only if you want to prevent manual changes
  />
</td>
            <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.debitAcct || ""}
      readOnly
      onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => handleAccountDoubleDtl1Click(index)}
    />
  </div>
</td>

<td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.rcCode || ""}
      readOnly
      onDoubleClick={() => handleRcDoubleDtl1Click(index)}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => handleRcDoubleDtl1Click(index)}
    />
  </div>
</td>
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[250px] global-tran-td-inputclass-ui"
                value={row.rcName || ""}
                onChange={(e) => handleDetailChange(index, 'rcDescription', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.slCode || ""}
      readOnly
      onDoubleClick={() => {
        setSelectedRowIndex(index);
        setShowSlModal(true);
      }}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => {
        setSelectedRowIndex(index);
        setShowSlModal(true);
      }}
    />
  </div>
</td>
            <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.vatCode || ""}
      readOnly
      onDoubleClick={() => handleVatDoubleDtl1Click(index)}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => handleVatDoubleDtl1Click(index)}
    />
  </div>
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
            <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.atcCode || ""}
      readOnly
      onDoubleClick={() => handleAtcDoubleDtl1Click(index)}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => handleAtcDoubleDtl1Click(index)}
    />
  </div>
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
           <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.paytermCode || ""}
      readOnly
      onDoubleClick={() => {
        setSelectedRowIndex(index);
        setShowPaytermModal(true);
      }}
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => {
        setSelectedRowIndex(index);
        setShowPaytermModal(true);
      }}
    />
  </div>
</td>
            <td className="global-tran-td-ui">
  <input
    type="date"
    className="w-[100px] global-tran-td-inputclass-ui text-center"
    value={row.dueDate || ""}
    readOnly // Prevent manual edits
    onChange={(e) => { /* Optional: Allow manual override if needed */ }}
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
  {/* Total Invoice Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total Invoice Amount:
    </label>
    <label id="totalInvoiceAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total VAT Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total VAT Amount:
    </label>
    <label id="totalVATAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total ATC Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total ATC Amount:
    </label>
    <label id="totalATCAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total Payable Amount (Invoice + VAT - ATC) */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total Payable Amount:
    </label>
    <label id="totalPayableAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
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
          onClick={handleGenerateGLEntries}
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
                  className="global-tran-td-button-delete-ui "
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

{coaModalOpen && (
  <COAMastLookupModal
    isOpen={coaModalOpen}
    onClose={(selected) => {
      if (selected) {
        setApAccountCode(selected.acctCode);
        setApAccountName(selected.acctName);
      }
      setCoaModalOpen(false);
    }}
    customParam="apv_hd"
  />
)}


{/* COA Account Modal */}
{showAccountModal && (
  <COAMastLookupModal
    isOpen={showAccountModal}
    onClose={handleCloseAccountModal}
    customParam="apv_dtl"
  />
)}

{/* RC Code Modal */}
{showRcModal && (
  <RCLookupModal 
    isOpen={showRcModal}
    onClose={handleCloseRcModal}
    customParam="apv_dtl"
    apiEndpoint="getRCMast"
  />
)}

{/* VAT Code Modal */}
{showVatModal && (
  <VATLookupModal  
    isOpen={showVatModal}
    onClose={handleCloseVatModal}
    customParam="apv_dtl"
    apiEndpoint="getVat"
  />
)}

{/* ATC Code Modal */}
{showAtcModal && (
  <ATCLookupModal  
    isOpen={showAtcModal}
    onClose={handleCloseAtcModal}
    customParam="apv_dtl"
    apiEndpoint="getATC"
  />
)}

{/* SL Code Lookup Modal */}
{showSlModal && (
  <SLMastLookupModal
    isOpen={showSlModal}
    onClose={handleCloseSlModal}
    customParam="apv_dtl"
  />
)}

{/* Payment Terms Lookup Modal */}
{showPaytermModal && (
  <PaytermLookupModal
    isOpen={showPaytermModal}
    onClose={handleClosePaytermModal}
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
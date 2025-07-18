import React, { useState, useEffect } from "react";
import axios from 'axios';
import Swal from 'sweetalert2';
import { useLocation } from "react-router-dom";


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
  const location = useLocation();
  
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

  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [detailRows, setDetailRows] = useState([]);
  const [detailRowsGL, setDetailRowsGL] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false); 
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [payeeModalOpen, setpayeeModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [vendName, setvendName] = useState(null);
  const [vendCode, setvendCode] = useState(null);  
  const [branches, setbranches] = useState([]);
  const [branchCode, setBranchCode] = useState("Head Office");
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
  const [selectionContext, setSelectionContext] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("Philippine Peso");
  const [currencyRate, setCurrencyRate] = useState("1.000000");
  const [apTypes, setApTypes] = useState([]);
const [selectedApType, setSelectedApType] = React.useState("Purchases");
const [selectedTranType, setSelectedTranType] = useState("");
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
  apv_date: new Date().toISOString().split('T')[0],
  remarks: "" // Add this line to include remarks in the header
});
  const updateTotalsDisplay = (invoice, vat, atc, payable) => {
  document.getElementById('totalInvoiceAmount').textContent = invoice.toFixed(2);
  document.getElementById('totalVATAmount').textContent = vat.toFixed(2);
  document.getElementById('totalATCAmount').textContent = atc.toFixed(2);
  document.getElementById('totalPayableAmount').textContent = payable.toFixed(2);
};


useEffect(() => {
  const debitSum = detailRowsGL.reduce((acc, row) => acc + (parseFloat(row.debit) || 0), 0);
  const creditSum = detailRowsGL.reduce((acc, row) => acc + (parseFloat(row.credit) || 0), 0);

  setTotalDebit(debitSum);
  setTotalCredit(creditSum);
}, [detailRowsGL]);


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


  // Add this useEffect at the top of your component
  useEffect(() => {
    if (location.state?.transactionData && location.state?.isFromHistory) {
      const transaction = location.state.transactionData;
      
      // Set all the form fields with the transaction data
      setHeader({
        apv_date: transaction.apvDate || new Date().toISOString().split('T')[0],
        remarks: transaction.remarks || "",
        refDocNo1: transaction.refapvNo1 || "",
        refDocNo2: transaction.refapvNo2 || ""
      });

      setdocumentNo(transaction.apvNo || "");
      setBranchCode(transaction.branchCode || "");
      setBranchName(transaction.branchName || "");
      setCurrencyCode(transaction.currCode || "PHP");
      setCurrencyRate(transaction.currRate?.toString() || "1.000000");
      setSelectedApType(transaction.apvtranType || "APV01");
      
      if (transaction.vendCode) {
        setvendCode(transaction.vendCode);
        setvendName({
          vendCode: transaction.vendCode,
          vendName: transaction.vendName || transaction.vednName || "",
          currCode: transaction.currCode || ""
        });
      }

      // Set AP Account
      setApAccountCode(transaction.acctCode || "");
      
      // Set detail rows if they exist
      if (transaction.dt1) {
        const formattedRows = transaction.dt1.map(item => ({
          lnNo: item.lnNo || "",
          invType: item.invType || "FG",
          rrNo: item.rrNo || "",
          poNo: item.poNo || "",
          siNo: item.siNo || "",
          siDate: item.siDate?.split('T')[0] || header.apv_date,
          amount: parseFloat(item.amount || 0).toFixed(2),
          currency: transaction.currCode || "PHP",
          siAmount: parseFloat(item.siAmount || item.amount || 0).toFixed(2),
          debitAcct: item.debitAcct || "",
          rcCode: item.rcCode || "",
          rcName: item.rcName || "",
          sltypeCode: item.sltypeCode || "",
          slCode: item.slCode || transaction.vendCode || "",
          slName: item.slName || transaction.vendName || "",
          vatCode: item.vatCode || "",
          vatName: item.vatName || "",
          vatAmount: parseFloat(item.vatAmount || 0).toFixed(2),
          atcCode: item.atcCode || "",
          atcName: item.atcName || "",
          atcAmount: parseFloat(item.atcAmount || 0).toFixed(2),
          paytermCode: item.paytermCode || "",
          dueDate: item.dueDate?.split('T')[0] || "",
          remarks: item.remarks || ""
        }));
        setDetailRows(formattedRows);
      }

      // Set GL rows if they exist
      if (transaction.dt2) {
        const formattedGLRows = transaction.dt2.map((item, index) => ({
          id: index + 1,
          acctCode: item.acctCode || "",
          rcCode: item.rcCode || "",
          sltypeCode: item.sltypeCode || "",
          slCode: item.slCode || "",
          particular: item.particular || `APV ${transaction.apvNo} - ${transaction.vendName || "Vendor"}`,
          vatCode: item.vatCode || "",
          vatName: item.vatName || "",
          atcCode: item.atcCode || "",
          atcName: item.atcName || "",
          debit: parseFloat(item.debit || 0).toFixed(2),
          credit: parseFloat(item.credit || 0).toFixed(2),
          slRefNo: item.slrefNo || "",
          slrefDate: item.slrefDate?.split('T')[0] || "",
          remarks: item.remarks || transaction.remarks || "",
          dt1Lineno: item.dt1Lineno || ""
        }));
        setDetailRowsGL(formattedGLRows);
      }

      // Disable document number editing since this is an existing document
      setIsDocNoDisabled(true);
    }
  }, [location.state]);


  useEffect(() => {
  const shouldHideInvoiceDetails =
    selectedApType === "APV02" || selectedTranType === "Non Purchases";

  setFieldVisibility((prev) => ({
    ...prev,
    invoiceDetails: !shouldHideInvoiceDetails,
  }));
}, [selectedApType, selectedTranType]);


 const handleGenerateGLEntries = async () => {
  setIsLoading(true);

  try {
    const glData = {
      branchcode: branchCode,
      apvNo: documentNo || "",
      apvId: documentID || "APV",
      apvDate: header.apv_date,
      apvtranType: selectedApType || "APV01",
      tranMode: "M",
      apAcct: apAccountCode,
      vendCode: vendCode,
      vendName: vendName?.vendName || "",
      refapvNo1: "",
      refapvNo2: "",
      acctCode: apAccountCode,
      currCode: currencyCode || "PHP",
      currRate: parseFloat(currencyRate) || 1,
      remarks: header.remarks || "",
      userCode: "NSI",
      dateStamp: new Date().toLocaleDateString('en-US'),
      timeStamp: "",
      cutOff: header.apv_date.replace(/-/g, '').substring(0, 6), // YYYYMM format
      tranDocId: "APV",
      tranDocExist: documentNo ? 1 : 0,
      dt1: detailRows.map((row, index) => ({
        lnNo: String(index + 1).padStart(3, '0'),
        invType: row.invType || "FG",
        poNo: row.poNo || "",
        rrNo: row.rrNo || "",
        joNo: "",
        svoNo: "",
        siNo: row.siNo || "",
        siDate: row.siDate || header.apv_date,
        amount: parseFloat(row.amount || 0),
        siAMount: parseFloat(row.siAmount || row.amount || 0),
        debitAcct: row.debitAcct || "",
        vatAcct: row.vatCode || "",
        advAcct: "",
        sltypeCode: row.sltypeCode || "",
        slCode: row.slCode || "",
        slName: row.slName || "",
        address1: "",
        address2: "",
        address3: "",
        tin: vendName?.tin || "",
        rcCode: row.rcCode || "",
        vatCode: row.vatCode || "",
        vatAmount: parseFloat(row.vatAmount || 0),
        atcCode: row.atcCode || "",
        atcAmount: parseFloat(row.atcAmount || 0),
        paytermCode: row.paytermCode || "",
        dueDate: row.dueDate || "",
        ctrDate: "",
        advpoNo: "",
        advpoAmount: 0,
        advAtcAmount: 0,
        remarks: row.remarks || "",
        lineId: row.line_id || ""
      })),
      dt2: []
    };

    const payload = { json_data: glData };

    console.log("Payload for GL generation:", JSON.stringify(payload, null, 2));

    const response = await postRequest("generateGLAPV", JSON.stringify(payload));

    console.log("Raw response from generateGLAPV API:", response);

    if (response?.status === 'success' && Array.isArray(response.data)) {
      let glEntries;

      try {
        glEntries = JSON.parse(response.data[0].result);
        if (!Array.isArray(glEntries)) {
          glEntries = [glEntries];
        }
      } catch (parseError) {
        console.error("Error parsing GL entries:", parseError);
        throw new Error("Failed to parse GL entries");
      }

      const transformedEntries = glEntries.map((entry, idx) => ({
        id: idx + 1,
        acctCode: entry.acctCode || "",
        rcCode: entry.rcCode || "",
        sltypeCode: entry.sltypeCode || "",
        slCode: entry.slCode || "",
        particular: entry.particular || `APV ${documentNo || ''} - ${vendName?.vendName || "Vendor"}`,
        vatCode: entry.vatCode || "",
        vatName: entry.vatName || "",
        atcCode: entry.atcCode || "",
        atcName: entry.atcName || "",
        debit: entry.debit ? parseFloat(entry.debit).toFixed(2) : "0.00",
        credit: entry.credit ? parseFloat(entry.credit).toFixed(2) : "0.00",
        slRefNo: entry.slrefNo || "",
        slrefDate: entry.slrefDate || "",
        remarks: header.remarks || "",
        dt1Lineno: entry.dt1Lineno || ""
      }));

      setDetailRowsGL(transformedEntries);

      const totalDebitValue = transformedEntries.reduce(
        (sum, row) => sum + parseFloat(row.debit || 0),
        0
      );
      const totalCreditValue = transformedEntries.reduce(
        (sum, row) => sum + parseFloat(row.credit || 0),
        0
      );

      setTotalDebit(totalDebitValue);
      setTotalCredit(totalCreditValue);

      return transformedEntries;
    } else {
      console.error("🔴 API responded with failure:", response.message);
      throw new Error(response.message || "Failed to generate GL entries");
    }
  } catch (error) {
    console.error("🔴 Error in handleGenerateGLEntries:", error);
    Swal.fire({
      icon: 'error',
      title: 'Generation Failed',
      text: 'Error generating GL entries: ' + error.message,
      confirmButtonColor: '#3085d6',
    });
    return null;
  } finally {
    setIsLoading(false);
  }
};



  const handleSave = async () => {
  try {
    // Basic validation
    if (!branchCode) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a branch',
      });
      return;
    }

    if (!vendCode) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select a payee',
      });
      return;
    }

    if (detailRows.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please add at least one invoice detail',
      });
      return;
    }

    // Check if debit and credit totals balance
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Debit and Credit totals must balance',
      });
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

    // Disable controls during save
    setIsDocNoDisabled(true);
    setIsSaveDisabled(true);
    setIsResetDisabled(true);

    // Prepare the data structure for the API
    const formData = {
      json_data: {
        branchCode: branchCode,
        apvNo: docNoToUse,
        apvId: "",
        apvDate: header.apv_date,
        apvtranType: selectedApType || "APV01",
        tranMode: "M",
        apAcct: apAccountCode,
        vendCode: vendCode,
        vendName: vendName?.vendName || "",
        refapvNo1: header.refDocNo1 || "",
        refapvNo2: header.refDocNo2 || "",
        acctCode: apAccountCode,
        currCode: currencyCode || "PHP",
        currRate: parseFloat(currencyRate) || 1,
        remarks: header.remarks || "",
        userCode: "NSI",
        dateStamp: new Date().toISOString(),
        timeStamp: "",
        cutOff: header.apv_date.replace(/-/g, '').substring(0, 6), // YYYYMM format
        tranDocId: "APV",
        tranDocExist: documentNo ? 1 : 0,
        dt1: detailRows.map((row, index) => ({
          lnNo: String(index + 1).padStart(3, '0'),
          invType: row.invType || "FG",
          poNo: row.poNo || "",
          rrNo: row.rrNo || "",
          joNo: "",
          svoNo: "",
          siNo: row.siNo || "",
          siDate: row.siDate || header.apv_date,
          amount: parseFloat(row.amount || 0),
          siAMount: parseFloat(row.siAmount || row.amount || 0),
          debitAcct: row.debitAcct || "",
          vatAcct: row.vatCode || "",
          advAcct: "",
          sltypeCode: row.sltypeCode || "",
          slCode: row.slCode || vendCode || "",
          slName: row.slName || vendName?.vendName || "",
          address1: "",
          address2: "",
          address3: "",
          tin: vendName?.tin || "",
          rcCode: row.rcCode || "",
          vatCode: row.vatCode || "",
          vatAmount: parseFloat(row.vatAmount || 0),
          atcCode: row.atcCode || "",
          atcAmount: parseFloat(row.atcAmount || 0),
          paytermCode: row.paytermCode || "",
          dueDate: row.dueDate || "",
          ctrDate: "",
          advpoNo: "",
          advpoAmount: 0,
          advAtcAmount: 0,
          remarks: row.remarks || "",
          lineId: row.line_id || ""
        })),
        dt2: detailRowsGL.map((entry, index) => ({
          recNo: String(index + 1).padStart(3, '0'),
          acctCode: entry.acctCode || "",
          rcCode: entry.rcCode || "",
          slCode: entry.slCode || "",
          particular: entry.particular || `APV ${docNoToUse} - ${vendName?.vendName || "Vendor"}`,
          vatCode: entry.vatCode || "",
          vatName: entry.vatName || "",
          atcCode: entry.atcCode || "",
          atcName: entry.atcName || "",
          debit: parseFloat(entry.debit || 0),
          credit: parseFloat(entry.credit || 0),
          slrefNo: entry.slRefNo || "",
          slrefDate: entry.slrefDate || "",
          remarks: header.remarks || "",
          dt1Lineno: entry.dt1Lineno || ""
        }))
      }
    };

    console.log("Sending data to API:", JSON.stringify(formData, null, 2));

    // Call the API
    const response = await postRequest("upsertAPV", JSON.stringify(formData));

    if (response?.status === 'success') {
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'APV saved successfully!',
      });

      // If document number was auto-generated, disable editing
    
      // Update document ID if returned from server
      if (response.data?.documentID) {
        setdocumentID(response.data.documentID);
        setdocumentNo(response.data.documentNo);
      }
    } else {
      throw new Error(response?.message || 'Failed to save APV');
    }
  } catch (error) {
    console.error("Error saving APV:", error);
    Swal.fire({
      icon: 'error',
      title: 'Save Failed',
      text: error.message || 'An error occurred while saving the APV',
    });
  } finally {
    // Re-enable controls
    setIsSaveDisabled(false);
    setIsResetDisabled(false);
  }
};

  const getDocumentControl = async () => {
  try {
    const response = await fetchData("getHSDoc", { DOC_ID: "APV" });
    if (response.success) {
      const result = JSON.parse(response.data[0].result);

      setdocumentName(result[0]?.docName);
      setdocumentSeries(result[0]?.docName);
      setdocumentDocLen(result[0]?.docName);
      
      // Now fetch the AP Types
      await fetchApTypes();
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

  const fetchApTypes = async () => {
  try {
    const payload = {
      json_data: {
        dropdownColumn: "APVTRAN_TYPE",
        docCode: "APV"
      }
    };
    
    console.log("Fetching AP Types with payload:", payload);
    
    const response = await postRequest("getHSDropdown", JSON.stringify(payload));
    
    console.log("AP Types API response:", response);
    
    if (response.success) {
      const result = JSON.parse(response.data[0].result);
      console.log("Parsed AP Types:", result);
      
      setApTypes(result);
      
      // Set default value to first option if available
      if (result.length > 0) {
        setSelectedApType(result[0].DROPDOWN_CODE);
      }
    }
  } catch (error) {
    console.error("Error fetching AP Types:", error);
  }
};

const handleAPTypeChange = (event) => {
  const selectedType = event.target.value;
  setSelectedApType(selectedType);

  // Default: show all fields
  let visibility = {
    sltypeCode: true,
    slName: true,
    address: true,
    tin: true,
    invType: true,
    rrNo: true,
    poNo: true,
    siNo: true,
    siDate: true,
  };

  switch (selectedType) {
    case "APV01": // purchases
      // Hide SL Type, SL Name, Address, TIN
      visibility.sltypeCode = false;
      visibility.slName = false;
      visibility.address = false;
      visibility.tin = false;
      break;

    case "APV02": // non purchases
      // Hide whole invoice detail (Type, RR No., PO No., SI No., SI Date)
      visibility.invType = false;
      visibility.rrNo = false;
      visibility.poNo = false;
      visibility.siNo = false;
      visibility.siDate = false;
      break;

    case "APV03": // advances
      // Hide SL Type, SL Name, Address, TIN
      visibility.sltypeCode = false;
      visibility.slName = false;
      visibility.address = false;
      visibility.tin = false;
      break;

    case "APV05": // reimbursements
      // Hide Type, RR No., PO No
      visibility.invType = false;
      visibility.rrNo = false;
      visibility.poNo = false;
      // Show SL Type, SL Name, Address, TIN
      visibility.sltypeCode = true;
      visibility.slName = true;
      visibility.address = true;
      visibility.tin = true;
      break;

    case "APV06": // liquidation
      // Hide Type, RR No., PO No
      visibility.invType = false;
      visibility.rrNo = false;
      visibility.poNo = false;
      // Show SL Type, SL Name, Address, TIN
      visibility.sltypeCode = true;
      visibility.slName = true;
      visibility.address = true;
      visibility.tin = true;
      break;

    default:
      // If no selection or unrecognized, show all fields by default
      break;
  }

  setFieldVisibility(visibility);
};

const [fieldVisibility, setFieldVisibility] = React.useState({
  sltypeCode: true,
  slName: true,
  address: true,
  tin: true,
  invType: true,
  rrNo: true,
  poNo: true,
  siNo: true,
  siDate: true,
});


  const handleAddRow = async () => {
  try {
    const items = await handleFetchDetail(vendCode);
    console.log("Fetched items:", items);

    const itemList = Array.isArray(items) ? items : [items];

    const newRows = await Promise.all(itemList.map(async (item) => {
      const amount = parseFloat(item.origAmount || 0);
      const vatRate = await getVatRate(item.vatCode);
      
      return {
        lnNo: "",
        invType: "FG",
        rrNo: "",
        poNo: "",
        siNo: "",
        siDate: new Date().toISOString().split('T')[0],
        amount: amount.toFixed(2), // Original amount
        currency: vendName?.currCode || "",
        siAmount: amount.toFixed(2), // Invoice amount = original amount
        debitAcct: "",
        rcCode: "",
        rcName: "",
        sltypeCode: item.sltypeCode || "",
        slCode: vendCode || "",
        slName: vendName?.vendName || "",
        vatCode: item.vatCode || "",
        vatName: item.vatName,
        vatAmount: (amount * vatRate).toFixed(2), // Calculate VAT
        atcCode: item.atcCode || "",
        atcName: item.atcName,
        atcAmount: "0.00",
        paytermCode: item.paytermCode,
        dueDate: new Date().toISOString().split('T')[0],
      };
    }));

    setDetailRows(prev => [...prev, ...newRows]);
    updateTotals([...detailRows, ...newRows]);

    setTimeout(() => {
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
      remarks: header.remarks || "",
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
  
      const vendResponse = await postRequest("addPayeeDetail", JSON.stringify(vendPayload));
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
        // Add REC_RC to the row data if available
        const updatedRows = [...detailRows];
        if (selectedRowIndex !== null) {
          updatedRows[selectedRowIndex] = {
            ...updatedRows[selectedRowIndex],
            debitAcct: coaData[0]?.acctCode || coaData[0]?.ACCT_CODE || "",
            REC_RC: coaData[0]?.REC_RC || 'N' // Default to 'N' if not specified
          };
          setDetailRows(updatedRows);
        }
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
    // Set basic payee info
    const payeeDetails = {
      vendCode: selectedData?.vendCode || '',
      vendName: selectedData?.vendName || '',
      currCode: selectedData?.currCode || '', 
      acctCode: selectedData?.acctCode || ''   
    };
    setvendName(payeeDetails);
    setvendCode(selectedData.vendCode);

    // Update all existing detail rows with the payee's SL Code
    const updatedRows = detailRows.map(row => ({
      ...row,
      slCode: selectedData.vendCode, // Set SL Code to payee code
      slName: selectedData.vendName  // Set SL Name to payee name
    }));
    setDetailRows(updatedRows);

    // Rest of your existing code...
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
    const invoiceAmount = parseFloat(row.siAmount || row.amount || 0) || 0;
    const vatAmount = parseFloat(row.vatAmount || 0) || 0;
    const atcAmount = parseFloat(row.atcAmount || 0) || 0;
    
    totalInvoice += invoiceAmount;
    totalVAT += vatAmount;
    totalATC += atcAmount;
  });

  // Total Payable = Invoice Amount + VAT - ATC
  totalPayable = totalInvoice - totalATC;

  // Update the totals display
  updateTotalsDisplay(totalInvoice, totalVAT, totalATC, totalPayable);
};

  const getVatRate = async (vatCode) => {
  if (!vatCode) return 0;

  try {
    const response = await fetchData("getVat", { VAT_CODE: vatCode });

    if (response.success) {
      const vatData = JSON.parse(response.data[0].result);

      console.log("vatData[0] full object:", vatData[0]);

      // Try to get vatRate property (not rate)
      const rate = vatData[0]?.vatRate;

      console.log("Extracted rate (vatRate):", rate);

      if (typeof rate === 'number') {
        return rate;
      }

      const parsedRate = parseFloat(rate);
      if (!isNaN(parsedRate)) {
        return parsedRate;
      }

      console.warn("Unrecognized VAT rate format, defaulting to 0");
      return 0;
    }

    console.warn("getVat API failed, defaulting to 0");
    return 0;
  } catch (error) {
    console.error("Error fetching VAT rate:", error);
    return 0;
  }
};

const handleDetailChange = async (index, field, value, runCalculations = true) => {
  const updatedRows = [...detailRows];

  updatedRows[index] = {
    ...updatedRows[index],
    [field]: value,
  };

  // Always update siAmount when amount changes, even if not calculating yet
  if (field === 'amount') {
    updatedRows[index].siAmount = value;
  }

  if (runCalculations) {
    // Parse amount once for calculations
    const amount = parseFloat(updatedRows[index].amount) || 0;

    // Due Date recalculation (if you also want to do it on amount change)
    if (field === 'amount' || field === 'daysDue') {
      const daysDueNum = parseInt(updatedRows[index].daysDue, 10);
      if (!isNaN(daysDueNum) && header.apv_date) {
        const newDueDate = calculateDueDate(header.apv_date, daysDueNum);
        updatedRows[index].dueDate = newDueDate;
      } else {
        updatedRows[index].dueDate = '';
      }
    }

    // VAT recalculation
    if (field === 'amount' || field === 'vatCode') {
      const vatCode = updatedRows[index].vatCode;
      const vatRate = vatCode ? await getVatRate(vatCode) : 0;
      const vatRateDecimal = vatRate / 100;
      const baseAmount = amount / (1 + vatRateDecimal);
      const vatAmount = amount - baseAmount;
      updatedRows[index].vatAmount = vatAmount.toFixed(2);
    }

    // ATC recalculation
    if (field === 'amount' || field === 'atcCode') {
      const atcCode = updatedRows[index].atcCode;
      let atcAmount = 0;
      if (atcCode) {
        const atcRate = await getAtcRate(atcCode);
        atcAmount = amount * (atcRate / 100);
      }
      updatedRows[index].atcAmount = atcAmount.toFixed(2);
    }
  }

  setDetailRows(updatedRows);
  updateTotals(updatedRows);
};

const handleFetchClick = async () => {
  if (!documentNo || !branchCode) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please enter both Branch and APV No. to fetch data',
    });
    return;
  }

  try {
    setIsLoading(true);
    await fetchSavedAPV(documentNo, branchCode);
  } catch (error) {
    console.error("Error fetching APV:", error);
    Swal.fire({
      icon: 'error',
      title: 'Fetch Failed',
      text: 'Failed to retrieve APV data. Please check the APV number and try again.',
    });
  } finally {
    setIsLoading(false);
  }
};

const handleDocumentNoChange = async (e) => {
  setdocumentNo(e.target.value);

  // Only fetch if we have both branch code and APV number
  if (documentNo && branchCode) {
    try {
      setIsLoading(true);
      await fetchSavedAPV(documentNo, branchCode);
    } catch (error) {
      console.error("Error fetching APV:", error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Failed to retrieve APV data. Please check the APV number and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }
};

const fetchSavedAPV = async (apvNo, branchCode) => {
  try {
    const payload = {
      json_data: {
        branchCode: branchCode,
        apvNo: apvNo
      }
    };

    const response = await postRequest("getAPV", JSON.stringify(payload));
    
    if (response.success) {
      const result = JSON.parse(response.data[0].result);
      
      // Update the form with the retrieved data
      updateFormWithSavedData(result);
    } else {
      throw new Error(response.message || "Failed to fetch APV data");
    }
  } catch (error) {
    console.error("Error fetching APV:", error);
    throw error;
  }
};

const updateFormWithSavedData = async (data) => {
  if (!data) return;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    return dateString.split('T')[0];
  };

  // Update Header
  setHeader({
    apv_date: formatDate(data.apvDate) || new Date().toISOString().split('T')[0],
    remarks: data.remarks || "",
    refDocNo1: data.refapvNo1 || "",
    refDocNo2: data.refapvNo2 || ""
  });

  // Vendor
  if (data.vendCode) {
    setvendCode(data.vendCode);
    setvendName({
      vendCode: data.vendCode,
      vendName: data.vendName || data.vednName || "",
      currCode: data.currCode || data.currCode || ""
    });
  }

  // Currency and AP Info
  setCurrencyCode(data.currCode || "");
  setCurrencyRate(data.currRate?.toString() || "");
  setSelectedApType(data.apvtranType || "");
  setApAccountCode(data.acctCode || "");

  // Fetch AP Account Name if not present
  if (!data.acctName && data.acctCode) {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/getCOA", {
        ACCT_CODE: data.acctCode,
      });
      if (response.data.success) {
        const coaData = JSON.parse(response.data.data[0].result);
        const acctName = coaData[0]?.acctName || coaData[0]?.ACCT_NAME || "";
        setApAccountName(acctName);
      } else {
        setApAccountName("");
      }
    } catch (err) {
      console.warn("Failed to fetch account name:", err);
      setApAccountName("");
    }
  } else {
    setApAccountName(data.acctName || "");
  }

  setdocumentID(data.apvId || "");

  // Detail Rows (dt1)
  if (data.dt1) {
    const parsedDt1 = Array.isArray(data.dt1) ? data.dt1 : JSON.parse(data.dt1);

    const formattedRows = await Promise.all(parsedDt1.map(async (item) => {
      let rcName = item.rcName || "";

      if (item.rcCode && !rcName) {
        try {
          const rcResponse = await fetchData("getRCMast", { RC_CODE: item.rcCode });
          if (rcResponse.success) {
            const rcData = JSON.parse(rcResponse.data[0].result);
            rcName = rcData[0]?.rcName || "";
          }
        } catch (error) {
          console.warn(`RC fetch failed for ${item.rcCode}:`, error);
        }
      }

      return {
        lnNo: item.lnNo || "",
        invType: item.invType || "FG",
        rrNo: item.rrNo || "",
        poNo: item.poNo || "",
        siNo: item.siNo || "",
        siDate: formatDate(item.siDate),
        amount: parseFloat(item.amount || 0).toFixed(2),
        currency: data.currCode || "",
        siAmount: parseFloat(item.siAmount || item.amount || 0).toFixed(2),
        debitAcct: item.debitAcct || "",
        rcCode: item.rcCode || "",
        rcName,
        sltypeCode: item.sltypeCode || "",
        slCode: item.slCode || data.vendCode || "",
        slName: item.slName || data.vednName || data.vendName || "",
        vatCode: item.vatCode || "",
        vatName: item.vatName || "",
        vatAmount: parseFloat(item.vatAmount || 0).toFixed(2),
        atcCode: item.atcCode || "",
        atcName: item.atcName || "",
        atcAmount: parseFloat(item.atcAmount || 0).toFixed(2),
        paytermCode: item.paytermCode || "",
        dueDate: formatDate(item.dueDate),
        remarks: item.remarks || ""
      };
    }));

    setDetailRows(formattedRows);
  } else {
    setDetailRows([]);
  }

  // GL Rows (dt2)
  if (data.dt2) {
    const parsedDt2 = Array.isArray(data.dt2) ? data.dt2 : JSON.parse(data.dt2);

    const formattedGLRows = parsedDt2.map((item, index) => ({
      id: index + 1,
      acctCode: item.acctCode || "",
      rcCode: item.rcCode || "",
      sltypeCode: item.sltypeCode || "",
      slCode: item.slCode || "",
      particular: item.particular || `APV ${data.apvNo} - ${data.vednName || data.vendName || "Vendor"}`,
      vatCode: item.vatCode || "",
      vatName: item.vatName || "",
      atcCode: item.atcCode || "",
      atcName: item.atcName || "",
      debit: parseFloat(item.debit || 0).toFixed(2),
      credit: parseFloat(item.credit || 0).toFixed(2),
      slRefNo: item.slrefNo || "",
      slrefDate: formatDate(item.slrefDate),
      remarks: item.remarks || data.remarks || "",
      dt1Lineno: item.dt1Lineno || ""
    }));

    setDetailRowsGL(formattedGLRows);

    const totalDebit = formattedGLRows.reduce((sum, row) => sum + parseFloat(row.debit || 0), 0);
    const totalCredit = formattedGLRows.reduce((sum, row) => sum + parseFloat(row.credit || 0), 0);

    setTotalDebit(totalDebit);
    setTotalCredit(totalCredit);
  } else {
    setDetailRowsGL([]);
    setTotalDebit(0);
    setTotalCredit(0);
  }
};




const getAtcRate = async (atcCode) => {
  if (!atcCode) return 0;

  try {
    const response = await fetchData("getATC", { ATC_CODE: atcCode });

    if (response.success) {
      const atcData = JSON.parse(response.data[0].result);

      const rate = atcData[0]?.atcRate;
      console.log("getAtcRate: Raw rate fetched from API:", rate);

      const parsedRate = parseFloat(rate);
      console.log("getAtcRate: Parsed numeric rate:", parsedRate);

      if (!isNaN(parsedRate)) {
        return parsedRate;
      }

      console.warn("Unrecognized ATC rate format, defaulting to 0");
      return 0;
    }

    console.warn("getATC API failed, defaulting to 0");
    return 0;
  } catch (error) {
    console.error("Error fetching ATC rate:", error);
    return 0;
  }
};




// SL Code double-click handler
const handleSlDoubleClick = (index) => {
  const currentValue = detailRows[index]?.slCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
    updatedRows[index] = {
      ...updatedRows[index],
      slCode: vendCode || "", // Reset to payee code if available
      slName: vendName?.vendName || "" // Reset to payee name if available
    };
    setDetailRows(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowSlModal(true);
  }
};

// For SL Code Modal
const handleCloseSlModal = async (selectedSl) => {
  if (selectedSl && selectedRowIndex !== null) {
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

const handleClosePaytermModal = (selectedPayterm) => {
  if (selectedPayterm && selectedRowIndex !== null) {
    const daysDue = parseInt(selectedPayterm.daysDue || 0);
    console.log("Selected payment term daysDue:", daysDue);

    // Use today's date instead of header.apv_date
    const today = new Date().toISOString().split("T")[0]; // format YYYY-MM-DD

    const dueDate = calculateDueDate(today, daysDue);

    const updatedRows = [...detailRows];
    updatedRows[selectedRowIndex] = {
      ...updatedRows[selectedRowIndex],
      paytermCode: selectedPayterm.paytermCode,
      paytermName: selectedPayterm.paytermName,
      daysDue: daysDue,
      dueDate: dueDate
    };

    setDetailRows(updatedRows);
  }
  setShowPaytermModal(false);
  setSelectedRowIndex(null);
};

const calculateDueDate = (startDate, daysDue) => {
  if (!startDate || isNaN(daysDue)) return "";

  try {
    const date = new Date(startDate);
    date.setDate(date.getDate() + daysDue);
    return date.toISOString().split("T")[0];
  } catch (error) {
    console.error("Error calculating due date:", error);
    return "";
  }
};

  // DR Account double-click handler
const handleAccountDoubleDtl1Click = (index) => {
  const updatedRows = [...detailRows];
  updatedRows[index] = {
    ...updatedRows[index],
    debitAcct: ""
  };
  setDetailRows(updatedRows);
};

// RC Code double-click handler
const handleRcDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.rcCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
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

// VAT Code double-click handler
const handleVatDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.vatCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
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

// ATC double-click handler
const handleAtcDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.atcCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
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



// Payment Terms double-click handler
const handlePaytermDoubleClick = (index) => {
  const currentValue = detailRows[index]?.paytermCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
    updatedRows[index] = {
      ...updatedRows[index],
      paytermCode: "",
      paytermName: "",
      dueDate: new Date().toISOString().split('T')[0] // Reset to today or default date
    };
    setDetailRows(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setShowPaytermModal(true);
  }
};

// ATC Name double-click handler
const handleAtcNameDoubleClick = (index) => {
  const updatedRows = [...detailRows];
  updatedRows[index] = {
    ...updatedRows[index],
    atcCode: "",
    atcName: "",
    atcAmount: "0.00"
  };
  setDetailRows(updatedRows);
  updateTotals(updatedRows);
};

// VAT Name double-click handler
const handleVatNameDoubleClick = (index) => {
  const updatedRows = [...detailRows];
  updatedRows[index] = {
    ...updatedRows[index],
    vatCode: "",
    vatName: "",
    vatAmount: "0.00"
  };
  setDetailRows(updatedRows);
  updateTotals(updatedRows);
};

// RC Name double-click handler
const handleRcNameDoubleClick = (index) => {
  const updatedRows = [...detailRows];
  updatedRows[index] = {
    ...updatedRows[index],
    rcCode: "",
    rcName: ""
  };
  setDetailRows(updatedRows);
};


// Payment Terms Name double-click handler
const handlePaytermNameDoubleClick = (index) => {
  const updatedRows = [...detailRows];
  updatedRows[index] = {
    ...updatedRows[index],
    paytermCode: "",
    paytermName: "",
    dueDate: new Date().toISOString().split('T')[0] // Reset to today or default date
  };
  setDetailRows(updatedRows);
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

  const handleDeleteRow = (index) => {
  // Create a copy of the current rows
  const updatedRows = [...detailRows];
  
  // Remove the row at the specified index
  updatedRows.splice(index, 1);
  
  // Update the state with the new array
  setDetailRows(updatedRows);
  
  // Recalculate totals after deletion
  updateTotals(updatedRows);
};
  
  const handleCloseVatModal = (selectedVat) => {
  setShowVatModal(false);

  if (selectedVat && selectedRowIndex !== null) {
    // Update vatCode and vatName in the row
    handleDetailChange(selectedRowIndex, 'vatCode', selectedVat.vatCode);

    const updatedRows = [...detailRows];
    updatedRows[selectedRowIndex] = {
      ...updatedRows[selectedRowIndex],
      vatCode: selectedVat.vatCode,
      vatName: selectedVat.vatName
    };
    setDetailRows(updatedRows);

    // Optional: trigger recalculation
    handleDetailChange(selectedRowIndex, 'vatCode', selectedVat.vatCode);
  }
};

  
  // For ATC Modal
const handleCloseAtcModal = async (selectedAtc) => {
  if (selectedAtc && selectedRowIndex !== null) {
    try {
      const updatedRows = [...detailRows];
      const row = updatedRows[selectedRowIndex];
      const amount = parseFloat(row.amount || 0);
      const vatRate = await getVatRate(row.vatCode);
      
      // Calculate base amount and VAT amount
      const baseAmount = amount / (1 + vatRate);
      const vatAmount = amount - baseAmount;
      
      // Get ATC rate and calculate ATC amount
      const atcRate = await getAtcRate(selectedAtc.atcCode);
      const atcAmount = baseAmount * atcRate;

      updatedRows[selectedRowIndex] = {
        ...row,
        atcCode: selectedAtc.atcCode,
        atcName: selectedAtc.atcName || "",
        atcAmount: atcAmount.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        siAmount: amount.toFixed(2)
      };

      setDetailRows(updatedRows);
      updateTotals(updatedRows);
    } catch (error) {
      console.error("Error updating ATC:", error);
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
    onChange={handleDocumentNoChange}                  
    placeholder=" "
    className={`peer global-tran-textbox-ui ${isDocNoDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
    disabled={isDocNoDisabled}
  />
  <label htmlFor="APVNo" className="global-tran-floating-label">
    APV No.
  </label>
  <button
    onClick={handleFetchClick}
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
  value={selectedApType}
  onChange={handleAPTypeChange}  // <-- call your handler here
  disabled={apTypes.length === 0}
>
  <option value="">Select AP Type</option>
  {apTypes.map((type) => (
    <option key={type.DROPDOWN_CODE} value={type.DROPDOWN_CODE}>
      {type.DROPDOWN_NAME}
    </option>
  ))}
</select>

  <label htmlFor="apType" className="global-tran-floating-label">
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
  value={header.remarks || ""}
  onChange={(e) => setHeader(prev => ({ ...prev, remarks: e.target.value }))}
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
      {fieldVisibility.invoiceDetails && (
  <>
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
          {fieldVisibility.invType && (
          <th className="global-tran-th-ui">Type</th>
          )}
          {fieldVisibility.rrNo && (
          <th className="global-tran-th-ui">RR No.</th>
          )}
          {fieldVisibility.poNo && (
          <th className="global-tran-th-ui">PO/JO No.</th>
          )}
          <th className="global-tran-th-ui">Invoice No.</th>
          <th className="global-tran-th-ui">Invoice Date</th>
          <th className="global-tran-th-ui">Original Amount</th>
          <th className="global-tran-th-ui">Currency</th>
          <th className="global-tran-th-ui">Invoice Amount</th>
          <th className="global-tran-th-ui">DR Account</th>
          <th className="global-tran-th-ui">RC Code</th>
          <th className="global-tran-th-ui">RC Name</th>
          {fieldVisibility.sltypeCode && (
          <th className="global-tran-th-ui" id='sltypeCode' >SL Type Code</th>
          )}
          {fieldVisibility.slName && (
          <th className="global-tran-th-ui">SL Code</th>
          )}
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
           <input
  type="text"
  className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
  value={row.amount || ""}
  onChange={(e) => {
    const value = e.target.value;
    // Allow digits + up to 2 decimals or empty string
    if (/^\d{0,12}(\.\d{0,2})?$/.test(value) || value === "") {
      handleDetailChange(index, "amount", value, false); // Update value only, no calculations
    }
  }}
  onKeyDown={async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value;
      const num = parseFloat(value);
      if (!isNaN(num)) {
        // Format to 2 decimals and run calculations
        await handleDetailChange(index, "amount", num.toFixed(2), true);
      }
    }
  }}
  onBlur={async (e) => {
    // Optionally, also do calculations on blur if you want
    const value = e.target.value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
      await handleDetailChange(index, "amount", num.toFixed(2), true);
    }
  }}
/>

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
    value={row.siAmount || row.amount || ""} // Show same as original amount
    readOnly
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
      onClick={() => {
        setSelectedRowIndex(index);
        setShowAccountModal(true);
      }}
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
      onClick={() => {
        setSelectedRowIndex(index);
        setShowRcModal(true);
      }}
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
            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.sltypeCode || ""}
                onChange={(e) => handleDetailChange(index, 'sltypeCode', e.target.value)}
              />
            </td>
            <td className="global-tran-td-ui relative">
  <div className="flex items-center">
    <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.slCode || vendCode || ""}
      readOnly
      onDoubleClick={() => handleSlDoubleClick(index)}
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
      onClick={() => {
        setSelectedRowIndex(index);
        setShowVatModal(true);
      }}
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
    readOnly
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
      onClick={() => {
        setSelectedRowIndex(index);
        setShowAtcModal(true);
      }}
    />
  </div>
</td>

            <td className="global-tran-td-ui">
  <input
    type="text"
    className="w-[200px] global-tran-td-inputclass-ui"
    value={row.atcName || ""}
    readOnly
    onDoubleClick={() => handleAtcNameDoubleClick(index)}
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
  readOnly
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
 </>
)}



 
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
            <th className="global-tran-th-ui">SL Type Code</th>
            <th className="global-tran-th-ui">SL Code</th>
            <th className="global-tran-th-ui">Particulars</th>
            <th className="global-tran-th-ui">VAT Code</th>
            <th className="global-tran-th-ui">VAT Name</th>
            <th className="global-tran-th-ui">ATC Code</th>
            <th className="global-tran-th-ui">ATC Name</th>
            <th className="global-tran-th-ui">Debit</th>
            <th className="global-tran-th-ui">Credit</th>
            <th className="global-tran-th-ui">SL Ref. No.</th>
            <th className="global-tran-th-ui">SL Ref. Date</th>
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
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.rcCode || ""}
      readOnly
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => {
        setSelectedRowIndex(index);
        setShowRcModal(true);
      }}
    />
              </td>
          <td className="global-tran-td-ui">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui"
                  value={row.sltypeCode || ""}
                  onChange={(e) => handleDetailChange(index, 'sltypeCode', e.target.value)}
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
                  className="w-[300px] global-tran-td-inputclass-ui"
                  value={row.particular || ""}
                  onChange={(e) => handleDetailChange(index, 'particular', e.target.value)}
                />
              </td>
              <td className="global-tran-td-ui">
                <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.vatCode || ""}
      readOnly
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => {
        setSelectedRowIndex(index);
        setShowVatModal(true);
      }}
    />
              </td>
              <td className="global-tran-td-ui">
  <input
    type="text"
    className="w-[200px] global-tran-td-inputclass-ui"
    value={row.vatName || ""}
    readOnly
    onDoubleClick={() => handleVatNameDoubleClick(index)}
  />
</td>
              <td className="global-tran-td-ui">
                <input
      type="text"
      className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
      value={row.atcCode || ""}
      readOnly
    />
    <FontAwesomeIcon 
      icon={faMagnifyingGlass} 
      className="absolute right-2 text-gray-400 cursor-pointer"
      onClick={() => {
        setSelectedRowIndex(index);
        setShowAtcModal(true);
      }}
    />
              </td>
              <td className="global-tran-td-ui">
                <input
  type="text"
  className="w-[200px] global-tran-td-inputclass-ui"
  value={row.atcName || ""}
  onChange={(e) => handleDetailChange(index, 'atcName', e.target.value)}
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
                  type="date"
                  className="w-[100px] global-tran-td-inputclass-ui"
                  value={row.slrefDate || ""}
                  onChange={(e) => handleDetailChange(index, 'slrefDate', e.target.value)}
                />
              </td>
              <td className="global-tran-td-ui">
  <input
    type="text"
    className="w-[100px] global-tran-td-inputclass-ui"
    value={row.remarks || header.remarks || ""}
    onChange={(e) => {
      const updatedRows = [...detailRowsGL];
      updatedRows[index].remarks = e.target.value;
      setDetailRowsGL(updatedRows);
    }}
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
                    {/* Delete */}
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
  {totalDebit.toFixed(2)}
</label>
      </div>

      {/* Total Credit */}
      <div className="global-tran-tab-footer-total-div-ui">
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-label-ui">
          Total Credit:
        </label>
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-value-ui">
  {totalCredit.toFixed(2)}
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
    customParam="ActiveAll" //should be active_all
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
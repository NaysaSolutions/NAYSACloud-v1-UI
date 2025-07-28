import React, { useState, useEffect } from "react";
import axios from 'axios';
import Swal from 'sweetalert2';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faPlus, faMinus, faTrashAlt, faFolderOpen, faSpinner } from "@fortawesome/free-solid-svg-icons";

// Lookup/Modal
import BranchLookupModal from "../../../Lookup/SearchBranchRef";
import CurrLookupModal from "../../../Lookup/SearchCurrRef.jsx";
import CustomerMastLookupModal from "../../../Lookup/SearchCustMast";
import COAMastLookupModal from "../../../Lookup/SearchCOAMast.jsx";
import RCLookupModal from "../../../Lookup/SearchRCMast.jsx";
import VATLookupModal from "../../../Lookup/SearchVATRef.jsx";
import ATCLookupModal from "../../../Lookup/SearchATCRef.jsx";
import SLMastLookupModal from "../../../Lookup/SearchSLMast.jsx";
import BillTermLookupModal from "../../../Lookup/SearchBillTermRef.jsx";
import BillCodeLookupModal from "../../../Lookup/SearchBillCodeRef.jsx";


// Configuration
import {fetchData , postRequest} from '../../../Configuration/BaseURL.jsx'


// Global
import { useReset } from "../../../Components/ResetContext";
import { docTypeNames } from '@/NAYSA Cloud/Global/doctype';
import { glAccountFilter } from '@/NAYSA Cloud/Global/doctype';
import { docTypes } from '@/NAYSA Cloud/Global/doctype';
import { docTypeVideoGuide } from '@/NAYSA Cloud/Global/doctype';
import { docTypePDFGuide } from '@/NAYSA Cloud/Global/doctype';
import { getTopVatRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopATCRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopCompanyRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopDocControlRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopDocDropDown } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopVatAmount } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopATCAmount } from '@/NAYSA Cloud/Global/top1RefTable';
import { getTopBillCodeRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { generateGLEntries } from '@/NAYSA Cloud/Global/top1RefTable';
import { formatNumber } from '@/NAYSA Cloud/Global/behavior';
import { parseFormattedNumber } from '@/NAYSA Cloud/Global/behavior';



// Header
import Header from '@/NAYSA Cloud/Components/Header';
import { faAdd } from "@fortawesome/free-solid-svg-icons/faAdd";

const SVI = () => {
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
  const [companyData, setCompanyData] = useState({});

  //Document Global Setup
  const docType = docTypes.SVI; 
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
  const [custModalOpen, setcustModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [custName, setCustName] = useState(null);
  const [custCode, setCustCode] = useState(null);  
  const [attention, setAttention] = useState(null);
  const [branches, setbranches] = useState([]);
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [modalContext, setModalContext] = useState('');
  const [selectionContext, setSelectionContext] = useState('');
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [coaModalOpen, setCoaModalOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(null);
  const [currencyName, setCurrencyName] = useState(null);
  const [currencyRate, setCurrencyRate] = useState("1.000000");
  const [refDocNo1, setRefDocNo1] = useState(null);
  const [refDocNo2, setRefDocNo2] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [remarks, setRemarks] = useState("");


  const [totals, setTotals] = useState({
  totalGrossAmount: '0.00',
  totalDiscountAmount: '0.00',
  totalNetAmount: '0.00',
  totalVatAmount: '0.00',
  totalSalesAmount: '0.00',
  totalAtcAmount: '0.00',
  totalAmountDue: '0.00',
  });



  const [sviTypes, setsviTypes] = useState([]);
  const [selectedSVIType, setselectedSVIType] = useState("REG"); // default empty or first value
  const [billtermCode, setbilltermCode] = useState("");
  const [billtermName, setbilltermName] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalSource, setAccountModalSource] = useState(null);
  const [showRcModal, setShowRcModal] = useState(false);
  const [showVatModal, setShowVatModal] = useState(false);
  const [showAtcModal, setShowAtcModal] = useState(false);
  const [showBillCodeModal, setshowBillCodeModal] = useState(false);
  const [showSlModal, setShowSlModal] = useState(false);
  const [showBilltermModal, setShowBilltermModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [isDocNoDisabled, setIsDocNoDisabled] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isResetDisabled, setIsResetDisabled] = useState(false);
  
  const customParamMap = {
        arAct: glAccountFilter.ActiveAll,
        salesAcct: glAccountFilter.ActiveAll,
        vatAcct: glAccountFilter.VATOutputAcct,
        discAcct:glAccountFilter.ActiveAll
  };
  const customParam = customParamMap[accountModalSource] || null;
  const [header, setHeader] = useState({
  svi_date: new Date().toISOString().split('T')[0]
  });



  const updateTotalsDisplay = (grossAmt,discAmt,netDisc, vat, atc, amtDue) => {

  document.getElementById('totInvoiceAmount').textContent = formatNumber(netDisc)
  document.getElementById('totVATAmount').textContent = formatNumber(vat);
  document.getElementById('totATCAmount').textContent = formatNumber(atc);
  document.getElementById('totAmountDue').textContent = formatNumber(amtDue);

  setTotals({
    totalGrossAmount:formatNumber(grossAmt),
    totalDiscountAmount: formatNumber(discAmt),
    totalNetAmount: formatNumber(netDisc),
    totalVatAmount: formatNumber(vat),
    totalSalesAmount: formatNumber(netDisc-vat),
    totalAtcAmount: formatNumber(atc),
    totalAmountDue: formatNumber(amtDue),
  });



};


  useEffect(() => {
    handleReset();
  }, []);



useEffect(() => {
  const debitSum = detailRowsGL.reduce((acc, row) => acc + (parseFloat(row.debit) || 0), 0);
  const creditSum = detailRowsGL.reduce((acc, row) => acc + (parseFloat(row.credit) || 0), 0);

  setTotalDebit(debitSum);
  setTotalCredit(creditSum);
}, [detailRowsGL]);






  useEffect(() => {

    if (resetFlag) {    
       handleReset();
    }
    
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShowSpinner(true), 200);
    } else {
      setShowSpinner(false);
    } 
    return () => clearTimeout(timer);
  }, [resetFlag, isLoading]);


  useEffect(() => {
  }, [custCode]);


  useEffect(() => {
    if (custName?.currCode && detailRows.length > 0) {
      const updatedRows = detailRows.map(row => ({
        ...row,
        currency: custName.currCode
      }));
      setDetailRows(updatedRows);
    }
  }, [custName?.currCode]);

  const LoadingSpinner = () => (
    <div className="global-tran-spinner-main-div-ui">
      <div className="global-tran-spinner-sub-div-ui">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="text-blue-500 mb-2" />
        <p>Please wait...</p>
      </div>
    </div>
  );

  
  const handleReset = () => {

      console.log("reset")
      const today = new Date().toISOString().split("T")[0];
      setHeader((prev) => ({ ...prev, svi_date: today }));
      
      loadDocDropDown();
      loadDocControl();
      loadCompanyData();

      setRefDocNo1("");
      setRefDocNo2("")
      setFromDate(null);
      setToDate(null);
      setRemarks("");

      setCustName(null);
      setCustCode(null);
      setdocumentNo("");
      setDetailRows([]);
      setDetailRowsGL([]);
    
  };




  const loadCompanyData = async () => {
      const data = await getTopCompanyRow();
      if(data){
      setCurrencyCode(data.currCode);
      setCurrencyName(data.currName);
      setCurrencyRate(formatNumber(data.currRate,6));
      };
  };



  const loadDocControl = async () => {
      const data = await getTopDocControlRow();
      if(data){
      setdocumentName(data.docName);
      setdocumentSeries(data.docName);
      setdocumentDocLen(data.docName);
      };
  };



  const loadDocDropDown = async () => {
   const data = await getTopDocDropDown(docType,"SVITRAN_TYPE");
      if(data){
         setsviTypes(data);
         setselectedSVIType("REG");
        };
   };
 


 const handleGenerateGLEntries = async () => {
  setIsLoading(true);

  try {
    const glData = {
      branchCode: branchCode,
      sviNo: documentNo || "",
      sviId: documentID || "",
      sviDate: header.svi_date,
      svitranType: selectedSVIType,
      billtermCode:billtermCode,
      custCode: custCode,
      custName: custName,
      refDocNo1: refDocNo1,
      refDocNo2: refDocNo2,
      fromDate: fromDate,
      toDate: toDate,
      currCode: currencyCode || "PHP",
      currRate: parseFormattedNumber(currencyRate) || 1,
      remarks: remarks|| "",
      userCode: "NSI",
      dt1: detailRows.map((row, index) => ({
        lnNo: String(index + 1),
        billCode: row.billCode || "",
        billName: row.billName || "",
        sviSpecs: row.sviSpecs || "",
        quantity: parseFormattedNumber(row.quantity || 0),
        uomCode: row.uomCode || "",
        unitPrice: parseFormattedNumber(row.unitPrice || 0),
        grossAmount: parseFormattedNumber(row.grossAmount || 0),
        discRate: parseFormattedNumber(row.discRate || 0),
        discAmount: parseFormattedNumber(row.discAmt || 0),
        netDisc: parseFormattedNumber(row.netDisc || 0),
        vatCode: row.vatCode,
        vatName: row.vatName,
        vatAmount: parseFormattedNumber(row.vatAmount || 0),
        atcCode: row.atcCode || "",
        atcName: row.atcName || "",
        atcAmount: parseFormattedNumber(row.atcAmount),
        sviAmount: parseFormattedNumber(row.sviAmount || 0),
        salesAcct: row.salesAcct,
        arAcct: row.arAcct,
        vatAcct: "",
        discAcct: row.discAcct,
        rcCode:row.rcCode
      })),
      dt2: []
    };

    const payload = { json_data: glData };




  console.log("Payload for GL generation:", JSON.stringify(payload));
  //  const response = await postRequest("generateGLSVI", payload);


 const apiUrl = 'http://127.0.0.1:8000/api/generateGLSVI'; // Adjust if using different port
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });


    // const response = await postRequest("generateGLSVI", JSON.stringify(payload));

    // console.log("Raw response from generateGLAPV API:", response);

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




  const handleAddRow = async () => {
  try {
    const items = await handleFetchDetail(custCode);
    const itemList = Array.isArray(items) ? items : [items];
    const newRows = await Promise.all(itemList.map(async (item) => {

      return {
        lnNo: "",
        billCode: "",
        billName: "",
        sviSpecs: "",
        quantity:"0.00",
        uomCode: "",
        unitPrice: "0.00",
        grossAmount: "0.00",
        discRate: "0.00",
        discAmount: "0.00",
        netDisc: "0.00",
        vatCode: item.vatCode || "",
        vatName: item.vatName || "",
        vatAmount: "0.00",
        atcCode: item.atcCode || "",
        atcName: item.atcName || "",
        atcAmount: "0.00",
        sviAmount: "0.00",
        salesAcct: "",
        arAcct: "",       
        vatAcct: item.vatAcctCode,
        discAcct: "",
        rcCode: ""
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



  
  
// Function to add a new row to the detail section with default empty values
const handleAddRowGL = () => {
  setDetailRowsGL([
    ...detailRowsGL,
    {
      acctCode: "",
      rcCode: "",
      sltypeCode:"CU",
      slCode: "",
      particulars: "",
      vatCode: "",
      vatDescription: "",
      ewtCode: "",
      ewtDescription: "",
      debit: "0.00",
      credit: "0.00",
      debitFx1: "0.00",
      creditFx1: "0.00",
      debitFx2: "0.00",
      creditFx2: "0.00",
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
              docDate: header.svi_date,
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



  const handleSelectBillTerm = async (billtermCode) => {
    if (billtermCode) {
    try {
      const termResponse = await axios.post("http://127.0.0.1:8000/api/getBillterm", { 
        BILLTERM_CODE: billtermCode 
      });
      
      if (termResponse.data.success) {
        const termData = JSON.parse(termResponse.data.data[0].result);
        setbilltermName(termData[0]?.billtermName || termData[0]?.billtermName || "");
        setbilltermCode(termData[0]?.billtermCode || termData[0]?.billtermCode || "");
        
      }
    } catch (error) {
      console.error("Billterm API error:", error);
    }
  }
};



  const handleFetchDetail = async (custCode) => {
    if (!custCode) return [];
  
    try {
      const custPayload = {
        json_data: {
          custCode: custCode,
        },
      };
  
      const vendResponse = await postRequest("addCustomerDetail", JSON.stringify(custPayload));
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

  const handleCloseCustModal = async (selectedData) => {
  if (!selectedData) {
    setcustModalOpen(false);
    return;
  }

  setcustModalOpen(false);
  setIsLoading(true);

 

  try {
    // Set basic payee info
    const custDetails = {
      custCode: selectedData?.custCode || '',
      custName: selectedData?.custName || '',
      currCode: selectedData?.currCode || '',  
      attention: selectedData?.attention || '',
      billtermCode: selectedData?.billtermCode || '',
      billtermName: selectedData?.billtermName || ''
    };
    
     setCustName(selectedData.custName);
     setCustCode(selectedData.custCode);
    


    // Update SL Code of GL Entries
    // const updatedRows = detailRows.map(row => ({
    //   ...row,
    //   slCode: selectedData.custCode, 
    //   slName: selectedData.custName  
    // }));
    // setDetailRows(updatedRows);



    // Rest of your existing code...
    if (!selectedData.currCode) {

      const payload = { CUST_CODE: selectedData.custCode };
      const response = await axios.post("http://127.0.0.1:8000/api/getCustomer", payload);
      if (response.data.success) {
        const data = JSON.parse(response.data.data[0].result);
        custDetails.currCode = data[0]?.currCode;
        custDetails.attention = data[0]?.custContact;   
        custDetails.billtermCode = data[0]?.billtermCode;   
        custDetails.billtermName = data[0]?.billtermName;
        // setcustName(custDetails)  
      }
    }
  

    await Promise.all([

      handleSelectCurrency(custDetails.currCode),
      handleSelectBillTerm(custDetails.billtermCode),
      setAttention(custDetails.attention),
       
    
    ]);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }  
};

  const updateTotals = (rows) => {

  let totalNetDiscount = 0;
  let totalVAT = 0;
  let totalATC = 0;
  let totalAmtDue = 0;
  let totalGrossAmt =0;
  let totalDiscAmt=0;

  rows.forEach(row => {
    
    const vatAmount = parseFormattedNumber(row.vatAmount || 0) || 0;
    const atcAmount = parseFormattedNumber(row.atcAmount || 0) || 0;
    const invoiceGross = parseFormattedNumber(row.grossAmount || 0) || 0;
    const invoiceNetDisc = parseFormattedNumber(row.netDisc || row.netDisc || 0) || 0;
    const invoiceDiscount = parseFormattedNumber(row.discAmount || 0) || 0;

    totalGrossAmt+= invoiceGross;
    totalDiscAmt+= invoiceDiscount;
    totalNetDiscount+= invoiceNetDisc;
    totalVAT += vatAmount;
    totalATC += atcAmount;
  });

  totalAmtDue = totalNetDiscount - totalATC;
  updateTotalsDisplay (totalGrossAmt,totalDiscAmt,totalNetDiscount, totalVAT, totalATC, totalAmtDue);
};




const handleDetailChange = async (index, field, value, runCalculations = true) => {
    const updatedRows = [...detailRows];

    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    };

     const row = updatedRows[index];

      if (field === 'vatCode') {
          row.vatCode = value.vatCode,
          row.vatAcct = value.acctCode,
          row.vatName = value.vatName;     
        };

      if (field === 'atcCode' ){
          row.atcCode = value.atcCode,
          row.atcName = value.atcName;     
        };


      if (field === 'billCode'){
          row.billCode= value.billCode,
          row.billName= value.billName,
          row.uomCode=value.uomCode,
          row.arAcct = value.arAcct,
          row.salesAcct= value.salesAcct,
          row.discAcct= value.sDiscAcct,
          row.rcCode= value.rcCode,
          row.quantity= "0.00",
          row.grossAmount= "0.00",
          row.unitPrice= "0.00",
          row.vatAmount= "0.00",
          row.atcAmount= "0.00",
          row.amountDue= "0.00",
          row.discRate= "0.00",
          row.discAmount= "0.00",
          row.sviAmount ="0.00"
    };


    if (runCalculations) {  
      const origQuantity = parseFormattedNumber(row.quantity) || 0;
      const origUnitPrice = parseFormattedNumber(row.unitPrice) || 0;
      const origDiscAmount = parseFormattedNumber(row.discAmount) || 0;
      const origVatCode = row.vatCode || "";
      const origAtcCode = row.atcCode || "";

  
      // shared calculation logic
      async function recalcRow(newGrossAmt, newDiscAmount) {
        const newNetDiscount = +(newGrossAmt - newDiscAmount).toFixed(2);
        const newVatAmount = origVatCode ? await getTopVatAmount(origVatCode, newNetDiscount) : 0;
        const newNetOfVat = +(newNetDiscount - newVatAmount).toFixed(2);
        const newATCAmount = origAtcCode ? await getTopATCAmount(origAtcCode, newNetOfVat) : 0;
        const newAmountDue = +(newNetDiscount - newATCAmount).toFixed(2);


        row.grossAmount = formatNumber(newGrossAmt);
        row.netDisc = formatNumber(newNetDiscount);
        row.vatAmount = formatNumber(newVatAmount);
        row.atcAmount = formatNumber(newATCAmount);
        row.sviAmount = formatNumber(newAmountDue);
        row.discAmount = formatNumber(newDiscAmount);
        row.quantity = formatNumber(parseFormattedNumber (row.quantity));
        row.unitPrice = formatNumber(parseFormattedNumber (row.unitPrice));
      }




      if (field === 'quantity') {
        const newQuantity = parseFormattedNumber(row.quantity) || 0;
        const newGrossAmt = +(newQuantity * origUnitPrice).toFixed(2);
        const discountRate = parseFormattedNumber(row.discRate) || 0;
        const newDiscAmount = +(discountRate * newGrossAmt * 0.01).toFixed(2);
        row.discAmount = newDiscAmount.toFixed(2);
        await recalcRow(newGrossAmt, newDiscAmount);
      }

      if (field === 'unitPrice') {
        const newPrice = parseFormattedNumber(row.unitPrice) || 0;
        const newGrossAmt = +(origQuantity * newPrice).toFixed(2);
        const discountRate = parseFormattedNumber(row.discRate) || 0;
        const newDiscAmount = +(discountRate * newGrossAmt * 0.01).toFixed(2);
        row.discAmount = newDiscAmount.toFixed(2);
        await recalcRow(newGrossAmt, newDiscAmount);
      }

      if (field === 'discRate') {
        const newDiscRate = parseFormattedNumber(row.discRate) || 0;
        const newGrossAmt = +(origQuantity * origUnitPrice).toFixed(2);
        const newDiscAmount = +(newDiscRate * newGrossAmt * 0.01).toFixed(2);
        row.discAmount = newDiscAmount.toFixed(2);
        await recalcRow(newGrossAmt, newDiscAmount);
      }


    if (field === 'vatCode' || field === 'atcCode') {
      async function updateVatAndAtc() {
        const newNetDiscount = +(parseFormattedNumber(row.grossAmount) - parseFormattedNumber(row.discAmount)).toFixed(2);
        let newVatAmount = parseFormattedNumber(row.vatAmount) || 0;

        if (field === 'vatCode') {
          newVatAmount = row.vatCode ? await getTopVatAmount(row.vatCode, newNetDiscount) : 0;
          row.vatAmount = newVatAmount.toFixed(2);
        }

        const newNetOfVat = +(newNetDiscount - newVatAmount).toFixed(2);
        const newATCAmount = row.atcCode ? await getTopATCAmount(row.atcCode, newNetOfVat) : 0;

        row.atcAmount = newATCAmount.toFixed(2);
        row.amountDue = +(newNetDiscount - newATCAmount).toFixed(2);
      }

      await updateVatAndAtc();
    }


  }

    setDetailRows(updatedRows);
    updateTotals(updatedRows);


};




// Invoice Detail Event on Bill Code Double Click
const handleBillCodeDoubleDtl1Click = (index) => {
  const currentValue = detailRows[index]?.billCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
    updatedRows[index] = {
      ...updatedRows[index],
      billCode: "",
      billName: "",
      quantity: "0.00",
      uomCode:"",
      arAcct:"",
      salesAcct:"",
      sDiscAcct:"",
      rcCode:''
    };
    setDetailRows(updatedRows);
    updateTotals(updatedRows);
  } else {
    setSelectedRowIndex(index);
    setshowBillCodeModal(true);
  }
};




// Invoice Detail Event on ATC Code Double Click
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

  const handleCloseAccountModal = (selectedAccount, source) => {
  if (selectedAccount && selectedRowIndex !== null) {

    const updatedRows = [...detailRows];
    const updatedRow = { ...updatedRows[selectedRowIndex] };


    const fieldMap = {
      salesAcct: "salesAcct",
      arAcct: "arAcct",
      vatAcct: "vatAcct",
      discAcct: "discAcct",
    };


    const targetField = fieldMap[source];
    if (targetField) {
      updatedRow[targetField] = selectedAccount.acctCode;
    } else {
      console.warn(`Unknown source: ${source}`);
    }


    updatedRows[selectedRowIndex] = updatedRow;
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
  


// Invoice Detail VAT Code Change
const handleCloseVatModal = async (selectedVat) => {
  
  if (selectedVat && selectedRowIndex !== null) {
    try {

    const result = await getTopVatRow(selectedVat.vatCode);
    if (result) {
       handleDetailChange(selectedRowIndex, 'vatCode', result);
    }

    } catch (error) {
      console.error("Error updating Bill Code:", error);
    }
  }
  setShowVatModal(false);
  setSelectedRowIndex(null);
};

  



// Invoice Detail VAT Code Change
const handleCloseBillCodeModal = async (selectedBillCode) => {
  
  if (selectedBillCode && selectedRowIndex !== null) {
   try {

    const result = await getTopBillCodeRow(selectedBillCode.billCode);
     if (result) {
       handleDetailChange(selectedRowIndex, 'billCode', result);
    }


    } catch (error) {
      console.error("Error updating Bill Code:", error);
    }
  }

  setshowBillCodeModal(false);
  setSelectedRowIndex(null);
};




 // Invoice Detail ATC Code Change
const handleCloseAtcModal = async (selectedAtc) => {
  if (selectedAtc && selectedRowIndex !== null) {
    try {

    const result = await getTopATCRow(selectedAtc.atcCode);
    if (result) {
       handleDetailChange(selectedRowIndex, 'atcCode', result);
    }

    } catch (error) {
      console.error("Error updating ATC Code:", error);
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


  const handleCloseBillTermModal = (selectedBillTerm) => {
    if (selectedBillTerm) {
      setbilltermCode(selectedBillTerm.billtermCode);
      setbilltermName(selectedBillTerm.billtermName);
    }
    setShowBilltermModal(false);
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
  // onSave={handleSave}
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


      
       {/* SVI Header Form Section */}
      <div id="svi_hd" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg relative" >

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


          {/* SVI Number Field */}
          <div className="relative">
            <input
              type="text"
              id="sviNo"
              value={documentNo}
              onChange={(e) => setdocumentNo(e.target.value)}                  
              placeholder=" "
              className={`peer global-tran-textbox-ui ${isDocNoDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              disabled={isDocNoDisabled}
            />
            <label htmlFor="sviNo" className="global-tran-floating-label">
              SVI No.
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

          {/* SVI Date Picker */}
          <div className="relative">
            <input type="date"
                   id="SVIDate"
                   className="peer global-tran-textbox-ui"
                   value={header.svi_date}
                   onChange={(e) =>setHeader((prev) => ({ ...prev, svi_date: e.target.value }))}
            />
            <label htmlFor="SVIDate" className="global-tran-floating-label">SVI Date</label>
          </div>

            

          {/* Customer Code */}
          <div className="relative">         
            <input  type="text"
                    id="custCode"
                    value={custCode}
                    readOnly
                    placeholder=" "
                    className="peer global-tran-textbox-ui"
            />
            <label htmlFor="CustCode"className="global-tran-floating-label">
              <span className="global-tran-asterisk-ui"> * </span>Customer Code 
            </label>

            <button
              type="button"
              onClick={() => setcustModalOpen(true)}
              className={`global-tran-textbox-button-search-padding-ui ${
                isFetchDisabled 
                ? "global-tran-textbox-button-search-disabled-ui" 
                : "global-tran-textbox-button-search-enabled-ui"
              } global-tran-textbox-button-search-ui`}
              ><FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>         
          </div>



          {/* Customer Name Display */}
          <div className="relative">
            <input type="text" id="custName" placeholder=" " value={custName} className="peer global-tran-textbox-ui"/>
            <label htmlFor="custName"className="global-tran-floating-label">
            <span className="global-tran-asterisk-ui"> * </span>Customer Name</label>
          </div>


          

        </div>







        {/* Column 2 */}
        <div className="global-tran-textbox-group-div-ui">
               
          <div className="relative">
            <select id="sviType"
                    className="peer global-tran-textbox-ui"
                    value={selectedSVIType}
                    onChange={(e) => setselectedSVIType(e.target.value)}
                    disabled={sviTypes.length === 0} // Disable if no options loaded
            >
                {sviTypes.length > 0 ? 
                (
                  <>
                    <option value="">Select Billing Type</option>
                    {sviTypes.map((type) => 
                    (
                      <option key={type.DROPDOWN_CODE} value={type.DROPDOWN_CODE}>
                        {type.DROPDOWN_NAME}
                      </option>
                    ))}
                  </>
                ) : (<option value="">Loading Billing Types...</option>)}
            </select>          
            <label htmlFor="sviType" className="global-tran-floating-label">SVI Type</label>

            {/* Dropdown Icon */}
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          



          {/* Billing Term */}
          <div className="relative">
            <input type="hidden" id="billtermCode"  placeholder="" readOnly value={billtermCode || ""}/>
            <input type="text" id="billtermName" value={billtermName || ""} placeholder="" readOnly className="peer global-tran-textbox-ui"/>
            <label htmlFor="billtermName" className="global-tran-floating-label">
            <span className="global-tran-asterisk-ui"> * </span>Billing Term</label>
                        
            <button type="button" onClick={() => setShowBilltermModal(true)}
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
            <input type="text" id="attention" placeholder=" " value={attention} className="peer global-tran-textbox-ui"/>
            <label htmlFor="attention" className="global-tran-floating-label">Attention</label>
          </div>




          <div className="relative">
            <input type="text" id="currCode"placeholder=" " value={currencyName} readOnly className="peer global-tran-textbox-ui"/>
            <label htmlFor="currCode" className="global-tran-floating-label">Currency</label>
            
            <button onClick={openCurrencyModal}
                    className={`global-tran-textbox-button-search-padding-ui ${
                      isFetchDisabled 
                      ? "global-tran-textbox-button-search-disabled-ui" 
                      : "global-tran-textbox-button-search-enabled-ui"
                    } global-tran-textbox-button-search-ui`}
                    ><FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>
          </div>


          <div className="relative">
            <input type="text" id="currName" value={currencyRate} onChange={(e) => setCurrencyRate(e.target.value)}placeholder=" "className="peer global-tran-textbox-ui  text-right"/>
            <label htmlFor="currName" className="global-tran-floating-label"> Currency Rate
            </label>
          </div>
              

        

          
          

        </div>









         {/* Column 3 */}
        <div className="global-tran-textbox-group-div-ui">
            
          
          <div className="relative">
            <input type="text" id="refDocNo1"  value={refDocNo1} placeholder=" " onChange={(e) => setRefDocNo1(e.target.value)} className="peer global-tran-textbox-ui"/>
            <label htmlFor="refDocNo1" className="global-tran-floating-label">Ref Doc No. 1</label>
          </div>

          <div className="relative">
            <input type="text" id="refDocNo2" value={refDocNo2} placeholder=" " onChange={(e) => setRefDocNo2(e.target.value)}  className="peer global-tran-textbox-ui"/>
            <label htmlFor="refDocNo2" className="global-tran-floating-label">Ref Doc No. 2</label>
          </div>


          <div className="relative">
            <input type="date"
                   id="fromDate" value={fromDate} onChange={(e) => setFromDate(e.target.value)} 
                   className="peer global-tran-textbox-ui"
            />
            <label htmlFor="fromDate" className="global-tran-floating-label">From Date</label>
          </div>    

          <div className="relative">
            <input type="date"
                   id="toDate" value={toDate} onChange={(e) => setToDate(e.target.value)} 
                   className="peer global-tran-textbox-ui"
            />
            <label htmlFor="toDate" className="global-tran-floating-label">To Date</label>
          </div> 


          <div className="relative">
              <input type="text" id="totalGrossAmount" value={totals.totalGrossAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalGrossAmount" className="global-tran-floating-label">Gross Amount</label>
          </div>



        </div>  





          {/* Column 4 */}
        <div className="global-tran-textbox-group-div-ui">        
          
           
          

            <div className="relative">
              <input type="text" id="totalDiscountAmount" value={totals.totalDiscountAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalDiscountAmount" className="global-tran-floating-label">Discount Amount</label>
            </div>
          
          
           <div className="relative">
              <input type="text" id="totalNetAmount" value={totals.totalNetAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalNetAmount" className="global-tran-floating-label">Net Amount</label>
           </div>


            <div className="relative">
              <input type="text" id="totalVatAmount" value={totals.totalVatAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalVatAmount" className="global-tran-floating-label">VAT Amount</label>
            </div>
          
         
            <div className="relative">
              <input type="text" id="totalSalesAmount" value={totals.totalSalesAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalSalesAmount" className="global-tran-floating-label">Sales Amount</label>
            </div>

            <div className="relative">
              <input type="text" id="totalAtcAmount" value={totals.totalAtcAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalAtcAmount" className="global-tran-floating-label">ATC Amount</label>
            </div>

            <div className="relative">
              <input type="text" id="totalAmountDue" value={totals.totalAmountDue} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
              <label htmlFor="totalAmountDue" className="global-tran-floating-label">Amount Due</label>
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
  value={remarks}
  onChange={(e) => setRemarks(e.target.value)}
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
          <th className="global-tran-th-ui">Bill Code</th>
          <th className="global-tran-th-ui">Description</th>
          <th className="global-tran-th-ui">Specification</th>
          <th className="global-tran-th-ui">Quantity</th>
          <th className="global-tran-th-ui">Unit</th>
          <th className="global-tran-th-ui">Unit Price</th>
          <th className="global-tran-th-ui">Gross Amount</th>
          <th className="global-tran-th-ui">Discount Rate</th>
          <th className="global-tran-th-ui">Discount Amount</th>
          <th className="global-tran-th-ui">Net Amount</th>
          <th className="global-tran-th-ui">VAT Code</th>
          <th className="global-tran-th-ui">VAT Name</th>
          <th className="global-tran-th-ui">VAT Amount</th>
          <th className="global-tran-th-ui">ATC</th>
          <th className="global-tran-th-ui">ATC Name</th>
          <th className="global-tran-th-ui">ATC Amount</th>
          <th className="global-tran-th-ui">Amount Due</th>
          <th className="global-tran-th-ui">Sales Account</th>
          <th className="global-tran-th-ui">AR Account</th>
          <th className="global-tran-th-ui">VAT Account</th>
          <th className="global-tran-th-ui">Discount Account</th>
          <th className="global-tran-th-ui">RC Code</th>        
          <th className="global-tran-th-ui sticky right-[43px] bg-blue-300 dark:bg-blue-900 z-30">Add</th>
          <th className="global-tran-th-ui sticky right-0 bg-blue-300 dark:bg-blue-900 z-30">Delete</th>
        </tr>
      </thead>



      <tbody className="relative">{detailRows.map((row, index) => (
        <tr key={index} className="global-tran-tr-ui">
          
          {/* LN */}
          <td className="global-tran-td-ui text-center">{index + 1}</td>
         

         {/* Bill Code */}
          <td className="global-tran-td-ui relative">
            <div className="flex items-center">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
                value={row.billCode || ""}
                readOnly
                onDoubleClick={() => handleBillCodeDoubleDtl1Click(index)}
              />
              <FontAwesomeIcon 
                icon={faMagnifyingGlass} 
                className="absolute right-2 text-gray-400 cursor-pointer"
                onClick={() => {
                  setSelectedRowIndex(index);
                  setshowBillCodeModal(true);
                }}
              />
            </div>
          </td>


            {/* Description */}
           <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.billName || ""}
                onChange={(e) => handleDetailChange(index, 'billName', e.target.value)}
              />
            </td>

             {/* Specification */}
           <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] global-tran-td-inputclass-ui"
                value={row.sviSpecs || ""}
                // onChange={(e) => handleDetailChange(index, 'rrNo', e.target.value)}
              />
            </td>


            <input
              type="text"
              className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
              value={row.quantity || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,12}(\.\d{0,2})?$/.test(value) || value === "") {
                  handleDetailChange(index, "quantity", value, false); // Update value only, no calculations
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.target.value;
                  const num = parseFormattedNumber(value);
                  if (!isNaN(num)) {
                    await handleDetailChange(index, "quantity", num.toFixed(2), true);
                  }
                }
              }}
              onBlur={async (e) => {
                const value = e.target.value;
                const num = parseFormattedNumber(value);
                if (!isNaN(num)) {
                  await handleDetailChange(index, "quantity", num.toFixed(2), true);
                }
              }}
            />


            {/* UOM */}
           <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] text-center global-tran-td-inputclass-ui"
                value={row.uomCode || ""}
                onChange={(e) => handleDetailChange(index, 'uomCode', e.target.value)}
              />
            </td>


             <input
              type="text"
              className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
              value={row.unitPrice || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,12}(\.\d{0,2})?$/.test(value) || value === "") {
                  handleDetailChange(index, "unitPrice", value, false); // Update value only, no calculations
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.target.value;
                  const num = parseFormattedNumber(value);
                  if (!isNaN(num)) {
                    await handleDetailChange(index, "unitPrice", num.toFixed(2), true);
                  }
                }
              }}
              onBlur={async (e) => {
                const value = e.target.value;
                const num = parseFormattedNumber(value);
                if (!isNaN(num)) {
                  await handleDetailChange(index, "unitPrice", num.toFixed(2), true);
                }
              }}
            />

            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.grossAmount || row.grossAmount || ""} // Show same as original amount
                readOnly
              />
            </td>



             <input
              type="text"
              className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
              value={row.discRate || ""}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,12}(\.\d{0,2})?$/.test(value) || value === "") {
                  handleDetailChange(index, "discRate", value, false); // Update value only, no calculations
                }
              }}
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const value = e.target.value;
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    await handleDetailChange(index, "discRate", num.toFixed(2), true);
                  }
                }
              }}
              onBlur={async (e) => {
                const value = e.target.value;
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  await handleDetailChange(index, "discRate", num.toFixed(2), true);
                }
              }}
            />

           

            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.discAmount || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,12}(\.\d{0,2})?$/.test(value) || value === "") {
                    handleDetailChange(index, "discAmount", value, false); // Update value only, no calculations
                  }
                }}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const value = e.target.value;
                    const num = parseFloat(value);
                    if (!isNaN(num)) {
                      await handleDetailChange(index, "discAmount", num.toFixed(2), true);
                    }
                  }
                }}
                onBlur={async (e) => {
                  const value = e.target.value;
                  const num = parseFloat(value);
                  if (!isNaN(num)) {
                    await handleDetailChange(index, "discAmount", num.toFixed(2), true);
                  }
                }}
              />
            </td>


            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.netDisc || row.netDisc || ""} // Show same as original amount
                readOnly
              />
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
                    readOnly
                />
            </td>

            <td className="global-tran-td-ui">
              <input
                type="text"
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
                   type="text"
                   className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                   value={row.atcAmount || ""}
                   onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
                />
            </td>


             <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={row.sviAmount || ""}
                readOnly
              />
            </td>


            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
                  value={row.salesAcct || ""}

                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setSelectedRowIndex(index);
                    setShowAccountModal(true);
                    setAccountModalSource("salesAcct");
                  }}
                />
              </div>
            </td>



            
            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
                  value={row.arAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setSelectedRowIndex(index);
                    setShowAccountModal(true);
                    setAccountModalSource("arAcct");
                  }}
                />
              </div>
            </td>

            
            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
                  value={row.vatAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setSelectedRowIndex(index);
                    setShowAccountModal(true);
                    setAccountModalSource("vatAcct");
                  }}
                />
              </div>
            </td>

            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6"
                  value={row.discAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-gray-400 cursor-pointer"
                  onClick={() => {
                    setSelectedRowIndex(index);
                    setShowAccountModal(true);
                    setAccountModalSource("discAcct");
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
     onClick={() =>handleAddRow()}
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
    <label id="totInvoiceAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total VAT Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total VAT Amount:
    </label>
    <label id="totVATAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total ATC Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total ATC Amount:
    </label>
    <label id="totATCAmount" className="global-tran-tab-footer-total-value-ui">
      0.00
    </label>
  </div>

  {/* Total Payable Amount (Invoice + VAT - ATC) */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total Amount Due:
    </label>
    <label id="totAmountDue" className="global-tran-tab-footer-total-value-ui">
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
            <th className="global-tran-th-ui">SL Type Code</th>
            <th className="global-tran-th-ui">SL Code</th>
            <th className="global-tran-th-ui">Particulars</th>
            <th className="global-tran-th-ui">VAT Code</th>
            <th className="global-tran-th-ui">VAT Name</th>
            <th className="global-tran-th-ui">ATC Code</th>
            <th className="global-tran-th-ui">ATC Name</th>
            <th className="global-tran-th-ui">Debit</th>
            <th className="global-tran-th-ui">Credit</th>
            <th className="global-tran-th-ui">Debit FX1</th>
            <th className="global-tran-th-ui">Credit FX1</th>
            <th className="global-tran-th-ui">Debit FX2</th>
            <th className="global-tran-th-ui">Credit FX2</th>
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

               <td className="global-tran-td-ui text-right">
                <input
                  type="number"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.debitFx1 || "0.00"}
                  onChange={(e) => handleDetailChange(index, 'debitFx1', e.target.value)}
                />
              </td>
              <td className="global-tran-td-ui text-right">
                <input
                  type="number"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.creditFx1 || "0.00"}
                  onChange={(e) => handleDetailChange(index, 'creditFx1', e.target.value)}
                />
              </td>

               <td className="global-tran-td-ui text-right">
                <input
                  type="number"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.debitFx2 || "0.00"}
                  onChange={(e) => handleDetailChange(index, 'debitFx2', e.target.value)}
                />
              </td>
              <td className="global-tran-td-ui text-right">
                <input
                  type="number"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.creditFx2 || "0.00"}
                  onChange={(e) => handleDetailChange(index, 'creditFx2', e.target.value)}
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


  
{showBilltermModal && (
        <BillTermLookupModal 
          isOpen={showBilltermModal}
          onClose={handleCloseBillTermModal}
        />
      )}


{custModalOpen && (
  <CustomerMastLookupModal
    isOpen={custModalOpen}
    onClose={handleCloseCustModal}
    customParam="ActiveAll"
  />
)}


{/* COA Account Modal */}
{showAccountModal && (
  <COAMastLookupModal
    isOpen={showAccountModal}
    onClose={handleCloseAccountModal}
    source={accountModalSource}
    customParam={customParam}     
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


{/* Billing Codes Modal  Invoice Detail */}
{showBillCodeModal && (
  <BillCodeLookupModal  
    isOpen={showBillCodeModal}
    onClose={handleCloseBillCodeModal}
    apiEndpoint="getBillcode"
  />
)}



{/* VAT Code Modal  Invoice Detail */}
{showVatModal && (
  <VATLookupModal  
    isOpen={showVatModal}
    onClose={handleCloseVatModal}
    customParam="OutputService"
    apiEndpoint="getVat"
  />
)}


{/* ATC Code Modal Invoice Detail */}
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



{showSpinner && <LoadingSpinner />}





{/* <OpenBalanceModal
  isOpen={showOpenBalanceModal}
  onClose={handleCloseOpenBalanceModal}
/> */}

    </div>
  );
};

export default SVI;
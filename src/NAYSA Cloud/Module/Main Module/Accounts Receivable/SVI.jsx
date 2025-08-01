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
import { transactionUpsert } from '@/NAYSA Cloud/Global/top1RefTable';
import { formatNumber } from '@/NAYSA Cloud/Global/behavior';
import { parseFormattedNumber } from '@/NAYSA Cloud/Global/behavior';

// Header
import Header from '@/NAYSA Cloud/Components/Header';
import { faAdd } from "@fortawesome/free-solid-svg-icons/faAdd";

const SVI = () => {
  const { resetFlag } = useReset();

   const [state, setState] = useState({
    
    // Document information
    documentName: "",
    documentSeries: "Auto",
    documentDocLen: 8,
    documentID: null,
    documentNo: "",
    status: "OPEN",


    // UI state
    activeTab: "basic",
    GLactiveTab: "invoice",
    isLoading: false,
    showSpinner: false,
    isDocNoDisabled: false,
    isSaveDisabled: false,
    isResetDisabled: false,
    isFetchDisabled: false,


     // Header information
    header: {
      svi_date: new Date().toISOString().split('T')[0]
    },

    branchCode: "HO",
    branchName: "Head Office",
    
    // Vendor information
    custCode: "",
    custName: "",
    attention: "",
    
    // Currency information
    currencyCode: "PHP",
    currencyName: "Philippine Peso",
    currencyRate: "1.000000",


    //Other Header Info
    sviTypes :[],
    refDocNo1: "",
    refDocNo2: "",
    fromDate: null,
    toDate: null,
    remarks: "",
    billtermCode: "",
    billtermName: "",
    selectedSVIType : "REG",

    userCode: 'NSI', // Default value

    //Detail 1-2
    detailRows  :[],
    detailRowsGL :[],

    totalDebit:"0.00",
    totalCredit:"0.00",

 
    // Modal states
    modalContext: '',
    selectionContext: '',
    selectedRowIndex: null,
    accountModalSource: null,
    showAccountModal:false,
    showRcModal:false,
    showVatModal:false,
    showAtcModal:false,
    showBillCodeModal:false,
    showSlModal:false,
    showBilltermModal:false,

    currencyModalOpen:false,
    branchModalOpen:false,
    custModalOpen:false,
    billtermModalOpen:false,

   });


  const updateState = (updates) => {
      setState(prev => ({ ...prev, ...updates }));
    };

    const {
    documentName, documentSeries, documentDocLen, documentID, documentNo, status,
    activeTab,GLactiveTab,isLoading,showSpinner,isDocNoDisabled,isSaveDisabled,isResetDisabled,isFetchDisabled,
    branchCode,branchName,custCode,custName,attention,currencyCode,currencyName,currencyRate,
    sviTypes,refDocNo1,refDocNo2,fromDate,toDate,remarks,billtermCode,billtermName,selectedSVIType,
    detailRows,detailRowsGL,totalDebit,totalCredit,
    modalContext,selectionContext,selectedRowIndex,accountModalSource,
    showAccountModal,showRcModal,showVatModal,showAtcModal,showBillCodeModal,showSlModal,showBilltermModal,
    currencyModalOpen,branchModalOpen,custModalOpen,billtermModalOpen,
  } = state;

  const [focusedCell, setFocusedCell] = useState(null); // { index: number, field: string }

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

  const [totals, setTotals] = useState({
  totalGrossAmount: '0.00',
  totalDiscountAmount: '0.00',
  totalNetAmount: '0.00',
  totalVatAmount: '0.00',
  totalSalesAmount: '0.00',
  totalAtcAmount: '0.00',
  totalAmountDue: '0.00',
  });

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

  const updateTotalsDisplay = (grossAmt, discAmt, netDisc, vat, atc, amtDue) => {

  console.log("updateTotalsDisplay received RAW totals:", { grossAmt, discAmt, netDisc, vat, atc, amtDue });

  // document.getElementById('totInvoiceAmount').textContent = formatNumber(netDisc)
  // document.getElementById('totVATAmount').textContent = formatNumber(vat);
  // document.getElementById('totATCAmount').textContent = formatNumber(atc);
  // document.getElementById('totAmountDue').textContent = formatNumber(amtDue);

  setTotals({
        totalGrossAmount: formatNumber(grossAmt),
        totalDiscountAmount: formatNumber(discAmt),
        totalNetAmount: formatNumber(netDisc),
        totalVatAmount: formatNumber(vat),
        totalSalesAmount: formatNumber(netDisc - vat),
        totalAtcAmount: formatNumber(atc),
        totalAmountDue: formatNumber(amtDue),
    });

    console.log("Updated 'totals' state (formatted):", {
        totalGrossAmount: formatNumber(grossAmt),
        totalDiscountAmount: formatNumber(discAmt),
        totalNetAmount: formatNumber(netDisc),
        totalVatAmount: formatNumber(vat),
        totalSalesAmount: formatNumber(netDisc - vat),
        totalAtcAmount: formatNumber(atc),
        totalAmountDue: formatNumber(amtDue),
    });

};

useEffect(() => {
  handleReset();
}, []);


useEffect(() => {
  const debitSum = detailRowsGL.reduce((acc, row) => acc + (parseFormattedNumber(row.debit) || 0), 0);
  const creditSum = detailRowsGL.reduce((acc, row) => acc + (parseFormattedNumber(row.credit) || 0), 0);
updateState({
  totalDebit: formatNumber(debitSum),
  totalCredit: formatNumber(creditSum)
})
}, [detailRowsGL]);


  useEffect(() => {

    if (resetFlag) {    
       handleReset();
    }
    
    let timer;
    if (isLoading) {
      timer = setTimeout(() => updateState({ showSpinner: true }), 200);
    } else {
      updateState({ showSpinner: false });
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
       updateState({ detailRows: updatedRows });
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

      loadDocDropDown();
      loadDocControl();
      loadCompanyData();

      updateState({
          header:{
            svi_date:new Date().toISOString().split("T")[0]
          },

      branchCode: "HO",
      branchName: "Head Office",
      
      refDocNo1: "",
      refDocNo2:"",
      fromDate:null,
      toDate:null,
      remarks:"",

      custName:"",
      custCode:"",
      documentNo: "",
      documentID: "",
      detailRows: [],
      detailRowsGL:[],
      
      // UI state
      activeTab: "basic",
      GLactiveTab: "invoice",
      isLoading: false,
      showSpinner: false,
      isDocNoDisabled: false,
      isSaveDisabled: false,
      isResetDisabled: false,
      isFetchDisabled: false,

    });
      updateTotalsDisplay (0, 0, 0, 0, 0, 0)
  };


  const loadCompanyData = async () => {
      const data = await getTopCompanyRow();
      if(data){
      updateState({
      currencyCode:data.currCode,
      currencyName:data.currName,
      currencyRate:formatNumber(data.currRate,6)
        });
      };
  };


  const loadDocControl = async () => {
      const data = await getTopDocControlRow();
      if(data){
      updateState({
      documentName: data.docName,
      documentSeries: data.docName,
      tdocumentDocLen: data.docName,
      });
      };
  };



  const loadDocDropDown = async () => {
   const data = await getTopDocDropDown(docType,"SVITRAN_TYPE");
      if(data){
        updateState({
         sviTypes: data,
         selectedSVIType: "REG",
          });
        };
        
   };
 
useEffect(() => {
    updateState({ isDocNoDisabled: !!state.documentID });
}, [state.documentID]);
 




const fetchSviData = async (sviNo) => {
    const { branchCode } = state;

    if (!sviNo || !branchCode) {
        console.warn("SVI No. or Branch Code missing. Cannot fetch data.");
        return;
    }

    updateState({ isLoading: true });
    try {
        const response = await fetchData(`getSVI?sviNo=${sviNo}&branchCode=${branchCode}`);
        console.log("API Response:", response);

        if (response?.success && response.data && response.data.length > 0) {
            let data;
            try {
                data = JSON.parse(response.data[0].result);
                console.log("Parsed SVI Data (from SPROC result):", data);
            } catch (parseError) {
                console.error("JSON.parse error on response.data[0].result:", parseError);
                Swal.fire({
                    icon: 'error',
                    title: 'Data Format Error',
                    text: 'Received malformed data from the server. Please contact support.',
                });
                updateState({ documentID: '', isDocNoDisabled: false, isFetchDisabled: false });
                updateTotals([]);
                return;
            }

            if (data && data.sviId) {
                let sviDateForHeader = '';
                if (data.sviDate) {
                    const dateObj = new Date(data.sviDate);
                    if (!isNaN(dateObj.getTime())) {
                        sviDateForHeader = dateObj.toISOString().split("T")[0];
                    } else {
                        console.warn(`Invalid sviDate value received from API: "${data.sviDate}". Setting svi_date to empty string.`);
                    }
                } else {
                    console.warn("sviDate property is missing from fetched SVI data. Setting svi_date to empty string.");
                }

                // const retrievedDetailRows = data.dt1 || [];

                const retrievedDetailRows = (data.dt1 || []).map(item => ({
                    ...item,
                    quantity: formatNumber(item.quantity),
                    unitPrice: formatNumber(item.unitPrice),
                    grossAmount: formatNumber(item.grossAmount),
                    discRate: formatNumber(item.discRate), // Make sure discRate is also formatted
                    discAmount: formatNumber(item.discAmount),
                    netDisc: formatNumber(item.netDisc),
                    vatAmount: formatNumber(item.vatAmount),
                    atcAmount: formatNumber(item.atcAmount),
                    sviAmount: formatNumber(item.sviAmount),
                }));
                console.log("Retrieved Detail Rows (dt1):", retrievedDetailRows);

                // *** CRITICAL ADDITION/MODIFICATION HERE ***
                const formattedGLRows = (data.dt2 || []).map(glRow => ({
                    ...glRow,
                    debit: formatNumber(glRow.debit),
                    credit: formatNumber(glRow.credit),
                    debitFx1: formatNumber(glRow.debitFx1), // Format foreign currency fields if they exist
                    creditFx1: formatNumber(glRow.creditFx1),
                    debitFx2: formatNumber(glRow.debitFx2),
                    creditFx2: formatNumber(glRow.creditFx2),
                    // Add any other numerical fields in dt2 that need formatting
                }));
                console.log("Formatted GL Entries (dt2):", formattedGLRows);


                updateState({
                    documentID: data.sviId,
                    documentNo: data.sviNo,
                    branchCode: data.branchCode,
                    header: { svi_date: sviDateForHeader },
                    selectedSVIType: data.svitranType,
                    custCode: data.custCode,
                    custName: data.custName,
                    refDocNo1: data.refDocNo1,
                    refDocNo2: data.refDocNo2,
                    currCode: data.currCode,
                    currRate: data.currRate,
                    remarks: data.remarks,
                    detailRows: retrievedDetailRows,
                    detailRowsGL: formattedGLRows, // Use the newly formatted GL rows here
                    isDocNoDisabled: true,
                    isFetchDisabled: true,
                    billtermCode: data.billtermCode,
                    // totalGrossAmount: data.totalGrossAmount,
                    // totalDiscountAmount: data.totalDiscountAmount,
                    // totalNetAmount: data.totalNetAmount,
                    // totalVatAmount: data.totalVatAmount,
                    // totalAtcAmount: data.totalAtcAmount,
                    // totalAmountDue: data.totalAmountDue,
                });

                console.log("GL ENTRIES", formattedGLRows); // Log the formatted ones

                updateTotals(retrievedDetailRows); // This should recalculate and set the total state variables

                // updateTotals(retrievedDetailRows); // This is for main totals, not GL totals
                // You might need a separate updateGLTotals here if your main totals function doesn't handle GL
            } 
            else {
                console.warn("API response successful, but parsed SVI data was empty or did not contain a valid SVI record.");
                Swal.fire({
                    icon: 'info',
                    title: 'No Records Found',
                    text: 'Transaction does not exist.',
                });
                updateState({ documentID: '', isDocNoDisabled: false, isFetchDisabled: false });
                updateTotals([]);
            }
        } else {
            console.warn("API response did not indicate success or returned no data.");
            Swal.fire({
                icon: 'info',
                title: 'No Records Found',
                text: 'Transaction does not exist.',
            });
            updateState({ documentID: '', isDocNoDisabled: false, isFetchDisabled: false });
            updateTotals([]);
        }
    } catch (error) {
        console.error("Error fetching SVI data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Fetch Error',
            text: error.message || 'An unexpected error occurred while fetching SVI data. Please try again.',
        });
        updateState({ documentID: '', isDocNoDisabled: false, isFetchDisabled: false });
        updateTotals([]);
    } finally {
        updateState({ isLoading: false });
    }
};

const handleSviNoBlur = () => {
    if (!state.documentID && state.documentNo && state.branchCode) { 
        fetchSviData(state.documentNo);
    }
};


 const handleActivityOption = async (action) => {
   
  updateState({ isLoading: true });

    const {
        branchCode,
        documentNo,
        documentID,
        header,
        selectedSVIType,
        billtermCode,
        custCode,
        custName,
        refDocNo1,
        refDocNo2,
        fromDate,
        toDate,
        currencyCode,
        currencyRate,
        remarks,
        // userCode, // Assuming userCode is also part of your state
        detailRows,
        detailRowsGL
    } = state;

    updateState({ isLoading: true });

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
        vatAcct: row.vatAcct,
        discAcct: row.discAcct,
        rcCode:row.rcCode
      })),
       dt2: detailRowsGL.map((entry, index) => ({
          recNo: String(index + 1),
          acctCode: entry.acctCode || "",
          rcCode: entry.rcCode || "",
          sltypeCode: entry.sltypeCode || "",
          slCode: entry.slCode || "",
          particular: entry.particular || "",
          vatCode: entry.vatCode || "",
          vatName: entry.vatName || "",
          atcCode: entry.atcCode || "",
          atcName: entry.atcName || "",
          debit: parseFormattedNumber(entry.debit || 0),
          credit: parseFormattedNumber(entry.credit || 0),
          debitFx1: parseFormattedNumber(entry.debitFx1 || 0),
          creditFx1: parseFormattedNumber(entry.creditFx1 || 0),
          debitFx2: parseFormattedNumber(entry.debitFx2 || 0),
          creditFx2: parseFormattedNumber(entry.creditFx2 || 0),
          slrefNo: entry.slRefNo || "",
          slrefDate: entry.slrefDate ? new Date(entry.slrefDate).toISOString().split("T")[0] : null,
          remarks: entry.remarks || "",
          dt1Lineno: entry.dt1Lineno || ""
        }))
    };

    if (action === "GenerateGL") {
        try {
            const newGlEntries = await generateGLEntries(docType, glData);

            if (newGlEntries) {
                console.log("Successfully generated GL entries:", newGlEntries);
                updateState({ detailRowsGL: newGlEntries });
            } else {
                console.warn("GL entries generation failed or returned no data.");
            }
        } catch (error) {
            console.error("Error during GL generation:", error);
        } finally {
            updateState({ isLoading: false });
        }
    }


    if (action === "Upsert") {
        try {
                console.log("Upsert Data:",glData);
            const response = await transactionUpsert(docType, glData, updateState, 'sviId', 'sviNo');
            if (response) { 
                console.log("Successfully Save Transaction:");
            }
        } catch (error) {
            console.error("Error during transaction upsert:", error);
        } finally {
            updateState({ isLoading: false });
        }
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

      const updatedRows = [...detailRows, ...newRows];
      updateState({ detailRows: updatedRows });
      updateTotals(updatedRows);


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


const handleAddRowGL = () => {
  updateState({
      detailRowsGL: [
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
      ]
    });
  };

  
  const handleDeleteRowGL = (index) => {
    const updatedRows = [...detailRowsGL];
    updatedRows.splice(index, 1);
    updateState({ detailRowsGL: updatedRows });
  };

  
  const openCurrencyModal = () => {
    updateState({ currencyModalOpen: true });
  };

  const openBillTermModal = () => {
    updateState({ billtermModalOpen: true });
  };

  const handleSelectCurrency = async (currencyCode) => {
    if (!currencyCode) return;
  
    try {
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
        
        updateState({
        currencyCode: currencyCode,
        currencyName:currData[0]?.currName,
        currencyRate:rate
        })
      }
    } catch (currError) {
      console.error("Currency API error:", currError);
    }
  };


const handleSelectBillTerm = async (billtermCode) => {
    if (billtermCode) {
        try {
            const payload = { BILLTERM_CODE: billtermCode };
            const termResponse = await postRequest("getBillterm", JSON.stringify(payload));

            if (termResponse.success) {
                const termData = JSON.parse(termResponse.data[0].result);
                updateState({
                    billtermName: termData[0]?.billtermName || "",
                    billtermCode: termData[0]?.billtermCode || ""
                });
            } else {
                console.warn("API call for getBillterm returned success: false", termResponse.message);
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
  
      const parsed = JSON.parse(rawResult);
      return parsed;
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  };

  // const handlePrint = async () => {
  //   try {
  //     // Validate inputs
  //     if (!documentNo || !branchCode) {
  //       alert("Please enter Document Number and select Branch before printing");
  //       return;
  //     }
  
  //     const idResponse = await fetchData("getPrintingID");
  //     if (!idResponse?.success) {
  //       throw new Error("Failed to get printing ID");
  //     }
  //     const tranID = idResponse.data[0]?.generatedID;
  
  //     if (!tranID) {
  //       throw new Error("No printing ID generated");
  //     }
  
  //     const payload = {
  //       json_data: {
  //         generatedID: tranID,
  //         docCode: docType,
  //         branchCode: branchCode,
  //         docNo: documentNo,
  //         Instance: "NAYSA-GERARD",
  //         Catalog: "NAYSAFinancials",
  //         checkedBy: "xxxx",
  //         notedBy: "xxxxx",
  //         approvedBy: "xxxxx"
  //       }
  //     };
  
  //     // Use full API URL with your server's base URL
  //     const apiUrl = 'http://127.0.0.1:8000/api/printForm'; // Adjust if using different port
      
  //     const response = await fetch(apiUrl, {
  //       method: 'POST',
  //       headers: { 
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json'
  //       },
  //       body: JSON.stringify(payload)
  //     });
  
  //     // Improved error handling
  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       console.error('Full error response:', errorText);
  //       throw new Error(`Server error: ${response.status} - ${response.statusText}`);
  //     }
  
  //     // Handle response
  //     const contentType = response.headers.get('content-type');
      
  //     if (contentType?.includes('application/pdf')) {
  //       // PDF handling
  //       const blob = await response.blob();
  //       const url = URL.createObjectURL(blob);
        
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = `APV_${documentNo}.pdf`;
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
        
  //       setTimeout(() => URL.revokeObjectURL(url), 100);
  //     } else {
  //       // JSON handling
  //       const result = await response.json();
  //       if (!result.success) {
  //         throw new Error(result.message || "Printing failed");
  //       }
  //       console.log("Print result:", result);
  //     }
  //   } catch (error) {
  //     console.error("Printing Error:", error);
  //     alert(`Printing failed: ${error.message}`);
  //   }
  // };

window.getSVIDataForPrint = null;

  // Inside your SVI.jsx component where you have the fetched 'data'
const handlePrint = () => {
        // Check if there's data to print
        if (!state.documentID) {
            alert('No SVI data loaded to print!');
            return;
        }

        // Create a new window to host the print content
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        // Construct the HTML content for the print window
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
            <title>Sales Voucher Invoice (SVI) Print Form</title>
            <style>
                /* Copy all the CSS from the provided sample HTML here */
                ${document.querySelector('style').innerHTML} /* This is a hacky way for demo. Better to copy directly. */
                body {
                    font-family: Arial, sans-serif;
                    font-size: 9pt;
                    margin: 0;
                    padding: 15mm;
                    box-sizing: border-box;
                }
                .print-container { width: 100%; max-width: 8.5in; margin: 0 auto; padding: 10px; }
                .header, .footer { text-align: center; margin-bottom: 15px; }
                .header h1 { margin: 0; font-size: 16pt; color: #333; }
                .header h2 { margin: 5px 0 10px 0; font-size: 14pt; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .header p { margin: 2px 0; font-size: 8pt; color: #666; }
                .transaction-info { display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #ddd; }
                .transaction-info > div { flex: 1; min-width: 30%; padding: 5px 10px; box-sizing: border-box; }
                .transaction-info label { font-weight: bold; color: #555; display: inline-block; width: 90px; margin-right: 5px; font-size: 8.5pt; }
                .transaction-info span { font-size: 8.5pt; color: #000; display: inline-block; max-width: calc(100% - 100px); vertical-align: top; }
                .table-section { margin-bottom: 20px; }
                .table-section h3 { font-size: 11pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; margin-bottom: 10px; }
                .details-table { width: 100%; border-collapse: collapse; }
                .details-table th, .details-table td { border: 1px solid #eee; padding: 6px 8px; text-align: left; font-size: 8.5pt; }
                .details-table th { background-color: #f8f8f8; font-weight: bold; color: #333; white-space: nowrap; }
                .details-table .text-right { text-align: right; }
                .details-table .text-center { text-align: center; }
                .totals-summary { display: flex; justify-content: flex-end; margin-top: 15px; }
                .totals-summary > div { width: 300px; border-top: 2px solid #333; padding-top: 10px; }
                .totals-summary div > div { display: flex; justify-content: space-between; padding: 2px 0; }
                .totals-summary label { font-weight: bold; color: #333; font-size: 9pt; }
                .totals-summary span { font-weight: bold; color: #000; font-size: 9.5pt; }
                .remarks-section { margin-top: 20px; padding: 10px; border-top: 1px dashed #ddd; font-size: 8.5pt; color: #555; }
                .remarks-section label { font-weight: bold; display: block; margin-bottom: 5px; }
                .footer-signatures { margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 15px; display: flex; justify-content: space-around; text-align: center; }
                .footer-signatures div { flex: 1; margin: 0 10px; }
                .footer-signatures .signature-line { display: block; width: 80%; margin: 50px auto 5px auto; border-bottom: 1px solid #000; }
                .footer-signatures span { font-size: 8pt; color: #555; }
                .print-button-container { display: none; } /* Hide the button in the print window itself */
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; font-size: 8.5pt; }
                    .print-container { border: none; padding: 0; max-width: none; width: 100%; }
                    .details-table th, .details-table td { padding: 4px 6px; }
                    .transaction-info label, .transaction-info span { font-size: 8pt; }
                    .remarks-section, .footer-signatures span { font-size: 8pt; }
                }
            </style>
            </head>
            <body>
                <div class="print-container">
                    <div class="header">
                        <h1>NAYSA SOLUTIONS INC.</h1>
                        <p>123 Main Street, Makati City, Metro Manila, Philippines</p>
                        <p>Contact: (02) 1234-5678 | Email: info@yourcompany.com</p>
                    </div>
                    <div class="header">
                        <h2>SERVICE INVOICE</h2>
                    </div>
                    <div class="transaction-info">
                        <div><label>SVI No.:</label><span id="sviNo"></span></div>
                        <div><label>SVI Date:</label><span id="sviDate"></span></div>
                        <div><label>Branch Code:</label><span id="branchCode"></span></div>
                        <div><label>Customer Code:</label><span id="custCode"></span></div>
                        <div><label>Customer Name:</label><span id="custName"></span></div>
                        <div><label>Ref Doc No. 1:</label><span id="refDocNo1"></span></div>
                        <div><label>Ref Doc No. 2:</label><span id="refDocNo2"></span></div>
                        <div><label>Currency:</label><span id="currCode"></span></div>
                        <div><label>Currency Rate:</label><span id="currRate"></span></div>
                        <div><label>SVI Type:</label><span id="sviTranType"></span></div>
                        <div><label>Bill Term:</label><span id="billTermCode"></span></div>
                    </div>
                    <div class="table-section">
                        <h3>Invoice Details</h3>
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>Line No.</th><th>Bill Code</th><th>Bill Name</th><th>UOM</th><th>Qty</th><th>Unit Price</th>
                                    <th>Gross Amount</th><th>Disc. Amount</th><th>Net Amount</th><th>VAT Amount</th><th>ATC Amount</th><th>SVI Amount</th>
                                </tr>
                            </thead>
                            <tbody id="dt1TableBody"></tbody>
                        </table>
                    </div>
                    <div class="totals-summary">
                        <div>
                            <div><label>Total Gross Amount:</label><span id="totalGrossAmount"></span></div>
                            <div><label>Total Discount Amount:</label><span id="totalDiscountAmount"></span></div>
                            <div><label>Total Net Amount:</label><span id="totalNetAmount"></span></div>
                            <div><label>Total VAT Amount:</label><span id="totalVatAmount"></span></div>
                            <div><label>Total ATC Amount:</label><span id="totalAtcAmount"></span></div>
                            <div><label>Total Amount Due:</label><span id="totalAmountDue"></span></div>
                        </div>
                    </div>
                    <div class="table-section">
                        <h3>General Ledger Entries</h3>
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>Rec No.</th><th>Account Code</th><th>Particulars</th><th>RC Code</th><th>SL Type</th><th>SL Code</th>
                                    <th>VAT Code</th><th>ATC Code</th><th class="text-right">Debit</th><th class="text-right">Credit</th>
                                </tr>
                            </thead>
                            <tbody id="dt2TableBody"></tbody>
                            <tfoot>
                                <tr><th colspan="8" class="text-right">Total Debit:</th><th class="text-right" id="totalDebitGL"></th><th></th></tr>
                                <tr><th colspan="8" class="text-right">Total Credit:</th><th></th><th class="text-right" id="totalCreditGL"></th></tr>
                                <tr><th colspan="8" class="text-right">Balance:</th><th class="text-right" colspan="2" id="glBalance"></th></tr>
                            </tfoot>
                        </table>
                    </div>
                    <div class="remarks-section">
                        <label>Remarks:</label>
                        <p id="remarks"></p>
                    </div>
                    <div class="footer-signatures">
                        <div><span class="signature-line"></span><span>Prepared By</span></div>
                        <div><span class="signature-line"></span><span>Checked By</span></div>
                        <div><span class="signature-line"></span><span>Approved By</span></div>
                    </div>
                </div>
                <script>
                    // Helper functions (same as in your main component)
                    function formatCurrency(amount) {
                        if (amount === null || amount === undefined) return '';
                        const num = parseFloat(amount);
                        if (isNaN(num)) return '';
                        return num.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
                    }
                    function formatDate(isoString) {
                        if (!isoString) return '';
                        const date = new Date(isoString);
                        if (isNaN(date.getTime())) return '';
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                    }

                    // Function to populate the print form
                    function populatePrintForm(printData) {
                        document.getElementById('sviNo').textContent = printData.sviNo || '';
                        document.getElementById('sviDate').textContent = formatDate(printData.sviDate);
                        document.getElementById('branchCode').textContent = printData.branchCode || '';
                        document.getElementById('custCode').textContent = printData.custCode || '';
                        document.getElementById('custName').textContent = printData.custName || '';
                        document.getElementById('refDocNo1').textContent = printData.refDocNo1 || 'N/A';
                        document.getElementById('refDocNo2').textContent = printData.refDocNo2 || 'N/A';
                        document.getElementById('currCode').textContent = printData.currCode || '';
                        document.getElementById('currRate').textContent = printData.currRate !== null ? printData.currRate.toFixed(6) : '';
                        document.getElementById('sviTranType').textContent = printData.svitranType || '';
                        document.getElementById('billTermCode').textContent = printData.billtermCode || '';
                        document.getElementById('remarks').textContent = printData.remarks || 'None';

                        const dt1Body = document.getElementById('dt1TableBody');
                        dt1Body.innerHTML = '';
                        if (printData.dt1 && printData.dt1.length > 0) {
                            printData.dt1.forEach(item => {
                                const row = dt1Body.insertRow();
                                row.insertCell().textContent = item.lnNo || '';
                                row.insertCell().textContent = item.billCode || '';
                                row.insertCell().textContent = item.billName || '';
                                row.insertCell().textContent = item.uomCode || '';
                                row.insertCell().textContent = item.quantity !== null ? parseFloat(item.quantity).toFixed(2) : '';
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.unitPrice);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.grossAmount);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.discAmount);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.netDisc);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.vatAmount);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.atcAmount);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.sviAmount);
                            });
                        } else {
                            const row = dt1Body.insertRow();
                            const cell = row.insertCell();
                            cell.colSpan = 12;
                            cell.textContent = "No invoice details found.";
                            cell.classList.add('text-center');
                            cell.style.fontStyle = 'italic';
                            cell.style.color = '#888';
                        }

                        const dt2Body = document.getElementById('dt2TableBody');
                        dt2Body.innerHTML = '';
                        let totalDebitGL = 0;
                        let totalCreditGL = 0;
                        if (printData.dt2 && printData.dt2.length > 0) {
                            printData.dt2.forEach(item => {
                                const row = dt2Body.insertRow();
                                row.insertCell().textContent = item.recNo || '';
                                row.insertCell().textContent = item.acctCode || '';
                                row.insertCell().textContent = item.particular || '';
                                row.insertCell().textContent = item.rcCode || '';
                                row.insertCell().textContent = item.sltypeCode || '';
                                row.insertCell().textContent = item.slCode || '';
                                row.insertCell().textContent = item.vatCode || '';
                                row.insertCell().textContent = item.atcCode || '';
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.debit);
                                row.insertCell().classList.add('text-right');
                                row.insertCell().textContent = formatCurrency(item.credit);
                                totalDebitGL += (item.debit || 0);
                                totalCreditGL += (item.credit || 0);
                            });
                        } else {
                            const row = dt2Body.insertRow();
                            const cell = row.insertCell();
                            cell.colSpan = 10;
                            cell.textContent = "No GL entries found.";
                            cell.classList.add('text-center');
                            cell.style.fontStyle = 'italic';
                            cell.style.color = '#888';
                        }

                        document.getElementById('totalGrossAmount').textContent = formatCurrency(printData.totalGrossAmount);
                        document.getElementById('totalDiscountAmount').textContent = formatCurrency(printData.totalDiscountAmount);
                        document.getElementById('totalNetAmount').textContent = formatCurrency(printData.totalNetAmount);
                        document.getElementById('totalVatAmount').textContent = formatCurrency(printData.totalVatAmount);
                        document.getElementById('totalAtcAmount').textContent = formatCurrency(printData.totalAtcAmount);
                        document.getElementById('totalAmountDue').textContent = formatCurrency(printData.totalAmountDue);
                        document.getElementById('totalDebitGL').textContent = formatCurrency(totalDebitGL);
                        document.getElementById('totalCreditGL').textContent = formatCurrency(totalCreditGL);
                        document.getElementById('glBalance').textContent = formatCurrency(totalDebitGL - totalCreditGL);
                    }

                    // Get the data from the opener window (your main app)
                    const transactionData = window.opener.getSVIDataForPrint();
                    if (transactionData) {
                        populatePrintForm(transactionData);
                        // Give the browser a moment to render before printing
                        setTimeout(() => {
                            window.print();
                            // Close the print window after printing
                            window.onafterprint = () => window.close();
                        }, 500);
                    } else {
                        document.body.innerHTML = '<h1>Error: No SVI data to print.</h1>';
                    }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close(); // Important: closes the document stream and forces rendering
    };

// ... then attach handlePrint to a button
// <button onClick={handlePrint}>Print SVI</button>

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
        updateState({ custModalOpen: false });
        return;
    }

    updateState({ custModalOpen: false });
    updateState({ isLoading: true });

    try {
        const custDetails = {
            custCode: selectedData?.custCode || '',
            custName: selectedData?.custName || '',
            currCode: selectedData?.currCode || '',
            attention: selectedData?.attention || '',
            billtermCode: selectedData?.billtermCode || '',
            billtermName: selectedData?.billtermName || ''
        };

        updateState({
            custName: selectedData.custName,
            custCode: selectedData.custCode
        });
        
        if (!selectedData.currCode) {
            const payload = { CUST_CODE: selectedData.custCode };
            const response = await postRequest("getCustomer", JSON.stringify(payload));

            if (response.success) {
                const data = JSON.parse(response.data[0].result);
                custDetails.currCode = data[0]?.currCode;
                custDetails.attention = data[0]?.custContact;
                custDetails.billtermCode = data[0]?.billtermCode;
                custDetails.billtermName = data[0]?.billtermName;
            } else {
                console.warn("API call for getCustomer returned success: false", response.message);
            }
        }

        await Promise.all([
            handleSelectCurrency(custDetails.currCode),
            handleSelectBillTerm(custDetails.billtermCode),
            updateState({ attention: custDetails.attention })
        ]);

    } catch (error) {
        console.error("Error fetching customer details:", error);
    } finally {
        updateState({ isLoading: false });
    }
};

  const updateTotals = (rows) => {

  console.log("updateTotals received rows:", rows); // STEP 5: Check rows passed to updateTotals

  let totalNetDiscount = 0;
  let totalVAT = 0;
  let totalATC = 0;
  let totalAmtDue = 0;
  let totalGrossAmt =0;
  let totalDiscAmt=0;

  rows.forEach(row => {
    
        console.log("Row values before parseFormattedNumber:", {
            vatAmountRaw: row.vatAmount,
            atcAmountRaw: row.atcAmount,
            grossAmountRaw: row.grossAmount,
            netDiscRaw: row.netDisc,
            discAmountRaw: row.discAmount
        });

    const vatAmount = parseFormattedNumber(row.vatAmount || 0) || 0;
    const atcAmount = parseFormattedNumber(row.atcAmount || 0) || 0;
    const invoiceGross = parseFormattedNumber(row.grossAmount || 0) || 0;
    const invoiceNetDisc = parseFormattedNumber(row.netDisc || row.netDisc || 0) || 0;
    const invoiceDiscount = parseFormattedNumber(row.discAmount || 0) || 0;

        console.log("Row values after parseFormattedNumber:", {
            vatAmount, atcAmount, invoiceGross, invoiceNetDisc, invoiceDiscount
        });

    totalGrossAmt+= invoiceGross;
    totalDiscAmt+= invoiceDiscount;
    totalNetDiscount+= invoiceNetDisc;
    totalVAT += vatAmount;
    totalATC += atcAmount;
  });

  totalAmtDue = totalNetDiscount - totalATC; // <--- POTENTIAL CORRECTION HERE

    console.log("Calculated RAW totals (before formatting):", {
        totalGrossAmt, totalDiscAmt, totalNetDiscount, totalVAT, totalATC, totalAmtDue
    });

    updateTotalsDisplay (totalGrossAmt,totalDiscAmt,totalNetDiscount, totalVAT, totalATC, totalAmtDue);

};

const handleDetailChange = async (index, field, value, runCalculations = true) => {
    const updatedRows = [...detailRows];

    updatedRows[index] = {
      ...updatedRows[index],
      [field]: value,
    }

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


    if (['salesAcct', 'arAcct', 'vatAcct', 'discAcct'].includes(field)) {
        if (typeof value === 'object' && value !== null && value.acctCode) {
            row[field] = value.acctCode;
            row[`${field}Name`] = value.acctName || '';
            row[`${field}ReqRC`] = value.rcReq || 'N'; 
            row[`${field}ReqSL`] = value.slReq || 'N';
        } else {
            row[field] = value; 
            row[`${field}Name`] = '';
            row[`${field}ReqRC`] = 'N';
            row[`${field}ReqSL`] = 'N';
        }
    }


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

      if (field === 'discAmount') {
        const newDiscAmt = parseFormattedNumber(row.discAmount) || 0;
        const newGrossAmt = +(origQuantity * origUnitPrice).toFixed(2);
        const newDiscRate = +(newDiscAmt / newGrossAmt * 100).toFixed(2);
        row.discRate = newDiscRate.toFixed(2);
        await recalcRow(newGrossAmt, newDiscAmt);
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

    updatedRows[index] = row;
    updateState({ detailRows: updatedRows });
    updateTotals(updatedRows);

};

const handleDetailChangeGL = async (index, field, value) => {
    const updatedRowsGL = [...state.detailRowsGL];
    let row = { ...updatedRowsGL[index] };

    if (['debit', 'credit', 'debitFx1', 'creditFx1', 'debitFx2', 'creditFx2'].includes(field)) {
        row[field] = value;

        const parsedValue = parseFormattedNumber(value);
        if (field === 'debit' && parsedValue > 0) {
            row.credit = "0.00";
        } else if (field === 'credit' && parsedValue > 0) {
            row.debit = "0.00";
        }
        if (field === 'debitFx1' && parsedValue > 0) {
            row.creditFx1 = "0.00";
        } else if (field === 'creditFx1' && parsedValue > 0) {
            row.debitFx1 = "0.00";
        }
        if (field === 'debitFx2' && parsedValue > 0) {
            row.creditFx2 = "0.00";
        } else if (field === 'creditFx2' && parsedValue > 0) {
            row.debitFx2 = "0.00";
        }

    } else if (field === 'acctCode') {
        if (typeof value === 'object' && value !== null && value.acctCode) {
            row.acctCode = value.acctCode;
            row.acctName = value.acctName || '';
            row.rcReq = value.rcReq || 'N';
            row.slReq = value.slReq || 'N';
            // DO NOT set row.particular here anymore, it will be built at the end

            if (value.slReq && (value.slReq.toUpperCase() === 'Y' || value.slReq.toUpperCase() === 'YES')) {
                row.slCode = "REQ SL";
                row.slName = ""; // Clear slName if it's "REQ SL"
                // row.sltypeCode = "";
            } else {
                row.slCode = "";
                row.slName = ""; // Clear slName if not required
                row.sltypeCode = "";
            }
            if (value.rcReq && (value.rcReq.toUpperCase() === 'Y' || value.rcReq.toUpperCase() === 'YES')) {
                row.rcCode = "REQ RC";
                row.rcName = ""; // Clear rcName if it's "REQ RC"
            } else {
                row.rcCode = "";
                row.rcName = ""; // Clear rcName if not required
            }
        } else {
            // If acctCode is cleared/invalidated
            row.acctCode = value;
            row.acctName = '';
            row.rcReq = 'N';
            row.slReq = 'N';
            row.slCode = '';
            row.slName = '';
            row.rcCode = '';
            row.rcName = '';
            // row.sltypeCode = '';
            // DO NOT set row.particular here, it will be built at the end
        }
    }
    // Handle RC Code lookup
    else if (field === 'rcCode') {
        if (typeof value === 'object' && value !== null && value.rcCode) {
            row.rcCode = value.rcCode;
            row.rcName = value.rcName || '';
            // DO NOT set row.particular here, it will be built at the end
        } else {
            row.rcCode = value;
            row.rcName = ''; // Clear rcName if rcCode is cleared/invalidated
            // DO NOT set row.particular here, it will be built at the end
        }
    }
    // Handle SL Code lookup
    else if (field === 'slCode') {
        if (typeof value === 'object' && value !== null && value.slCode) {
            row.slCode = value.slCode;
            row.slName = value.slName || '';
            // row.sltypeCode = value.sltypeCode || '';
            row.sltypeCode = value.sltypeCode || 'CU';
            // DO NOT set row.particular here, it will be built at the end
        } else {
            row.slCode = value;
            row.slName = ''; // Clear slName if slCode is manually changed/cleared
            row.sltypeCode = '';
            // DO NOT set row.particular here, it will be built at the end
        }
    }
    // Handle direct input for sltypeCode
    else if (field === 'sltypeCode') {
        row.sltypeCode = value;
    }
    // All other fields
    else {
        row[field] = value;
    }

    // --- NEW LOGIC: BUILD row.particular AFTER ALL FIELD UPDATES ---
    const particularParts = [];

    // Add acctName always if available
    if (row.acctName) {
        particularParts.push(row.acctName);
    }

    // Add rcName if it exists and rcCode is NOT "REQ RC"
    if (row.rcName && row.rcCode !== "REQ RC") {
        particularParts.push(row.rcName);
    }

    // Add slName if it exists and slCode is NOT "REQ SL"
    if (row.slName && row.slCode !== "REQ SL") {
        particularParts.push(row.slName);
    }

    // Join the parts with " / "
    row.particular = particularParts.join(' / ');

    updatedRowsGL[index] = row;
    updateState({ detailRowsGL: updatedRowsGL });
};

// You'll need an additional handler for the onBlur event
const handleBlurGL = (index, field, value) => {
    const updatedRowsGL = [...state.detailRowsGL]; // Use state directly here
    let row = { ...updatedRowsGL[index] };

    // Parse the value that was entered by the user (which might be "1,234.56" or "1234.56")
    const parsedValue = parseFormattedNumber(value);

    // Now format this parsed number for display
    row[field] = formatNumber(parsedValue);

    // Apply zeroing logic on blur
    if (field === 'debit' && parsedValue > 0) {
        row.credit = formatNumber(0);
    } else if (field === 'credit' && parsedValue > 0) {
        row.debit = formatNumber(0);
    }

    if (field === 'debitFx1' && parsedValue > 0) {
        row.creditFx1 = formatNumber(0);
    } else if (field === 'creditFx1' && parsedValue > 0) {
        row.debitFx1 = formatNumber(0);
    }

    if (field === 'debitFx2' && parsedValue > 0) {
        row.creditFx2 = formatNumber(0);
    } else if (field === 'creditFx2' && parsedValue > 0) {
        row.debitFx2 = formatNumber(0);
    }

    updatedRowsGL[index] = row;
    updateState({ detailRowsGL: updatedRowsGL });
};

const handleDoubleClick_GL_AcctCode = async (index) => { 
    const currentValue = detailRowsGL[index]?.acctCode;

    updateState({ isLoading: true });

    try {
        const updatedRows = [...detailRowsGL];

        if (currentValue) {
            updatedRows[index] = {
                ...updatedRows[index],
                acctCode: "",
                acctName: "",
            };
            updateState({ detailRowsGL: updatedRows });
            // updateTotals(updatedRows);
        } else {
            updateState({
                selectedRowIndex: index,
                showAccountModal: true,
            });
        }
    } catch (error) {
        console.error("Error in handleDoubleClick_GL_AcctCode:", error);
    } finally {
        updateState({ isLoading: false });
    }
};


const handleDoubleClick_GL_RcCode = async (index) => {
    // We no longer need to check currentRcCode here,
    // as double-click will always open the modal.
    // The UI's onDoubleClick prop already handles when it's allowed to trigger.

    updateState({ isLoading: true });

    try {
        // Removed the conditional logic that clears rcCode and rcName.
        // Double-click will now ONLY open the modal.
        updateState({
            selectedRowIndex: index,
            showRcModal: true,
        });
    } catch (error) {
        console.error("Error in handleDoubleClick_GL_RcCode:", error);
    } finally {
        updateState({ isLoading: false });
    }
};


const handleDoubleClick_GL_SlCode = async (index) => {
    // We no longer need to check currentSlCode here,
    // as double-click will always open the modal.
    // The UI's onDoubleClick prop already handles when it's allowed to trigger.

    updateState({ isLoading: true });

    try {
        // Removed the conditional logic that clears slCode and slName.
        // Double-click will now ONLY open the modal.
        updateState({
            selectedRowIndex: index,
            showSlModal: true,
        });
    } catch (error) {
        console.error("Error in handleDoubleClick_GL_SlCode:", error);
    } finally {
        updateState({ isLoading: false });
    }
};


  const handleAccountDoubleDtl1Click = (index) => {
    const updatedRows = [...detailRows];
    updatedRows[index] = {
      ...updatedRows[index],
      acctCode: "",
      acctName: ""
    };
    updateState({ detailRows: updatedRows });
  };

// Invoice Detail Event on Bill Code Double Click
const handleDoubleClick_Dtl_BillCode = (index) => {
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
    updateState({ detailRows: updatedRows });
    updateTotals(updatedRows);
  } else {
    updateState({ selectedRowIndex: index });
    updateState({ showBillCodeModal: true });
  }
};



// Invoice Detail Event on VAT Code Double Click
const handleDoubleClick_Dtl_VatCode = (index) => {
  const currentValue = detailRows[index]?.vatCode;
  const updatedRows = [...detailRows];
  
  if (currentValue) {
    updatedRows[index] = {
      ...updatedRows[index],
      vatCode: "",
      vatName: "",
      vatAcct:"",
    };
    updateState({ detailRows: updatedRows });
    updateTotals(updatedRows);
  } else {
    updateState({ selectedRowIndex: index });
    updateState({ showVATModal: true });
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

  // const handleCloseAccountModal = (selectedAccount) => {
  //   if (selectedAccount && selectedRowIndex !== null) {
  //     const updatedRows = [...detailRows];
  //     updatedRows[selectedRowIndex] = {
  //       ...updatedRows[selectedRowIndex],
  //       acctCode: selectedAccount.acctCode,
  //       acctName: selectedAccount.acctName,
  //     };
  //     updateState({ detailRows: updatedRows });
  //   }
  //   updateState({ 
  //     showAccountModal: false,
  //     selectedRowIndex: null 
  //   });
  // };

const handleCloseAccountModal = (selectedAccount) => {
    if (selectedAccount && selectedRowIndex !== null) {
        handleDetailChangeGL(selectedRowIndex, 'acctCode', selectedAccount);
    }
    updateState({
        showAccountModal: false,
        selectedRowIndex: null
    });
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

  const handleCloseRcModalGL = async (selectedRc) => {
    if (selectedRc && selectedRowIndex !== null) {
        try {
            // Fetch RC Name from /getRCMast API (assuming you need to fetch full details)
            const rcResponse = await fetchData("getRCMast", { RC_CODE: selectedRc.rcCode });
            if (rcResponse.success) {
                const rcData = JSON.parse(rcResponse.data[0].result);
                const rcName = rcData[0]?.rcName || '';

                handleDetailChangeGL(selectedRowIndex, 'rcCode', {
                    rcCode: selectedRc.rcCode,
                    rcName: rcName // Pass rcName along for direct update
                });

            } else {
                 console.warn("RC data fetch failed:", rcResponse);
                 handleDetailChangeGL(selectedRowIndex, 'rcCode', { rcCode: selectedRc.rcCode, rcName: '' });
            }
        } catch (error) {
            console.error("Error fetching RC data or updating GL row:", error);
            handleDetailChangeGL(selectedRowIndex, 'rcCode', { rcCode: selectedRc.rcCode, rcName: '' });
        }
    }
    updateState({
        showRcModal: false,
        selectedRowIndex: null
    });
};


  const handleCloseSlModalGL = async (selectedSl) => {
    if (selectedSl && selectedRowIndex !== null) {
        try {
            // Fetch RC Name from /getRCMast API (assuming you need to fetch full details)
            const slResponse = await fetchData("getSL", { SL_CODE: selectedSl.slCode });
            if (slResponse.success) {
                const slData = JSON.parse(slResponse.data[0].result);
                const slName = slData[0]?.slName || '';

                handleDetailChangeGL(selectedRowIndex, 'slCode', {
                    slCode: selectedSl.slCode,
                    slName: slName // Pass slName along for direct update
                });

            } else {
                 console.warn("SL data fetch failed:", slResponse);
                 handleDetailChangeGL(selectedRowIndex, 'slCode', { slCode: selectedSl.slCode, slName: '' });
            }
        } catch (error) {
            console.error("Error fetching SL data or updating GL row:", error);
            handleDetailChangeGL(selectedRowIndex, 'slCode', { slCode: selectedSl.slCode, slName: '' });
        }
    }
    updateState({
        showSlModal: false,
        selectedRowIndex: null
    });
};

  const handleDeleteRow = (index) => {
  const updatedRows = [...detailRows];
  updatedRows.splice(index, 1);
  // setDetailRows(updatedRows);
  updateState(updatedRows);
  updateTotals(updatedRows);
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

  updateState({ showBillCodeModal: false });
  updateState({ selectedRowIndex: null });

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
      console.error("Error updating VAT Code:", error);
    }
  }

  updateState({ showVatModal: false });
  updateState({ selectedRowIndex: null });

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
  updateState({ showAtcModal: false });
  updateState({ selectedRowIndex: null });
};

  const handleCloseBranchModal = (selectedBranch) => {
    if (selectedBranch) {
      updateState({
      branchCode: selectedBranch.branchCode,
      branchName:selectedBranch.branchName
      })
    }
    updateState({ branchModalOpen: false });
  };

  const handleCloseCurrencyModal = (selectedCurrency) => {
    if (selectedCurrency) {
      handleSelectCurrency(selectedCurrency.currCode)
    }
    updateState({ currencyModalOpen: false });
  };


const handleCloseBillTermModal = async (selectedBillTerm) => { 

    if (!selectedBillTerm) {
        updateState({ billtermModalOpen: false }); 
        return;
    }

    updateState({ billtermModalOpen: false, isLoading: true });

    try {
        const billTermDetails = {
            billtermCode: selectedBillTerm?.billtermCode || '',
            billtermName: selectedBillTerm?.billtermName || ''
        };

        updateState({
            billtermCode: billTermDetails.billtermCode,
            billtermName: billTermDetails.billtermName
        });

        if (!selectedBillTerm.billtermName || !selectedBillTerm.daysDue) { 
            const payload = { BILLTERM_CODE: selectedBillTerm.billtermCode };
            const response = await postRequest("getBillterm", JSON.stringify(payload));

            if (response.success) {
                const data = JSON.parse(response.data[0].result);

                billTermDetails.billtermName = data[0]?.billtermName || billTermDetails.billtermName;
                billTermDetails.daysDue = data[0]?.daysDue || billTermDetails.daysDue;

                updateState({
                    billtermName: billTermDetails.billtermName,
                    daysDue: billTermDetails.daysDue 
                });
            } else {
                console.warn("API call for getBillterm returned success: false", response.message);
            }
        }

    } catch (error) {
        console.error("Error fetching bill term details:", error);
    } finally {
        updateState({ isLoading: false });
    }
};



  return (

    <div className="global-tran-main-div-ui">

      {showSpinner && <LoadingSpinner />}

      <div className="global-tran-headerToolbar-ui">
      <Header 
  docType={docType} 
  pdfLink={pdfLink} 
  videoLink={videoLink}
  onPrint={handlePrint}
  printData={printData} 
  onReset={handleReset}
  onSave={() => handleActivityOption("Upsert")}
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
    </div>

    {/* SVI Header Form Section - Main Grid Container */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg relative" id="svi_hd">

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Nested grid for 3 columns */}

            {/* Column 1 */}
            <div className="global-tran-textbox-group-div-ui">
                {/* Branch Name Input with lookup button */}
                <div className="relative" onClick={() => updateState({ branchModalOpen: true })}>
                    <input
                        type="text"
                        id="branchName"
                        placeholder=" "
                        value={branchName}
                        readOnly
                        onFocus={(e) => e.target.blur()}
                        className="peer global-tran-textbox-ui cursor-pointer select-none"
                    />
                    <label htmlFor="branchName" className="global-tran-floating-label">
                        Branch
                    </label>
                    <button
                        type="button"
                        onClick={() => updateState({ branchModalOpen: true })}
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
                        value={state.documentNo}
                        onChange={(e) => updateState({ documentNo: e.target.value })}
                        onBlur={handleSviNoBlur}
                        placeholder=" "
                        className={`peer global-tran-textbox-ui ${state.isDocNoDisabled ? 'bg-blue-100 cursor-not-allowed' : ''}`}
                        disabled={state.isDocNoDisabled}
                    />
                    <label htmlFor="sviNo" className="global-tran-floating-label">
                        SVI No.
                    </label>
                    <button
                        className={`global-tran-textbox-button-search-padding-ui ${
                            (state.isFetchDisabled || state.isDocNoDisabled)
                            ? "global-tran-textbox-button-search-disabled-ui"
                            : "global-tran-textbox-button-search-enabled-ui"
                        } global-tran-textbox-button-search-ui`}
                        disabled={state.isFetchDisabled || state.isDocNoDisabled}
                        onClick={() => {
                            if (!state.isDocNoDisabled) {
                                fetchSviData(state.documentNo);
                            }
                        }}
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
                        onChange={(e) => setHeader((prev) => ({ ...prev, svi_date: e.target.value }))}
                    />
                    <label htmlFor="SVIDate" className="global-tran-floating-label">SVI Date</label>
                </div>

                {/* Customer Code */}
                <div className="relative">
                    <input type="text"
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
                        onClick={() => updateState({ custModalOpen: true })}
                        className={`global-tran-textbox-button-search-padding-ui ${
                            isFetchDisabled
                            ? "global-tran-textbox-button-search-disabled-ui"
                            : "global-tran-textbox-button-search-enabled-ui"
                        } global-tran-textbox-button-search-ui`}
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </button>
                </div>

                {/* Customer Name Display - Make this wider */}
                <div className="relative w-full md:w-6/6 lg:w-4/4"> {/* Added width classes here */}
                    <input type="text" id="custName" placeholder=" " value={custName} className="peer global-tran-textbox-ui"/>
                    <label htmlFor="custName"className="global-tran-floating-label">
                        <span className="global-tran-asterisk-ui"> * </span>Customer Name
                    </label>
                </div>
            </div>

            {/* Column 2 */}
            <div className="global-tran-textbox-group-div-ui">
                <div className="relative">
                    <select id="sviType"
                        className="peer global-tran-textbox-ui"
                        value={selectedSVIType}
                        onChange={(e) => setSelectedSVIType(e.target.value)}
                        disabled={sviTypes.length === 0}
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
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Billing Term */}
                <div className="relative">
                    <input type="hidden" id="billtermCode" placeholder="" readOnly value={billtermCode || ""}/>
                    <input type="text" id="billtermName" value={billtermName || ""} placeholder="" readOnly className="peer global-tran-textbox-ui"/>
                    <label htmlFor="billtermName" className="global-tran-floating-label">
                        <span className="global-tran-asterisk-ui"> * </span>Billing Term
                    </label>
                    <button onClick={() => updateState({ billtermModalOpen: true })}
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

                {/* NEW FLEX CONTAINER FOR CURRENCY AND CURRENCY RATE */}
                <div className="flex space-x-4"> {/* Added flex container with spacing */}

                    {/* Currency */}
                    <div className="relative flex-grow w-2/3"> {/* Used flex-grow to make it longer */}
                        <input type="text" id="currCode" placeholder=" " value={currencyName} readOnly className="peer global-tran-textbox-ui"/>
                        <label htmlFor="currCode" className="global-tran-floating-label">Currency</label>
                        <button onClick={openCurrencyModal}
                            className={`global-tran-textbox-button-search-padding-ui ${
                                isFetchDisabled
                                ? "global-tran-textbox-button-search-disabled-ui"
                                : "global-tran-textbox-button-search-enabled-ui"
                            } global-tran-textbox-button-search-ui`}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </div>

                    {/* Currency Rate */}
                    <div className="relative flex-grow"> {/* Used flex-grow to take remaining space (or you can use w-1/3) */}
                        <input type="text" id="currName" value={currencyRate} onChange={(e) => updateState({ currencyRate: e.target.value })}placeholder=" "className="peer global-tran-textbox-ui text-right"/>
                        <label htmlFor="currName" className="global-tran-floating-label"> Currency Rate
                        </label>
                    </div>
                </div>
            </div>

            {/* Column 3 */}
            <div className="global-tran-textbox-group-div-ui">
                <div className="relative">
                    <input type="text" id="refDocNo1"  value={refDocNo1} placeholder=" " onChange={(e) => updateState({ refDocNo1: e.target.value })} className="peer global-tran-textbox-ui"/>
                    <label htmlFor="refDocNo1" className="global-tran-floating-label">Ref Doc No. 1</label>
                </div>

                <div className="relative">
                    <input type="text" id="refDocNo2" value={refDocNo2} placeholder=" " onChange={(e) => updateState({ refDocNo2: e.target.value })}  className="peer global-tran-textbox-ui"/>
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
            </div>

            {/* Remarks Section - Now inside the 3-column container, spanning all 3 */}
            <div className="col-span-full">
                <div className="relative p-2"> 
                    <textarea
                        id="remarks"
                        placeholder=""
                        rows={4}
                        className="peer global-tran-textbox-remarks-ui pt-2"
                        value={remarks}
                        onChange={(e) => updateState({ remarks: e.target.value })}
                    />
                    <label
                        htmlFor="remarks"
                        className="global-tran-floating-label-remarks"
                    >
                        Remarks
                    </label>
                </div>
            </div>

        </div> {/* End of the 3-column container */}

        {/* Column 4 - Totals (remains unchanged, but its parent is now the main 4-column grid) */}
        <div className="global-tran-textbox-group-div-ui">
            <div className="relative">
                <input type="text" id="totalGrossAmount" value={totals.totalGrossAmount} placeholder=" " className="peer global-tran-textbox-ui text-right"/>
                <label htmlFor="totalGrossAmount" className="global-tran-floating-label">Gross Amount</label>
            </div>

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

    </div>
</div>
      
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
          // onClick={() => setGLActiveTab('invoice')}
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
                className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                value={row.billCode || ""}
                readOnly
                onDoubleClick={() => handleDoubleClick_Dtl_BillCode(index)}
              />
              <FontAwesomeIcon 
                icon={faMagnifyingGlass} 
                className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                onClick={() => {
                  updateState({ selectedRowIndex: index });
                  updateState({ showBillCodeModal: true }); 
              
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


          

            <td className="global-tran-td-ui">
                <input
                    type="text"
                    className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                    value={row.quantity || ""}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
                        if (/^\d*\.?\d{0,2}$/.test(sanitizedValue) || sanitizedValue === "") {
                            handleDetailChange(index, "quantity", sanitizedValue, false);
                        }
                    }}
                    onFocus={() => {
                        const currentQuantity = row.quantity;
                        if (currentQuantity !== undefined && currentQuantity !== null) {
                            const parsedNum = parseFormattedNumber(currentQuantity);
                        }
                        setFocusedCell({ index: index, field: "quantity" });
                    }}
                    onBlur={async (e) => {
                        const value = e.target.value;
                        const num = parseFormattedNumber(value);
                        if (!isNaN(num)) {
                            await handleDetailChange(index, "quantity", num, true);
                        }
                        setFocusedCell(null);
                    }}
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.target.value;
                            const num = parseFormattedNumber(value);
                            if (!isNaN(num)) {
                                await handleDetailChange(index, "quantity", num, true);
                            }
                            e.target.blur();
                        }
                    }}
                />
            </td>


            {/* UOM */}
           <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] text-center global-tran-td-inputclass-ui"
                value={row.uomCode || ""}
                onChange={(e) => handleDetailChange(index, 'uomCode', e.target.value)}
              />
            </td>

            <td className="global-tran-td-ui">
                <input
                    type="text"
                    className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                    value={row.unitPrice || ""}
                    onChange={(e) => {
                        const inputValue = e.target.value;
                        const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
                        if (/^\d*\.?\d{0,2}$/.test(sanitizedValue) || sanitizedValue === "") {
                            handleDetailChange(index, "unitPrice", sanitizedValue, false);
                        }
                    }}
                    onFocus={() => {
                        const currentUnitPrice = row.unitPrice;
                        if (currentUnitPrice !== undefined && currentUnitPrice !== null) {
                            const parsedNum = parseFormattedNumber(currentUnitPrice);
                        }
                        setFocusedCell({ index: index, field: "unitPrice" });
                    }}
                    onBlur={async (e) => {
                        const value = e.target.value;
                        const num = parseFormattedNumber(value);
                        if (!isNaN(num)) {
                            await handleDetailChange(index, "unitPrice", num, true);
                        }
                        setFocusedCell(null);
                    }}
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.target.value;
                            const num = parseFormattedNumber(value);
                            if (!isNaN(num)) {
                                await handleDetailChange(index, "unitPrice", num, true);
                            }
                            e.target.blur();
                        }
                    }}
                />
            </td>


            <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0 cursor-pointer"
                value={formatNumber(parseFormattedNumber(row.grossAmount)) || formatNumber(parseFormattedNumber(row.grossAmount)) || ""}
                readOnly
              />
            </td>


            <td className="global-tran-td-ui">
            <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={
                    focusedCell && focusedCell.index === index && focusedCell.field === "discRate"
                        ? (row.discRate !== undefined && row.discRate !== null ? String(row.discRate) : "")
                        : (row.discRate !== undefined && row.discRate !== null ? formatNumber(parseFormattedNumber(row.discRate)) : "")
                }
                onChange={(e) => {
                    const inputValue = e.target.value;
                    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
                    if (/^\d*\.?\d{0,2}$/.test(sanitizedValue) || sanitizedValue === "") {
                        handleDetailChange(index, "discRate", sanitizedValue, false);
                    }
                }}
                onFocus={() => {
                    setFocusedCell({ index: index, field: "discRate" });
                }}
                onBlur={async (e) => {
                    const value = e.target.value;
                    const num = parseFormattedNumber(value); 
                    if (!isNaN(num)) {
                        await handleDetailChange(index, "discRate", num, true); 
                    }
                    setFocusedCell(null);
                }}
                onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        const value = e.target.value;
                        const num = parseFormattedNumber(value); 
                        if (!isNaN(num)) {
                            await handleDetailChange(index, "discRate", num, true); 
                        }
                        e.target.blur();
                    }
                }}
            />
            </td>    

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
                value={formatNumber(parseFormattedNumber(row.netDisc)) || formatNumber(parseFormattedNumber(row.netDisc)) || ""}
                readOnly
              />
            </td>



             <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.vatCode || ""}
                  readOnly
                  onDoubleClick={() => handleDoubleClick_Dtl_VatCode(index)}
                />
            
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                  onClick={() => {
                    updateState({ selectedRowIndex: index });
                    updateState({ showVATModal: true }); 
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
                value={formatNumber(parseFormattedNumber(row.vatAmount)) || formatNumber(parseFormattedNumber(row.vatAmount)) || ""}
                readOnly
              />
            </td>

            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.atcCode || ""}
                  readOnly
                  onDoubleClick={() => handleAtcDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                  onClick={() => {
                    updateState({ selectedRowIndex: index });
                    updateState({ ShowAtcModal: true }); 
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
                    value={formatNumber(parseFormattedNumber(row.atcAmount)) || formatNumber(parseFormattedNumber(row.atcAmount)) || ""}
                   onChange={(e) => handleDetailChange(index, 'ewtAmount', e.target.value)}
                />
            </td>


             <td className="global-tran-td-ui">
              <input
                type="text"
                className="w-[100px] h-7 text-xs bg-transparent text-right focus:outline-none focus:ring-0"
                value={formatNumber(parseFormattedNumber(row.sviAmount)) || formatNumber(parseFormattedNumber(row.sviAmount)) || ""}
                readOnly
              />
            </td>


            <td className="global-tran-td-ui relative">
              <div className="flex items-center">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.salesAcct || ""}

                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.arAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.vatAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.discAcct || ""}
                  readOnly
                  onDoubleClick={() => handleAccountDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
                  className="w-[100px] global-tran-td-inputclass-ui text-center pr-6 cursor-pointer"
                  value={row.rcCode || ""}
                  readOnly
                  onDoubleClick={() => handleRcDoubleDtl1Click(index)}
                />
                <FontAwesomeIcon 
                  icon={faMagnifyingGlass} 
                  className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
      {totals.totalNetAmount}
    </label>
  </div>

  {/* Total VAT Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total VAT Amount:
    </label>
    <label id="totVATAmount" className="global-tran-tab-footer-total-value-ui">
      {totals.totalVatAmount}
    </label>
  </div>

  {/* Total ATC Amount */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total ATC Amount:
    </label>
    <label id="totATCAmount" className="global-tran-tab-footer-total-value-ui">
      {totals.totalAtcAmount}
    </label>
  </div>

  {/* Total Payable Amount (Invoice + VAT - ATC) */}
  <div className="global-tran-tab-footer-total-div-ui">
    <label className="global-tran-tab-footer-total-label-ui">
      Total Amount Due:
    </label>
    <label id="totAmountDue" className="global-tran-tab-footer-total-value-ui">
      {totals.totalAmountDue}
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
          onClick={() => handleActivityOption("GenerateGL")}
          className="global-tran-button-generateGL"
          disabled={isLoading} // Optionally disable button while loading
        >
          {isLoading ? 'Generating...' : 'Generate GL Entries'}
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
            <th className="global-tran-th-ui w-[2000px]">Particulars</th>
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
                <div className="relative w-fit">
                  <input
                    type="text"
                    className="w-[100px] pr-6 global-tran-td-inputclass-ui cursor-pointer"
                    value={row.acctCode || ""}
                    onDoubleClick={() => handleDoubleClick_GL_AcctCode(index)}
                    onChange={(e) => handleDetailChangeGL(index, 'acctCode', e.target.value)}      
      
                  />
                  <FontAwesomeIcon 
                    icon={faMagnifyingGlass} 
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                    onClick={() => {
                        updateState({
                            selectedRowIndex: index,
                            showAccountModal: true,
                            accountModalSource: "acctCode" 
                        });
                    }}
                  />
                </div>
              </td>

              <td className="global-tran-td-ui">
                <div className="relative w-fit">
                    <input
                        type="text"
                        className="w-[100px] pr-6 global-tran-td-inputclass-ui cursor-pointer"
                        value={row.rcCode || ""}
                        onDoubleClick={() => {
                            // Allow double click if RC is required OR an RC code is already selected
                            if (row.rcCode === "REQ RC" || row.rcCode !== "") {
                                handleDoubleClick_GL_RcCode(index);
                            }
                        }}
                        onChange={(e) => handleDetailChangeGL(index, 'rcCode', e.target.value)}
                        readOnly
                    />
                    {(row.rcCode === "REQ RC" || (row.rcCode && row.rcCode !== "REQ RC")) && ( // <-- Updated condition
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute top-1/2 right-2 -translate-y-1/2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                            onClick={() => {
                                // Allow click if RC is required OR an RC code is already selected
                                if (row.rcCode === "REQ RC" || (row.rcCode && row.rcCode !== "REQ RC")) { // <-- Updated condition
                                    console.log("Magnifying glass clicked for index:", index);
                                    updateState({
                                        selectedRowIndex: index,
                                        showRcModal: true,
                                    });
                                    console.log("State after click:", state);
                                }
                            }}
                        />
                    )}
                </div>
            </td>

          <td className="global-tran-td-ui">
                <input
                  type="text"
                  className="w-[100px] global-tran-td-inputclass-ui"
                  value={row.sltypeCode || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'sltypeCode', e.target.value)}
                />
              </td>

            

              <td className="global-tran-td-ui">
                  <div className="relative w-fit">
                      <input
                          type="text"
                          className="w-[100px] pr-6 global-tran-td-inputclass-ui cursor-pointer"
                          value={row.slCode || ""}
                          onDoubleClick={() => {
                              // Allow double click if SL is required OR an SL code is already selected
                              if (row.slCode === "REQ SL" || row.slCode) { // Updated condition
                                  handleDoubleClick_GL_SlCode(index);
                              }
                          }}
                          onChange={(e) => handleDetailChangeGL(index, 'slCode', e.target.value)}
                          readOnly
                      />
                      {/* Conditional rendering for the FontAwesomeIcon */}
                      {/* The icon should be visible if SL is "REQ SL" OR if an actual SL code is present */}
                      {(row.slCode === "REQ SL" || row.slCode) && ( // Updated condition
                          <FontAwesomeIcon
                              icon={faMagnifyingGlass}
                              className="absolute top-1/2 right-2 -translate-y-1/2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
                              onClick={() => {
                                  // Allow click if SL is required OR an SL code is already selected
                                  if (row.slCode === "REQ SL" || row.slCode) { // Updated condition
                                      updateState({
                                          selectedRowIndex: index,
                                          showSlModal: true,
                                      });
                                  }
                              }}
                          />
                      )}
                  </div>
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
      className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900"
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
      className="absolute right-2 text-blue-600 text-lg cursor-pointer hover:text-blue-900 hover:text-blue-900"
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
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.debit || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'debit', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'debit', e.target.value)}
                />
            </td>

              <td className="global-tran-td-ui text-right">
                <input
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.credit || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'credit', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'credit', e.target.value)} // <-- Add onBlur handler
                />
              </td>

               <td className="global-tran-td-ui text-right">
                <input
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.debitFx1 || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'debitFx1', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'debitFx1', e.target.value)} // <-- Add onBlur handler
                />
              </td>
              <td className="global-tran-td-ui text-right">
                <input
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.creditFx1 || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'creditFx1', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'creditFx1', e.target.value)} // <-- Add onBlur handler
                />
              </td>

               <td className="global-tran-td-ui text-right">
                <input
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.debitFx2 || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'debitFx2', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'debitFx2', e.target.value)} // <-- Add onBlur handler
                />
              </td>
              <td className="global-tran-td-ui text-right">
                <input
                  type="text"
                  className="w-[120px] global-tran-td-inputclass-ui text-right"
                  value={row.creditFx2 || ""}
                  onChange={(e) => handleDetailChangeGL(index, 'creditFx2', e.target.value)}
                  onBlur={(e) => handleBlurGL(index, 'creditFx2', e.target.value)} // <-- Add onBlur handler
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
  {totalDebit}
</label>
      </div>

      {/* Total Credit */}
      <div className="global-tran-tab-footer-total-div-ui">
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-label-ui">
          Total Credit:
        </label>
        <label htmlFor="TotalCredit" className="global-tran-tab-footer-total-value-ui">
  {totalCredit}
</label>
      </div>
    </div>

    </div>



</div>

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

{billtermModalOpen && (
  <BillTermLookupModal 
      isOpen={billtermModalOpen}
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
{/* {showAccountModal && (
  <COAMastLookupModal
    isOpen={showAccountModal}
    onClose={handleCloseAccountModal}
    source={accountModalSource}
    customParam={customParam}     
  />
)} */}

{/* COA Account Modal */}
      {showAccountModal && (
        <COAMastLookupModal
          isOpen={showAccountModal}
          onClose={handleCloseAccountModal}
          customParam="svi_dt2"
        />
      )}


{/* RC Code Modal */}
{showRcModal && (
  <RCLookupModal 
    isOpen={showRcModal}
    onClose={handleCloseRcModalGL}
    customParam="apv_hd"
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
{console.log("showSlModal value:", showSlModal)}
{showSlModal && (
  <SLMastLookupModal
    isOpen={showSlModal}
    onClose={handleCloseSlModalGL}
    customParam="ActiveAll" //should be active_all
  />
)}



{showSpinner && <LoadingSpinner />}

    </div>
  );
};

export default SVI;
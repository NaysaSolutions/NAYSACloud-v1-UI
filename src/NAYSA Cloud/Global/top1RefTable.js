import { fetchData, postRequest,printRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import { formatNumber } from '@/NAYSA Cloud/Global/behavior';
import { parseFormattedNumber } from '@/NAYSA Cloud/Global/behavior';
import Swal from 'sweetalert2';


// Company
// ATC


export async function useTopCompanyRow() {
  try {
    const response = await fetchData("getCompany");
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Company row:", error);
    return null;
  }
}






export async function useTopHSOption() {
  try {
    const response = await fetchData("getHSOption");
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching HS Option row:", error);
    return null;
  }
}




export async function useTopDocControlRow(docId) {
  if (!docId) return null;

  try {
    const response = await fetchData("getHSDoc", { DOC_ID: docId });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Document Control row:", error);
    return null;
  }
}



export async function useTopDocDropDown(documentCode, documentCol) {
  if (!documentCode || !documentCol) {
    console.warn("Document code or column not provided");
    return [];
  }

  const payload = {
    json_data: {
      dropdownColumn: documentCol,
      docCode: documentCode
    }
  };

  try {
    const response = await postRequest("getHSDropdown", JSON.stringify(payload));
    
    // Validate response structure
    if (!response || !response.success || !response.data || !Array.isArray(response.data)) {
      console.warn("Invalid API response structure", response);
      return [];
    }

    // Safely parse the result
    let parsedData;
    try {
      parsedData = JSON.parse(response.data[0]?.result || "[]");
    } catch (parseError) {
      console.error("Error parsing response data:", parseError);
      return [];
    }

    // Ensure we always return an array
    return Array.isArray(parsedData) ? parsedData : [];

  } catch (error) {
    console.error("Error fetching Document Dropdown:", error);
    return [];
  }
}




export async function useTopVatRow(vatCode) {
  if (!vatCode) return null;

  try {
    const response = await fetchData("getVat", { VAT_CODE: vatCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching VAT row:", error);
    return null;
  }
}



export async function useTopVatAmount(vatCode, grossAmt) {
  if (!vatCode || grossAmt === 0) return 0;

  try {
    const response = await fetchData("getVat", { VAT_CODE: vatCode });
    if (!response.success) return 0;

    const [result] = JSON.parse(response.data[0].result);
    if (!result) return 0;

    const { vatRate } = result;
    return +((grossAmt * vatRate * 0.01) / (1 + vatRate * 0.01)).toFixed(2);
  } catch (error) {
    console.error("Error fetching VAT Amount:", error);
    return 0;
  }
}



export async function useTopATCRow(atcCode) {
  if (!atcCode) return null;

  try {
    const response = await fetchData("getATC", { ATC_CODE: atcCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching ATC row:", error);
    return null;
  }
}

export async function useTopATCAmount(atcCode, netAmount) {
  if (!atcCode || netAmount === 0) return 0;

  try {
    const res = await fetchData("getATC", { ATC_CODE: atcCode });
    if (!res.success) return 0;

    const [row] = JSON.parse(res.data[0].result);
    if (!row) return 0;

    return +(netAmount * row.atcRate * 0.01).toFixed(2);
  } catch (e) {
    console.error("Error fetching ATC Amount:", e);
    return 0;
  }
}

export async function useTopBillCodeRow(billCode) {
  if (!billCode) return null;

  try {
    const response = await fetchData("getBillcode", { BILL_CODE: billCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Bill Code row:", error);
    return null;
  }
}


export async function useTopRCRow(rcCode) {
  if (!rcCode) return null;

  try {
    const response = await fetchData("getRCMast", { RC_CODE: rcCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching RC row:", error);
    return null;
  }
}




export async function useTopSLRow(slCode) {
  if (!slCode) return null;

  try {
    const response = await fetchData("getSL", { SL_CODE: slCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching SL row:", error);
    return null;
  }
}


export async function useTopAccountRow(acctCode) {
  if (!acctCode) return null;

  try {
    const response = await fetchData("getCOA", { ACCT_CODE: acctCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Account row:", error);
    return null;
  }
}



export async function useTopCurrentRow(currCode) {
  if (!currCode) return null;

  try {
    const response = await fetchData("getCurr", { CURR_CODE: currCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Currency row:", error);
    return null;
  }
}






export const useGenerateGLEntries = async (docCode, glData) => {
  const payload = { json_data: glData };

  console.log("Payload for GL generation:", JSON.stringify(payload, null, 2));

  try {
    const response = await postRequest("generateGL" + docCode, JSON.stringify(payload));
    console.log("Raw response from generateGL API:", response);

    if (response?.status === 'success' && Array.isArray(response.data) && response.data.length > 0) {
      let glEntries;

      try {
        if (response.data[0] && response.data[0].result) {
          glEntries = JSON.parse(response.data[0].result);
          if (!Array.isArray(glEntries)) {
            glEntries = [glEntries];
          }
        } else {
          glEntries = [];
          console.warn("API response data[0].result was null or undefined for GL entries.");
        }
      } catch (parseError) {
        console.error("Error parsing GL entries:", parseError);
        throw new Error("Failed to parse GL entries due to malformed JSON.");
      }

      const transformedEntries = glEntries
        .filter(entry => entry !== null && typeof entry === 'object')
        .map((entry, idx) => ({
          id: idx + 1,
          acctCode: entry.acctCode || "",
          rcCode: entry.rcCode || "",
          sltypeCode: entry.sltypeCode || "",
          slCode: entry.slCode || "",
          particular: entry.particular || "",
          vatCode: entry.vatCode || "",
          vatName: entry.vatName || "",
          atcCode: entry.atcCode || "",
          atcName: entry.atcName || "",
          debit: entry.debit ? formatNumber(entry.debit) : "0.00",
          credit: entry.credit ? formatNumber(entry.credit) : "0.00",
          debitFx1: entry.debit ? formatNumber(entry.debitFx1) : "0.00",
          creditFx1: entry.credit ? formatNumber(entry.creditFx1) : "0.00",
          debitFx2: entry.debit ? formatNumber(entry.debitFx2) : "0.00",
          creditFx2: entry.credit ? formatNumber(entry.creditFx2) : "0.00",
          slRefNo: entry.slrefNo || "",
          slrefDate: entry.slrefDate || "",
          remarks: entry.remarks || "",
          dt1Lineno: entry.dt1Lineno || ""
        }));

      return transformedEntries;
    } else {
      let errorMessage = response?.message || "Failed to generate GL entries. Unexpected API response format.";
      if (response?.status === 'success' && (!Array.isArray(response.data) || response.data.length === 0)) {
         errorMessage = "API returned success but no data for GL entries.";
      }
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error("Error in generateGLEntries:", error);
    swal.fire({
      icon: 'error',
      title: 'Generation Failed',
      text: error.message || 'Unknown error occurred',
      confirmButtonColor: '#3085d6',
    });
    return null;
  }
};





// Add idKey and noKey as parameters
export const useTransactionUpsert = async (docCode, glData, updateState, idKey, noKey) => {
    try {
        updateState({ isLoading: true });

        const payload = { json_data: glData };

        console.log("Sending data to API for Upsert:", JSON.stringify(payload, null, 2));

        const response = await postRequest("upsert" + docCode, JSON.stringify(payload));

        if (response?.status === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: docCode + ' saved successfully!',
            });

            if (response.data && response.data.length > 0) {
                const returnedId = response.data[0][idKey];
                const returnedNo = response.data[0][noKey];

                const wasNewDocCreated = !glData[idKey] && !!returnedId;

                if (returnedNo && returnedId) {
                    const updates = {
                        documentID: returnedId,
                        documentNo: returnedNo,
                        isDocNoDisabled: wasNewDocCreated
                    };

                    updateState(updates);
                    console.log(`Updated ${idKey}: ${returnedId}, ${noKey}: ${returnedNo} in state.`);
                } else {
                    console.warn(`Upsert successful, but returned ${idKey} or ${noKey} was null/undefined.`);
                }
            } else {
                console.warn("Upsert successful, but no document ID/No returned from SPROC data.");
            }
            return response;
        } else {
            throw new Error(response?.message || 'Failed to save Transaction');
        }
    } catch (error) {
        console.error("Error saving Transaction:", error);
        Swal.fire({
            icon: 'error',
            title: 'Save Failed',
            text: error.message || 'An error occurred while saving the Transaction',
        });
        return null;
    } finally {
        updateState({
            isSaveDisabled: false,
            isResetDisabled: false,
            isLoading: false
        });
    }
};






// global update of GL Entries per record
export const useUpdateRowGLEntries = async (row, field, value, custVendCode,docCode) => {
  const payload = {
    json_data: {
      acctCode: field === "acctCode" ? value.acctCode : row.acctCode,
      slCode: field === "slCode" ? value.slCode : row.slCode,
      rcCode: field === "rcCode" ? value.rcCode : row.rcCode,
      sltypeCode: field === "slCode" ? value.sltypeCode : row.sltypeCode, 
      vatCode: field === "vatCode" ? value.vatCode : row.vatCode, 
      vatName: row.vatName,
      atcCode: field === "atcCode" ? value.atcCode : row.atcCode,  
      atcName: row.atcName,
      atcName: row.atcName,
      custVendCode:custVendCode,
      docCode: docCode
    }
  };


  try {
    const response = await postRequest("lookupGL", JSON.stringify(payload));

    // ✅ Match actual API format
    if (!response || response.status !== "success" || !Array.isArray(response.data)) {
      console.warn("Invalid API response structure", response);
      return [];
    }



    // ✅ Parse the JSON string inside result
    let parsedData;
    try {
      parsedData = JSON.parse(response.data[0]?.result || "[]");
    } catch (parseError) {
      console.error("Error parsing response data:", parseError);
      return [];
    }

    // ✅ Always return array (even if backend sends a single object)
     return Array.isArray(parsedData) && parsedData.length > 0
      ? parsedData[0]
      : null;

  } catch (error) {
    console.error("Error fetching LookupGL:", error);
    return [];
  }
};




//global curreny update
export const useTopForexRate = async (currencyCode, documentDate) => {
    if (!currencyCode) return '1.000000'
  
    try {
      const currResponse = await fetchData("getCurr", { CURR_CODE: currencyCode });
  
      if (currResponse.success) {
        const currData = JSON.parse(currResponse.data[0].result);
       
        if (currencyCode.toUpperCase() !== 'PHP') {
          const forexPayload = {
            json_data: {
              docDate: documentDate,
              currCode: currencyCode,
            },
          };
          try {
            const forexResponse = await postRequest("getDForex", JSON.stringify(forexPayload));
  
            if (forexResponse.success) {
              const rawResult = forexResponse.data[0].result;
              if (rawResult) {
                const forexData = JSON.parse(rawResult);
               return forexData.currRate ? parseFloat(forexData.currRate).toFixed(6) : '1.000000';
              }
            }
          } catch (forexError) {
            console.error("Forex API error:", forexError);
            return '1.000000'
          }
        }
        
      }
    } catch (currError) {
      console.error("Currency API error:", currError);
      return '1.000000'
    }
};







export async function useHandlePrint(documentID,docCode) {
  try {
    const printWindow = window.open("", "_blank");

    const payload = { tran_id: documentID };

    const apiUrl = 'http://127.0.0.1:8000/api/print'+docCode;


    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/pdf'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate report: ${errorText}`);
    }

    const blob = await response.blob();
    if (blob.type !== "application/pdf") {
      const text = await blob.text();
      throw new Error(`Expected PDF but got: ${text}`);
    }

    const fileURL = URL.createObjectURL(blob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("Error printing report:", error);
  }
}
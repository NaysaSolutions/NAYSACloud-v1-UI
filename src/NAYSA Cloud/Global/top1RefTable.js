import { fetchData, postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
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





export async function useTopBillTermRow(billtermCode) {
  if (!billtermCode) return null;

  try {
    const response = await fetchData("getBillterm", { BILLTERM_CODE: billtermCode });
    if (response.success) {
      const responseData = JSON.parse(response.data[0].result);
      return responseData.length > 0 ? responseData[0] : null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Bill Term row:", error);
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



export async function useTopCurrencyRow(currCode) {
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




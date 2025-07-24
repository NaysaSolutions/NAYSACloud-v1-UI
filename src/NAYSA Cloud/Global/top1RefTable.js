// import {fetchData , postRequest} from 'C:/NSIApps/phpProgramming/NAYSACloud-v1-UI/src/NAYSA Cloud/Configuration/BaseURL.jsx'
import { fetchData, postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';



export async function getTopVatRow(vatCode) {
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



export async function getTopVatAmount(vatCode, grossAmt) {
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






export async function getTopATCRow(atcCode) {
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


export async function getTopATCAmount(atcCode, netAmount) {
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







export async function getTopBillCodeRow(billCode) {
  if (!billCode) return null;

  try {
    const response = await fetchData("getBillcode", { BILL_CODE: billCode });
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

import { fetchData, postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import { useTopDocControlRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { formatNumber } from '@/NAYSA Cloud/Global/behavior';
import { parseFormattedNumber } from '@/NAYSA Cloud/Global/behavior';
import Swal from 'sweetalert2';






export const useGenerateGLEntries = async (docCode, glData) => {
  const payload = { json_data: glData };

  // console.log("Payload for GL generation:", JSON.stringify(payload, null, 2));

  try {
    const response = await postRequest("generateGL" + docCode, JSON.stringify(payload));
    // console.log("Raw response from generateGL API:", response);

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

        // console.log("Sending data to API for Upsert:", JSON.stringify(payload, null, 2));

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






export async function useHandlePrint(documentID, docCode) {
  try {
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked — please allow popups for this site.");
    }

 // Inject a basic spinner into the new tab
printWindow.document.write(`
                    <html>
                        <head>
                        <title>Preparing Document...</title>
                        <style>
                            body {
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            font-family: 'Segoe UI', Tahoma, sans-serif;
                            background: linear-gradient(135deg, #eef2f3, #d9e2ec);
                            color: #333;
                            }
                            .spinner {
                            width: 64px;
                            height: 64px;
                            border-radius: 50%;
                            border: 6px solid transparent;
                            border-top: 6px solid #4a90e2;
                            border-left: 6px solid #6fb1fc;
                            background: linear-gradient(145deg, #ffffff, #cfd9df);
                            box-shadow:
                                inset 2px 2px 4px rgba(0,0,0,0.15),
                                inset -2px -2px 4px rgba(255,255,255,0.6),
                                0 0 12px rgba(74,144,226,0.4);
                            animation: spin 1s linear infinite;
                            margin-bottom: 18px;
                            }
                            .caption {
                            font-size: 1rem;
                            font-weight: 500;
                            opacity: 0.85;
                            letter-spacing: 0.4px;
                            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
                            }
                            @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                            }
                        </style>
                        </head>
                        <body>
                        <div class="spinner"></div>
                        <div class="caption">Preparing document...</div>
                        </body>
                    </html>
                    `);

    const responseDocControl = await useTopDocControlRow(docCode);
    const formName = responseDocControl.formName;

    if (!formName) {
      throw new Error("Report Name not defined");
    }

    const payload = { tranId: documentID, formName };
    const apiUrl = "http://127.0.0.1:8000/api/printForm";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
      body: JSON.stringify(payload),
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




export async function useHandleCancel(docCode, documentID, userCode, reason, updateState) {
  const payload = {
    json_data: {
      docCode,
      documentID,
      userCode,
      reason,
    },
  };

  updateState({ isLoading: true });

  try {
    const response = await postRequest("cancel" + docCode, JSON.stringify(payload));

      if (response?.status === "success") {
        return { success: true, message: `${docCode} cancelled successfully!`, data: response };
      } else {
        return { success: false, message: response?.message || "Failed to cancel transaction" };
      }

  } catch (error) {
    console.error("Error cancelling transaction:", error);
    Swal.fire({
      icon: "error",
      title: "Cancel Failed",
      text: error.message || "An error occurred while cancelling the transaction",
    });
  } finally {
    updateState({
      isSaveDisabled: false,
      isResetDisabled: false,
      isLoading: false,
    });
  }
}
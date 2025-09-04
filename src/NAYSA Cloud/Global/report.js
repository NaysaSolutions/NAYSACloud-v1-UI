import { apiClient ,postPdfRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import { useTopDocControlRow,useTopHSRptRow } from '@/NAYSA Cloud/Global/top1RefTable';





export function injectLoadingSpinner(printWindow) {
  if (!printWindow || !printWindow.document) return;

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
}





export async function useHandlePrint(documentID, docCode) {
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked — please allow popups for this site.");
    }

    injectLoadingSpinner(printWindow);
  
    const responseDocControl = await useTopDocControlRow(docCode);
    const formName = responseDocControl?.formName;

    if (!formName) {
      throw new Error("Report Name not defined");
    }

    const payload = { tranId: documentID, formName };
    const pdfBlob = await postPdfRequest("/printForm", payload);

    if (!(pdfBlob instanceof Blob) || pdfBlob.type !== "application/pdf") {
      throw new Error("Expected a PDF file but received something else.");
    }

    const fileURL = URL.createObjectURL(pdfBlob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("Error printing report:", error);
  }
}






export async function useHandlePrintARReport(params) {
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked — please allow popups for this site.");
    }

    injectLoadingSpinner(printWindow);

  
    const responseDocRpt = await useTopHSRptRow(params.reportId);
    const formName = responseDocRpt?.reportName;
    if (!formName) {
      throw new Error("Report Name not defined");
    }

    const payload = { 
              branchCode: params.branchCode,
              startDate: params.startDate,
              endDate: params.endDate,
              sCustCode: params.sCustCode,
              eCustCode: params.eCustCode,
              formName: formName,
              sprocMode:"",
              sprocName : "",
              export :"" };

    const pdfBlob = await postPdfRequest("/printARReport", payload);

    if (!(pdfBlob instanceof Blob) || pdfBlob.type !== "application/pdf") {
      throw new Error("Expected a PDF file but received something else.");
    }

    const fileURL = URL.createObjectURL(pdfBlob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("Error printing report:", error);
  }
}



export async function useHandleDownloadExcelARReport(params) {
 
   try {
    const responseDocRpt = await useTopHSRptRow(params.reportId);

    const payload = {
      branchCode: params.branchCode,
      startDate: params.startDate,
      endDate: params.endDate,
      sCustCode: params.sCustCode,
      eCustCode: params.eCustCode,
      formName: responseDocRpt.crptName,
      sprocMode: responseDocRpt.sprocMode,
      sprocName: responseDocRpt.sprocName,
      export: responseDocRpt.export,
      reportName: responseDocRpt.reportName,
      userCode:params.userCode
    };


    // ⬇️ override only for this request
    const response = await apiClient.post("/printARReport", payload, {
      responseType: "blob",
    });

    if (!response || !response.data) {
      return false; // ❌ return failure if no data
    }

    
    // Extract filename from headers if available
    let filename =  responseDocRpt.reportName + ".xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    }

    // Create blob and trigger download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return true;
  } catch (error) {
    console.error("Error downloading report:", error);
  }
}


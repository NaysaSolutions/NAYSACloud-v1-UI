import { apiClient ,postPdfRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import { useTopDocControlRow,useTopHSRptRow } from '@/NAYSA Cloud/Global/top1RefTable';
import { formatNumber } from "@/NAYSA Cloud/Global/behavior";
import { stringify } from 'postcss';



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





export async function useHandlePrint(documentID, docCode, printMode, userCode) {
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

    const payload = { tranId: documentID, formName, docCode, printMode ,userCode};
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
              reportName: formName,
              sprocMode:"",
              sprocName : "",
              export :"" };

        console.log(JSON.stringify(payload))

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


    console.log(JSON.stringify(payload))

    // ⬇️ override only for this request
    const response = await apiClient.post("/printARReport", payload, {
      responseType: "blob",
    });

    if (!response || !response.data) {
      return false; // no data received
    }

    // Determine filename from headers or fallback
    let filename = responseDocRpt.reportName + ".xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    }

    // Create a blob and trigger download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup URL object
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    return true;
  } catch (error) {
    console.error("Error downloading report:", error);
    return false;
  }
}








export async function useHandlePrintAPReport(params) {
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
              sPayee: params.sVendCode,
              ePayee: params.eVendCode,
              reportName: formName,
              sprocMode:"",
              sprocName : "",
              export :"" };

        console.log(JSON.stringify(payload))

    const pdfBlob = await postPdfRequest("/printAPReport", payload);

    if (!(pdfBlob instanceof Blob) || pdfBlob.type !== "application/pdf") {
      throw new Error("Expected a PDF file but received something else.");
    }

    const fileURL = URL.createObjectURL(pdfBlob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("Error printing report:", error);
  }
}





export async function useHandleDownloadExcelAPReport(params) {
 
   try {
    const responseDocRpt = await useTopHSRptRow(params.reportId);

    const payload = {
      branchCode: params.branchCode,
      startDate: params.startDate,
      endDate: params.endDate,
      sPayee: params.sVendCode,
      ePayee: params.eVendCode,
      formName: responseDocRpt.crptName,
      sprocMode: responseDocRpt.sprocMode,
      sprocName: responseDocRpt.sprocName,
      export: responseDocRpt.export,
      reportName: responseDocRpt.reportName,
      userCode:params.userCode
    };


    console.log(JSON.stringify(payload))

    // ⬇️ override only for this request
    const response = await apiClient.post("/printAPReport", payload, {
      responseType: "blob",
    });

    if (!response || !response.data) {
      return false; // no data received
    }

    // Determine filename from headers or fallback
    let filename = responseDocRpt.reportName + ".xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    }

    // Create a blob and trigger download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup URL object
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    return true;
  } catch (error) {
    console.error("Error downloading report:", error);
    return false;
  }
}








export async function useHandlePrintGLReport(params) {
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
              sGL: params.sAcctCode,
              eGL: params.eAcctCode,
              sSL: params.sSLCode,
              eSL: params.eSLCode,
              sRC: params.sRCCode,
              eRC: params.eRCCode,
              reportName: formName,
              sprocMode:"",
              sprocName : "",
              export :"" };

        console.log(JSON.stringify(payload))

    const pdfBlob = await postPdfRequest("/printGLReport", payload);

    if (!(pdfBlob instanceof Blob) || pdfBlob.type !== "application/pdf") {
      throw new Error("Expected a PDF file but received something else.");
    }

    const fileURL = URL.createObjectURL(pdfBlob);
    printWindow.location.href = fileURL;

  } catch (error) {
    console.error("Error printing report:", error);
  }
}





export async function useHandleDownloadExcelGLReport(params) {
 
   try {
    const responseDocRpt = await useTopHSRptRow(params.reportId);

    const payload = {
      branchCode: params.branchCode,
      startDate: params.startDate,
      endDate: params.endDate,
      sGL: params.sGL,
      eGL: params.eGL,
      sSL: params.sSL,
      eSL: params.eSL,
      sRC: params.sRC,
      eRC: params.eRC,
      formName: responseDocRpt.crptName,
      sprocMode: responseDocRpt.sprocMode,
      sprocName: responseDocRpt.sprocName,
      export: responseDocRpt.export,
      reportName: responseDocRpt.reportName,
      userCode:params.userCode
    };


  

    // ⬇️ override only for this request
    const response = await apiClient.post("/printGLReport", payload, {
      responseType: "blob",
    });

    if (!response || !response.data) {
      return false; // no data received
    }

    // Determine filename from headers or fallback
    let filename = responseDocRpt.reportName + ".xlsx";
    const disposition = response.headers["content-disposition"];
    if (disposition && disposition.includes("filename=")) {
      filename = disposition
        .split("filename=")[1]
        .replace(/["']/g, "")
        .trim();
    }

    // Create a blob and trigger download
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup URL object
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);

    return true;
  } catch (error) {
    console.error("Error downloading report:", error);
    return false;
  }
}






export function exportToTabbedJson(jsonSheets = []) {
  const data = {};
  for (const tab of jsonSheets) {
    const key = tab.sheetName || "Sheet";
    data[key] = Array.isArray(tab.rows) ? tab.rows : [];
  }
  return { Data: data };
}




export function exportBuildJsonSheets(sheetConfigs = []) {
  return (sheetConfigs || []).map(cfg => ({
    sheetName: cfg.sheetName || "Sheet",
    rows: Array.isArray(cfg.data) ? cfg.data : [],
  }));
}



export function projectRowsByColumnsRaw(rows = [], columns = []) {
 
  const isVisible = (col) => col && col.hidden !== true;

  function formatByColumn(value, col) {
    if (value === null || value === undefined) return "";
    if (col.renderType === "number" || col.renderType === "currency") {
      const digits =
        typeof col.roundingOff === "number" ? col.roundingOff : 2;
      return formatNumber(value, digits);
    }
    return String(value);
  }


  if (!Array.isArray(rows) || rows.length === 0) return [];
  if (!Array.isArray(columns) || columns.length === 0) return rows;

  const visibleCols = columns.filter(isVisible);
  if (visibleCols.length === 0) return rows;

  return rows.map((r) => {
    const out = {};
    for (const col of visibleCols) {
      const header = col.label || col.key;
      const rawValue = r?.[col.key];
      out[header] = formatByColumn(rawValue, col); 
    }
    return out;
  });
}



export function makeSheet(sheetName, rows, columns) {
  return {
    sheetName: sheetName || "Sheet",
    data: projectRowsByColumnsRaw(rows, columns),
  };
}




export async function exportHistoryExcel(endPoint,payload,setExporting,reportName) {
 
   try {
        const res = await apiClient.post(endPoint, payload, { responseType: "blob" });
        const cd = res.headers["content-disposition"] || "";
        const match = cd.match(/filename=("?)([^"]+)\1/i);
        const filename = match ? match[2] : `${reportName}.xlsx`;
  
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      } catch (err) {
        try {
          const text = await err?.response?.data?.text?.();
          console.error("Export failed:", text || err);
          alert("Export failed.\n" + (text || err.message));
        } catch {
          console.error("Export failed:", err);
          alert("Export failed.\n" + err.message);
        }
      } finally {
        setExporting(false);
      }
}







export function useDownloadTextFile(filename, text) {
   try {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // Create a temporary hidden <a> tag
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // In some browsers, setting rel="noopener" and target="_self"
    // ensures same-name overwriting behavior instead of appending (1)
    a.rel = "noopener";
    a.target = "_self";
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
  }
}





export const useNormalizeDat = (src) => {
  if (src == null) return "";

  // If it's already a string, normalize CRLF and return
  if (typeof src === "string") {
    return src.replace(/\r?\n/g, "\r\n");
  }

  // If it's a flat array (strings/numbers), join as lines
  if (Array.isArray(src) && src.every(v => typeof v !== "object" || v === null)) {
    return src.map(v => String(v ?? "")).join("\r\n").replace(/\r?\n/g, "\r\n");
  }

  // If it's an array of objects, pick a sensible line for each object
  if (Array.isArray(src) && src.some(v => v && typeof v === "object")) {
    const preferredKeys = ["line", "LINE", "dat", "DAT", "text", "TEXT", "value", "VALUE", "data", "DATA"];

    const objToLine = (obj) => {
      if (obj == null) return "";

      // 1) If there's a single obvious text field, use it
      for (const k of preferredKeys) {
        if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
          return String(obj[k]);
        }
      }

      // 2) Otherwise, build a pipe-delimited line from values (stable key order)
      const keys = Object.keys(obj); // JS preserves insertion order
      const vals = keys.map((k) => {
        const v = obj[k];
        if (v == null) return "";
        if (typeof v === "object") return JSON.stringify(v); // last resort
        return String(v);
      });
      return vals.join("|");
    };

    const text = src.map(objToLine).join("\r\n");
    return text.replace(/\r?\n/g, "\r\n");
  }

  // Last resort: stringify
  return String(src).replace(/\r?\n/g, "\r\n");
};

import { fetchData, postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';



export const usehandleFileUpload = async (files,documentID) => {
  try {
    const formData = new FormData();

    files.forEach((f, idx) => {

      const fileObj = f.file ? f.file : f;
      const modifiedDate = f.modifiedDate ? new Date(f.modifiedDate) : new Date();
      const uploadedDate = f.uploadedDate ? new Date(f.uploadedDate) : new Date();

      formData.append("files[]", fileObj);
      formData.append("modifiedDate[]", modifiedDate.toISOString());
      formData.append("uploadedDate[]", uploadedDate.toISOString());
      formData.append("documentID", documentID);
    });

    const response = await fetch("http://127.0.0.1:8000/api/attachFile", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const result = await response.json();
    return result; 
  } catch (error) {
    console.error("❌ Upload failed:", error);
    throw error;
  }
};






export const useHandleFileDelete = async (id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/deleteFile/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
;    return result; 
  } catch (err) {
    console.error("Delete failed", err);
    throw err;
  }
};





export const useHandleFileDownload = async (id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/downloadFile/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }


    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download'; 
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }


    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; 
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();

    return { success: true, message: "Download triggered" };
  } catch (err) {
    console.error("❌ Download failed:", err);
    throw err;
  }
};





export const useHandleFileDownloadAll = async (documentID) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/api/downloadAll/${documentID}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    // Get zip blob
    const blob = await response.blob();

    // Default filename
    let filename = `attachments_${documentID}.zip`;

    // Try to read from response headers
    const contentDisposition = response.headers.get("Content-Disposition");
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    a.remove();

    return { success: true, message: "All files download triggered" };
  } catch (err) {
    console.error("❌ Download all failed:", err);
    throw err;
  }
};






export const useFetchTranAtt = async (documentID) => {
if (!documentID || !documentID) {
    throw new Error("Document ID missing");
  }

  try {
    const response = await fetchData("getAttachFile", { documentID: documentID });
    if (response.success) {

     let data = JSON.parse(response.data[0].result || "{}");
     return data;

  

    }
    return null;
  } catch (error) {
    console.error("Error fetching File Attachment row:", error);
    return null;
  }
};


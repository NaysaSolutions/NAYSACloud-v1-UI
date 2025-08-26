import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'; 
import Swal from 'sweetalert2';
import { 
  usehandleFileUpload, 
  useHandleFileDelete,
  useHandleFileDownload,
  useHandleFileDownloadAll,
  useFetchTranAtt 
}  from '@/NAYSA Cloud/Global/fileManagement';



const AttachDocumentModal = ({ isOpen, onClose, params }) => {
  const { DocumentID, DocumentName, BranchName, DocumentNo } = params;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);


useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
       setLoading(true);
      const result = await useFetchTranAtt(DocumentID);
      if (!isMounted) return;

      const normalized = Array.isArray(result)
        ? result.map((item) => ({
            id: item.id || item.fileID,
            file: { name: item.file_name || item.fileName },
            modifiedDate: item.dateModified ? new Date(item.dateModified) : null,
            uploadedDate: item.dateUploaded ? new Date(item.dateUploaded) : null,
          }))
        : [];
      setFiles(normalized);
      setLoading(false);
    } catch (error) {
      if (isMounted) console.error("❌ Failed to fetch attachments:", error);
    }
  };

  if (isOpen) {
    fetchData();
  } else {
    setFiles([]);
  }

  return () => {
    isMounted = false;
  };
}, [isOpen, params]);




const handleFileChange = async (e) => {
  setLoading(true);

  // Convert input files into objects
  const selectedFiles = Array.from(e.target.files).map((file) => ({
    file,
    modifiedDate: new Date(file.lastModified),
    uploadedDate: new Date(),
  }));

  if (selectedFiles.length > 0) {
    try {
      // Check for duplicates against already uploaded files
      const existingNames = files.map(f => f.file.name.toLowerCase());
      const filteredFiles = selectedFiles.filter(
        f => !existingNames.includes(f.file.name.toLowerCase())
      );

      if (filteredFiles.length < selectedFiles.length) {
       Swal.fire({
          icon: "info",
          title: "Duplicate File",
          text: "Some files were skipped because they already exist.",
          confirmButtonColor: "#3085d6",
          timer: 5000,             // auto-close after 5 seconds
          timerProgressBar: true,  // optional: show a progress bar
        });
      }

      // Only upload non-duplicate files
      if (filteredFiles.length > 0) {
        const result = await usehandleFileUpload(filteredFiles, DocumentID);

        const normalized = result.data.map((item) => ({
          id: item.id,
          file: { name: item.file_name },
          modifiedDate: new Date(item.date_modified),
          uploadedDate: new Date(item.date_uploaded),
        }));

        setFiles((prev) => [...prev, ...normalized]);
      }
    } catch (error) {
      console.error("❌ Upload failed:", error);
    }
  }

  e.target.value = ""; // reset input so same file can be reselected later
  setLoading(false);
};




  const handleDelete = async (id) => {
    if (!id) {   
      setFiles((prev) => prev.filter((file) => file.id !== id));
      return;
    }
    try {
      await useHandleFileDelete(id);
      setFiles((prev) => prev.filter((file) => file.id !== id));
      console.log("✅ File deleted:", id);
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }

  };



  
  
  const handleDownload = async (id) => {
    if (!id) {
      return;
    }
    try {
      await useHandleFileDownload(id);
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };


  
  const handleDownloadAll = async () => {
    if (!DocumentID) {
      return;
    }
    try {
      await useHandleFileDownloadAll(DocumentID);
    } catch (err) {
      console.error("❌ Download failed:", err);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-900 w-[900px] rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b p-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <div>
              <p className="font-semibold">Attach Document</p>
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="flex justify-between items-center p-4 text-sm">
          <div className="space-y-1">
            <p>
              <strong>Transaction:</strong>{" "}
              <span className="text-blue-600 cursor-pointer">{DocumentName}</span>
            </p>
            <p>
              <strong>Branch:</strong>{" "}
              <span className="italic text-blue-600">{BranchName}</span>
            </p>
            <p>
              <strong>Document No:</strong>{" "}
              <span className="text-blue-600">{DocumentNo}</span>
            </p>
          </div>
        </div>

        {/* Attachment Details */}
        <div className="border-t">
          <div className="px-4 py-2 bg-gray-100 text-sm font-medium border-b">
            Attachment Details
          </div>

          <div className="flex-grow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[200px] text-blue-500">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mr-3" />
                <span>Please wait...</span>
              </div>
            ) : (
              <div className="p-4 max-h-[250px] overflow-y-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">File Name</th>
                      <th className="border px-2 py-1">Modified Date</th>
                      <th className="border px-2 py-1">Uploaded Date</th>
                      <th className="border px-2 py-1">Download</th>
                      <th className="border px-2 py-1">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-500">
                          No attachments added.
                        </td>
                      </tr>
                    ) : (
                      files.map((item, index) => (
                        <tr key={index}>
                          <td className="border px-2 py-1">{item.file.name}</td>
                          <td className="border px-2 py-1">
                            {item.modifiedDate ? item.modifiedDate.toLocaleString() : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {item.uploadedDate ? item.uploadedDate.toLocaleString() : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            <button
                              onClick={() => handleDownload(item.id)}
                              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              {loading ? 'Downloading...' : 'Download'}
                            </button>
                          </td>
                          <td className="border px-2 py-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              {loading ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {/* Footer */}
        <div className="flex justify-between p-4 border-t">
          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex space-x-2">
            <label
              htmlFor="fileInput"
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 cursor-pointer"
            >
              Add
            </label>

            {/* Download All button */}
            {files.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Download All
            </button>
          )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachDocumentModal;

import { useState } from "react";

const AttachDocumentModal = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).map((file) => ({
      file,
      modifiedDate: new Date(file.lastModified),
      uploadedDate: new Date(),
    }));

    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleDelete = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-900 w-[700px] rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b p-4">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <p className="font-semibold">NAYSA-Solutions, Inc. - Attach Document</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Transaction Info */}
        <div className="flex justify-between items-center p-4 text-sm">
          <div className="space-y-1">
            <p>
              <strong>Transaction:</strong>{" "}
              <span className="text-blue-600 cursor-pointer">A/P Voucher</span>
            </p>
            <p>
              <strong>Branch:</strong>{" "}
              <span className="italic text-blue-600">HO</span>
            </p>
            <p>
              <strong>Document No:</strong>{" "}
              <span className="text-blue-600">0000002</span>
            </p>
          </div>
          <div className="space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
              Download
            </button>
            <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
              Download All
            </button>
          </div>
        </div>

        {/* Attachment Details */}
        <div className="border-t">
          <div className="px-4 py-2 bg-gray-100 text-sm font-medium border-b">
            Attachment Details
          </div>

          {/* Table */}
          <div className="p-4 max-h-[250px] overflow-y-auto">
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1">File Name</th>
                  <th className="border px-2 py-1">Modified Date</th>
                  <th className="border px-2 py-1">Uploaded Date</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      No attachments added.
                    </td>
                  </tr>
                ) : (
                  files.map((item, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-1">{item.file.name}</td>
                      <td className="border px-2 py-1">
                        {item.modifiedDate.toLocaleString()}
                      </td>
                      <td className="border px-2 py-1">
                        {item.uploadedDate.toLocaleString()}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
          <label
            htmlFor="fileInput"
            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 cursor-pointer"
          >
            Add
          </label>
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

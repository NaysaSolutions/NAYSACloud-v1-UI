import { useState,useEffect } from "react";
import { postRequest } from '@/NAYSA Cloud/Configuration/BaseURL';
import {useTopDocSign} from '@/NAYSA Cloud/Global/top1RefTable';


const DocumentSignatories = ({ isOpen, onClose, onCancel, params }) => {
  const [form, setForm] = useState({
    preparedBy: "NSI",
    checkedBy: "",
    notedBy: "",
    approvedBy: "",
    documentID:params
  });


  useEffect(() => {
    const fetchSignatories = async () => {
    try {
        const response = await useTopDocSign(params);
        if (response) {
          setForm({
            preparedBy: "NSI",
            checkedBy: response.checkedBy || "",
            notedBy: response.notedBy || "",
            approvedBy: response.approvedBy || "",
            documentID: params
          });
        }
      } catch (error) {
        console.error("❌ Error fetching signatories:", error);
      }
    };

   fetchSignatories();

  }, [params]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreview = async () => {
    try {
      const response = await postRequest("upsertDocSign", JSON.stringify(form));
      if (!response.success) {
        console.error("⚠️ Failed to save signatories:", response);
      }
    } catch (error) {
      console.error("❌ Error saving signatories:", error);
    }
  };

  const handlePreviewAndClose = async () => {
    await handlePreview();
    onClose();
  };
  

  // ⛔ Don’t render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white dark:bg-gray-900 w-[500px] rounded-lg shadow-lg p-6">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">Document Signatories</h2>

        {/* Input Fields */}
        <div className="space-y-3">
          {["preparedBy", "checkedBy", "notedBy", "approvedBy"].map((field) => (
            <div className="flex items-center" key={field}>
              <label className="w-28 text-sm font-medium capitalize">
                {field.replace(/By$/, " By")}
              </label>
              <input
                type="text"
                name={field}
                value={form[field]}
                onChange={handleChange}
                disabled={field === "preparedBy"} // keep Prepared By readonly
                className={`flex-1 border rounded px-2 py-1 ${
                  field === "preparedBy" ? "bg-gray-100" : ""
                }`}
              />
            </div>
          ))}
        </div>

      

        {/* Footer */}
        <div className="flex justify-end mt-6 space-x-3">
        <button
            onClick={handlePreviewAndClose}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
            Print Preview
        </button>
        <button
            onClick={onCancel} // ✅ just close the modal
            className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
            Cancel
        </button>

        
        </div>

      </div>
    </div>
  );
};

export default DocumentSignatories;

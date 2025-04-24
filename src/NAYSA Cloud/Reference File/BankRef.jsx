import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

// Global
import { useReset } from "../Components/ResetContext";
import { reftables } from '@/NAYSA Cloud/Global/reftable';

const BankRef = () => {

  //Document Global Setup
  const docType = 'BankType'; 
  const documentTitle = reftables[docType] || 'Transaction';

  const [isEditing, setIsEditing] = useState(false); // Controls if inputs are editable
  
  const [branches, setBranches] = useState([]);
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchID, setbranchId] = useState('');
  const [active, setActive] = useState('');
  const [saving, setSaving] = useState(false); // Initializes saving state
  const { setOnSave, setOnReset } = useReset();

  const fetchBranches = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/branch");
      console.log("Fetched branches:", response.data);
      const resultString = response.data?.data?.[0]?.result;
      if (resultString) {
        const parsedBranches = JSON.parse(resultString);
        setBranches(parsedBranches);
      } else {
        console.error("No result string found in response");
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);


const handleSaveBranch = async () => {
  setSaving(true);

  // Log individual values to verify state
  console.log('branchCode:', branchCode);
  console.log('branchName:', branchName);
  console.log('branchAddr1:', branchAddr1);
  console.log('branchTin:', branchTin);

  // Validate required fields before sending
  if (!branchCode || !branchName || !branchAddr1 || !branchTin) {
    Swal.fire({
      title: 'Error!',
      text: 'Please fill out all required fields: Branch Code, Name, Address, TIN.',
      icon: 'error',
      confirmButtonText: 'Okay',
    });
    setSaving(false);
    return;
  }

  // Create the jsonData object with the correct case for keys
  const jsonData = {
    json_data: {
          branchCode: branchCode,  // The branch code
          branchName: branchName,  // The branch name
          branchID: branchID || "", // The branch ID (default to empty if not provided)
          active: '1',             // Active flag (assuming '1' is default)
          userCode: 'NSI',         // User code (replace with actual user code if needed)
          // trans_date: new Date().toISOString(), // Optional, not used in the current stored procedure
        }
  };

  // Log the data being sent to ensure it's correct
  console.log('Sending data to API:', JSON.stringify(jsonData));

  try {
    const response = await axios.post('http://localhost:8000/api/upsertBranch', {
      json_data: jsonData, // Send the array of data
    });

    if (response.data.status === 'success') {
      Swal.fire({
        title: 'Success!',
        text: 'Branch saved successfully!',
        icon: 'success',
        confirmButtonText: 'Okay',
      }).then(() => {
        // Re-fetch the branches after the success message is closed
        fetchBranches();
        resetForm();
        setIsEditing(false);
      });

    } else {
      Swal.fire({
        title: 'Error!',
        text: response.data.message || 'Something went wrong.',
        icon: 'error',
        confirmButtonText: 'Okay',
      });
    }
  } catch (error) {
    console.error('Error saving branch:', error);

    Swal.fire({
      title: 'Error!',
      text: error?.response?.data?.message || 'Error saving branch.',
      icon: 'error',
      confirmButtonText: 'Okay',
    });
  } finally {
    setSaving(false);
  }
};


const resetForm = () => {
  setBranchCode('');
  setBranchName('');
  setbranchId('');
  setActive('');
};


  return (
    <div className="p-4 bg-gray-200 min-h-screen font-roboto">

      <div className="mx-auto">

        {/* Header Section */}
      <div className="global-ref-header-ui mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">

        <div className="text-center sm:text-left">
        <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
        </div>

    </div> 

    <div className="mt-6 flex flex-col md:flex-row gap-4">

        {/* Form Section */}
        <div className="mt-2 bg-white p-4 sm:p-6 shadow-md rounded-lg w-full md:w-1/2 min-w-[200px]">
        {saving && <div>Loading...</div>} {/* Show loading spinner or message */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            {/* Column 1 */}
            <div className="space-y-4 p-4">
              {/* Branch Code */}
              <div className="relative">
                <input
                  type="text"
                  id="branchCode"
                  placeholder=" "
                  className={`peer global-tran-textbox-ui
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  disabled={!isEditing}
                  maxLength={10} // Limit to 10 characters
                />
                <label
                  htmlFor="branchCode"
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                                bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                                peer-placeholder-shown:top-1/2 
                                peer-placeholder-shown:-translate-y-1/2 
                                peer-placeholder-shown:scale-100 
                                peer-focus:top-2 
                                peer-focus:-translate-y-4 
                                peer-focus:scale-75 
                                peer-focus:text-blue-600' 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch Code
                </label>
              </div>

              {/* Branch ID */}
              <div className="relative">
                <input
                  type="text"
                  id="branchId"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={branchID}
                  onChange={(e) => setbranchId(e.target.value)}
                  disabled={!isEditing}  
                />
                <label
                  htmlFor="branchId"
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                                bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                                peer-placeholder-shown:top-1/2 
                                peer-placeholder-shown:-translate-y-1/2 
                                peer-placeholder-shown:scale-100 
                                peer-focus:top-2 
                                peer-focus:-translate-y-4 
                                peer-focus:scale-75 
                                peer-focus:text-blue-600'
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch ID
                </label>
              </div>

              {/* Branch Name */}
              <div className="relative">
                <input
                  type="text"
                  id="branchName"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  disabled={!isEditing}                
                />
                <label
                  htmlFor="branchName"
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                                bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                                peer-placeholder-shown:top-1/2 
                                peer-placeholder-shown:-translate-y-1/2 
                                peer-placeholder-shown:scale-100 
                                peer-focus:top-2 
                                peer-focus:-translate-y-4 
                                peer-focus:scale-75 
                                peer-focus:text-blue-600'
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch Name
                </label>
              </div>
            </div>

          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-2 justify-center">
          <button
    onClick={() => setIsEditing(true)}
    className="bg-blue-500 text-white px-4 py-2 rounded"
  >
    Add
  </button>

  <button
    onClick={handleSaveBranch}
    className="bg-blue-500 text-white px-4 py-2 rounded"
    disabled={!isEditing}
  >
    Save
  </button>

  <button
    onClick={resetForm}
    className="bg-gray-400 text-white px-4 py-2 rounded"
    disabled={!isEditing}
  >
    Reset
  </button>

          </div>
        </div>

        {/* Branch Table */}
<div className="bg-white p-4 sm:p-6 shadow-md rounded-lg w-full md:w-1/2 overflow-x-auto mt-2 min-w-[500px]">
  <h2 className="text-lg font-semibold mb-4"></h2>
  <p className="text-red-500 text-center"></p>
  <div className="overflow-x-auto w-full">
    <div className="min-w-[700px]">
    <table className="w-full text-sm text-center border border-gray-200 rounded-lg shadow-md">
                <thead className="text-gray-700 bg-gray-100">
                  <tr>
                    {[
                      { key: "branchCode", label: "Branch Code" },
                      { key: "branchID", label: "Branch ID" },
                      { key: "branchName", label: "Branch Name" },
                      { key: "active", label: "Active" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-2 border cursor-pointer whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
  {branches.length > 0 ? (
    branches.map((branch, index) => (
      <tr key={index}>
        <td className="px-4 py-2 border">{branch.branchCode}</td>
        <td className="px-4 py-2 border">{branch.branchID || "-"}</td>
        <td className="px-4 py-2 border">{branch.branchName}</td>
        <td className="px-4 py-2 border">{branch.active}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="px-4 py-2 border text-center">
        No branches found
      </td>
    </tr>
  )}
</tbody>

              </table>
    </div>
  </div>
</div>


</div> 

      </div>
    </div>
  );
};

export default BankRef;

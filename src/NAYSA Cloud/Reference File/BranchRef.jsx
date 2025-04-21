import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useReset } from "../Components/ResetContext";

const BranchRef = () => {

  const [isEditing, setIsEditing] = useState(false); // Controls if inputs are editable
  
  const [branches, setBranches] = useState([]);
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchType, setbranchType] = useState('');
  const [branchID, setbranchId] = useState('');
  const [branchAddr1, setBranchAddr1] = useState('');
  const [branchAddr2, setBranchAddr2] = useState('');
  const [branchAddr3, setBranchAddr3] = useState('');
  const [branchTin, setBranchTin] = useState('');
  const [main, setMain] = useState('');
  const [telNo, setTelNo] = useState('');
  const [faxNo, setFaxNo] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
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
          branchType: main,        // The branch type (e.g. 'main')
          branchAddr1: branchAddr1, // Primary branch address
          branchAddr2: branchAddr2 || "", // Secondary address (optional)
          branchAddr3: branchAddr3 || "", // Tertiary address (optional)
          country: country || "",  // The country (optional)
          branchTin: branchTin,    // The branch TIN
          telNo: telNo || "",      // Telephone number
          faxNo: faxNo || "",      // Fax number
          zipCode: zipCode || "",  // Zip code
          main: 'N',               // Main flag (assuming 'N' is default)
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
  setbranchType('');
  setBranchAddr1('');
  setBranchAddr2('');
  setBranchAddr3('');
  setCountry('');
  setBranchTin('');
  setMain('');
  setTelNo('');
  setFaxNo('');
  setZipCode('');
  setActive('');
};


  return (
    <div className="p-4 bg-gray-100 min-h-screen font-roboto">

      <div className="mx-auto">

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4 sm:p-6 rounded-lg text-white shadow-lg">
          <h1 className="text-lg sm:text-2xl font-semibold">Branch</h1>
        </div>

        {/* Form Section */}
        <div className="mt-6 bg-white p-4 sm:p-6 shadow-md rounded-lg">
        {saving && <div>Loading...</div>} {/* Show loading spinner or message */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1 */}
            <div className="space-y-4">
              {/* Branch Code */}
              <div className="relative w-[270px]">
                <input
                  type="text"
                  id="branchCode"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
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
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch Code
                </label>
              </div>

              {/* Branch ID */}
              <div className="relative w-[270px]">
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
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch ID
                </label>
              </div>

              {/* Branch Name */}
              <div className="relative w-[270px]">
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
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch Name
                </label>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">

               {/* Branch Type */}
               <div className="relative w-[270px]">
                <select
                  id="branchType"
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={main}
                  onChange={(e) => setMain(e.target.value)}
                  disabled={!isEditing}
                >
                  <option value=""></option>
                  <option value="M">Main</option>
                  <option value="B">Branch</option>
                </select>
                <label
                  htmlFor="branchType"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Branch Type
                </label>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              

              {/* Address */}
              <div className="relative w-[270px] ">
                <input
                  type="text"
                  id="address"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={branchAddr1}
                  onChange={(e) => setBranchAddr1(e.target.value)}
                  disabled={!isEditing}
                />
                <label
                  htmlFor="address"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Address
                </label>
              </div>

              {/* Zip Code */}
              <div className="relative w-[270px]">
                <input
                  type="text"
                  id="zipCode"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={!isEditing}
                />
                <label
                  htmlFor="zipCode"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Zip Code
                </label>
              </div>
            </div>

            {/* Column 3 */}
            <div className="space-y-4">
              

              {/* TIN */}
              <div className="relative w-[270px]">
              <input
  type="text"
  id="tin"
  placeholder=" "
  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
    ${isEditing 
      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  
  value={branchTin}
  onChange={(e) => {
    const value = e.target.value;
    // Only allow digits and dashes
    const sanitized = value.replace(/[^0-9-]/g, '');
    setBranchTin(sanitized);
  }}
  disabled={!isEditing}
/>

                <label
                  htmlFor="tin"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Tax Identification Number (TIN)
                </label>
              </div>

              {/* Telephone No. */}
              <div className="relative w-[270px]">
                <input
                  type="text"
                  id="telNo"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={telNo}
                  onChange={(e) => setTelNo(e.target.value)}
                  disabled={!isEditing}
                />
                <label
                  htmlFor="zipCode"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Telephone No.
                </label>
              </div>

              {/* Fax No. */}
              <div className="relative w-[270px]">
                <input
                  type="text"
                  id="faxNo"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={faxNo}
                  onChange={(e) => setFaxNo(e.target.value)}
                  disabled={!isEditing}
                />
                <label
                  htmlFor="zipCode"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Fax No.
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Branch Table */}
<div className="mt-6 bg-white p-4 sm:p-6 shadow-md rounded-lg">
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
                      { key: "branchType", label: "Branch Type" },
                      { key: "Address", label: "Address" },
                      { key: "branchTin", label: "TIN" },
                      { key: "telNo", label: "Telephone No." },
                      { key: "faxNo", label: "Fax No." },
                      { key: "zipCode", label: "Zip Code" },
                      { key: "main", label: "Main" },
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
        <td className="px-4 py-2 border">{branch.main}</td>
        <td className="px-4 py-2 border">{branch.branchAddr1 || "-"}</td>
        <td className="px-4 py-2 border">{branch.country || "-"}</td>
        <td className="px-4 py-2 border">{branch.branchTin}</td>
        <td className="px-4 py-2 border">{branch.telNo || "-"}</td>
        <td className="px-4 py-2 border">{branch.faxNo || "-"}</td>
        <td className="px-4 py-2 border">{branch.zipCode || "-"}</td>
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
  );
};

export default BranchRef;

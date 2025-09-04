import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

import { useLocation, useNavigate } from "react-router-dom";

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faMagnifyingGlass, faTrashAlt, faPlus,faMinus } from "@fortawesome/free-solid-svg-icons";
import { faList, faPen, faSave, faUndo, faPrint } from "@fortawesome/free-solid-svg-icons";

// Global
import { useReset } from "../Components/ResetContext";
import { reftables } from '@/NAYSA Cloud/Global/reftable';

const BankRef = () => {

  //Document Global Setup
  const docType = 'BankType'; 
  const documentTitle = reftables[docType] || 'Transaction';

  const [isEditing, setIsEditing] = useState(false); // Controls if inputs are editable
  
  const [bankTypes, setBankTypes] = useState([]);
  const [bankTypeCode, setBankTypeCode] = useState('');
  const [bankTypeName, setBankTypeName] = useState('');
  const [reportName, setReportName] = useState('');
  const [active, setActive] = useState('');
  const [saving, setSaving] = useState(false); // Initializes saving state
  const { setOnSave, setOnReset } = useReset();

  // const fetchBranches = async () => {
  //   try {
  //     const response = await axios.post("http://localhost:8000/api/branch");
  //     console.log("Fetched branches:", response.data);
  //     const resultString = response.data?.data?.[0]?.result;
  //     if (resultString) {
  //       const parsedBranches = JSON.parse(resultString);
  //       setBranches(parsedBranches);
  //     } else {
  //       console.error("No result string found in response");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching branches:", error);
  //   }
  // };

  const fetchBranches = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/branch");
      const resultString = response.data?.data?.[0]?.result;
  
      if (resultString) {
        const parsedBranches = JSON.parse(resultString);
        if (parsedBranches.length > 0) {
          setBankTypes(parsedBranches);
        } else {
          // If API returns empty, load these sample records
          setBankTypes([
            { bankTypeCode: "AUB", bankTypeName: "ASIA UNITED BANK", reportName: "AUB" },
            { bankTypeCode: "BDO", bankTypeName: "BANCO DE ORO", reportName: "BDO" },
            { bankTypeCode: "BPI", bankTypeName: "BANK OF THE PHILIPPINE ISLANDS", reportName: "BPI" },
            { bankTypeCode: "LANDBANK", bankTypeName: "LAND BANK OF THE PHILIPPINES", reportName: "LANDBANK" },
            { bankTypeCode: "METROBANK", bankTypeName: "METROPOLITAN BANK", reportName: "METROBANK" },
            { bankTypeCode: "RCBC", bankTypeName: "RIZAL COMMERCIAL BANKING CORP", reportName: "RCBC" },
            { bankTypeCode: "UCPB", bankTypeName: "UNITED COCONUT PLANTERS BANK", reportName: "UCPB" },
            { bankTypeCode: "CHINABANK", bankTypeName: "CHINA BANKING CORPORATION", reportName: "CHINABANK" },
            { bankTypeCode: "PNB", bankTypeName: "PHILIPPINE NATIONAL BANK", reportName: "PNB" },
            { bankTypeCode: "EWB", bankTypeName: "EASTWEST BANK", reportName: "EWB" },
            { bankTypeCode: "PB", bankTypeName: "PBCOM", reportName: "PB" }
          ]);
        }
      } else {
        // If result string is null
        setBankTypes([
          { bankTypeCode: "AUB", bankTypeName: "ASIA UNITED BANK", reportName: "AUB" },
          { bankTypeCode: "BDO", bankTypeName: "BANCO DE ORO", reportName: "BDO" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
  
      // If API fails, load fallback data
      setBankTypes([
        { bankTypeCode: "AUB", bankTypeName: "ASIA UNITED BANK", reportName: "AUB" },
            { bankTypeCode: "BDO", bankTypeName: "BANCO DE ORO", reportName: "BDO" },
            { bankTypeCode: "BPI", bankTypeName: "BANK OF THE PHILIPPINE ISLANDS", reportName: "BPI" },
            { bankTypeCode: "LANDBANK", bankTypeName: "LAND BANK OF THE PHILIPPINES", reportName: "LANDBANK" },
            { bankTypeCode: "METROBANK", bankTypeName: "METROPOLITAN BANK", reportName: "METROBANK" },
            { bankTypeCode: "RCBC", bankTypeName: "RIZAL COMMERCIAL BANKING CORP", reportName: "RCBC" },
            { bankTypeCode: "UCPB", bankTypeName: "UNITED COCONUT PLANTERS BANK", reportName: "UCPB" },
            { bankTypeCode: "CHINABANK", bankTypeName: "CHINA BANKING CORPORATION", reportName: "CHINABANK" },
            { bankTypeCode: "PNB", bankTypeName: "PHILIPPINE NATIONAL BANK", reportName: "PNB" },
            { bankTypeCode: "EWB", bankTypeName: "EASTWEST BANK", reportName: "EWB" },
            { bankTypeCode: "PB", bankTypeName: "PBCOM", reportName: "PB" }
      ]);
    }
  };
  
  

  useEffect(() => {
    fetchBranches();
  }, []);


  const handleDeleteRow = (index) => {
    const updatedRows = [...detailRows];
    updatedRows.splice(index, 1);
    setDetailRows(updatedRows); // assuming you're using useState
  };

const handleSaveBranch = async () => {
  setSaving(true);

  // Log individual values to verify state
  console.log('bankType:', bankType);
  console.log('bankTypeName:', bankTypeName);
  console.log('reportName:', reportName);

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
  setBankTypeCode('');
  setBankTypeName('');
  setReportName('');
  // setActive('');
};


  return (
    <div className="mt-10 p-4 bg-gray-100 min-h-screen font-roboto">

      <div className="mx-auto">

        {/* Header Section */}
      <div className="global-ref-header-ui mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">

        <div className="text-center sm:text-left">
        <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
        </div>

        
          {/* Submit Button */}
          <div className="flex gap-2 justify-center">
            {/* <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add
            </button> */}

            <button
              onClick={handleSaveBranch}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={!isEditing}
            >
              <FontAwesomeIcon icon={faSave} />
              Save
            </button>

            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={!isEditing}
            >
              <FontAwesomeIcon icon={faUndo} />
              Reset
            </button>

            <button
              onClick={resetForm}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              disabled={!isEditing}
            >
              <FontAwesomeIcon icon={faPrint} />
              Export
            </button>
          </div>


    </div> 

    <div className="mt-2 flex flex-col md:flex-row gap-4">

        {/* Form Section */}
        <div className="mt-2 bg-white p-4 sm:p-6 shadow-md rounded-lg w-full md:w-1/2 min-w-[100px]">
        {saving && <div>Loading...</div>} {/* Show loading spinner or message */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

            {/* Column 1 */}
            <div className="space-y-4 p-4">
              {/* Branch Code */}
              <div className="relative">
                <input
                  type="text"
                  id="bankTypeCode"
                  placeholder=" "
                  className={`peer global-tran-textbox-ui
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={bankTypeCode}
                  onChange={(e) => setBankTypeCode(e.target.value)}
                  disabled={!isEditing}
                  maxLength={10} // Limit to 10 characters
                />
                <label
                  htmlFor="bankTypeCode"
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
                  Bank Type (Required)
                </label>
              </div>

              {/* Branch ID */}
              <div className="relative">
                <input
                  type="text"
                  id="bankTypeName"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={bankTypeName}
                  onChange={(e) => setBankTypeName(e.target.value)}
                  disabled={!isEditing}  
                />
                <label
                  htmlFor="bankTypeName"
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
                  Bank Name 
                  <span classname="text-red-500"> (Required)</span>
                </label>
              </div>

              {/* Branch Name */}
              <div className="relative">
                <input
                  type="text"
                  id="reportName"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  disabled={!isEditing}                
                />
                <label
                  htmlFor="reportName"
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
                  Report Name
                </label>
              </div>
            </div>

          </div>

         {/* Submit Button */}
         {/* <div className="mt- flex gap-2 justify-center mt-4">
          <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>

            <button
              onClick={handleSaveBranch}
              className="bg-blue-600 text-white px-4 py-2 rounded"
              disabled={!isEditing}
            >
              Save
            </button>

            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
              disabled={!isEditing}
            >
              Reset
            </button>

            <button
              onClick={resetForm}
              className="bg-green-600 text-white px-4 py-2 rounded"
              disabled={!isEditing}
            >
              Export
            </button>

          </div> */}




        </div>


        {/* Branch Table */}
<div className="bg-white p-4 sm:p-6 shadow-md rounded-lg w-full md:w-1/2 overflow-x-auto mt-2 min-w-[800px]">
  <h2 className="text-lg font-semibold mb-4"></h2>
  <p className="text-red-500 text-center"></p>


  <div className="overflow-x-auto w-full">
    <div className="min-w-[600px]">
    <table className="min-w-full border-collapse text-sm">
                <thead className="sticky top-0 bg-blue-300 z-10">
                  <tr>
                    {[
                      { key: "bankTypeCode", label: "Bank Type" },
                      { key: "bankTypeName", label: "Bank Name" },
                      { key: "reportName", label: "Report Name" },
                      { key: "edit", label: "Edit" },
                      { key: "delete", label: "Delete" },
                      // { key: "active", label: "Active" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-2 py-2 border cursor-pointer whitespace-nowrap"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="relative">
  {bankTypes.length > 0 ? (
    bankTypes.map((banktype, index) => (
      <tr key={index} className="hover:bg-blue-100 border">
        <td className="px-2 py-2 border">{banktype.bankTypeCode}</td>
        <td className="px-2 py-2 border">{banktype.bankTypeName || "-"}</td>
        <td className="px-2 py-2 border">{banktype.reportName}</td>
        {/* <td className="px-4 py-2 border">{branch.active}</td> */}


        <td className="global-tran-td-ui text-center sticky right-0 w-[50px]">
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition w-[35px]"
                onClick={() => handleDeleteRow(index)}
                >
                  {/* Delete                  */}
                  <FontAwesomeIcon icon={faEdit} />
                </button>
            </td>

            <td className="global-tran-td-ui text-center sticky right-0 w-[50px]">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition w-[35px]"
                onClick={() => handleDeleteRow(index)}
                >
                  {/* Delete                  */}
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
            </td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="px-2 py-2 border text-center">
        No Bank Type Codes found
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faMagnifyingGlass, faTrashAlt, faPlus,faMinus,faTrash, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { faList, faPen, faSave, faUndo, faPrint } from "@fortawesome/free-solid-svg-icons";

// Global
import { useReset } from "../Components/ResetContext";
import { reftables } from '@/NAYSA Cloud/Global/reftable';

// Exports
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
// import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';


const BranchRef = () => {

  //Document Global Setup
  const docType = 'Branch'; 
  const documentTitle = reftables[docType] || 'Transaction';

  const [isEditing, setIsEditing] = useState(true); // Controls if inputs are editable
  
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
  const [isOpen, setIsOpen] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/branch");
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

const handleDeleteBranch = (index) => {
  const updatedRows = [...branches];
  updatedRows.splice(index, 1);
  setBranches(updatedRows); // assuming you're using useState
};

const handleExport = (type) => {
  // console.log(branches);


  if (!branches.length) {
    console.error("No data to export!");
    return;
  }

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } }, // Bold font and white text color
    fill: { fgColor: { rgb: "0000FF" } }, // Blue background color
    alignment: { horizontal: "center", vertical: "center" }, // Centered text alignment
};

  const headers = [
    
    // { v: "Branch Code", s: headerStyle },  // Apply header style
    // { v: "Branch Name", s: headerStyle },  // Apply header style
    // { v: "Branch Type", s: headerStyle },  // Apply header style
    // { v: "Branch Address 1", s: headerStyle },  // Apply header style
    // { v: "Branch Address 2", s: headerStyle },  // Apply header style
    // { v: "Branch Address 3", s: headerStyle },  // Apply header style
    // { v: "Branch TIN", s: headerStyle },  // Apply header style
    // { v: "Telephone No", s: headerStyle },  // Apply header style
    // { v: "Fax No", s: headerStyle },  // Apply header style
    // { v: "Zip Code", s: headerStyle },  // Apply header style
    // { v: "Active", s: headerStyle },  // Apply header style

    "Branch Code",
    "Branch Name",
    "Branch Type",
    "Branch Address 1",
    "Branch Address 2",
    "Branch Address 3",
    "Branch TIN",
    "Telephone No",
    "Fax No",
    "Zip Code",
    "Active"
  ];

  // const headers = branches.length > 0 ? Object.keys(branches[0]) : [];

  const rows = branches.map(branch => [
    branch.branchCode || "",
    branch.branchName || "",
    branch.branchType || "",
    branch.branchAddr1 || "",
    branch.branchAddr2 || "",
    branch.branchAddr3 || "",
    branch.country || "",
    branch.branchTin || "",
    branch.telNo || "",
    branch.faxNo || "",
    branch.zipCode || "",
    branch.active || "",
  ]);

  if (type === 'csv' || type === 'excel') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    XLSX.utils.book_append_sheet(wb, ws, "Branches");

    if (type === 'csv') {
      XLSX.writeFile(wb, "branches.csv", { bookType: 'csv' });
    } else {
      XLSX.writeFile(wb, "branches.xlsx", { bookType: 'xlsx' });
    }
  } else if (type === 'pdf') {
    const doc = new jsPDF({
      orientation: 'landscape',  // <- This helps wide tables
      unit: 'pt',
      format: 'A4'
    });

    doc.setFontSize(15);
    doc.text("Branch Codes", 40, 40);

    // doc.autoTable({
    //   head: [headers],
    //   body: rows,
    //   startY: 60,
    //   margin: { top: 50 },
    //   styles: { fontSize: 8 },
    //   headStyles: { fillColor: [22, 160, 133] }, // green header
    // });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 60,
      margin: { top: 50 },
      styles: { fontSize: 8 ,
        textColor: [0, 0, 0], // black text

      },
      headStyles: { fillColor: [0, 200, 255]
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255], // Light gray for alternate rows
      },
      theme: 'grid'
      , // Ensures there are grid lines around cells
    });
    
    doc.save('branches.pdf');
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

  fetchBranches();
};


  return (
    <div className="global-ref-main-div-ui">

      <div className="mx-auto">

        {/* Header Section
        <div className="global-ref-header-ui">
          <h1 className="global-ref-headertext-ui">Branch</h1>
        </div> */}

          {/* Header Section */}
              <div className="global-ref-header-ui mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        
                <div className="text-center sm:text-left">
                <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
                </div>
        
                
                  {/* Submit Button */}
                  <div className="flex gap-2 justify-center flex-row">
                    {/* <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Add
                    </button> */}
        
                    <button
                      onClick={handleSaveBranch}
                      className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                      disabled={!isEditing}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Save
                    </button>
        
                    <button
                      onClick={resetForm}
                      className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                      disabled={!isEditing}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Reset
                    </button>
        
                    <button
                      onClick={handleExport}
                      className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-sm md:text-base md:px-4"
                      // disabled={!isEditing}
                    >
                      <FontAwesomeIcon icon={faPrint} />
                      Export
                    </button>
                    <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-2"
                              >
                                <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
                                {/* Guide */}
                              </button>

                    <button
    onClick={() => handleExport('csv')}
    className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-sm md:text-base md:px-4"
  >
    <FontAwesomeIcon icon={faPrint} />
    Export CSV
  </button>

  <button
    onClick={() => handleExport('excel')}
    className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
  >
    <FontAwesomeIcon icon={faPrint} />
    Export Excel
  </button>

  <button
    onClick={() => handleExport('pdf')}
    className="bg-red-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-red-700 text-sm md:text-base md:px-4"
  >
    <FontAwesomeIcon icon={faPrint} />
    Export PDF
  </button>

                  </div>
        
        
            </div> 

        {/* Form Section */}
        <div className="global-tran-tab-div-ui">
        {saving && <div>Loading...</div>} {/* Show loading spinner or message */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Column 1 */}
            <div className="global-ref-textbox-group-div-ui">
              {/* Branch Code */}
              <div className="relative">
                <input
                  type="text"
                  id="branchCode"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400 ' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Branch Code
                </label>
              </div>

              {/* Branch ID */}
              <div className="relative">
                <input
                  type="text"
                  id="branchId"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Branch ID
                </label>
              </div>

              {/* Branch Name */}
              <div className="relative">
                <input
                  type="text"
                  id="branchName"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Branch Name
                </label>
              </div>
            </div>

            {/* Column 2 */}
            <div className="global-ref-textbox-group-div-ui">

               {/* Branch Type */}
               <div className="relative">
                <select
                  id="branchType"
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  
                  // value={"Main"}
                  defaultValue={'M'}
                  onChange={(e) => setMain(e.target.value)}
                  disabled={!isEditing}
                >
                  <option value=""></option>
                  <option value="M">Main</option>
                  <option value="B">Branch</option>
                </select>
                <label
                  htmlFor="branchType"
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                    bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                    peer-placeholder-shown:top-1/2 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:scale-100 
                    peer-focus:top-2 
                    peer-focus:-translate-y-4 
                    peer-focus:scale-75 
                    peer-focus:text-blue-600' 
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
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
              <div className="relative">
                <input
                  type="text"
                  id="address"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                    bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                    peer-placeholder-shown:top-1/2 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:scale-100 
                    peer-focus:top-2 
                    peer-focus:-translate-y-4 
                    peer-focus:scale-75 
                    peer-focus:text-blue-600' 
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Address
                </label>
              </div>

              {/* Country
              <div className="relative w-[270px]">
                <input
                  type="text"
                  id="country"
                  placeholder=" "
                  className={`peer block w-full appearance-none rounded-lg px-2.5 pb-2.5 pt-4 text-sm focus:outline-none focus:ring-0
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!isEditing}
                />
                <label
                  htmlFor="country"
                  className={`absolute start-2 top-1 z-10 origin-[0] scale-75 transform px-1 
                    bg-gray-100 text-sm text-gray-500 duration-300 
                    peer-placeholder-shown:translate-y-4 peer-placeholder-shown:scale-100 
                    peer-focus:top-1 peer-focus:translate-y-0 peer-focus:scale-75 
                    peer-focus:px-1 peer-focus:text-blue-600 
                    ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Country
                </label>
              </div> */}

              {/* Zip Code */}
              <div className="relative">
                <input
                  type="text"
                  id="zipCode"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                    bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                    peer-placeholder-shown:top-1/2 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:scale-100 
                    peer-focus:top-2 
                    peer-focus:-translate-y-4 
                    peer-focus:scale-75 
                    peer-focus:text-blue-600' 
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Zip Code
                </label>
              </div>
            </div>

            {/* Column 3 */}
            <div className="global-ref-textbox-group-div-ui">
              

              {/* TIN */}
              <div className="relative">
              <input
  type="text"
  id="tin"
  placeholder=" "
  className={`peer global-ref-textbox-ui
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
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                    bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                    peer-placeholder-shown:top-1/2 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:scale-100 
                    peer-focus:top-2 
                    peer-focus:-translate-y-4 
                    peer-focus:scale-75 
                    peer-focus:text-blue-600' 
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Tax Identification Number (TIN)
                </label>
              </div>

              {/* Telephone No. */}
              <div className="relative">
                <input
                  type="text"
                  id="telNo"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
  bg-gray-100 px-2 text-sm text-gray-600 transition-all 
  peer-placeholder-shown:top-1/2 
  peer-placeholder-shown:-translate-y-1/2 
  peer-placeholder-shown:scale-100 
  peer-focus:top-2 
  peer-focus:-translate-y-4 
  peer-focus:scale-75 
  peer-focus:text-blue-600' 
  dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Telephone No.
                </label>
              </div>

              {/* Fax No. */}
              <div className="relative">
                <input
                  type="text"
                  id="faxNo"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
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
                  className={`absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform 
                    bg-gray-100 px-2 text-sm text-gray-600 transition-all 
                    peer-placeholder-shown:top-1/2 
                    peer-placeholder-shown:-translate-y-1/2 
                    peer-placeholder-shown:scale-100 
                    peer-focus:top-2 
                    peer-focus:-translate-y-4 
                    peer-focus:scale-75 
                    peer-focus:text-blue-600' 
                    dark:bg-gray-600 dark:text-white dark:peer-focus:text-white
                  ${!isEditing ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500'}`}
                >
                  Fax No.
                </label>
              </div>

            </div>
          </div>

          {/* Submit Button
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

          </div> */}


        </div>

        {/* Branch Table */}
<div className="global-ref-table-main-div-ui">
  <div className="global-ref-table-main-sub-div-ui">
    <div className="global-ref-table-div-ui">
    <table className="global-ref-table-div-ui">
                <thead className="global-ref-thead-div-ui">
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
                      { key: "edit", label: "Edit" },
                      { key: "delete", label: "Delete" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="global-ref-th-ui"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
  {branches.length > 0 ? (
    branches.map((branch, index) => (
      <tr key={index} className="global-tran-tr-ui">
        <td className="global-ref-td-ui">{branch.branchCode}</td>
        <td className="global-ref-td-ui">{branch.branchID || "-"}</td>
        <td className="global-ref-td-ui">{branch.branchName}</td>
        <td className="global-ref-td-ui">{branch.main}</td>
        <td className="global-ref-td-ui">{branch.branchAddr1 || "-"}</td>
        <td className="global-ref-td-ui">{branch.country || "-"}</td>
        <td className="global-ref-td-ui">{branch.branchTin}</td>
        <td className="global-ref-td-ui">{branch.telNo || "-"}</td>
        <td className="global-ref-td-ui">{branch.faxNo || "-"}</td>
        <td className="global-ref-td-ui">{branch.zipCode || "-"}</td>
        <td className="global-ref-td-ui">{branch.active}</td>
        <td className="global-ref-td-ui text-center sticky right-0">
                      <button
                        className="global-ref-td-button-edit-ui"
                        onClick={() => handleDeleteRow(index)}
                        >
                          {/* Delete                  */}
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
        </td>
        <td className="global-ref-td-ui text-center sticky right-0">
                      <button
                        className="global-ref-td-button-delete-ui"
                        onClick={() => handleDeleteBranch(index)}
                        >
                          {/* Delete                  */}
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
        </td>
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

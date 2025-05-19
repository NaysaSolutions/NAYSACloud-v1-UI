import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faMagnifyingGlass,
  faTrashAlt,
  faPrint,
  faChevronDown,
  faInfoCircle,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faVideo,
  faPen,
  faSave,
  faUndo,
} from '@fortawesome/free-solid-svg-icons';

// Global
import { useReset } from "../Components/ResetContext";
import { reftables } from '@/NAYSA Cloud/Global/reftable';
import { reftablesPDFGuide } from '@/NAYSA Cloud/Global/reftable';
import { reftablesVideoGuide } from '@/NAYSA Cloud/Global/reftable';

// Exports
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BranchRef = () => {

  //Document Global Setup
  const docType = 'Branch'; 
  const documentTitle = reftables[docType] || 'Transaction';
  const pdfLink = reftablesPDFGuide[docType];
  const videoLink = reftablesVideoGuide[docType];

  const [isEditing, setIsEditing] = useState(true); // Controls if inputs are editable
  const [editingBranch, setEditingBranch] = useState(null);
  
  const [branches, setBranches] = useState([]);
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchType, setbranchType] = useState('Branch');
  // const [branchID, setbranchId] = useState('');
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
  const [isOpenExport, setOpenExport] = useState(false);
  const [isOpenGuide, setOpenGuide] = useState(false);
  
  const [loading, setLoading] = useState(false);


  const exportRef = useRef(null);
  const guideRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target) &&
        guideRef.current &&
        !guideRef.current.contains(event.target)
      ) {
        setOpenExport(false);
        setOpenGuide(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  setLoading(true);
  setSaving(true);

  const {
    branchCode,
    branchName,
    branchAddr1,
    branchAddr2,
    branchAddr3,
    branchTin,
    telNo,
    faxNo,
    zipCode,
    country,
    main
  } = editingBranch || {};

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
          // branchID: branchID || "", // The branch ID (default to empty if not provided)
          branchType: main,        // The branch type (e.g. 'main')
          branchAddr1: branchAddr1, // Primary branch address
          branchAddr2: branchAddr2 || "", // Secondary address (optional)
          branchAddr3: branchAddr3 || "", // Tertiary address (optional)
          country: country || "",  // The country (optional)
          branchTin: branchTin,    // The branch TIN
          telNo: telNo || "",      // Telephone number
          faxNo: faxNo || "",      // Fax number
          zipCode: zipCode || "",  // Zip code
          main: main,               // Main flag (assuming 'N' is default)
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
    
    setTimeout(() => setLoading(false), 2000);
    // resetForm()
  }
};


const handleDeleteBranch = async (index) => {
  const branchToDelete = branches[index];

  if (!branchToDelete?.branchCode) {
    console.error('No branchCode found for deletion');
    return;
  }

  Swal.fire({
    title: 'Are you sure?',
    text: 'This will permanently delete the branch.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    // background: isDarkMode ? '#000' : '#999',
    // color: isDarkMode ? '#fff' : '#000'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.post('http://localhost:8000/api/deleteBranch', {
                  json_data: {
            branchCode: branchToDelete.branchCode
          }
        });

        if (response.data.status === 'success') {
          // Remove branch from UI
          const updatedRows = [...branches];
          updatedRows.splice(index, 1);
          setBranches(updatedRows);

          Swal.fire({
            title: 'Deleted!',
            text: 'The branch has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: response.data.message || 'Deletion failed on server.',
            icon: 'error',
          });
        }
      } catch (error) {
        console.error('API delete error:', error);
        Swal.fire({
          title: 'Error!',
          text: error?.response?.data?.message || 'Failed to delete branch.',
          icon: 'error',
        });
      }
    }
  });
};



const handleExport = (type) => {
  // console.log(branches);


  if (!branches.length) {
    console.error("No data to export!");
    return;
  }

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } }, // Bold font and white text color
    fill: { fgColor: { rgb: "000080" } }, // Blue background color
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
    branch.main || "",
    branch.branchAddr1 || "",
    branch.branchAddr2 || "",
    branch.branchAddr3 || "",
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
  theme: 'grid', // Shows borders

  // General body styles
  styles: {
    fontSize: 8,
    textColor: [40, 40, 40], // Dark gray text
    lineColor: [60, 60, 60],    // Dark gray grid lines
    lineWidth: 0.1,
  },

  // Header styles
  headStyles: {
    fillColor: [0, 0, 128], // Navy blue background
    textColor: [255, 255, 255], // White text
    fontStyle: 'bold',
    halign: 'center',
  },

  // // Alternate row styling
  // alternateRowStyles: {
  //   fillColor: [230, 240, 255], // Very light blue
  // },

  // // Even (non-alternate) row styling
  // rowStyles: {
  //   fillColor: [250, 250, 250], // Off-white
  // },

  // Optional: Add special color for specific columns
  // columnStyles: {
  //   0: { textColor: [0, 100, 200] }, // First column: blue text
  //   1: { textColor: [0, 150, 0] },   // Second column: green text
  // }
});

    
    doc.save('branches.pdf');
  }
  
};



const resetForm = () => {
  // setBranchCode('');
  // setBranchName('');
  // // setbranchId('');
  // setbranchType('');
  // setBranchAddr1('');
  // setBranchAddr2('');
  // setBranchAddr3('');
  // setCountry('');
  // setBranchTin('');
  // setMain('');
  // setTelNo('');
  // setFaxNo('');
  // setZipCode('');
  // setActive('');

  setEditingBranch({
    branchCode: '',
    branchName: '',
    branchID: '',
    branchType: '',
    branchAddr1: '',
    branchAddr2: '',
    branchAddr3: '',
    country: '',
    branchTin: '',
    main: '',
    telNo: '',
    faxNo: '',
    zipCode: '',
    active: '',
 });

  // setIsEditing(false); // Optional: if you want to exit editing mode
  fetchBranches();     // Refresh the list

};


  const handlePDFGuide = () => {
    window.open(pdfLink, '_blank');
    setOpenGuide(false);
  };

  const handleVideoGuide = () => {
    window.open(videoLink, '_blank');
    setOpenGuide(false);
  };

  const handleEditRow = (index) => {
  const selected = branches[index];
  setEditingBranch(selected);
  setIsEditing(true);
};


  return (
    <div className="global-ref-main-div-ui">

      <div className="mx-auto">

          {/* Header Section */}
              <div className="fixed mt-10 top-14 left-6 right-6 z-30 global-ref-header-ui mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        
                <div className="text-center sm:text-left">
                <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
                </div>
        
                

                  {/* Submit Button */}
                  <div className="flex gap-2 justify-center flex-row">

                    <button
                      onClick={handleSaveBranch}
                      onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === "s" && !loading) {
                          e.preventDefault();
                          handleSaveBranch(); // Make sure you're calling the correct save function
                        }
                      }}
                      // disabled={loading}
                      className={`bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 
                        hover:bg-blue-700 text-sm md:text-base md:px-4 
                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <FontAwesomeIcon icon={faSave} />
                      Save
                    </button>
        
                    {/* <button
                      onClick={resetForm}
                      className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                      disabled={!isEditing}
                    >
                      <FontAwesomeIcon icon={faUndo} />
                      Reset
                    </button> */}

                    <button
                    onClick={resetForm}
                    className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                    // disabled={!isEditing}
                  >
                    <FontAwesomeIcon icon={faUndo} />
                    Reset
                  </button>

        
                    <div ref={exportRef} classname="mx-auto">
                      <button
                        onClick={() => setOpenExport(!isOpenExport)}
                        className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-green-700 text-sm md:text-base md:px-4"
                        >
                        <FontAwesomeIcon icon={faPrint} />
                        Export
                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                      </button>

                      {isOpenExport && (
                        <div className="absolute right-15 mt-1 w-35 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800">
                          <div className="py-1">
                            <button
                              onClick={() => { handleExport('csv'); setOpenExport(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 dark:text-white dark:hover:bg-blue-900"
                            >
                              <FontAwesomeIcon icon={faFileCsv} className="mr-2 text-green-600" />
                              CSV
                            </button>
                            <button
                              onClick={() => { handleExport('excel'); setOpenExport(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 dark:text-white dark:hover:bg-blue-900"
                            >
                              <FontAwesomeIcon icon={faFileExcel} className="mr-2 text-green-600" />
                              Excel
                            </button>
                            <button
                              onClick={() => { handleExport('pdf'); setOpenExport(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 dark:text-white dark:hover:bg-blue-900"
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
                              PDF
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div ref={guideRef} classname="mx-auto">
                      <button
                        onClick={() => setOpenGuide(!isOpenGuide)}
                        className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 text-sm md:text-base md:px-4"
                        >
                        <FontAwesomeIcon icon={faInfoCircle} />
                        Info
                        <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
                      </button>

                      {isOpenGuide && (
                        <div className="absolute right-5 mt-1 w-35 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 dark:bg-gray-800">
                          <div className="py-1">
                            <button
                              onClick={() => { handlePDFGuide(); setOpenGuide(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 dark:text-white dark:hover:bg-blue-900"
                            >
                              <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" />
                              User Guide
                            </button>
                            <button
                              onClick={() => { handleVideoGuide(); setOpenGuide(false); }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-200 dark:text-white dark:hover:bg-blue-900"
                            >
                              <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" />
                              Video Guide
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

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
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`}
                  value={editingBranch?.branchCode || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, setBranchCode: e.target.value })                   
                  }
                  disabled={true}
                  readOnly={!isEditing}
                  maxLength={10} // Limit to 10 characters
                />
                <label
                  htmlFor="branchCode"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Branch Code
                </label>
              </div>

              {/* Branch ID */}
              {/* <div className="relative">
                <input
                  type="text"
                  id="branchId"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'bg-white border border-gray-400 focus:border-blue-600 text-black' 
                      : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  value={editingBranch?.branchID || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, branchID: e.target.value })
                  }
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
              </div> */}

              {/* Branch Name */}
              <div className="relative">
                <input
                  type="text"
                  id="branchName"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`}              
                  value={editingBranch?.branchName || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, branchName: e.target.value })
                  }


                  // value={branchName}
                  // onChange={(e) => setBranchName(e.target.value)}

                  disabled={!isEditing}           
                />
                <label
                  htmlFor="branchName"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Branch Name
                </label>
              </div>


               {/* Branch Type */}
               <div className="relative">
                <select
                  id="main"
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`}                  
                  defaultValue={'Branch'}
                  value={editingBranch?.main || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, main: e.target.value })
                  }
                  disabled={!isEditing}     

                >
                  {/* <option value=""></option> */}
                  <option value="Main Branch">Main Branch</option>
                  <option value="Branch">Branch</option>
                </select>
                <label
                  htmlFor="branchType"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
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

            </div>

            {/* Column 2 */}
            <div className="global-ref-textbox-group-div-ui">

              

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  id="address"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`} 
                  
                  value={editingBranch?.branchAddr1 || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, branchAddr1: e.target.value })
                  }
                  disabled={!isEditing}  

                />
                <label
                  htmlFor="address"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Address
                </label>
              </div>

              {/* Zip Code */}
              <div className="relative">
                <input
                  type="text"
                  id="zipCode"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`} 
                  value={editingBranch?.zipCode || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, zipCode: e.target.value })
                  }
                  disabled={!isEditing}  

                />
                <label
                  htmlFor="zipCode"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Zip Code
                </label>
              </div>

 {/* TIN */}
              <div className="relative">
              <input
                type="text"
                id="tin"
                placeholder=" "
                className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`} 
                
                  value={editingBranch?.branchTin || ""}
                  onChange={(e) => {
                  const value = e.target.value;
                  const sanitized = value.replace(/[^0-9-]/g, '');
                  setEditingBranch({ ...editingBranch, branchTin: sanitized });
                  }}
                  disabled={!isEditing}  
              />

                <label
                  htmlFor="tin"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  <span className="global-ref-asterisk-ui"> * </span>
                  Tax Identification Number (TIN)
                </label>
              </div>

            </div>

            {/* Column 3 */}
            <div className="global-ref-textbox-group-div-ui">
    
              {/* Telephone No. */}
              <div className="relative">
                <input
                  type="text"
                  id="telNo"
                  placeholder=" "
                  className={`peer global-ref-textbox-ui
                    ${isEditing 
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`} 
                  value={editingBranch?.telNo || ""}
                  onChange={(e) =>
                  setEditingBranch({ ...editingBranch, telNo: e.target.value })
                  }
                  disabled={!isEditing}
                />
                <label
                  htmlFor="zipCode"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
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
                      ? 'global-ref-textbox-enabled' 
                      : 'global-ref-textbox-disabled'
                    }`} 
                  value={editingBranch?.faxNo || ""}
                  onChange={(e) =>
                    setEditingBranch({ ...editingBranch, faxNo: e.target.value })
                  }
                  disabled={!isEditing} 
                />
                <label
                  htmlFor="zipCode"
                  className={`global-ref-floating-label
                  ${!isEditing ? 'global-ref-label-disabled' : 'global-ref-label-enabled'}`}
                >
                  Fax No.
                </label>
              </div>

            </div>
          </div>

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
                      // { key: "branchID", label: "Branch ID" },
                      { key: "branchName", label: "Branch Name" },
                      { key: "main", label: "Branch Type" },
                      { key: "Address", label: "Address" },
                      { key: "branchTin", label: "TIN" },
                      { key: "telNo", label: "Telephone No." },
                      { key: "faxNo", label: "Fax No." },
                      { key: "zipCode", label: "Zip Code" },
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
        {/* <td className="global-ref-td-ui">{branch.branchID || "-"}</td> */}
        <td className="global-ref-td-ui">{branch.branchName}</td>
        <td className="global-ref-td-ui">{branch.main}</td>
        <td className="global-ref-td-ui">{branch.branchAddr1 || "-"}</td>
        <td className="global-ref-td-ui">{branch.branchTin}</td>
        <td className="global-ref-td-ui">{branch.telNo || "-"}</td>
        <td className="global-ref-td-ui">{branch.faxNo || "-"}</td>
        <td className="global-ref-td-ui">{branch.zipCode || "-"}</td>
        <td className="global-ref-td-ui">{branch.active}</td>
        <td className="global-ref-td-ui text-center sticky right-10">
                      <button
                        className="global-ref-td-button-edit-ui"
                        onClick={() => handleEditRow(index)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
        </td>
        <td className="global-ref-td-ui text-center sticky right-0">
                      <button
                        className="global-ref-td-button-delete-ui"
                        onClick={() => handleDeleteBranch(index)}
                        >            
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="13" className="global-ref-norecords-ui">
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

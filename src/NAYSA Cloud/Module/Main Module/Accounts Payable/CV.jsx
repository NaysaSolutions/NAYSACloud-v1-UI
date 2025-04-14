import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import Swal from 'sweetalert2';

const CV = () => {

  const [detailData, setDetailData] = useState([]);
  const [isFetchDisabled, setIsFetchDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSpecs, setCurrentSpecs] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [activeTab, setActiveTab] = useState("basic"); // State for active tab


  const [header, setHeader] = useState({
    apv_date: "",
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]; // Format:<ctrl3348>-MM-DD
    setHeader((prev) => ({ ...prev, apv_date: today }));
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen font-roboto">

      <h1 className="text-center justify-center font-black text-4xl mb-4 mt-[-30px] font-robotoMono">CHECK VOUCHER</h1>
      {/* Form Layout with Tabs */}
      <div className="bg-white shadow-md rounded-lg p-4">
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'check' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('check')}
          >
            Check Information
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === 'basic' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-4"> {/* Added gap-y-4 for vertical spacing */}
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="BranchCode"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                    disabled
                  />
                  <label
                    htmlFor="BranchCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Branch
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    CV No.
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="date"
                    id="APVDate"
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                    value={header.apv_date}
                  />
                  <label
                    htmlFor="APVDate"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    CV Date
                  </label>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="payeeCode"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="payeeCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payee Code
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="payeeName"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="payeeName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payee Name
                  </label>
                </div>
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="refAPV"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="refAPV"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    with Ref APV
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>
                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="apType"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="apType"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    AP Type
                  </label>
                </div>
                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="refDocNo"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="refDocNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Ref Doc No.
                  </label>
                </div>
              </div>

              {/* Column 4 - Remarks */}
              <div className="col-span-full"> 
                <div className="relative w-full mt-4">
                  <textarea
                    id="remarks"
                    placeholder=""
                    rows={10} 
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pt-4 pb-2.5 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0 resize-none"
                  />
                  <label
      htmlFor="remarks"
      className="absolute left-2.5 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600"
    >
                    Remarks
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4">
              {/* Column 3 */}
              <div className="space-y-4">
              <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Bank Name
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currName"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Bank Account No.
                  </label>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currName"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Payment Type
                  </label>
                </div>
              </div>

              {/* Column 4 */}
              <div className="space-y-4">

              <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check No.
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Date
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currName"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Check Amount(Orig)
                  </label>
                </div>
              </div>

              {/* Column 5 */}
              <div className="space-y-4">

              <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="APVNo"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="APVNo"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Currency
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currCode"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currCode"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    Currency Rate
                  </label>
                  <button
                    className={`absolute inset-y-0 right-0 w-[40px] h-[48px] ${
                      isFetchDisabled ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700"
                    } text-white rounded-r-lg flex items-center justify-center focus:outline-none`}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </button>
                </div>

                <div className="relative w-[250px]">
                  <input
                    type="text"
                    id="currName"
                    placeholder=" "
                    className="peer block w-full appearance-none rounded-lg border border-gray-400 bg-white px-2.5 pb-2.5 pt-4 text-sm text-black focus:border-blue-600 focus:outline-none focus:ring-0"
                  />
                  <label
                    htmlFor="currName"
                    className="absolute start-1 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-600"
                  >
                    AP Type
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <br />

      {/* Invoice Details Button */}
      <div className="flex items-center space-x-8 border-b-2 pb-2 mb-4">
        <button className="flex items-center text-gray-900 border-b-4 border-blue-600 pb-1">
          <span className="font-semibold">Invoice Details</span>
        </button>
      </div>

      {/* Invoice Details Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full table-auto border-collapse">
        <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">LN</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">AP Type</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">APV No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">RR No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">PO No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Invoice No.</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Invoice Date</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">AP Amount</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Currency</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Currency Rate</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Applied</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Unapplied</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Balance</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">DR Account</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">RC Code</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">AP Account</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">AP LN</th>
              <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 nowrap-header">Action</th>
            </tr>
          </thead>
          <tbody>
  {detailData.map((item, index) => (
    <tr key={index}>
      {/* LN */}
      <th className="px-4 py-2 border-b text-sm text-gray-600">
  {(index + 1).toString().padStart(3, '0')}
</th>

      {/* Item Code */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">{item.item_no}</td>

      {/* Item Description */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">{item.item_desc}</td>

      {/* Specification (Editable) */}
      <td
                className="px-4 py-2 border-b text-sm text-gray-600"
                onDoubleClick={() => handleDoubleClick(index, item.specs)}
              >
                {item.specs}
              </td>

       {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-xl mb-4">Edit Specifications</h2>
            <textarea
              value={currentSpecs}
              onChange={(e) => setCurrentSpecs(e.target.value)}
              className="w-full h-[200px] p-2 mb-4 border rounded-md border-gray-300 "
              rows="4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveSpecs}
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
              >
                Save
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UOM */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">{item.uom_code}</td>

      {/* PO Quantity */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">{item.qty_order}</td>

      {/* RR Quantity (Editable) */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">
  <input
    type="number"
    value={item.quantity ?? item.qty_order ?? ""}
    onChange={(e) => {
      const updatedDetailData = [...detailData];
      const inputValue = e.target.value;

      updatedDetailData[index].quantity = inputValue === "" ? "" : parseFloat(inputValue);
      setDetailData(updatedDetailData);

      if (inputValue === "" || isNaN(parseFloat(inputValue))) return;

      const inputQty = parseFloat(inputValue);

      if (inputQty > item.qty_order) {
        Swal.fire({
          title: "Validation Error",
          text: "RR Quantity cannot exceed PO Quantity.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          const updatedDetailData = [...detailData];
          updatedDetailData[index].quantity = item.qty_order; 
          setDetailData(updatedDetailData);
        });
      }
    }}
    className="w-[100px] p-1 text-sm"
  />
</td>
      {/* Lot No (Editable) */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">
        <input
          type="text"
          value={item.lot_no || ""}
          onChange={(e) => {
            const updatedDetailData = [...detailData];
            updatedDetailData[index].lot_no = e.target.value;
            setDetailData(updatedDetailData);
          }}
          className="w-[100px] p-1 text-sm"
        />
      </td>

      {/* BB Date (Editable) */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">
        <input
          type="date"
          value={item.bb_date || ""}
          onChange={(e) => {
            const updatedDetailData = [...detailData];
            updatedDetailData[index].bb_date = e.target.value;
            setDetailData(updatedDetailData);
          }}
          className="w-[120px] p-1 text-sm"
        />
      </td>

      {/* QC Status (Editable) */}
      <td className="px-4 py-2 border-b text-sm text-gray-600">
        <select
          value={item.qs_code || ""}
          onChange={(e) => {
            const updatedDetailData = [...detailData];
            updatedDetailData[index].qs_code = e.target.value;
            setDetailData(updatedDetailData);
          }}
          className="w-[100] p-1 text-sm"
        >
          <option value="" disabled>
          </option>
          <option value="Good">Good</option>
          <option value="Bad">Bad</option>
          <option value="Hold">Hold</option>
        </select>
      </td>

     {/* Warehouse */}
<td className="px-4 py-2 border-b text-sm text-gray-600">
  {selectedWarehouse} 
</td>

{/* Location */}
<td className="px-4 py-2 border-b text-sm text-gray-600">
  {selectedLocation}
</td>

      <td className="px-4 py-2 border-b text-sm text-gray-600">
  <button className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 flex items-center justify-center"
  onClick={() => handleDeleteRow(index)}>
    <FontAwesomeIcon icon={faTrashAlt} />
  </button>
</td>
    </tr>
    
  ))}
</tbody>
        </table>
        
      </div>
    </div>
  );
};

export default CV;
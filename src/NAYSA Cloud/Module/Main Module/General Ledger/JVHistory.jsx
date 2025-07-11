import React, { useState, useEffect } from "react";
import { subDays, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faPen,
  faCalendarAlt,
  faFilter,
  faFileAlt,
  faDownload,
  faRedo,
} from "@fortawesome/free-solid-svg-icons";

Modal.setAppElement('#root');


const JVHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dates, setDates] = useState([null, null]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("Last 7 Days");
  const [status, setStatus] = useState("All");
  const [data, setData] = useState([]);
  const [branchCode] = useState("00000");

  useEffect(() => {
  const today = new Date();
  if (dateRangeType === "Last 7 Days") {
    setDates([subDays(today, 6), today]);
  } else if (dateRangeType === "Last 30 Days") {
    setDates([subDays(today, 29), today]);
  } else if (dateRangeType === "Custom Range") {
    setDates([null, null]);
  }
}, [dateRangeType]);


  const fetchData = async () => {
  try {
    if (!dates[0] || !dates[1]) {
      console.warn("Start and end dates must be selected before fetching data.");
      return;
    }

    const [startDate, endDate] = dates;
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");

    const payload = {
      json_data: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        branchCode: branchCode,
      },
    };

    console.log("Sent Payload:", JSON.stringify(payload, null, 2));

    const response = await axios.post("http://127.0.0.1:8000/api/load-history", payload);

    console.log("API Response:", response.data);

    setData(response.data.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const handleRowClick = async (row) => {
  try {
    const payload = {
      json_data: {
        "branchCode": row.branchCode,
        "jvNo": row.jvNo
      }
    };

    const response = await axios.post("http://127.0.0.1:8000/api/getJV", payload);

    if (response.data.success) {
      // Parse the API response
      const result = JSON.parse(response.data.data[0].result);
      
      // Navigate to the APV route with the transaction data
      navigate("/", {  // Make sure this matches your route for the APV component
        state: {
          transactionData: result,
          isFromHistory: true
        }
      });
    }
  } catch (error) {
    console.error("Error fetching transaction:", error);
    // Add error handling (e.g., show a toast notification)
  }
};


useEffect(() => {
  if (location.state?.transactionData && location.state?.isFromHistory) {
    const transaction = location.state.transactionData;
    
    // Set header information
    setHeader({
      jv_date: transaction.jvDate || new Date().toISOString().split('T')[0],
      remarks: transaction.remarks || "",
      refDocNo1: transaction.refjvNo1 || "",
      refDocNo2: transaction.refjvNo2 || ""
    });

    // Set document information
    setdocumentNo(transaction.jvNo || "");
    setbranchCode(transaction.branchCode || "");
    setBranchName(transaction.branchName || "");
    setCurrencyCode(transaction.currCode || "PHP");
    setCurrencyRate(transaction.currRate?.toString() || "1.000000");
    setSelectedApType(transaction.jvType || "jv01");
   
    // Set GL rows if they exist
    if (transaction.dt2) {
      const formattedGLRows = transaction.dt2.map((item, index) => ({
        id: index + 1,
        acctCode: item.acctCode || "",
        rcCode: item.rcCode || "",
        sltypeCode: item.sltypeCode || "",
        slCode: item.slCode || "",
        particular: item.particular || `JV ${transaction.jvNo} - ${transaction.vendName || "Vendor"}`,
        vatCode: item.vatCode || "",
        vatName: item.vatName || "",
        atcCode: item.atcCode || "",
        atcName: item.atcName || "",
        debit: parseFloat(item.debit || 0).toFixed(2),
        credit: parseFloat(item.credit || 0).toFixed(2),
        slRefNo: item.slrefNo || "",
        slrefDate: item.slrefDate?.split('T')[0] || "",
        remarks: item.remarks || transaction.remarks || "",
        dt1Lineno: item.dt1Lineno || ""
      }));
      setDetailRowsGL(formattedGLRows);
    }

    // Disable document number editing since this is an existing document
    setIsDocNoDisabled(true);
  }
}, [location.state]);

useEffect(() => {
  const fromHistory = sessionStorage.getItem("fromHistory");
  if (!fromHistory) {
    fetchData(); // Only fetch if not returning from history
  } else {
    sessionStorage.removeItem("fromHistory"); // reset it
  }
}, []);


const handleReset = () => {
  const today = new Date();
  setDateRangeType("Last 7 Days");
  setDates([subDays(today, 6), today]);
  setStatus("All");
  setSearchFields({});
  setData([]);
};



  const formatDateRange = (start, end) => {
    if (start && end) {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
    return "";
  };

  const handleExport = () => {
  const exportData = filteredData.map((row) => {
    const exportRow = {};
    columns.forEach(({ key, label }) => {
      exportRow[label] = row[key];
    });
    return exportRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "JV History");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const dataBlob = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(dataBlob, "JV_History.xlsx");
};



  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

const handleSort = (key) => {
  let direction = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });

  const sortedData = [...data].sort((a, b) => {
    if (a[key] === null) return 1;
    if (b[key] === null) return -1;
    if (a[key] === b[key]) return 0;

    return direction === 'asc'
      ? a[key] > b[key]
        ? 1
        : -1
      : a[key] < b[key]
      ? 1
      : -1;
  });

  setData(sortedData);
};

const columns = [
  { key: "branchCode", label: "Branch" },
  { key: "jvNo", label: "JV No" },
  { key: "jvDate", label: "JV Date" },
  { key: "jvtranType", label: "JV Type" },
  { key: "jvAmount", label: "JV Amount" },
  { key: "currCode", label: "Currency Code" },
  { key: "currRate", label: "Currency Rate" },
  { key: "remarks", label: "Particular" },
  { key: "jvStatus", label: "Status" },
  { key: "preparedBy", label: "Prepared By" },
  { key: "dateStamp", label: "Date Stamp" },
  { key: "timeStamp", label: "Time Stamp" },
];

const [searchFields, setSearchFields] = useState({});

const handleSearchChange = (e, key) => {
  const { value } = e.target;
  setSearchFields((prev) => ({ ...prev, [key]: value }));
};

// Filter data based on inputs
const filteredData = data.filter((row) =>
  Object.entries(searchFields).every(([key, value]) =>
    row[key]?.toString().toLowerCase().includes(value.toLowerCase())
  )
);
 

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-roboto">
      <div className="flex items-center space-x-8 border-b-2 pb-4 mb-4">
        <button
          className={`flex items-center pb-1 ${
            location.pathname === "/"
              ? "text-blue-600 border-b-4 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => navigate("/")}
        >
          <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
          <span className="font-semibold">Transaction Details</span>
        </button>
        <button
          className={`flex items-center pb-1 ${
            location.pathname === "/history"
              ? "text-blue-600 border-b-4 border-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => navigate("/history")}
        >
          <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
          <span className="font-semibold">Transaction History</span>
        </button>
      </div>

      {/* Filters Section */}
<div className="flex flex-wrap gap-4 mb-4 overflow-x-auto">
  <div className="min-w-[300px]">
    <label className="block text-sm font-medium text-gray-600 mb-1">Date Range:</label>
    <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white">
      <select
        className="border-none focus:ring-0 text-sm bg-transparent pr-2"
        value={dateRangeType}
        onChange={(e) => setDateRangeType(e.target.value)}
      >
        <option>Last 7 Days</option>
        <option>Last 30 Days</option>
        <option>Custom Range</option>
      </select>
      <div className="flex items-center border-l border-gray-300 pl-2">
        <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400 mr-2" />
        <input
          type="text"
          value={formatDateRange(dates[0], dates[1])}
          onClick={() => {
            if (dateRangeType === "Custom Range") setModalIsOpen(true);
          }}
          className="w-full h-[30px] border-none focus:ring-0 text-sm bg-transparent text-gray-500 cursor-pointer"
          placeholder="Select date range"
          readOnly
        />
      </div>
    </div>
  </div>

  <div className="min-w-[200px]">
    <label className="block text-sm font-medium text-gray-600 mb-1">Status:</label>
    <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white">
      <FontAwesomeIcon icon={faFilter} className="text-gray-400 mr-2" />
      <select
        className="w-full h-[30px] border-none focus:ring-0 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option>All</option>
        <option>Open</option>
        <option>Closed</option>
        <option>Cancelled</option>
        <option>Posted</option>
      </select>
    </div>
  </div>

        <div className="w-[250px]">
          <label className="block text-sm font-medium text-gray-600 mb-1">Document Number Range:</label>
          <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white">
            <FontAwesomeIcon icon={faFileAlt} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="00000001 - 00000010"
              className="w-full h-[30px] border-none bg-white text-sm text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 ml-auto">
          <button
            className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600"
            onClick={handleExport}
          >
            <FontAwesomeIcon icon={faDownload} className="mr-2" />
            EXPORT
          </button>
          <button
            className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600"
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faRedo} className="mr-2" />
            RESET
          </button>
        </div>
      </div>

      {/* <div className="mt-4">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 bg-white rounded-t-lg">
          Receiving Summary
        </button>
        <button className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 bg-white rounded-t-lg">
          Receiving Details
        </button>
      </div> */}



      {/* Table Display */}
<div className="mt-6 bg-white shadow-lg rounded-xl overflow-hidden">
  <div className="overflow-x-auto bg-white shadow-lg rounded-xl max-h-[70vh]">
    <table className="min-w-[1800px] text-[13px] text-center border-collapse border border-gray-300">
      <thead className="text-[15px]">
        {/* Header row for column labels */}
        <tr className="bg-blue-700 text-white sticky top-0 z-30">
          {columns.map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="px-3 py-2 border cursor-pointer whitespace-nowrap"
            >
              <div className="flex items-center justify-center gap-1">
                {label}
                {sortConfig.key === key && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === "asc" ? "arrow-up" : "arrow-down"}
                    className="text-xs"
                  />
                )}
              </div>
            </th>
          ))}
        </tr>

        {/* Filter row */}
        <tr className="bg-gray-100 sticky top-[36px] z-20">
          {columns.map(({ key }) => (
            <td key={key} className="px-2 py-1 border whitespace-nowrap">
              <input
                type="text"
                value={searchFields[key] || ""}
                onChange={(e) => handleSearchChange(e, key)}
                placeholder="Filter"
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-[10px]"
              />
            </td>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-gray-200">
        {filteredData.length > 0 ? (
          filteredData.map((row, index) => (
            <tr
              key={index}
              className="hover:bg-blue-50 transition cursor-pointer"
              onClick={() => handleRowClick(row)}
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className="px-3 py-2 border whitespace-nowrap text-left text-blue-800"
                  title={row[key]}
                >
                  {key === "jvDate" || key === "dateStamp"
                    ? row[key]?.split("T")[0]
                    : key === "convertedAmount"
                    ? row[key] || row["jvAmount"]
                    : row[key] || "—"}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className="text-center text-gray-500 py-4 border"
            >
              No data available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
{/* Date Picker Modal */}
<Modal
  isOpen={modalIsOpen}
  onRequestClose={() => setModalIsOpen(false)}
  className="bg-white rounded-lg p-6 max-w-md mx-auto mt-40 border border-gray-300 shadow-lg outline-none"
  overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
>
  <h2 className="text-lg font-semibold mb-4">Select Custom Date Range</h2>
  <DatePicker
  selectsRange
  startDate={dates[0]}
  endDate={dates[1]}
  onChange={(update) => {
    setDates(update);  // `update` is an array: [start, end]
  }}
  inline
/>


  <div className="flex justify-end mt-4 gap-2">
    <button
      onClick={() => setModalIsOpen(false)}
      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded-md"
    >
      Cancel
    </button>
    <button
      onClick={() => {
        if (dates[0] && dates[1]) {
          setModalIsOpen(false);
          fetchData(); // Automatically fetch after picking range
        }
      }}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
    >
      Apply
    </button>
  </div>
</Modal>

    </div>
  );
};

export default JVHistory;

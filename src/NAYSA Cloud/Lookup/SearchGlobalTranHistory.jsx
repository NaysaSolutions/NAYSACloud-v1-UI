// SVIHistory.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { subDays, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faList,
  faPen,
  faCalendarAlt,
  faFilter,
  faDownload,
  faRedo,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";

// App utilities
import { fetchData } from "@/NAYSA Cloud/Configuration/BaseURL";
import { useSelectedHSColConfig } from "@/NAYSA Cloud/Global/selectedData";
import Header, { HeaderSpacer } from "@/NAYSA Cloud/Components/Header";



Modal.setAppElement("#root");

/* ---------------- Formatting helpers ---------------- */
const formatCellValue = (value, config) => {
  if (value === null || value === undefined) return "—";

  switch (config.renderType) {
    case "date": {
      try {
        const datePart = String(value).split("T")[0];
        return format(new Date(datePart), config.renderFormat || "MM/dd/yyyy");
      } catch {
        return String(value);
      }
    }
    case "currency":
    case "numeric": {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      const digits =
        typeof config.roundingOff === "number" ? config.roundingOff : 2;
      return num.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
    }
    case "status": {
      const map = {
        P: { text: "POSTED", color: "text-blue-600" },
        F: { text: "FINALIZED", color: "text-blue-800" },
        C: { text: "CANCELLED", color: "text-red-600" },
        "": { text: "OPEN", color: "text-black" },
      };
      const sty = map[value] || map[""];
      return <span className={sty.color + " font-semibold"}>{sty.text}</span>;
    }
    default:
      return String(value);
  }
};

/* -------------- Column config loader (supports dual shapes) -------------- */
const getColumnConfig = async (groupId) => {
  try {
    const response = await useSelectedHSColConfig(groupId);
    let config = [];

    if (Array.isArray(response)) {
      config = response;
    } else if (response?.success && response.data?.[0]?.result) {
      const parsed = JSON.parse(response.data[0].result || "[]");
      config = Array.isArray(parsed) ? parsed : [];
    } else if (Array.isArray(response?.data)) {
      config = response.data;
    }

    // normalize
    config = (config || []).map((c) => ({
      key: c.key,
      label:
        c.label ??
        String(c.key || "")
          .replace(/_/g, " ")
          .replace(/\b\w/g, (ch) => ch.toUpperCase()),
      classNames: c.classNames || "text-left",
      renderType: c.renderType || "text",
      renderFormat: c.renderFormat || "",
      roundingOff: typeof c.roundingOff === "number" ? c.roundingOff : 2,
      sortable: c.sortable !== false,
      hidden: Boolean(c.hidden),
    }));

    return config;
  } catch (err) {
    console.error("❌ Column config fetch failed for", groupId, err);
    return [];
  }
};

const AllTranHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};
  const backToPath = navState.backToPath ;
  const endpoint = navState.endpoint ;


  const [branchCode, setBranchCode] = useState(navState.branchCode);
  const [dateRangeType, setDateRangeType] = useState(
    navState.startDate && navState.endDate ? "Custom Range" : "Last 7 Days"
  );
  const [dates, setDates] = useState(() => {
    if (navState.startDate && navState.endDate) {
      return [new Date(navState.startDate), new Date(navState.endDate)];
    }
    return [subDays(new Date(), 6), new Date()];
  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [status, setStatus] = useState(
    typeof navState.status !== "undefined" ? navState.status : "All" // All | F | "" | C | P
  );
  const [searchFields, setSearchFields] = useState(
    navState.prefillSearchFields || {}
  );


  
  /* ---------------- Data/config state ---------------- */
  const [tabData, setTabData] = useState({});     // { tabKey: rows[] }
  const [tabConfigs, setTabConfigs] = useState({}); // { tabKey: columns[] }
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: null, direction: "asc", tabKey: null,
  });

  /* ---------------- Date presets ---------------- */
  useEffect(() => {
    const today = new Date();
    if (dateRangeType === "Last 7 Days") {
      setDates([subDays(today, 6), today]);
    } else if (dateRangeType === "Last 30 Days") {
      setDates([subDays(today, 29), today]);
    } // "Custom Range" is driven by modal
  }, [dateRangeType]);

  const formatDateRange = (start, end) =>
    start && end ? `${format(start, "MM/dd/yyyy")} - ${format(end, "MM/dd/yyyy")}` : "";

 
 
  /* ---------------- Columns for a tab ---------------- */
  const getColumnsForTab = useCallback(
    (tabKey) => {
      const dataForTab = tabData[tabKey] || [];
      const configured = tabConfigs[tabKey] || [];

      if (configured.length > 0) return configured.filter((c) => !c.hidden);
      if (dataForTab.length === 0) return [];

      // Fallback: derive columns from first row keys
      return Object.keys(dataForTab[0]).map((k) => ({
        key: k,
        label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        renderType: "text",
        sortable: true,
      }));
    },
    [tabData, tabConfigs]
  );

  const currentRows = tabData[activeTab] || [];
  const currentColumns = useMemo(
    () => getColumnsForTab(activeTab),
    [activeTab, getColumnsForTab]
  );



  /* ---------------- Filtered rows ---------------- */
  const filteredData = useMemo(() => {
    const base = currentRows.filter((row) =>
      Object.entries(searchFields).every(([key, value]) => {
        if (!value) return true;
        return String(row?.[key] ?? "")
          .toLowerCase()
          .includes(String(value).toLowerCase());
      })
    );

    if (status === "All") return base;

    const statusFieldCandidates = ["status", "doc_stat", "docStatus", "stat"];
    return base.filter((row) => {
      const rowStatus =
        statusFieldCandidates
          .map((f) => (row[f] !== undefined ? String(row[f]) : undefined))
          .find((v) => v !== undefined) ?? "";
      return rowStatus === status;
    });
  }, [currentRows, searchFields, status]);




  /* ---------------- Fetch history ---------------- */
  const fetchHistory = useCallback(async () => {
    if (!dates[0] || !dates[1]) return;

    setLoading(true);

    const [startDate, endDate] = dates;
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    const dataPayload = {
      json_data: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        branchCode: branchCode,
      },
    };

    try {
      const dataResponse = await fetchData(endpoint, dataPayload);

      if (!dataResponse?.success || !dataResponse.data?.length) {
        setTabData({});
        setTabConfigs({});
        setActiveTab(null);
        return;
      }

      const raw = dataResponse.data[0]?.result ?? "{}";
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse history result", e, raw);
        setTabData({});
        setTabConfigs({});
        setActiveTab(null);
        return;
      }

      // Normalize to { tabKey: rows[] }
      let rootDataMap = {};
      if (Array.isArray(parsed)) {
        rootDataMap = parsed.reduce((acc, item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            Object.assign(acc, item);
          }
          return acc;
        }, {});
      } else if (parsed && typeof parsed === "object") {
        rootDataMap = parsed;
      }



      // If wrapped as { rows: [...] }
      Object.keys(rootDataMap).forEach((k) => {
        const v = rootDataMap[k];
        if (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.rows)) {
          rootDataMap[k] = v.rows;
        }
      });



      const rootKeys = Object.keys(rootDataMap);
      if (rootKeys.length === 0) {
        setTabData({});
        setTabConfigs({});
        setActiveTab(null);
        return;
      }


      // Load column configs per tab
      const newTabConfigs = {};
      for (const key of rootKeys) {
        newTabConfigs[key] = await getColumnConfig(key);
      }

      setTabData(rootDataMap);
      setTabConfigs(newTabConfigs);

      const initialTabKey =
        (navState.activeTabKey && rootKeys.includes(navState.activeTabKey) && navState.activeTabKey) ||
        rootKeys[0];

      setActiveTab((prev) => (prev && rootKeys.includes(prev) ? prev : initialTabKey));
      setSearchFields((prev) =>
        Object.keys(prev).length ? prev : navState.prefillSearchFields || {}
      );
      setSortConfig({ key: null, direction: "asc", tabKey: initialTabKey });
    } catch (error) {
      console.error("Error fetching SVI history:", error);
      setTabData({});
      setTabConfigs({});
      setActiveTab(null);
    } finally {
      setLoading(false);
    }
  }, [dates, branchCode, endpoint, navState.activeTabKey, navState.prefillSearchFields]);


  useEffect(() => {
    if (navState.branchCode && navState.branchCode !== branchCode) {
      setBranchCode(navState.branchCode);
    }
  }, []);

  /* ---------------- UI handlers ---------------- */
  const handleSearchChange = (e, key) => {
    const { value } = e.target;
    setSearchFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc" &&
      sortConfig.tabKey === activeTab
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction, tabKey: activeTab });

    const dataToSort = tabData[activeTab] || [];
    const cols = getColumnsForTab(activeTab);
    const colConfig = cols.find((c) => c.key === key);
    const isNumeric =
      colConfig?.renderType === "numeric" || colConfig?.renderType === "currency";

    const sorted = [...dataToSort].sort((a, b) => {
      const valA = a?.[key];
      const valB = b?.[key];

      if (isNumeric) {
        const numA = Number(valA);
        const numB = Number(valB);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return direction === "asc" ? numA - numB : numB - numA;
        }
      }

      const sA = String(valA ?? "");
      const sB = String(valB ?? "");
      return direction === "asc" ? sA.localeCompare(sB) : sB.localeCompare(sA);
    });

    setTabData((prev) => ({ ...prev, [activeTab]: sorted }));
  };

  const handleReset = () => {
    setDateRangeType("Last 7 Days");
    setSearchFields({});
    setTabData({});
    setTabConfigs({});
    setActiveTab(null);
    setSortConfig({ key: null, direction: "asc", tabKey: null });
    setStatus("All");
    setDates([subDays(new Date(), 6), new Date()]);
  };

  const handleExport = () => {
    if (filteredData.length === 0 || !activeTab) return;

    const cols = getColumnsForTab(activeTab);
    const exportData = filteredData.map((row) => {
      const out = {};
      cols.forEach((col) => {
        const formattedValue = formatCellValue(row[col.key], col);
        out[col.label] =
          typeof formattedValue === "object" && formattedValue !== null
            ? formattedValue.props?.children ?? ""
            : formattedValue;
      });
      return out;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, (activeTab || "Sheet").toUpperCase());
    const buff = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buff], { type: "application/octet-stream" });
    saveAs(blob, `${activeTab}_History_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
  };


  /* ---------------- Table renderer ---------------- */
  const renderTableContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8 text-gray-500">
          Loading data and configurations...
        </div>
      );
    }

    const cols = currentColumns;

    if (!activeTab || cols.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Select a date range and click &apos;APPLY FILTER&apos; to load history.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl max-h-[70vh]">
        <table className="min-w-full text-[13px] text-center border-collapse border border-gray-300">
          <thead className="text-[15px]">
            {/* Header row */}
            <tr className="bg-blue-700 text-white sticky top-0 z-30">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-3 py-2 border whitespace-nowrap ${
                    col.sortable !== false ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {col.label}
                    {col.sortable !== false &&
                      sortConfig.key === col.key &&
                      sortConfig.tabKey === activeTab && (
                        <FontAwesomeIcon
                          icon={sortConfig.direction === "asc" ? faArrowUp : faArrowDown}
                          className="text-xs"
                        />
                      )}
                  </div>
                </th>
              ))}
            </tr>

            {/* Filter row */}
            <tr className="bg-gray-100 sticky top-[46px] z-20">
              {cols.map((col) => (
                <td key={col.key} className="px-2 py-1 border whitespace-nowrap">
                  <input
                    type="text"
                    value={searchFields[col.key] || ""}
                    onChange={(e) => handleSearchChange(e, col.key)}
                    placeholder="Filter"
                    className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-[10px]"
                  />
                </td>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-blue-50 transition cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  {cols.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2 border whitespace-nowrap ${col.classNames || "text-left"}`}
                      title={String(row?.[col.key] ?? "")}
                    >
                      {formatCellValue(row?.[col.key], col)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={cols.length} className="text-center text-gray-500 py-4 border">
                  No records found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  /* ---------------- JSX ---------------- */
  return (
    <>
      <Header
        activeTopTab="history"
        detailsRoute={backToPath}
        historyRoute="/page/AllTranHistory"
        showActions={false}
      />
      <HeaderSpacer /> 



      <div className="px-6 pb-8 bg-gray-100 min-h-screen font-roboto">
        {/* Local page title row (optional) */}
        <div className="flex items-center space-x-8 border-b-2 pb-4 mb-4">
          <button
            className="flex items-center pb-1 text-gray-600 hover:text-blue-600"
            onClick={() => navigate(backToPath)}
          >
            <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
            <span className="font-semibold">Transaction Details</span>
          </button>
          <div className="flex items-center pb-1 text-blue-600 border-b-4 border-blue-600">
            <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
            <span className="font-semibold">Transaction History</span>
          </div>
        </div>


        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4 overflow-x-auto">
          {/* Date range */}
          <div className="min-w-[300px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Date Range:
            </label>
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

          {/* Status */}
          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Status:
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-2 py-1 bg-white">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400 mr-2" />
              <select
                className="w-full h-[30px] border-none focus:ring-0 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="F">FINALIZED</option>
                <option value="">OPEN</option>
                <option value="C">CANCELLED</option>
                <option value="P">POSTED</option>
              </select>
            </div>
          </div>

          {/* Apply Filter */}
          <div className="flex-shrink-0 w-full md:w-auto mt-auto">
            <button
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md w-full h-[38px]"
              onClick={fetchHistory}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {loading ? "LOADING..." : "APPLY FILTER"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 ml-auto">
            <button
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 h-[38px]"
              onClick={handleExport}
              disabled={loading || filteredData.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              EXPORT
            </button>
            <button
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 h-[38px]"
              onClick={handleReset}
            >
              <FontAwesomeIcon icon={faRedo} className="mr-2" />
              RESET
            </button>
          </div>
        </div>

        {/* Dynamic tabs */}
        <div className="mt-4 border-b border-gray-300 overflow-x-auto">
          {Object.keys(tabData).map((tabKey) => (
            <button
              key={tabKey}
              className={`py-2 px-4 text-sm font-semibold transition-colors duration-200 ${
                activeTab === tabKey
                  ? "border-b-4 border-blue-600 text-blue-700 bg-gray-50"
                  : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(tabKey);
                setSearchFields({});
                setSortConfig({ key: null, direction: "asc", tabKey });
              }}
            >
              {tabKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="mt-6 bg-white shadow-lg rounded-xl overflow-hidden">
          {renderTableContent()}
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
          onChange={(update) => setDates(update)}
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
                fetchHistory();
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          >
            Apply
          </button>
        </div>
      </Modal>
    </>
  );
};

export default AllTranHistory;

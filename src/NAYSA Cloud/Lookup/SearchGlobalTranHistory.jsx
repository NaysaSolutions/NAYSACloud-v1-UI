import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { postRequest } from "@/NAYSA Cloud/Configuration/BaseURL";
import { exportHistoryExcel } from "@/NAYSA Cloud/Global/report";
import { LoadingSpinner } from "@/NAYSA Cloud/Global/utilities.jsx";
import { subDays, format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faPen, faCalendarAlt, faFilter, faDownload, faRedo, faArrowUp, faArrowDown} from "@fortawesome/free-solid-svg-icons";

import { useReturnToDate } from "@/NAYSA Cloud/Global/dates";
import { useSelectedHSColConfig } from "@/NAYSA Cloud/Global/selectedData";
import Header, { HeaderSpacer } from "@/NAYSA Cloud/Components/Header";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";

Modal.setAppElement("#root");

/* ------------------ window-level cache (survives route swaps) ------------------ */
function getGlobalCache() {
  if (typeof window !== "undefined") {
    if (!window.__NAYSA_HISTORY_CACHE__) window.__NAYSA_HISTORY_CACHE__ = {};
    return window.__NAYSA_HISTORY_CACHE__;
  }
  return {};
}

/* ---------------- Formatting helpers ---------------- */
const formatCellValue = (value, config) => {
  if (value === null || value === undefined) return "—";
  switch (config.renderType) {
    case "date": {
      try {
        const datePart = String(value).split("T")[0];
        return useReturnToDate(datePart);
      } catch { return String(value); }
    }
    case "currency":
    case "number": {
      const num = Number(value);
      if (Number.isNaN(num)) return String(value);
      const digits = typeof config.roundingOff === "number" ? config.roundingOff : 2;
      return num.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    }
    case "status": {
      const map = {
        C: { text: "CLOSED",    color: "text-blue-600" },
        F: { text: "FINALIZED", color: "text-blue-800" },
        X: { text: "CANCELLED", color: "text-red-600" },
        "": { text: "OPEN",     color: "text-black" },
      };
      const sty = map[value] || map[""];
      return <span className={sty.color + " font-semibold"}>{sty.text}</span>;
    }
    default: return String(value);
  }
};

/* -------------- Column config loader -------------- */
const getColumnConfig = async (groupId) => {
  try {
    const response = await useSelectedHSColConfig(groupId);
    let config = [];
    if (Array.isArray(response)) config = response;
    else if (response && response.success && response.data && response.data[0] && response.data[0].result) {
      const parsed = JSON.parse(response.data[0].result || "[]");
      config = Array.isArray(parsed) ? parsed : [];
    } else if (response && Array.isArray(response.data)) {
      config = response.data;
    }
    config = (config || []).map((c) => ({
      key: c.key,
      label: c.label || String(c.key || "").replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()),
      classNames: c.classNames || "text-left",
      renderType: c.renderType || "text",
      renderFormat: c.renderFormat || "",
      roundingOff: typeof c.roundingOff === "number" ? c.roundingOff : undefined,
      sortable: c.sortable !== false,
      hidden: !!c.hidden,
    }));
    return config;
  } catch (err) {
    console.error("❌ Column config fetch failed for", groupId, err);
    return [];
  }
};

/* ============================== Component =============================== */
const AllTranHistory = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};
  const didInitRef = useRef(false);
  const hydratedFromCacheRef = useRef(false);
  const { user } = useAuth();

  const {
    endpoint: endpointProp,
    activeTabKey: activeTabKeyProp,
    branchCode: branchCodeProp,
    startDate: startDateProp,
    endDate: endDateProp,
    status: statusProp,                 // incoming status value from parent
    statusOptions: statusOptionsProp,   // incoming status options from parent
    prefillSearchFields: prefillProp,
    onRowDoubleClick,
    showHeader: showHeaderProp,
    cacheKey: cacheKeyProp,
    historyExportName: historyExportNameProp,
  } = props || {};

  const endpoint =
    (endpointProp !== undefined && endpointProp) ||
    (navState.endpoint !== undefined && navState.endpoint);

  const baseKey =
    (typeof cacheKeyProp === "string" && cacheKeyProp) ||
    (typeof endpoint === "string" && endpoint) ||
    "HISTORY";

  const backToPath = navState.backToPath;
  const embedded =
    typeof onRowDoubleClick === "function" ||
    endpointProp !== undefined ||
    cacheKeyProp !== undefined;

  const showHeader = showHeaderProp !== undefined ? showHeaderProp : !embedded;

  /* -------- status options from parent (fallback if not provided) -------- */
  const fallbackStatusOptions = [
    { value: "All", label: "All Statuses" },
    { value: "F",   label: "FINALIZED" },
    { value: "",    label: "OPEN" },
    { value: "X",   label: "CANCELLED" },
    { value: "C",   label: "CLOSED" },
  ];
  const statusOptions = Array.isArray(statusOptionsProp) && statusOptionsProp.length
    ? statusOptionsProp
    : fallbackStatusOptions;

  /* ---------------- Local state ---------------- */
  const [branchCode, setBranchCode] = useState(
    (branchCodeProp !== undefined && branchCodeProp) ||
    (navState.branchCode !== undefined && navState.branchCode) ||
    ""
  );

  const initialDates = () => {
    if (startDateProp && endDateProp) return [new Date(startDateProp), new Date(endDateProp)];
    if (navState.startDate && navState.endDate) return [new Date(navState.startDate), new Date(navState.endDate)];
    return [subDays(new Date(), 6), new Date()];
  };

  const [dateRangeType, setDateRangeType] = useState(
    (startDateProp && endDateProp) || (navState.startDate && navState.endDate)
      ? "Custom Range" : "Last 7 Days"
  );
  const [dates, setDates] = useState(initialDates());
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // Normalize: if parent sends "", we treat the initial UI as "All"
  const normalizeStatus = (v) => (v === "" ? "All" : (v ?? "All"));

  const [status, setStatus] = useState(() => normalizeStatus(statusProp));
  const [searchFields, setSearchFields] = useState(prefillProp || navState.prefillSearchFields || {});
  const [tabData, setTabData] = useState({});
  const [tabConfigs, setTabConfigs] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc", tabKey: null });

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
  }, []);

  /* ---------------- restore from window cache ---------------- */
  useEffect(() => {
    const cache = getGlobalCache();
    let snap = cache[baseKey];
    const incomingBranch = (branchCodeProp !== undefined && branchCodeProp) ||
                           (navState.branchCode !== undefined && navState.branchCode) ||
                           "";

    if (snap && incomingBranch && snap.branchCode && snap.branchCode !== incomingBranch) {
      delete cache[baseKey];
      snap = undefined;
    }

    if (snap) {
      hydratedFromCacheRef.current = true;
      setDates(snap.dates || initialDates());
      setDateRangeType(snap.dateRangeType || "Last 7 Days");
      // Priority: explicit prop -> cache -> default
      const desired = statusProp !== undefined ? normalizeStatus(statusProp)
                    : (snap.status !== undefined ? normalizeStatus(snap.status) : "All");
      setStatus(desired);
      setSearchFields(snap.searchFields || {});
      setTabData(snap.tabData || {});
      setTabConfigs(snap.tabConfigs || {});
      setActiveTab(snap.activeTab || null);
      setBranchCode((snap.branchCode !== undefined && snap.branchCode) || branchCode);
    } else {
      // No cache: still respect incoming prop for first render
      if (statusProp !== undefined) setStatus(normalizeStatus(statusProp));
    }
  }, [baseKey, statusProp, branchCode, branchCodeProp, navState.branchCode]);

  /* ---------------- keep cache updated on important changes ---------------- */
  useEffect(() => {
    const cache = getGlobalCache();
    cache[baseKey] = {
      dates, dateRangeType, status, searchFields,
      tabData, tabConfigs, activeTab, branchCode
    };
  }, [baseKey, dates, dateRangeType, status, searchFields, tabData, tabConfigs, activeTab, branchCode]);

  /* ---------------- date presets (don’t override hydrated state) ------------ */
  useEffect(() => {
    if (hydratedFromCacheRef.current) return;
    if (dateRangeType === "Last 7 Days") {
      const today = new Date(); setDates([subDays(today, 6), today]);
    } else if (dateRangeType === "Last 30 Days") {
      const today = new Date(); setDates([subDays(today, 29), today]);
    }
  }, [dateRangeType]);

  const formatDateRange = (start, end) =>
    start && end ? `${format(start, "MM/dd/yyyy")} - ${format(end, "MM/dd/yyyy")}` : "";

  /* ---------------- columns for a tab ---------------- */
  const getColumnsForTab = useCallback((tabKey) => {
    const dataForTab = tabData[tabKey] || [];
    const configured = tabConfigs[tabKey] || [];
    if (configured.length > 0) return configured.filter((c) => !c.hidden);
    if (dataForTab.length === 0) return [];
    return Object.keys(dataForTab[0]).map((k) => ({
      key: k,
      label: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      renderType: "text",
      sortable: true,
    }));
  }, [tabData, tabConfigs]);

  const currentRows = tabData[activeTab] || [];
  const currentColumns = useMemo(() => getColumnsForTab(activeTab), [activeTab, getColumnsForTab]);

  /* ---------------- filtered rows ---------------- */
  const filteredData = useMemo(() => {
    const base = currentRows.filter((row) =>
      Object.entries(searchFields).every(([key, value]) => {
        if (!value) return true;
        return String(row?.[key] ?? "").toLowerCase().includes(String(value).toLowerCase());
      })
    );
    if (status === "All") return base;

    const statusFieldCandidates = ["C", "doc_stat", "docStatus", "status", "stat"];
    return base.filter((row) => {
      const rowStatus =
        statusFieldCandidates
          .map((f) => (row[f] !== undefined ? String(row[f]) : undefined))
          .find((v) => v !== undefined) ?? "";
      return rowStatus === status;
    });
  }, [currentRows, searchFields, status]);

  /* ---------------- fetch on APPLY FILTER only ---------------- */
  const fetchHistory = useCallback(async () => {
    if (!dates[0] || !dates[1]) return;
    setLoading(true);

    const [startDate, endDate] = dates;
    const payload = {
      json_data: {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        branchCode: branchCode,
      },
    };

  
    try {
      const dataResponse = await postRequest(endpoint, JSON.stringify(payload));
      const raw = dataResponse && dataResponse.data && dataResponse.data[0] && dataResponse.data[0].result ? dataResponse.data[0].result : "{}";
      let parsed;
      try { parsed = JSON.parse(raw); } catch (e) {
        console.error("Failed to parse history result", e, raw);
        setTabData({}); setTabConfigs({}); setActiveTab(null);
        return;
      }

      // normalize to { tabKey: rows[] }
      let rootDataMap = {};
      if (Array.isArray(parsed)) {
        rootDataMap = parsed.reduce((acc, item) => {
          if (item && typeof item === "object" && !Array.isArray(item)) Object.assign(acc, item);
          return acc;
        }, {});
      } else if (parsed && typeof parsed === "object") {
        rootDataMap = parsed;
      }

      // unwrap { rows: [...] }
      Object.keys(rootDataMap).forEach((k) => {
        const v = rootDataMap[k];
        if (v && typeof v === "object" && !Array.isArray(v) && Array.isArray(v.rows)) {
          rootDataMap[k] = v.rows;
        }
      });

      const rootKeys = Object.keys(rootDataMap);

      const newTabConfigs = {};
      for (const key of rootKeys) {
        newTabConfigs[key] = await getColumnConfig(key);
      }

      setTabData(rootDataMap);
      setTabConfigs(newTabConfigs);

      const initialTabKey =
        (activeTabKeyProp && rootKeys.includes(activeTabKeyProp) && activeTabKeyProp) ||
        (navState.activeTabKey && rootKeys.includes(navState.activeTabKey) && navState.activeTabKey) ||
        rootKeys[0] || null;

      setActiveTab((prev) => (prev && rootKeys.includes(prev) ? prev : initialTabKey));
      setSearchFields((prev) => (Object.keys(prev).length ? prev : prefillProp || navState.prefillSearchFields || {}));
      setSortConfig({ key: null, direction: "asc", tabKey: initialTabKey });

      // snapshot cache
      const cache = getGlobalCache();
      cache[baseKey] = {
        dates, dateRangeType, status,
        searchFields: prefillProp || navState.prefillSearchFields || {},
        tabData: rootDataMap,
        tabConfigs: newTabConfigs,
        activeTab: initialTabKey,
        branchCode
      };
      hydratedFromCacheRef.current = true;
    } catch (error) {
      console.error("Error fetching history:", error);
      setTabData({}); setTabConfigs({}); setActiveTab(null);
    } finally {
      setLoading(false);
    }
  }, [
    dates, branchCode, endpoint,
    activeTabKeyProp, prefillProp, navState.activeTabKey, navState.prefillSearchFields,
    baseKey, dateRangeType, status
  ]);

  /* ---------------- handlers ---------------- */
  const handleSearchChange = (e, key) => {
    const { value } = e.target;
    setSearchFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc" && sortConfig.tabKey === activeTab) {
      direction = "desc";
    }
    setSortConfig({ key, direction, tabKey: activeTab });

    const dataToSort = tabData[activeTab] || [];
    const cols = getColumnsForTab(activeTab);
    const colConfig = cols.find((c) => c.key === key);
    const isNumeric = colConfig && (colConfig.renderType === "number" || colConfig.renderType === "currency");

    const sorted = [...dataToSort].sort((a, b) => {
      const valA = a && a[key]; const valB = b && b[key];
      if (isNumeric) {
        const numA = Number(valA); const numB = Number(valB);
        if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
          return direction === "asc" ? numA - numB : numB - numA;
        }
      }
      const sA = String(valA ?? ""); const sB = String(valB ?? "");
      return direction === "asc" ? sA.localeCompare(sB) : sB.localeCompare(sA);
    });

    setTabData((prev) => ({ ...prev, [activeTab]: sorted }));
  };

  const handleResetUI = () => {
    hydratedFromCacheRef.current = false;
    const today = new Date();
    setDateRangeType("Last 7 Days");
    setDates([subDays(today, 6), today]);
    setSearchFields({});
    setStatus("All");
  };

  // Row color by status in row (X=red, C|F=blue, else default)
  const getRowClassByStatus = (row) => {
    const statusFieldCandidates = ["C", "doc_stat", "docStatus", "status", "stat"];
    const rowStatus = statusFieldCandidates
      .map((f) => (row[f] !== undefined ? String(row[f]) : undefined))
      .find((v) => v !== undefined) ?? "";

    if (rowStatus === "X") return "text-red-600";
    if (rowStatus === "C" || rowStatus === "F") return "text-blue-700";
    return "";
  };

  /* ---------------- Export helpers ---------------- */
  const tabToSheet = (tabKey) => {
    const cols = getColumnsForTab(tabKey);
    const headers = cols.map(c => c.label || c.key);

    const rows = (tabData[tabKey] || []).map((row) => {
      const obj = {};
      cols.forEach((col) => {
        const header = col.label || col.key;
        const val = formatCellValue(row[col.key], col);
        obj[header] = React.isValidElement(val)
          ? (val.props?.children ?? "")
          : val;
      });
      return obj;
    });
    const sheetName = tabKey
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 31);

    return { sheetName, headers, rows };
  };

  const buildJsonSheets = () =>
    Object.keys(tabData || {}).map((tabKey) => tabToSheet(tabKey));

  function toTabbedJson( jsonSheets) {
    const data = {};
    for (const tab of jsonSheets || []) {
      const key = tab.sheetName || "Sheet";
      data[key] = Array.isArray(tab.rows) ? tab.rows : [];
    }
    return {
      Data: data,
    };
  }

  const exportName =
    historyExportNameProp ??
    (location.state && location.state.historyExportName) ??
    "Transaction History";

  const handleExport = async () => {
    const tabKeys = Object.keys(tabData || {});
    if (!tabKeys.length) {
      alert("No data to export. Please Apply Filter first.");
      return;
    }
    setExporting(true);

    const reportName = exportName;
    const start = dates?.[0] ? format(dates[0], "yyyy-MM-dd") : null;
    const end   = dates?.[1] ? format(dates[1], "yyyy-MM-dd") : null;

    const sheets = buildJsonSheets();
    const jsonData = toTabbedJson(sheets);

  
    const payload = {
      ReportName: reportName,
      UserCode:   user?.USER_CODE,
      Branch:     branchCode || "",
      StartDate:  start,
      EndDate:    end,
      JsonData:   jsonData,
    };

    await exportHistoryExcel ("/exportHistoryReport",JSON.stringify(payload),setExporting,reportName);
  };

  
  
    
  const handleRowDoubleClick = useCallback((row) => {
    const docNo = row?.docNo ?? row?.documentNo ?? row?.DOC_NO ?? "";
    const bcode = row?.branchCode ?? row?.BRANCH_CODE ?? "";
    if (!docNo || !bcode) return;

    if (typeof onRowDoubleClick === "function") {
      onRowDoubleClick({ ...row, docNo, branchCode: bcode });
    } else {
      navigate(backToPath, { state: { docNo, branchCode: bcode }, replace: true });
    }
  }, [onRowDoubleClick, navigate, backToPath]);

  /* ---------------- table renderer ---------------- */
  const renderTableContent = () => {
    if (loading) return <div className="text-center py-8 text-gray-500">Loading data and configurations...</div>;
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
            <tr className="bg-blue-700 text-white sticky top-0 z-30">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  className={`px-3 py-2 border whitespace-nowrap ${col.sortable !== false ? "cursor-pointer" : ""}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortConfig.key === col.key && sortConfig.tabKey === activeTab && (
                      <FontAwesomeIcon icon={sortConfig.direction === "asc" ? faArrowUp : faArrowDown} className="text-xs" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
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
              filteredData.map((row, idx) => {
                const rowClass = getRowClassByStatus(row);
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-blue-50 transition cursor-pointer ${rowClass}`}
                    onDoubleClick={() => handleRowDoubleClick(row)}
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
                );
              })
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
      {showHeader && (
        <>
          <Header activeTopTab="history" detailsRoute={backToPath} historyRoute="/page/AllTranHistory" showActions={false} />
          <HeaderSpacer />
        </>
      )}

      <div className="mt-10 px-6 pb-8 bg-gray-100 min-h-screen font-roboto">
        {showHeader && (
          <div className="flex items-center space-x-8 border-b-2 pb-4 mb-4">
            <button className="flex items-center pb-1 text-gray-600 hover:text-blue-600" onClick={() => navigate(backToPath)}>
              <FontAwesomeIcon icon={faPen} className="w-4 h-4 mr-2" />
              <span className="font-semibold">Transaction Details</span>
            </button>
            <div className="flex items-center pb-1 text-blue-600 border-b-4 border-blue-600">
              <FontAwesomeIcon icon={faList} className="w-4 h-4 mr-2" />
              <span className="font-semibold">Transaction History</span>
            </div>
          </div>
        )}

        {/* Filters */}
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
                  onClick={() => { if (dateRangeType === "Custom Range") setModalIsOpen(true); }}
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
                {statusOptions.map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 ml-auto">
            <button
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 h-[38px]"
              onClick={handleExport}
              disabled={loading || exporting || filteredData.length === 0}
            >
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              EXPORT
            </button>
            <button
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 h-[38px]"
              onClick={handleResetUI}
              disabled={loading || exporting}
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
                activeTab === tabKey ? "border-b-4 border-blue-600 text-blue-700 bg-gray-50"
                                     : "text-gray-600 hover:text-blue-700 hover:bg-gray-100"
              }`}
              onClick={() => {
                setActiveTab(tabKey);
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
        <DatePicker selectsRange startDate={dates[0]} endDate={dates[1]} onChange={(update) => setDates(update)} inline />
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={() => setModalIsOpen(false)} className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded-md">Cancel</button>
          <button onClick={() => { if (dates[0] && dates[1]) setModalIsOpen(false); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md">
            Apply
          </button>
        </div>
      </Modal>

      {(loading || exporting) && <LoadingSpinner />}
    </>
  );
};

export default AllTranHistory;

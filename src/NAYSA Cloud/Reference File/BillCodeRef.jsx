// src/NAYSA Cloud/Reference File/BillCodeRef.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
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
  faSave,
  faUndo,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ------- Config / helpers ----------------------------------------------------
const API = axios.create({ baseURL: "http://localhost:8000/api" });
const req = (v) => String(v ?? "").trim().length > 0;
const includesCI = (hay, needle) =>
  String(hay ?? "").toLowerCase().includes(String(needle ?? "").toLowerCase());

// Props: reftables maps and guides are assumed to exist in your project
import {
  reftables,
  reftablesPDFGuide,
  reftablesVideoGuide,
} from "@/NAYSA Cloud/Global/reftable";

// ------- Component -----------------------------------------------------------
const BillCodeRef = () => {
  // Document meta
  const docType = "BillCode";
  const documentTitle = reftables[docType] || "Bill Codes";
  const pdfLink = reftablesPDFGuide[docType];
  const videoLink = reftablesVideoGuide[docType];

  // Data state
  const [billCode, setBillcodes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState(null);

  // UX state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpenExport, setOpenExport] = useState(false);
  const [isOpenGuide, setOpenGuide] = useState(false);

  // Table helpers
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("billCode");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Per-column filters
  const [columnFilters, setColumnFilters] = useState({
    billCode: "",
    billName: "",
    uom: "",
    arAcct: "",
    salesAcct: "",
    sdiscAcct: "",
    rcCode: "",
    active: "", // Y / N
  });

  // Refs for click-away
  const exportRef = useRef(null);
  const guideRef = useRef(null);

  // -------- Fetch ------------------------------------------------------------
  const fetchBillcodes = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/billCode");
      const resultString = data?.data?.[0]?.result;
      setBillcodes(resultString ? JSON.parse(resultString) : []);
    } catch (error) {
      console.error("Error fetching bill codes:", error);
      Swal.fire("Error", "Failed to load bill codes.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBillcodes();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideExport =
        exportRef.current && !exportRef.current.contains(event.target);
      const clickedOutsideGuide =
        guideRef.current && !guideRef.current.contains(event.target);
      if (clickedOutsideExport) setOpenExport(false);
      if (clickedOutsideGuide) setOpenGuide(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Ctrl+S
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving && isEditing) handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, isEditing, editing]);

  // -------- Derivations: search + filters + sort + pagination ---------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Global search (optional)
    const base = q 
      ? billCode.filter((b) =>
          [
            b.billCode,
            b.billName,
            b.uom,
            b.arAcct,
            b.salesAcct,
            b.sdiscAcct,
            b.rcCode,
            b.active,
          ].some((x) => String(x ?? "").toLowerCase().includes(q))
        )
      : billCode;

    // Per-column filters (all must match)
    const withColFilters = base.filter((b) => {
      const f = columnFilters;
      if (f.billCode && !includesCI(b.billCode, f.billCode)) return false;
      if (f.billName && !includesCI(b.billName, f.billName)) return false;
      if (f.uom && !includesCI(b.uom, f.uom)) return false;
      if (f.arAcct && !includesCI(b.arAcct, f.arAcct)) return false;
      if (f.salesAcct && !includesCI(b.salesAcct, f.salesAcct)) return false;
      if (f.sdiscAcct && !includesCI(b.sdiscAcct, f.sdiscAcct)) return false;
      if (f.rcCode && !includesCI(b.rcCode, f.rcCode)) return false;
      if (f.active && String(b.active ?? "") !== String(f.active)) return false;
      return true;
    });

    // Sort
    const factor = sortDir === "asc" ? 1 : -1;
    return [...withColFilters].sort((a, b) => {
      const A = String(a?.[sortBy] ?? "");
      const B = String(b?.[sortBy] ?? "");
      return A.localeCompare(B) * factor;
    });
  }, [billCode, query, columnFilters, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // -------- CRUD -------------------------------------------------------------
  const startNew = () => {
    setEditing({
      __existing: false,
      billCode: "",
      billName: "",
      uom: "",
      arAcct: "",
      salesAcct: "",
      sdiscAcct: "",
      rcCode: "",
      active: "Y", // or "1" depending on your backend
    });
    setIsEditing(true);
  };

  const handleEditRow = (index) => {
    const item = filtered[index + (page - 1) * pageSize]; // map visible index to original
    setEditing({ ...item, __existing: true });
    setIsEditing(true);
  };

  const resetForm = () => {
    setEditing(null);
    setIsEditing(false);
    setOpenExport(false);
    setOpenGuide(false);
    setPage(1);
  };

  const handleSave = async () => {
    if (!editing) return;

    const { billCode, billName, uom, arAcct, salesAcct, sdiscAcct, rcCode } =
      editing;

    // Validate requireds
    if (
      !req(billCode) ||
      !req(billName) ||
      !req(uom) ||
      !req(arAcct) ||
      !req(salesAcct) ||
      !req(sdiscAcct) ||
      !req(rcCode)
    ) {
      Swal.fire(
        "Missing data",
        "Please fill: Bill Code, Description, UOM, AR Account, Sales Account, Sales Discount Account, Responsibility Center.",
        "warning"
      );
      return;
    }

    const payload = {
      json_data: {
        billCode: editing.billCode,
        billName: editing.billName,
        uom: editing.uom,
        arAcct: editing.arAcct || "",
        salesAcct: editing.salesAcct || "",
        sdiscAcct: editing.sdiscAcct || "",
        rcCode: editing.rcCode,
        active: editing.active ?? "Y",
        userCode: "NSI",
      },
    };

    const confirm = await Swal.fire({
      title: "Save Bill Code?",
      text: "Make sure details are correct.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    setLoading(true);
    try {
      const { data } = await API.post("/upsertBillCodes", payload);
      if (data?.status === "success") {
        await Swal.fire("Saved", "Bill Code saved successfully.", "success");
        await fetchBillcodes();
        resetForm();
      } else {
        Swal.fire("Error", data?.message || "Something went wrong.", "error");
      }
    } catch (error) {
      console.error("Error saving Bill Code:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Error saving Bill Code.",
        "error"
      );
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    const b = filtered[index + (page - 1) * pageSize];
    if (!b?.billCode) return;

    const confirm = await Swal.fire({
      title: "Delete this Bill Code?",
      text: `Bill Code: ${b.billCode} | ${b.billName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    });
    if (!confirm.isConfirmed) return;

    try {
      const { data } = await API.post("/deleteBillCodes", {
        json_data: { billCode: b.billCode },
      });
      if (data?.status === "success") {
        setBillcodes((prev) => prev.filter((x) => x.billCode !== b.billCode));
        Swal.fire("Deleted", "The bill code has been deleted.", "success");
      } else {
        Swal.fire("Error", data?.message || "Deletion failed.", "error");
      }
    } catch (error) {
      console.error("API delete error:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to delete Bill Code.",
        "error"
      );
    }
  };

  // -------- Export -----------------------------------------------------------
  const handleExport = (type) => {
    if (!billCode.length) {
      Swal.fire("No data", "There is no data to export.", "info");
      return;
    }

    const headers = [
      "Bill Code",
      "Bill Name",
      "UOM",
      "AR Account",
      "Sales Account",
      "Sales Discount Account",
      "Responsibility Center",
      "Active",
    ];

    const rows = billCode.map((r) => [
      r.billCode ?? "",
      r.billName ?? "",
      r.uom ?? "",
      r.arAcct ?? "",
      r.salesAcct ?? "",
      r.sdiscAcct ?? "",
      r.rcCode ?? "",
      r.active ?? "",
    ]);

    if (type === "csv" || type === "excel") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "BillCodes");
      if (type === "csv") {
        XLSX.writeFile(wb, "billCode.csv", { bookType: "csv" });
      } else {
        XLSX.writeFile(wb, "billCode.xlsx", { bookType: "xlsx" });
      }
    } else if (type === "pdf") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
      doc.setFontSize(15);
      doc.text("Bill Codes", 40, 40);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        margin: { top: 50, left: 40, right: 40 },
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 82, 204], textColor: [255, 255, 255] },
      });
      doc.save("billCode.pdf");
    }
  };

  // -------- Guides -----------------------------------------------------------
  const handlePDFGuide = () => {
    if (pdfLink) window.open(pdfLink, "_blank");
    setOpenGuide(false);
  };
  const handleVideoGuide = () => {
    if (videoLink) window.open(videoLink, "_blank");
    setOpenGuide(false);
  };

  // -------- UI ---------------------------------------------------------------
  return (
    <div className="mt-24 px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Sticky header / toolbar */}
        <div className="fixed top-14 left-4 right-4 z-30">
          <div className="backdrop-blur bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <h1 className="text-xl font-bold tracking-tight">{documentTitle}</h1>
                <div className="relative ml-auto sm:ml-2 w-full sm:w-72">
                  <input
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Search bill codes…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-center text-xs">
                <button
                  onClick={startNew}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>

                <button
                  onClick={handleSave}
                  disabled={!isEditing || saving}
                  title="Ctrl+S to Save"
                  className={`px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 ${
                    !isEditing || saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faSave} /> Save
                </button>

                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faUndo} /> Reset
                </button>

                <div ref={exportRef} className="relative">
                  <button
                    onClick={() => setOpenExport((v) => !v)}
                    className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faPrint} /> Export{" "}
                    <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
                  </button>
                  {isOpenExport && (
                    <div className="absolute right-0 mt-1 w-44 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden">
                      <button
                        onClick={() => {
                          handleExport("csv");
                          setOpenExport(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faFileCsv} className="opacity-70" /> CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport("excel");
                          setOpenExport(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faFileExcel} className="opacity-70" /> Excel
                      </button>
                      <button
                        onClick={() => {
                          handleExport("pdf");
                          setOpenExport(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faFilePdf} className="opacity-70" /> PDF
                      </button>
                    </div>
                  )}
                </div>

                <div ref={guideRef} className="relative">
                  <button
                    onClick={() => setOpenGuide((v) => !v)}
                    className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faInfoCircle} /> Info{" "}
                    <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
                  </button>
                  {isOpenGuide && (
                    <div className="absolute right-0 mt-1 w-44 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-[60] overflow-hidden">
                      <button
                        onClick={() => {
                          handlePDFGuide();
                          setOpenGuide(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faFilePdf} /> User Guide
                      </button>
                      <button
                        onClick={() => {
                          handleVideoGuide();
                          setOpenGuide(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 flex items-center gap-2"
                      >
                        <FontAwesomeIcon icon={faVideo} /> Video Guide
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {saving || loading ? (
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                {saving ? "Saving…" : "Loading…"}
              </div>
            ) : null}
          </div>

          
        </div>
        {/* Form Card */}
        <div className="mt-40">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Col 1 */}
              <div className="space-y-10">
                {/* Bill Code */}
                <div className="relative">
                  <input
                    type="text"
                    id="billCode"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[Calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.billCode || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), billCode: e.target.value }))
                    }
                    disabled={!!editing?.__existing || !isEditing}
                    maxLength={30}
                  />
                  <label
                    htmlFor="billCode"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Bill Code
                  </label>
                </div>

                {/* Bill Name */}
                <div className="relative">
                  <input
                    type="text"
                    id="billName"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[Calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.billName || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), billName: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="billName"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Bill Name
                  </label>
                </div>

                {/* UOM */}
                <div className="relative">
                  <input
                    type="text"
                    id="uom"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[Calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.uom || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), uom: e.target.value }))
                    }
                    disabled={!isEditing}
                    maxLength={10}
                  />
                  <label
                    htmlFor="uom"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> UOM
                  </label>
                </div>
              </div>

              {/* Col 2 */}
              <div className="space-y-4">
                {/* AR Account */}
                <div className="relative">
                  <input
                    type="text"
                    id="arAcct"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.arAcct || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), arAcct: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="arAcct"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> AR Account
                  </label>
                </div>

                {/* Sales Account */}
                <div className="relative">
                  <input
                    type="text"
                    id="salesAcct"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font -[calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.salesAcct || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), salesAcct: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="salesAcct"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Sales Account
                  </label>
                </div>

                {/* Sales Discount Account */}
                <div className="relative">
                  <input
                    type="text"
                    id="sdiscAcct"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font[calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.sdiscAcct || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), sdiscAcct: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="sdiscAcct"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Sales Discount Account
                  </label>
                </div>
              </div>

              {/* Col 3 */}
              <div className="space-y-4">
                {/* Responsibility Center */}
                <div className="relative">
                  <input
                    type="text"
                    id="rcCode"
                    placeholder=" "
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.rcCode || ""}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), rcCode: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                  <label
                    htmlFor="rcCode"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Responsibility Center
                  </label>
                </div>

                {/* Active */}
                <div className="relative">
                  <select
                    id="active"
                    className={`peer w-full rounded-lg border px-3 py-2 bg-white dark:bg-gray-800 font-[calibri] ${
                      isEditing
                        ? "border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        : "border-gray-200 dark:border-gray-800 opacity-70"
                    }`}
                    value={editing?.active ?? "Y"}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...(prev || {}), active: e.target.value }))
                    }
                    disabled={!isEditing}
                  >
                    <option value="Y">Yes</option>
                    <option value="N">No</option>
                  </select>
                  <label
                    htmlFor="active"
                    className="absolute -top-2 left-2 bg-white dark:bg-gray-900 px-1 text-sm font-normal opacity-90"
                  >
                    <span className="text-red-500">*</span> Active
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/60 sticky top-[116px] z-10">
                  {/* Sortable header row */}
                  <tr className="text-left">
                    {[
                      ["billCode", "Bill Code"],
                      ["billName", "Bill Name"],
                      ["uom", "UOM"],
                      ["arAcct", "AR Account"],
                      ["salesAcct", "Sales Account"],
                      ["sdiscAcct", "Sales Disc Acct"],
                      ["rcCode", "Dept/RC"],
                      ["active", "Active"],
                      ["_edit", "Edit"],
                      ["_delete", "Delete"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className={`px-3 py-2 font-semibold border-b border-gray-200 dark:border-gray-800 ${
                          key.startsWith("_") ? "" : "cursor-pointer select-none"
                        }`}
                        onClick={() => {
                          if (key.startsWith("_")) return;
                          setSortBy(key);
                          setSortDir((prev) =>
                            sortBy === key && prev === "asc" ? "desc" : "asc"
                          );
                        }}
                        title={!key.startsWith("_") ? "Click to sort" : undefined}
                      >
                        <div className="flex items-center gap-1">
                          <span>{label}</span>
                          {!key.startsWith("_") && sortBy === key && (
                            <span className="opacity-60">{sortDir === "asc" ? "▲" : "▼"}</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>

                  {/* Filter row */}
                  <tr className="bg-white/70 dark:bg-gray-900/70">
                    {[
                      "billCode",
                      "billName",
                      "uom",
                      "arAcct",
                      "salesAcct",
                      "sdiscAcct",
                      "rcCode",
                    ].map((k) => (
                      <th key={k} className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                        <input
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Filter…"
                          value={columnFilters[k]}
                          onChange={(e) => {
                            setColumnFilters((s) => ({ ...s, [k]: e.target.value }));
                            setPage(1);
                          }}
                        />
                      </th>
                    ))}
                    {/* Active select */}
                    <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
                      <select
                        className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        value={columnFilters.active}
                        onChange={(e) => {
                          setColumnFilters((s) => ({ ...s, active: e.target.value }));
                          setPage(1);
                        }}
                      >
                        <option value="">All</option>
                        <option value="Y">Yes</option>
                        <option value="N">No</option>
                      </select>
                    </th>
                    {/* Edit/Delete spacers */}
                    <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800"></th>
                    <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-800"></th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length ? (
                    pageRows.map((row, idx) => (
                      <tr
                        key={`${row.billCode}-${idx}`}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/20"
                      >
                        <td className="px-3 py-2">{row.billCode}</td>
                        <td className="px-3 py-2">{row.billName}</td>
                        <td className="px-3 py-2">{row.uom || "-"}</td>
                        <td className="px-3 py-2">{row.arAcct || "-"}</td>
                        <td className="px-3 py-2">{row.salesAcct || "-"}</td>
                        <td className="px-3 py-2">{row.sdiscAcct || "-"}</td>
                        <td className="px-3 py-2">{row.rcCode || "-"}</td>
                        <td className="px-3 py-2">{row.active}</td>
                        <td className="px-3 py-2 text-center">
                          <button
                            className="px-2 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white"
                            onClick={() => handleEditRow(idx)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white"
                            onClick={() => handleDelete(idx)}
                          >
                            <FontAwesomeIcon icon={faTrashAlt} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-6 py-10 text-center">
                        <div className="text-sm opacity-70">No bill codes found</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pager */}
            <div className="flex items-center justify-between p-3">
              <div className="text-xs opacity-80 font-normal">
                Total Records: {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}/page
                    </option>
                  ))}
                </select>
                <div className="text-xs opacity-80 font-semibold">
                  Page {page} of {totalPages}
                </div>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-2 text-xs font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* end Table */}
      </div>
    </div>
  );
};

export default BillCodeRef;

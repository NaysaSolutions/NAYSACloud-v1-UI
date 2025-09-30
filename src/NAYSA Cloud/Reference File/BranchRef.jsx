import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

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
  faSave,
  faUndo,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

// Global
import { reftables, reftablesPDFGuide, reftablesVideoGuide } from "@/NAYSA Cloud/Global/reftable";

// Exports
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Centralized API instance */
const API = axios.create({ baseURL: "http://localhost:8000/api" });

/** Simple validators */
const isTinValid = (v) => /^[0-9-]{9,20}$/.test(String(v || ""));
const req = (v) => String(v || "").trim().length > 0;

/** Case-insensitive "includes" that tolerates nulls */
const includesCI = (hay, needle) =>
  String(hay ?? "").toLowerCase().includes(String(needle ?? "").toLowerCase());

const BranchRef = () => {
  // Document meta
  const docType = "Branch";
  const documentTitle = reftables[docType] || "Transaction";
  const pdfLink = reftablesPDFGuide[docType];
  const videoLink = reftablesVideoGuide[docType];

  // Table + form state
  const [branches, setBranches] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  // UX state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOpenExport, setOpenExport] = useState(false);
  const [isOpenGuide, setOpenGuide] = useState(false);

  // Table helpers
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("branchCode");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // NEW: per-column filters
  const [columnFilters, setColumnFilters] = useState({
    branchCode: "",
    branchName: "",
    main: "",          // select
    branchAddr1: "",
    branchTin: "",
    telNo: "",
    faxNo: "",
    zipCode: "",
    active: "",        // select
  });

  // Refs for click-away
  const exportRef = useRef(null);
  const guideRef = useRef(null);

  // Fetch
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/branch");
      const resultString = data?.data?.[0]?.result;
      setBranches(resultString ? JSON.parse(resultString) : []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      Swal.fire("Error", "Failed to load branches.", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchBranches(); }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideExport = exportRef.current && !exportRef.current.contains(event.target);
      const clickedOutsideGuide = guideRef.current && !guideRef.current.contains(event.target);
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
        if (!saving && isEditing) handleSaveBranch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, isEditing, editingBranch]);

  // Search + COLUMN FILTERS + sort + pagination
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1) global search (optional)
    const base = q
      ? branches.filter((b) =>
          [b.branchCode, b.branchName, b.branchAddr1, b.branchTin, b.telNo, b.zipCode]
            .some((x) => String(x || "").toLowerCase().includes(q))
        )
      : branches;

    // 2) per-column filters (all must match)
    const withColFilters = base.filter((b) => {
      const f = columnFilters;
      if (f.branchCode && !includesCI(b.branchCode, f.branchCode)) return false;
      if (f.branchName && !includesCI(b.branchName, f.branchName)) return false;
      if (f.branchAddr1 && !includesCI(b.branchAddr1, f.branchAddr1)) return false;
      if (f.branchTin && !includesCI(b.branchTin, f.branchTin)) return false;
      if (f.telNo && !includesCI(b.telNo, f.telNo)) return false;
      if (f.faxNo && !includesCI(b.faxNo, f.faxNo)) return false;
      if (f.zipCode && !includesCI(b.zipCode, f.zipCode)) return false;

      // select filters: exact match when a value is chosen
      if (f.main && String(b.main ?? "") !== String(f.main)) return false;
      if (f.active && String(b.active ?? "") !== String(f.active)) return false;

      return true;
    });

    // 3) sort
    const factor = sortDir === "asc" ? 1 : -1;
    return [...withColFilters].sort((a, b) => {
      const A = String(a?.[sortBy] ?? "");
      const B = String(b?.[sortBy] ?? "");
      return A.localeCompare(B) * factor;
    });
  }, [branches, query, columnFilters, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // New / Edit / Reset flows
  const startNew = () => {
    setEditingBranch({
      __existing: false,
      branchCode: "",
      branchName: "",
      main: "Branch",
      branchAddr1: "",
      branchAddr2: "",
      branchAddr3: "",
      country: "",
      branchTin: "",
      telNo: "",
      faxNo: "",
      zipCode: "",
      active: "Y",
    });
    setIsEditing(true);
  };

  const handleEditRow = (index) => {
    const item = branches[index];
    setEditingBranch({ ...item, __existing: true });
    setIsEditing(true);
  };

  const resetForm = () => {
    fetchBranches();
    setEditingBranch(null);
    setIsEditing(false);
    setOpenExport(false);
    setOpenGuide(false);
    setPage(1);
  };

  // Save
  const handleSaveBranch = async () => {
    if (!editingBranch) return;

    const { branchCode, branchName, branchAddr1, branchTin } = editingBranch;

    // Validate requireds
    if (!req(branchCode) || !req(branchName) || !req(branchAddr1) || !req(branchTin)) {
      Swal.fire("Missing data", "Please fill: Branch Code, Name, Address, and TIN.", "warning");
      return;
    }
    if (!isTinValid(branchTin)) {
      Swal.fire("Invalid TIN", "TIN should contain only digits and dashes.", "warning");
      return;
    }

    const payload = {
      json_data: {
        branchCode: editingBranch.branchCode,
        branchName: editingBranch.branchName,
        branchType: editingBranch.main,
        branchAddr1: editingBranch.branchAddr1,
        branchAddr2: editingBranch.branchAddr2 || "",
        branchAddr3: editingBranch.branchAddr3 || "",
        country: editingBranch.country || "",
        branchTin: editingBranch.branchTin,
        telNo: editingBranch.telNo || "",
        faxNo: editingBranch.faxNo || "",
        zipCode: editingBranch.zipCode || "",
        main: editingBranch.main,
        active: editingBranch.active ?? "Y",
        userCode: "NSI",
      },
    };

    const confirm = await Swal.fire({
      title: "Save Branch?",
      text: "Make sure details are correct.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    setLoading(true);
    try {
      const { data } = await API.post("/upsertBranch", payload);
      if (data?.status === "success") {
        await Swal.fire("Saved", "Branch saved successfully.", "success");
        await fetchBranches();
        resetForm();
      } else {
        Swal.fire("Error", data?.message || "Something went wrong.", "error");
      }
    } catch (error) {
      console.error("Error saving branch:", error);
      Swal.fire("Error", error?.response?.data?.message || "Error saving branch.", "error");
    } finally {
      setSaving(false);
      setLoading(false);
    }
  };

  // Delete
  const handleDeleteBranch = async (index) => {
    const b = branches[index];
    if (!b?.branchCode) return;
    const confirm = await Swal.fire({
      title: "Delete this branch?",
      text: `Branchcode : ${b.branchCode} | Branchname : ${b.branchName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
    });
    if (!confirm.isConfirmed) return;

    try {
      const { data } = await API.post("/deleteBranch", { json_data: { branchCode: b.branchCode } });
      if (data?.status === "success") {
        setBranches((prev) => prev.filter((_, i) => i !== index));
        Swal.fire("Deleted", "The branch has been deleted.", "success");
      } else {
        Swal.fire("Error", data?.message || "Deletion failed.", "error");
      }
    } catch (error) {
      console.error("API delete error:", error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to delete branch.", "error");
    }
  };

  // Exports
  const handleExport = (type) => {
    if (!branches.length) {
      Swal.fire("No data", "There is no data to export.", "info");
      return;
    }

    const headers = [
      "Branch Code",
      "Branch Name",
      "Branch Type",
      "Branch Address 1",
      "Branch Address 2",
      "Branch Address 3",
      "Branch TIN",
      "Telephone No",
      // "Fax No",
      "Zip Code",
      "Active",
    ];

    const rows = branches.map((branch) => [
      branch.branchCode || "",
      branch.branchName || "",
      branch.main || "",
      branch.branchAddr1 || "",
      branch.branchAddr2 || "",
      branch.branchAddr3 || "",
      branch.branchTin || "",
      branch.telNo || "",
      // branch.faxNo || "",
      branch.zipCode || "",
      branch.active || "",
    ]);

    if (type === "csv" || type === "excel") {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, ws, "Branches");
      if (type === "csv") {
        XLSX.writeFile(wb, "branches.csv", { bookType: "csv" });
      } else {
        XLSX.writeFile(wb, "branches.xlsx", { bookType: "xlsx" });
      }
    } else if (type === "pdf") {
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
      doc.setFontSize(15);
      doc.text("Branch Codes", 40, 40);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        margin: { top: 50 },
        theme: "grid",
        styles: { fontSize: 8, textColor: [40, 40, 40], lineColor: [60, 60, 60], lineWidth: 0.1 },
        headStyles: { fillColor: [0, 0, 128], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      });
      doc.save("branches.pdf");
    }
  };

  // Guides
  const handlePDFGuide = () => {
    if (pdfLink) window.open(pdfLink, "_blank");
    setOpenGuide(false);
  };
  const handleVideoGuide = () => {
    if (videoLink) window.open(videoLink, "_blank");
    setOpenGuide(false);
  };

  // Render
  return (
    <div className="global-ref-main-div-ui mt-20">
      <div className="mx-auto">
        {/* Header */}
        <div className="fixed top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
            <div className="relative ml-auto sm:ml-4 w-full sm:w-64">
              <input
                className="global-ref-filterbox-ui global-ref-filterbox-enabled pl-8"
                placeholder="Search keyword..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              />
              <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <div className="flex gap-2 justify-center text-xs">
            <button onClick={startNew} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
              <FontAwesomeIcon icon={faPlus} /> Add
            </button>

            <button
              onClick={handleSaveBranch}
              className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={!isEditing || saving}
              title="Ctrl+S to Save"
            >
              <FontAwesomeIcon icon={faSave} /> Save
            </button>

            <button onClick={resetForm} className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700" disabled={saving}>
              <FontAwesomeIcon icon={faUndo} /> Reset
            </button>

            <div ref={exportRef} className="relative">
              <button
                onClick={() => setOpenExport((v) => !v)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
              >
                <FontAwesomeIcon icon={faPrint} /> Export <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </button>
              {isOpenExport && (
                <div className="absolute right-0 mt-1 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
                  <button
                    onClick={() => { handleExport("csv"); setOpenExport(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faFileCsv} className="mr-2 text-green-600" /> CSV
                  </button>
                  <button
                    onClick={() => { handleExport("excel"); setOpenExport(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="mr-2 text-green-600" /> Excel
                  </button>
                  <button
                    onClick={() => { handleExport("pdf"); setOpenExport(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> PDF
                  </button>
                </div>
              )}
            </div>

            <div ref={guideRef} className="relative">
              <button
                onClick={() => setOpenGuide((v) => !v)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faInfoCircle} /> Info <FontAwesomeIcon icon={faChevronDown} className="text-xs" />
              </button>
              {isOpenGuide && (
                <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black/10 z-[60] dark:bg-gray-800">
                  <button
                    onClick={() => { handlePDFGuide(); setOpenGuide(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2 text-red-600" /> User Guide
                  </button>
                  <button
                    onClick={() => { handleVideoGuide(); setOpenGuide(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900"
                  >
                    <FontAwesomeIcon icon={faVideo} className="mr-2 text-blue-600" /> Video Guide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="global-tran-tab-div-ui">
          {(loading || saving) && (
            <div className="fixed inset-0 z-[70] bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div
                className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-xl flex items-center gap-3"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                {/* Spinner */}
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-white" />
                {/* Text */}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {saving ? "Saving…" : "Loading…"}
                </span>
              </div>
            </div>
          )}


          {/* Form grid (flattened) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {/* Branch Code */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="branchCode"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.branchCode || ""}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), branchCode: e.target.value }))
                }
                disabled={!!editingBranch?.__existing}
                readOnly={!isEditing}
                maxLength={10}
              />
              <label htmlFor="branchCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Branch Code
              </label>
            </div>

            {/* Branch Name */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="branchName"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.branchName || ""}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), branchName: e.target.value }))
                }
                disabled={!isEditing}
              />
              <label htmlFor="branchName" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Branch Name
              </label>
            </div>

            {/* Branch Type */}
            <div className="relative md:col-span-1">
              <select
                id="main"
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.main || "Branch"}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), main: e.target.value }))
                }
                disabled={!isEditing}
              >
                <option value="Main Branch">Main Branch</option>
                <option value="Branch">Branch</option>
              </select>
              <label htmlFor="main" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Branch Type
              </label>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* TIN */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="tin"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.branchTin || ""}
                onChange={(e) => {
                  const sanitized = e.target.value.replace(/[^0-9-]/g, "");
                  setEditingBranch((prev) => ({ ...(prev || {}), branchTin: sanitized }));
                }}
                disabled={!isEditing}
              />
              <label htmlFor="tin" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Tax Identification Number (TIN)
              </label>
            </div>

            {/* Telephone No. */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="telNo"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.telNo || ""}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), telNo: e.target.value }))
                }
                disabled={!isEditing}
              />
              <label htmlFor="telNo" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Telephone No.
              </label>
            </div>

            {/* Zip Code */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="zipCode"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.zipCode || ""}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), zipCode: e.target.value }))
                }
                disabled={!isEditing}
              />
              <label htmlFor="zipCode" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Zip Code
              </label>
            </div>

            {/* Address — spans 2 columns on md+ */}
            <div className="relative md:col-span-1">
              <input
                type="text"
                id="address"
                placeholder=" "
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.branchAddr1 || ""}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), branchAddr1: e.target.value }))
                }
                disabled={!isEditing}
              />
              <label htmlFor="address" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Address
              </label>
            </div>

            {/* Active */}
            <div className="relative md:col-span-1">
              <select
                id="active"
                className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                value={editingBranch?.active || "Active"}
                onChange={(e) =>
                  setEditingBranch((prev) => ({ ...(prev || {}), active: e.target.value }))
                }
                disabled={!isEditing}
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
              <label htmlFor="active" className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}>
                <span className="global-ref-asterisk-ui">*</span> Active
              </label>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="global-ref-table-main-div-ui">
          <div className="global-ref-table-main-sub-div-ui">
            <div className="global-ref-table-div-ui">
              <table className="global-ref-table-div-ui">
                <thead className="global-ref-thead-div-ui">
                  {/* Sortable header row */}
                  <tr className="global-ref-tr-ui">
                    {[
                      ["branchCode", "Branch Code"],
                      ["branchName", "Branch Name"],
                      ["main", "Branch Type"],
                      ["branchAddr1", "Address"],
                      ["branchTin", "TIN"],
                      ["telNo", "Telephone No."],
                      // ["faxNo", "Fax No."],
                      ["zipCode", "Zip Code"],
                      ["active", "Active"],
                      ["_edit", "Edit"],
                      ["_delete", "Delete"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className={`global-ref-th-ui ${key.startsWith("_") ? "" : "cursor-pointer select-none"}`}
                        onClick={() => {
                          if (key.startsWith("_")) return;
                          setSortBy(key);
                          setSortDir((prev) => (sortBy === key && prev === "asc" ? "desc" : "asc"));
                        }}
                        title={!key.startsWith("_") ? "Click to sort" : undefined}
                      >
                        {label} {sortBy === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                      </th>
                    ))}
                  </tr>

                  {/* NEW: Filter row */}
                  <tr>
                    {/* Branch Code */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.branchCode}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, branchCode: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* Branch Name */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.branchName}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, branchName: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* Branch Type (select) */}
                    <th className="global-ref-th-ui">
                      <select
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        value={columnFilters.main}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, main: e.target.value })); setPage(1); }}
                      >
                        <option value="">All</option>
                        <option value="Main Branch">Main Branch</option>
                        <option value="Branch">Branch</option>
                      </select>
                    </th>
                    {/* Address */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.branchAddr1}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, branchAddr1: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* TIN */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.branchTin}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, branchTin: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* Tel */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.telNo}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, telNo: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* Fax */}
                    {/* <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.faxNo}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, faxNo: e.target.value })); setPage(1); }}
                      />
                    </th> */}
                    {/* Zip */}
                    <th className="global-ref-th-ui">
                      <input
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        placeholder="Filter…"
                        value={columnFilters.zipCode}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, zipCode: e.target.value })); setPage(1); }}
                      />
                    </th>
                    {/* Active (select) */}
                    <th className="global-ref-th-ui">
                      <select
                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                        value={columnFilters.active}
                        onChange={(e) => { setColumnFilters(s => ({ ...s, active: e.target.value })); setPage(1); }}
                      >
                        <option value="">All</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </th>
                    {/* Edit / Delete spacers */}
                    <th className="global-ref-th-ui"></th>
                    <th className="global-ref-th-ui"></th>
                  </tr>
                </thead>

                <tbody>
                  {pageRows.length ? (
                    pageRows.map((branch, idx) => (
                      <tr key={`${branch.branchCode}-${idx}`} className="global-tran-tr-ui">
                        <td className="global-ref-td-ui">{branch.branchCode}</td>
                        <td className="global-ref-td-ui">{branch.branchName}</td>
                        <td className="global-ref-td-ui">{branch.main}</td>
                        <td className="global-ref-td-ui">{branch.branchAddr1 || "-"}</td>
                        <td className="global-ref-td-ui">{branch.branchTin}</td>
                        <td className="global-ref-td-ui">{branch.telNo || "-"}</td>
                        {/* <td className="global-ref-td-ui">{branch.faxNo || "-"}</td> */}
                        <td className="global-ref-td-ui">{branch.zipCode || "-"}</td>
                        <td className="global-ref-td-ui">{branch.active}</td>
                        <td className="global-ref-td-ui text-center sticky right-10">
                          <button
                            className="global-ref-td-button-edit-ui"
                            onClick={() => handleEditRow((page - 1) * pageSize + idx)}
                          >
                            <FontAwesomeIcon icon={faEdit}/>
                          </button>
                        </td>
                        <td className="global-ref-td-ui text-center sticky right-0">
                          <button
                            className="global-ref-td-button-delete-ui"
                            onClick={() => handleDeleteBranch((page - 1) * pageSize + idx)}
                          >
                            <FontAwesomeIcon icon={faTrashAlt}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="global-ref-norecords-ui">
                        No branches found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pager */}
              <div className="flex items-center justify-between p-3">
                <div className="text-xs opacity-80 font-semibold">
                  Total Records: {filtered.length}
                </div>
                <div className="flex items-center gap-3">

                  <div className="text-xs opacity-80 font-semibold">
                    Page {page} of {totalPages}
                  </div>

                  <select
                    className="px-7 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[5, 10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}/page
                      </option>
                    ))}
                  </select>
                  
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-7 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-7 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    Next
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end Table */}
      </div>
    </div>
  );
};

export default BranchRef;

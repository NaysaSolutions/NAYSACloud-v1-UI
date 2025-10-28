import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/NAYSA Cloud/Configuration/BaseURL.jsx";
import { useAuth } from "@/NAYSA Cloud/Authentication/AuthContext.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSpinner,
    faSearch,
    faVideo,
    faUndo,
    faFilter,
    faSave,
    faTrash,
    faPlus,
    faEdit,
    faTrashAlt,
    faInfoCircle,
    faChevronDown,
    faFilePdf,
    faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import {useReturnToDate} from '@/NAYSA Cloud/Global/dates';

// Global
import { reftables, reftablesPDFGuide, reftablesVideoGuide } from "@/NAYSA Cloud/Global/reftable";

// Helper to normalize ID key from API rows
const getId = (row) => {
    if (!row) return null;
    // Check all possible ID field names in order of likelihood
    return row.CUTOFF_CODE ?? row.cutoffCode ?? null;
};

// ---- Date helpers ----
const toISO = (val) => {
    if (!val) return "";
    // strip time part if it's a SQL datetime (e.g., "2025-01-01 00:00:00.000")
    const s = String(val).trim().split(" ")[0];

    // Already ISO?
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // MM-DD-YYYY -> YYYY-MM-DD
    const mdy = /^(\d{2})-(\d{2})-(\d{4})$/;
    const m = s.match(mdy);
    if (m) return `${m[3]}-${m[1]}-${m[2]}`;

    // Try Date parsing fallback
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${yyyy}-${mm}-${dd}`;
    }
    return "";
};

const toDisplay = (val) => {
    if (!val) return "";
    // Convert anything to ISO first, then to MM-DD-YYYY
    const iso = toISO(val);
    if (!iso) return "";

    const [yyyy, mm, dd] = iso.split("-");
    return `${mm}-${dd}-${yyyy}`;
};



const CutoffRef = ({ onSelect }) => {
    // Get user from auth context
    const { user } = useAuth();

    // Debug check to see if user is properly set
    console.log("Auth context user object:", user);

    // Document Global Setup
    const docType = "Cutoff";
    const documentTitle = reftables[docType] || "Cycle Periods";
    const pdfLink = reftablesPDFGuide[docType];
    const videoLink = reftablesVideoGuide[docType];

    // Data
    const [cutoffData, setCutoffData] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [filters, setFilters] = useState({
        cutoffCode: "",
        cutoffName: "",
        fromDate: "",
        toDate: "",
        stat: ""
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [isOpenGuide, setOpenGuide] = useState(false);
    const [selectedCutoff, setSelectedCutoff] = useState(null);

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [cutoffCode, setCutoffCode] = useState("");
    const [cutoffName, setCutoffName] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [stat, setStat] = useState("O"); // Default to Open instead of A
    const [editingId, setEditingId] = useState(null);

    // Refs
    const guideRef = useRef(null);

    // Table sorting state
    const [sortBy, setSortBy] = useState("cutoffCode"); // Default sort column
    const [sortDir, setSortDir] = useState("asc");    // Default sort direction

    // New state variable for query
    const [query, setQuery] = useState("");

    // Initial load
    useEffect(() => {
        fetchCutoffPeriods();
    }, []);

    // Close Help menu on click-away
    useEffect(() => {
        const handleClickOutside = (event) => {
            const clickedOutsideGuide = guideRef.current && !guideRef.current.contains(event.target);
            if (clickedOutsideGuide) setOpenGuide(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Ctrl+S to save when editing
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === "s") {
                e.preventDefault();
                if (!saving && isEditing) handleSaveCutoff();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [saving, isEditing, cutoffCode, cutoffName, fromDate, toDate, stat]);

    // Fetch
    const fetchCutoffPeriods = () => {
        setLoading(true);

        // Use a simple string parameter instead of JSON object
        // This will work with your stored procedure's expected format
        apiClient.get("/cutOff", {
            params: {
                PARAMS: "All" // Simple string parameter (options: "All", "Open", "Closed")
            },
        })
            .then(({ data }) => {
                console.log("API response:", data);
                if (data?.success) {
                    if (Array.isArray(data.data) && data.data[0]?.result) {
                        try {
                            const parsed = JSON.parse(data.data[0].result || "[]");
                            setCutoffData(parsed);
                            setFiltered(parsed);
                        } catch (parseError) {
                            console.error("Error parsing result:", parseError, data.data[0].result);
                            setCutoffData([]);
                            setFiltered([]);
                            Swal.fire("Error", "Failed to parse cutoff period data from the server", "error");
                        }
                        return;
                    }
                    if (Array.isArray(data.data)) {
                        setCutoffData(data.data);
                        setFiltered(data.data);
                        return;
                    }
                }
                setCutoffData([]);
                setFiltered([]);
                if (!data?.success) {
                    Swal.fire("Error", data?.message || "Server returned an unsuccessful response", "error");
                }
            })
            .catch((err) => {
                console.error("Failed to fetch cutoff periods:", err);
                const errorMessage = err.response?.data?.message || err.message;

                Swal.fire({
                    title: "Database Error",
                    text: `The server couldn't process your request: ${errorMessage}`,
                    icon: "error",
                    confirmButtonText: "Okay"
                });

                setCutoffData([]);
                setFiltered([]);
            })
            .finally(() => setLoading(false));
    };

    // Filtering and Sorting
    useEffect(() => {
        let newFiltered = cutoffData.filter((item) => {
            const code = String(item.CUTOFF_CODE ?? item.cutoffCode ?? "").toLowerCase();
            const name = String(item.CUTOFF_NAME ?? item.cutoffName ?? "").toLowerCase();
            const from = toDisplay(item.FROM_DATE ?? item.fromDate ?? "").toLowerCase();
            const to = toDisplay(item.TO_DATE ?? item.toDate ?? "").toLowerCase();

            const status = String(item.STAT ?? item.stat ?? "").toLowerCase();

            return code.includes((filters.cutoffCode || "").toLowerCase()) &&
                name.includes((filters.cutoffName || "").toLowerCase()) &&
                from.includes((filters.fromDate || "").toLowerCase()) &&
                to.includes((filters.toDate || "").toLowerCase()) &&
                status.includes((filters.stat || "").toLowerCase());
        });

        // Apply sorting
        if (sortBy) {
            newFiltered = [...newFiltered].sort((a, b) => {
                // Get the property value based on sortBy
                let aVal, bVal;

                if (sortBy === "cutoffCode") {
                    aVal = (a.CUTOFF_CODE ?? a.cutoffCode ?? "").toLowerCase();
                    bVal = (b.CUTOFF_CODE ?? b.cutoffCode ?? "").toLowerCase();
                } else if (sortBy === "cutoffName") {
                    aVal = (a.CUTOFF_NAME ?? a.cutoffName ?? "").toLowerCase();
                    bVal = (b.CUTOFF_NAME ?? b.cutoffName ?? "").toLowerCase();
                } else if (sortBy === "fromDate") {
                    aVal = a.FROM_DATE ?? a.fromDate ?? "";
                    bVal = b.FROM_DATE ?? b.fromDate ?? "";
                } else if (sortBy === "toDate") {
                    aVal = a.TO_DATE ?? a.toDate ?? "";
                    bVal = b.TO_DATE ?? b.toDate ?? "";
                } else if (sortBy === "stat") {
                    aVal = (a.STAT ?? a.stat ?? "").toLowerCase();
                    bVal = (b.STAT ?? b.stat ?? "").toLowerCase();
                }

                // Compare the values
                if (aVal < bVal) {
                    return sortDir === "asc" ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortDir === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        setFiltered(newFiltered);
    }, [filters, cutoffData, sortBy, sortDir]);

    const handleSelect = (cutoff) => {
        if (isEditing) return; // Don't select when in edit mode
        setSelectedCutoff(cutoff);
        // Set form fields with the selected cutoff data
        setCutoffCode(cutoff.CUTOFF_CODE ?? cutoff.cutoffCode ?? "");
        setCutoffName(cutoff.CUTOFF_NAME ?? cutoff.cutoffName ?? "");
        // ...existing code...
        setFromDate(toISO(cutoff.fromDate ?? cutoff.FROM_DATE ?? ""));
        setToDate(toISO(cutoff.toDate ?? cutoff.TO_DATE ?? ""));
        // ...existing code...
        setStat(cutoff.stat ?? cutoff.STAT ?? "O"); // Changed from "A" to "O"
        setEditingId(getId(cutoff));

        // Call the onSelect callback if provided
        onSelect && typeof onSelect === "function" && onSelect(cutoff);
    };

    const handleFilterChange = (e, key) => {
        setFilters({ ...filters, [key]: e.target.value });
    };

    const resetFilters = () => setFilters({
        cutoffCode: "",
        cutoffName: "",
        fromDate: "",
        toDate: "",
        stat: ""
    });

    // Form helpers
    const startNew = () => {
        resetForm();
        setIsAdding(true);
        setIsEditing(true);
    };

    const resetForm = () => {
        // Clear form fields completely
        setCutoffCode("");
        setCutoffName("");
        setFromDate("");
        setToDate("");
        setStat("O"); // Changed from "A" to "O"
        setEditingId(null);
        setIsEditing(false);
        setIsAdding(false);

        // Reset selected cutoff
        setSelectedCutoff(null);

        // Reset filters too when not in editing mode
        if (!isEditing) {
            resetFilters();
        }
    };

    const handleEditRow = (cutoff) => {
        if (!cutoff) return;
        setCutoffCode(cutoff.CUTOFF_CODE ?? cutoff.cutoffCode ?? "");
        setCutoffName(cutoff.CUTOFF_NAME ?? cutoff.cutoffName ?? "");
        setFromDate(toISO(cutoff.FROM_DATE ?? cutoff.fromDate ?? ""));
        setToDate(toISO(cutoff.TO_DATE ?? cutoff.toDate ?? ""));
        setStat(cutoff.STAT ?? cutoff.stat ?? "O"); // Changed from "A" to "O"
        setEditingId(getId(cutoff)); // normalized ID
        setIsEditing(true);
        setIsAdding(false); // Important: we're editing, not adding
        setSelectedCutoff(cutoff);
    };

    // Save (ADD/UPDATE)
    const handleSaveCutoff = async () => {
        if (!cutoffCode || !cutoffName || !fromDate || !toDate) {
            Swal.fire({
                title: "Error!",
                text: "Please fill out all required fields: Code, Name, From Date and To Date.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }

        // Validate dates
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        if (fromDateObj > toDateObj) {
            Swal.fire({
                title: "Error!",
                text: "From Date cannot be greater than To Date.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }

        // Extract the userCode from the authentication context
        const userCode = user?.USER_CODE || user?.username || "SYSTEM";
        console.log("Using userCode for save:", userCode);

        setSaving(true);
        try {
            // Structure data according to API requirements
            const requestData = {
                mode: isAdding ? "Upsert" : "Upsert",
                params: JSON.stringify({
                    json_data: {
                        cutoffCode: cutoffCode.trim(),
                        cutoffName: cutoffName.trim(),
                        fromDate,
                        toDate,
                        status: stat,
                        userCode
                    }
                })
            };
            

            console.log("Sending save request with data:", requestData);

            const { data } = await apiClient.post("/upsertCutOff", requestData);

            if (data?.status === "success" || data?.success) {
                await Swal.fire({
                    title: "Success!",
                    text: isAdding ? "Cutoff period added successfully" : "Cutoff period updated successfully",
                    icon: "success",
                    confirmButtonText: "Okay",
                });
                fetchCutoffPeriods();
                resetForm();
            } else {
                Swal.fire("Error", data?.message || "Failed to save cutoff period", "error");
            }
        } catch (error) {
            console.error("Error saving cutoff period:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to save cutoff period";
            Swal.fire("Error", `${errorMessage}`, "error");
        } finally {
            setSaving(false);
        }
    };

    // Delete cutoff period
    const handleDeleteCutoff = async () => {
        if (!selectedCutoff) {
            Swal.fire("Error", "Please select a cutoff period to delete", "error");
            return;
        }

        // Debug log to see the actual structure
        console.log("Selected cutoff period for deletion:", selectedCutoff);

        // Extract the cutoff code (check both formats)
        const cutoffCode = selectedCutoff.CUTOFF_CODE ?? selectedCutoff.cutoffCode;

        if (!cutoffCode) {
            Swal.fire("Error", "Cannot identify the selected cutoff period", "error");
            return;
        }

        // Extract the userCode from the authentication context
        const userCode = user?.USER_CODE || user?.username || "SYSTEM";
        console.log("Using userCode for delete:", userCode);

        const confirm = await Swal.fire({
            title: "Delete this cutoff period?",
            text: `Code: ${cutoffCode} | Name: ${selectedCutoff.CUTOFF_NAME ?? selectedCutoff.cutoffName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Yes, delete it",
            customClass: { popup: "rounded-xl shadow-2xl" },
        });

        if (!confirm.isConfirmed) return;

        try {
            // Format the payload as expected by the controller
            const payload = {
                json_data: JSON.stringify({
                    cutoffCode: cutoffCode,
                    userCode: userCode
                })
            };

            console.log("Sending delete request with data:", payload);

            // Use the dedicated delete endpoint
            const { data } = await apiClient.post("/deleteCutoff", payload);

            if (data?.success || data?.status === "success") {
                await Swal.fire({
                    title: "Deleted",
                    text: "The cutoff period has been deleted.",
                    icon: "success",
                    customClass: { popup: "rounded-xl shadow-2xl" },
                });
                fetchCutoffPeriods();
                resetForm();
                setSelectedCutoff(null); // Clear selection after deletion
            } else {
                Swal.fire("Error", data?.message || "Failed to delete cutoff period.", "error");
            }
        } catch (error) {
            console.error("Delete error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete cutoff period";
            Swal.fire("Error", errorMessage, "error");
        }
    };

    // Export functionality
    const handleExport = () => {
        // Implement export functionality here
        Swal.fire({
            title: "Export",
            text: "Export functionality will be implemented here",
            icon: "info",
        });
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

    return (
        <div className="global-ref-main-div-ui mt-24">
            <div className="fixed mt-4 top-14 left-6 right-6 z-30 global-ref-header-ui flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <h1 className="global-ref-headertext-ui">{documentTitle}</h1>
                </div>

                <div className="flex gap-2 justify-end text-xs">
                    <button
                        onClick={startNew}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                        disabled={isEditing}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Add
                    </button>

                    <button
                        onClick={() => handleEditRow(selectedCutoff)}
                        className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!selectedCutoff || isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!selectedCutoff || isEditing}
                    >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>

                    <button
                        onClick={handleDeleteCutoff}
                        className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!selectedCutoff || isEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!selectedCutoff || isEditing}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} /> Delete
                    </button>

                    <button
                        onClick={handleSaveCutoff}
                        className={`bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 ${!isEditing || saving ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!isEditing || saving}
                        title="Ctrl+S to Save"
                    >
                        <FontAwesomeIcon icon={faSave} /> {saving ? "Saving..." : "Save"}
                    </button>

                    <button
                        onClick={() => {
                            if (isEditing) {
                                // If in edit mode, reset the form
                                resetForm();
                            } else if (selectedCutoff) {
                                // If a cutoff is selected but not in edit mode, clear selection and form
                                resetForm();
                            } else {
                                // If not editing and nothing selected, just reset filters
                                resetFilters();
                            }
                        }}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                        <FontAwesomeIcon icon={faUndo} /> {isEditing ? "Reset" : selectedCutoff ? "Clear Selection" : "Reset Filters"}
                    </button>

                    <button
                        onClick={handleExport}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                        <FontAwesomeIcon icon={faFileExport} /> Export
                    </button>

                    {/* Help menu */}
                    <div ref={guideRef} className="relative">
                        <button
                            onClick={() => setOpenGuide(!isOpenGuide)}
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

            <div className="mt-4 mb-4 bg-white rounded-lg shadow-md overflow-x-auto">
                <div className="w-full bg-white p-4 sm:p-6 shadow-md rounded-lg">

                    {/* Stacked layout with Form Column above Cutoff Periods Table */}
                    <div className="flex flex-col gap-4">
                        {/* Form Column */}
                        <div className="w-full">
                            <div className="border rounded-lg overflow-hidden p-4 bg-gray-50">
                                {saving && <div className="text-xs text-blue-600 mb-2">Processing...</div>}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Cutoff Code */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="CUTOFF_CODE"
                                            placeholder=" "
                                            className={`peer global-ref-textbox-ui ${isEditing && isAdding
                                                ? "global-ref-textbox-enabled"
                                                : "global-ref-textbox-disabled"
                                                }`}
                                            value={cutoffCode}
                                            onChange={(e) => setCutoffCode(e.target.value.toUpperCase())}
                                            disabled={!isEditing || !isAdding}
                                            maxLength={10}
                                        />
                                        <label
                                            htmlFor="CUTOFF_CODE"
                                            className={`global-ref-floating-label ${!isEditing || (!isAdding && isEditing) ? "global-ref-label-disabled" : "global-ref-label-enabled"
                                                }`}
                                        >
                                            Cutoff Code <span className="global-ref-asterisk-ui">*</span>
                                            {isEditing && !isAdding && <span className="ml-1 text-gray-400">(not editable)</span>}
                                        </label>
                                    </div>

                                    {/* Description (CUTOFF_NAME) */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="CUTOFF_NAME"
                                            placeholder=" "
                                            className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"
                                                }`}
                                            value={cutoffName}
                                            onChange={(e) => setCutoffName(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                        <label
                                            htmlFor="CUTOFF_NAME"
                                            className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"
                                                }`}
                                        >
                                            Cutoff Name <span className="global-ref-asterisk-ui">*</span>
                                        </label>
                                    </div>

                                    {/* Status */}
                                    <div className="relative">
                                        <select
                                            id="STAT"
                                            className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"}`}
                                            value={stat}
                                            onChange={(e) => setStat(e.target.value)}
                                            disabled={!isEditing}
                                        >
                                            <option value="O">Open</option>
                                            <option value="C">Closed</option>
                                        </select>
                                        <label
                                            htmlFor="STAT"
                                            className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"}`}
                                        >
                                            Status <span className="global-ref-asterisk-ui">*</span>
                                        </label>
                                    </div>

                                    {/* From Date */}
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="FROM_DATE"
                                            placeholder=" "
                                            className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"
                                                }`}
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                        <label
                                            htmlFor="FROM_DATE"
                                            className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"
                                                }`}
                                        >
                                            From Date <span className="global-ref-asterisk-ui">*</span>
                                        </label>
                                    </div>

                                    {/* To Date */}
                                    <div className="relative">
                                        <input
                                            type="date"
                                            id="TO_DATE"
                                            placeholder=" "
                                            className={`peer global-ref-textbox-ui ${isEditing ? "global-ref-textbox-enabled" : "global-ref-textbox-disabled"
                                                }`}
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            disabled={!isEditing}
                                        />
                                        <label
                                            htmlFor="TO_DATE"
                                            className={`global-ref-floating-label ${!isEditing ? "global-ref-label-disabled" : "global-ref-label-enabled"
                                                }`}
                                        >
                                            To Date <span className="global-ref-asterisk-ui">*</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cutoff Periods Table */}
                        <div className="global-ref-table-main-div-ui">
                            <div className="global-ref-table-main-sub-div-ui">
                                <div className="global-ref-table-div-ui">
                                    <table className="global-ref-table-div-ui">
                                        <thead className="global-ref-thead-div-ui">
                                            <tr>
                                                <th className="global-ref-th-ui cursor-pointer select-none"
                                                    onClick={() => {
                                                        setSortBy("cutoffCode");
                                                        setSortDir(prev => prev === "asc" ? "desc" : "asc");
                                                    }}>
                                                    Cutoff Code {sortBy === "cutoffCode" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                                </th>
                                                <th className="global-ref-th-ui cursor-pointer select-none"
                                                    onClick={() => {
                                                        setSortBy("cutoffName");
                                                        setSortDir(prev => prev === "asc" ? "desc" : "asc");
                                                    }}>
                                                    Description {sortBy === "cutoffName" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                                </th>
                                                <th className="global-ref-th-ui cursor-pointer select-none"
                                                    onClick={() => {
                                                        setSortBy("fromDate");
                                                        setSortDir(prev => prev === "asc" ? "desc" : "asc");
                                                    }}>
                                                    From Date {sortBy === "fromDate" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                                </th>
                                                <th className="global-ref-th-ui cursor-pointer select-none"
                                                    onClick={() => {
                                                        setSortBy("toDate");
                                                        setSortDir(prev => prev === "asc" ? "desc" : "asc");
                                                    }}>
                                                    To Date {sortBy === "toDate" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                                </th>
                                                <th className="global-ref-th-ui cursor-pointer select-none"
                                                    onClick={() => {
                                                        setSortBy("stat");
                                                        setSortDir(prev => prev === "asc" ? "desc" : "asc");
                                                    }}>
                                                    Status {sortBy === "stat" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                                                </th>
                                            </tr>

                                            {/* Filter row */}
                                            <tr>
                                                <th className="global-ref-th-ui">
                                                    <input
                                                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                                                        placeholder="Filter…"
                                                        value={filters.cutoffCode}
                                                        onChange={(e) => handleFilterChange(e, "cutoffCode")}
                                                    />
                                                </th>
                                                <th className="global-ref-th-ui">
                                                    <input
                                                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                                                        placeholder="Filter…"
                                                        value={filters.cutoffName}
                                                        onChange={(e) => handleFilterChange(e, "cutoffName")}
                                                    />
                                                </th>
                                                <th className="global-ref-th-ui">
                                                    <input
                                                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                                                        placeholder="Filter…"
                                                        value={filters.fromDate}
                                                        onChange={(e) => handleFilterChange(e, "fromDate")}
                                                    />
                                                </th>
                                                <th className="global-ref-th-ui">
                                                    <input
                                                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                                                        placeholder="Filter…"
                                                        value={filters.toDate}
                                                        onChange={(e) => handleFilterChange(e, "toDate")}
                                                    />
                                                </th>
                                                <th className="global-ref-th-ui">
                                                    <input
                                                        className="w-full global-ref-filterbox-ui global-ref-filterbox-enabled"
                                                        placeholder="Filter…"
                                                        value={filters.stat}
                                                        onChange={(e) => handleFilterChange(e, "stat")}
                                                    />
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {filtered.length > 0 ? (
                                                filtered.map((cutoff, index) => (
                                                    <tr
                                                        key={getId(cutoff) ?? index}
                                                        className={`global-tran-tr-ui ${getId(selectedCutoff) === getId(cutoff) ? 'bg-blue-50' : ''}`}
                                                        onClick={() => handleSelect(cutoff)}
                                                        onDoubleClick={() => {
                                                            if (!isEditing) handleEditRow(cutoff);
                                                        }}
                                                    >
                                                        <td className="global-ref-td-ui">{cutoff.CUTOFF_CODE ?? cutoff.cutoffCode ?? ""}</td>
                                                        <td className="global-ref-td-ui">{cutoff.CUTOFF_NAME ?? cutoff.cutoffName ?? "-"}</td>
                                                        <td className="global-ref-td-ui">{toDisplay(cutoff.fromDate ?? cutoff.FROM_DATE ?? "")}</td>
                                                        <td className="global-ref-td-ui">{toDisplay(cutoff.toDate ?? cutoff.TO_DATE ?? "")}</td>
                                                        <td className="global-ref-td-ui">
                                                            {(cutoff.STAT ?? cutoff.stat) === "C" ? "Closed" : "Open"}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="global-ref-norecords-ui">
                                                        {loading ? (
                                                            <span className="inline-flex items-center gap-2">
                                                                <FontAwesomeIcon icon={faSpinner} spin />
                                                                Loading…
                                                            </span>
                                                        ) : (
                                                            "No cutoff periods found"
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between p-3">
                                        <div className="text-xs opacity-80 font-semibold">
                                            Total Records: {filtered.length}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <select
                                                className="px-7 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                                value={10}
                                                onChange={(e) => {
                                                    // Add pagination logic here if needed
                                                }}
                                            >
                                                {[10, 20, 50, 100].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n}/page
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center mt-4 rounded-b-lg">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{cutoffData.length}</span> cutoff periods
                    </div>
                </div>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
        </div>
    );
};

export default CutoffRef;